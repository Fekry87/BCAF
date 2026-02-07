<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SettingsController extends BaseController
{
    /**
     * Get header settings for admin
     */
    public function getHeader(): JsonResponse
    {
        return $this->success(SiteSetting::getHeader());
    }

    /**
     * Update header settings
     */
    public function updateHeader(Request $request): JsonResponse
    {
        $data = $request->validate([
            'logo_text' => 'nullable|string|max:100',
            'logo_image' => 'nullable|string|max:500',
            'nav_links' => 'nullable|array',
        ]);

        SiteSetting::setGroup('header', array_filter($data, fn($v) => $v !== null));

        return $this->success(SiteSetting::getHeader(), 'Header settings updated');
    }

    /**
     * Upload logo image
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,gif,svg,webp|max:2048',
        ]);

        $file = $request->file('logo');

        // Delete old logo if exists
        $oldSetting = SiteSetting::where('group', 'header')->where('key', 'logo_image')->first();
        if ($oldSetting && $oldSetting->value && !str_starts_with($oldSetting->value, 'http')) {
            Storage::disk('public')->delete($oldSetting->value);
        }

        // Store new logo
        $path = $file->store('logos', 'public');
        $url = Storage::url($path);

        // Save to settings
        SiteSetting::setValue('header', 'logo_image', $url, 'string');

        return $this->success([
            'url' => $url,
            'path' => $path,
        ], 'Logo uploaded successfully');
    }

    /**
     * Remove logo image
     */
    public function removeLogo(): JsonResponse
    {
        $setting = SiteSetting::where('group', 'header')->where('key', 'logo_image')->first();

        if ($setting && $setting->value && !str_starts_with($setting->value, 'http')) {
            // Extract path from URL
            $path = str_replace('/storage/', '', $setting->value);
            Storage::disk('public')->delete($path);
        }

        SiteSetting::setValue('header', 'logo_image', null);

        return $this->success(null, 'Logo removed successfully');
    }

    /**
     * Get theme settings for admin
     */
    public function getTheme(): JsonResponse
    {
        return $this->success(SiteSetting::getTheme());
    }

    /**
     * Update theme settings
     */
    public function updateTheme(Request $request): JsonResponse
    {
        $data = $request->validate([
            'primary_900' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'primary_800' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'primary_700' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'primary_600' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'primary_500' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'primary_400' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'primary_100' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'primary_50' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'accent_yellow' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'accent_yellow_light' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'cta_primary_bg' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'cta_primary_text' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'cta_primary_hover' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'font_heading' => 'nullable|string|max:200',
            'font_body' => 'nullable|string|max:200',
            'border_radius' => 'nullable|string|max:20',
        ]);

        SiteSetting::setGroup('theme', array_filter($data, fn($v) => $v !== null));

        return $this->success(SiteSetting::getTheme(), 'Theme settings updated');
    }

    /**
     * Reset theme to defaults
     */
    public function resetTheme(): JsonResponse
    {
        // Delete all theme settings
        SiteSetting::where('group', 'theme')->delete();
        SiteSetting::clearCache();

        return $this->success(SiteSetting::getTheme(), 'Theme reset to defaults');
    }

    /**
     * Get footer settings for admin
     */
    public function getFooter(): JsonResponse
    {
        return $this->success(SiteSetting::getFooter());
    }

    /**
     * Update footer settings
     */
    public function updateFooter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'copyright_text' => 'nullable|string|max:200',
            'social_links' => 'nullable|array',
        ]);

        SiteSetting::setGroup('footer', array_filter($data, fn($v) => $v !== null));

        return $this->success(SiteSetting::getFooter(), 'Footer settings updated');
    }

    /**
     * Get home page settings for admin
     */
    public function getHomePage(): JsonResponse
    {
        return $this->success(SiteSetting::getHomePage());
    }

    /**
     * Update home page settings
     */
    public function updateHomePage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'hero' => 'nullable|array',
            'hero.title' => 'nullable|string|max:200',
            'hero.subtitle' => 'nullable|string|max:500',
            'hero.cta_text' => 'nullable|string|max:50',
            'hero.cta_link' => 'nullable|string|max:200',
            'hero.secondary_cta_text' => 'nullable|string|max:50',
            'hero.secondary_cta_link' => 'nullable|string|max:200',
            'hero.background_image' => 'nullable|string|max:500',
            'pillars_section' => 'nullable|array',
            'pillars_section.title' => 'nullable|string|max:100',
            'pillars_section.subtitle' => 'nullable|string|max:300',
            'faq_section' => 'nullable|array',
            'faq_section.title' => 'nullable|string|max:100',
            'faq_section.subtitle' => 'nullable|string|max:300',
            'faq_section.show_on_home' => 'nullable|boolean',
            'faq_section.limit' => 'nullable|integer|min:1|max:20',
            'cta_section' => 'nullable|array',
            'cta_section.title' => 'nullable|string|max:100',
            'cta_section.subtitle' => 'nullable|string|max:300',
            'cta_section.button_text' => 'nullable|string|max:50',
            'cta_section.button_link' => 'nullable|string|max:200',
        ]);

        // Get current settings
        $current = SiteSetting::getHomePage();

        // Merge with new data
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $current[$key] = array_merge($current[$key] ?? [], $value);
            } else {
                $current[$key] = $value;
            }
        }

        // Save each section
        foreach ($current as $key => $value) {
            SiteSetting::setValue('home', $key, $value, 'json');
        }

        return $this->success(SiteSetting::getHomePage(), 'Home page settings updated');
    }

    /**
     * Get about page settings for admin
     */
    public function getAboutPage(): JsonResponse
    {
        $settings = SiteSetting::getGroup('about');

        return $this->success(array_merge([
            'title' => 'About Us',
            'subtitle' => 'Learn more about our mission and values.',
            'content' => '',
            'team' => [],
            'values' => [],
        ], $settings));
    }

    /**
     * Update about page settings
     */
    public function updateAboutPage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:100',
            'subtitle' => 'nullable|string|max:300',
            'content' => 'nullable|string',
            'team' => 'nullable|array',
            'values' => 'nullable|array',
        ]);

        SiteSetting::setGroup('about', array_filter($data, fn($v) => $v !== null));

        return $this->success(SiteSetting::getGroup('about'), 'About page settings updated');
    }

    /**
     * Get contact page settings for admin
     */
    public function getContactPage(): JsonResponse
    {
        $settings = SiteSetting::getGroup('contact');

        return $this->success(array_merge([
            'title' => 'Contact Us',
            'subtitle' => 'Get in touch with our team.',
            'email' => '',
            'phone' => '',
            'address' => '',
            'office_hours' => '',
        ], $settings));
    }

    /**
     * Update contact page settings
     */
    public function updateContactPage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:100',
            'subtitle' => 'nullable|string|max:300',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:300',
            'office_hours' => 'nullable|string|max:200',
        ]);

        SiteSetting::setGroup('contact', array_filter($data, fn($v) => $v !== null));

        return $this->success(SiteSetting::getGroup('contact'), 'Contact page settings updated');
    }

    /**
     * Get all settings (for debugging/export)
     */
    public function all(): JsonResponse
    {
        return $this->success([
            'header' => SiteSetting::getHeader(),
            'theme' => SiteSetting::getTheme(),
            'footer' => SiteSetting::getFooter(),
            'home' => SiteSetting::getHomePage(),
        ]);
    }
}
