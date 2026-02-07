<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\ServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::with('pillar');

        if ($request->filled('pillar_id')) {
            $query->where('pillar_id', $request->pillar_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $services = $query->ordered()->get();

        return $this->success(ServiceResource::collection($services));
    }

    public function store(ServiceRequest $request): JsonResponse
    {
        $service = Service::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
            'is_featured' => $request->boolean('is_featured', false),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return $this->created(
            new ServiceResource($service->load('pillar')),
            'Service created successfully'
        );
    }

    public function show(Service $service): JsonResponse
    {
        return $this->success(new ServiceResource($service->load('pillar')));
    }

    public function update(ServiceRequest $request, Service $service): JsonResponse
    {
        $service->update($request->validated());

        return $this->success(
            new ServiceResource($service->fresh()->load('pillar')),
            'Service updated successfully'
        );
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return $this->success(null, 'Service deleted successfully');
    }

    public function toggleActive(Service $service): JsonResponse
    {
        $service->update(['is_active' => !$service->is_active]);

        return $this->success(
            new ServiceResource($service->fresh()->load('pillar')),
            $service->is_active ? 'Service activated' : 'Service deactivated'
        );
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:services,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->items as $item) {
            Service::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return $this->success(null, 'Services reordered successfully');
    }
}
