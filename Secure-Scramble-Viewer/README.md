# SecureScramble Viewer (SSV)

A secure file encryption and viewing system that scrambles files into `.ssv` format, making them unreadable by standard applications. Only the custom SSV Viewer can decrypt and display the original content.

## Architecture

```
┌─────────────────┐
│  React Frontend │ ← Upload/Download Files
└────────┬────────┘
         │
    ┌────▼─────┐
    │  FastAPI │ ← Encrypt/Decrypt + Store
    │  Backend │
    └────┬─────┘
         │
    ┌────▼─────────┐
    │  PostgreSQL  │ ← File Metadata
    └──────────────┘
         │
    ┌────▼─────────┐
    │ File Storage │ ← Encrypted .ssv Files
    └──────────────┘

┌──────────────────┐
│   SSV Viewer     │ ← Decrypt & Display
│ (Electron/React) │
└──────────────────┘
```

## Features

- **🐳 Docker Ready**: One-command deployment with Docker Compose
- **🔒 AES-256-CBC Encryption**: Military-grade encryption for file security
- **📦 Custom .ssv Format**: Prevents standard applications from opening files
- **💻 Cross-Platform Viewer**: Windows, Linux, macOS, Android, iOS support
- **👁️ File Preview**: PDF, Images, Text files with fallback for unsupported types
- **🔐 Secure Key Management**: Environment-based key storage
- **🚀 Production Ready**: Nginx reverse proxy, health checks, auto-restart

## Project Structure

```
ssv-project/
├── backend/              # FastAPI Backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Config & security
│   │   ├── db/          # Database models
│   │   └── utils/       # Encryption utilities
│   ├── storage/         # Encrypted files
│   ├── requirements.txt
│   └── main.py
├── frontend/            # React Web App
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── viewer/              # Electron Viewer App
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── electron/
│   └── package.json
└── docker-compose.yml   # PostgreSQL setup
```

## Quick Start

### Option 1: Docker (Recommended) 🐳

**Prerequisites:** Docker and Docker Compose

```bash
# 1. Create environment file
cp .env.example .env

# 2. Generate encryption key and add to .env
openssl rand -base64 32

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost
# API Docs: http://localhost/docs
```

**That's it!** All services (backend, frontend, database, nginx) are running.

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker documentation.

### Option 2: Manual Setup

#### 1. Setup Database

```bash
docker-compose up -d postgres
```

#### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on: http://localhost:8000

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

#### 4. Viewer Setup

```bash
cd viewer
npm install
npm run dev  # Development mode
npm run build  # Production build
```

## Environment Variables

Create `.env` files in respective directories:

**backend/.env**
```env
DATABASE_URL=postgresql://ssv_user:ssv_password@localhost:5432/ssv_db
SECRET_KEY=your-super-secret-encryption-key-min-32-chars
STORAGE_PATH=./storage
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:8000
```

**viewer/.env**
```env
VITE_API_URL=http://localhost:8000
VITE_ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars
```

## Security Features

### 1. Encryption
- **Algorithm**: AES-256-CBC
- **Key Derivation**: PBKDF2 with unique salt per file
- **IV**: Random 16-byte initialization vector per file

### 2. Key Security
- Master key stored in environment variables (never in code)
- Production: Use AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
- Viewer: Key embedded during build (obfuscated)

### 3. File Format Protection
- `.ssv` files are binary encrypted blobs
- No file signature/magic bytes for standard apps to recognize
- Custom header with metadata (encrypted)

## Building Viewer for Different Platforms

### Desktop (Electron)

**Windows:**
```bash
npm run build:win
```

**macOS:**
```bash
npm run build:mac
```

**Linux:**
```bash
npm run build:linux
```

### Mobile (Capacitor)

**Android:**
```bash
npm run build:android
```

**iOS:**
```bash
npm run build:ios
```

## API Endpoints

### Upload File
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (binary)
Response: { file_id, filename, size, upload_date }
```

### List Files
```
GET /api/files
Response: [{ file_id, filename, size, upload_date }]
```

### Download File
```
GET /api/download/{file_id}
Response: Binary .ssv file
```

### Decode File (Testing)
```
POST /api/decode
Body: { file_id }
Response: Original file (binary)
```

## How It Works

### Encryption Process
1. User uploads file via web interface
2. Backend generates unique salt and IV
3. File encrypted with AES-256-CBC
4. Encrypted data + metadata saved as .ssv
5. Original file discarded

### Decryption Process
1. User opens .ssv file in SSV Viewer
2. Viewer reads encrypted data + metadata
3. Derives decryption key using stored master key
4. Decrypts file content
5. Displays preview based on file type

## Preventing Direct File Opening

1. **No Standard File Signature**: .ssv files don't have recognizable magic bytes
2. **Binary Encryption**: Entire file is encrypted binary data
3. **Custom Extension**: OS doesn't associate .ssv with any application
4. **Encrypted Headers**: Even metadata is encrypted

## Development

### Run Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test

# Viewer
cd viewer
npm test
```

### Database Migrations
```bash
cd backend
alembic upgrade head
```

## Production Deployment

### Backend
- Use Gunicorn/Uvicorn with multiple workers
- Set up HTTPS with SSL certificates
- Use managed PostgreSQL (AWS RDS, Azure Database)
- Store encryption key in secrets manager

### Frontend
- Build and deploy to CDN (Vercel, Netlify)
- Configure CORS properly

### Viewer
- Code sign applications for distribution
- Use auto-update mechanism (electron-updater)
- Obfuscate encryption key in production builds

## Security Best Practices

1. **Never commit encryption keys** to version control
2. **Rotate keys periodically** in production
3. **Use HTTPS** for all API communications
4. **Implement rate limiting** on upload endpoints
5. **Validate file types** and sizes
6. **Audit file access** logs
7. **Use secure key storage** solutions in production

## License

MIT License

## Support

For issues and questions, please open a GitHub issue.
# Secure-Scramble-Viewer
