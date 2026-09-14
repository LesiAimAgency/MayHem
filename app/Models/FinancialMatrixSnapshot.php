<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialMatrixSnapshot extends Model
{
    protected $table = 'financial_matrix_snapshots';

    protected $fillable = [
        'version_tag',
        'industry',
        'raw_dataset',
        'bank_count',
        'start_year',
        'end_year'
    ];

    protected $casts = [
        'raw_dataset' => 'array'
    ];
}
