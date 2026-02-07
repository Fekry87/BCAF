<?php

namespace App\Console;

use App\Jobs\SyncRingCentralCallLogs;
use App\Services\SuiteDash\SuiteDashExporter;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Sync RingCentral call logs every hour
        $schedule->job(new SyncRingCentralCallLogs())
            ->hourly()
            ->withoutOverlapping()
            ->runInBackground();

        // Clean up old SuiteDash exports (weekly)
        $schedule->call(function () {
            app(SuiteDashExporter::class)->cleanupOldExports(30);
        })->weekly();

        // Prune old integration logs (daily)
        $schedule->command('model:prune', [
            '--model' => 'App\\Models\\IntegrationLog',
        ])->daily();

        // Queue worker health check
        $schedule->command('queue:monitor', ['redis:default'])
            ->everyFiveMinutes();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
