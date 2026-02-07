# Integration Guide

## SuiteDash CRM Integration

### Overview

The platform supports two modes for SuiteDash integration:

1. **API Mode**: Automatic synchronization via SuiteDash API
2. **Import Mode**: Manual CSV export for import into SuiteDash

### Mode A: API Mode Setup

#### Prerequisites
- SuiteDash account with API access
- API credentials (API Key and Secret Key)

#### Configuration Steps

1. **Obtain API Credentials**
   - Log into your SuiteDash account
   - Navigate to Settings > API
   - Generate or copy your API Key and Secret Key

2. **Configure Environment Variables**
   ```env
   SUITEDASH_MODE=api
   SUITEDASH_API_URL=https://app.suitedash.com/api/v1
   SUITEDASH_API_KEY=your_api_key
   SUITEDASH_SECRET_KEY=your_secret_key
   ```

3. **Enable Integration in Admin**
   - Log into the admin dashboard
   - Navigate to Integrations > SuiteDash
   - Select "API Mode"
   - Enter your credentials
   - Click "Test Connection" to verify
   - Enable the integration

#### How It Works

When a contact form is submitted:
1. The submission is saved to the local database
2. A background job is queued to sync with SuiteDash
3. The job creates/updates the contact in SuiteDash
4. The submission status is updated to "synced"
5. The external ID is stored for reference

#### API Methods (Stub Implementation)

The SuiteDash client implements the following methods:

```php
// Create or update a contact
$client->createOrUpdateContact([
    'first_name' => 'John',
    'last_name' => 'Doe',
    'email' => 'john@example.com',
    'phone' => '+1234567890',
    'notes' => 'Message content',
    'tags' => ['website-lead', 'business-consultancy'],
]);

// Create a lead
$client->createLeadFromContactSubmission([
    'contact_id' => 'SD-12345',
    'source' => 'website',
    'status' => 'new',
    'message' => 'Lead details',
]);

// Attach tags
$client->attachTagOrCategory('SD-12345', ['tag1', 'tag2']);
```

> **Note**: These are stub implementations. Update the endpoint URLs and payload structure based on actual SuiteDash API documentation.

### Mode B: Import Mode Setup

#### Configuration

```env
SUITEDASH_MODE=import
SUITEDASH_EXPORT_PATH=storage/app/exports/suitedash
```

#### Usage

1. **Generate Export**
   - Go to Admin > Integrations > SuiteDash
   - Click "Generate Export"
   - A CSV file is created with all unsynced contacts

2. **Download the CSV**
   - Click "View Export History"
   - Download the latest export file

3. **Import into SuiteDash**
   - Log into SuiteDash
   - Navigate to Contacts > Import
   - Upload the CSV file
   - Map the columns to SuiteDash fields

4. **Mark as Exported**
   - Optionally mark contacts as "synced" in the admin

#### CSV Format

The export includes the following columns:
- ID
- First Name
- Last Name
- Email
- Phone
- Company
- Service Interest
- Message
- Source
- Created Date
- Tags

---

## RingCentral Integration

### Overview

RingCentral integration enables:
- Click-to-call functionality from the contact page
- SMS messaging
- Call log synchronization

### App Setup

#### 1. Create a RingCentral App

1. Go to [RingCentral Developer Portal](https://developers.ringcentral.com/)
2. Create a new application
3. Select the following:
   - **App Type**: Server-side Web App
   - **Platform Type**: Server/Web
   - **Auth**: Authorization Code + Refresh Token

#### 2. Configure Permissions (Scopes)

Enable the following scopes:
- `ReadCallLog` - Read call history
- `ReadMessages` - Read SMS messages
- `SMS` - Send SMS messages
- `RingOut` - Initiate outbound calls

#### 3. Set OAuth Redirect URI

Add your redirect URI:
```
https://your-domain.com/api/integrations/ringcentral/callback
```

For local development:
```
http://localhost:8000/api/integrations/ringcentral/callback
```

#### 4. Configure Environment Variables

```env
RINGCENTRAL_CLIENT_ID=your_client_id
RINGCENTRAL_CLIENT_SECRET=your_client_secret
RINGCENTRAL_SERVER_URL=https://platform.ringcentral.com
RINGCENTRAL_REDIRECT_URI=http://localhost:8000/api/integrations/ringcentral/callback
```

For sandbox/testing:
```env
RINGCENTRAL_SERVER_URL=https://platform.devtest.ringcentral.com
```

### Authorization Flow

1. Admin goes to Integrations > RingCentral
2. Clicks "Connect RingCentral"
3. Redirected to RingCentral for authorization
4. After approval, redirected back with auth code
5. Backend exchanges code for access/refresh tokens
6. Tokens are encrypted and stored in database

### Available Features

#### Click-to-Call (RingOut)

```php
$ringCentralService->initiateCall(
    toNumber: '+1234567890',
    fromNumber: '+0987654321'  // Optional, uses first available
);
```

The call flow:
1. RingCentral calls your office phone
2. When answered, connects to the recipient

#### Send SMS

```php
$ringCentralService->sendSms(
    toNumber: '+1234567890',
    message: 'Your message here',
    fromNumber: '+0987654321'  // Optional, uses SMS-capable number
);
```

#### Sync Call Logs

```php
$ringCentralService->syncCallLogs(
    dateFrom: '2024-01-01T00:00:00Z'  // Optional
);
```

Syncs call history from RingCentral to local database.

### Webhook Setup (Optional)

To receive real-time notifications:

1. Register webhook in RingCentral Developer Portal
2. Set webhook URL: `https://your-domain.com/api/webhooks/ringcentral`
3. Configure verification token:
   ```env
   RINGCENTRAL_WEBHOOK_SECRET=your_webhook_secret
   ```

### Token Management

Tokens are automatically refreshed when:
- Token is about to expire (within 5 minutes)
- Any API call is made

If refresh fails, users need to re-authorize through the admin panel.

---

## Troubleshooting

### SuiteDash

**Connection test fails**
- Verify API URL is correct
- Check API key and secret are valid
- Ensure your SuiteDash plan includes API access

**Contacts not syncing**
- Check queue worker is running: `php artisan queue:work`
- Review integration logs in admin panel
- Check `integration_logs` table for errors

### RingCentral

**Authorization fails**
- Verify client ID and secret
- Check redirect URI matches exactly
- Ensure required scopes are enabled in app

**Calls not connecting**
- Verify phone numbers are in E.164 format
- Check RingCentral account has available numbers
- Review call logs for error messages

**SMS not sending**
- Ensure phone number is SMS-capable
- Check SMS scope is enabled
- Verify message content meets requirements

---

## Database Tables

### Integration Settings

```sql
CREATE TABLE integration_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider VARCHAR(255) UNIQUE,  -- 'suitedash' or 'ringcentral'
    is_enabled BOOLEAN DEFAULT FALSE,
    mode VARCHAR(50),              -- 'api' or 'import' for suitedash
    credentials JSON,              -- Encrypted credentials
    settings JSON,
    last_tested_at TIMESTAMP,
    last_test_success BOOLEAN,
    last_test_message TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Integration Logs

```sql
CREATE TABLE integration_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider VARCHAR(255),
    action VARCHAR(255),
    request_id VARCHAR(255),
    status ENUM('pending', 'success', 'failed'),
    related_type VARCHAR(255),
    related_id BIGINT,
    payload JSON,
    response JSON,
    error_message TEXT,
    http_status INT,
    duration_ms INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### RingCentral Tables

```sql
CREATE TABLE ringcentral_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    main_number VARCHAR(50),
    status VARCHAR(50),
    extensions JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE ringcentral_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ringcentral_account_id BIGINT,
    access_token TEXT,      -- Encrypted
    refresh_token TEXT,     -- Encrypted
    token_type VARCHAR(50),
    expires_in INT,
    expires_at TIMESTAMP,
    scope VARCHAR(255),
    owner_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE call_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ringcentral_id VARCHAR(255) UNIQUE,
    session_id VARCHAR(255),
    direction ENUM('inbound', 'outbound'),
    type ENUM('voice', 'fax', 'sms'),
    action VARCHAR(255),
    result VARCHAR(255),
    start_time TIMESTAMP,
    duration INT,
    from_data JSON,
    to_data JSON,
    recording_url VARCHAR(500),
    contact_submission_id BIGINT,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```
