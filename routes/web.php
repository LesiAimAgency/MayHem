<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\PageController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes - MayHem Financial Analytics
|--------------------------------------------------------------------------
| Chuẩn hóa hệ thống Router chuyên nghiệp:
| - /tong-hop       : Báo Cáo Tổng Hợp & Sàng Lọc Cổ Phiếu
| - /don-le/{ticker}: Báo Cáo Tài Chính Đơn Lẻ Đa Niên Độ
| - /so-sanh        : Báo Cáo Đối Chiếu So Sánh Đa Chiều
| - /users          : Quản Trị Người Dùng & Phân Quyền
|--------------------------------------------------------------------------
*/

// Root redirect to default Overview page
Route::get('/', function () {
    return redirect()->route('reports.overview');
});

// Authentication (Public Routes)
Route::get('/login', function (Request $request) {
    $token = $request->cookie('mayhem_token');
    if (($token && Cache::has("mayhem_token_{$token}")) || Auth::check()) {
        return redirect()->route('reports.overview');
    }
    return view('auth.login');
})->name('login');

Route::post('/login', [AuthController::class, 'login']);

Route::get('/logout', function (Request $request) {
    $token = $request->cookie('mayhem_token');
    if ($token) {
        Cache::forget("mayhem_token_{$token}");
    }
    Auth::logout();
    if ($request->hasSession()) {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
    return redirect('/login')->withoutCookie('mayhem_token');
})->name('logout');

// Protected Routes (Require Authentication)
Route::middleware(['mayhem.auth'])->group(function () {

    // Professional Primary Routes
    Route::get('/tong-hop', [PageController::class, 'overview'])->name('reports.overview');
    Route::get('/don-le/{ticker?}', [PageController::class, 'factsheet'])->name('reports.factsheet');
    Route::get('/so-sanh', [PageController::class, 'comparison'])->name('reports.comparison');

    // Users Management (Admin Role Only)
    Route::get('/users', [PageController::class, 'users'])
        ->middleware('mayhem.role:admin')
        ->name('users.index');

    // Reports prefix group (English aliases)
    Route::prefix('reports')->group(function () {
        Route::get('/', function () {
            return redirect()->route('reports.overview');
        });
        Route::get('/overview', [PageController::class, 'overview']);
        Route::get('/factsheet/{ticker?}', [PageController::class, 'factsheet']);
        Route::get('/comparison', [PageController::class, 'comparison']);
        
        // Wireframe legacy redirects
        Route::get('/wireframe-1', function () { return redirect()->route('reports.overview'); });
        Route::get('/wireframe-2', function () { return redirect()->route('reports.factsheet'); });
        Route::get('/wireframe-3', function () { return redirect()->route('reports.comparison'); });
    });

    // Wireframe static file aliases redirect to professional routes
    Route::get('/wireframe-1.html', function () { return redirect()->route('reports.overview'); });
    Route::get('/wireframe-2.html', function () { return redirect()->route('reports.factsheet'); });
    Route::get('/wireframe-3.html', function () { return redirect()->route('reports.comparison'); });
});
