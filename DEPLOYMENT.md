# Deployment Guide

This guide covers deploying the Consultancy Platform to production with SuiteDash integration.

## Prerequisites

- Node.js 18+ installed on your server
- A domain name with SSL certificate
- SuiteDash account with API access

## Project Structure

```
consultancy-platform/
├── frontend/          # React frontend (Vite)
├── mock-api/          # Node.js backend (Express)
└── DEPLOYMENT.md      # This file
```

---

## 1. SuiteDash Configuration

### Get Your API Credentials

1. Log in to [SuiteDash](https://app.suitedash.com)
2. Go to **Settings** → **Integrations** → **Public API**
3. Copy your **Public ID** and **Secret Key**

### Configure Webhook (Optional)

For automatic payment status updates:

1. In SuiteDash, go to **Settings** → **Integrations** → **Webhooks**
2. Add a new webhook:
   - **URL**: `https://api.yourdomain.com/api/webhooks/suitedash`
   - **Events**: `invoice.paid`, `invoice.created`
3. Copy the webhook secret for verification

---

## 2. Backend Deployment

### Environment Variables

Create a `.env` file in the `mock-api/` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# SuiteDash Integration (REQUIRED for production)
SUITEDASH_ENABLED=true
SUITEDASH_PUBLIC_ID=your_public_id_here
SUITEDASH_SECRET_KEY=your_secret_key_here
SUITEDASH_API_URL=https://app.suitedash.com/secure-api

# Webhook Secret (for verifying incoming webhooks)
WEBHOOK_SECRET=your_webhook_secret_here
```

### Install & Run

```bash
cd mock-api

# Install dependencies
npm install

# Run in production mode
npm run production

# Or use PM2 for process management
pm2 start server.js --name consultancy-api
```

### Using Docker (Alternative)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "server.js"]
```

---

## 3. Frontend Deployment

### Environment Variables

Create or update `.env.production` in the `frontend/` directory:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Consultancy Platform
```

### Build for Production

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in the 'dist/' folder
```

### Deploy Static Files

Upload the contents of `frontend/dist/` to your web server or CDN:

- **Vercel**: Connect your Git repo, set environment variables
- **Netlify**: Drag & drop the `dist/` folder or connect Git
- **AWS S3 + CloudFront**: Upload to S3, configure CloudFront distribution
- **Traditional Server**: Upload to `/var/www/html/` or similar

### Nginx Configuration (Example)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    root /var/www/consultancy/dist;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 4. Backend API Nginx Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. Verification Checklist

After deployment, verify:

- [ ] Frontend loads at `https://yourdomain.com`
- [ ] API responds at `https://api.yourdomain.com/api/pillars`
- [ ] Admin login works at `https://yourdomain.com/admin`
- [ ] SuiteDash shows "PRODUCTION MODE" in server logs
- [ ] Test order creates real invoice in SuiteDash
- [ ] Payment URL redirects to SuiteDash payment portal
- [ ] Webhook receives payment notifications

---

## 6. SuiteDash Integration Features

When properly configured, the integration provides:

### Automatic Contact Sync
- New user registrations create contacts in SuiteDash
- Order customers are synced as contacts

### Automatic Invoice Creation
- Orders create invoices in SuiteDash
- Customers receive invoice emails from SuiteDash
- Payment URLs redirect to SuiteDash payment portal

### Payment Status Sync
- Webhook updates order status when invoice is paid
- Orders marked as "paid" and "confirmed" automatically

### Manual Sync
- Admin can trigger sync from Integrations page
- Sync contacts, invoices, companies on demand

---

## 7. Troubleshooting

### SuiteDash API Errors

1. **401 Unauthorized**: Check Public ID and Secret Key
2. **403 Forbidden**: Ensure API access is enabled in SuiteDash
3. **Connection refused**: Verify API URL is correct

### CORS Issues

Ensure `FRONTEND_URL` matches your actual frontend domain exactly.

### Webhook Not Working

1. Check webhook URL is accessible from internet
2. Verify webhook secret matches
3. Check server logs for incoming webhook requests

---

## 8. Security Recommendations

- [ ] Use HTTPS for both frontend and backend
- [ ] Store credentials in environment variables, not in code
- [ ] Use strong webhook secret
- [ ] Implement rate limiting on API
- [ ] Regular security updates for dependencies
- [ ] Set up monitoring and alerts

---

## Support

For SuiteDash API documentation:
- https://support.suitedash.com/portal/en/kb/articles/secure-api-overview
- https://support.suitedash.com/portal/en/kb/articles/api-authentication
