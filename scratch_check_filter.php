<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$f = \App\Models\CustomFilter::find(1);
if ($f) {
    echo "Found filter: id={$f->id}, name={$f->name}, is_preset={$f->is_preset}\n";
} else {
    echo "Filter 1 not found\n";
}
