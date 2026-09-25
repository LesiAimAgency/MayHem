<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List users with search, filter by role/status, sort, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $sortField = in_array($request->input('sort_by'), ['name', 'email', 'role', 'status', 'created_at'])
            ? $request->input('sort_by')
            : 'created_at';
        $sortOrder = strtolower($request->input('sort_order')) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortField, $sortOrder);

        $perPage = max(1, min(100, (int) $request->input('per_page', 10)));
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Create a new user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => ['required', 'string', Rule::in(['admin', 'editor', 'staff'])],
            'permissions' => 'nullable|array',
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
        ]);

        $defaultPermissions = match ($validated['role']) {
            'admin' => ['view_data', 'filter_data', 'edit_data', 'export_excel', 'manage_users', 'view_audit_logs'],
            'editor' => ['view_data', 'filter_data', 'edit_data', 'export_excel'],
            default => ['view_data', 'filter_data'],
        };

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? $defaultPermissions,
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo người dùng thành công',
            'data' => $user,
        ], 201);
    }

    /**
     * Show single user.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Update user details and role.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => ['sometimes', 'required', 'string', Rule::in(['admin', 'editor', 'staff'])],
            'permissions' => 'nullable|array',
            'status' => ['sometimes', 'required', 'string', Rule::in(['active', 'inactive'])],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật người dùng thành công',
            'data' => $user->fresh(),
        ]);
    }

    /**
     * Toggle user status (active / inactive).
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->status = $user->status === 'active' ? 'inactive' : 'active';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Trạng thái tài khoản đã được cập nhật thành ' . $user->status,
            'data' => $user,
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user = User::findOrFail($id);
        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Đặt lại mật khẩu thành công',
        ]);
    }

    /**
     * Delete user.
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting the primary super admin
        if ($user->email === 'admin@mayhem.vn') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa tài khoản Quản Trị Viên Mặc Định của hệ thống',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa người dùng',
        ]);
    }
}
