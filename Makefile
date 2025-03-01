# Variables
DOCKER_COMPOSE = docker compose
DC_FILE = docker/docker-compose.yml
DC_LOCAL_FILE = docker/docker-compose.local.yml
ENV_LOCAL = docker/.env.local
ENV_PROD = docker/.env.prod
CURRENT_ENV ?= dev

# Colors for output
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# Help
.PHONY: help
help:
	@echo "$(GREEN)Available commands:$(NC)"
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make dev              - Start local development environment (stops previous first)"
	@echo "  make dev-down        - Stop local environment"
	@echo "  make dev-restart     - Restart local environment"
	@echo "  make logs            - View logs"
	@echo "$(YELLOW)Production:$(NC)"
	@echo "  make prod            - Start production environment (for testing/emergency only, normally use CI/CD)"
	@echo "  make prod-down       - Stop production environment"
	@echo "  make prod-restart    - Restart production environment"
	@echo "$(YELLOW)Utilities:$(NC)"
	@echo "  make build           - Build all images"
	@echo "  make push            - Push images to registry"
	@echo "  make clean           - Clean unused images and volumes"
	@echo "  make status          - Container status"
	@echo "  make mongo-dump      - Backup database"
	@echo "  make mongo-restore   - Restore database"

# Development
# For local development with hot-reload and debugging capabilities
.PHONY: dev
dev: dev-down prod-down
	@echo "$(GREEN)Starting local environment...$(NC)"
	@echo "$(YELLOW)Note: Both development and production environments were stopped to prevent conflicts$(NC)"
	@$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_LOCAL_FILE) --env-file $(ENV_LOCAL) up -d --build

.PHONY: dev-down
dev-down:
	@echo "$(RED)Stopping local environment...$(NC)"
	@$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_LOCAL_FILE) --env-file $(ENV_LOCAL) down

.PHONY: dev-restart
dev-restart: dev-down dev

# Production
# Note: Primary deployment should be done via GitHub Actions CI/CD
# These commands are for:
# - Local testing of production configuration
# - Emergency manual deployment if CI/CD fails
# - Managing existing production environment
.PHONY: prod
prod: prod-down dev-down
	@echo "$(RED)⚠️  Warning: You are starting the PRODUCTION environment locally! ⚠️$(NC)"
	@echo "$(YELLOW)Note: Both development and production environments were stopped to prevent conflicts$(NC)"
	@read -p "Are you sure you want to continue? [y/N] " confirm; \
	if [ "$$confirm" = "y" ]; then \
		echo "$(GREEN)Starting production environment...$(NC)"; \
		$(DOCKER_COMPOSE) -f $(DC_FILE) --env-file $(ENV_PROD) up -d --build; \
	else \
		echo "$(GREEN)Operation cancelled$(NC)"; \
	fi

.PHONY: prod-down
prod-down:
	@echo "$(RED)Stopping production environment...$(NC)"
	@$(DOCKER_COMPOSE) -f $(DC_FILE) --env-file $(ENV_PROD) down

.PHONY: prod-restart
prod-restart: prod-down prod

# Common commands with environment check
# Default environment is 'dev', use CURRENT_ENV=prod for production
.PHONY: down
down:
	@if [ "$(CURRENT_ENV)" = "prod" ]; then \
		echo "$(RED)⚠️  You are about to stop the PRODUCTION environment! ⚠️$(NC)"; \
		read -p "Are you sure? [y/N] " confirm; \
		if [ "$$confirm" = "y" ]; then \
			make prod-down; \
		else \
			echo "$(GREEN)Operation cancelled$(NC)"; \
		fi \
	else \
		make dev-down; \
	fi

.PHONY: restart
restart:
	@if [ "$(CURRENT_ENV)" = "prod" ]; then \
		make prod-restart; \
	else \
		make dev-restart; \
	fi

.PHONY: logs
logs:
	@if [ "$(CURRENT_ENV)" = "prod" ]; then \
		$(DOCKER_COMPOSE) -f $(DC_FILE) --env-file $(ENV_PROD) logs -f; \
	else \
		$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_LOCAL_FILE) --env-file $(ENV_LOCAL) logs -f; \
	fi

# Utilities
# Build/push commands are typically used by CI/CD
# Clean/status are useful for both environments
.PHONY: build
build:
	@echo "$(GREEN)Building images...$(NC)"
	@$(DOCKER_COMPOSE) -f $(DC_FILE) build

.PHONY: push
push:
	@echo "$(GREEN)Pushing images to registry...$(NC)"
	@$(DOCKER_COMPOSE) -f $(DC_FILE) push

.PHONY: clean
clean:
	@echo "$(RED)Cleaning unused resources...$(NC)"
	@docker system prune -f
	@docker volume prune -f

.PHONY: status
status:
	@echo "$(GREEN)Container status:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# MongoDB utilities
# These commands work in both environments
# Use CURRENT_ENV=prod for production database operations
.PHONY: mongo-dump
mongo-dump:
	@echo "$(GREEN)Creating database backup...$(NC)"
	@mkdir -p ./backup
	@docker exec -t krovli38-mongodb mongodump --uri="mongodb://$(MONGO_USER):$(MONGO_PASSWORD)@localhost:27017/$(MONGO_DB)?authSource=admin" --out=/backup/
	@docker cp krovli38-mongodb:/backup ./backup
	@echo "$(GREEN)Backup created in ./backup directory$(NC)"

.PHONY: mongo-restore
mongo-restore:
	@echo "$(GREEN)Restoring database from backup...$(NC)"
	@docker cp ./backup krovli38-mongodb:/
	@docker exec -t krovli38-mongodb mongorestore --uri="mongodb://$(MONGO_USER):$(MONGO_PASSWORD)@localhost:27017/$(MONGO_DB)?authSource=admin" /backup/

# Dependency check
.PHONY: check
check:
	@echo "$(GREEN)Checking dependencies...$(NC)"
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)Docker is not installed$(NC)" >&2; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "$(RED)Docker Compose is not installed$(NC)" >&2; exit 1; }
	@echo "$(GREEN)All dependencies are installed$(NC)" 