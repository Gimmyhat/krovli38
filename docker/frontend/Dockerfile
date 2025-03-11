# Build stage
FROM node:20-alpine AS base

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Development stage
FROM base AS development
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production

# Копируем только необходимые файлы для сборки
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY index.html ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY public/ ./public/
COPY src/ ./src/

# Отладка: проверяем содержимое директории
RUN ls -la

# Отладка: выводим содержимое package.json
RUN cat package.json

# Сборка с подробным выводом
RUN set -x && \
    export NODE_OPTIONS="--max-old-space-size=4096" && \
    npm install -g vite && \
    npx vite --version && \
    NODE_ENV=production npx vite build --mode production

# Production stage
FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /usr/share/nginx/html/images
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 