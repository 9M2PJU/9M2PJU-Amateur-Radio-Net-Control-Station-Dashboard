# Docker Deployment Guide

## 🐳 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Supports ARM64 and AMD64 architectures

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration
POSTGRES_DB=ncs_database
POSTGRES_USER=ncs_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432

# Web Application Port
WEB_PORT=3000
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### 3. Access the Application

- **Web Interface**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## 📦 Services

### Web Application
- **Image**: Built from Dockerfile (multi-stage)
- **Port**: 3000 (configurable via `WEB_PORT`)
- **Technology**: Vite + React + Nginx

### PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432 (configurable via `POSTGRES_PORT`)
- **Data**: Persisted in Docker volume `postgres_data`

## 🔧 Database Initialization

The database will automatically initialize with your SQL migrations from the `supabase/` directory on first run.

To manually run migrations:
```bash
# Access PostgreSQL container
docker-compose exec postgres psql -U ncs_user -d ncs_database

# Run a specific SQL file
docker-compose exec postgres psql -U ncs_user -d ncs_database -f /docker-entrypoint-initdb.d/your_migration.sql
```

## 🔐 Important Notes

### Authentication
This Docker setup uses **PostgreSQL for data storage** but still requires **Supabase Auth** for authentication. You have two options:

1. **Continue using Supabase Cloud Auth** (Recommended)
   - Keep your existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Data is stored locally in PostgreSQL
   - Authentication handled by Supabase cloud

2. **Self-hosted Auth** (Advanced)
   - Requires setting up Supabase Auth locally
   - See: https://supabase.com/docs/guides/self-hosting

### Data Migration from Supabase Cloud

To migrate data from Supabase cloud to local PostgreSQL:

```bash
# 1. Export from Supabase (using pg_dump)
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# 2. Import to local PostgreSQL
docker-compose exec -T postgres psql -U ncs_user -d ncs_database < backup.sql
```

## 🏗️ Building for Production

### Multi-architecture Build

```bash
# Build for both ARM64 and AMD64
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t ncs-center:latest .
```

### Optimize Image Size

The Dockerfile uses multi-stage builds to minimize image size:
- **Builder stage**: ~500MB (discarded)
- **Final image**: ~25MB (nginx:alpine + static files)

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is healthy
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U ncs_user
```

### Web Application Issues
```bash
# Rebuild web container
docker-compose up -d --build web

# View web logs
docker-compose logs web
```

### Port Conflicts
If ports 3000 or 5432 are already in use, change them in `.env`:
```bash
WEB_PORT=8080
POSTGRES_PORT=5433
```

## 📊 Resource Usage

Typical resource consumption:
- **Web Container**: ~10MB RAM, minimal CPU
- **PostgreSQL**: ~50-100MB RAM, low CPU
- **Total Disk**: ~100MB (images) + data volume

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U ncs_user ncs_database > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U ncs_user -d ncs_database < backup_20260129.sql
```

### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## 🌐 Deployment Options

### Local Development
```bash
docker-compose up
```

### Production Server
1. Set strong passwords in `.env`
2. Configure reverse proxy (nginx/Caddy) with SSL
3. Set up automated backups
4. Monitor with Docker health checks

### Cloud Platforms
- **AWS ECS/Fargate**: Use task definitions
- **Google Cloud Run**: Deploy container directly
- **Azure Container Instances**: Single command deployment
- **DigitalOcean App Platform**: Git-based deployment

## 📝 License

Same as the main project (AGPL-3.0)
