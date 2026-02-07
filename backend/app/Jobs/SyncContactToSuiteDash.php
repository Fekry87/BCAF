<?php

namespace App\Jobs;

use App\Models\ContactSubmission;
use App\Services\SuiteDash\SuiteDashService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncContactToSuiteDash implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public ContactSubmission $submission
    ) {}

    public function handle(SuiteDashService $service): void
    {
        if ($this->submission->isSynced()) {
            Log::info("Contact submission {$this->submission->id} already synced, skipping");
            return;
        }

        $result = $service->syncContactSubmission($this->submission);

        if ($result['success']) {
            Log::info("Contact submission {$this->submission->id} synced successfully", $result);
        } else {
            Log::warning("Failed to sync contact submission {$this->submission->id}", $result);

            if ($this->attempts() >= $this->tries) {
                $this->submission->markAsFailed();
            }
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SyncContactToSuiteDash job failed for submission {$this->submission->id}", [
            'error' => $exception->getMessage(),
        ]);

        $this->submission->markAsFailed();
    }

    public function tags(): array
    {
        return [
            'suitedash',
            'contact-sync',
            'submission:' . $this->submission->id,
        ];
    }
}
