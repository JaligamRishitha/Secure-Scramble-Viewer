@echo off
REM Build SSV Viewer (Silent Decoder)

echo ========================================
echo Building SSV Viewer (Silent Decoder)
echo ========================================
echo.

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is required but not installed.
    exit /b 1
)

echo [1/4] Installing dependencies...
python -m pip install --upgrade pip
echo.
echo Installing core dependencies...
python -m pip install cryptography==41.0.7
python -m pip install pyinstaller==6.3.0
echo.
echo Installing document viewing libraries...
echo This may take a few minutes...
echo.

REM Install each library and track success
set LIBS_OK=0

echo [1/5] Installing Pillow (images with zoom)...
python -m pip install Pillow >nul 2>&1
if %errorLevel% equ 0 (
    echo   [OK] Pillow installed
    set /a LIBS_OK+=1
) else (
    echo   [SKIP] Pillow failed - images will show info only
)

echo [2/5] Installing PyMuPDF (PDF viewing)...
python -m pip install PyMuPDF >nul 2>&1
if %errorLevel% equ 0 (
    echo   [OK] PyMuPDF installed
    set /a LIBS_OK+=1
) else (
    echo   [SKIP] PyMuPDF failed - PDFs will show info only
)

echo [3/5] Installing python-docx (Word documents)...
python -m pip install python-docx >nul 2>&1
if %errorLevel% equ 0 (
    echo   [OK] python-docx installed
    set /a LIBS_OK+=1
) else (
    echo   [SKIP] python-docx failed - Word docs will show info only
)

echo [4/5] Installing openpyxl (Excel spreadsheets)...
python -m pip install openpyxl >nul 2>&1
if %errorLevel% equ 0 (
    echo   [OK] openpyxl installed
    set /a LIBS_OK+=1
) else (
    echo   [SKIP] openpyxl failed - Excel files will show info only
)

echo [5/5] Installing python-pptx (PowerPoint)...
python -m pip install python-pptx >nul 2>&1
if %errorLevel% equ 0 (
    echo   [OK] python-pptx installed
    set /a LIBS_OK+=1
) else (
    echo   [SKIP] python-pptx failed - PowerPoint will show info only
)

echo.
echo Libraries installed: %LIBS_OK% / 5
echo Note: Viewer will work with whatever libraries are available

echo.
echo [2/4] Creating executable with PyInstaller...
pyinstaller --onefile ^
    --windowed ^
    --name "Secure Scramble Viewer" ^
    ssv_viewer_enhanced.py

echo.
echo [3/4] Cleaning up...
rmdir /s /q build 2>nul
del /q "Secure Scramble Viewer.spec" 2>nul

echo.
echo [4/4] Done!
echo.
echo ========================================
echo Executable created: dist\Secure Scramble Viewer.exe
echo ========================================
echo.
echo This is a SILENT decoder that:
echo - Decodes .ssv files automatically
echo - Opens the original file
echo - No GUI window shown
echo.
echo To register .ssv file association:
echo   register_viewer.bat
echo.
pause
