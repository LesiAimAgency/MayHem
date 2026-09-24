<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MhCompany extends Model
{
    protected $table = 'mh_companies';

    protected $primaryKey = 'short_name';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'short_name',
        'sector_id',
        'company_name',
        'exchange',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(MhSector::class, 'sector_id', 'id');
    }

    public function financialReports(): HasMany
    {
        return $this->hasMany(MhFinancialReport::class, 'short_name', 'short_name');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $term = trim($term);
        return $query->where(function (Builder $q) use ($term) {
            $q->where('short_name', 'LIKE', "%{$term}%")
              ->orWhere('company_name', 'LIKE', "%{$term}%")
              ->orWhere('exchange', 'LIKE', "%{$term}%");
        });
    }
}
