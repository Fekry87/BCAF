# Deployment & Production Hardening Checklist

## Pre-Deployment Checklist

### Backend (Laravel)

#### Environment Configuration
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate new `APP_KEY` for production
- [ ] Configure production database credentials
- [ ] Set secure `APP_URL` (with HTTPS)
- [ ] Configure `SANCTUM_STATEFUL_DOMAINS` for your domain
- [ ] Set `FRONTEND_URL` to production frontend URL

#### Security
- [ ] Ensure all sensitive data in `.env` (never committed to git)
- [ ] Configure CORS for production domain only
- [ ] Set strong `BCRYPT_ROUNDS` (12 recommended)
- [ ] Enable HTTPS redirect in web server
- [ ] Configure rate limiting for API endpoints
- [ ] Set secure session configuration:
  ```env
  SESSION_DRIVER=database
  SESSION_ENCRYPT=true
  SESSION_SECURE_COOKIE=true
  SESSION_DOMAIN=.yourdomain.com
  ```

#### Database
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Optimize database indexes
- [ ] Set up automated backups
- [ ] Configure connection pooling if needed

#### Caching & Performance
- [ ] Configure Redis for cache/queue:
  ```env
  CACHE_STORE=redis
  QUEUE_CONNECTION=redis
  SESSION_DRIVER=redis
  ```
- [ ] Run optimization commands:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan event:cache
  ```

#### Queue Workers
- [ ] Set up Supervisor for queue workers:
  ```ini
  [program:consultancy-worker]
  process_name=%(program_name)s_%(process_num)02d
  command=php /var/www/html/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
  autostart=true
  autorestart=true
  stopasgroup=true
  killasgroup=true
  user=www-data
  numprocs=2
  redirect_stderr=true
  stdout_logfile=/var/log/consultancy-worker.log
  ```

#### Scheduled Tasks
- [ ] Add cron job for Laravel scheduler:
  ```cron
  * * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1
  ```

#### Logging
- [ ] Configure log rotation
- [ ] Set up error monitoring (Sentry, Bugsnag, etc.)
- [ ] Configure log channel for production:
  ```env
  LOG_CHANNEL=stack
  LOG_STACK=single,slack
  ```

### Frontend (React)

#### Build Configuration
- [ ] Set production API URL:
  ```env
  VITE_API_URL=https://api.yourdomain.com/api
  ```
- [ ] Build for production:
  ```bash
  npm run build
  ```
- [ ] Verify build output in `dist/` folder

#### Performance
- [ ] Enable gzip compression on server
- [ ] Configure proper cache headers for static assets
- [ ] Set up CDN for static assets (optional)
- [ ] Verify code splitting is working
- [ ] Check Lighthouse scores

#### Security
- [ ] Configure Content Security Policy headers
- [ ] Set up HSTS headers
- [ ] Add X-Frame-Options header
- [ ] Configure referrer policy

---

## Server Configuration

### Nginx Configuration (Recommended)

```nginx
# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    root /var/www/html/public;
    index index.php;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types application/json text/plain text/css application/javascript;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    root /var/www/frontend/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### PHP-FPM Configuration

```ini
; /etc/php/8.2/fpm/pool.d/consultancy.conf
[consultancy]
user = www-data
group = www-data
listen = /var/run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500

php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 10M
php_admin_value[post_max_size] = 12M
```

---

## Post-Deployment Checklist

### Verification
- [ ] Test all public pages load correctly
- [ ] Verify contact form submission works
- [ ] Test admin login
- [ ] Verify API responses are correct
- [ ] Check SSL certificate is valid
- [ ] Test CORS is working (frontend can call API)

### Integrations
- [ ] Test SuiteDash connection (if API mode)
- [ ] Generate test export (if import mode)
- [ ] Test RingCentral authorization flow
- [ ] Verify call/SMS functionality (if applicable)

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure application performance monitoring
- [ ] Set up log aggregation
- [ ] Configure alerting for errors

### Backup Strategy
- [ ] Database backup schedule (daily recommended)
- [ ] File storage backup
- [ ] Test backup restoration procedure

---

## Security Hardening

### Application Level
- [ ] Implement rate limiting on login endpoint
- [ ] Add CAPTCHA to contact form (optional)
- [ ] Implement IP blocking for repeated failed logins
- [ ] Audit admin permissions

### Server Level
- [ ] Keep OS and packages updated
- [ ] Configure firewall (UFW/iptables)
- [ ] Disable root SSH login
- [ ] Use SSH key authentication only
- [ ] Set up fail2ban

### Database
- [ ] Create dedicated database user with minimal privileges
- [ ] Enable SSL for database connections
- [ ] Restrict database access to application server only

---

## Scaling Considerations

### Horizontal Scaling
- [ ] Configure load balancer
- [ ] Set up session storage on Redis
- [ ] Configure shared file storage
- [ ] Use database read replicas

### Caching Strategy
- [ ] Cache API responses for public endpoints
- [ ] Implement CDN for static assets
- [ ] Consider full-page caching for public pages

### Database Optimization
- [ ] Add indexes for frequently queried columns
- [ ] Optimize slow queries
- [ ] Consider database sharding for high volume

---

## Maintenance Procedures

### Regular Tasks
- Weekly: Review error logs
- Weekly: Check disk space and clean up
- Monthly: Update dependencies
- Quarterly: Security audit
- Quarterly: Performance review

### Update Procedure
1. Take database backup
2. Enable maintenance mode: `php artisan down`
3. Pull latest code
4. Install dependencies: `composer install --no-dev`
5. Run migrations: `php artisan migrate --force`
6. Clear caches: `php artisan optimize:clear`
7. Rebuild caches: `php artisan optimize`
8. Disable maintenance mode: `php artisan up`
9. Monitor for errors

---

## Emergency Procedures

### Rollback
```bash
# Database rollback (if needed)
php artisan migrate:rollback

# Code rollback
git checkout <previous-commit>
composer install --no-dev
php artisan optimize:clear
php artisan optimize
```

### Emergency Contacts
- Hosting Provider: [Contact info]
- Domain Registrar: [Contact info]
- SSL Provider: [Contact info]
- Team Lead: [Contact info]
