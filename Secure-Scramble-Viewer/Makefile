.PHONY: help build up down restart logs clean backup restore

# Default target
help:
	@echo "SecureScramble Viewer - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo ""
	@echo "Setup:"
	@echo "  setup       - Initial setup (create .env)"
	@echo ""
	@echo "Production:"
	@echo "  build       - Build all Docker images"
	@echo "  up          - Start all services (production)"
	@echo "  down        - Stop all services"
	@echo "  restart     - Restart all services"
	@echo "  status      - Show service status"
	@echo ""
	@echo "Development:"
	@echo "  dev         - Start in development mode (hot reload)"
	@echo "  dev-down    - Stop development services"
	@echo "  dev-logs    - View development logs"
	@echo "  dev-build   - Rebuild development images"
	@echo ""
	@echo "Logs:"
	@echo "  logs        - View logs (all services)"
	@echo "  logs-backend - View backend logs"
	@echo "  logs-frontend - View frontend logs"
	@echo "  logs-nginx  - View nginx logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean       - Stop and remove all containers/volumes"
	@echo "  backup      - Backup database and files"
	@echo "  restore     - Restore from backup"
	@echo "  test        - Test the application"
	@echo ""
	@echo "Shell Access:"
	@echo "  shell-backend - Open backend shell"
	@echo "  shell-db    - Open database shell"
	@echo ""

# Initial setup
setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file"; \
		echo ""; \
		echo "⚠️  IMPORTANT: Edit .env and set a secure SECRET_KEY"; \
		echo "Generate one with: openssl rand -base64 32"; \
	else \
		echo ".env file already exists"; \
	fi

# Build images
build:
	docker-compose build

# Start services
up:
	docker-compose up -d
	@echo ""
	@echo "✅ Services started!"
	@echo ""
	@echo "Access points:"
	@echo "  Frontend:  http://localhost"
	@echo "  API Docs:  http://localhost/docs"
	@echo "  Health:    http://localhost/health"
	@echo ""
	@echo "View logs: make logs"

# Stop services
down:
	docker-compose down

# Restart services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-nginx:
	docker-compose logs -f nginx

logs-postgres:
	docker-compose logs -f postgres

# Show status
status:
	docker-compose ps

# Clean everything
clean:
	@echo "⚠️  This will remove all containers, volumes, and data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker system prune -f; \
		echo "✅ Cleaned up!"; \
	fi

# Backup
backup:
	@mkdir -p backups
	@echo "Backing up database..."
	@docker-compose exec -T postgres pg_dump -U ssv_user ssv_db > backups/db-backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backing up storage..."
	@docker run --rm -v ssv_backend_storage:/data -v $$(pwd)/backups:/backup alpine tar czf /backup/storage-backup-$$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@echo "✅ Backup complete! Files in ./backups/"

# Restore (requires backup files)
restore:
	@echo "Available backups:"
	@ls -lh backups/
	@echo ""
	@read -p "Enter database backup filename: " dbfile; \
	read -p "Enter storage backup filename: " storagefile; \
	echo "Restoring database..."; \
	cat backups/$$dbfile | docker-compose exec -T postgres psql -U ssv_user -d ssv_db; \
	echo "Restoring storage..."; \
	docker run --rm -v ssv_backend_storage:/data -v $$(pwd)/backups:/backup alpine tar xzf /backup/$$storagefile -C /data; \
	echo "✅ Restore complete!"

# Shell access
shell-backend:
	docker-compose exec backend bash

shell-db:
	docker-compose exec postgres psql -U ssv_user -d ssv_db

# Test
test:
	@echo "Testing health endpoint..."
	@curl -f http://localhost/health && echo "✅ Backend healthy" || echo "❌ Backend unhealthy"
	@echo ""
	@echo "Testing frontend..."
	@curl -f http://localhost/ > /dev/null && echo "✅ Frontend accessible" || echo "❌ Frontend not accessible"

# Development mode with hot reload
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "✅ Development mode started with hot reload!"
	@echo ""
	@echo "Access points:"
	@echo "  Frontend:  http://localhost:5173"
	@echo "  Backend:   http://localhost:8000"
	@echo "  API Docs:  http://localhost:8000/docs"
	@echo ""
	@echo "Code changes will auto-reload!"
	@echo "View logs: make dev-logs"

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-build:
	docker-compose -f docker-compose.dev.yml build

# Production commands
prod-build:
	docker-compose build --no-cache

prod-deploy:
	docker-compose up -d --build --force-recreate

# Update
update:
	docker-compose pull
	docker-compose up -d --build
