# Local Development Setup

This document describes how to set up and run the project locally using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Git
- Make (for Windows, you can use Git Bash or WSL)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/krovli38.git
   cd krovli38
   ```

2. Configure environment variables:
   - Check `docker/.env.local` for development environment variables
   - Make sure MongoDB connection string in `server/.env` uses `mongodb` as the hostname (not `localhost`)

3. Start the development environment:
   ```bash
   make dev
   ```

   This command will:
   - Build all necessary Docker images
   - Start containers for MongoDB, server, frontend, admin panel, and Nginx
   - Set up networking between containers

4. Access the application:
   - Frontend: http://localhost/
   - Admin Panel: http://localhost/admin/
   - API: http://localhost/api/

## Common Issues and Solutions

### MongoDB Connection Issues

If you encounter MongoDB connection errors in the server logs, make sure:

1. The MongoDB connection string in `server/.env` uses `mongodb` as the hostname:
   ```
   MONGO_URI=mongodb://admin:admin_password@mongodb:27017/krovli38?authSource=admin
   MONGODB_URI=mongodb://admin:admin_password@mongodb:27017/krovli38?authSource=admin
   ```

2. The MongoDB container is running and healthy:
   ```bash
   docker ps | grep mongodb
   ```

### Image Loading Issues

If images fail to load in the gallery or admin panel:

1. Check Cloudinary credentials in both `server/.env` and `docker/.env.local`
2. Verify that the server can connect to Cloudinary by checking the logs:
   ```bash
   docker logs docker-server-1
   ```

## Useful Commands

- Start development environment: `make dev`
- Stop development environment: `make dev-down`
- Restart development environment: `make dev-restart`
- View logs: `make logs`
- Check container status: `make status`

## Database Management

- Backup database: `make mongo-dump`
- Restore database: `make mongo-restore`

## Differences Between Local and Production

The main differences between local development and production environments:

1. In local development, services communicate using Docker network hostnames (e.g., `mongodb`)
2. In production, services might be on different servers or use different connection methods

Always ensure your code works in both environments by using environment variables for configuration. 