<?php

namespace App\Services;

use App\Models\MhCompany;
use App\Models\MhFinancialReport;

class ScreenerService
{
    public function __construct(
        protected FinancialMetricService $metricService
    ) {}

    /**
     * Run screening over all or selected companies based on criteria.
     */
    public function screen(array $params): array
    {
        $sectorId = $params['sector_id'] ?? 1;
        $selectedStocks = $params['stocks'] ?? [];
        $criteria = $params['criteria'] ?? [];

        // Fetch target companies
        $query = MhCompany::query()->active()->where('sector_id', $sectorId);
        if (!empty($selectedStocks)) {
            $query->whereIn('short_name', $selectedStocks);
        }
        $companies = $query->get();

        if ($companies->isEmpty()) {
            return [
                'total_companies' => 0,
                'matched_companies' => [],
                'matched_count' => 0,
                'sector_averages' => [],
            ];
        }

        // Sector average for comparison (e.g. under_avg condition)
        $sectorAverages = $this->metricService->getSectorAverage($sectorId);

        // Fetch latest reports for each company
        $matched = [];

        foreach ($companies as $company) {
            $reports = MhFinancialReport::where('short_name', $company->short_name)
                ->orderBy('report_year', 'desc')
                ->take(10)
                ->get();

            if ($reports->isEmpty()) {
                continue;
            }

            $latestReport = $reports->first();
            $prevReport = $reports->count() > 1 ? $reports->get(1) : null;
            $metrics = $this->metricService->extractMetrics($latestReport, $prevReport);

            // Test each criterion
            $passed = true;
            foreach ($criteria as $criterionKey => $conditionVal) {
                if (empty($conditionVal)) {
                    continue;
                }

                if (!$this->evaluateCriterion($criterionKey, $conditionVal, $metrics, $reports, $sectorAverages)) {
                    $passed = false;
                    break;
                }
            }

            if ($passed) {
                $matched[] = [
                    'short_name' => $company->short_name,
                    'company_name' => $company->company_name,
                    'exchange' => $company->exchange,
                    'metrics' => $metrics,
                ];
            }
        }

        return [
            'total_companies' => $companies->count(),
            'matched_count' => count($matched),
            'matched_companies' => $matched,
            'sector_averages' => $sectorAverages,
        ];
    }

    /**
     * Evaluate a single financial criterion.
     */
    protected function evaluateCriterion(
        string $key,
        mixed $condition,
        array $latestMetrics,
        $historicalReports,
        array $sectorAverages
    ): bool {
        // 1. Special Handling for CIR
        if ($key === 'cir') {
            $cirVal = $latestMetrics['cir'] ?? null;
            if ($cirVal === null) return true; // neutral if data absent

            // Array of checkbox values, e.g. ['under_60_latest', 'under_avg_latest', 'under_avg_10y']
            $conds = is_array($condition) ? $condition : [$condition];

            // 1a. Standalone condition: under_60_latest (AND)
            if (in_array('under_60_latest', $conds)) {
                if ($cirVal >= 60.0) {
                    return false;
                }
            }

            // 1b. cir_avg conditions (under_avg_latest, under_avg_10y): OR logic giữa các kỳ đã chọn
            $avgConds = array_intersect($conds, ['under_avg', 'under_avg_latest', 'under_avg_10y']);
            if (!empty($avgConds)) {
                $passedAvg = false;
                $avgCir = $sectorAverages['cir'] ?? 45.0;

                if (in_array('under_avg', $avgConds) || in_array('under_avg_latest', $avgConds)) {
                    if ($cirVal < $avgCir) {
                        $passedAvg = true;
                    }
                }

                if (in_array('under_avg_10y', $avgConds)) {
                    if (!$historicalReports->isEmpty()) {
                        $all10y = true;
                        foreach ($historicalReports as $rep) {
                            $repMetrics = $this->metricService->extractMetrics($rep);
                            $repCir = $repMetrics['cir'] ?? null;
                            if ($repCir === null || $repCir >= $avgCir) {
                                $all10y = false;
                                break;
                            }
                        }
                        if ($all10y) {
                            $passedAvg = true;
                        }
                    }
                }

                if (!$passedAvg) {
                    return false;
                }
            }

            return true;
        }

        // 2. Generic Numeric Threshold Conditions
        // Map form options like "cpkh-1" (<5%), "roe-2" (>18%) etc.
        $metricVal = $latestMetrics[$key] ?? null;
        if ($metricVal === null) {
            return true;
        }

        return match ($key) {
            'cpkh' => match ($condition) {
                'cpkh-1', '<5%' => $metricVal < 5.0,
                'cpkh-2', '<7%' => $metricVal < 7.0,
                'cpkh-3', '<10%' => $metricVal < 10.0,
                'cpkh-4', '>5%' => $metricVal > 5.0,
                default => true,
            },
            'blvh' => match ($condition) {
                'blvh-1', '>40%' => $metricVal > 40.0,
                'blvh-2', '>50%' => $metricVal > 50.0,
                'blvh-3', '>55%' => $metricVal > 55.0,
                'blvh-4', '>60%' => $metricVal > 60.0,
                default => true,
            },
            'blntt' => match ($condition) {
                'blntt-1', '>20%' => $metricVal > 20.0,
                'blntt-2', '>25%' => $metricVal > 25.0,
                'blntt-3', '>30%' => $metricVal > 30.0,
                'blntt-4', '>35%' => $metricVal > 35.0,
                default => true,
            },
            'blnst' => match ($condition) {
                'blnst-1', '>15%' => $metricVal > 15.0,
                'blnst-2', '>20%' => $metricVal > 20.0,
                'blnst-3', '>25%' => $metricVal > 25.0,
                'blnst-4', '>30%' => $metricVal > 30.0,
                default => true,
            },
            'ttlr' => match ($condition) {
                'ttlr-1', '>10%' => $metricVal > 10.0,
                'ttlr-2', '>15%' => $metricVal > 15.0,
                'ttlr-3', '>20%' => $metricVal > 20.0,
                'ttlr-4', '>25%' => $metricVal > 25.0,
                default => true,
            },
            'roa' => match ($condition) {
                'roa-1', '>1.0%' => $metricVal > 1.0,
                'roa-2', '>1.5%' => $metricVal > 1.5,
                'roa-3', '>2.0%' => $metricVal > 2.0,
                default => true,
            },
            'de' => match ($condition) {
                'de-1', '<6' => $metricVal < 6.0,
                'de-2', '<8' => $metricVal < 8.0,
                'de-3', '<10' => $metricVal < 10.0,
                default => true,
            },
            'roe' => match ($condition) {
                'roe-1', '>15%' => $metricVal > 15.0,
                'roe-2', '>18%' => $metricVal > 18.0,
                'roe-3', '>20%' => $metricVal > 20.0,
                'roe-4', '>22%' => $metricVal > 22.0,
                default => true,
            },
            'cfo' => match ($condition) {
                'cfo-1', '>0' => $metricVal > 0,
                'cfo-2', '>500' => $metricVal > 500,
                'cfo-3', '>1000' => $metricVal > 1000,
                'cfo-4', '>2000' => $metricVal > 2000,
                default => true,
            },
            'casa' => match ($condition) {
                'casa-1', '>15%' => $metricVal > 15.0,
                'casa-2', '>20%' => $metricVal > 20.0,
                'casa-3', '>25%' => $metricVal > 25.0,
                'casa-4', '>30%' => $metricVal > 30.0,
                'casa-5', '>35%' => $metricVal > 35.0,
                default => true,
            },
            'npl' => match ($condition) {
                'npl-1', '<1.0%' => $metricVal < 1.0,
                'npl-2', '<1.5%' => $metricVal < 1.5,
                'npl-3', '<2.0%' => $metricVal < 2.0,
                'npl-4', '<2.5%' => $metricVal < 2.5,
                'npl-5', '<3.0%' => $metricVal < 3.0,
                default => true,
            },
            'nim' => match ($condition) {
                'nim-1', '>2.5%' => $metricVal > 2.5,
                'nim-2', '>3.0%' => $metricVal > 3.0,
                'nim-3', '>3.5%' => $metricVal > 3.5,
                'nim-4', '>4.0%' => $metricVal > 4.0,
                default => true,
            },
            'car' => match ($condition) {
                'car-1', '>8.0%' => $metricVal > 8.0,
                'car-2', '>9.0%' => $metricVal > 9.0,
                'car-3', '>10.0%' => $metricVal > 10.0,
                'car-4', '>11.0%' => $metricVal > 11.0,
                default => true,
            },
            'llr' => match ($condition) {
                'llr-1', '>100%' => $metricVal > 100.0,
                'llr-2', '>120%' => $metricVal > 120.0,
                'llr-3', '>150%' => $metricVal > 150.0,
                'llr-4', '>200%' => $metricVal > 200.0,
                default => true,
            },
            default => true,
        };
    }
}
