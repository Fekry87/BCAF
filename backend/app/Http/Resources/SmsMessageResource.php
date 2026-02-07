<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SmsMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ringcentral_id' => $this->ringcentral_id,
            'conversation_id' => $this->conversation_id,
            'direction' => $this->direction,
            'from_number' => $this->from_number,
            'to_number' => $this->to_number,
            'content' => $this->content,
            'status' => $this->status,
            'sent_at' => $this->sent_at?->toISOString(),
            'contact_submission_id' => $this->contact_submission_id,
            'contact_submission' => new ContactSubmissionResource($this->whenLoaded('contactSubmission')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
