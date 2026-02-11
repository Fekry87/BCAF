# API Documentation

Complete API reference for the Consultancy Platform.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Rate Limiting](#rate-limiting)
- [Public Endpoints](#public-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Health & Monitoring](#health--monitoring)
- [Error Codes](#error-codes)

## Overview

### Base URL

```
Production: https://api.consultancy-platform.com/api
Staging:    https://staging-api.consultancy-platform.com/api
Development: http://localhost:8000/api
```

### API Versioning

The API supports versioning through URL prefixes:

```
/api/v1/pillars    # Version 1 endpoints
/api/pillars       # Current/default version
```

### Content Type

All requests must include:
```
Content-Type: application/json
Accept: application/json
```

## Authentication

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "token": "1|abc123def456..."
  },
  "message": "Login successful"
}
```

### Using Authentication

Include the token in subsequent requests:
```
Authorization: Bearer 1|abc123def456...
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Get Current User

```http
GET /api/auth/user
Authorization: Bearer {token}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "api_version": "v1"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "message": "Success",
  "meta": {
    "api_version": "v1",
    "pagination": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 15,
      "total": 73,
      "from": 1,
      "to": 15
    }
  },
  "links": {
    "first": "https://api.example.com/api/items?page=1",
    "last": "https://api.example.com/api/items?page=5",
    "prev": null,
    "next": "https://api.example.com/api/items?page=2"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "name": ["The name must be at least 2 characters."]
  },
  "meta": {
    "api_version": "v1"
  }
}
```

## Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Public API | 60 requests | per minute |
| Auth endpoints | 5 requests | per minute |
| Contact form | 5 submissions | per hour |
| Admin API | 120 requests | per minute |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1699876543
```

## Public Endpoints

### Pillars

#### List All Pillars

```http
GET /api/pillars
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Business Consultancy",
      "slug": "business-consultancy",
      "description": "Expert business consulting services",
      "icon": "briefcase",
      "color": "#1a365d",
      "services_count": 12
    }
  ]
}
```

#### Get Pillar by Slug

```http
GET /api/pillars/{slug}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Business Consultancy",
    "slug": "business-consultancy",
    "description": "Expert business consulting services",
    "icon": "briefcase",
    "color": "#1a365d",
    "services": [ ... ]
  }
}
```

#### Get Pillar Services

```http
GET /api/pillars/{slug}/services
```

#### Get Pillar FAQs

```http
GET /api/pillars/{slug}/faqs
```

### Services

#### List All Services

```http
GET /api/services
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `pillar_id` | integer | Filter by pillar |
| `type` | string | `one_off` or `subscription` |
| `featured` | boolean | Only featured services |
| `per_page` | integer | Items per page (default: 15) |

#### Get Featured Services

```http
GET /api/services/featured
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Max 12 (default: 6) |

#### Get Service by Slug

```http
GET /api/services/{slug}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Business Strategy",
    "slug": "business-strategy",
    "short_description": "Strategic planning services",
    "full_description": "Comprehensive strategic planning...",
    "icon": "target",
    "pricing_type": "one_off",
    "price": 500.00,
    "price_formatted": "$500.00",
    "price_unit": "per session",
    "is_featured": true,
    "features": ["Feature 1", "Feature 2"],
    "pillar": {
      "id": 1,
      "name": "Business Consultancy",
      "slug": "business-consultancy"
    }
  }
}
```

### FAQs

#### List All FAQs

```http
GET /api/faqs
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |

#### Get Global FAQs

```http
GET /api/faqs/global
```

### Contact Form

#### Submit Contact Form

```http
POST /api/contact
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "ACME Inc",
  "message": "I would like to inquire about...",
  "pillar_id": 1,
  "source": "website"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `name` | Required, 2-100 characters |
| `email` | Required, valid email |
| `phone` | Optional, valid phone format |
| `company` | Optional, max 100 characters |
| `message` | Required, 10-2000 characters |
| `pillar_id` | Optional, must exist |
| `source` | Optional, default: "website" |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "new"
  },
  "message": "Thank you for your message. We will be in touch soon!"
}
```

### Content & Settings

#### Get Header Settings

```http
GET /api/content/header
```

#### Get Footer Settings

```http
GET /api/content/footer
```

#### Get Theme Settings

```http
GET /api/content/theme
```

#### Get Page Content

```http
GET /api/content/pages/home
GET /api/content/pages/about
GET /api/content/pages/contact
```

## Admin Endpoints

All admin endpoints require authentication.

### Pillars Management

```http
GET    /api/admin/pillars              # List all
POST   /api/admin/pillars              # Create
GET    /api/admin/pillars/{id}         # Get one
PUT    /api/admin/pillars/{id}         # Update
DELETE /api/admin/pillars/{id}         # Delete
POST   /api/admin/pillars/{id}/toggle-active  # Toggle status
```

**Create/Update Pillar:**
```json
{
  "name": "Business Consultancy",
  "slug": "business-consultancy",
  "description": "Expert consulting services",
  "icon": "briefcase",
  "color": "#1a365d",
  "is_active": true,
  "sort_order": 1
}
```

### Services Management

```http
GET    /api/admin/services              # List all
POST   /api/admin/services              # Create
GET    /api/admin/services/{id}         # Get one
PUT    /api/admin/services/{id}         # Update
DELETE /api/admin/services/{id}         # Delete
POST   /api/admin/services/{id}/toggle-active  # Toggle status
POST   /api/admin/services/reorder      # Reorder services
```

**Create/Update Service:**
```json
{
  "name": "Business Strategy",
  "pillar_id": 1,
  "short_description": "Strategic planning",
  "full_description": "Comprehensive strategic planning...",
  "icon": "target",
  "pricing_type": "one_off",
  "price": 500.00,
  "price_unit": "per session",
  "is_active": true,
  "is_featured": true,
  "features": ["Feature 1", "Feature 2"]
}
```

### FAQs Management

```http
GET    /api/admin/faqs              # List all
POST   /api/admin/faqs              # Create
GET    /api/admin/faqs/{id}         # Get one
PUT    /api/admin/faqs/{id}         # Update
DELETE /api/admin/faqs/{id}         # Delete
POST   /api/admin/faqs/{id}/toggle-active  # Toggle status
POST   /api/admin/faqs/reorder      # Reorder FAQs
```

### Contact Submissions

```http
GET    /api/admin/contact-submissions           # List all
GET    /api/admin/contact-submissions/stats     # Get statistics
GET    /api/admin/contact-submissions/{id}      # Get one
PATCH  /api/admin/contact-submissions/{id}/status  # Update status
POST   /api/admin/contact-submissions/{id}/resync  # Retry sync
DELETE /api/admin/contact-submissions/{id}      # Delete
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `new`, `synced`, `failed` |
| `pillar_id` | integer | Filter by pillar |
| `source` | string | Filter by source |
| `date_from` | date | Start date |
| `date_to` | date | End date |
| `search` | string | Search name/email |

### Content Management

```http
GET /api/admin/content/header
PUT /api/admin/content/header
POST /api/admin/content/header/logo
DELETE /api/admin/content/header/logo

GET /api/admin/content/footer
PUT /api/admin/content/footer

GET /api/admin/content/pages/home
PUT /api/admin/content/pages/home

GET /api/admin/content/pages/about
PUT /api/admin/content/pages/about

GET /api/admin/content/pages/contact
PUT /api/admin/content/pages/contact
```

### Theme Management

```http
GET  /api/admin/theme         # Get theme settings
PUT  /api/admin/theme         # Update theme
POST /api/admin/theme/reset   # Reset to defaults
```

### Integrations

#### SuiteDash

```http
GET  /api/admin/integrations/suitedash/settings
PUT  /api/admin/integrations/suitedash/settings
POST /api/admin/integrations/suitedash/test
POST /api/admin/integrations/suitedash/export
GET  /api/admin/integrations/suitedash/exports
GET  /api/admin/integrations/suitedash/exports/{filename}
```

#### RingCentral

```http
GET  /api/admin/integrations/ringcentral/status
GET  /api/admin/integrations/ringcentral/auth-url
POST /api/admin/integrations/ringcentral/callback
POST /api/admin/integrations/ringcentral/disconnect
GET  /api/admin/integrations/ringcentral/phone-numbers
POST /api/admin/integrations/ringcentral/sync-calls
GET  /api/admin/integrations/ringcentral/call-logs
POST /api/admin/integrations/ringcentral/call
POST /api/admin/integrations/ringcentral/sms
```

## Health & Monitoring

### Health Checks

```http
GET /api/health           # Basic health check
GET /api/health/detailed  # Detailed system status
GET /api/health/ready     # Kubernetes readiness probe
GET /api/health/live      # Kubernetes liveness probe
```

**Basic Health Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

**Detailed Health Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "latency_ms": 2.5,
      "connection": "mysql"
    },
    "cache": {
      "status": "healthy",
      "latency_ms": 0.8,
      "driver": "redis"
    },
    "redis": {
      "status": "healthy",
      "latency_ms": 0.5
    },
    "storage": {
      "status": "healthy",
      "writable": true,
      "disk_free": "50.2 GB"
    },
    "queue": {
      "status": "healthy",
      "driver": "redis"
    }
  },
  "memory": {
    "usage": "45.2 MB",
    "peak": "52.1 MB"
  }
}
```

### Metrics

```http
GET /api/metrics                 # JSON metrics
GET /api/metrics/prometheus      # Prometheus format
```

Requires `X-Metrics-Token` header or `?token=` query parameter.

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Application Error Codes

| Error | Description |
|-------|-------------|
| `validation_failed` | Request validation failed |
| `authentication_required` | Missing or invalid token |
| `access_denied` | Insufficient permissions |
| `resource_not_found` | Requested resource not found |
| `rate_limit_exceeded` | Too many requests |
| `integration_error` | Third-party integration failed |

---

For more details, see the [Development Guide](./DEVELOPMENT.md) or contact the development team.
