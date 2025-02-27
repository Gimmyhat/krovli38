# Build stage
FROM node:20-alpine as build

WORKDIR /app
COPY admin-panel/package*.json ./
COPY admin-panel/tsconfig*.json ./
COPY admin-panel/vite.config.ts ./
COPY admin-panel/postcss.config.js ./
COPY admin-panel/tailwind.config.js ./
COPY admin-panel/public/ ./public/
COPY admin-panel/src/ ./src/
COPY admin-panel/index.html ./
RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 