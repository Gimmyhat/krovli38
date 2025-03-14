FROM node:20-alpine

WORKDIR /app

# Аргументы сборки
ARG NODE_ENV=production
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET

# Копируем только package.json и package-lock.json для кэширования слоя зависимостей
COPY server/package*.json ./

# Устанавливаем зависимости
ENV NODE_ENV=development
RUN npm ci

# Копируем только необходимые файлы для сборки
COPY server/tsconfig.json ./
COPY server/src ./src
COPY docker/server/startup.sh ./startup.sh

# Создаем директорию для логов и устанавливаем права
RUN mkdir -p logs && \
    chown -R node:node . && \
    chmod +x ./startup.sh

# Собираем TypeScript код
RUN npm run build

# Переключаемся на production окружение
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000

# Переменные окружения Cloudinary
ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME:-dr0hjlr79}
ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY:-586934817968136}
ENV CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET:-YqBkV_O8W2RwDIpOTuEea3ghoFA}

# Отладочная информация
RUN echo "Building with environment variables:" && \
    echo "NODE_ENV: $NODE_ENV"

# Переключаемся на непривилегированного пользователя
USER node

# Экспортируем порт
EXPOSE 3000

# Запускаем сервер с помощью скрипта запуска
CMD ["./startup.sh"] 