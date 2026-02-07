<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;

class FaqController extends BaseController
{
    public function index(): JsonResponse
    {
        $faqs = Faq::with('pillar')
            ->active()
            ->ordered()
            ->get();

        return $this->success(FaqResource::collection($faqs));
    }

    public function global(): JsonResponse
    {
        $faqs = Faq::global()
            ->active()
            ->ordered()
            ->get();

        return $this->success(FaqResource::collection($faqs));
    }
}
