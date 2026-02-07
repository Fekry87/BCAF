<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    public const TYPE_ONE_OFF = 'one_off';
    public const TYPE_SUBSCRIPTION = 'subscription';

    protected $fillable = [
        'pillar_id',
        'type',
        'title',
        'slug',
        'summary',
        'details',
        'icon',
        'price_from',
        'price_label',
        'sort_order',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_from' => 'decimal:2',
            'sort_order' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function pillar(): BelongsTo
    {
        return $this->belongsTo(Pillar::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('title');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOneOff($query)
    {
        return $query->where('type', self::TYPE_ONE_OFF);
    }

    public function scopeSubscription($query)
    {
        return $query->where('type', self::TYPE_SUBSCRIPTION);
    }

    public function isOneOff(): bool
    {
        return $this->type === self::TYPE_ONE_OFF;
    }

    public function isSubscription(): bool
    {
        return $this->type === self::TYPE_SUBSCRIPTION;
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            self::TYPE_ONE_OFF => 'One-off',
            self::TYPE_SUBSCRIPTION => 'Subscription',
            default => ucfirst($this->type),
        };
    }
}
