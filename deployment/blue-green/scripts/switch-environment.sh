#!/bin/bash

# Blue-Green Environment Switcher
# Usage: ./switch-environment.sh [blue|green]
#
# This script handles the traffic switch between Blue and Green environments
# with health checks and automatic rollback on failure.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"
NGINX_CONF="$DEPLOYMENT_DIR/nginx/nginx.conf"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Get current active environment
get_active_env() {
    if grep -q "server app-blue:8000 weight=1" "$NGINX_CONF" | grep -v "#"; then
        echo "blue"
    else
        echo "green"
    fi
}

# Health check function
health_check() {
    local env=$1
    local max_retries=5
    local retry_delay=5
    local container="consultancy-app-$env"

    log_info "Running health check for $env environment..."

    for i in $(seq 1 $max_retries); do
        if docker exec "$container" curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
            log_success "Health check passed for $env (attempt $i/$max_retries)"
            return 0
        fi
        log_warning "Health check failed for $env (attempt $i/$max_retries), retrying in ${retry_delay}s..."
        sleep $retry_delay
    done

    log_error "Health check failed for $env after $max_retries attempts"
    return 1
}

# Switch nginx to target environment
switch_nginx() {
    local target=$1
    local backup_file="$NGINX_CONF.backup"

    log_info "Switching nginx to $target environment..."

    # Backup current config
    cp "$NGINX_CONF" "$backup_file"

    if [ "$target" = "blue" ]; then
        # Activate Blue, deactivate Green
        sed -i.tmp '
            /upstream app_active {/,/}/ {
                s/# *server app-blue:8000/server app-blue:8000/
                s/^[[:space:]]*server app-green:8000/# server app-green:8000/
            }
        ' "$NGINX_CONF"
    else
        # Activate Green, deactivate Blue
        sed -i.tmp '
            /upstream app_active {/,/}/ {
                s/^[[:space:]]*server app-blue:8000/# server app-blue:8000/
                s/# *server app-green:8000/server app-green:8000/
            }
        ' "$NGINX_CONF"
    fi

    rm -f "$NGINX_CONF.tmp"
}

# Reload nginx
reload_nginx() {
    log_info "Reloading nginx configuration..."

    if docker exec consultancy-nginx nginx -t > /dev/null 2>&1; then
        docker exec consultancy-nginx nginx -s reload
        log_success "Nginx reloaded successfully"
        return 0
    else
        log_error "Nginx configuration test failed"
        return 1
    fi
}

# Rollback to previous configuration
rollback() {
    local backup_file="$NGINX_CONF.backup"

    if [ -f "$backup_file" ]; then
        log_warning "Rolling back to previous configuration..."
        cp "$backup_file" "$NGINX_CONF"
        reload_nginx
        log_success "Rollback completed"
    else
        log_error "No backup file found for rollback"
    fi
}

# Main function
main() {
    local target_env=$1

    if [ -z "$target_env" ]; then
        echo "Usage: $0 [blue|green]"
        echo ""
        echo "Current active environment: $(get_active_env)"
        exit 1
    fi

    if [ "$target_env" != "blue" ] && [ "$target_env" != "green" ]; then
        log_error "Invalid environment: $target_env. Use 'blue' or 'green'"
        exit 1
    fi

    local current_env=$(get_active_env)

    if [ "$target_env" = "$current_env" ]; then
        log_warning "$target_env is already the active environment"
        exit 0
    fi

    log_info "Switching from $current_env to $target_env environment"

    # Step 1: Health check target environment
    if ! health_check "$target_env"; then
        log_error "Target environment $target_env is not healthy. Aborting switch."
        exit 1
    fi

    # Step 2: Switch nginx configuration
    switch_nginx "$target_env"

    # Step 3: Reload nginx
    if ! reload_nginx; then
        log_error "Failed to reload nginx. Rolling back..."
        rollback
        exit 1
    fi

    # Step 4: Verify switch
    sleep 2
    if curl -sf http://localhost/api/health > /dev/null 2>&1; then
        log_success "Successfully switched to $target_env environment!"
        log_info "Previous environment ($current_env) is still running as standby"
    else
        log_error "Switch verification failed. Rolling back..."
        rollback
        exit 1
    fi
}

# Run main function
main "$@"
