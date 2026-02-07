<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactSubmission extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_NEW = 'new';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_SYNCED = 'synced';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CLOSED = 'closed';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'pillar_id',
        'message',
        'status',
        'suitedash_external_id',
        'synced_at',
        'source',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'synced_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function pillar(): BelongsTo
    {
        return $this->belongsTo(Pillar::class);
    }

    public function callLogs(): HasMany
    {
        return $this->hasMany(CallLog::class);
    }

    public function smsMessages(): HasMany
    {
        return $this->hasMany(SmsMessage::class);
    }

    public function scopeNew($query)
    {
        return $query->where('status', self::STATUS_NEW);
    }

    public function scopeUnsynced($query)
    {
        return $query->whereIn('status', [self::STATUS_NEW, self::STATUS_FAILED]);
    }

    public function scopeSynced($query)
    {
        return $query->where('status', self::STATUS_SYNCED);
    }

    public function markAsSynced(string $externalId): void
    {
        $this->update([
            'status' => self::STATUS_SYNCED,
            'suitedash_external_id' => $externalId,
            'synced_at' => now(),
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => self::STATUS_FAILED]);
    }

    public function isSynced(): bool
    {
        return $this->status === self::STATUS_SYNCED;
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            self::STATUS_NEW => 'New',
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_SYNCED => 'Synced',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_CLOSED => 'Closed',
            default => ucfirst($this->status),
        };
    }
}
