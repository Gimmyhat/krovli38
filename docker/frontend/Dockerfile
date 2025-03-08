# Базовый образ с зависимостями - будет переиспользоваться для всех сборок
FROM node:20-alpine AS deps
WORKDIR /app

# Установка глобальных инструментов один раз
RUN apk add --no-cache python3 make g++ git && \
    npm install -g typescript@5.2.2 vite@4.5.0

# Копирование только файлов пакетов для более эффективного кэширования
COPY package*.json ./

# Установка зависимостей с кэшированием
RUN npm ci && \
    npm install @rollup/rollup-linux-x64-musl && \
    npm install --platform=linux --arch=x64 esbuild@0.18.20 @esbuild/linux-x64@0.18.20 && \
    npm cache clean --force

# Этап сборки
FROM deps AS build
WORKDIR /app

# Копирование исходного кода с разделением на статичные и часто меняющиеся файлы
COPY public ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Копирование исходного кода (наиболее часто меняется)
COPY src ./src/

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
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Экспорт порта
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"] 