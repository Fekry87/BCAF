# =============================================================================
# Consultancy Platform - Makefile
# =============================================================================
# Usage: make [target]
# Run 'make help' for available commands

.PHONY: help install dev build test deploy clean docker

# Default target
.DEFAULT_GOAL := help

# Colors
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

## help: Show this help message
help:
	@echo ""
	@echo "$(CYAN)Consultancy Platform$(RESET)"
	@echo "===================="
	@echo ""
	@echo "$(GREEN)Available commands:$(RESET)"
	@grep -E '^##' Makefile | sed 's/##/  /'
	@echo ""

# =============================================================================
# Development
# =============================================================================

## install: Install all dependencies
install:
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	cd backend && composer install
	cd frontend && npm install
	@echo "$(GREEN)Dependencies installed!$(RESET)"

## setup: Initial project setup
setup:
	@./scripts/setup.sh

## dev: Start development servers
dev:
	@echo "$(CYAN)Starting development servers...$(RESET)"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && php artisan serve

dev-frontend:
	cd frontend && npm run dev

## migrate: Run database migrations
migrate:
	cd backend && php artisan migrate

## seed: Seed the database
seed:
	cd backend && php artisan db:seed

## fresh: Fresh database with seeds
fresh:
	cd backend && php artisan migrate:fresh --seed

# =============================================================================
# Testing
# =============================================================================

## test: Run all tests
test: test-backend test-frontend

## test-backend: Run backend tests
test-backend:
	@echo "$(CYAN)Running backend tests...$(RESET)"
	cd backend && php artisan test

## test-frontend: Run frontend tests
test-frontend:
	@echo "$(CYAN)Running frontend tests...$(RESET)"
	cd frontend && npm run test:run

## test-coverage: Run tests with coverage
test-coverage:
	cd backend && php artisan test --coverage
	cd frontend && npm run test:coverage

## lint: Run linting
lint:
	cd frontend && npm run lint

# =============================================================================
# Build
# =============================================================================

## build: Build for production
build: build-frontend build-backend

## build-frontend: Build frontend assets
build-frontend:
	@echo "$(CYAN)Building frontend...$(RESET)"
	cd frontend && npm run build

## build-backend: Optimize backend
build-backend:
	@echo "$(CYAN)Optimizing backend...$(RESET)"
	cd backend && composer install --no-dev --optimize-autoloader
	cd backend && php artisan config:cache
	cd backend && php artisan route:cache
	cd backend && php artisan view:cache

# =============================================================================
# Docker
# =============================================================================

## docker-build: Build Docker images
docker-build:
	@echo "$(CYAN)Building Docker images...$(RESET)"
	docker-compose build

## docker-up: Start Docker containers
docker-up:
	@echo "$(CYAN)Starting Docker containers...$(RESET)"
	docker-compose up -d

## docker-down: Stop Docker containers
docker-down:
	@echo "$(CYAN)Stopping Docker containers...$(RESET)"
	docker-compose down

## docker-logs: View Docker logs
docker-logs:
	docker-compose logs -f

## docker-shell: Enter app container shell
docker-shell:
	docker-compose exec app sh

## docker-deploy: Deploy with Docker
docker-deploy:
	@./scripts/docker-deploy.sh production

# =============================================================================
# Deployment
# =============================================================================

## deploy-staging: Deploy to staging
deploy-staging:
	@./scripts/deploy.sh staging

## deploy-production: Deploy to production
deploy-production:
	@./scripts/deploy.sh production

## rollback: Rollback to previous version
rollback:
	@./scripts/rollback.sh --list

# =============================================================================
# Maintenance
# =============================================================================

## cache-clear: Clear all caches
cache-clear:
	cd backend && php artisan cache:clear
	cd backend && php artisan config:clear
	cd backend && php artisan route:clear
	cd backend && php artisan view:clear
	@echo "$(GREEN)Caches cleared!$(RESET)"

## queue-restart: Restart queue workers
queue-restart:
	cd backend && php artisan queue:restart

## logs: View Laravel logs
logs:
	tail -f backend/storage/logs/laravel.log

## clean: Clean build artifacts
clean:
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.cache
	rm -rf backend/bootstrap/cache/*.php
	cd backend && php artisan cache:clear
	@echo "$(GREEN)Cleaned!$(RESET)"

# =============================================================================
# Health & Monitoring
# =============================================================================

## health: Check application health
health:
	@curl -s http://localhost:8000/api/health | jq .

## health-detailed: Check detailed health status
health-detailed:
	@curl -s http://localhost:8000/api/health/detailed | jq .

## metrics: View application metrics
metrics:
	@curl -s "http://localhost:8000/api/metrics?token=$(METRICS_TOKEN)" | jq .
