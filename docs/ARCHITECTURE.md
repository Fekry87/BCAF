# Architecture Documentation

System architecture and design decisions for the Consultancy Platform.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability](#scalability)
- [Design Patterns](#design-patterns)
- [Database Schema](#database-schema)
- [Integration Architecture](#integration-architecture)

## Overview

The Consultancy Platform follows a modern, layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer / CDN                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Frontend    │   │   Frontend    │   │   Frontend    │
│   (React)     │   │   (React)     │   │   (React)     │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └─────────────────┬─┴───────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Nginx                       │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Laravel API  │ │  Laravel API  │ │  Laravel API  │
│   Instance    │ │   Instance    │ │   Instance    │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └────────┬────────┴────────┬────────┘
                 │                 │
        ┌────────┴────────┐  ┌─────┴─────┐
        │                 │  │           │
        ▼                 ▼  ▼           ▼
┌───────────────┐  ┌───────────────┐  ┌──────────┐
│    MySQL      │  │    Redis      │  │  Queue   │
│   Primary     │  │   Cluster     │  │ Workers  │
│   + Replica   │  │               │  │          │
└───────────────┘  └───────────────┘  └──────────┘
```

## System Architecture

### Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React + TypeScript | User interface |
| API | Laravel 11 | Business logic & data |
| Database | MySQL 8 | Persistent storage |
| Cache | Redis 7 | Caching & sessions |
| Queue | Redis + Laravel | Background jobs |
| Storage | Local / S3 | File storage |

### Communication Flow

```
User → CDN → Frontend (React SPA)
                ↓
        API Gateway (Nginx)
                ↓
        Laravel Application
                ↓
    ┌───────────┬───────────┐
    ↓           ↓           ↓
  MySQL      Redis       Queue
```

## Backend Architecture

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Layer (Routes)                       │
│  - Rate Limiting                                             │
│  - Authentication                                            │
│  - Request Validation                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                          │
│  - Request handling                                          │
│  - Response formatting                                       │
│  - Dependency injection                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Action Layer                              │
│  - Single-purpose operations                                 │
│  - Business logic                                            │
│  - Event dispatching                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  - External integrations                                     │
│  - Complex business logic                                    │
│  - Third-party APIs                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Repository Layer                           │
│  - Data access abstraction                                   │
│  - Query building                                            │
│  - Caching logic                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model Layer                               │
│  - Eloquent models                                           │
│  - Relationships                                             │
│  - Accessors/Mutators                                        │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
app/
├── Actions/                 # Single-purpose action classes
│   ├── CreateContactSubmissionAction.php
│   ├── SyncContactToSuiteDashAction.php
│   └── UpdatePillarAction.php
│
├── Contracts/               # Interfaces
│   ├── RepositoryInterface.php
│   ├── CacheableInterface.php
│   └── SyncableInterface.php
│
├── DTOs/                    # Data Transfer Objects
│   ├── ContactSubmissionData.php
│   ├── PillarData.php
│   └── ServiceData.php
│
├── Events/                  # Domain events
│   ├── ContactSubmissionCreated.php
│   ├── PillarUpdated.php
│   └── UserLoggedIn.php
│
├── Http/
│   ├── Controllers/
│   │   ├── Api/             # Current API version
│   │   └── Api/V1/          # Versioned API
│   ├── Middleware/
│   │   ├── SecurityHeaders.php
│   │   ├── SanitizeInput.php
│   │   └── RequestLogger.php
│   ├── Requests/            # Form validation
│   └── Resources/           # API resources
│
├── Listeners/               # Event listeners
│   ├── SyncContactToSuiteDash.php
│   ├── SendContactNotification.php
│   └── LogUserLogin.php
│
├── Models/                  # Eloquent models
│
├── Providers/               # Service providers
│   ├── RepositoryServiceProvider.php
│   ├── EventServiceProvider.php
│   └── RouteServiceProvider.php
│
├── Repositories/            # Data access layer
│   ├── BaseRepository.php
│   ├── PillarRepository.php
│   ├── ServiceRepository.php
│   └── ContactSubmissionRepository.php
│
├── Rules/                   # Custom validation rules
│   └── SecurePassword.php
│
└── Services/                # Business services
    ├── SecurityService.php
    ├── ConfigService.php
    ├── MonitoringService.php
    ├── SuiteDash/
    └── RingCentral/
```

## Frontend Architecture

### Component Architecture

```
src/
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── Modal/
│   │
│   ├── layout/              # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Sidebar/
│   │
│   ├── pages/               # Page components
│   │   ├── Home/
│   │   ├── About/
│   │   └── Contact/
│   │
│   └── admin/               # Admin components
│       ├── Dashboard/
│       └── ServiceEditor/
│
├── contexts/                # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/                   # Custom hooks
│   ├── useAuth.ts
│   ├── usePillars.ts
│   └── useSecureForm.ts
│
├── services/                # API services
│   └── api.ts
│
├── types/                   # TypeScript types
│   └── index.ts
│
└── utils/                   # Utilities
    ├── security.ts
    └── helpers.ts
```

### State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    React Query                               │
│  - Server state management                                   │
│  - Caching & synchronization                                 │
│  - Background refetching                                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    React Context                             │
│  - Auth state                                                │
│  - Theme settings                                            │
│  - User preferences                                          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Component State                           │
│  - Form state (React Hook Form)                              │
│  - UI state (modals, dropdowns)                              │
│  - Local component state                                     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Request Flow

```
1. User Action
   │
   ▼
2. React Component
   │
   ▼
3. React Query Hook → Cache Check
   │                      │
   │                      ▼ (Cache Hit)
   │                   Return Data
   │
   ▼ (Cache Miss)
4. API Service (axios)
   │
   ▼
5. Laravel Middleware
   │ - Rate Limiting
   │ - Authentication
   │ - Input Sanitization
   │
   ▼
6. Controller
   │
   ▼
7. Action/Service
   │
   ▼
8. Repository
   │
   ▼
9. Database
   │
   ▼
10. Response → Cache Update → UI Update
```

### Event Flow

```
Action Triggered
      │
      ▼
Event Dispatched
      │
      ├──────────────────────┐
      │                      │
      ▼                      ▼
Sync Listener          Queued Listener
      │                      │
      ▼                      ▼
Immediate              Queue Worker
Execution                   │
                            ▼
                      Async Execution
```

## Security Architecture

### Defense Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                   │
│  - HTTPS/TLS                                                 │
│  - Firewall rules                                            │
│  - DDoS protection                                           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Application Security                               │
│  - Rate limiting                                             │
│  - Security headers (CSP, HSTS)                              │
│  - Input sanitization                                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Authentication & Authorization                     │
│  - Token-based auth (Sanctum)                                │
│  - Brute force protection                                    │
│  - Session management                                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Data Security                                      │
│  - Input validation                                          │
│  - Output encoding                                           │
│  - Parameterized queries                                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: Audit & Monitoring                                 │
│  - Audit logging                                             │
│  - Security event monitoring                                 │
│  - Alerting                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Security Components

| Component | Implementation |
|-----------|---------------|
| Authentication | Laravel Sanctum (token-based) |
| Authorization | Gates & Policies |
| XSS Prevention | Input sanitization middleware |
| CSRF Protection | Laravel CSRF tokens |
| SQL Injection | Eloquent ORM, parameterized queries |
| Rate Limiting | Laravel rate limiter |
| Password Hashing | Bcrypt (12 rounds) |
| Brute Force | IP-based lockout |

## Scalability

### Horizontal Scaling

```
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │  App 1  │      │  App 2  │      │  App 3  │
   └────┬────┘      └────┬────┘      └────┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
       ┌────────┐   ┌────────┐   ┌────────┐
       │ MySQL  │   │ Redis  │   │ Queue  │
       │Primary │   │Cluster │   │Workers │
       └────────┘   └────────┘   └────────┘
```

### Caching Strategy

| Layer | Technology | TTL | Purpose |
|-------|------------|-----|---------|
| CDN | CloudFront | 1 hour | Static assets |
| Application | Redis | Varies | API responses |
| Query | Redis | 1 hour | Database queries |
| Session | Redis | 2 hours | User sessions |

### Performance Optimizations

1. **Database**
   - Query optimization with indexes
   - N+1 query prevention
   - Connection pooling

2. **Caching**
   - Redis for all caching
   - Cache warming on deploy
   - Intelligent cache invalidation

3. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Service workers

4. **API**
   - Response compression
   - Pagination
   - Sparse fieldsets

## Design Patterns

### Patterns Used

| Pattern | Usage | Example |
|---------|-------|---------|
| Repository | Data access abstraction | `PillarRepository` |
| Action | Single-purpose operations | `CreateContactSubmissionAction` |
| DTO | Data transfer | `ContactSubmissionData` |
| Observer | Event handling | Event/Listener pairs |
| Strategy | Integration modes | SuiteDash API/Import |
| Factory | Test data | Model factories |
| Decorator | Middleware | Security middleware |

### Repository Pattern Example

```php
// Interface
interface RepositoryInterface {
    public function find(int $id): ?Model;
    public function create(array $data): Model;
    public function update(Model $model, array $data): bool;
}

// Implementation
class PillarRepository extends BaseRepository {
    public function getActive(): Collection {
        return $this->query()->active()->ordered()->get();
    }
}

// Usage in Controller
class PillarController {
    public function __construct(
        protected PillarRepository $repository
    ) {}

    public function index() {
        return $this->repository->getActive();
    }
}
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐
│   pillars   │       │   services  │
├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │
│ name        │   │   │ pillar_id   │──┐
│ slug        │   └──▶│ name        │  │
│ description │       │ slug        │  │
│ is_active   │       │ is_active   │  │
└─────────────┘       └─────────────┘  │
                                       │
┌─────────────┐       ┌─────────────────┤
│    faqs     │       │ contact_        │
├─────────────┤       │ submissions     │
│ id          │       ├─────────────────┤
│ question    │       │ id              │
│ answer      │◀──────│ pillar_id       │
│ pillar_id   │       │ name            │
│ is_active   │       │ email           │
└─────────────┘       │ status          │
                      └─────────────────┘

┌─────────────┐       ┌─────────────┐
│   users     │       │ audit_logs  │
├─────────────┤       ├─────────────┤
│ id          │───────│ user_id     │
│ name        │       │ action      │
│ email       │       │ details     │
│ is_admin    │       │ created_at  │
└─────────────┘       └─────────────┘
```

## Integration Architecture

### SuiteDash Integration

```
┌─────────────────┐
│ Contact Form    │
│ Submission      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Action   │
│ + Event         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Queue Listener  │────▶│ SuiteDash API   │
│                 │     │ or CSV Export   │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Update Status   │
│ (synced/failed) │
└─────────────────┘
```

### RingCentral Integration

```
┌─────────────────┐     ┌─────────────────┐
│ Admin Dashboard │────▶│ OAuth Flow      │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Access Token    │
                        │ Storage         │
                        └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Initiate Call   │     │ Send SMS        │     │ Sync Call Logs  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

For implementation details, see [Development Guide](./DEVELOPMENT.md).
