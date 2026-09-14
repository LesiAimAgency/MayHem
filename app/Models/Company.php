<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies';
    protected $primaryKey = 'ticker';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'ticker',
        'company_name',
        'short_name',
        'exchange',
        'industry',
        'is_active',
        'updated_at'
    ];

    public function financialReports()
    {
        return $this->hasMany(FinancialReportJSON::class, 'ticker', 'ticker');
    }

    public function metrics()
    {
        return $this->hasMany(FinancialMetric::class, 'ticker', 'ticker');
    }
}
