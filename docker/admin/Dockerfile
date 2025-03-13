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

# Cloudinary environment variables
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_API_KEY
ARG VITE_CLOUDINARY_UPLOAD_PRESET

ENV VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME:-dr0hjlr79}
ENV VITE_CLOUDINARY_API_KEY=${VITE_CLOUDINARY_API_KEY:-586934817968136}
ENV VITE_CLOUDINARY_UPLOAD_PRESET=${VITE_CLOUDINARY_UPLOAD_PRESET:-krovli38_preset}

# Add polyfill for crypto.randomUUID
RUN echo "if (!crypto.randomUUID) { crypto.randomUUID = function() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }; }" > public/polyfill.js

# Debug environment variables
RUN echo "Building with environment variables:" && \
    echo "VITE_API_URL: $VITE_API_URL" && \
    echo "VITE_BASE_URL: $VITE_BASE_URL" && \
    echo "VITE_CLOUDINARY_CLOUD_NAME: $VITE_CLOUDINARY_CLOUD_NAME" && \
    echo "VITE_CLOUDINARY_API_KEY: $VITE_CLOUDINARY_API_KEY" && \
    echo "VITE_CLOUDINARY_UPLOAD_PRESET: $VITE_CLOUDINARY_UPLOAD_PRESET"

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html/admin
COPY --from=build /app/public/polyfill.js /usr/share/nginx/html/admin/

# Modify index.html to include polyfill
RUN sed -i '/<head>/a <script src="/admin/polyfill.js"></script>' /usr/share/nginx/html/admin/index.html

# Copy nginx configuration
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 