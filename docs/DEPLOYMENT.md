# Deployment Guide

Complete guide for deploying the Consultancy Platform to production.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Deployments](#cloud-deployments)
- [Environment Configuration](#environment-configuration)
- [Database Migration](#database-migration)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Backup Strategy](#backup-strategy)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

The platform supports multiple deployment strategies:

| Method | Best For | Complexity |
|--------|----------|------------|
| Docker Compose | Single server, small teams | Low |
| Kubernetes | Large scale, high availability | High |
| AWS ECS | AWS ecosystem | Medium |
| Manual | Custom infrastructure | Medium |

## Prerequisites

### Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 20 GB SSD | 50+ GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Software Requirements

- Docker 24+ & Docker Compose 2.20+
- PHP 8.3+ (if manual deployment)
- Node.js 20+ (for building)
- MySQL 8.0+
- Redis 7+
- Nginx or Apache
- Supervisor (for queue workers)

## Deployment Options

### Quick Deploy with Docker

```bash
# 1. Clone repository
git clone https://github.com/your-org/consultancy-platform.git
cd consultancy-platform

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit .env with production values

# 3. Deploy
./scripts/docker-deploy.sh production
```

### Using Makefile

```bash
make docker-build
make docker-up
```

## Docker Deployment

### Step 1: Prepare Environment

Create `.env` file with production values:

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your-generated-key-here
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=consultancy
DB_USERNAME=consultancy
DB_PASSWORD=strong-password-here
DB_ROOT_PASSWORD=root-password-here

# Redis
REDIS_HOST=redis

# Security
BCRYPT_ROUNDS=12
LOGIN_MAX_ATTEMPTS=5
```

### Step 2: Build & Start

```bash
# Build images
docker-compose build --no-cache

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 3: Initialize Database

```bash
# Run migrations
docker-compose exec app php artisan migrate --force

# Seed initial data (optional)
docker-compose exec app php artisan db:seed --class=ProductionSeeder
```

### Step 4: Generate Application Key

```bash
docker-compose exec app php artisan key:generate
```

### Step 5: Optimize for Production

```bash
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache
docker-compose exec app php artisan event:cache
```

### Docker Compose Services

| Service | Port | Purpose |
|---------|------|---------|
| app | 80 | Main application |
| queue | - | Background jobs |
| scheduler | - | Scheduled tasks |
| mysql | 3306 | Database |
| redis | 6379 | Cache & queues |

## Manual Deployment

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.3
sudo add-apt-repository ppa:ondrej/php
sudo apt install php8.3-fpm php8.3-mysql php8.3-redis php8.3-gd \
    php8.3-mbstring php8.3-xml php8.3-bcmath php8.3-zip -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install MySQL
sudo apt install mysql-server -y

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install Supervisor
sudo apt install supervisor -y
```

### Step 2: Configure MySQL

```bash
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p <<EOF
CREATE DATABASE consultancy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'consultancy'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON consultancy.* TO 'consultancy'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### Step 3: Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/consultancy-platform
sudo chown $USER:www-data /var/www/consultancy-platform

# Clone repository
git clone https://github.com/your-org/consultancy-platform.git /var/www/consultancy-platform

# Install backend dependencies
cd /var/www/consultancy-platform/backend
composer install --no-dev --optimize-autoloader

# Install frontend and build
cd /var/www/consultancy-platform/frontend
npm ci
npm run build

# Copy build to public directory
cp -r dist/* /var/www/consultancy-platform/backend/public/

# Set permissions
sudo chown -R www-data:www-data /var/www/consultancy-platform
sudo chmod -R 755 /var/www/consultancy-platform/backend/storage
```

### Step 4: Configure Nginx

```nginx
# /etc/nginx/sites-available/consultancy-platform

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/consultancy-platform/backend/public;
    index index.php;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/consultancy-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Configure Supervisor

```ini
# /etc/supervisor/conf.d/consultancy-worker.conf

[program:consultancy-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/consultancy-platform/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/consultancy-worker.log
stopwaitsecs=3600
```

Start workers:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start consultancy-worker:*
```

### Step 6: Configure Cron

```bash
# Add to crontab for www-data
sudo crontab -u www-data -e

# Add this line:
* * * * * cd /var/www/consultancy-platform/backend && php artisan schedule:run >> /dev/null 2>&1
```

## Cloud Deployments

### AWS ECS

See the [AWS ECS deployment template](.github/workflows/deploy.yml) in the CI/CD pipeline.

Key components:
- ECS Cluster with Fargate
- RDS for MySQL
- ElastiCache for Redis
- Application Load Balancer
- CloudFront for CDN

### DigitalOcean

```bash
# Using doctl CLI
doctl apps create --spec .do/app.yaml
```

### Kubernetes

```yaml
# Basic deployment manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: consultancy-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: consultancy
  template:
    metadata:
      labels:
        app: consultancy
    spec:
      containers:
      - name: app
        image: ghcr.io/your-org/consultancy-platform:latest
        ports:
        - containerPort: 80
        env:
        - name: APP_ENV
          value: production
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 80
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 80
```

## Environment Configuration

### Required Variables

```env
# Application
APP_NAME="Consultancy Platform"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=consultancy
DB_USERNAME=consultancy
DB_PASSWORD=secure-password

# Cache & Queue
REDIS_HOST=your-redis-host
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Mail
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
```

### Security Recommendations

- Never commit `.env` files
- Use strong, unique passwords (32+ characters)
- Enable `APP_DEBUG=false` in production
- Set `SESSION_SECURE_COOKIE=true` for HTTPS
- Rotate secrets regularly

## Database Migration

### Initial Setup

```bash
php artisan migrate --force
```

### Zero-Downtime Migrations

For production deployments:

1. Always make migrations backward-compatible
2. Deploy code first, then run migrations
3. Use feature flags for breaking changes

```bash
# Run migrations in maintenance mode if needed
php artisan down --retry=60
php artisan migrate --force
php artisan up
```

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # ... rest of config
}
```

## Monitoring Setup

### Health Checks

```bash
# Basic health check
curl https://your-domain.com/api/health

# Detailed health check
curl https://your-domain.com/api/health/detailed
```

### Prometheus Integration

Add to your Prometheus config:

```yaml
scrape_configs:
  - job_name: 'consultancy-platform'
    static_configs:
      - targets: ['your-domain.com']
    metrics_path: '/api/metrics/prometheus'
    params:
      token: ['your-metrics-token']
```

### Log Aggregation

Logs are stored in:
- `/var/www/consultancy-platform/backend/storage/logs/`

Recommended log rotation:
```bash
# /etc/logrotate.d/consultancy
/var/www/consultancy-platform/backend/storage/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

## Backup Strategy

### Database Backups

```bash
# Manual backup
mysqldump -u consultancy -p consultancy > backup-$(date +%Y%m%d).sql

# Automated daily backups (add to cron)
0 2 * * * mysqldump -u consultancy -p'password' consultancy | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

### File Backups

```bash
# Backup storage directory
tar -czf storage-backup-$(date +%Y%m%d).tar.gz /var/www/consultancy-platform/backend/storage
```

### Recommended Schedule

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Database | Daily | 30 days |
| Full | Weekly | 4 weeks |
| Incremental | Daily | 7 days |

## Rollback Procedures

### Using Deployment Script

```bash
# List available backups
./scripts/rollback.sh --list

# Rollback to specific version
./scripts/rollback.sh backup-20240115-120000
```

### Manual Rollback

```bash
# 1. Restore code
git checkout v1.0.0

# 2. Restore dependencies
composer install --no-dev

# 3. Restore database (if needed)
mysql -u consultancy -p consultancy < backup.sql

# 4. Clear caches
php artisan cache:clear
php artisan config:clear

# 5. Restart services
sudo supervisorctl restart consultancy-worker:*
sudo systemctl reload php8.3-fpm
```

## Troubleshooting

### Common Issues

**Application not loading:**
```bash
# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check PHP-FPM
sudo systemctl status php8.3-fpm

# Check logs
tail -f /var/log/nginx/error.log
tail -f /var/www/consultancy-platform/backend/storage/logs/laravel.log
```

**Queue jobs not processing:**
```bash
# Check Supervisor
sudo supervisorctl status

# Restart workers
php artisan queue:restart

# Check failed jobs
php artisan queue:failed
```

**Database connection issues:**
```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo()

# Check MySQL
sudo systemctl status mysql
```

**Cache issues:**
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Check Redis
redis-cli ping
```

### Getting Help

1. Check application logs: `storage/logs/laravel.log`
2. Check system logs: `/var/log/syslog`
3. Run health check: `curl localhost/api/health/detailed`
4. Contact support: support@your-org.com

---

For development setup, see [Development Guide](./DEVELOPMENT.md).
