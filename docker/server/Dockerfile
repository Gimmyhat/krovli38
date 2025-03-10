FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY server/package*.json ./

# Install ALL dependencies including devDependencies
ENV NODE_ENV=development
RUN npm install

# Copy source code
COPY server/ .

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R node:node logs

# Build TypeScript code
RUN npm run build

# Compile the addLogoSizeSetting script
RUN npx tsc src/scripts/addLogoSizeSetting.ts --outDir dist/scripts

# Switch to production environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"] 