@echo off
REM SecureScramble Viewer - Setup Script for Windows

echo ========================================
echo SecureScramble Viewer - Setup Script
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is required but not installed.
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required but not installed.
    exit /b 1
)

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is required but not installed.
    exit /b 1
)

echo [OK] All prerequisites found
echo.

REM Generate encryption key (simplified for Windows)
echo Generating encryption key...
set ENCRYPTION_KEY=CHANGE-THIS-TO-A-SECURE-RANDOM-KEY-AT-LEAST-32-CHARACTERS-LONG
echo [OK] Please update the encryption key in .env files
echo.

REM Setup database
echo Setting up PostgreSQL database...
docker-compose up -d
timeout /t 5 /nobreak >nul
echo [OK] Database started
echo.

REM Setup backend
echo Setting up backend...
cd backend

REM Create virtual environment
python -m venv venv
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

REM Create .env file
(
echo DATABASE_URL=postgresql://ssv_user:ssv_password@localhost:5432/ssv_db
echo SECRET_KEY=%ENCRYPTION_KEY%
echo STORAGE_PATH=./storage
echo ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
echo MAX_FILE_SIZE=104857600
) > .env

echo [OK] Backend configured
cd ..
echo.

REM Setup frontend
echo Setting up frontend...
cd frontend

call npm install

REM Create .env file
echo VITE_API_URL=http://localhost:8000 > .env

echo [OK] Frontend configured
cd ..
echo.

REM Setup viewer
echo Setting up viewer...
cd viewer

call npm install

REM Create .env file
echo VITE_ENCRYPTION_KEY=%ENCRYPTION_KEY% > .env

echo [OK] Viewer configured
cd ..
echo.

REM Create start scripts
echo Creating start scripts...

REM Backend start script
(
echo @echo off
echo cd backend
echo call venv\Scripts\activate.bat
echo python main.py
) > start-backend.bat

REM Frontend start script
(
echo @echo off
echo cd frontend
echo npm run dev
) > start-frontend.bat

REM Viewer start script
(
echo @echo off
echo cd viewer
echo npm run dev
) > start-viewer.bat

echo [OK] Start scripts created
echo.

REM Summary
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Update the encryption key in:
echo   - backend\.env
echo   - viewer\.env
echo.
echo Generate a secure key with:
echo   python -c "import secrets; print(secrets.token_urlsafe(32))"
echo.
echo To start the application:
echo.
echo 1. Backend:  start-backend.bat
echo 2. Frontend: start-frontend.bat
echo 3. Viewer:   start-viewer.bat
echo.
echo Access points:
echo   - Backend API: http://localhost:8000
echo   - Frontend:    http://localhost:5173
echo   - Viewer:      http://localhost:5174
echo.
echo Documentation:
echo   - README.md       - Overview and quick start
echo   - SECURITY.md     - Security details
echo   - DEPLOYMENT.md   - Production deployment
echo.
pause
