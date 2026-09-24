<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MhCompany;
use App\Models\MhCustomFilter;
use App\Models\MhSector;
use App\Models\User;
use App\Services\FinancialMetricService;
use App\Services\ScreenerService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PageController extends Controller
{
    public function __construct(
        protected FinancialMetricService $metricService,
        protected ScreenerService $screenerService
    ) {}

    /**
     * Báo Cáo Tổng Hợp (Overview Screener)
     */
    public function overview(Request $request): View
    {
        $sectors = MhSector::all();
        $companies = MhCompany::active()->orderBy('short_name', 'asc')->get();

        // Fetch custom filters from mh_custom_filters table
        $customFilters = MhCustomFilter::where('sector_id', 1)->get();

        // Initial screener results: 28 companies matching by default (all active banks)
        $screenerResult = [
            'total_companies' => $companies->count(),
            'matched_companies' => $companies,
            'matched_count' => $companies->count(), // 28 active banks by default
            'sector_averages' => [],
        ];

        // Fetch all historical reports for each company to populate banksData with real metrics & historical trends
        $allReports = \App\Models\MhFinancialReport::whereIn('short_name', $companies->pluck('short_name'))
            ->orderBy('report_year', 'asc')
            ->get()
            ->groupBy('short_name');

        // Pre-formatted banks data with real metrics from database
        $banksData = $companies->map(function ($c) use ($allReports) {
            $companyReports = $allReports->get($c->short_name) ?? collect();
            $history = [];

            foreach ($companyReports as $r) {
                $raw = $r->calculated_data['raw_metrics'] ?? [];
                $ind = $r->calculated_data['indicators'] ?? [];

                $llr = $raw['llr_coverage'] ?? null;
                if ($llr !== null && $llr > 0 && $llr < 10) {
                    $llr = round($llr * 100, 2);
                }

                $history[] = [
                    'year' => (int) $r->report_year,
                    'cir' => $raw['cir'] ?? null,
                    'cpkh_toi' => $ind['depreciation_toi'] ?? ($raw['depreciation'] && $raw['toi'] ? round(($raw['depreciation'] / $raw['toi']) * 100, 2) : null),
                    'blvh' => $ind['operating_margin'] ?? null,
                    'blntt' => $ind['pbt_margin'] ?? null,
                    'blnst' => $ind['parent_npat_margin'] ?? null,
                    'ttlr' => $ind['growth_parent_npat'] ?? null,
                    'roa' => $raw['roa'] ?? null,
                    'debt_equity' => $ind['debt_equity'] ?? ($raw['total_liabilities'] && $raw['owners_equity'] ? round($raw['total_liabilities'] / $raw['owners_equity'], 2) : null),
                    'roe' => $raw['roe'] ?? null,
                    'cfo' => $raw['cfo'] ?? null,
                    'parent_npat' => $raw['parent_npat'] ?? null,
                    'casa' => $raw['casa_ratio'] ?? null,
                    'npl' => $raw['npl_ratio'] ?? null,
                    'nim' => $raw['nim'] ?? null,
                    'car' => $raw['car_ratio'] ?? null,
                    'llr' => $llr,
                ];
            }

            // Ưu tiên lấy số liệu năm hiện tại - 1 làm năm gần nhất
            $targetYear = (int) date('Y') - 1;
            $targetRecord = null;
            foreach ($history as $h) {
                if ($h['year'] === $targetYear) {
                    $targetRecord = $h;
                    break;
                }
            }
            $latest = $targetRecord ?? (!empty($history) ? end($history) : []);

            return array_merge([
                'ticker' => $c->short_name,
                'name' => $c->company_name,
                'exchange' => $c->exchange ?? 'HOSE',
                'industry' => 'ngan-hang',
                'history' => $history,
            ], $latest);
        })->values();

        // Calculate industry averages for latest year and historical years
        $metricKeys = ['cir', 'cpkh_toi', 'blvh', 'blntt', 'blnst', 'ttlr', 'roa', 'debt_equity', 'roe', 'cfo', 'casa', 'npl', 'nim', 'car', 'llr'];
        $sectorAverages = [];
        foreach ($metricKeys as $key) {
            $vals = $banksData->pluck($key)->filter(fn($v) => $v !== null && is_numeric($v));
            $sectorAverages[$key] = $vals->count() > 0 ? round($vals->avg(), 2) : 0;
        }

        // Lấy năm max từ DB thay vì hardcode (tránh sai khi có thêm năm mới)
        $maxReportYear = \App\Models\MhFinancialReport::max('report_year') ?? (int) date('Y');
        $minReportYear = 2016; // năm đầu tiên có dữ liệu ngân hàng

        $annualAverages = [];
        for ($year = $minReportYear; $year <= $maxReportYear; $year++) {
            foreach ($metricKeys as $key) {
                $vals = $banksData->map(function($b) use ($year, $key) {
                    foreach ($b['history'] as $h) {
                        if ($h['year'] == $year && isset($h[$key]) && is_numeric($h[$key])) {
                            return $h[$key];
                        }
                    }
                    return null;
                })->filter(fn($v) => $v !== null);
                $annualAverages[$year][$key] = $vals->count() > 0 ? round($vals->avg(), 2) : 0;
            }
        }

        return view('reports.overview', [
            'sectors' => $sectors,
            'companies' => $companies,
            'banksData' => $banksData,
            'customFilters' => $customFilters,
            'sectorAverages' => $sectorAverages,
            'annualAverages' => $annualAverages,
            'screenerResult' => $screenerResult,
        ]);
    }

    /**
     * Báo Cáo Đơn Lẻ (Factsheet)
     */
    public function factsheet(Request $request, ?string $ticker = null): View
    {
        $companies = MhCompany::active()->orderBy('short_name', 'asc')->get();
        $defaultTicker = $companies->first()?->short_name ?? 'ABB';

        // Resolve ticker from query param, cookie, session, or default
        $resolvedTicker = $ticker 
            ?? $request->input('ticker') 
            ?? $request->cookie('mayhem_selected_ticker') 
            ?? session('mayhem_selected_ticker') 
            ?? $defaultTicker;

        $resolvedTicker = strtoupper($resolvedTicker);

        if (!$companies->contains('short_name', $resolvedTicker)) {
            $resolvedTicker = $defaultTicker;
        }

        session(['mayhem_selected_ticker' => $resolvedTicker]);
        cookie()->queue('mayhem_selected_ticker', $resolvedTicker, 60 * 24 * 30);

        $factsheet = $this->metricService->getBankFactsheet($resolvedTicker);

        return view('reports.factsheet', [
            'companies' => $companies,
            'selectedTicker' => $resolvedTicker,
            'factsheet' => $factsheet,
        ]);
    }

    /**
     * Báo Cáo So Sánh (Comparison)
     */
    public function comparison(Request $request): View
    {
        $companies = MhCompany::active()->orderBy('short_name', 'asc')->get();
        $tickersInput = $request->input('tickers', 'ACB,ABB,VCB');
        $tickers = array_filter(array_map('trim', explode(',', $tickersInput)));

        if (empty($tickers)) {
            $tickers = ['ACB', 'ABB', 'VCB'];
        }

        // Mode: 'latest' (default) = chỉ năm gần nhất, '10years' = 10 năm liên tiếp
        $mode = $request->input('mode', 'latest');
        $year = $request->filled('year') ? (int) $request->input('year') : null;

        $comparison = $this->metricService->getComparison($tickers, $year, $mode);

        return view('reports.comparison', [
            'companies'  => $companies,
            'selectedTickers' => $tickers,
            'comparison' => $comparison,
            'mode'       => $mode,
        ]);
    }

    /**
     * Backward-compatibility aliases
     */
    public function wireframe1(Request $request): View { return $this->overview($request); }
    public function wireframe2(Request $request, ?string $ticker = null): View { return $this->factsheet($request, $ticker); }
    public function wireframe3(Request $request): View { return $this->comparison($request); }

    /**
     * Users Management Page
     */
    public function users(Request $request): View
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

        $users = $query->orderBy('created_at', 'desc')->paginate(10);
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $adminCount = User::where('role', 'admin')->count();

        return view('users.index', [
            'users' => $users,
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'adminCount' => $adminCount,
        ]);
    }
}
