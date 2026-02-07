<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\FaqResource;
use App\Http\Resources\PillarResource;
use App\Http\Resources\ServiceResource;
use App\Models\Pillar;
use Illuminate\Http\JsonResponse;

class PillarController extends BaseController
{
    public function index(): JsonResponse
    {
        $pillars = Pillar::active()
            ->ordered()
            ->withCount(['services' => fn($q) => $q->active()])
            ->get();

        return $this->success(PillarResource::collection($pillars));
    }

    public function show(string $slug): JsonResponse
    {
        $pillar = Pillar::where('slug', $slug)
            ->active()
            ->first();

        if (!$pillar) {
            return $this->notFound('Pillar not found');
        }

        return $this->success(new PillarResource($pillar));
    }

    public function services(string $slug): JsonResponse
    {
        $pillar = Pillar::where('slug', $slug)->active()->first();

        if (!$pillar) {
            return $this->notFound('Pillar not found');
        }

        $oneOffServices = $pillar->services()
            ->active()
            ->oneOff()
            ->ordered()
            ->get();

        $subscriptionServices = $pillar->services()
            ->active()
            ->subscription()
            ->ordered()
            ->get();

        return $this->success([
            'pillar' => new PillarResource($pillar),
            'one_off' => ServiceResource::collection($oneOffServices),
            'subscription' => ServiceResource::collection($subscriptionServices),
        ]);
    }

    public function faqs(string $slug): JsonResponse
    {
        $pillar = Pillar::where('slug', $slug)->active()->first();

        if (!$pillar) {
            return $this->notFound('Pillar not found');
        }

        $faqs = $pillar->faqs()
            ->active()
            ->ordered()
            ->get();

        $globalFaqs = \App\Models\Faq::global()
            ->active()
            ->ordered()
            ->get();

        return $this->success([
            'pillar_faqs' => FaqResource::collection($faqs),
            'global_faqs' => FaqResource::collection($globalFaqs),
        ]);
    }
}
