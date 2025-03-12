FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY server/package*.json ./

# Install ALL dependencies including devDependencies
ENV NODE_ENV=development
RUN npm install

# Copy source code and startup script
COPY server/ .
COPY docker/server/startup.sh ./startup.sh

# Create logs directory and upload directories
RUN mkdir -p logs && \
    mkdir -p public/uploads && \
    mkdir -p public/uploads/thumbnails && \
    chown -R node:node . && \
    chmod +x ./startup.sh && \
    chmod -R 755 public/uploads

# Build TypeScript code (включая все скрипты)
RUN npm run build

# Switch to production environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the server with startup script
CMD ["./startup.sh"] 