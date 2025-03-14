# Build stage
FROM node:20-alpine AS build

# Устанавливаем только необходимые зависимости для сборки
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Копируем только файлы package.json и package-lock.json для кэширования слоя зависимостей
COPY admin-panel/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем только необходимые файлы для сборки
COPY admin-panel/tsconfig*.json ./
COPY admin-panel/vite.config.ts ./
COPY admin-panel/public ./public
COPY admin-panel/src ./src
COPY admin-panel/index.html ./

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production
ENV VITE_API_URL=/api
ENV VITE_BASE_URL=/admin

# Переменные окружения Cloudinary
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_API_KEY
ARG VITE_CLOUDINARY_UPLOAD_PRESET

ENV VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME:-dr0hjlr79}
ENV VITE_CLOUDINARY_API_KEY=${VITE_CLOUDINARY_API_KEY:-586934817968136}
ENV VITE_CLOUDINARY_UPLOAD_PRESET=${VITE_CLOUDINARY_UPLOAD_PRESET:-krovli38_preset}

# Добавляем полифилл для crypto.randomUUID
RUN echo "if (!crypto.randomUUID) { crypto.randomUUID = function() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }; }" > public/polyfill.js

# Собираем приложение
RUN npm run build

# Production stage
FROM nginx:alpine

# Удаляем стандартные статические файлы nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранные файлы из build stage
COPY --from=build /app/dist /usr/share/nginx/html/admin
COPY --from=build /app/public/polyfill.js /usr/share/nginx/html/admin/

# Модифицируем index.html для включения полифилла
RUN sed -i '/<head>/a <script src="/admin/polyfill.js"></script>' /usr/share/nginx/html/admin/index.html

# Копируем конфигурацию nginx
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем права доступа
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Экспортируем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 