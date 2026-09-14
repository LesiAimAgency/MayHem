<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialReportJSON extends Model
{
    protected $table = 'financial_reports_json';
    public $timestamps = false;

    protected $fillable = [
        'ticker',
        'report_year',
        'report_period',
        'raw_data',
        'updated_at'
    ];

    protected $casts = [
        'raw_data' => 'array',
        'report_year' => 'integer'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'ticker', 'ticker');
    }
}
