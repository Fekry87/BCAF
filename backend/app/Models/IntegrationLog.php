<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class IntegrationLog extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_SUCCESS = 'success';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'provider',
        'action',
        'request_id',
        'status',
        'related_type',
        'related_id',
        'payload',
        'response',
        'error_message',
        'http_status',
        'duration_ms',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'response' => 'array',
            'http_status' => 'integer',
            'duration_ms' => 'integer',
        ];
    }

    public function related(): MorphTo
    {
        return $this->morphTo();
    }

    public static function logRequest(
        string $provider,
        string $action,
        array $payload = [],
        ?Model $related = null
    ): self {
        return static::create([
            'provider' => $provider,
            'action' => $action,
            'request_id' => uniqid($provider . '_', true),
            'status' => self::STATUS_PENDING,
            'payload' => $payload,
            'related_type' => $related ? get_class($related) : null,
            'related_id' => $related?->id,
        ]);
    }

    public function markSuccess(array $response = [], ?int $httpStatus = null, ?int $durationMs = null): void
    {
        $this->update([
            'status' => self::STATUS_SUCCESS,
            'response' => $response,
            'http_status' => $httpStatus,
            'duration_ms' => $durationMs,
        ]);
    }

    public function markFailed(string $errorMessage, array $response = [], ?int $httpStatus = null, ?int $durationMs = null): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $errorMessage,
            'response' => $response,
            'http_status' => $httpStatus,
            'duration_ms' => $durationMs,
        ]);
    }

    public function scopeForProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
