# Build stage
FROM node:20-alpine AS build

# Устанавливаем только необходимые зависимости для сборки
RUN apk add --no-cache python3 make g++ git && \
    npm install -g typescript@5.2.2 vite@4.5.0

WORKDIR /app

# Копируем только файлы package.json и package-lock.json для кэширования слоя зависимостей
COPY package*.json ./

# Устанавливаем зависимости
ENV NODE_ENV=development
RUN npm ci && \
    npm install @rollup/rollup-linux-x64-musl

# Устанавливаем специфичную версию esbuild для Linux
RUN npm install --platform=linux --arch=x64 esbuild@0.18.20 @esbuild/linux-x64@0.18.20

# Копируем только необходимые файлы для сборки
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY public ./public
COPY src ./src

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV VITE_API_URL=/api

# Собираем приложение
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Удаляем стандартные статические файлы nginx и создаем необходимые директории
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /usr/share/nginx/html/images

# Копируем собранные файлы и конфигурацию nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Экспортируем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 