<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CallLog extends Model
{
    public const DIRECTION_INBOUND = 'inbound';
    public const DIRECTION_OUTBOUND = 'outbound';

    public const TYPE_VOICE = 'voice';
    public const TYPE_FAX = 'fax';
    public const TYPE_SMS = 'sms';

    protected $fillable = [
        'ringcentral_id',
        'session_id',
        'direction',
        'type',
        'action',
        'result',
        'start_time',
        'duration',
        'from_data',
        'to_data',
        'recording_url',
        'contact_submission_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'duration' => 'integer',
            'from_data' => 'array',
            'to_data' => 'array',
            'metadata' => 'array',
        ];
    }

    public function contactSubmission(): BelongsTo
    {
        return $this->belongsTo(ContactSubmission::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(CallParticipant::class);
    }

    public function scopeInbound($query)
    {
        return $query->where('direction', self::DIRECTION_INBOUND);
    }

    public function scopeOutbound($query)
    {
        return $query->where('direction', self::DIRECTION_OUTBOUND);
    }

    public function scopeVoice($query)
    {
        return $query->where('type', self::TYPE_VOICE);
    }

    public function isInbound(): bool
    {
        return $this->direction === self::DIRECTION_INBOUND;
    }

    public function isOutbound(): bool
    {
        return $this->direction === self::DIRECTION_OUTBOUND;
    }

    public function getFormattedDuration(): string
    {
        if (!$this->duration) {
            return '0:00';
        }

        $minutes = floor($this->duration / 60);
        $seconds = $this->duration % 60;

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    public function getFromNumber(): ?string
    {
        return $this->from_data['phoneNumber'] ?? null;
    }

    public function getToNumber(): ?string
    {
        return $this->to_data['phoneNumber'] ?? null;
    }
}
