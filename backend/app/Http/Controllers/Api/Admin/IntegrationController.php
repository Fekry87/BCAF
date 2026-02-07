<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\CallLogResource;
use App\Http\Resources\IntegrationLogResource;
use App\Models\IntegrationLog;
use App\Models\IntegrationSetting;
use App\Services\RingCentral\RingCentralService;
use App\Services\SuiteDash\SuiteDashService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationController extends BaseController
{
    public function __construct(
        private SuiteDashService $suiteDashService,
        private RingCentralService $ringCentralService
    ) {}

    /**
     * Get all integration statuses
     */
    public function index(): JsonResponse
    {
        $suiteDashSettings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_SUITEDASH);
        $ringCentralSettings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_RINGCENTRAL);

        return $this->success([
            'suitedash' => [
                'enabled' => $suiteDashSettings?->is_enabled ?? false,
                'mode' => $suiteDashSettings?->mode ?? 'import',
                'last_tested_at' => $suiteDashSettings?->last_tested_at?->toIso8601String(),
                'last_test_success' => $suiteDashSettings?->last_test_success,
                'last_test_message' => $suiteDashSettings?->last_test_message,
                'settings' => $suiteDashSettings?->settings,
            ],
            'ringcentral' => $this->ringCentralService->getStatus(),
        ]);
    }

    /**
     * Get integration logs
     */
    public function logs(Request $request): JsonResponse
    {
        $query = IntegrationLog::query();

        if ($request->filled('provider')) {
            $query->where('provider', $request->provider);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        $logs = $query->latest()->paginate(50);

        return $this->success(
            IntegrationLogResource::collection($logs),
            null,
            200,
            [
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ],
            ]
        );
    }

    // ==================
    // SuiteDash Endpoints
    // ==================

    /**
     * Get SuiteDash settings
     */
    public function suiteDashSettings(): JsonResponse
    {
        $settings = IntegrationSetting::getOrCreate(IntegrationSetting::PROVIDER_SUITEDASH);

        return $this->success([
            'enabled' => $settings->is_enabled,
            'mode' => $settings->mode ?? 'import',
            'settings' => $settings->settings,
            'has_credentials' => !empty($settings->credentials),
            'last_tested_at' => $settings->last_tested_at?->toIso8601String(),
            'last_test_success' => $settings->last_test_success,
            'last_test_message' => $settings->last_test_message,
        ]);
    }

    /**
     * Update SuiteDash settings
     */
    public function updateSuiteDashSettings(Request $request): JsonResponse
    {
        $request->validate([
            'enabled' => ['sometimes', 'boolean'],
            'mode' => ['sometimes', 'in:api,import'],
            'api_url' => ['nullable', 'url'],
            'api_key' => ['nullable', 'string'],
            'secret_key' => ['nullable', 'string'],
            'auto_sync' => ['sometimes', 'boolean'],
        ]);

        $data = [
            'is_enabled' => $request->boolean('enabled'),
            'mode' => $request->input('mode'),
        ];

        if ($request->filled('api_key') || $request->filled('secret_key') || $request->filled('api_url')) {
            $data['credentials'] = [
                'api_url' => $request->input('api_url'),
                'api_key' => $request->input('api_key'),
                'secret_key' => $request->input('secret_key'),
            ];
        }

        if ($request->has('auto_sync')) {
            $data['settings'] = ['auto_sync' => $request->boolean('auto_sync')];
        }

        $settings = $this->suiteDashService->updateSettings($data);

        return $this->success([
            'enabled' => $settings->is_enabled,
            'mode' => $settings->mode,
            'settings' => $settings->settings,
        ], 'Settings updated successfully');
    }

    /**
     * Test SuiteDash connection
     */
    public function testSuiteDashConnection(): JsonResponse
    {
        $result = $this->suiteDashService->testConnection();

        return $this->success($result);
    }

    /**
     * Generate SuiteDash CSV export
     */
    public function generateSuiteDashExport(Request $request): JsonResponse
    {
        $onlyUnsynced = $request->boolean('only_unsynced', true);
        $result = $this->suiteDashService->generateExport($onlyUnsynced);

        return $this->success($result);
    }

    /**
     * Get SuiteDash export files
     */
    public function getSuiteDashExports(): JsonResponse
    {
        $files = $this->suiteDashService->getExportFiles();

        return $this->success($files);
    }

    /**
     * Download SuiteDash export file
     */
    public function downloadSuiteDashExport(string $filename): \Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
    {
        $content = $this->suiteDashService->getExportContent($filename);

        if (!$content) {
            return $this->notFound('Export file not found');
        }

        return response()->streamDownload(function () use ($content) {
            echo $content;
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    // ======================
    // RingCentral Endpoints
    // ======================

    /**
     * Get RingCentral status
     */
    public function ringCentralStatus(): JsonResponse
    {
        return $this->success($this->ringCentralService->getStatus());
    }

    /**
     * Get RingCentral authorization URL
     */
    public function ringCentralAuthUrl(): JsonResponse
    {
        $url = $this->ringCentralService->getAuthorizationUrl();

        return $this->success(['authorization_url' => $url]);
    }

    /**
     * Handle RingCentral OAuth callback
     */
    public function ringCentralCallback(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $result = $this->ringCentralService->handleOAuthCallback($request->code);

        if ($result['success']) {
            return $this->success(null, 'RingCentral connected successfully');
        }

        return $this->error('Failed to connect RingCentral: ' . ($result['error'] ?? 'Unknown error'));
    }

    /**
     * Disconnect RingCentral
     */
    public function ringCentralDisconnect(): JsonResponse
    {
        $this->ringCentralService->disconnect();

        return $this->success(null, 'RingCentral disconnected');
    }

    /**
     * Get RingCentral phone numbers
     */
    public function ringCentralPhoneNumbers(): JsonResponse
    {
        $result = $this->ringCentralService->getPhoneNumbers();

        if (!$result['success']) {
            return $this->error($result['error'] ?? 'Failed to get phone numbers');
        }

        return $this->success($result['data']['records'] ?? []);
    }

    /**
     * Sync RingCentral call logs
     */
    public function syncRingCentralCallLogs(Request $request): JsonResponse
    {
        $result = $this->ringCentralService->syncCallLogs($request->input('date_from'));

        if (!$result['success']) {
            return $this->error($result['error'] ?? 'Failed to sync call logs');
        }

        return $this->success($result, "Synced {$result['synced']} call logs");
    }

    /**
     * Get call logs
     */
    public function ringCentralCallLogs(Request $request): JsonResponse
    {
        $filters = $request->only(['direction', 'type', 'date_from', 'date_to', 'per_page']);

        $callLogs = $this->ringCentralService->getLocalCallLogs($filters);

        return $this->success(
            CallLogResource::collection($callLogs),
            null,
            200,
            [
                'pagination' => [
                    'current_page' => $callLogs->currentPage(),
                    'last_page' => $callLogs->lastPage(),
                    'per_page' => $callLogs->perPage(),
                    'total' => $callLogs->total(),
                ],
            ]
        );
    }

    /**
     * Initiate a call via RingCentral
     */
    public function ringCentralInitiateCall(Request $request): JsonResponse
    {
        $request->validate([
            'to_number' => ['required', 'string'],
            'from_number' => ['nullable', 'string'],
        ]);

        $result = $this->ringCentralService->initiateCall(
            $request->input('to_number'),
            $request->input('from_number')
        );

        if (!$result['success']) {
            return $this->error($result['error'] ?? 'Failed to initiate call');
        }

        return $this->success($result, 'Call initiated');
    }

    /**
     * Send SMS via RingCentral
     */
    public function ringCentralSendSms(Request $request): JsonResponse
    {
        $request->validate([
            'to_number' => ['required', 'string'],
            'message' => ['required', 'string', 'max:1000'],
            'from_number' => ['nullable', 'string'],
        ]);

        $result = $this->ringCentralService->sendSms(
            $request->input('to_number'),
            $request->input('message'),
            $request->input('from_number')
        );

        if (!$result['success']) {
            return $this->error($result['error'] ?? 'Failed to send SMS');
        }

        return $this->success($result, 'SMS sent');
    }
}
