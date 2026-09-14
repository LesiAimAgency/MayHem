<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FilterCriterion extends Model
{
    protected $table = 'filter_criteria';

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'category',
        'industry',
        'name',
        'field',
        'mode',
        'operator',
        'value',
        'display_value',
        'compare_with_field',
        'time_scope',
        'is_custom',
        'sort_order'
    ];

    protected $casts = [
        'value' => 'float',
        'is_custom' => 'boolean',
        'sort_order' => 'integer'
    ];
}
