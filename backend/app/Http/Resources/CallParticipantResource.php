<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CallParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'participant_id' => $this->participant_id,
            'phone_number' => $this->phone_number,
            'name' => $this->name,
            'location' => $this->location,
            'role' => $this->role,
        ];
    }
}
