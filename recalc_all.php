<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = app(App\Services\FinancialMetricService::class);
$tickers = App\Models\MhCompany::pluck('short_name');

$count = 0;
foreach ($tickers as $t) {
    $res = $service->calculateAndStoreBankMetrics($t);
    $count++;
    echo "Recalculated {$t}\n";
}

echo "SUCCESS: Recalculated {$count} banks!\n";
