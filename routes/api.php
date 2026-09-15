<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FinancialReportController;
use App\Http\Controllers\Api\ScreenerController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\AuthController;

Route::prefix('v1')->group(function () {
    // 0. Authentication Endpoints
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('mayhem.auth');

    // 1. Read-only Data Queries (Matrix, Companies, Factsheets, Presets, Criteria, Industries)
    Route::get('/financial-reports/matrix', [FinancialReportController::class, 'getMatrix']);
    Route::get('/companies', [FinancialReportController::class, 'getCompanies']);
    Route::get('/screener/presets', [ScreenerController::class, 'getPresets']);
    Route::get('/screener/filters', [ScreenerController::class, 'index']);
    Route::get('/screener/criteria', [ScreenerController::class, 'getCriteria']);
    Route::get('/screener/industries', [ScreenerController::class, 'getIndustries']);
    Route::get('/screener/industries/{id}', [ScreenerController::class, 'getIndustry']);

    // 2. All Authenticated Users (Admin, Editor, Staff)
    Route::middleware(['mayhem.auth'])->group(function () {
        Route::get('/auth/users', [AuthController::class, 'users']);
        Route::get('/audit-logs', [FinancialReportController::class, 'getAuditLogs']);
        Route::post('/financial-reports/update', [FinancialReportController::class, 'updateMetricValue'])
            ->middleware('mayhem.role:admin,editor,staff');
        Route::post('/screener/filters', [ScreenerController::class, 'store'])
            ->middleware('mayhem.role:admin,editor,staff');
        Route::put('/screener/filters/{id}', [ScreenerController::class, 'update'])
            ->middleware('mayhem.role:admin,editor,staff');
        Route::post('/screener/save-filter', [ScreenerController::class, 'saveFilter'])
            ->middleware('mayhem.role:admin,editor,staff');
        Route::delete('/screener/filters/{id}', [ScreenerController::class, 'destroy'])
            ->middleware('mayhem.role:admin,editor,staff');
        Route::put('/screener/criteria/{id}', [ScreenerController::class, 'updateCriterion'])
            ->middleware('mayhem.role:admin,editor,staff');
    });

    // 3. Level 1 & Level 2 Only (Admin, Editor) - Strict Export, Rollback, Criteria Authoring & Industry Configs
    Route::middleware(['mayhem.auth', 'mayhem.role:admin,editor'])->group(function () {
        Route::get('/financial-reports/export-excel', [FinancialReportController::class, 'exportExcel']);
        Route::post('/financial-reports/export-excel', [FinancialReportController::class, 'exportExcel']);
        Route::post('/audit-logs/{id}/rollback', [FinancialReportController::class, 'rollbackLog']);
        Route::get('/backup/export', [BackupController::class, 'exportSnapshot']);
        Route::post('/screener/criteria', [ScreenerController::class, 'storeCriterion']);
        Route::put('/screener/criteria/{id}', [ScreenerController::class, 'updateCriterion']);
        Route::post('/screener/industries', [ScreenerController::class, 'storeIndustry']);
        Route::put('/screener/industries/{id}', [ScreenerController::class, 'updateIndustry']);
    });

    // 4. Super Admin Only (Role Level 1) - User Management, System Snapshot Restore, Expand Year, Criteria Reset, Industry Delete/Reset
    Route::middleware(['mayhem.auth', 'mayhem.role:admin'])->group(function () {
        Route::post('/auth/users', [AuthController::class, 'store']);
        Route::put('/auth/users/{id}/role', [AuthController::class, 'updateRole']);
        Route::delete('/auth/users/{id}', [AuthController::class, 'destroy']);
        Route::post('/financial-reports/new-year', [FinancialReportController::class, 'addNewYear']);
        Route::post('/backup/restore', [BackupController::class, 'restoreSnapshot']);
        Route::delete('/screener/criteria/{id}', [ScreenerController::class, 'destroyCriterion']);
        Route::post('/screener/criteria/reset', [ScreenerController::class, 'resetCriteria']);
        Route::delete('/screener/industries/{id}', [ScreenerController::class, 'destroyIndustry']);
        Route::post('/screener/industries/reset', [ScreenerController::class, 'resetIndustries']);
    });

    // 5. Individual Bank Factsheet (Supports all tickers e.g. VCB, TCB, OceanBank)
    Route::get('/financial-reports/{ticker}', [FinancialReportController::class, 'getBankFactsheet'])
        ->where('ticker', '^[A-Za-z0-9_]{3,15}$');
});
