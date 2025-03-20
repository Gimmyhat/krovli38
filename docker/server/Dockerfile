FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Аргументы сборки
ARG NODE_ENV=production
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET

# Install dependencies
COPY server/package*.json ./

# Install ALL dependencies including devDependencies
ENV NODE_ENV=development
RUN npm install

# Copy source code and startup script
COPY server/ .
COPY docker/server/startup.sh ./startup.sh

# Create logs directory and set permissions
RUN mkdir -p logs && \
    chown -R node:node . && \
    chmod +x ./startup.sh

# Build TypeScript code (включая все скрипты)
RUN npm run build

# Switch to production environment
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000

# Cloudinary environment variables
ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME:-dr0hjlr79}
ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY:-586934817968136}
ENV CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET:-YqBkV_O8W2RwDIpOTuEea3ghoFA}

# Debug environment variables
RUN echo "Building with environment variables:" && \
    echo "NODE_ENV: $NODE_ENV" && \
    echo "CLOUDINARY_CLOUD_NAME: $CLOUDINARY_CLOUD_NAME" && \
    echo "CLOUDINARY_API_KEY: $CLOUDINARY_API_KEY"

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the server with startup script
CMD ["./startup.sh"] 