# Database Schema Documentation

## Overview

The Consultancy Platform uses a relational database structure optimized for managing consultancy services, user accounts, orders, and CRM integration.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Users     │       │   Orders    │       │  Services   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │    ┌──│ id (PK)     │
│ email       │  │    │ user_id(FK) │◄───┤  │ pillar_id   │──┐
│ password    │  └───►│ status      │    │  │ name        │  │
│ firstName   │       │ total       │    │  │ price       │  │
│ lastName    │       │ created_at  │    │  │ type        │  │
└─────────────┘       └─────────────┘    │  └─────────────┘  │
                            │            │                    │
                            ▼            │                    │
                      ┌─────────────┐    │  ┌─────────────┐  │
                      │ OrderItems  │    │  │  Pillars    │◄─┘
                      ├─────────────┤    │  ├─────────────┤
                      │ id (PK)     │    │  │ id (PK)     │
                      │ order_id(FK)│    │  │ name        │
                      │ service_id  │────┘  │ slug        │
                      │ quantity    │       │ description │
                      │ price       │       └─────────────┘
                      └─────────────┘
```

## Tables

### Users

Stores customer and admin user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| firstName | VARCHAR(100) | NOT NULL | User's first name |
| lastName | VARCHAR(100) | NULL | User's last name |
| company | VARCHAR(200) | NULL | Company name |
| phone | VARCHAR(50) | NULL | Phone number |
| status | ENUM | DEFAULT 'active' | Account status: active, inactive, suspended |
| suitedash_contact_id | VARCHAR(100) | NULL | SuiteDash CRM contact ID |
| suitedash_company_id | VARCHAR(100) | NULL | SuiteDash CRM company ID |
| suitedash_synced | BOOLEAN | DEFAULT FALSE | Whether synced to SuiteDash |
| suitedash_sync_error | TEXT | NULL | Last sync error message |
| suitedash_synced_at | TIMESTAMP | NULL | Last successful sync time |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

**Indexes:**
- `idx_users_email` - UNIQUE index on email
- `idx_users_status` - Index on status for filtering
- `idx_users_suitedash` - Index on suitedash_contact_id

### Admin Users

Stores administrative user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Admin display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Admin email |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(50) | DEFAULT 'admin' | Role: admin, super_admin |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

### Pillars

Service categories/pillars.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Pillar name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly slug |
| tagline | VARCHAR(200) | NULL | Short tagline |
| description | TEXT | NULL | Full description |
| hero_image | VARCHAR(500) | NULL | Hero image URL |
| card_image | VARCHAR(500) | NULL | Card thumbnail URL |
| meta_title | VARCHAR(200) | NULL | SEO meta title |
| meta_description | VARCHAR(500) | NULL | SEO meta description |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Whether visible |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

**Indexes:**
- `idx_pillars_slug` - UNIQUE index on slug
- `idx_pillars_active` - Index on is_active, sort_order

### Services

Individual consultancy services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| pillar_id | INTEGER | FOREIGN KEY | Reference to pillars table |
| type | ENUM | NOT NULL | Service type: one_off, subscription |
| type_label | VARCHAR(50) | NULL | Human-readable type label |
| title | VARCHAR(200) | NOT NULL | Service title |
| slug | VARCHAR(200) | UNIQUE, NOT NULL | URL-friendly slug |
| summary | TEXT | NULL | Short summary |
| details | TEXT | NULL | Full HTML description |
| icon | VARCHAR(100) | NULL | Icon name (Heroicons) |
| price_from | DECIMAL(10,2) | NULL | Starting price |
| price_label | VARCHAR(100) | NULL | Price display text |
| sort_order | INTEGER | DEFAULT 0 | Display order within pillar |
| is_featured | BOOLEAN | DEFAULT FALSE | Featured on homepage |
| is_active | BOOLEAN | DEFAULT TRUE | Whether available |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

**Indexes:**
- `idx_services_slug` - UNIQUE index on slug
- `idx_services_pillar` - Index on pillar_id
- `idx_services_featured` - Index on is_featured, is_active

### Orders

Customer orders/checkout records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable order number |
| user_id | INTEGER | FOREIGN KEY, NULL | Reference to users (if logged in) |
| customer_name | VARCHAR(100) | NOT NULL | Customer name |
| customer_email | VARCHAR(255) | NOT NULL | Customer email |
| customer_phone | VARCHAR(50) | NULL | Customer phone |
| customer_company | VARCHAR(200) | NULL | Customer company |
| status | ENUM | DEFAULT 'pending' | Order status |
| subtotal | DECIMAL(10,2) | NOT NULL | Subtotal before tax |
| tax | DECIMAL(10,2) | DEFAULT 0 | Tax amount |
| total | DECIMAL(10,2) | NOT NULL | Total amount |
| notes | TEXT | NULL | Customer notes |
| admin_notes | TEXT | NULL | Internal admin notes |
| suitedash_invoice_id | VARCHAR(100) | NULL | SuiteDash invoice ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

**Status Values:**
- `pending` - Order received, awaiting processing
- `processing` - Order being processed
- `completed` - Order fulfilled
- `cancelled` - Order cancelled

**Indexes:**
- `idx_orders_number` - UNIQUE index on order_number
- `idx_orders_user` - Index on user_id
- `idx_orders_status` - Index on status
- `idx_orders_email` - Index on customer_email

### Order Items

Line items within orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| order_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to orders |
| service_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to services |
| service_title | VARCHAR(200) | NOT NULL | Service title at time of order |
| quantity | INTEGER | DEFAULT 1 | Quantity ordered |
| unit_price | DECIMAL(10,2) | NOT NULL | Price per unit at order time |
| total_price | DECIMAL(10,2) | NOT NULL | Line total |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_order_items_order` - Index on order_id
- `idx_order_items_service` - Index on service_id

### Contacts

Contact form submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Contact name |
| email | VARCHAR(255) | NOT NULL | Contact email |
| phone | VARCHAR(50) | NULL | Contact phone |
| subject | VARCHAR(200) | NULL | Message subject |
| message | TEXT | NOT NULL | Message content |
| status | ENUM | DEFAULT 'new' | Contact status |
| assigned_to | INTEGER | FOREIGN KEY, NULL | Assigned admin user |
| notes | TEXT | NULL | Admin notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

**Status Values:**
- `new` - Unread message
- `in_progress` - Being handled
- `resolved` - Issue resolved
- `archived` - Archived

### FAQs

Frequently asked questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| question | VARCHAR(500) | NOT NULL | Question text |
| answer | TEXT | NOT NULL | Answer text (HTML) |
| category | VARCHAR(100) | NULL | Category grouping |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Whether visible |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

**Indexes:**
- `idx_faqs_category` - Index on category, is_active

### Integrations

Third-party integration configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Integration name |
| type | VARCHAR(50) | NOT NULL | Integration type |
| config | JSON | NOT NULL | Configuration object |
| enabled | BOOLEAN | DEFAULT FALSE | Whether enabled |
| last_sync_at | TIMESTAMP | NULL | Last sync time |
| last_error | TEXT | NULL | Last error message |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

## Content Tables

### Site Settings

Key-value storage for site configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | VARCHAR(100) | PRIMARY KEY | Setting key |
| value | JSON | NOT NULL | Setting value |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

### Theme

Theme configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Single row |
| config | JSON | NOT NULL | Full theme configuration |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update time |

## Token Storage

### User Tokens (In-Memory/Redis)

Authentication tokens are stored in Redis for performance.

```json
{
  "token": "user-token-xxx",
  "data": {
    "userId": 1,
    "expiresAt": "2024-01-15T12:00:00Z",
    "type": "access"
  }
}
```

### Refresh Tokens

```json
{
  "token": "refresh-token-xxx",
  "data": {
    "userId": 1,
    "expiresAt": "2024-01-22T12:00:00Z",
    "type": "refresh"
  }
}
```

## Migration Strategy

### Creating Migrations

```bash
# Create a new migration
php artisan make:migration create_services_table

# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback
```

### Index Recommendations

For optimal query performance:

1. **Composite indexes** for common query patterns:
   ```sql
   CREATE INDEX idx_services_pillar_active ON services(pillar_id, is_active, sort_order);
   CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at);
   ```

2. **Full-text indexes** for search:
   ```sql
   CREATE FULLTEXT INDEX idx_services_search ON services(title, summary, details);
   ```

## Data Retention

| Data Type | Retention Period | Action |
|-----------|-----------------|--------|
| Orders | Indefinite | Archive after 2 years |
| Contacts | 2 years | Auto-delete |
| User tokens | 7 days | Auto-expire |
| Refresh tokens | 30 days | Auto-expire |
| Audit logs | 1 year | Archive to cold storage |

## Backup Strategy

- **Full backup**: Daily at 02:00 UTC
- **Incremental backup**: Every 6 hours
- **Retention**: 30 days for daily, 7 days for incremental
- **Off-site**: Replicated to separate region

```bash
# Manual backup command
mysqldump -u root -p consultancy > backup_$(date +%Y%m%d).sql
```
