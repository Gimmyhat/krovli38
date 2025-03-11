# Build stage
FROM node:20-alpine AS base

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++ git && \
    npm install -g typescript@5.2.2 vite@4.5.0

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 80
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production
RUN npm ci && \
    npm install @rollup/rollup-linux-x64-musl && \
    npm install --platform=linux --arch=x64 esbuild@0.18.20 @esbuild/linux-x64@0.18.20
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /usr/share/nginx/html/images
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 