<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\PillarRequest;
use App\Http\Resources\PillarResource;
use App\Models\Pillar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PillarController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Pillar::withCount(['services', 'faqs']);

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $pillars = $query->ordered()->get();

        return $this->success(PillarResource::collection($pillars));
    }

    public function store(PillarRequest $request): JsonResponse
    {
        $pillar = Pillar::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return $this->created(
            new PillarResource($pillar),
            'Pillar created successfully'
        );
    }

    public function show(Pillar $pillar): JsonResponse
    {
        return $this->success(new PillarResource($pillar->loadCount(['services', 'faqs'])));
    }

    public function update(PillarRequest $request, Pillar $pillar): JsonResponse
    {
        $pillar->update($request->validated());

        return $this->success(
            new PillarResource($pillar->fresh()->loadCount(['services', 'faqs'])),
            'Pillar updated successfully'
        );
    }

    public function destroy(Pillar $pillar): JsonResponse
    {
        if ($pillar->services()->exists()) {
            return $this->error('Cannot delete pillar with associated services', 422);
        }

        $pillar->delete();

        return $this->success(null, 'Pillar deleted successfully');
    }

    public function toggleActive(Pillar $pillar): JsonResponse
    {
        $pillar->update(['is_active' => !$pillar->is_active]);

        return $this->success(
            new PillarResource($pillar->fresh()),
            $pillar->is_active ? 'Pillar activated' : 'Pillar deactivated'
        );
    }
}
