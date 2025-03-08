FROM node:20-alpine

WORKDIR /app

# Установка только production-зависимостей для запуска
COPY server/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Создание слоя только для разработки и сборки
FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci && \
    npm cache clean --force

# Копирование исходного кода
COPY server/tsconfig.json ./
COPY server/src/ ./src/

# Сборка TypeScript кода
RUN npm run build

# Возвращаемся к основному слою
FROM node:20-alpine
WORKDIR /app

# Копируем зависимости из первого этапа
COPY --from=0 /app/node_modules /app/node_modules

# Копируем собранные файлы из этапа builder
COPY --from=builder /app/dist /app/dist
COPY server/package*.json ./

# Создаем директорию для логов с правильными разрешениями
RUN mkdir -p logs && chown -R node:node logs

# Устанавливаем рабочую среду
ENV NODE_ENV=production
ENV PORT=3000

# Переключаемся на непривилегированного пользователя
USER node

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["node", "dist/index.js"] 