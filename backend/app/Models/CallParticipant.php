<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallParticipant extends Model
{
    public const ROLE_FROM = 'from';
    public const ROLE_TO = 'to';

    protected $fillable = [
        'call_log_id',
        'participant_id',
        'phone_number',
        'name',
        'location',
        'role',
    ];

    public function callLog(): BelongsTo
    {
        return $this->belongsTo(CallLog::class);
    }

    public function isFrom(): bool
    {
        return $this->role === self::ROLE_FROM;
    }

    public function isTo(): bool
    {
        return $this->role === self::ROLE_TO;
    }
}
