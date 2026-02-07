<?php

namespace App\Services\RingCentral;

use App\Models\IntegrationLog;
use App\Models\IntegrationSetting;
use App\Models\RingCentralAccount;
use App\Models\RingCentralToken;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RingCentralClient
{
    private string $serverUrl;
    private string $clientId;
    private string $clientSecret;
    private ?string $redirectUri;
    private ?RingCentralToken $token = null;

    public function __construct()
    {
        $this->serverUrl = config('services.ringcentral.server_url', 'https://platform.ringcentral.com');
        $this->clientId = config('services.ringcentral.client_id', '');
        $this->clientSecret = config('services.ringcentral.client_secret', '');
        $this->redirectUri = config('services.ringcentral.redirect_uri');

        $this->loadToken();
    }

    private function loadToken(): void
    {
        $this->token = RingCentralToken::getLatest();
    }

    public function isConfigured(): bool
    {
        return !empty($this->clientId) && !empty($this->clientSecret);
    }

    public function hasValidToken(): bool
    {
        return $this->token && !$this->token->isExpired();
    }

    /**
     * Get OAuth authorization URL
     */
    public function getAuthorizationUrl(string $state = null): string
    {
        $params = [
            'response_type' => 'code',
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'state' => $state ?? bin2hex(random_bytes(16)),
            'scope' => 'ReadCallLog ReadMessages SMS RingOut',
        ];

        return $this->serverUrl . '/restapi/oauth/authorize?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for tokens
     */
    public function exchangeCodeForToken(string $code): array
    {
        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_RINGCENTRAL,
            'oauth_token_exchange',
            ['code' => substr($code, 0, 10) . '...']
        );

        $startTime = microtime(true);

        try {
            $response = Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->post($this->serverUrl . '/restapi/oauth/token', [
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                    'redirect_uri' => $this->redirectUri,
                ]);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $data = $response->json();
                $log->markSuccess(['token_type' => $data['token_type'] ?? null], $response->status(), $durationMs);

                $this->storeToken($data);

                return [
                    'success' => true,
                    'message' => 'Authorization successful',
                ];
            }

            $log->markFailed($response->body(), $response->json() ?? [], $response->status(), $durationMs);

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
     * Refresh access token
     */
    public function refreshToken(): bool
    {
        if (!$this->token || !$this->token->refresh_token) {
            return false;
        }

        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_RINGCENTRAL,
            'oauth_token_refresh',
            []
        );

        $startTime = microtime(true);

        try {
            $response = Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->post($this->serverUrl . '/restapi/oauth/token', [
                    'grant_type' => 'refresh_token',
                    'refresh_token' => $this->token->refresh_token,
                ]);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $data = $response->json();
                $log->markSuccess(['refreshed' => true], $response->status(), $durationMs);

                $this->storeToken($data);
                return true;
            }

            $log->markFailed($response->body(), $response->json() ?? [], $response->status(), $durationMs);
            return false;
        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $log->markFailed($e->getMessage(), [], null, $durationMs);

            return false;
        }
    }

    /**
     * Store token in database
     */
    private function storeToken(array $data): void
    {
        $account = RingCentralAccount::firstOrCreate(
            ['account_id' => $data['owner_id'] ?? 'default'],
            ['name' => 'Primary Account', 'status' => 'active']
        );

        // Delete old tokens for this account
        RingCentralToken::where('ringcentral_account_id', $account->id)->delete();

        $this->token = RingCentralToken::create([
            'ringcentral_account_id' => $account->id,
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'] ?? null,
            'token_type' => $data['token_type'] ?? 'Bearer',
            'expires_in' => $data['expires_in'] ?? 3600,
            'expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
            'scope' => $data['scope'] ?? null,
            'owner_id' => $data['owner_id'] ?? null,
        ]);
    }

    /**
     * Get authenticated HTTP client
     */
    private function client(): PendingRequest
    {
        if ($this->token && $this->token->isExpiringSoon()) {
            $this->refreshToken();
        }

        return Http::baseUrl($this->serverUrl . '/restapi/v1.0')
            ->withToken($this->token?->access_token ?? '')
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->timeout(30);
    }

    /**
     * Get account info
     */
    public function getAccountInfo(): array
    {
        return $this->apiRequest('GET', '/account/~');
    }

    /**
     * Initiate a RingOut call
     */
    public function initiateCall(string $fromNumber, string $toNumber): array
    {
        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_RINGCENTRAL,
            'ringout_call',
            ['from' => $this->maskPhone($fromNumber), 'to' => $this->maskPhone($toNumber)]
        );

        $startTime = microtime(true);

        try {
            $response = $this->client()->post('/account/~/extension/~/ring-out', [
                'from' => ['phoneNumber' => $fromNumber],
                'to' => ['phoneNumber' => $toNumber],
                'playPrompt' => true,
            ]);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $data = $response->json();
                $log->markSuccess($data, $response->status(), $durationMs);

                return [
                    'success' => true,
                    'call_id' => $data['id'] ?? null,
                    'status' => $data['status']['callStatus'] ?? null,
                    'data' => $data,
                ];
            }

            $log->markFailed($response->body(), $response->json() ?? [], $response->status(), $durationMs);

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
     * Send SMS message
     */
    public function sendSms(string $fromNumber, string $toNumber, string $message): array
    {
        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_RINGCENTRAL,
            'send_sms',
            [
                'from' => $this->maskPhone($fromNumber),
                'to' => $this->maskPhone($toNumber),
                'message_length' => strlen($message),
            ]
        );

        $startTime = microtime(true);

        try {
            $response = $this->client()->post('/account/~/extension/~/sms', [
                'from' => ['phoneNumber' => $fromNumber],
                'to' => [['phoneNumber' => $toNumber]],
                'text' => $message,
            ]);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $data = $response->json();
                $log->markSuccess(['message_id' => $data['id'] ?? null], $response->status(), $durationMs);

                return [
                    'success' => true,
                    'message_id' => $data['id'] ?? null,
                    'data' => $data,
                ];
            }

            $log->markFailed($response->body(), $response->json() ?? [], $response->status(), $durationMs);

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
     * Get call logs
     */
    public function getCallLogs(array $params = []): array
    {
        $queryParams = array_merge([
            'view' => 'Detailed',
            'perPage' => 100,
            'dateFrom' => now()->subDays(7)->toIso8601String(),
        ], $params);

        return $this->apiRequest('GET', '/account/~/extension/~/call-log', $queryParams);
    }

    /**
     * Get SMS messages
     */
    public function getMessages(array $params = []): array
    {
        $queryParams = array_merge([
            'messageType' => 'SMS',
            'perPage' => 100,
            'dateFrom' => now()->subDays(7)->toIso8601String(),
        ], $params);

        return $this->apiRequest('GET', '/account/~/extension/~/message-store', $queryParams);
    }

    /**
     * Get phone numbers for account
     */
    public function getPhoneNumbers(): array
    {
        return $this->apiRequest('GET', '/account/~/extension/~/phone-number');
    }

    /**
     * Generic API request
     */
    private function apiRequest(string $method, string $endpoint, array $data = []): array
    {
        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_RINGCENTRAL,
            'api_request',
            ['method' => $method, 'endpoint' => $endpoint]
        );

        $startTime = microtime(true);

        try {
            $request = $this->client();

            if ($method === 'GET') {
                $response = $request->get($endpoint, $data);
            } else {
                $response = $request->$method($endpoint, $data);
            }

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                $responseData = $response->json();
                $log->markSuccess(['records_count' => count($responseData['records'] ?? [])], $response->status(), $durationMs);

                return [
                    'success' => true,
                    'data' => $responseData,
                ];
            }

            $log->markFailed($response->body(), $response->json() ?? [], $response->status(), $durationMs);

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
     * Mask phone number for logging
     */
    private function maskPhone(string $phone): string
    {
        if (strlen($phone) < 6) {
            return '****';
        }

        return substr($phone, 0, 3) . '****' . substr($phone, -2);
    }

    /**
     * Revoke current token
     */
    public function revokeToken(): bool
    {
        if (!$this->token) {
            return true;
        }

        try {
            Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->post($this->serverUrl . '/restapi/oauth/revoke', [
                    'token' => $this->token->access_token,
                ]);

            $this->token->delete();
            $this->token = null;

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to revoke RingCentral token', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
