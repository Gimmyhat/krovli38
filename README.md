# Krovli38 - Сайт компании по ремонту кровли

Проект включает в себя основной сайт компании, административную панель для управления заявками и серверную часть на Node.js.

## Структура проекта

- `/` - Основной сайт компании (React + Vite + Tailwind CSS)
- `/admin-panel` - Административная панель (React + Vite + Mantine UI + Tailwind CSS)
- `/server` - Серверная часть (Node.js + Express + MongoDB)

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
- Node.js 18+
- MongoDB (локально или через Docker)
- npm или yarn

### Установка зависимостей

```bash
# Установка зависимостей основного сайта
npm install

# Установка зависимостей админ-панели
cd admin-panel
npm install

# Установка зависимостей сервера
cd ../server
npm install
```

### Запуск MongoDB через Docker

```bash
cd server
docker-compose up -d
```

### Запуск проекта в режиме разработки

```bash
# Запуск всех компонентов одновременно
npm run start-all

# Или запуск компонентов по отдельности:

# Запуск сервера
cd server
npm run dev

# Запуск админ-панели
cd admin-panel
npm run dev

# Запуск основного сайта
cd ..
npm run dev
```

### Сборка проекта для продакшена

```bash
# Сборка основного сайта
npm run build

# Сборка админ-панели
cd admin-panel
npm run build

# Сборка сервера
cd ../server
npm run build
```

## Доступ к приложениям

- Основной сайт: http://localhost:5173
- Админ-панель: http://localhost:5174
- API сервер: http://localhost:3000

## Доступ к админ-панели

Для входа в админ-панель используйте следующие учетные данные:

- Email: admin@krovli38.ru
- Пароль: admin123456

## Документация

Дополнительная документация доступна в следующих файлах:

- [Роадмап проекта](ROADMAP.md)
- [API документация](server/API.md)

## Лицензия

Проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).