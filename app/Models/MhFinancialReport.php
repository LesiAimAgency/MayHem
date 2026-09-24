<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MhFinancialReport extends Model
{
    protected $table = 'mh_financial_reports';

    protected $fillable = [
        'short_name',
        'report_year',
        'api_data',
        'calculated_data',
    ];

    protected function casts(): array
    {
        return [
            'report_year' => 'integer',
            'api_data' => 'array',
            'calculated_data' => 'array',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(MhCompany::class, 'short_name', 'short_name');
    }

    /**
     * Get a normalized financial metric value from api_data or calculated_data.
     */
    public function getMetric(string $key): ?float
    {
        $calc = $this->calculated_data ?? [];
        if (isset($calc['raw_metrics'][$key]) && is_numeric($calc['raw_metrics'][$key])) {
            return (float) $calc['raw_metrics'][$key];
        }
        if (isset($calc['indicators'][$key]) && is_numeric($calc['indicators'][$key])) {
            return (float) $calc['indicators'][$key];
        }
        if (isset($calc[$key]) && is_numeric($calc[$key])) {
            return (float) $calc[$key];
        }

        if (isset($calc['fill_metrics_vi'][$key]) && is_numeric($calc['fill_metrics_vi'][$key])) {
            return (float) $calc['fill_metrics_vi'][$key];
        }
        if (isset($calc['tinh_metrics_vi'][$key]) && is_numeric($calc['tinh_metrics_vi'][$key])) {
            return (float) $calc['tinh_metrics_vi'][$key];
        }

        $api = $this->api_data ?? [];
        if (isset($api['fill_30_vi'][$key]) && is_numeric($api['fill_30_vi'][$key])) {
            return (float) $api['fill_30_vi'][$key];
        }
        if (isset($api['ratios'][$key]) && is_numeric($api['ratios'][$key])) {
            return (float) $api['ratios'][$key];
        }
        if (isset($api['income_statement'][$key]) && is_numeric($api['income_statement'][$key])) {
            return (float) $api['income_statement'][$key];
        }
        if (isset($api['balance_sheet'][$key]) && is_numeric($api['balance_sheet'][$key])) {
            return (float) $api['balance_sheet'][$key];
        }
        if (isset($api['cash_flow'][$key]) && is_numeric($api['cash_flow'][$key])) {
            return (float) $api['cash_flow'][$key];
        }

        return null;
    }
}
