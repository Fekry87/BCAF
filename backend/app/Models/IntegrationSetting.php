<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class IntegrationSetting extends Model
{
    public const PROVIDER_SUITEDASH = 'suitedash';
    public const PROVIDER_RINGCENTRAL = 'ringcentral';

    protected $fillable = [
        'provider',
        'is_enabled',
        'mode',
        'credentials',
        'settings',
        'last_tested_at',
        'last_test_success',
        'last_test_message',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'settings' => 'array',
            'last_tested_at' => 'datetime',
            'last_test_success' => 'boolean',
        ];
    }

    public function setCredentialsAttribute($value): void
    {
        if (is_array($value)) {
            $value = json_encode($value);
        }
        $this->attributes['credentials'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getCredentialsAttribute($value): ?array
    {
        if (!$value) {
            return null;
        }
        try {
            $decrypted = Crypt::decryptString($value);
            return json_decode($decrypted, true);
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function forProvider(string $provider): ?self
    {
        return static::where('provider', $provider)->first();
    }

    public static function getOrCreate(string $provider): self
    {
        return static::firstOrCreate(
            ['provider' => $provider],
            ['is_enabled' => false]
        );
    }

    public function updateTestResult(bool $success, ?string $message = null): void
    {
        $this->update([
            'last_tested_at' => now(),
            'last_test_success' => $success,
            'last_test_message' => $message,
        ]);
    }

    public function isApiMode(): bool
    {
        return $this->mode === 'api';
    }

    public function isImportMode(): bool
    {
        return $this->mode === 'import';
    }

    public function getCredential(string $key, $default = null)
    {
        return $this->credentials[$key] ?? $default;
    }

    public function getSetting(string $key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }
}
