# Consultancy Platform

A production-ready website and web application for business consultancy and education support services.

## Overview

This platform provides:
- **Public Website**: Clean, academic-styled pages for Home, Business Consultancy, Education Support, About, and Contact
- **Admin Dashboard**: Content management for services, FAQs, and contact submissions
- **CRM Integration**: SuiteDash integration (API mode or CSV import mode)
- **Communication Integration**: RingCentral for voice calls and SMS

## Tech Stack

### Backend
- PHP 8.2+
- Laravel 11
- MySQL 8
- Laravel Sanctum for authentication
- Queue system for background jobs

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Router
- React Hook Form + Zod

## Project Structure

```
consultancy-platform/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Services/
│   │   │   ├── RingCentral/
│   │   │   └── SuiteDash/
│   │   └── Jobs/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── layout/
│   │   │   ├── pages/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── styles/
│   │   └── types/
│   └── public/
├── DESIGN_SYSTEM.md
└── README.md
```

## Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8
- Redis (optional, for caching)

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env
# DB_DATABASE=consultancy_platform
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate --seed

# Start the development server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

### Default Admin Credentials
- Email: admin@consultancy.test
- Password: password

## API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pillars | List all active pillars |
| GET | /api/pillars/{slug} | Get pillar by slug |
| GET | /api/pillars/{slug}/services | Get services for a pillar |
| GET | /api/pillars/{slug}/faqs | Get FAQs for a pillar |
| GET | /api/services | List all active services |
| GET | /api/services/featured | Get featured services |
| GET | /api/faqs | List all active FAQs |
| POST | /api/contact | Submit contact form |

### Admin Endpoints (Authenticated)

All admin endpoints require Bearer token authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| POST | /api/auth/logout | Admin logout |
| GET | /api/auth/user | Get current user |
| GET | /api/admin/services | List services (admin) |
| POST | /api/admin/services | Create service |
| PUT | /api/admin/services/{id} | Update service |
| DELETE | /api/admin/services/{id} | Delete service |
| GET | /api/admin/faqs | List FAQs (admin) |
| POST | /api/admin/faqs | Create FAQ |
| PUT | /api/admin/faqs/{id} | Update FAQ |
| DELETE | /api/admin/faqs/{id} | Delete FAQ |
| GET | /api/admin/contact-submissions | List contacts |
| GET | /api/admin/contact-submissions/stats | Get statistics |
| GET | /api/admin/integrations | Get integration status |

### API Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "errors": null,
  "meta": {
    "pagination": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 20,
      "total": 100
    }
  }
}
```

## Integrations

### SuiteDash CRM

The platform supports two integration modes:

#### Mode A: API Mode
- Automatic sync of contact submissions
- Real-time contact creation in SuiteDash
- Requires API credentials

Configuration:
```env
SUITEDASH_MODE=api
SUITEDASH_API_URL=https://app.suitedash.com/api/v1
SUITEDASH_API_KEY=your_api_key
SUITEDASH_SECRET_KEY=your_secret_key
```

#### Mode B: Import Mode
- Manual CSV export generation
- Download and import into SuiteDash
- No API credentials required

Configuration:
```env
SUITEDASH_MODE=import
```

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed setup instructions.

### RingCentral

Enables voice calls and SMS messaging:
- OAuth 2.0 authentication flow
- Click-to-call from contact page
- SMS messaging capability
- Call log synchronization

Configuration:
```env
RINGCENTRAL_CLIENT_ID=your_client_id
RINGCENTRAL_CLIENT_SECRET=your_client_secret
RINGCENTRAL_SERVER_URL=https://platform.ringcentral.com
RINGCENTRAL_REDIRECT_URI=http://localhost:8000/api/integrations/ringcentral/callback
```

## Design System

The platform follows a clean, academic design aesthetic:

- **Typography**: Source Serif 4 (headings), Inter (body)
- **Colors**: Primary blue palette with yellow accents
- **Spacing**: 4px base unit scale

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete specifications.

Access the live style guide at `/styleguide` route.

## Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for production deployment guide.

## License

Proprietary - All rights reserved
