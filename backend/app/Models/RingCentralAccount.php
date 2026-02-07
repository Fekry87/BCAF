<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RingCentralAccount extends Model
{
    protected $fillable = [
        'account_id',
        'name',
        'main_number',
        'status',
        'extensions',
    ];

    protected function casts(): array
    {
        return [
            'extensions' => 'array',
        ];
    }

    public function token(): HasOne
    {
        return $this->hasOne(RingCentralToken::class, 'ringcentral_account_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function hasValidToken(): bool
    {
        return $this->token && !$this->token->isExpired();
    }
}
