# Consultancy Platform

A production-ready, enterprise-grade website and web application for business consultancy and education support services.

[![Tests](https://img.shields.io/badge/Tests-389%20Passing-green.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://postgresql.org)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [API Documentation](#api-documentation)

## Overview

This platform provides a complete solution for consultancy businesses:

- **Public Website**: Clean, academic-styled pages for Home, Services, About, and Contact
- **Admin Dashboard**: Full content management for services, FAQs, orders, users, and contact submissions
- **Shopping Cart**: Service ordering with Stripe payment integration
- **Email Notifications**: SendGrid integration for automated emails
- **Enterprise Features**: Security hardening, rate limiting, and scalability

## Features

### Core Features
- ✅ Responsive, mobile-first design
- ✅ Service catalog with multiple pillars
- ✅ Shopping cart and Stripe checkout
- ✅ Contact form with email notifications
- ✅ Admin dashboard with full CRUD operations
- ✅ Bulk delete with checkbox selection
- ✅ CSV export functionality

### Security
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation & XSS prevention
- ✅ CSRF protection via HttpOnly cookies
- ✅ Rate limiting (API & forms)
- ✅ Security headers (Helmet)

### Integrations
- ✅ **Stripe** - Payment processing
- ✅ **SendGrid** - Email notifications
- ✅ **PostgreSQL** - Production database
- ✅ **SuiteDash** - CRM integration (optional)

## Tech Stack

### Backend (API)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime |
| Express | 4.18 | Framework |
| Prisma | 5.10 | ORM |
| PostgreSQL | 16 | Database |
| JWT | 9.0 | Authentication |
| bcryptjs | 2.4 | Password Hashing |
| Stripe | 14 | Payments |
| Nodemailer | 6.9 | Email |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI Framework |
| TypeScript | 5.3 | Type Safety |
| Vite | 5 | Build Tool |
| TailwindCSS | 3.4 | Styling |
| React Query | 5 | Data Fetching |
| React Router | 6 | Routing |
| React Hook Form | 7 | Forms |
| Zod | 3 | Validation |

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- PostgreSQL 16+ (for production)

### Development Mode (Mock API)

```bash
# Clone the repository
git clone https://github.com/your-org/consultancy-platform.git
cd consultancy-platform

# Install and start mock API
cd mock-api
npm install
npm run dev:mock

# In another terminal, install and start frontend
cd frontend
npm install
npm run dev
```

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api |
| Admin Dashboard | http://localhost:5173/admin |

### Default Admin Credentials
```
Email: admin@consultancy.com
Password: admin123
```

## Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your production values
nano .env

# 3. Build and start all services
docker compose up -d

# 4. Run database migrations
docker compose exec api npx prisma migrate deploy

# 5. Seed the database
docker compose exec api npm run db:seed
```

### Option 2: Manual Deployment

#### Backend Setup

```bash
cd mock-api

# Install dependencies
npm ci --production

# Set up environment
cp .env.production .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed

# Start server
NODE_ENV=production npm start
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
VITE_API_URL=https://api.yourdomain.com/api npm run build

# Deploy dist/ folder to your hosting (Vercel, Netlify, S3, etc.)
```

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=your-64-char-secret
JWT_REFRESH_SECRET=your-other-64-char-secret

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxx
EMAIL_FROM=noreply@yourdomain.com

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Deployment Platforms

| Platform | Best For | Notes |
|----------|----------|-------|
| **Vercel** | Frontend | Free tier, automatic HTTPS |
| **Railway** | Backend + DB | Easy PostgreSQL setup |
| **Render** | Full Stack | Free PostgreSQL (with limits) |
| **DigitalOcean** | Full Control | App Platform or Droplets |
| **AWS** | Enterprise | ECS, RDS, CloudFront |

## Project Structure

```
consultancy-platform/
├── frontend/                 # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities
│   ├── Dockerfile            # Production Docker
│   ├── nginx.conf            # Nginx config
│   └── package.json
│
├── mock-api/                 # Express.js API
│   ├── src/                  # Production source
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   ├── prisma/               # Database schema
│   │   ├── schema.prisma     # Prisma schema
│   │   └── seed.js           # Database seeding
│   ├── server.js             # Mock API (development)
│   ├── Dockerfile            # Production Docker
│   └── package.json
│
├── docker-compose.yml        # Docker orchestration
├── .env.example              # Environment template
└── README.md
```

## Testing

### Frontend Tests (369 passing)
```bash
cd frontend
npm test              # Run tests
npm run test:coverage # With coverage
npm run test:e2e      # E2E tests
```

### Backend Tests (20 passing)
```bash
cd mock-api
npm test              # Run tests
npm run test:coverage # With coverage
```

## API Documentation

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/pillars | Get all pillars |
| GET | /api/pillars/:slug | Get pillar by slug |
| GET | /api/services | Get all services |
| POST | /api/contact | Submit contact form |
| POST | /api/orders | Create order |

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| POST | /api/auth/refresh | Refresh token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/user | Get current user |

### Admin Endpoints (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard/stats | Dashboard statistics |
| GET/POST/PUT/DELETE | /api/admin/pillars | Pillar CRUD |
| GET/POST/PUT/DELETE | /api/admin/services | Service CRUD |
| GET/POST/PUT/DELETE | /api/admin/faqs | FAQ CRUD |
| GET/PATCH/DELETE | /api/admin/contact-submissions | Contact management |
| GET/PATCH/DELETE | /api/admin/orders | Order management |
| GET/PATCH/DELETE | /api/admin/users | User management |
| POST | /api/admin/*/bulk-delete | Bulk delete |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/webhooks/stripe | Stripe payment events |

---

## License

Proprietary - All rights reserved

---

**Consultancy Platform** - Built with enterprise-grade architecture for scalability, security, and maintainability.

**Total Tests: 389** | **Frontend: 369** | **Backend: 20**
