<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class FinancialDatasetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = dirname(base_path()) . DIRECTORY_SEPARATOR . 'BaoCaoTaiChinh_NganHang_30ChiTieu.json';
        if (!File::exists($jsonPath)) {
            $jsonPath = base_path('BaoCaoTaiChinh_NganHang_30ChiTieu1.json');
        }

        if (!File::exists($jsonPath)) {
            $this->command->error("JSON file not found: {$jsonPath}");
            return;
        }

        $rawContent = File::get($jsonPath);
        $jsonData = json_decode($rawContent, true);

        if (!$jsonData) {
            $this->command->error("Invalid JSON data in file.");
            return;
        }

        $bankSymbols = $jsonData['metadata']['bank_symbols'] ?? [];
        $years = $jsonData['metadata']['years'] ?? [2015, 2025];
        $startYear = min($years);
        $endYear = max($years);

        // Official dictionary of 29 Vietnamese commercial banks (Tickers & Full Legal Names)
        $bankOfficialInfo = [
            'ABB' => ['name' => 'Ngân hàng TMCP An Bình', 'short_name' => 'ABBank', 'exchange' => 'UPCOM'],
            'ACB' => ['name' => 'Ngân hàng TMCP Á Châu', 'short_name' => 'ACB', 'exchange' => 'HOSE'],
            'BAB' => ['name' => 'Ngân hàng TMCP Bắc Á', 'short_name' => 'Bac A Bank', 'exchange' => 'HNX'],
            'BID' => ['name' => 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', 'short_name' => 'BIDV', 'exchange' => 'HOSE'],
            'BVB' => ['name' => 'Ngân hàng TMCP Bản Việt', 'short_name' => 'BVBank', 'exchange' => 'UPCOM'],
            'CTG' => ['name' => 'Ngân hàng TMCP Công Thương Việt Nam', 'short_name' => 'VietinBank', 'exchange' => 'HOSE'],
            'EIB' => ['name' => 'Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam', 'short_name' => 'Eximbank', 'exchange' => 'HOSE'],
            'HDB' => ['name' => 'Ngân hàng TMCP Phát triển TP.HCM', 'short_name' => 'HDBank', 'exchange' => 'HOSE'],
            'KLB' => ['name' => 'Ngân hàng TMCP Kiên Long', 'short_name' => 'Kienlongbank', 'exchange' => 'UPCOM'],
            'LPB' => ['name' => 'Ngân hàng TMCP Lộc Phát Việt Nam', 'short_name' => 'LPBank', 'exchange' => 'HOSE'],
            'MBB' => ['name' => 'Ngân hàng TMCP Quân Đội', 'short_name' => 'MBBank', 'exchange' => 'HOSE'],
            'MSB' => ['name' => 'Ngân hàng TMCP Hàng Hải Việt Nam', 'short_name' => 'MSB', 'exchange' => 'HOSE'],
            'NAB' => ['name' => 'Ngân hàng TMCP Nam Á', 'short_name' => 'Nam A Bank', 'exchange' => 'HOSE'],
            'NVB' => ['name' => 'Ngân hàng TMCP Quốc Dân', 'short_name' => 'NCB', 'exchange' => 'HNX'],
            'OCB' => ['name' => 'Ngân hàng TMCP Phương Đông', 'short_name' => 'OCB', 'exchange' => 'HOSE'],
            'PCB' => ['name' => 'Ngân hàng TMCP Public Bank Việt Nam', 'short_name' => 'PublicBank', 'exchange' => 'OTC'],
            'PGB' => ['name' => 'Ngân hàng TMCP Thịnh vượng và Phát triển', 'short_name' => 'PGBank', 'exchange' => 'UPCOM'],
            'SCB' => ['name' => 'Ngân hàng TMCP Sài Gòn', 'short_name' => 'SCB', 'exchange' => 'OTC'],
            'SGB' => ['name' => 'Ngân hàng TMCP Sài Gòn Công Thương', 'short_name' => 'Saigonbank', 'exchange' => 'UPCOM'],
            'SHB' => ['name' => 'Ngân hàng TMCP Sài Gòn - Hà Nội', 'short_name' => 'SHB', 'exchange' => 'HOSE'],
            'SSB' => ['name' => 'Ngân hàng TMCP Đông Nam Á', 'short_name' => 'SeABank', 'exchange' => 'HOSE'],
            'STB' => ['name' => 'Ngân hàng TMCP Sài Gòn Thương Tín', 'short_name' => 'Sacombank', 'exchange' => 'HOSE'],
            'TCB' => ['name' => 'Ngân hàng TMCP Kỹ Thương Việt Nam', 'short_name' => 'Techcombank', 'exchange' => 'HOSE'],
            'TPB' => ['name' => 'Ngân hàng TMCP Tiên Phong', 'short_name' => 'TPBank', 'exchange' => 'HOSE'],
            'VAB' => ['name' => 'Ngân hàng TMCP Việt Á', 'short_name' => 'VietABank', 'exchange' => 'UPCOM'],
            'VBB' => ['name' => 'Ngân hàng TMCP Việt Nam Thương Tín', 'short_name' => 'VietBank', 'exchange' => 'UPCOM'],
            'VCB' => ['name' => 'Ngân hàng TMCP Ngoại Thương Việt Nam', 'short_name' => 'Vietcombank', 'exchange' => 'HOSE'],
            'VIB' => ['name' => 'Ngân hàng TMCP Quốc Tế Việt Nam', 'short_name' => 'VIB', 'exchange' => 'HOSE'],
            'VPB' => ['name' => 'Ngân hàng TMCP Việt Nam Thịnh Vượng', 'short_name' => 'VPBank', 'exchange' => 'HOSE'],
        ];

        // 1. Seed Companies with accurate bank legal names and trade names
        foreach ($bankSymbols as $ticker) {
            $info = $bankOfficialInfo[$ticker] ?? [
                'name' => "Ngân hàng TMCP {$ticker}",
                'short_name' => $ticker,
                'exchange' => 'HOSE/HNX/UPCOM'
            ];

            DB::table('companies')->updateOrInsert(
                ['ticker' => $ticker],
                [
                    'company_name' => $info['name'],
                    'short_name' => $info['short_name'],
                    'exchange' => $info['exchange'],
                    'industry' => 'Ngân Hàng',
                    'is_active' => true,
                    'updated_at' => now(),
                ]
            );
        }

        // 2. Ingest table rows per bank into financial_reports_json
        $tableRows = $jsonData['table'] ?? [];
        $rowsByBank = [];
        foreach ($tableRows as $row) {
            $b = $row['Mã Ngân Hàng'] ?? ($row['bank'] ?? null);
            if ($b) {
                $rowsByBank[$b][] = $row;
            }
        }

        foreach ($rowsByBank as $bank => $rows) {
            DB::table('financial_reports_json')->updateOrInsert(
                [
                    'ticker' => $bank,
                    'report_year' => $endYear,
                    'report_period' => 'YEAR',
                ],
                [
                    'raw_data' => json_encode($rows, JSON_UNESCAPED_UNICODE),
                    'updated_at' => now(),
                ]
            );
        }

        // 3. Store snapshot metadata
        DB::table('financial_matrix_snapshots')->updateOrInsert(
            ['version_tag' => 'v1.0_baseline_29_banks'],
            [
                'industry' => 'NGAN_HANG',
                'raw_dataset' => json_encode(['metadata' => $jsonData['metadata'] ?? []]),
                'bank_count' => count($bankSymbols),
                'start_year' => $startYear,
                'end_year' => $endYear,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $this->command->info("Seeded 29 banks and financial reports into MAMP MySQL successfully.");
    }
}
