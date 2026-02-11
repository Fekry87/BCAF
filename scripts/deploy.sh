#!/bin/bash
# =============================================================================
# Deployment Script for Consultancy Platform
# =============================================================================
# Usage: ./scripts/deploy.sh [environment]
# Environments: staging, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
APP_DIR="/var/www/consultancy-platform"
BACKUP_DIR="/var/backups/consultancy-platform"
LOG_FILE="/var/log/deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Pre-deployment checks
check_requirements() {
    log "Checking requirements..."

    command -v php >/dev/null 2>&1 || error "PHP is not installed"
    command -v composer >/dev/null 2>&1 || error "Composer is not installed"
    command -v npm >/dev/null 2>&1 || error "NPM is not installed"
    command -v git >/dev/null 2>&1 || error "Git is not installed"

    success "All requirements met"
}

# Create backup
create_backup() {
    log "Creating backup..."

    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

    # Backup current code
    if [ -d "$APP_DIR" ]; then
        cp -r "$APP_DIR" "$BACKUP_DIR/$BACKUP_NAME/code"
    fi

    # Backup database
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Backing up database..."
        cd "$APP_DIR/backend"
        php artisan backup:run --only-db --disable-notifications 2>/dev/null || warning "Database backup skipped"
    fi

    success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
}

# Pull latest code
pull_code() {
    log "Pulling latest code..."

    cd "$APP_DIR"
    git fetch origin
    git checkout main
    git pull origin main

    success "Code updated"
}

# Install dependencies
install_dependencies() {
    log "Installing backend dependencies..."
    cd "$APP_DIR/backend"

    if [ "$ENVIRONMENT" = "production" ]; then
        composer install --no-dev --optimize-autoloader --no-interaction
    else
        composer install --no-interaction
    fi

    log "Installing frontend dependencies..."
    cd "$APP_DIR/frontend"
    npm ci --prefer-offline

    success "Dependencies installed"
}

# Build frontend
build_frontend() {
    log "Building frontend..."
    cd "$APP_DIR/frontend"

    npm run build

    # Copy build to public directory
    cp -r dist/* "$APP_DIR/backend/public/"

    success "Frontend built"
}

# Run migrations
run_migrations() {
    log "Running database migrations..."
    cd "$APP_DIR/backend"

    php artisan migrate --force

    success "Migrations completed"
}

# Clear and rebuild caches
optimize_application() {
    log "Optimizing application..."
    cd "$APP_DIR/backend"

    # Clear old caches
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear

    if [ "$ENVIRONMENT" = "production" ]; then
        # Rebuild caches for production
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        php artisan event:cache
    fi

    success "Application optimized"
}

# Restart services
restart_services() {
    log "Restarting services..."

    # Restart PHP-FPM
    if systemctl is-active --quiet php8.3-fpm; then
        sudo systemctl reload php8.3-fpm
    elif systemctl is-active --quiet php-fpm; then
        sudo systemctl reload php-fpm
    fi

    # Restart queue workers
    cd "$APP_DIR/backend"
    php artisan queue:restart

    # Restart supervisor if used
    if systemctl is-active --quiet supervisor; then
        sudo supervisorctl reread
        sudo supervisorctl update
        sudo supervisorctl restart consultancy-worker:*
    fi

    success "Services restarted"
}

# Health check
health_check() {
    log "Running health check..."

    # Wait for services to start
    sleep 5

    # Check health endpoint
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health)

    if [ "$HTTP_STATUS" = "200" ]; then
        success "Health check passed"
    else
        error "Health check failed (HTTP $HTTP_STATUS)"
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."

    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +6 | xargs -r rm -rf

    success "Old backups cleaned up"
}

# Notify deployment
notify_deployment() {
    log "Sending deployment notification..."

    # Get git info
    GIT_COMMIT=$(git rev-parse --short HEAD)
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    GIT_MESSAGE=$(git log -1 --pretty=%B)

    # Send notification (implement your preferred method)
    # Example: Slack webhook
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"Deployment completed: $ENVIRONMENT\nCommit: $GIT_COMMIT\nBranch: $GIT_BRANCH\"}" \
    #     "$SLACK_WEBHOOK_URL"

    success "Deployment notification sent"
}

# Main deployment flow
main() {
    echo ""
    echo "=============================================="
    echo " Consultancy Platform Deployment"
    echo " Environment: $ENVIRONMENT"
    echo " Started at: $(date)"
    echo "=============================================="
    echo ""

    check_requirements
    create_backup
    pull_code
    install_dependencies
    build_frontend
    run_migrations
    optimize_application
    restart_services
    health_check
    cleanup_backups
    notify_deployment

    echo ""
    echo "=============================================="
    success "Deployment completed successfully!"
    echo " Finished at: $(date)"
    echo "=============================================="
    echo ""
}

# Run main function
main
