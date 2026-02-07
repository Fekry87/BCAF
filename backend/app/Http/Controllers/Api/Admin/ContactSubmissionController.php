<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\ContactSubmissionResource;
use App\Jobs\SyncContactToSuiteDash;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactSubmissionController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactSubmission::with('pillar');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('pillar_id')) {
            $query->where('pillar_id', $request->pillar_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $submissions = $query->latest()->paginate(20);

        return $this->success(
            ContactSubmissionResource::collection($submissions),
            null,
            200,
            [
                'pagination' => [
                    'current_page' => $submissions->currentPage(),
                    'last_page' => $submissions->lastPage(),
                    'per_page' => $submissions->perPage(),
                    'total' => $submissions->total(),
                ],
            ]
        );
    }

    public function show(ContactSubmission $contactSubmission): JsonResponse
    {
        return $this->success(
            new ContactSubmissionResource($contactSubmission->load(['pillar', 'callLogs', 'smsMessages']))
        );
    }

    public function updateStatus(Request $request, ContactSubmission $contactSubmission): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:new,in_progress,synced,failed,closed'],
        ]);

        $contactSubmission->update(['status' => $request->status]);

        return $this->success(
            new ContactSubmissionResource($contactSubmission->fresh()->load('pillar')),
            'Status updated successfully'
        );
    }

    public function resync(ContactSubmission $contactSubmission): JsonResponse
    {
        SyncContactToSuiteDash::dispatch($contactSubmission);

        return $this->success(null, 'Sync job dispatched');
    }

    public function destroy(ContactSubmission $contactSubmission): JsonResponse
    {
        $contactSubmission->delete();

        return $this->success(null, 'Contact submission deleted');
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total' => ContactSubmission::count(),
            'new' => ContactSubmission::new()->count(),
            'in_progress' => ContactSubmission::where('status', 'in_progress')->count(),
            'synced' => ContactSubmission::synced()->count(),
            'failed' => ContactSubmission::where('status', 'failed')->count(),
            'this_week' => ContactSubmission::where('created_at', '>=', now()->startOfWeek())->count(),
            'this_month' => ContactSubmission::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        return $this->success($stats);
    }
}
