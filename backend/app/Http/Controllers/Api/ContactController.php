<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ContactSubmissionRequest;
use App\Http\Resources\ContactSubmissionResource;
use App\Jobs\SyncContactToSuiteDash;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;

class ContactController extends BaseController
{
    public function store(ContactSubmissionRequest $request): JsonResponse
    {
        $submission = ContactSubmission::create([
            ...$request->validated(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'source' => 'website',
            'status' => ContactSubmission::STATUS_NEW,
        ]);

        // Dispatch job to sync with SuiteDash
        SyncContactToSuiteDash::dispatch($submission);

        return $this->created(
            new ContactSubmissionResource($submission),
            'Thank you for your message. We will be in touch shortly.'
        );
    }
}
