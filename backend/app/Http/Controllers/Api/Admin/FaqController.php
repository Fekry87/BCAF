<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\FaqRequest;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Faq::with('pillar');

        if ($request->filled('pillar_id')) {
            if ($request->pillar_id === 'global') {
                $query->whereNull('pillar_id');
            } else {
                $query->where('pillar_id', $request->pillar_id);
            }
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $faqs = $query->ordered()->get();

        return $this->success(FaqResource::collection($faqs));
    }

    public function store(FaqRequest $request): JsonResponse
    {
        $faq = Faq::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return $this->created(
            new FaqResource($faq->load('pillar')),
            'FAQ created successfully'
        );
    }

    public function show(Faq $faq): JsonResponse
    {
        return $this->success(new FaqResource($faq->load('pillar')));
    }

    public function update(FaqRequest $request, Faq $faq): JsonResponse
    {
        $faq->update($request->validated());

        return $this->success(
            new FaqResource($faq->fresh()->load('pillar')),
            'FAQ updated successfully'
        );
    }

    public function destroy(Faq $faq): JsonResponse
    {
        $faq->delete();

        return $this->success(null, 'FAQ deleted successfully');
    }

    public function toggleActive(Faq $faq): JsonResponse
    {
        $faq->update(['is_active' => !$faq->is_active]);

        return $this->success(
            new FaqResource($faq->fresh()->load('pillar')),
            $faq->is_active ? 'FAQ activated' : 'FAQ deactivated'
        );
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:faqs,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->items as $item) {
            Faq::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return $this->success(null, 'FAQs reordered successfully');
    }
}
