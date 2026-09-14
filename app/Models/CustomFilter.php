<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomFilter extends Model
{
    protected $table = 'custom_filters';

    protected $fillable = [
        'name',
        'industry',
        'conditions',
        'is_preset'
    ];

    protected $casts = [
        'conditions' => 'array',
        'is_preset' => 'boolean'
    ];
}
