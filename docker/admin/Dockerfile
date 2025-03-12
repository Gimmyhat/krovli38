# Build stage
FROM node:20-alpine AS build

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy package files
COPY admin-panel/package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY admin-panel/ .

# Set environment variables for build
ENV NODE_ENV=production
ENV VITE_API_URL=/api
ENV VITE_BASE_URL=/admin

# Копируем все иконки в директорию public/admin
RUN mkdir -p public/admin
RUN cp -r public/* public/admin/ || true

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html/admin
COPY --from=build /app/public/admin /usr/share/nginx/html/admin/

# Создаем файл с полифиллом напрямую - максимально простая реализация
RUN echo '(function(){try{window.crypto=window.crypto||{};window.crypto.randomUUID=window.crypto.randomUUID||function(){return Date.now().toString(36)+Math.random().toString(36).substring(2,15)};console.log("Simple polyfill активирован");}catch(e){console.error("Ошибка:",e);}})();' > /usr/share/nginx/html/admin/crypto-simple.js

# Вставляем прямой полифилл в head
RUN sed -i 's/<head>/<head><script>window.crypto=window.crypto||{};window.crypto.randomUUID=window.crypto.randomUUID||function(){return Date.now().toString(36)+Math.random().toString(36).substring(2,15)};<\/script><script src="\/admin\/crypto-simple.js"><\/script>/' /usr/share/nginx/html/admin/index.html

# Вставляем дополнительную проверку в body
RUN sed -i 's/<body>/<body><script>try{var test=window.crypto.randomUUID();console.log("UUID test:",test);}catch(e){console.error("UUID test failed:",e);window.crypto=window.crypto||{};window.crypto.randomUUID=function(){return Date.now().toString(36)+Math.random().toString(36).substring(2,15)}}<\/script>/' /usr/share/nginx/html/admin/index.html

# Copy nginx configuration
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 