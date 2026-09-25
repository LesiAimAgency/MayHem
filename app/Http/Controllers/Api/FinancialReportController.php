<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FinancialMetricService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinancialReportController extends Controller
{
    public function __construct(
        protected FinancialMetricService $metricService
    ) {}

    /**
     * Get multi-year factsheet for a single bank (Wireframe 2).
     */
    public function show(string $ticker): JsonResponse
    {
        $ticker = strtoupper(trim($ticker));
        $data = $this->metricService->getBankFactsheet($ticker);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get multi-bank comparison matrix and chart series (Wireframe 3).
     */
    public function compare(Request $request): JsonResponse
    {
        $tickersInput = $request->input('tickers', '');
        if (is_string($tickersInput)) {
            $tickers = array_filter(array_map('trim', explode(',', $tickersInput)));
        } elseif (is_array($tickersInput)) {
            $tickers = $tickersInput;
        } else {
            $tickers = [];
        }

        $year = $request->filled('year') ? (int) $request->input('year') : null;
        $data = $this->metricService->getComparison($tickers, $year);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Export company factsheet to CSV file.
     */
    public function exportCsv(string $ticker): StreamedResponse
    {
        $ticker = strtoupper(trim($ticker));
        $data = $this->metricService->getBankFactsheet($ticker);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"BCTC_{$ticker}_" . date('Ymd_His') . ".csv\"",
        ];

        return response()->stream(function () use ($data) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header row
            $years = $data['years'];
            $headerRow = array_merge(['Mã', 'Loại', 'Chỉ Tiêu Tài Chính', 'ĐVT'], $years);
            fputcsv($handle, $headerRow);

            // Data rows
            foreach ($data['indicators'] as $ind) {
                $row = [
                    $ind['ticker'],
                    $ind['type'],
                    $ind['name'],
                    $ind['unit'],
                ];
                foreach ($years as $y) {
                    $row[] = $ind['values'][$y] ?? '';
                }
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
