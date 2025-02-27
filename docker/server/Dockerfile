FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm install

# Copy source code
COPY server/ .

# Build TypeScript code
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server directly with node
CMD ["node", "dist/index.js"] 