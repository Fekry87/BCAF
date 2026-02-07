<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PillarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'hero_image' => $this->hero_image,
            'icon' => $this->icon,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'services' => ServiceResource::collection($this->whenLoaded('services')),
            'faqs' => FaqResource::collection($this->whenLoaded('faqs')),
            'services_count' => $this->when(
                $this->services_count !== null,
                $this->services_count
            ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
