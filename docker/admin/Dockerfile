# Базовый образ с зависимостями - будет переиспользоваться для всех сборок
FROM node:20-alpine AS deps
WORKDIR /app

# Установка глобальных инструментов один раз
RUN apk add --no-cache python3 make g++ git && \
    npm install -g typescript@5.2.2 vite@4.5.0

# Копирование только файлов пакетов для более эффективного кэширования
COPY admin-panel/package*.json ./

# Установка только необходимых зависимостей с правильным кэшированием
RUN npm ci && \
    npm install @rollup/rollup-linux-x64-musl && \
    npm install esbuild@0.21.5 && \
    npm cache clean --force

# Этап сборки
FROM deps AS build
WORKDIR /app

# Копирование исходного кода
# Разделяем копирование на статические ресурсы и файлы кода для лучшего кэширования
COPY admin-panel/public ./public/
COPY admin-panel/index.html ./
COPY admin-panel/vite.config.ts ./
COPY admin-panel/tsconfig*.json ./

# Копирование исходного кода (самое частое изменение)
COPY admin-panel/src ./src/

# Параметры сборки
ENV NODE_ENV=production
ENV VITE_API_URL=/api

# Сборка приложения
RUN npm run build

# Этап продакшена (финальный образ)
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Копирование только собранных файлов
COPY --from=build /app/dist ./
COPY admin-panel/nginx.conf /etc/nginx/conf.d/default.conf

# Экспорт порта
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"] 