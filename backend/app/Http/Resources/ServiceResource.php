<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pillar_id' => $this->pillar_id,
            'type' => $this->type,
            'type_label' => $this->getTypeLabel(),
            'title' => $this->title,
            'slug' => $this->slug,
            'summary' => $this->summary,
            'details' => $this->details,
            'icon' => $this->icon,
            'price_from' => $this->price_from,
            'price_label' => $this->price_label,
            'sort_order' => $this->sort_order,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'pillar' => new PillarResource($this->whenLoaded('pillar')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
