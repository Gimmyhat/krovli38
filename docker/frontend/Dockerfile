# Build stage
FROM node:20-alpine AS build

# Install build dependencies
RUN apk add --no-cache python3 make g++ git && \
    npm install -g typescript@5.2.2 vite@4.5.0

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies with development packages
ENV NODE_ENV=development
RUN npm ci && \
    npm install @rollup/rollup-linux-x64-musl

# Install specific esbuild version for Linux
RUN npm install --platform=linux --arch=x64 esbuild@0.18.20 @esbuild/linux-x64@0.18.20

# Copy source files
COPY . .

# Show debug info
RUN ls -la && \
    node --version && \
    npm --version

# Set production environment for build
ENV NODE_ENV=production
ENV VITE_API_URL=/api

# Clean dist directory and build the application
RUN rm -rf dist && \
    npm run build

# Production stage
FROM nginx:alpine AS production

# Remove default nginx static assets and create necessary directories
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /usr/share/nginx/html/images

# Copy built files and nginx configuration
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 