#!/bin/bash

# SecureScramble Viewer - Setup Script
# This script sets up the entire SSV project

set -e

echo "🔒 SecureScramble Viewer - Setup Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

command -v python3 >/dev/null 2>&1 || { echo -e "${RED}Python 3 is required but not installed.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Generate encryption key
echo "Generating encryption key..."
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo -e "${GREEN}✓ Encryption key generated${NC}"
echo ""

# Setup database
echo "Setting up PostgreSQL database..."
docker-compose up -d
sleep 5
echo -e "${GREEN}✓ Database started${NC}"
echo ""

# Setup backend
echo "Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://ssv_user:ssv_password@localhost:5432/ssv_db
SECRET_KEY=${ENCRYPTION_KEY}
STORAGE_PATH=./storage
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_FILE_SIZE=104857600
EOF

echo -e "${GREEN}✓ Backend configured${NC}"
cd ..
echo ""

# Setup frontend
echo "Setting up frontend..."
cd frontend

npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:8000
EOF

echo -e "${GREEN}✓ Frontend configured${NC}"
cd ..
echo ""

# Setup viewer
echo "Setting up viewer..."
cd viewer

npm install

# Create .env file
cat > .env << EOF
VITE_ENCRYPTION_KEY=${ENCRYPTION_KEY}
EOF

echo -e "${GREEN}✓ Viewer configured${NC}"
cd ..
echo ""

# Create start scripts
echo "Creating start scripts..."

# Backend start script
cat > start-backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
python main.py
EOF
chmod +x start-backend.sh

# Frontend start script
cat > start-frontend.sh << 'EOF'
#!/bin/bash
cd frontend
npm run dev
EOF
chmod +x start-frontend.sh

# Viewer start script
cat > start-viewer.sh << 'EOF'
#!/bin/bash
cd viewer
npm run dev
EOF
chmod +x start-viewer.sh

echo -e "${GREEN}✓ Start scripts created${NC}"
echo ""

# Summary
echo "========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Your encryption key: ${YELLOW}${ENCRYPTION_KEY}${NC}"
echo -e "${RED}⚠️  IMPORTANT: Save this key securely!${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Backend:  ./start-backend.sh"
echo "2. Frontend: ./start-frontend.sh"
echo "3. Viewer:   ./start-viewer.sh"
echo ""
echo "Or start all at once:"
echo "  ./start-backend.sh & ./start-frontend.sh & ./start-viewer.sh"
echo ""
echo "Access points:"
echo "  - Backend API: http://localhost:8000"
echo "  - Frontend:    http://localhost:5173"
echo "  - Viewer:      http://localhost:5174"
echo ""
echo "Documentation:"
echo "  - README.md       - Overview and quick start"
echo "  - SECURITY.md     - Security details"
echo "  - DEPLOYMENT.md   - Production deployment"
echo ""
