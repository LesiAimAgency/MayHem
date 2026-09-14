<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:4',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản này đang bị tạm khóa. Vui lòng liên hệ Quản trị viên MayHem.',
            ], 403);
        }

        // Generate secure random auth token
        $token = 'mayhem_' . Str::random(48);

        $permissions = is_array($user->permissions) ? $user->permissions : json_decode($user->permissions ?? '[]', true);

        // Store session token in Cache for 7 days
        Cache::put("mayhem_token_{$token}", [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'permissions' => $permissions ?? []
        ], now()->addDays(7));

        // Record audit log
        try {
            AuditLog::create([
                'user_id' => $user->id,
                'user_name' => $user->name,
                'action' => 'LOGIN',
                'description' => "Người dùng {$user->name} ({$user->role}) đã đăng nhập vào Hệ thống Quản trị MayHem.",
                'meta_data' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'role' => $user->role,
                ],
            ]);
        } catch (\Throwable $e) {
            // non-fatal
        }

        return response()->json([
            'success' => true,
            'message' => "Đăng nhập thành công! Chào mừng {$user->name}.",
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'permissions' => $permissions ?? [],
                'status' => $user->status,
            ],
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $authHeader = $request->header('Authorization', '');
        if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            Cache::forget("mayhem_token_{$matches[1]}");
        }

        $userName = $request->input('user_name', 'Người dùng');
        try {
            AuditLog::create([
                'user_name' => $userName,
                'action' => 'LOGOUT',
                'description' => "{$userName} đã đăng xuất khỏi hệ thống.",
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => 'Đã đăng xuất thành công khỏi Hệ thống MayHem.',
        ]);
    }

    /**
     * Get list of users (Admin management).
     */
    public function users(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'permissions', 'status', 'created_at')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Update user role & permissions.
     */
    public function updateRole(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|string|in:admin,editor,staff',
            'permissions' => 'nullable|array',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $user->role = $validated['role'];
        if (isset($validated['permissions'])) {
            $user->permissions = $validated['permissions'];
        }
        if (isset($validated['status'])) {
            $user->status = $validated['status'];
        }
        $user->save();

        try {
            AuditLog::create([
                'user_name' => 'MayHem Super Admin',
                'action' => 'UPDATE_USER_ROLE',
                'description' => "Cập nhật quyền hạn cho tài khoản {$user->email} thành {$user->role}.",
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => "Đã cập nhật phân quyền cho {$user->name} thành công!",
            'user' => $user,
        ]);
    }

    /**
     * POST /api/v1/auth/users
     * Create a new user with defined RBAC role.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:4',
            'role' => 'required|string|in:admin,editor,staff',
            'permissions' => 'nullable|array',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? [],
            'status' => $validated['status'] ?? 'active',
        ]);

        try {
            AuditLog::create([
                'user_name' => 'MayHem Super Admin',
                'action' => 'CREATE_USER',
                'description' => "Tạo tài khoản mới: {$user->email} với vai trò {$user->role}.",
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => "Đã tạo tài khoản {$user->name} ({$user->role}) thành công!",
            'user' => $user,
        ], 201);
    }

    /**
     * DELETE /api/v1/auth/users/{id}
     * Delete an existing user.
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $email = $user->email;
        $user->delete();

        try {
            AuditLog::create([
                'user_name' => 'MayHem Super Admin',
                'action' => 'DELETE_USER',
                'description' => "Đã xóa tài khoản {$email}.",
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => "Đã xóa tài khoản {$email} thành công!",
        ]);
    }
}

