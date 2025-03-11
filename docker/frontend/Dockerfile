# Базовый образ с Node.js
FROM node:18-alpine AS build

# Рабочая директория
WORKDIR /app

# Установка необходимых пакетов
RUN apk add --no-cache python3 make g++ git

# Копирование и установка зависимостей
COPY package.json package-lock.json ./
RUN npm ci --quiet

# Копирование файлов проекта
COPY . .

# Явное указание режима production
ENV NODE_ENV=production 

# Настройка максимального размера памяти для Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Предельно простая сборка
RUN npm run build

# Прод образ на основе Nginx
FROM nginx:alpine

# Копирование собранных файлов
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public /usr/share/nginx/html/public

# Копирование конфигурации Nginx
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"] 