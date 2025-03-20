# Project Context
<!-- @cursor:freeze -->
## Architecture
Клиентская часть (фронтенд) → /src/  
Серверная часть (бэкенд) → /server/src/  
Административная панель → /admin-panel/src/  

Структура клиентской части:
- Компоненты → /src/components/
- Контекст → /src/context/
- Хуки → /src/hooks/
- Типы → /src/types/
- Константы → /src/constants/

Структура серверной части:
- API маршруты → /server/src/routes/
- Контроллеры → /server/src/controllers/
- Сервисы → /server/src/services/
- Модели данных → /server/src/models/
- Middleware → /server/src/middleware/
- Утилиты → /server/src/utils/
- Конфигурация → /server/src/config/

Структура административной панели:
- Компоненты → /admin-panel/src/components/
- Страницы → /admin-panel/src/pages/
- API интеграция → /admin-panel/src/api/
- Сервисы → /admin-panel/src/services/
- Маршруты → /admin-panel/src/routes/
- Хуки → /admin-panel/src/hooks/
- Утилиты → /admin-panel/src/utils/
- Типы → /admin-panel/src/types/

## Деплой и CI/CD
- GitHub Actions → /.github/workflows/docker-build.yml
- Docker конфигурация → /docker/
- Nginx конфигурация → /docker/nginx/conf.d/
- SSL-сертификаты → Let's Encrypt с автообновлением через Certbot

## Особенности реализации
- Маршрутизация в админ-панели использует basename="/admin" в BrowserRouter
- Интеграция с Cloudinary для управления изображениями
- Полифилл для crypto.randomUUID → /admin-panel/public/polyfill.js
- Переменные окружения передаются через Docker и GitHub Actions
- HTTPS через Let's Encrypt с автоматическим обновлением сертификатов

<!-- @cursor:dependencies -->
## Dependencies
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.22.1
- @mui/material: ^5.15.10
- @mui/icons-material: ^5.15.10
- @emotion/react: ^11.11.3
- @emotion/styled: ^11.11.0
- @reduxjs/toolkit: ^2.2.1
- react-redux: ^9.1.0
- axios: ^1.6.7
- react-hook-form: ^7.54.2
- @hookform/resolvers: ^4.1.2
- zod: ^3.24.2
- react-beautiful-dnd: ^13.1.1
- react-input-mask: ^2.0.4
- lucide-react: ^0.476.0
- tailwindcss: ^3.3.3
- typescript: ^5.2.2
- vite: ^4.5.0
- cloudinary: ^1.41.3
- mongodb: ^6.3.0
- express: ^4.18.2
- mongoose: ^8.1.3
- jsonwebtoken: ^9.0.2
- multer: ^1.4.5-lts.1
- sharp: ^0.33.2

<!-- @cursor:conventions -->
## Standards
1. Структура проекта: монорепозиторий с тремя основными частями (клиент, сервер, админ-панель)
2. Стиль кода: TypeScript с строгой типизацией
3. Стилизация: Tailwind CSS + Material UI
4. Управление состоянием: Redux Toolkit
5. Валидация форм: React Hook Form + Zod
6. API запросы: Axios
7. Маршрутизация: React Router
8. Сборка: Vite
9. Контейнеризация: Docker
10. Управление изображениями: Cloudinary
11. Обработка ошибок: Централизованная с логированием
12. Переменные окружения: Передаются через Docker и GitHub Actions
13. Безопасность: HTTPS через Let's Encrypt с автообновлением

## Последние улучшения
1. Исправлено дублирование префикса /admin в URL
2. Улучшена обработка ошибок в API
3. Добавлен улучшенный полифилл для crypto.randomUUID
4. Синхронизированы переменные окружения между локальной и продакшн средой
5. Улучшена конфигурация Nginx для работы с Cloudinary
6. Перенесено хранение контента из файловой системы в MongoDB для сохранения изменений при обновлении кода
7. Добавлен скрипт миграции данных из JSON-файла в MongoDB
8. Добавлен том Docker для хранения данных сервера
9. Настроен HTTPS с использованием Let's Encrypt и автоматическим обновлением сертификатов 