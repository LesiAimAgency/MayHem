<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * User login.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không chính xác',
            ], 401);
        }

        if (!$user->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị khóa',
            ], 403);
        }

        // Generate token and cache user session
        $token = 'mayhem_' . Str::random(40);
        Cache::put("mayhem_token_{$token}", [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'permissions' => $user->permissions,
        ], now()->addHours(24));

        // Sync with Laravel Auth guard
        Auth::loginUsingId($user->id);

        $redirectUrl = session()->pull('url.intended', route('reports.overview'));

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'redirect' => $redirectUrl,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'permissions' => $user->permissions,
            ],
        ])->cookie('mayhem_token', $token, 1440, '/', null, false, false);
    }

    /**
     * Get current authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $token = $request->cookie('mayhem_token') ?? $request->bearerToken();
        $session = $token ? Cache::get("mayhem_token_{$token}") : null;

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Chưa đăng nhập',
            ], 401);
        }

        $user = User::find($session['id']);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * User logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->cookie('mayhem_token') ?? $request->bearerToken();
        if ($token) {
            Cache::forget("mayhem_token_{$token}");
        }

        Auth::logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã đăng xuất thành công',
        ])->withoutCookie('mayhem_token');
    }
}
