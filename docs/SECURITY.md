# Security Documentation

Security practices, guidelines, and implementation details for the Consultancy Platform.

## Table of Contents

- [Security Overview](#security-overview)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Input Validation](#input-validation)
- [XSS Prevention](#xss-prevention)
- [CSRF Protection](#csrf-protection)
- [Rate Limiting](#rate-limiting)
- [Password Security](#password-security)
- [Security Headers](#security-headers)
- [Audit Logging](#audit-logging)
- [Data Protection](#data-protection)
- [Vulnerability Reporting](#vulnerability-reporting)

## Security Overview

### Security Principles

1. **Defense in Depth** - Multiple security layers
2. **Least Privilege** - Minimal necessary access
3. **Fail Secure** - Safe defaults on errors
4. **Security by Design** - Built-in, not bolted-on

### Security Stack

| Layer | Implementation |
|-------|---------------|
| Transport | TLS 1.2+ (HTTPS only) |
| Headers | CSP, HSTS, X-Frame-Options |
| Auth | Laravel Sanctum (tokens) |
| Input | Sanitization + Validation |
| Output | Automatic escaping |
| Data | Parameterized queries |
| Logging | Audit trail |

## Authentication

### Token-Based Authentication

```php
// Login flow
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "token": "1|abc123..."
}

// Subsequent requests
Authorization: Bearer 1|abc123...
```

### Token Security

- Tokens are hashed before storage
- Tokens can be scoped to abilities
- Tokens can have expiration times
- Tokens are invalidated on logout

### Session Management

```php
// Configuration (config/session.php)
'lifetime' => 120,              // 2 hours
'expire_on_close' => false,
'encrypt' => true,              // Encrypted session data
'secure' => true,               // HTTPS only
'http_only' => true,            // No JavaScript access
'same_site' => 'strict',        // CSRF protection
```

## Authorization

### Role-Based Access

```php
// User model
public function isAdmin(): bool
{
    return $this->is_admin;
}

// Controller middleware
public function __construct()
{
    $this->middleware('auth:sanctum');
    $this->middleware('admin');  // Custom admin check
}
```

### Gate Definitions

```php
// AuthServiceProvider
Gate::define('manage-services', function (User $user) {
    return $user->isAdmin();
});

// Usage
if (Gate::allows('manage-services')) {
    // User can manage services
}
```

## Input Validation

### Request Validation

```php
class ContactSubmissionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'regex:/^[+]?[\d\s\-()]+$/'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
            'pillar_id' => ['nullable', 'exists:pillars,id'],
        ];
    }
}
```

### Sanitization Middleware

```php
// SanitizeInput middleware
public function handle(Request $request, Closure $next): Response
{
    $input = $request->all();

    array_walk_recursive($input, function (&$value) {
        if (is_string($value)) {
            // Remove null bytes
            $value = str_replace(chr(0), '', $value);

            // Encode HTML entities
            $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');

            // Trim whitespace
            $value = trim($value);
        }
    });

    $request->merge($input);

    return $next($request);
}
```

## XSS Prevention

### Backend Protection

1. **Input Sanitization**
   ```php
   // Middleware sanitizes all input
   $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
   ```

2. **Blade Escaping**
   ```blade
   {{ $userInput }}  <!-- Automatically escaped -->
   ```

3. **JSON Responses**
   ```php
   // Laravel automatically encodes JSON safely
   return response()->json($data);
   ```

### Frontend Protection

```typescript
// React automatically escapes output
<div>{userInput}</div>

// Sanitize before rendering HTML
import { sanitizeHtml } from '@/utils/security';
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
```

### Security Utility

```typescript
// utils/security.ts
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

export const validateXSS = (input: string): boolean => {
  const patterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];
  return !patterns.some(pattern => pattern.test(input));
};
```

## CSRF Protection

### Backend (Laravel)

```php
// Automatic CSRF token validation on state-changing requests
// Configured via Sanctum for SPA

// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS')),
```

### Frontend

```typescript
// Include CSRF token in requests
axios.defaults.withCredentials = true;

// Get CSRF cookie before login
await axios.get('/sanctum/csrf-cookie');
```

## Rate Limiting

### Configuration

```php
// routes/api.php

// Public API: 60 requests per minute
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->ip());
});

// Auth endpoints: 5 attempts per minute
RateLimiter::for('auth', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});

// Contact form: 5 submissions per hour
RateLimiter::for('contact', function (Request $request) {
    return Limit::perHour(5)->by($request->ip());
});
```

### Brute Force Protection

```php
// SecurityService
public function checkBruteForce(string $ip): bool
{
    $key = "login_attempts:{$ip}";
    $attempts = Cache::get($key, 0);

    if ($attempts >= $this->maxAttempts) {
        return false; // Blocked
    }

    return true;
}

public function recordFailedAttempt(string $ip): void
{
    $key = "login_attempts:{$ip}";
    $attempts = Cache::get($key, 0) + 1;
    Cache::put($key, $attempts, $this->lockoutDuration * 60);
}
```

## Password Security

### Password Requirements

```php
// SecurePassword rule
public function validate(string $attribute, mixed $value, Closure $fail): void
{
    $requirements = config('platform.security.password');

    if (strlen($value) < $requirements['min_length']) {
        $fail("Password must be at least {$requirements['min_length']} characters.");
    }

    if ($requirements['require_uppercase'] && !preg_match('/[A-Z]/', $value)) {
        $fail('Password must contain at least one uppercase letter.');
    }

    if ($requirements['require_lowercase'] && !preg_match('/[a-z]/', $value)) {
        $fail('Password must contain at least one lowercase letter.');
    }

    if ($requirements['require_numbers'] && !preg_match('/[0-9]/', $value)) {
        $fail('Password must contain at least one number.');
    }

    if ($requirements['require_symbols'] && !preg_match('/[^a-zA-Z0-9]/', $value)) {
        $fail('Password must contain at least one special character.');
    }
}
```

### Password Hashing

```php
// config/hashing.php
'driver' => 'bcrypt',
'bcrypt' => [
    'rounds' => env('BCRYPT_ROUNDS', 12),
],
```

## Security Headers

### Middleware Implementation

```php
// SecurityHeaders middleware
public function handle(Request $request, Closure $next): Response
{
    $response = $next($request);

    return $response
        // Prevent clickjacking
        ->header('X-Frame-Options', 'SAMEORIGIN')

        // Prevent MIME type sniffing
        ->header('X-Content-Type-Options', 'nosniff')

        // Enable XSS filter
        ->header('X-XSS-Protection', '1; mode=block')

        // Referrer policy
        ->header('Referrer-Policy', 'strict-origin-when-cross-origin')

        // Content Security Policy
        ->header('Content-Security-Policy', $this->csp())

        // HTTPS only
        ->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

protected function csp(): string
{
    return "default-src 'self'; " .
           "script-src 'self' 'unsafe-inline'; " .
           "style-src 'self' 'unsafe-inline'; " .
           "img-src 'self' data: https:; " .
           "font-src 'self'; " .
           "connect-src 'self'; " .
           "frame-ancestors 'self';";
}
```

## Audit Logging

### Audit Log Model

```php
// AuditLog model
class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    public static function log(
        string $action,
        ?int $userId = null,
        array $details = []
    ): self {
        return self::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'details' => $details,
        ]);
    }
}
```

### Logged Actions

| Action | Description |
|--------|-------------|
| `user.login` | User login attempt |
| `user.logout` | User logout |
| `user.password_change` | Password changed |
| `admin.service.create` | Service created |
| `admin.service.update` | Service updated |
| `admin.service.delete` | Service deleted |
| `contact.submit` | Contact form submission |
| `integration.sync` | External sync operation |

## Data Protection

### Sensitive Data Handling

```php
// Never log sensitive data
Log::info('User login', [
    'email' => $user->email,
    // 'password' => $password,  // NEVER log passwords
]);

// Redact in responses
protected function redactSensitiveData(array $data): array
{
    $sensitiveKeys = ['password', 'token', 'secret', 'api_key'];

    foreach ($sensitiveKeys as $key) {
        if (isset($data[$key])) {
            $data[$key] = '[REDACTED]';
        }
    }

    return $data;
}
```

### Database Encryption

```php
// Encrypt sensitive columns
protected $casts = [
    'api_key' => 'encrypted',
    'secret_key' => 'encrypted',
];
```

### File Upload Security

```php
// Validate file uploads
$request->validate([
    'file' => [
        'required',
        'file',
        'mimes:pdf,doc,docx,jpg,png',
        'max:10240',  // 10MB
    ],
]);

// Store securely
$path = $request->file('file')->store('uploads', 'private');
```

## Vulnerability Reporting

### Responsible Disclosure

If you discover a security vulnerability, please:

1. **Do NOT** create a public GitHub issue
2. Email security@consultancy-platform.com
3. Include detailed steps to reproduce
4. Allow 90 days for fix before disclosure

### Bug Bounty

We offer rewards for responsibly disclosed vulnerabilities:

| Severity | Reward |
|----------|--------|
| Critical | $500-$1000 |
| High | $200-$500 |
| Medium | $50-$200 |
| Low | Recognition |

### Security Contacts

- Security Team: security@consultancy-platform.com
- PGP Key: [Available on request]

---

For implementation details, see [Development Guide](./DEVELOPMENT.md).
