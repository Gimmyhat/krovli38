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

# Создаем глобальный полифилл для crypto.randomUUID
RUN mkdir -p /usr/share/nginx/html/admin/polyfills/
RUN echo "window.cryptoPolyfill = { \
  install: function() { \
    if (typeof window.crypto === 'undefined') { \
      window.crypto = {}; \
    } \
    if (typeof window.crypto.randomUUID !== 'function') { \
      window.crypto.randomUUID = function() { \
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { \
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); \
          return v.toString(16); \
        }); \
      }; \
      console.log('Глобальный полифилл crypto.randomUUID установлен'); \
    } \
    try { \
      var testUUID = window.crypto.randomUUID(); \
      console.log('Тест crypto.randomUUID: ' + testUUID); \
      return true; \
    } catch(e) { \
      console.error('Ошибка в полифилле: ' + e); \
      return false; \
    } \
  } \
}; \
window.cryptoPolyfill.install(); \
setInterval(function() { \
  if (typeof window.crypto === 'undefined' || typeof window.crypto.randomUUID !== 'function') { \
    console.warn('crypto.randomUUID был перезаписан, восстанавливаем'); \
    window.cryptoPolyfill.install(); \
  } \
}, 500); \
window.addEventListener('DOMContentLoaded', window.cryptoPolyfill.install); \
window.addEventListener('load', window.cryptoPolyfill.install);" > /usr/share/nginx/html/admin/polyfills/crypto-polyfill.js

# Добавляем глобальный обработчик ошибок связанных с crypto.randomUUID
RUN echo "window.onerror = function(message, source, lineno, colno, error) { \
  if (message && message.toString().includes('crypto.randomUUID')) { \
    console.warn('Перехвачена ошибка: ' + message); \
    if (window.cryptoPolyfill) { \
      window.cryptoPolyfill.install(); \
    } else { \
      window.crypto = window.crypto || {}; \
      window.crypto.randomUUID = function() { \
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { \
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); \
          return v.toString(16); \
        }); \
      }; \
    } \
    return true; \
  } \
  return false; \
};" > /usr/share/nginx/html/admin/polyfills/error-handler.js

# Создаем инлайн-полифилл для вставки в head
RUN echo "window.crypto=window.crypto||{}; \
window.crypto.randomUUID=window.crypto.randomUUID||function() { \
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { \
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); \
    return v.toString(16); \
  }); \
};" > /usr/share/nginx/html/admin/polyfills/inline-polyfill.js

# Вставляем полифиллы в HTML
RUN sed -i '/<head>/a \
    <script>\
    window.crypto=window.crypto||{};\
    window.crypto.randomUUID=window.crypto.randomUUID||function() {\
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {\
        var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);\
        return v.toString(16);\
      });\
    };\
    <\/script>\
    <script src="/admin/polyfills/crypto-polyfill.js"><\/script>' /usr/share/nginx/html/admin/index.html

# Вставляем проверку в body
RUN sed -i '/<body>/a \
    <script>\
    if (!window.crypto || typeof window.crypto.randomUUID !== "function") {\
      console.warn("crypto.randomUUID не обнаружен в body, применяем экстренный полифилл");\
      window.crypto = window.crypto || {};\
      window.crypto.randomUUID = function() {\
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {\
          var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);\
          return v.toString(16);\
        });\
      };\
    }\
    <\/script>' /usr/share/nginx/html/admin/index.html

# Вставляем обработчик ошибок
RUN sed -i '$i\
<script src="/admin/polyfills/error-handler.js"><\/script>\
</body>' /usr/share/nginx/html/admin/index.html

# Copy nginx configuration
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 