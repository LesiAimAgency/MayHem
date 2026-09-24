<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MhSector extends Model
{
    protected $table = 'mh_sectors';

    protected $fillable = [
        'sector_code',
        'sector_name',
        'description',
    ];

    public function companies(): HasMany
    {
        return $this->hasMany(MhCompany::class, 'sector_id', 'id');
    }

    public function customFilters(): HasMany
    {
        return $this->hasMany(MhCustomFilter::class, 'sector_id', 'id');
    }
}
