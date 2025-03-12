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

# Создаем более надежный полифилл для crypto.randomUUID
RUN echo "/**" > public/admin/crypto-polyfill.js
RUN echo " * Полифилл для crypto.randomUUID" >> public/admin/crypto-polyfill.js
RUN echo " * Этот скрипт добавляет поддержку crypto.randomUUID для старых версий браузеров и Node.js" >> public/admin/crypto-polyfill.js
RUN echo " */" >> public/admin/crypto-polyfill.js
RUN echo "(function() {" >> public/admin/crypto-polyfill.js
RUN echo "  console.log('Инициализация полифилла crypto-polyfill.js');" >> public/admin/crypto-polyfill.js
RUN echo "  " >> public/admin/crypto-polyfill.js
RUN echo "  // Проверяем наличие объекта crypto" >> public/admin/crypto-polyfill.js
RUN echo "  if (typeof window.crypto === 'undefined') {" >> public/admin/crypto-polyfill.js
RUN echo "    console.warn('Объект crypto не найден в window, создаем полифилл');" >> public/admin/crypto-polyfill.js
RUN echo "    window.crypto = {};" >> public/admin/crypto-polyfill.js
RUN echo "  }" >> public/admin/crypto-polyfill.js
RUN echo "  " >> public/admin/crypto-polyfill.js
RUN echo "  // Проверяем наличие метода getRandomValues" >> public/admin/crypto-polyfill.js
RUN echo "  if (typeof window.crypto.getRandomValues !== 'function') {" >> public/admin/crypto-polyfill.js
RUN echo "    console.warn('Метод crypto.getRandomValues не найден, создаем полифилл');" >> public/admin/crypto-polyfill.js
RUN echo "    window.crypto.getRandomValues = function(array) {" >> public/admin/crypto-polyfill.js
RUN echo "      if (!array) return array;" >> public/admin/crypto-polyfill.js
RUN echo "      " >> public/admin/crypto-polyfill.js
RUN echo "      // Безопасное получение длины массива" >> public/admin/crypto-polyfill.js
RUN echo "      const len = array.byteLength || 0;" >> public/admin/crypto-polyfill.js
RUN echo "      // Обрабатываем массив как Uint8Array" >> public/admin/crypto-polyfill.js
RUN echo "      const uint8Array = new Uint8Array(array.buffer, array.byteOffset, len);" >> public/admin/crypto-polyfill.js
RUN echo "      " >> public/admin/crypto-polyfill.js
RUN echo "      for (let i = 0; i < len; i++) {" >> public/admin/crypto-polyfill.js
RUN echo "        uint8Array[i] = Math.floor(Math.random() * 256);" >> public/admin/crypto-polyfill.js
RUN echo "      }" >> public/admin/crypto-polyfill.js
RUN echo "      return array;" >> public/admin/crypto-polyfill.js
RUN echo "    };" >> public/admin/crypto-polyfill.js
RUN echo "  }" >> public/admin/crypto-polyfill.js
RUN echo "  " >> public/admin/crypto-polyfill.js
RUN echo "  // Проверяем наличие метода randomUUID" >> public/admin/crypto-polyfill.js
RUN echo "  if (typeof window.crypto.randomUUID !== 'function') {" >> public/admin/crypto-polyfill.js
RUN echo "    console.warn('Метод crypto.randomUUID не найден, создаем полифилл');" >> public/admin/crypto-polyfill.js
RUN echo "    window.crypto.randomUUID = function() {" >> public/admin/crypto-polyfill.js
RUN echo "      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {" >> public/admin/crypto-polyfill.js
RUN echo "        const r = Math.random() * 16 | 0;" >> public/admin/crypto-polyfill.js
RUN echo "        const v = c === 'x' ? r : (r & 0x3 | 0x8);" >> public/admin/crypto-polyfill.js
RUN echo "        return v.toString(16);" >> public/admin/crypto-polyfill.js
RUN echo "      });" >> public/admin/crypto-polyfill.js
RUN echo "    };" >> public/admin/crypto-polyfill.js
RUN echo "  }" >> public/admin/crypto-polyfill.js
RUN echo "  " >> public/admin/crypto-polyfill.js
RUN echo "  // Проверяем работу полифилла" >> public/admin/crypto-polyfill.js
RUN echo "  try {" >> public/admin/crypto-polyfill.js
RUN echo "    const testUUID = window.crypto.randomUUID();" >> public/admin/crypto-polyfill.js
RUN echo "    console.log('Полифилл crypto.randomUUID успешно установлен:', testUUID);" >> public/admin/crypto-polyfill.js
RUN echo "    window._cryptoPolyfilled = true;" >> public/admin/crypto-polyfill.js
RUN echo "  } catch (error) {" >> public/admin/crypto-polyfill.js
RUN echo "    console.error('Ошибка при проверке полифилла crypto.randomUUID:', error);" >> public/admin/crypto-polyfill.js
RUN echo "  }" >> public/admin/crypto-polyfill.js
RUN echo "  " >> public/admin/crypto-polyfill.js
RUN echo "  console.log('Полифилл crypto-polyfill.js инициализирован');" >> public/admin/crypto-polyfill.js
RUN echo "})();" >> public/admin/crypto-polyfill.js

# Создаем встроенный полифилл для срочного исправления
RUN echo "window.addEventListener('DOMContentLoaded', function() {" > public/inline-polyfill.js
RUN echo "  if (typeof window.crypto === 'undefined') window.crypto = {};" >> public/inline-polyfill.js
RUN echo "  if (typeof window.crypto.randomUUID !== 'function') {" >> public/inline-polyfill.js
RUN echo "    window.crypto.randomUUID = function() {" >> public/inline-polyfill.js
RUN echo "      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {" >> public/inline-polyfill.js
RUN echo "        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);" >> public/inline-polyfill.js
RUN echo "        return v.toString(16);" >> public/inline-polyfill.js
RUN echo "      });" >> public/inline-polyfill.js
RUN echo "    };" >> public/inline-polyfill.js
RUN echo "    console.log('Inline polyfill for crypto.randomUUID installed');" >> public/inline-polyfill.js
RUN echo "  }" >> public/inline-polyfill.js
RUN echo "});" >> public/inline-polyfill.js

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html/admin
COPY --from=build /app/public/admin /usr/share/nginx/html/admin/
COPY --from=build /app/public/inline-polyfill.js /usr/share/nginx/html/admin/

# Modify index.html to include polyfills
RUN sed -i 's/<head>/<head>\n  <script src="\/admin\/crypto-polyfill.js"><\/script>\n  <script>if(typeof window.crypto==="undefined")window.crypto={};if(typeof window.crypto.randomUUID!=="function"){window.crypto.randomUUID=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(\/[xy]\/g,function(c){var r=Math.random()*16|0,v=c==="x"?r:r&3|8;return v.toString(16);});console.log("Immediate crypto.randomUUID polyfill installed");}<\/script>/' /usr/share/nginx/html/admin/index.html

# Copy nginx configuration
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 