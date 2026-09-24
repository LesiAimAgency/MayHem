<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ScreenerController;
use App\Http\Controllers\Api\FinancialReportController;
use App\Http\Controllers\Api\CustomFilterController;
use App\Http\Controllers\Api\UserController;

Route::prefix('v1')->group(function () {
    // 1. Authentication
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // 2. Sectors & Companies
    Route::get('/sectors', [SectorController::class, 'index']);
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/{ticker}', [CompanyController::class, 'show'])->where('ticker', '^[A-Za-z0-9_]{3,10}$');

    // 3. Screener & Filter Engine (Wireframe 1)
    Route::post('/screener/filter', [ScreenerController::class, 'filter']);
    Route::get('/screener/custom-filters', [CustomFilterController::class, 'index']);
    Route::post('/screener/custom-filters', [CustomFilterController::class, 'store']);
    Route::delete('/screener/custom-filters/{id}', [CustomFilterController::class, 'destroy'])->whereNumber('id');

    // 4. Financial Reports Factsheet (Wireframe 2) & Comparison (Wireframe 3)
    Route::get('/financial-reports/compare', [FinancialReportController::class, 'compare']);
    Route::get('/financial-reports/{ticker}/export-csv', [FinancialReportController::class, 'exportCsv'])->where('ticker', '^[A-Za-z0-9_]{3,10}$');
    Route::get('/financial-reports/{ticker}', [FinancialReportController::class, 'show'])->where('ticker', '^[A-Za-z0-9_]{3,10}$');

    // 5. Users Management (CRUD with Auth & Role Protection)
    Route::middleware(['mayhem.auth', 'mayhem.role:admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show'])->whereNumber('id');
        Route::put('/users/{id}', [UserController::class, 'update'])->whereNumber('id');
        Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->whereNumber('id');
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword'])->whereNumber('id');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->whereNumber('id');
    });
});
