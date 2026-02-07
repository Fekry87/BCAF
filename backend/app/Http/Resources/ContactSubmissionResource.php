<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'pillar_id' => $this->pillar_id,
            'message' => $this->message,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'suitedash_external_id' => $this->suitedash_external_id,
            'synced_at' => $this->synced_at?->toISOString(),
            'source' => $this->source,
            'is_synced' => $this->isSynced(),
            'pillar' => new PillarResource($this->whenLoaded('pillar')),
            'call_logs' => CallLogResource::collection($this->whenLoaded('callLogs')),
            'sms_messages' => SmsMessageResource::collection($this->whenLoaded('smsMessages')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
