# Krovli38 - Сайт компании по ремонту кровли

Проект включает в себя основной сайт компании, административную панель для управления заявками и серверную часть на Node.js. Вся инфраструктура проекта контейнеризирована с использованием Docker.

## Текущий статус проекта
- ✅ Версия 1.0 - Завершена (базовая функциональность)
- ✅ Версия 2.0 - Завершена (админ-панель и API)
- 🚀 Версия 3.0 - В разработке (безопасность и оптимизация)

## Структура проекта

- `/` - Основной сайт компании (React + Vite + Tailwind CSS)
- `/admin-panel` - Административная панель (React + Vite + Mantine UI + Tailwind CSS)
- `/server` - Серверная часть (Node.js + Express + MongoDB)
- `/docker` - Docker конфигурации:
  - `docker-compose.yml` - Основная конфигурация для продакшена
  - `docker-compose.local.yml` - Конфигурация для локальной разработки с оптимизациями
  - `docker-compose.dev.yml` - Конфигурация для разработки
  - `/nginx` - Конфигурация Nginx и SSL
  - `/mongodb` - Конфигурация MongoDB
  - `/frontend`, `/admin`, `/server` - Оптимизированные Dockerfile'ы для каждого сервиса
- `/scripts` - Вспомогательные скрипты:
  - `rebuild.sh` - Скрипт для быстрой пересборки отдельных сервисов
- `/docs` - Документация:
  - `docker-optimization.md` - Руководство по оптимизации Docker
- `/.github` - GitHub Actions для CI/CD

## Реализованный функционал
- Основной сайт с адаптивным дизайном
- Форма обратной связи
- Административная панель с авторизацией
- API сервер с JWT аутентификацией
- Автоматический деплой через GitHub Actions
- Автоматическое резервное копирование БД
- Мониторинг здоровья сервисов
- Система автоматического отката при ошибках
- Оптимизированная Docker-инфраструктура для быстрой разработки
- Система быстрой пересборки отдельных сервисов

## Технологии

### Основной сайт
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Админ-панель
- React 18
- TypeScript
- Vite
- Mantine UI
- Tailwind CSS
- React Router

### Сервер
- Node.js
- Express
- MongoDB (Mongoose)
- JWT для аутентификации
- Winston для логирования

## Установка и запуск

### Предварительные требования
- Docker 20.10+
- Docker Compose v2.0+
- Make (для использования Makefile команд)

### Быстрый старт

```bash
# Проверка зависимостей
make check

# Просмотр всех доступных команд
make help
```

### Команды для разработки

```bash
# Запуск локальной среды (автоматически останавливает предыдущую)
make dev

# Остановка локальной среды
make dev-down
# или
make down  # по умолчанию останавливает dev-среду

# Перезапуск локальной среды
make dev-restart

# Просмотр логов
make logs

# Быстрая пересборка отдельных сервисов
make rebuild-server     # Пересборка только сервера
make rebuild-frontend   # Пересборка только фронтенда
make rebuild-admin      # Пересборка только админ-панели
make rebuild-all        # Пересборка всех сервисов

# Пересборка без использования кэша
make rebuild-server-nocache
make rebuild-frontend-nocache
make rebuild-admin-nocache
make rebuild-all-nocache
```

### Команды для продакшена

```bash
# Запуск продакшен среды
make prod

# Остановка продакшен среды (с подтверждением)
CURRENT_ENV=prod make down
# или напрямую (без подтверждения)
make prod-down

# Перезапуск продакшен среды
make prod-restart
```

### Утилиты

```bash
# Статус контейнеров
make status

# Бэкап базы данных
make mongo-dump

# Восстановление базы данных
make mongo-restore

# Очистка неиспользуемых ресурсов
make clean

# Сборка образов
make build

# Отправка образов в registry
make push
```

### Альтернативный запуск (без Make)

#### В продакшен режиме
```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env.prod up -d --build
```

#### В режиме локальной разработки
```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.local.yml --env-file docker/.env.local up -d --build
```

## Доступ к приложениям

В продакшен режиме:
- Основной сайт: https://krovli38.ru
- Админ-панель: https://admin.krovli38.ru
- API сервер: https://api.krovli38.ru

В режиме разработки:
- Основной сайт: http://localhost:5173
- Админ-панель: http://localhost:5174
- API сервер: http://localhost:3000

## Доступ к админ-панели

Для входа в админ-панель используйте следующие учетные данные:

- Email: admin@krovli38.ru
- Пароль: admin123456

## Мониторинг и поддержка

- Автоматическое резервное копирование БД каждые 24 часа
- Мониторинг здоровья сервисов через Docker healthcheck
- Автоматический откат при критических ошибках
- Логирование всех действий в системе
- Nginx логи доступны в `/docker/nginx/logs`
- Мониторинг состояния контейнеров через Docker stats

## Безопасность

- JWT аутентификация
- SSL/TLS шифрование (через Nginx)
- Защита от основных типов атак
- Валидация всех входящих данных
- Изолированная сеть Docker для всех сервисов
- Автоматическая проверка зависимостей на уязвимости

## Документация

Дополнительная документация доступна в следующих файлах:

- [Роадмап проекта](roadmap.md)
- [API документация](server/API.md)
- [Инструкция по деплою](docs/deployment.md)
- [Руководство по разработке](docs/development.md)
- [Оптимизация Docker](docs/docker-optimization.md)

## Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функциональности (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте изменения в репозиторий (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## Лицензия

Проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).