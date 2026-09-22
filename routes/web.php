<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;



Route::get('/login', function (Request $request) {
    return view('auth.login');
})->name('login');

Route::get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard');

Route::get('/', function (Request $request) {
    $token = $request->cookie('mayhem_token');
    if ($token && (Cache::has("mayhem_token_{$token}") || str_starts_with($token, 'mayhem_demo_') || str_starts_with($token, 'mayhem_local_'))) {
        return view('dashboard');
    }
    
    // Auto router default is login
    return redirect('/login');
});

Route::get('/logout', function () {
    return redirect('/login')->withCookie(cookie()->forget('mayhem_token'));
})->name('logout');

Route::get('/demo-avg', function () {
    $reports = \App\Models\FinancialReportJSON::all();
    $table = [];
    foreach ($reports as $report) {
        if (is_array($report->raw_data)) {
            foreach ($report->raw_data as $row) {
                // Đảm bảo có mã ngân hàng để track nếu cần
                $row['bank'] = $report->ticker;
                $table[] = $row;
            }
        }
    }
    $years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    
    $targetIndicators = [
        'Tỷ lệ Chi phí / Thu nhập (CIR)',
        'Biên lãi vận hành (trước DPRR)',
        'Biên lợi nhuận trước thuế',
        'Biên Lợi nhuận ST của CĐ công ty mẹ',
        'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
        'Debt/Equity',
        'Tỷ suất sinh lời trên Vốn CSH (ROE)',
        'Tỷ lệ tiền gửi không kỳ hạn (CASA)',
        'Tỷ lệ nợ xấu (NPL) cuối năm'
    ];
    
    $yearlySums = [];
    $yearlyCounts = [];
    
    foreach ($table as $row) {
        $field = $row['Chỉ tiêu'] ?? ($row['field'] ?? '');
        if (in_array($field, $targetIndicators)) {
            if (!isset($yearlySums[$field])) {
                $yearlySums[$field] = array_fill_keys($years, 0);
                $yearlyCounts[$field] = array_fill_keys($years, 0);
            }
            
            foreach ($years as $year) {
                $val = $row['values'][$year] ?? ($row[$year] ?? null);
                if ($val !== null && is_numeric($val)) {
                    $yearlySums[$field][$year] += (float)$val;
                    $yearlyCounts[$field][$year]++;
                }
            }
        }
    }
    
    $results = [];
    foreach ($targetIndicators as $indicator) {
        $row = ['Indicator' => $indicator];
        $totalVal = 0;
        $validYears = 0;
        
        foreach ($years as $year) {
            if (isset($yearlyCounts[$indicator][$year]) && $yearlyCounts[$indicator][$year] > 0) {
                $avgYear = $yearlySums[$indicator][$year] / $yearlyCounts[$indicator][$year];
                $row[$year] = $avgYear;
                
                $totalVal += $avgYear;
                $validYears++;
            } else {
                $row[$year] = null;
            }
        }
        
        $row['TotalAverage'] = $validYears > 0 ? ($totalVal / $validYears) : null;
        $results[] = $row;
    }
    
    return view('demo-avg', [
        'years' => $years,
        'results' => $results
    ]);
});
