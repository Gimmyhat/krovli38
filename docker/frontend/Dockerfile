# Build stage
FROM node:20-alpine as build

# Set environment variables
ENV NODE_ENV=production
ENV VITE_API_URL=/api

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files and nginx configuration
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 