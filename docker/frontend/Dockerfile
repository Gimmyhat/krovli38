# Build stage
FROM node:20-alpine as build

WORKDIR /app
COPY src/package*.json ./
COPY src/tsconfig*.json ./
COPY src/vite.config.ts ./
COPY src/postcss.config.js ./
COPY src/tailwind.config.js ./
COPY src/public/ ./public/
COPY src/src/ ./src/
COPY src/index.html ./
RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 