#!/bin/bash
# Build SSV Viewer for macOS and Linux

echo "========================================"
echo "Building Secure Scramble Viewer"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is required but not installed."
    exit 1
fi

echo "[1/4] Installing dependencies..."
python3 -m pip install --upgrade pip

echo ""
echo "Installing core dependencies..."
python3 -m pip install cryptography==41.0.7
python3 -m pip install pyinstaller==6.3.0

echo ""
echo "Installing document viewing libraries..."
echo "This may take a few minutes..."
echo ""

LIBS_OK=0

echo "[1/5] Installing Pillow (images with zoom)..."
if python3 -m pip install Pillow > /dev/null 2>&1; then
    echo "  [OK] Pillow installed"
    ((LIBS_OK++))
else
    echo "  [SKIP] Pillow failed - images will show info only"
fi

echo "[2/5] Installing PyMuPDF (PDF viewing)..."
if python3 -m pip install PyMuPDF > /dev/null 2>&1; then
    echo "  [OK] PyMuPDF installed"
    ((LIBS_OK++))
else
    echo "  [SKIP] PyMuPDF failed - PDFs will show info only"
fi

echo "[3/5] Installing python-docx (Word documents)..."
if python3 -m pip install python-docx > /dev/null 2>&1; then
    echo "  [OK] python-docx installed"
    ((LIBS_OK++))
else
    echo "  [SKIP] python-docx failed - Word docs will show info only"
fi

echo "[4/5] Installing openpyxl (Excel spreadsheets)..."
if python3 -m pip install openpyxl > /dev/null 2>&1; then
    echo "  [OK] openpyxl installed"
    ((LIBS_OK++))
else
    echo "  [SKIP] openpyxl failed - Excel files will show info only"
fi

echo "[5/5] Installing python-pptx (PowerPoint)..."
if python3 -m pip install python-pptx > /dev/null 2>&1; then
    echo "  [OK] python-pptx installed"
    ((LIBS_OK++))
else
    echo "  [SKIP] python-pptx failed - PowerPoint will show info only"
fi

echo ""
echo "Libraries installed: $LIBS_OK / 5"
echo "Note: Viewer will work with whatever libraries are available"

echo ""
echo "[2/4] Creating executable with PyInstaller..."
pyinstaller --onefile \
    --windowed \
    --name "Secure Scramble Viewer" \
    ssv_viewer_enhanced.py

echo ""
echo "[3/4] Cleaning up..."
rm -rf build
rm -f "Secure Scramble Viewer.spec"

echo ""
echo "[4/4] Done!"
echo ""
echo "========================================"
echo "Executable created: dist/Secure Scramble Viewer"
echo "========================================"
echo ""
echo "To run:"
echo "  ./dist/Secure\\ Scramble\\ Viewer file.ssv"
echo ""
echo "To install system-wide:"
echo "  sudo ./install_viewer.sh"
echo ""
