<?php

namespace App\Services\SuiteDash;

use App\Models\IntegrationLog;
use App\Models\IntegrationSetting;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class SuiteDashClient
{
    private ?string $baseUrl = null;
    private ?string $apiKey = null;
    private ?string $secretKey = null;
    private bool $isConfigured = false;

    public function __construct()
    {
        $this->loadConfiguration();
    }

    private function loadConfiguration(): void
    {
        $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_SUITEDASH);

        if (!$settings || !$settings->is_enabled || !$settings->isApiMode()) {
            return;
        }

        $credentials = $settings->credentials;
        if (!$credentials) {
            return;
        }

        $this->baseUrl = $credentials['api_url'] ?? config('services.suitedash.api_url');
        $this->apiKey = $credentials['api_key'] ?? null;
        $this->secretKey = $credentials['secret_key'] ?? null;

        $this->isConfigured = $this->baseUrl && $this->apiKey;
    }

    public function isConfigured(): bool
    {
        return $this->isConfigured;
    }

    private function client(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl)
            ->withHeaders([
                'X-API-KEY' => $this->apiKey,
                'X-SECRET-KEY' => $this->secretKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->timeout(30);
    }

    /**
     * Create or update a contact in SuiteDash
     * Note: Actual endpoint structure depends on SuiteDash API documentation
     */
    public function createOrUpdateContact(array $data, ?\Illuminate\Database\Eloquent\Model $related = null): array
    {
        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_SUITEDASH,
            'create_or_update_contact',
            $data,
            $related
        );

        $startTime = microtime(true);

        try {
            // TODO: Replace with actual SuiteDash API endpoint when available
            // This is a stub implementation based on common CRM API patterns
            $response = $this->client()->post('/contacts', [
                'first_name' => $data['first_name'] ?? '',
                'last_name' => $data['last_name'] ?? '',
                'email' => $data['email'] ?? '',
                'phone' => $data['phone'] ?? '',
                'notes' => $data['notes'] ?? '',
                'tags' => $data['tags'] ?? [],
                'custom_fields' => $data['custom_fields'] ?? [],
            ]);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $responseData = $response->json();
                $log->markSuccess($responseData, $response->status(), $durationMs);

                return [
                    'success' => true,
                    'external_id' => $responseData['id'] ?? $responseData['contact_id'] ?? null,
                    'data' => $responseData,
                ];
            }

            $log->markFailed(
                $response->body(),
                $response->json() ?? [],
                $response->status(),
                $durationMs
            );

            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $log->markFailed($e->getMessage(), [], null, $durationMs);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create a lead from contact submission
     */
    public function createLeadFromContactSubmission(array $data, ?\Illuminate\Database\Eloquent\Model $related = null): array
    {
        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_SUITEDASH,
            'create_lead',
            $data,
            $related
        );

        $startTime = microtime(true);

        try {
            // TODO: Replace with actual SuiteDash API endpoint
            $response = $this->client()->post('/leads', [
                'contact_id' => $data['contact_id'] ?? null,
                'source' => $data['source'] ?? 'website',
                'status' => $data['status'] ?? 'new',
                'pillar' => $data['pillar'] ?? null,
                'message' => $data['message'] ?? '',
                'metadata' => $data['metadata'] ?? [],
            ]);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $responseData = $response->json();
                $log->markSuccess($responseData, $response->status(), $durationMs);

                return [
                    'success' => true,
                    'external_id' => $responseData['id'] ?? $responseData['lead_id'] ?? null,
                    'data' => $responseData,
                ];
            }

            $log->markFailed(
                $response->body(),
                $response->json() ?? [],
                $response->status(),
                $durationMs
            );

            return [
                'success' => false,
                'error' => $response->body(),
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $log->markFailed($e->getMessage(), [], null, $durationMs);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Attach tags or category to a contact
     */
    public function attachTagOrCategory(string $contactId, array $tags, ?\Illuminate\Database\Eloquent\Model $related = null): array
    {
        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_SUITEDASH,
            'attach_tags',
            ['contact_id' => $contactId, 'tags' => $tags],
            $related
        );

        $startTime = microtime(true);

        try {
            // TODO: Replace with actual SuiteDash API endpoint
            $response = $this->client()->post("/contacts/{$contactId}/tags", [
                'tags' => $tags,
            ]);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $log->markSuccess($response->json() ?? [], $response->status(), $durationMs);
                return ['success' => true];
            }

            $log->markFailed(
                $response->body(),
                $response->json() ?? [],
                $response->status(),
                $durationMs
            );

            return [
                'success' => false,
                'error' => $response->body(),
            ];
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $log->markFailed($e->getMessage(), [], null, $durationMs);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test connection to SuiteDash API
     */
    public function testConnection(): array
    {
        if (!$this->isConfigured) {
            return [
                'success' => false,
                'message' => 'SuiteDash API is not configured',
            ];
        }

        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_SUITEDASH,
            'test_connection',
            []
        );

        $startTime = microtime(true);

        try {
            // TODO: Replace with actual SuiteDash API health/ping endpoint
            $response = $this->client()->get('/ping');

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $log->markSuccess($response->json() ?? [], $response->status(), $durationMs);

                $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_SUITEDASH);
                $settings?->updateTestResult(true, 'Connection successful');

                return [
                    'success' => true,
                    'message' => 'Connection successful',
                ];
            }

            $errorMessage = 'Connection failed: ' . $response->body();
            $log->markFailed($errorMessage, $response->json() ?? [], $response->status(), $durationMs);

            $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_SUITEDASH);
            $settings?->updateTestResult(false, $errorMessage);

            return [
                'success' => false,
                'message' => $errorMessage,
            ];
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $log->markFailed($e->getMessage(), [], null, $durationMs);

            $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_SUITEDASH);
            $settings?->updateTestResult(false, $e->getMessage());

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
