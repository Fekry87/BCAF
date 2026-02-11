#!/bin/bash
# =============================================================================
# Initial Setup Script for Consultancy Platform
# =============================================================================
# Usage: ./scripts/setup.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[SETUP]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "=============================================="
echo " Consultancy Platform - Initial Setup"
echo "=============================================="
echo ""

# Check requirements
log "Checking requirements..."

command -v php >/dev/null 2>&1 || error "PHP is required but not installed"
command -v composer >/dev/null 2>&1 || error "Composer is required but not installed"
command -v npm >/dev/null 2>&1 || error "NPM is required but not installed"
command -v mysql >/dev/null 2>&1 || warning "MySQL client not found (optional)"

PHP_VERSION=$(php -r "echo PHP_VERSION;")
log "PHP Version: $PHP_VERSION"

NODE_VERSION=$(node -v)
log "Node Version: $NODE_VERSION"

success "Requirements check passed"

# Backend setup
log "Setting up backend..."
cd "$PROJECT_DIR/backend"

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    log "Created .env file from .env.example"
else
    warning ".env file already exists, skipping copy"
fi

# Install Composer dependencies
log "Installing Composer dependencies..."
composer install

# Generate application key
log "Generating application key..."
php artisan key:generate --force

# Create storage symlink
log "Creating storage symlink..."
php artisan storage:link 2>/dev/null || warning "Storage link already exists"

# Set permissions
log "Setting permissions..."
chmod -R 775 storage bootstrap/cache
chown -R $(whoami):$(whoami) storage bootstrap/cache 2>/dev/null || true

success "Backend setup completed"

# Frontend setup
log "Setting up frontend..."
cd "$PROJECT_DIR/frontend"

# Install NPM dependencies
log "Installing NPM dependencies..."
npm install

success "Frontend setup completed"

# Database setup (optional)
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$PROJECT_DIR/backend"
    log "Running migrations..."
    php artisan migrate

    read -p "Do you want to seed the database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Seeding database..."
        php artisan db:seed
    fi
fi

echo ""
echo "=============================================="
success "Setup completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Configure your .env file in backend/"
echo "  2. Run 'cd backend && php artisan serve' for backend"
echo "  3. Run 'cd frontend && npm run dev' for frontend"
echo ""
echo "=============================================="
