# Docker Optimization Guide

This document describes the optimizations made to the Docker setup to improve development speed and efficiency.

## Optimized Dockerfile Structure

All Dockerfiles have been optimized to:

1. Properly leverage Docker's layer caching
2. Copy only necessary files for each build stage
3. Minimize the number of layers
4. Use specific versions of dependencies for consistency

### Key Optimizations

- **Dependency Caching**: Package files are copied first to cache dependencies
- **Selective Copying**: Only necessary files are copied instead of entire directories
- **Multi-stage Builds**: Used to keep final images small
- **Optimized Commands**: Combined RUN commands where appropriate to reduce layers

## Development Workflow

For local development, we've implemented several optimizations:

1. **Volume Mounts with `:delegated` Flag**: Improves I/O performance on macOS
2. **Node Modules Mounting**: Prevents rebuilding node_modules on every change
3. **Development Mode**: Services run in development mode with hot reloading
4. **MongoDB Memory Optimization**: Limited cache size to reduce memory usage

## Quick Rebuild Commands

To speed up development, we've added commands for rebuilding only specific services:

```bash
# Rebuild and restart only the server
make rebuild-server

# Rebuild and restart only the frontend
make rebuild-frontend

# Rebuild and restart only the admin panel
make rebuild-admin

# Rebuild and restart all services
make rebuild-all
```

For a clean rebuild without using cache:

```bash
make rebuild-server-nocache
make rebuild-frontend-nocache
make rebuild-admin-nocache
make rebuild-all-nocache
```

## Performance Tips

1. **Selective Rebuilds**: Only rebuild the service you're working on
2. **Use Hot Reloading**: Most changes don't require a rebuild
3. **Prune Docker**: Regularly clean unused Docker resources:
   ```bash
   docker system prune -a
   ```
4. **Increase Docker Resources**: Allocate more CPU/memory to Docker in Docker Desktop settings

## Troubleshooting

If you encounter issues with the optimized setup:

1. **Volume Mount Issues**: Try removing `:delegated` flag from volume mounts
2. **Node Modules Conflicts**: Remove node_modules from both container and host, then rebuild
3. **Hot Reload Not Working**: Check that CHOKIDAR_USEPOLLING is set to true
4. **MongoDB Connection Issues**: Ensure MongoDB container is healthy before starting other services

## Further Optimizations

Future optimizations could include:

1. Implementing Docker BuildKit for parallel builds
2. Using Docker Compose profiles for selective service startup
3. Implementing Docker layer compression
4. Setting up a development proxy for better service routing 