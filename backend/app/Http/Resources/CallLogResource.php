<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CallLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ringcentral_id' => $this->ringcentral_id,
            'session_id' => $this->session_id,
            'direction' => $this->direction,
            'type' => $this->type,
            'action' => $this->action,
            'result' => $this->result,
            'start_time' => $this->start_time?->toISOString(),
            'duration' => $this->duration,
            'duration_formatted' => $this->getFormattedDuration(),
            'from_number' => $this->getFromNumber(),
            'to_number' => $this->getToNumber(),
            'from_data' => $this->from_data,
            'to_data' => $this->to_data,
            'recording_url' => $this->recording_url,
            'contact_submission_id' => $this->contact_submission_id,
            'contact_submission' => new ContactSubmissionResource($this->whenLoaded('contactSubmission')),
            'participants' => CallParticipantResource::collection($this->whenLoaded('participants')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
