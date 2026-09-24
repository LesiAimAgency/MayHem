<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MhCustomFilter extends Model
{
    protected $table = 'mh_custom_filters';

    protected $fillable = [
        'sector_id',
        'filter_name',
        'filter_logic',
    ];

    protected function casts(): array
    {
        return [
            'filter_logic' => 'array',
        ];
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(MhSector::class, 'sector_id', 'id');
    }
}
