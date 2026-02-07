<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class RingCentralToken extends Model
{
    protected $fillable = [
        'ringcentral_account_id',
        'access_token',
        'refresh_token',
        'token_type',
        'expires_in',
        'expires_at',
        'scope',
        'owner_id',
    ];

    protected function casts(): array
    {
        return [
            'expires_in' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(RingCentralAccount::class, 'ringcentral_account_id');
    }

    public function setAccessTokenAttribute($value): void
    {
        $this->attributes['access_token'] = Crypt::encryptString($value);
    }

    public function getAccessTokenAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function setRefreshTokenAttribute($value): void
    {
        $this->attributes['refresh_token'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getRefreshTokenAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return true;
        }
        return $this->expires_at->isPast();
    }

    public function isExpiringSoon(int $minutes = 5): bool
    {
        if (!$this->expires_at) {
            return true;
        }
        return $this->expires_at->subMinutes($minutes)->isPast();
    }

    public static function getLatest(): ?self
    {
        return static::latest()->first();
    }
}
