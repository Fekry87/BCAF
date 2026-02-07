<?php

namespace App\Services\SuiteDash;

use App\Models\ContactSubmission;
use App\Models\IntegrationSetting;

class SuiteDashService
{
    private SuiteDashClient $client;
    private SuiteDashExporter $exporter;

    public function __construct(SuiteDashClient $client, SuiteDashExporter $exporter)
    {
        $this->client = $client;
        $this->exporter = $exporter;
    }

    /**
     * Get current integration mode
     */
    public function getMode(): string
    {
        $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_SUITEDASH);

        return $settings?->mode ?? 'import';
    }

    /**
     * Check if integration is enabled
     */
    public function isEnabled(): bool
    {
        $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_SUITEDASH);

        return $settings?->is_enabled ?? false;
    }

    /**
     * Sync a contact submission based on current mode
     */
    public function syncContactSubmission(ContactSubmission $submission): array
    {
        if (!$this->isEnabled()) {
            return [
                'success' => false,
                'message' => 'SuiteDash integration is not enabled',
            ];
        }

        $mode = $this->getMode();

        if ($mode === 'api') {
            return $this->syncViaApi($submission);
        }

        // In import mode, we don't sync automatically
        // Contacts are exported via CSV
        return [
            'success' => true,
            'message' => 'Import mode - contact will be included in next CSV export',
            'mode' => 'import',
        ];
    }

    /**
     * Sync contact via API mode
     */
    private function syncViaApi(ContactSubmission $submission): array
    {
        if (!$this->client->isConfigured()) {
            return [
                'success' => false,
                'message' => 'SuiteDash API is not configured',
            ];
        }

        $nameParts = $this->parseFullName($submission->name);

        // Create or update contact
        $contactResult = $this->client->createOrUpdateContact([
            'first_name' => $nameParts['first_name'],
            'last_name' => $nameParts['last_name'],
            'email' => $submission->email,
            'phone' => $submission->phone,
            'notes' => $submission->message,
            'tags' => $this->generateTags($submission),
            'custom_fields' => [
                'source' => $submission->source,
                'pillar' => $submission->pillar?->name,
                'submitted_at' => $submission->created_at->toIso8601String(),
            ],
        ], $submission);

        if (!$contactResult['success']) {
            $submission->markAsFailed();

            return [
                'success' => false,
                'message' => 'Failed to create contact: ' . ($contactResult['error'] ?? 'Unknown error'),
            ];
        }

        $externalId = $contactResult['external_id'];

        // Create lead from the contact
        $leadResult = $this->client->createLeadFromContactSubmission([
            'contact_id' => $externalId,
            'source' => $submission->source,
            'status' => 'new',
            'pillar' => $submission->pillar?->name,
            'message' => $submission->message,
            'metadata' => [
                'submission_id' => $submission->id,
                'ip_address' => $submission->ip_address,
            ],
        ], $submission);

        // Even if lead creation fails, we have the contact
        $submission->markAsSynced($externalId);

        return [
            'success' => true,
            'message' => 'Contact synced successfully',
            'external_id' => $externalId,
            'lead_created' => $leadResult['success'] ?? false,
        ];
    }

    /**
     * Generate CSV export
     */
    public function generateExport(bool $onlyUnsynced = true): array
    {
        return $this->exporter->generateCsvExport($onlyUnsynced);
    }

    /**
     * Get available export files
     */
    public function getExportFiles(): array
    {
        return $this->exporter->getExportFiles();
    }

    /**
     * Get export file content
     */
    public function getExportContent(string $filename): ?string
    {
        return $this->exporter->getExportContent($filename);
    }

    /**
     * Test API connection
     */
    public function testConnection(): array
    {
        $mode = $this->getMode();

        if ($mode === 'import') {
            // For import mode, validate configuration instead
            $settings = IntegrationSetting::forProvider(IntegrationSetting::PROVIDER_SUITEDASH);

            if ($settings && $settings->is_enabled) {
                $settings->updateTestResult(true, 'Import mode configured successfully');

                return [
                    'success' => true,
                    'message' => 'Import mode configured successfully',
                    'mode' => 'import',
                ];
            }

            return [
                'success' => false,
                'message' => 'Integration is not enabled',
            ];
        }

        return $this->client->testConnection();
    }

    /**
     * Update integration settings
     */
    public function updateSettings(array $data): IntegrationSetting
    {
        $settings = IntegrationSetting::getOrCreate(IntegrationSetting::PROVIDER_SUITEDASH);

        $updateData = [
            'is_enabled' => $data['is_enabled'] ?? $settings->is_enabled,
            'mode' => $data['mode'] ?? $settings->mode,
        ];

        if (isset($data['credentials'])) {
            $updateData['credentials'] = $data['credentials'];
        }

        if (isset($data['settings'])) {
            $updateData['settings'] = array_merge($settings->settings ?? [], $data['settings']);
        }

        $settings->update($updateData);

        return $settings->fresh();
    }

    /**
     * Parse full name into first and last name
     */
    private function parseFullName(string $fullName): array
    {
        $parts = explode(' ', trim($fullName), 2);

        return [
            'first_name' => $parts[0] ?? '',
            'last_name' => $parts[1] ?? '',
        ];
    }

    /**
     * Generate tags for contact
     */
    private function generateTags(ContactSubmission $submission): array
    {
        $tags = ['website-lead'];

        if ($submission->pillar) {
            $tags[] = strtolower(str_replace(' ', '-', $submission->pillar->name));
        }

        return $tags;
    }
}
