<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SiteSetting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
    ];

    /**
     * Cache key prefix
     */
    protected const CACHE_PREFIX = 'site_settings_';
    protected const CACHE_TTL = 3600; // 1 hour

    /**
     * Get a setting value
     */
    public static function getValue(string $group, string $key, $default = null)
    {
        $setting = static::where('group', $group)->where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return $setting->getCastedValue();
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $group, string $key, $value, string $type = 'string'): self
    {
        // If value is an array or object, encode it as JSON
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
            $type = 'json';
        }

        $setting = static::updateOrCreate(
            ['group' => $group, 'key' => $key],
            ['value' => $value, 'type' => $type]
        );

        // Clear cache for this group
        Cache::forget(static::CACHE_PREFIX . $group);

        return $setting;
    }

    /**
     * Get all settings for a group
     */
    public static function getGroup(string $group): array
    {
        return Cache::remember(
            static::CACHE_PREFIX . $group,
            static::CACHE_TTL,
            function () use ($group) {
                $settings = static::where('group', $group)->get();

                $result = [];
                foreach ($settings as $setting) {
                    $result[$setting->key] = $setting->getCastedValue();
                }

                return $result;
            }
        );
    }

    /**
     * Set multiple settings for a group
     */
    public static function setGroup(string $group, array $data): void
    {
        foreach ($data as $key => $value) {
            $type = 'string';
            if (is_bool($value)) {
                $type = 'boolean';
                $value = $value ? '1' : '0';
            } elseif (is_int($value)) {
                $type = 'integer';
            } elseif (is_array($value)) {
                $type = 'json';
                $value = json_encode($value);
            }

            static::updateOrCreate(
                ['group' => $group, 'key' => $key],
                ['value' => $value, 'type' => $type]
            );
        }

        // Clear cache for this group
        Cache::forget(static::CACHE_PREFIX . $group);
    }

    /**
     * Get the casted value based on type
     */
    public function getCastedValue()
    {
        return match ($this->type) {
            'boolean' => (bool) $this->value,
            'integer' => (int) $this->value,
            'json' => json_decode($this->value, true),
            'file' => $this->value ? Storage::url($this->value) : null,
            default => $this->value,
        };
    }

    /**
     * Store a file and return the path
     */
    public static function storeFile(string $group, string $key, $file): ?string
    {
        if (!$file) {
            return null;
        }

        // Delete old file if exists
        $oldSetting = static::where('group', $group)->where('key', $key)->first();
        if ($oldSetting && $oldSetting->value) {
            Storage::disk('public')->delete($oldSetting->value);
        }

        // Store new file
        $path = $file->store("settings/{$group}", 'public');

        static::setValue($group, $key, $path, 'file');

        return Storage::url($path);
    }

    /**
     * Clear all cache
     */
    public static function clearCache(): void
    {
        $groups = static::select('group')->distinct()->pluck('group');
        foreach ($groups as $group) {
            Cache::forget(static::CACHE_PREFIX . $group);
        }
    }

    /**
     * Get header settings with defaults
     */
    public static function getHeader(): array
    {
        $settings = static::getGroup('header');

        return array_merge([
            'logo_text' => 'Consultancy',
            'logo_image' => null,
            'nav_links' => [],
        ], $settings);
    }

    /**
     * Get theme settings with defaults
     */
    public static function getTheme(): array
    {
        $settings = static::getGroup('theme');

        return array_merge([
            'primary_900' => '#0d2240',
            'primary_800' => '#133a6b',
            'primary_700' => '#1a4f8c',
            'primary_600' => '#2563a8',
            'primary_500' => '#3b82c4',
            'primary_400' => '#60a5e0',
            'primary_100' => '#e8f2fc',
            'primary_50' => '#f4f9fe',
            'accent_yellow' => '#f4c430',
            'accent_yellow_light' => '#fef9e7',
            'cta_primary_bg' => '#f4c430',
            'cta_primary_text' => '#0d2240',
            'cta_primary_hover' => '#e6b62d',
            'font_heading' => '"Source Serif 4", Georgia, serif',
            'font_body' => 'Inter, -apple-system, sans-serif',
            'border_radius' => '8px',
        ], $settings);
    }

    /**
     * Get footer settings with defaults
     */
    public static function getFooter(): array
    {
        $settings = static::getGroup('footer');

        return array_merge([
            'company_name' => 'Consultancy',
            'description' => 'Strategic guidance for meaningful growth.',
            'copyright_text' => '© ' . date('Y') . ' Consultancy. All rights reserved.',
            'social_links' => [],
        ], $settings);
    }

    /**
     * Get home page content with defaults
     */
    public static function getHomePage(): array
    {
        $settings = static::getGroup('home');

        return array_merge([
            'hero' => [
                'title' => 'Strategic guidance for meaningful growth',
                'subtitle' => 'We partner with organisations and individuals to navigate complexity, develop robust strategies, and achieve lasting success through evidence-based approaches.',
                'cta_text' => 'Get in touch',
                'cta_link' => '/contact',
                'secondary_cta_text' => 'Learn more',
                'secondary_cta_link' => '/about',
                'background_image' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80',
            ],
            'pillars_section' => [
                'title' => 'Our Expertise',
                'subtitle' => 'Two distinct pillars of service, united by a commitment to excellence and evidence-based practice.',
            ],
            'faq_section' => [
                'title' => 'Frequently Asked Questions',
                'subtitle' => 'Find answers to common questions about our services.',
                'show_on_home' => true,
                'limit' => 6,
            ],
            'cta_section' => [
                'title' => 'Ready to begin?',
                'subtitle' => 'Contact us today to discuss how we can support your goals and help you achieve meaningful, sustainable outcomes.',
                'button_text' => 'Contact us',
                'button_link' => '/contact',
            ],
        ], $settings);
    }
}
