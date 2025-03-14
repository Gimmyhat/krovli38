#!/bin/bash
# Скрипт для быстрой пересборки только измененных контейнеров

# Переходим в корневую директорию проекта
cd "$(dirname "$0")/.."

# Функция для вывода сообщений
log() {
  echo -e "\033[1;34m[REBUILD]\033[0m $1"
}

# Проверяем, какой сервис нужно пересобрать
if [ -z "$1" ]; then
  log "Использование: $0 <service_name> [--no-cache]"
  log "Доступные сервисы: server, frontend, admin, all"
  exit 1
fi

SERVICE="$1"
NO_CACHE=""

# Проверяем, нужно ли использовать --no-cache
if [ "$2" == "--no-cache" ]; then
  NO_CACHE="--no-cache"
  log "Пересборка без использования кэша"
fi

# Функция для пересборки сервиса
rebuild_service() {
  local service=$1
  log "Пересборка сервиса: $service"
  docker compose -f docker/docker-compose.yml -f docker/docker-compose.local.yml --env-file docker/.env.local build $NO_CACHE $service
  
  if [ $? -eq 0 ]; then
    log "Перезапуск сервиса: $service"
    docker compose -f docker/docker-compose.yml -f docker/docker-compose.local.yml --env-file docker/.env.local up -d $service
    log "Сервис $service успешно перезапущен"
  else
    log "Ошибка при сборке сервиса $service"
    exit 1
  fi
}

# Пересборка выбранного сервиса или всех сервисов
case "$SERVICE" in
  "server")
    rebuild_service server
    ;;
  "frontend")
    rebuild_service frontend
    ;;
  "admin")
    rebuild_service admin
    ;;
  "all")
    log "Пересборка всех сервисов"
    rebuild_service server
    rebuild_service frontend
    rebuild_service admin
    ;;
  *)
    log "Неизвестный сервис: $SERVICE"
    log "Доступные сервисы: server, frontend, admin, all"
    exit 1
    ;;
esac

log "Готово!"
exit 0 