<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoleMayHem
{
    /**
     * Handle an incoming request.
     * Checks if the authenticated user possesses one of the allowed roles.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles  Allowed roles (e.g. 'admin', 'editor', 'staff')
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->attributes->get('auth_user');

        if (!$user) {
            return response()->json([
                'success' => false,
                'status' => 'unauthorized',
                'message' => 'Lỗi bảo mật (401): Phiên xác thực không hợp lệ.'
            ], 401);
        }

        $userRole = strtolower($user['role'] ?? '');

        // Flatten roles if passed as comma-separated string
        $allowedRoles = [];
        foreach ($roles as $r) {
            $parts = explode(',', $r);
            foreach ($parts as $p) {
                $allowedRoles[] = strtolower(trim($p));
            }
        }

        if (!in_array($userRole, $allowedRoles)) {
            $allowedStr = implode(', ', array_map('strtoupper', $allowedRoles));
            $currentStr = strtoupper($userRole);

            return response()->json([
                'success' => false,
                'status' => 'forbidden',
                'message' => "Lỗi bảo mật (403 Forbidden): Vai trò hiện tại của bạn là '{$currentStr}', không có quyền thực hiện thao tác này. Thao tác yêu cầu quyền: [{$allowedStr}].",
                'required_roles' => $allowedRoles,
                'user_role' => $userRole
            ], 403);
        }

        return $next($request);
    }
}
