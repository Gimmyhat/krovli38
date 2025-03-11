# Build stage
FROM node:20-alpine AS base

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Копируем package файлы
COPY package*.json ./
COPY src/package*.json ./src/

# Development stage
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app/src
RUN npm install
COPY ./src .
EXPOSE 80
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app/src
RUN npm ci
COPY ./src .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /usr/share/nginx/html/images
COPY --from=builder /app/src/dist /usr/share/nginx/html
COPY --from=builder /app/src/public /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 