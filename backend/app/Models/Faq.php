<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Faq extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pillar_id',
        'question',
        'answer',
        'category',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
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
        return $query->orderBy('sort_order')->orderBy('id');
    }

    public function scopeGlobal($query)
    {
        return $query->whereNull('pillar_id');
    }

    public function scopeForPillar($query, $pillarId)
    {
        return $query->where(function ($q) use ($pillarId) {
            $q->where('pillar_id', $pillarId)
              ->orWhereNull('pillar_id');
        });
    }

    public function isGlobal(): bool
    {
        return $this->pillar_id === null;
    }
}
