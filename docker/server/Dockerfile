# Базовый образ с Node.js
FROM node:18-alpine AS build

# Рабочая директория
WORKDIR /app

# Установка необходимых пакетов
RUN apk add --no-cache python3 make g++ git

# Глобальная установка TypeScript
RUN npm install -g typescript

# Копирование и установка зависимостей
COPY server/package.json server/package-lock.json ./
RUN npm ci --quiet

# Копирование файлов проекта
COPY server/ ./

# Явное указание режима production
ENV NODE_ENV=production 

# Настройка максимального размера памяти для Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Сборка с использованием TypeScript
RUN npx tsc

# Прод образ
FROM node:18-alpine

# Рабочая директория
WORKDIR /app

# Копирование только необходимых файлов для production
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY docker/server/startup.sh ./startup.sh

# Установка только production зависимостей
RUN npm ci --quiet --only=production && \
    chmod +x ./startup.sh

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["./startup.sh"] 