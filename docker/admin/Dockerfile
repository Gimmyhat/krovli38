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

# Создаем директории для скриптов полифиллов
RUN mkdir -p public/admin

# Копируем дополнительные файлы
COPY docker/admin/scripts/crypto-polyfill.js public/admin/
COPY docker/admin/scripts/cloudinary-helper.js public/admin/
COPY docker/admin/scripts/meta-polyfill.js public/admin/

# Копируем все иконки в public/admin директорию
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

# Modify index.html для безопасного подключения полифиллов
RUN sed -i 's/<head>/<head>\n  <script>\n    \/\/ Базовый полифилл для crypto.randomUUID, внедренный напрямую\n    try {\n      if (typeof window.crypto === "undefined") window.crypto = {};\n      if (typeof window.crypto.randomUUID !== "function") {\n        window.crypto.randomUUID = function() {\n          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(\/[xy]\/g, function(c) {\n            var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);\n            return v.toString(16);\n          });\n        };\n        console.log("Inline polyfill активирован");\n      }\n    } catch (e) {\n      console.error("Ошибка в inline polyfill:", e);\n    }\n  <\/script>/' /usr/share/nginx/html/admin/index.html

# Добавляем скрипты после базового полифилла
RUN sed -i '/<\/head>/ i \  <script src="\/admin\/meta-polyfill.js"><\/script>\n  <script src="\/admin\/crypto-polyfill.js"><\/script>\n  <script src="\/admin\/cloudinary-helper.js"><\/script>' /usr/share/nginx/html/admin/index.html

# Copy nginx configuration
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 