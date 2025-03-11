# Variables
DOCKER_COMPOSE = docker compose
DC_FILE = docker/docker-compose.yml
DC_LOCAL_FILE = docker/docker-compose.local.yml
DC_PROD_FILE = docker/docker-compose.prod.yml
ENV_LOCAL = docker/.env.local
ENV_PROD = docker/.env.prod
CURRENT_ENV ?= dev

# Colors for output
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# Help
.PHONY: help dev prod build push clean status backup restore check-env dev-down
help:
	@echo "Доступные команды:"
	@echo "  make dev         - Запуск в режиме разработки"
	@echo "  make dev-down    - Остановка всех контейнеров разработки"
	@echo "  make prod        - Запуск в продакшен режиме"
	@echo "  make prod-down   - Остановка продакшен контейнеров"
	@echo "  make build       - Сборка образов"
	@echo "  make push        - Отправка образов в registry"
	@echo "  make clean       - Очистка неиспользуемых ресурсов"
	@echo "  make status      - Проверка статуса контейнеров"
	@echo "  make backup      - Создание резервной копии БД"
	@echo "  make restore     - Восстановление БД из резервной копии"

# Check if environment file exists
check-env:
ifeq ($(CURRENT_ENV),dev)
	@test -f $(ENV_LOCAL) || (echo "$(RED)Error: $(ENV_LOCAL) file not found$(NC)" && exit 1)
else
	@test -f $(ENV_PROD) || (echo "$(RED)Error: $(ENV_PROD) file not found$(NC)" && exit 1)
endif

# Development
dev: check-env
	@echo "$(GREEN)Starting local environment...$(NC)"
	$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_LOCAL_FILE) --env-file $(ENV_LOCAL) up -d

# Stop development containers
dev-down:
	@echo "$(GREEN)Stopping all development containers...$(NC)"
	$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_LOCAL_FILE) --env-file $(ENV_LOCAL) down
	$(DOCKER_COMPOSE) -f $(DC_FILE) down

# Production
prod: check-env
	@echo "$(GREEN)Starting production environment...$(NC)"
	$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_PROD_FILE) --env-file $(ENV_PROD) up -d

# Stop production containers
prod-down:
	@echo "$(GREEN)Stopping production containers...$(NC)"
	$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_PROD_FILE) --env-file $(ENV_PROD) down

# Build images
build:
	@echo "$(GREEN)Building images...$(NC)"
	$(DOCKER_COMPOSE) -f $(DC_FILE) build

# Push images to registry
push:
	@echo "$(GREEN)Pushing images to registry...$(NC)"
	$(DOCKER_COMPOSE) -f $(DC_FILE) push

# Clean unused resources
clean:
	@echo "$(GREEN)Cleaning unused resources...$(NC)"
	docker system prune -f

# Check status
status:
	@echo "$(GREEN)Checking containers status...$(NC)"
	$(DOCKER_COMPOSE) -f $(DC_FILE) ps

# MongoDB utilities
backup:
	@mkdir -p backup
	$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_PROD_FILE) exec -T mongodb mongodump --archive > backup/mongodb_backup_$$(date +%Y%m%d_%H%M%S).archive

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Укажите файл бэкапа: make restore FILE=backup/mongodb_backup_YYYYMMDD_HHMMSS.archive"; \
		exit 1; \
	fi
	$(DOCKER_COMPOSE) -f $(DC_FILE) -f $(DC_PROD_FILE) exec -T mongodb mongorestore --archive < $(FILE) 