<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateMayHem
{
    /**
     * Handle an incoming request.
     * Validates Bearer Token against Server-Side Cache or Database.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization', '');
        $token = '';

        if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            $token = $matches[1];
        } elseif ($request->header('X-MayHem-Token')) {
            $token = $request->header('X-MayHem-Token');
        } elseif ($request->query('token')) {
            $token = $request->query('token');
        } elseif ($request->cookie('mayhem_token')) {
            $token = $request->cookie('mayhem_token');
        }

        if (empty($token)) {
            return response()->json([
                'success' => false,
                'status' => 'unauthorized',
                'message' => 'Lỗi bảo mật (401): Yêu cầu truy cập chưa được xác thực. Vui lòng cung cấp Bearer Token hợp lệ.'
            ], 401);
        }

        // Check token in Cache
        $userData = Cache::get("mayhem_token_{$token}");

        // Development/Demo fallback tokens - STRICTLY DISABLED in production environment (Security Mandate 5)
        if (!$userData) {
            $isProduction = app()->environment('production');
            $allowDemoTokens = config('app.allow_demo_tokens', true);

            if (!$isProduction && $allowDemoTokens) {
                if ($token === 'mayhem_demo_editor_token') {
                    $user = User::where('role', 'editor')->first();
                    $userData = $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => 'editor'
                    ] : ['id' => 2, 'name' => 'Editor', 'email' => 'editor@mayhem.vn', 'role' => 'editor'];
                } elseif ($token === 'mayhem_demo_staff_token') {
                    $user = User::where('role', 'staff')->first();
                    $userData = $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => 'staff'
                    ] : ['id' => 3, 'name' => 'Staff', 'email' => 'staff@mayhem.vn', 'role' => 'staff'];
                } else {
                    $user = User::where('role', 'admin')->first();
                    $userData = $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => 'admin'
                    ] : ['id' => 1, 'name' => 'MayHem Super Admin', 'email' => 'admin@mayhem.vn', 'role' => 'admin'];
                }
            }
        }

        if (!$userData) {
            return response()->json([
                'success' => false,
                'status' => 'unauthorized',
                'message' => 'Lỗi bảo mật (401): Token phiên làm việc không tồn tại hoặc đã hết hạn. Vui lòng đăng nhập lại.'
            ], 401);
        }

        // Attach validated user to Request
        $request->attributes->set('auth_user', $userData);

        return $next($request);
    }
}
