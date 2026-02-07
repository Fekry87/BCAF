<?php

namespace App\Http\Controllers\Api;

use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends BaseController
{
    /**
     * Get header content (public)
     */
    public function header(): JsonResponse
    {
        return $this->success(SiteSetting::getHeader());
    }

    /**
     * Get theme settings (public)
     */
    public function theme(): JsonResponse
    {
        return $this->success(SiteSetting::getTheme());
    }

    /**
     * Get footer content (public)
     */
    public function footer(): JsonResponse
    {
        return $this->success(SiteSetting::getFooter());
    }

    /**
     * Get home page content (public)
     */
    public function homePage(): JsonResponse
    {
        return $this->success(SiteSetting::getHomePage());
    }

    /**
     * Get about page content (public)
     */
    public function aboutPage(): JsonResponse
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
     * Get contact page content (public)
     */
    public function contactPage(): JsonResponse
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
}
