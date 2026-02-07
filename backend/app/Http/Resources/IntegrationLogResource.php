<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntegrationLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'action' => $this->action,
            'request_id' => $this->request_id,
            'status' => $this->status,
            'related_type' => $this->related_type,
            'related_id' => $this->related_id,
            'payload' => $this->when($request->user()?->isAdmin ?? false, $this->payload),
            'response' => $this->when($request->user()?->isAdmin ?? false, $this->response),
            'error_message' => $this->error_message,
            'http_status' => $this->http_status,
            'duration_ms' => $this->duration_ms,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
