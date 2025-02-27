# Build stage
FROM node:20-alpine AS build

# Set environment variables
ENV NODE_ENV=production
ENV VITE_API_URL=/api

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm ci

# Copy configuration files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY .eslintrc* ./

# Copy source files
COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./

# Install additional build dependencies if needed
RUN npm install -g typescript vite @vitejs/plugin-react

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files and nginx configuration
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 