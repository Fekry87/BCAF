<?php

namespace App\Jobs;

use App\Services\RingCentral\RingCentralService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncRingCentralCallLogs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public ?string $dateFrom = null
    ) {}

    public function handle(RingCentralService $service): void
    {
        if (!$service->isConnected()) {
            Log::info('RingCentral not connected, skipping call log sync');
            return;
        }

        $result = $service->syncCallLogs($this->dateFrom);

        if ($result['success']) {
            Log::info('RingCentral call logs synced', $result);
        } else {
            Log::warning('Failed to sync RingCentral call logs', $result);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncRingCentralCallLogs job failed', [
            'error' => $exception->getMessage(),
        ]);
    }

    public function tags(): array
    {
        return ['ringcentral', 'call-logs-sync'];
    }
}
