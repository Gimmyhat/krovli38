# Base stage
FROM node:20-alpine AS base

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Development stage
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app
COPY admin-panel/package*.json ./
RUN npm install
COPY admin-panel/ .
EXPOSE 80
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app
COPY admin-panel/package*.json ./
RUN npm ci
COPY admin-panel/ .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /usr/share/nginx/html/admin
COPY --from=builder /app/dist /usr/share/nginx/html/admin
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 