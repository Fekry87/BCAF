<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | SuiteDash CRM Integration
    |--------------------------------------------------------------------------
    */

    'suitedash' => [
        'api_url' => env('SUITEDASH_API_URL', 'https://app.suitedash.com/api/v1'),
        'api_key' => env('SUITEDASH_API_KEY'),
        'secret_key' => env('SUITEDASH_SECRET_KEY'),
        'mode' => env('SUITEDASH_MODE', 'import'),
        'export_path' => env('SUITEDASH_EXPORT_PATH', 'exports/suitedash'),
    ],

    /*
    |--------------------------------------------------------------------------
    | RingCentral Integration
    |--------------------------------------------------------------------------
    */

    'ringcentral' => [
        'client_id' => env('RINGCENTRAL_CLIENT_ID'),
        'client_secret' => env('RINGCENTRAL_CLIENT_SECRET'),
        'server_url' => env('RINGCENTRAL_SERVER_URL', 'https://platform.ringcentral.com'),
        'redirect_uri' => env('RINGCENTRAL_REDIRECT_URI'),
        'jwt_token' => env('RINGCENTRAL_JWT_TOKEN'),
        'webhook_secret' => env('RINGCENTRAL_WEBHOOK_SECRET'),
    ],

];
