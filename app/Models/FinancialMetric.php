<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialMetric extends Model
{
    protected $table = 'financial_metrics';
    public $timestamps = false;

    protected $fillable = [
        'ticker',
        'report_year',
        'report_period',
        'roe',
        'roa',
        'nim',
        'npl',
        'car',
        'cir',
        'casa',
        'pe',
        'pb',
        'revenue',
        'net_profit'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'ticker', 'ticker');
    }
}
