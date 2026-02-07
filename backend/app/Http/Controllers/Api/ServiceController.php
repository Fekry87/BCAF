<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;

class ServiceController extends BaseController
{
    public function index(): JsonResponse
    {
        $services = Service::with('pillar')
            ->active()
            ->ordered()
            ->get();

        return $this->success(ServiceResource::collection($services));
    }

    public function show(string $slug): JsonResponse
    {
        $service = Service::where('slug', $slug)
            ->with('pillar')
            ->active()
            ->first();

        if (!$service) {
            return $this->notFound('Service not found');
        }

        return $this->success(new ServiceResource($service));
    }

    public function featured(): JsonResponse
    {
        $services = Service::with('pillar')
            ->active()
            ->featured()
            ->ordered()
            ->get();

        return $this->success(ServiceResource::collection($services));
    }
}
