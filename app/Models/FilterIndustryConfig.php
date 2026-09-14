<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FilterIndustryConfig extends Model
{
    protected $table = 'filter_industry_configs';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'short_name',
        'code_prefix',
        'item_label',
        'item_count_label',
        'tickers',
        'quick_tickers',
        'fields',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'tickers' => 'array',
        'quick_tickers' => 'array',
        'fields' => 'array',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
