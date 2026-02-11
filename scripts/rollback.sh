#!/bin/bash
# =============================================================================
# Rollback Script for Consultancy Platform
# =============================================================================
# Usage: ./scripts/rollback.sh [backup_name]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_DIR="/var/www/consultancy-platform"
BACKUP_DIR="/var/backups/consultancy-platform"
BACKUP_NAME=${1:-}

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# List available backups
list_backups() {
    echo ""
    echo "Available backups:"
    echo "=================="
    ls -lt "$BACKUP_DIR" | tail -n +2
    echo ""
}

# Rollback to specified backup
rollback() {
    if [ -z "$BACKUP_NAME" ]; then
        list_backups
        error "Please specify a backup name: ./rollback.sh backup-YYYYMMDD-HHMMSS"
    fi

    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

    if [ ! -d "$BACKUP_PATH" ]; then
        error "Backup not found: $BACKUP_PATH"
    fi

    log "Rolling back to: $BACKUP_NAME"

    # Stop services
    log "Stopping services..."
    sudo supervisorctl stop consultancy-worker:* 2>/dev/null || true

    # Restore code
    log "Restoring code..."
    rm -rf "$APP_DIR"
    cp -r "$BACKUP_PATH/code" "$APP_DIR"

    # Restore database if backup exists
    if [ -d "$BACKUP_PATH/database" ]; then
        log "Restoring database..."
        cd "$APP_DIR/backend"
        php artisan backup:restore --path="$BACKUP_PATH/database" --no-interaction
    fi

    # Clear caches
    log "Clearing caches..."
    cd "$APP_DIR/backend"
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear

    # Restart services
    log "Restarting services..."
    sudo systemctl reload php8.3-fpm 2>/dev/null || sudo systemctl reload php-fpm
    sudo supervisorctl start consultancy-worker:* 2>/dev/null || true

    success "Rollback completed to: $BACKUP_NAME"
}

# Main
if [ "$1" = "--list" ] || [ "$1" = "-l" ]; then
    list_backups
else
    rollback
fi
