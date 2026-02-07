<?php

namespace App\Services\SuiteDash;

use App\Models\ContactSubmission;
use App\Models\IntegrationLog;
use App\Models\IntegrationSetting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class SuiteDashExporter
{
    private string $exportPath;

    public function __construct()
    {
        $this->exportPath = config('services.suitedash.export_path', 'exports/suitedash');
    }

    /**
     * Generate CSV export for SuiteDash import
     */
    public function generateCsvExport(bool $onlyUnsynced = true): array
    {
        $query = ContactSubmission::with('pillar');

        if ($onlyUnsynced) {
            $query->unsynced();
        }

        $submissions = $query->orderBy('created_at')->get();

        if ($submissions->isEmpty()) {
            return [
                'success' => true,
                'message' => 'No contacts to export',
                'count' => 0,
                'file_path' => null,
            ];
        }

        $log = IntegrationLog::logRequest(
            IntegrationSetting::PROVIDER_SUITEDASH,
            'csv_export',
            ['count' => $submissions->count(), 'only_unsynced' => $onlyUnsynced]
        );

        try {
            $csvContent = $this->buildCsvContent($submissions);
            $filename = $this->generateFilename();
            $fullPath = $this->exportPath . '/' . $filename;

            Storage::put($fullPath, $csvContent);

            $log->markSuccess([
                'count' => $submissions->count(),
                'filename' => $filename,
            ]);

            return [
                'success' => true,
                'message' => "Exported {$submissions->count()} contacts",
                'count' => $submissions->count(),
                'file_path' => $fullPath,
                'filename' => $filename,
            ];
        } catch (\Exception $e) {
            $log->markFailed($e->getMessage());

            return [
                'success' => false,
                'message' => $e->getMessage(),
                'count' => 0,
                'file_path' => null,
            ];
        }
    }

    /**
     * Build CSV content from contact submissions
     */
    private function buildCsvContent(Collection $submissions): string
    {
        $headers = [
            'ID',
            'First Name',
            'Last Name',
            'Email',
            'Phone',
            'Company',
            'Service Interest',
            'Message',
            'Source',
            'Created Date',
            'Tags',
        ];

        $lines = [];
        $lines[] = $this->csvLine($headers);

        foreach ($submissions as $submission) {
            $nameParts = $this->parseFullName($submission->name);

            $lines[] = $this->csvLine([
                $submission->id,
                $nameParts['first_name'],
                $nameParts['last_name'],
                $submission->email,
                $submission->phone ?? '',
                '', // Company - not collected
                $submission->pillar?->name ?? 'General',
                $this->sanitizeForCsv($submission->message),
                $submission->source,
                $submission->created_at->format('Y-m-d H:i:s'),
                $this->generateTags($submission),
            ]);
        }

        return implode("\n", $lines);
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
     * Generate tags based on submission data
     */
    private function generateTags(ContactSubmission $submission): string
    {
        $tags = ['website-lead'];

        if ($submission->pillar) {
            $tags[] = strtolower(str_replace(' ', '-', $submission->pillar->name));
        }

        return implode(';', $tags);
    }

    /**
     * Sanitize text for CSV output
     */
    private function sanitizeForCsv(string $text): string
    {
        // Remove or replace problematic characters
        $text = str_replace(["\r\n", "\r", "\n"], ' ', $text);
        $text = str_replace('"', '""', $text);

        return $text;
    }

    /**
     * Convert array to CSV line
     */
    private function csvLine(array $fields): string
    {
        $escaped = array_map(function ($field) {
            if (str_contains($field, ',') || str_contains($field, '"') || str_contains($field, "\n")) {
                return '"' . str_replace('"', '""', $field) . '"';
            }
            return $field;
        }, $fields);

        return implode(',', $escaped);
    }

    /**
     * Generate unique filename for export
     */
    private function generateFilename(): string
    {
        return 'suitedash_contacts_' . date('Y-m-d_His') . '.csv';
    }

    /**
     * Mark submissions as exported
     */
    public function markAsExported(array $submissionIds): void
    {
        ContactSubmission::whereIn('id', $submissionIds)
            ->update([
                'status' => ContactSubmission::STATUS_SYNCED,
                'synced_at' => now(),
            ]);
    }

    /**
     * Get list of available export files
     */
    public function getExportFiles(): array
    {
        $files = Storage::files($this->exportPath);

        return collect($files)
            ->filter(fn($file) => str_ends_with($file, '.csv'))
            ->map(function ($file) {
                return [
                    'path' => $file,
                    'filename' => basename($file),
                    'size' => Storage::size($file),
                    'modified_at' => date('Y-m-d H:i:s', Storage::lastModified($file)),
                ];
            })
            ->sortByDesc('modified_at')
            ->values()
            ->toArray();
    }

    /**
     * Download export file content
     */
    public function getExportContent(string $filename): ?string
    {
        $path = $this->exportPath . '/' . $filename;

        if (!Storage::exists($path)) {
            return null;
        }

        return Storage::get($path);
    }

    /**
     * Delete old export files
     */
    public function cleanupOldExports(int $daysToKeep = 30): int
    {
        $files = Storage::files($this->exportPath);
        $deleted = 0;
        $cutoff = now()->subDays($daysToKeep)->timestamp;

        foreach ($files as $file) {
            if (Storage::lastModified($file) < $cutoff) {
                Storage::delete($file);
                $deleted++;
            }
        }

        return $deleted;
    }
}
