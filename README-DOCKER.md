# DuelCode - Docker Setup Guide

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and start all services
make build
make up

# Or simply:
docker compose up -d
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:80 | React app served via Nginx |
| Backend | http://localhost:8080 | Spring Boot API |
| Judge API | http://localhost:3001 | Node.js code execution service |
| MySQL | localhost:3306 | Database |
| Redis | localhost:6379 | Cache & Sessions |

## Commands

```bash
# Start all services
make up

# Stop all services
make down

# View logs
make logs

# Rebuild everything
make rebuild

# Clean everything (remove containers + volumes)
make clean
```

## Manual Docker Commands

```bash
# Build all images
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Remove volumes too
docker compose down -v
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `MYSQL_ROOT_PASSWORD` - Database root password
- `JWT_SECRET` - JWT signing secret (change in production!)
- `JUDGE_API_KEY` - RapidAPI key for Judge0
- `CORS_ORIGINS` - Allowed CORS origins

## Development

For development with hot reload:

```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend  
cd frontend && npm run dev

# Node Judge Service
cd node_backend && node src/judge.js
```

## Production Considerations

1. **Change default passwords** in `.env`
2. **Set strong JWT_SECRET** (at least 32 characters)
3. **Configure proper CORS origins** for production domain
4. **Add SSL/TLS** termination (use Nginx reverse proxy with HTTPS)
5. **Enable Redis persistence** for production
6. **Configure MySQL** with proper backups
7. **Add monitoring** (Prometheus, Grafana)
