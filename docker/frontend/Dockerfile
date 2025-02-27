# Build stage
FROM node:20-alpine AS build

# Set environment variables
ENV NODE_ENV=production
ENV VITE_API_URL=/api

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Show directory contents and TypeScript version for debugging
RUN ls -la && \
    npx tsc --version && \
    node --version && \
    npm --version

# Build the application with detailed error output
RUN npm run build || (cat /tmp/build-error.log && exit 1)

# Production stage
FROM nginx:alpine AS production

# Copy built files and nginx configuration
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 