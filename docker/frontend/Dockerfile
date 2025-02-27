# Build stage
FROM node:20-alpine AS build

# Set environment variables
ENV NODE_ENV=production
ENV VITE_API_URL=/api

# Install build dependencies
RUN apk add --no-cache python3 make g++ git && \
    npm install -g typescript@5.2.2

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
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