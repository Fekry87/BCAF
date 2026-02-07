<?php

namespace App\Services\RingCentral;

use App\Models\CallLog;
use App\Models\CallParticipant;
use App\Models\IntegrationSetting;
use App\Models\SmsMessage;

class RingCentralService
{
    private RingCentralClient $client;

    public function __construct(RingCentralClient $client)
    {
        $this->client = $client;
    }

    /**
     * Check if RingCentral integration is enabled
     */
    public function isEnabled(): bool
    {
        $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_RINGCENTRAL);

        return $settings?->is_enabled ?? false;
    }

    /**
     * Check if client is configured and has valid token
     */
    public function isConnected(): bool
    {
        return $this->client->isConfigured() && $this->client->hasValidToken();
    }

    /**
     * Get OAuth authorization URL
     */
    public function getAuthorizationUrl(): string
    {
        return $this->client->getAuthorizationUrl();
    }

    /**
     * Handle OAuth callback
     */
    public function handleOAuthCallback(string $code): array
    {
        $result = $this->client->exchangeCodeForToken($code);

        if ($result['success']) {
            // Enable the integration
            $settings = IntegrationSetting::getOrCreate(IntegrationSetting::PROVIDER_RINGCENTRAL);
            $settings->update([
                'is_enabled' => true,
                'last_tested_at' => now(),
                'last_test_success' => true,
                'last_test_message' => 'OAuth authorization successful',
            ]);
        }

        return $result;
    }

    /**
     * Initiate a call
     */
    public function initiateCall(string $toNumber, ?string $fromNumber = null): array
    {
        if (!$this->isConnected()) {
            return [
                'success' => false,
                'error' => 'RingCentral is not connected',
            ];
        }

        // If no from number provided, get the first available
        if (!$fromNumber) {
            $phoneNumbers = $this->getPhoneNumbers();
            if (!$phoneNumbers['success'] || empty($phoneNumbers['data']['records'] ?? [])) {
                return [
                    'success' => false,
                    'error' => 'No phone numbers available for calling',
                ];
            }
            $fromNumber = $phoneNumbers['data']['records'][0]['phoneNumber'];
        }

        return $this->client->initiateCall($fromNumber, $toNumber);
    }

    /**
     * Send SMS
     */
    public function sendSms(string $toNumber, string $message, ?string $fromNumber = null): array
    {
        if (!$this->isConnected()) {
            return [
                'success' => false,
                'error' => 'RingCentral is not connected',
            ];
        }

        // If no from number provided, get the first SMS-capable number
        if (!$fromNumber) {
            $phoneNumbers = $this->getPhoneNumbers();
            if (!$phoneNumbers['success']) {
                return [
                    'success' => false,
                    'error' => 'Failed to get phone numbers',
                ];
            }

            $smsCapableNumber = collect($phoneNumbers['data']['records'] ?? [])
                ->first(fn($n) => in_array('SmsSender', $n['features'] ?? []));

            if (!$smsCapableNumber) {
                return [
                    'success' => false,
                    'error' => 'No SMS-capable phone numbers available',
                ];
            }

            $fromNumber = $smsCapableNumber['phoneNumber'];
        }

        $result = $this->client->sendSms($fromNumber, $toNumber, $message);

        if ($result['success']) {
            // Store the message locally
            SmsMessage::create([
                'ringcentral_id' => $result['message_id'] ?? uniqid('sms_'),
                'direction' => 'outbound',
                'from_number' => $fromNumber,
                'to_number' => $toNumber,
                'content' => $message,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        }

        return $result;
    }

    /**
     * Get available phone numbers
     */
    public function getPhoneNumbers(): array
    {
        if (!$this->isConnected()) {
            return [
                'success' => false,
                'error' => 'RingCentral is not connected',
            ];
        }

        return $this->client->getPhoneNumbers();
    }

    /**
     * Sync call logs from RingCentral
     */
    public function syncCallLogs(?string $dateFrom = null): array
    {
        if (!$this->isConnected()) {
            return [
                'success' => false,
                'error' => 'RingCentral is not connected',
            ];
        }

        $params = [];
        if ($dateFrom) {
            $params['dateFrom'] = $dateFrom;
        }

        $result = $this->client->getCallLogs($params);

        if (!$result['success']) {
            return $result;
        }

        $records = $result['data']['records'] ?? [];
        $synced = 0;

        foreach ($records as $record) {
            $existing = CallLog::where('ringcentral_id', $record['id'])->exists();

            if ($existing) {
                continue;
            }

            $callLog = CallLog::create([
                'ringcentral_id' => $record['id'],
                'session_id' => $record['sessionId'] ?? null,
                'direction' => strtolower($record['direction'] ?? 'outbound'),
                'type' => strtolower($record['type'] ?? 'voice'),
                'action' => $record['action'] ?? null,
                'result' => $record['result'] ?? null,
                'start_time' => $record['startTime'] ?? now(),
                'duration' => $record['duration'] ?? 0,
                'from_data' => $record['from'] ?? null,
                'to_data' => $record['to'] ?? null,
                'recording_url' => $record['recording']['contentUri'] ?? null,
                'metadata' => $record,
            ]);

            // Store participants
            if (isset($record['from'])) {
                CallParticipant::create([
                    'call_log_id' => $callLog->id,
                    'phone_number' => $record['from']['phoneNumber'] ?? '',
                    'name' => $record['from']['name'] ?? null,
                    'location' => $record['from']['location'] ?? null,
                    'role' => 'from',
                ]);
            }

            if (isset($record['to'])) {
                CallParticipant::create([
                    'call_log_id' => $callLog->id,
                    'phone_number' => $record['to']['phoneNumber'] ?? '',
                    'name' => $record['to']['name'] ?? null,
                    'location' => $record['to']['location'] ?? null,
                    'role' => 'to',
                ]);
            }

            $synced++;
        }

        return [
            'success' => true,
            'total_records' => count($records),
            'synced' => $synced,
        ];
    }

    /**
     * Get call logs from local database
     */
    public function getLocalCallLogs(array $filters = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = CallLog::with('participants')->latest('start_time');

        if (isset($filters['direction'])) {
            $query->where('direction', $filters['direction']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['date_from'])) {
            $query->where('start_time', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('start_time', '<=', $filters['date_to']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Disconnect RingCentral
     */
    public function disconnect(): bool
    {
        $this->client->revokeToken();

        $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_RINGCENTRAL);
        if ($settings) {
            $settings->update([
                'is_enabled' => false,
                'last_test_success' => null,
                'last_test_message' => 'Disconnected',
            ]);
        }

        return true;
    }

    /**
     * Get connection status
     */
    public function getStatus(): array
    {
        $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_RINGCENTRAL);

        return [
            'configured' => $this->client->isConfigured(),
            'connected' => $this->isConnected(),
            'enabled' => $settings?->is_enabled ?? false,
            'last_tested_at' => $settings?->last_tested_at?->toIso8601String(),
            'last_test_success' => $settings?->last_test_success,
            'last_test_message' => $settings?->last_test_message,
        ];
    }
}
