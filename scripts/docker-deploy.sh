#!/bin/bash
# =============================================================================
# Docker Deployment Script for Consultancy Platform
# =============================================================================
# Usage: ./scripts/docker-deploy.sh [environment]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"
IMAGE_TAG=${2:-latest}

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "=============================================="
echo " Docker Deployment"
echo " Environment: $ENVIRONMENT"
echo " Image Tag: $IMAGE_TAG"
echo "=============================================="
echo ""

# Pre-flight checks
log "Running pre-flight checks..."

if [ ! -f ".env" ]; then
    error ".env file not found. Copy .env.example to .env and configure it."
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    error "docker-compose.yml not found"
fi

command -v docker >/dev/null 2>&1 || error "Docker is not installed"
command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"

success "Pre-flight checks passed"

# Pull latest images
log "Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" pull

# Build images if needed
log "Building images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Stop current containers
log "Stopping current containers..."
docker-compose -f "$COMPOSE_FILE" down --remove-orphans

# Start new containers
log "Starting new containers..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
log "Waiting for services to be healthy..."
sleep 10

# Check container health
UNHEALTHY=$(docker-compose -f "$COMPOSE_FILE" ps | grep -c "unhealthy" || true)
if [ "$UNHEALTHY" -gt 0 ]; then
    warning "Some containers are unhealthy"
    docker-compose -f "$COMPOSE_FILE" ps
fi

# Run migrations
log "Running database migrations..."
docker-compose -f "$COMPOSE_FILE" exec -T app php artisan migrate --force

# Clear caches
log "Clearing caches..."
docker-compose -f "$COMPOSE_FILE" exec -T app php artisan cache:clear
docker-compose -f "$COMPOSE_FILE" exec -T app php artisan config:cache
docker-compose -f "$COMPOSE_FILE" exec -T app php artisan route:cache

# Health check
log "Running health check..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health)
if [ "$HTTP_STATUS" = "200" ]; then
    success "Health check passed"
else
    warning "Health check returned HTTP $HTTP_STATUS"
fi

# Cleanup old images
log "Cleaning up old images..."
docker image prune -f

# Show running containers
log "Running containers:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo "=============================================="
success "Docker deployment completed!"
echo "=============================================="
echo ""
