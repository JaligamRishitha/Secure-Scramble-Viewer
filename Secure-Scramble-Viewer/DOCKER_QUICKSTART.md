# Docker Quick Start - 2 Minutes ⚡

Get SecureScramble Viewer running with Docker in 2 minutes!

## Prerequisites

- Docker Desktop installed and running
- That's it! No Python, Node.js, or PostgreSQL needed.

## Step 1: Generate Encryption Key (30 seconds)

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use Python (if installed)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output - you'll need it in the next step.

## Step 2: Create Environment File (30 seconds)

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` and replace the `SECRET_KEY` with the key you generated:

```env
SECRET_KEY=your-generated-key-here
```

## Step 3: Start Everything (1 minute)

```bash
docker-compose up -d
```

This single command:
- ✅ Builds backend Docker image
- ✅ Builds frontend Docker image  
- ✅ Pulls PostgreSQL and Nginx images
- ✅ Creates network and volumes
- ✅ Starts all 4 services

Wait about 30-60 seconds for everything to start.

## Step 4: Access the Application (instant)

Open your browser:

- **Frontend:** http://localhost
- **API Docs:** http://localhost/docs
- **Health Check:** http://localhost/health

## 🎉 Done!

You now have a fully functional file encryption system running!

## What's Running?

```
┌─────────────────────────────────────┐
│  Your Computer                      │
│                                     │
│  Port 80 → Nginx                    │
│              ↓                      │
│         ┌────┴────┐                 │
│         ↓         ↓                 │
│    Frontend   Backend               │
│                  ↓                  │
│             PostgreSQL              │
└─────────────────────────────────────┘
```

## Quick Test

### 1. Upload a File

1. Go to http://localhost
2. Click "Choose File"
3. Select any file
4. Click "Upload & Encrypt"
5. ✅ File encrypted!

### 2. Download Encrypted File

1. Click "Download .ssv" on your file
2. Try opening it with any app
3. ❌ Can't open it - it's encrypted!

### 3. View in Viewer

The viewer is a separate desktop app. See [QUICKSTART.md](QUICKSTART.md) for viewer setup.

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Restart
docker-compose restart

# Check status
docker-compose ps

# View backend logs only
docker-compose logs -f backend
```

## Using Make (Optional)

If you have `make` installed:

```bash
# Setup
make setup

# Start
make up

# View logs
make logs

# Stop
make down

# See all commands
make help
```

## Development Mode (Hot Reload)

Want to modify code with auto-reload?

```bash
# Start in dev mode
docker-compose -f docker-compose.dev.yml up -d

# Or with make
make dev
```

Access:
- Frontend: http://localhost:5173 (with hot reload)
- Backend: http://localhost:8000 (with hot reload)

Code changes will automatically reload!

## Troubleshooting

### Port 80 Already in Use

```bash
# Check what's using port 80
# Windows
netstat -ano | findstr :80

# Linux/Mac
lsof -i :80

# Change port in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
```

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Database Connection Error

```bash
# Wait a bit longer (database takes time to start)
docker-compose logs postgres

# Restart
docker-compose restart backend
```

## Next Steps

### Learn More

- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Complete Docker guide
- [README.md](README.md) - Project overview
- [SECURITY.md](SECURITY.md) - Security details

### Customize

- Change UI colors in `frontend/src/App.css`
- Modify API in `backend/app/api/routes.py`
- Update nginx config in `nginx/nginx.conf`

### Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Cloud deployment (AWS, Azure, GCP)
- HTTPS setup
- Domain configuration
- Scaling

## Common Tasks

### Backup Data

```bash
# Backup database
docker-compose exec postgres pg_dump -U ssv_user ssv_db > backup.sql

# Or use make
make backup
```

### View Database

```bash
# Open database shell
docker-compose exec postgres psql -U ssv_user -d ssv_db

# List files
SELECT * FROM encrypted_files;

# Exit
\q
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Clean Everything

```bash
# Stop and remove everything (including data!)
docker-compose down -v

# Or use make
make clean
```

## Production Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a strong random key
- [ ] Change `POSTGRES_PASSWORD` to a strong password
- [ ] Set up HTTPS with SSL certificates
- [ ] Configure domain name in nginx
- [ ] Set up backups
- [ ] Enable monitoring
- [ ] Review security settings

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

## Architecture

```
Internet
   ↓
Nginx (Port 80/443)
   ├─→ Frontend (React)
   └─→ Backend (FastAPI)
         ↓
   PostgreSQL (Database)
```

All services run in Docker containers on a private network.

## Resource Usage

Typical resource usage:
- **CPU:** ~5-10% idle, ~30-50% under load
- **RAM:** ~500MB total
- **Disk:** ~1GB for images + your encrypted files

## Support

- **Documentation:** See all .md files
- **Logs:** `docker-compose logs -f`
- **Issues:** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Help:** Open GitHub issue

## Summary

```bash
# 1. Generate key
openssl rand -base64 32

# 2. Create .env and add key
cp .env.example .env

# 3. Start
docker-compose up -d

# 4. Access
# http://localhost
```

**That's it! 🚀**

---

**Questions?** See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed documentation.
