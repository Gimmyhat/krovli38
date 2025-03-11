# Base stage
FROM node:20-alpine AS base

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY docker/server/startup.sh ./startup.sh
RUN npm ci --only=production && \
    chmod +x ./startup.sh
EXPOSE 3000
CMD ["./startup.sh"] 