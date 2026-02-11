# Development Guide

Complete guide for setting up and developing on the Consultancy Platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Database](#database)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

## Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| PHP | 8.3+ | `brew install php` or [php.net](https://php.net) |
| Composer | 2+ | `brew install composer` |
| Node.js | 20+ | `brew install node` or [nodejs.org](https://nodejs.org) |
| MySQL | 8.0+ | `brew install mysql` |
| Redis | 7+ | `brew install redis` (optional) |

### Recommended Tools

- **IDE**: PhpStorm or VS Code with extensions
- **API Testing**: Postman or Insomnia
- **Database**: TablePlus, DBeaver, or phpMyAdmin
- **Git GUI**: GitKraken, Fork, or Sourcetree

### VS Code Extensions

```json
{
  "recommendations": [
    "bmewburn.vscode-intelephense-client",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "mikestead.dotenv",
    "ms-azuretools.vscode-docker",
    "prisma.prisma"
  ]
}
```

## Initial Setup

### Option 1: Using Setup Script (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/consultancy-platform.git
cd consultancy-platform

# Run setup script
./scripts/setup.sh
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create database
mysql -u root -p -e "CREATE DATABASE consultancy_platform"

# Run migrations and seeders
php artisan migrate --seed

# Create storage symlink
php artisan storage:link
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file (if needed)
cp .env.example .env
```

### Start Development Servers

```bash
# Using Make (recommended)
make dev

# Or manually:
# Terminal 1 - Backend
cd backend && php artisan serve

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Access points:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Login: admin@consultancy.test / password

## Development Workflow

### Branch Naming

```
feature/    - New features (feature/add-user-auth)
bugfix/     - Bug fixes (bugfix/fix-login-error)
hotfix/     - Urgent fixes (hotfix/security-patch)
refactor/   - Code refactoring (refactor/user-service)
docs/       - Documentation (docs/api-readme)
```

### Commit Messages

Follow conventional commits:

```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
refactor: extract user service
test: add auth controller tests
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with tests
3. Run `make test` locally
4. Push and create PR
5. Wait for CI to pass
6. Request review
7. Merge after approval

## Code Style

### PHP (Backend)

We follow PSR-12 with Laravel conventions.

```bash
# Run PHP CS Fixer
./vendor/bin/pint

# Run PHPStan
./vendor/bin/phpstan analyse
```

Key conventions:
- Use strict types: `declare(strict_types=1);`
- Type hints on all parameters and returns
- Use DTOs for data transfer
- Use Actions for single-purpose operations
- Repository pattern for data access

### TypeScript (Frontend)

```bash
# Run ESLint
npm run lint

# Run type checking
npx tsc --noEmit
```

Key conventions:
- Use functional components with hooks
- Define types for all props
- Use React Query for data fetching
- Use Zod for validation

## Testing

### Backend Tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test --filter=UserTest

# Run specific method
php artisan test --filter=UserTest::test_can_create_user
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/components/Button.test.tsx
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npx playwright test --ui
```

### Test Database

Use SQLite for fast tests:

```env
# .env.testing
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
```

## Database

### Migrations

```bash
# Create migration
php artisan make:migration create_users_table

# Run migrations
php artisan migrate

# Rollback
php artisan migrate:rollback

# Fresh with seeds
php artisan migrate:fresh --seed
```

### Seeders

```bash
# Create seeder
php artisan make:seeder UserSeeder

# Run specific seeder
php artisan db:seed --class=UserSeeder
```

### Factory

```bash
# Create factory
php artisan make:factory UserFactory

# Use in tests
User::factory()->count(10)->create();
```

### Query Debugging

```php
// Enable query logging
DB::enableQueryLog();

// ... your queries

// Get queries
dd(DB::getQueryLog());
```

## API Development

### Creating an Endpoint

1. Create Controller:
```bash
php artisan make:controller Api/NewController
```

2. Create Request Validation:
```bash
php artisan make:request NewRequest
```

3. Create Resource:
```bash
php artisan make:resource NewResource
```

4. Add Route:
```php
// routes/api.php
Route::get('/new-endpoint', [NewController::class, 'index']);
```

### Testing API

```bash
# Using curl
curl -X GET http://localhost:8000/api/health

# With authentication
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### API Response Format

```php
// Success
return response()->json([
    'success' => true,
    'data' => $data,
    'message' => 'Success',
]);

// Error
return response()->json([
    'success' => false,
    'message' => 'Error message',
    'errors' => $errors,
], 422);
```

## Frontend Development

### Creating Components

```bash
# Component structure
src/components/
  └── MyComponent/
      ├── MyComponent.tsx
      ├── MyComponent.test.tsx
      └── index.ts
```

### Component Template

```tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onClick }) => {
  return (
    <div className="my-component" onClick={onClick}>
      <h2>{title}</h2>
    </div>
  );
};
```

### Using React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export const usePillars = () => {
  return useQuery({
    queryKey: ['pillars'],
    queryFn: () => api.get('/pillars'),
  });
};
```

### Form Handling

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Debugging

### Backend Debugging

```php
// Using dd()
dd($variable);

// Using dump()
dump($variable);

// Using Log
Log::info('Debug message', ['data' => $data]);
```

### Frontend Debugging

```tsx
// Using console
console.log('Debug:', data);

// Using React DevTools
// Install browser extension

// Using React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

### Xdebug Setup

```ini
; php.ini
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_port=9003
```

## Common Tasks

### Clear Caches

```bash
# Laravel caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Or use Make
make cache-clear
```

### Queue Management

```bash
# Start queue worker
php artisan queue:work

# Process single job
php artisan queue:work --once

# View failed jobs
php artisan queue:failed

# Retry failed job
php artisan queue:retry {id}
```

### Generate IDE Helpers

```bash
# Generate model helpers
php artisan ide-helper:models

# Generate facade helpers
php artisan ide-helper:generate
```

### Update Dependencies

```bash
# Backend
composer update

# Frontend
npm update

# Check outdated
composer outdated
npm outdated
```

### Environment Variables

Add new variables to:
1. `.env.example` - with placeholder
2. `config/platform.php` - with env() call
3. `.env.testing` - for tests

---

For deployment instructions, see [Deployment Guide](./DEPLOYMENT.md).
