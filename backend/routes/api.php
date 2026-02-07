<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\PillarController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\Admin\ContactSubmissionController;
use App\Http\Controllers\Api\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Api\Admin\IntegrationController;
use App\Http\Controllers\Api\Admin\PillarController as AdminPillarController;
use App\Http\Controllers\Api\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/

// Content & Settings (Public)
Route::prefix('content')->group(function () {
    Route::get('/header', [SettingsController::class, 'header']);
    Route::get('/theme', [SettingsController::class, 'theme']);
    Route::get('/footer', [SettingsController::class, 'footer']);
    Route::get('/pages/home', [SettingsController::class, 'homePage']);
    Route::get('/pages/about', [SettingsController::class, 'aboutPage']);
    Route::get('/pages/contact', [SettingsController::class, 'contactPage']);
});

// Pillars
Route::get('/pillars', [PillarController::class, 'index']);
Route::get('/pillars/{slug}', [PillarController::class, 'show']);
Route::get('/pillars/{slug}/services', [PillarController::class, 'services']);
Route::get('/pillars/{slug}/faqs', [PillarController::class, 'faqs']);

// Services
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/featured', [ServiceController::class, 'featured']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);

// FAQs
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/faqs/global', [FaqController::class, 'global']);

// Contact
Route::post('/contact', [ContactController::class, 'store']);

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        // Site Settings Management
        Route::prefix('content')->group(function () {
            Route::get('/header', [AdminSettingsController::class, 'getHeader']);
            Route::put('/header', [AdminSettingsController::class, 'updateHeader']);
            Route::post('/header/logo', [AdminSettingsController::class, 'uploadLogo']);
            Route::delete('/header/logo', [AdminSettingsController::class, 'removeLogo']);
            Route::get('/footer', [AdminSettingsController::class, 'getFooter']);
            Route::put('/footer', [AdminSettingsController::class, 'updateFooter']);
            Route::get('/pages/home', [AdminSettingsController::class, 'getHomePage']);
            Route::put('/pages/home', [AdminSettingsController::class, 'updateHomePage']);
            Route::get('/pages/about', [AdminSettingsController::class, 'getAboutPage']);
            Route::put('/pages/about', [AdminSettingsController::class, 'updateAboutPage']);
            Route::get('/pages/contact', [AdminSettingsController::class, 'getContactPage']);
            Route::put('/pages/contact', [AdminSettingsController::class, 'updateContactPage']);
        });

        // Theme Management
        Route::get('/theme', [AdminSettingsController::class, 'getTheme']);
        Route::put('/theme', [AdminSettingsController::class, 'updateTheme']);
        Route::post('/theme/reset', [AdminSettingsController::class, 'resetTheme']);

        // Pillars Management
        Route::apiResource('pillars', AdminPillarController::class);
        Route::post('/pillars/{pillar}/toggle-active', [AdminPillarController::class, 'toggleActive']);

        // Services Management
        Route::apiResource('services', AdminServiceController::class);
        Route::post('/services/{service}/toggle-active', [AdminServiceController::class, 'toggleActive']);
        Route::post('/services/reorder', [AdminServiceController::class, 'reorder']);

        // FAQs Management
        Route::apiResource('faqs', AdminFaqController::class);
        Route::post('/faqs/{faq}/toggle-active', [AdminFaqController::class, 'toggleActive']);
        Route::post('/faqs/reorder', [AdminFaqController::class, 'reorder']);

        // Contact Submissions
        Route::get('/contact-submissions', [ContactSubmissionController::class, 'index']);
        Route::get('/contact-submissions/stats', [ContactSubmissionController::class, 'stats']);
        Route::get('/contact-submissions/{contactSubmission}', [ContactSubmissionController::class, 'show']);
        Route::patch('/contact-submissions/{contactSubmission}/status', [ContactSubmissionController::class, 'updateStatus']);
        Route::post('/contact-submissions/{contactSubmission}/resync', [ContactSubmissionController::class, 'resync']);
        Route::delete('/contact-submissions/{contactSubmission}', [ContactSubmissionController::class, 'destroy']);

        // Integrations
        Route::get('/integrations', [IntegrationController::class, 'index']);
        Route::get('/integrations/logs', [IntegrationController::class, 'logs']);

        // SuiteDash Integration
        Route::prefix('integrations/suitedash')->group(function () {
            Route::get('/settings', [IntegrationController::class, 'suiteDashSettings']);
            Route::put('/settings', [IntegrationController::class, 'updateSuiteDashSettings']);
            Route::post('/test', [IntegrationController::class, 'testSuiteDashConnection']);
            Route::post('/export', [IntegrationController::class, 'generateSuiteDashExport']);
            Route::get('/exports', [IntegrationController::class, 'getSuiteDashExports']);
            Route::get('/exports/{filename}', [IntegrationController::class, 'downloadSuiteDashExport']);
        });

        // RingCentral Integration
        Route::prefix('integrations/ringcentral')->group(function () {
            Route::get('/status', [IntegrationController::class, 'ringCentralStatus']);
            Route::get('/auth-url', [IntegrationController::class, 'ringCentralAuthUrl']);
            Route::post('/callback', [IntegrationController::class, 'ringCentralCallback']);
            Route::post('/disconnect', [IntegrationController::class, 'ringCentralDisconnect']);
            Route::get('/phone-numbers', [IntegrationController::class, 'ringCentralPhoneNumbers']);
            Route::post('/sync-calls', [IntegrationController::class, 'syncRingCentralCallLogs']);
            Route::get('/call-logs', [IntegrationController::class, 'ringCentralCallLogs']);
            Route::post('/call', [IntegrationController::class, 'ringCentralInitiateCall']);
            Route::post('/sms', [IntegrationController::class, 'ringCentralSendSms']);
        });
    });
});

/*
|--------------------------------------------------------------------------
| RingCentral Webhook (Public)
|--------------------------------------------------------------------------
*/
Route::post('/webhooks/ringcentral', function () {
    // TODO: Implement webhook handler
    return response()->json(['status' => 'ok']);
});
