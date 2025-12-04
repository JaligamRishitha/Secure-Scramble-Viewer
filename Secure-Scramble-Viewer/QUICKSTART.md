# Quick Start Guide

Get SecureScramble Viewer running in 5 minutes!

## Prerequisites

- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- Git

## Installation

### Option 1: Automated Setup (Recommended)

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### Option 2: Manual Setup

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ssv-project.git
cd ssv-project
```

#### 2. Start Database

```bash
docker-compose up -d
```

#### 3. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://ssv_user:ssv_password@localhost:5432/ssv_db
SECRET_KEY=$(openssl rand -base64 32)
STORAGE_PATH=./storage
ALLOWED_ORIGINS=http://localhost:5173
MAX_FILE_SIZE=104857600
EOF

cd ..
```

#### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

cd ..
```

#### 5. Setup Viewer

```bash
cd viewer

# Install dependencies
npm install

# Create .env file (use same key as backend)
echo "VITE_ENCRYPTION_KEY=<your-backend-secret-key>" > .env

cd ..
```

## Running the Application

### Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Viewer:**
```bash
cd viewer
npm run dev
```

### Access the Application

- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Frontend:** http://localhost:5173
- **Viewer:** http://localhost:5174

## First Steps

### 1. Upload a File

1. Open http://localhost:5173
2. Click "Choose File"
3. Select any file (PDF, image, text, etc.)
4. Click "Upload & Encrypt"
5. File is encrypted and saved as .ssv

### 2. Download Encrypted File

1. Click "Download .ssv" on any file
2. File downloads with .ssv extension
3. Cannot be opened by standard applications

### 3. View in SSV Viewer

1. Open http://localhost:5174
2. Click "Open .ssv File"
3. Select the downloaded .ssv file
4. File is decrypted and displayed

### 4. Save Original File

1. In viewer, click "Save Original"
2. Choose location and filename
3. Original file is saved (decrypted)

## Testing the Encryption

### Test 1: Try Opening .ssv Directly

```bash
# Download a .ssv file, then try:
cat file.ssv          # Shows gibberish
file file.ssv         # Shows "data" (unrecognized format)
open file.ssv         # OS doesn't know how to open it
```

### Test 2: API Testing

```bash
# Upload
curl -X POST http://localhost:8000/api/upload \
  -F "file=@test.pdf"

# List files
curl http://localhost:8000/api/files

# Download (replace FILE_ID)
curl -O -J http://localhost:8000/api/download/FILE_ID
```

### Test 3: Decryption Testing

```bash
# Decode endpoint (testing only)
curl -X POST http://localhost:8000/api/decode \
  -H "Content-Type: application/json" \
  -d '{"file_id": "FILE_ID"}' \
  --output original.pdf
```

## Common Issues

### Issue: Database Connection Failed

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps

# Restart database
docker-compose restart

# Check logs
docker-compose logs postgres
```

### Issue: Port Already in Use

**Solution:**
```bash
# Find process using port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process or change port in config
```

### Issue: Module Not Found

**Solution:**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend/Viewer
cd frontend  # or viewer
npm install
```

### Issue: CORS Error

**Solution:**
Update `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Issue: Encryption Key Mismatch

**Solution:**
Ensure the same key is used in:
- `backend/.env` → `SECRET_KEY`
- `viewer/.env` → `VITE_ENCRYPTION_KEY`

## Development Tips

### Hot Reload

All services support hot reload:
- Backend: Uvicorn auto-reloads on file changes
- Frontend: Vite HMR (Hot Module Replacement)
- Viewer: Vite HMR

### Database Management

```bash
# Access PostgreSQL
docker exec -it ssv_postgres psql -U ssv_user -d ssv_db

# View tables
\dt

# View files
SELECT * FROM encrypted_files;

# Exit
\q
```

### Clear All Data

```bash
# Stop and remove database
docker-compose down -v

# Remove storage
rm -rf backend/storage/*

# Restart
docker-compose up -d
```

### View Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Database logs
docker-compose logs -f postgres
```

## Next Steps

1. **Read Documentation:**
   - [README.md](README.md) - Full overview
   - [SECURITY.md](SECURITY.md) - Security details
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

2. **Customize:**
   - Change encryption algorithm
   - Add user authentication
   - Implement file sharing
   - Add file versioning

3. **Deploy:**
   - Set up production database
   - Configure HTTPS
   - Deploy to cloud
   - Build desktop apps

4. **Extend:**
   - Add more file type previews
   - Implement file compression
   - Add batch operations
   - Create mobile apps

## Support

- **Issues:** Open a GitHub issue
- **Discussions:** GitHub Discussions
- **Email:** support@example.com

## License

MIT License - See [LICENSE](LICENSE) file

---

**Happy Encrypting! 🔒**
