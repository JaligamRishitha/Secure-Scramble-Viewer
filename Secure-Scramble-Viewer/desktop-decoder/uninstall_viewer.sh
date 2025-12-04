#!/bin/bash
# Uninstall Secure Scramble Viewer from Linux/macOS

echo "========================================"
echo "Uninstalling Secure Scramble Viewer"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "[ERROR] Please run as root (use sudo)"
    exit 1
fi

# Detect OS
OS=$(uname -s)

if [ "$OS" = "Darwin" ]; then
    echo "Detected: macOS"
    uninstall_macos
elif [ "$OS" = "Linux" ]; then
    echo "Detected: Linux"
    uninstall_linux
else
    echo "[ERROR] Unsupported OS: $OS"
    exit 1
fi

uninstall_linux() {
    echo ""
    echo "[1/4] Removing executable..."
    rm -f /usr/local/bin/ssv-viewer
    echo "  [OK] Executable removed"
    
    echo ""
    echo "[2/4] Removing desktop entry..."
    rm -f /usr/share/applications/ssv-viewer.desktop
    echo "  [OK] Desktop entry removed"
    
    echo ""
    echo "[3/4] Removing MIME type..."
    rm -f /usr/share/mime/packages/ssv.xml
    update-mime-database /usr/share/mime > /dev/null 2>&1
    echo "  [OK] MIME type removed"
    
    echo ""
    echo "[4/4] Cleaning cache..."
    update-desktop-database > /dev/null 2>&1
    echo "  [OK] Cache cleaned"
    
    echo ""
    echo "========================================"
    echo "Uninstallation Complete!"
    echo "========================================"
    echo ""
}

uninstall_macos() {
    echo ""
    echo "[1/3] Removing executable..."
    rm -f /usr/local/bin/ssv-viewer
    echo "  [OK] Executable removed"
    
    echo ""
    echo "[2/3] Removing application bundle..."
    rm -rf "/Applications/Secure Scramble Viewer.app"
    echo "  [OK] Application bundle removed"
    
    echo ""
    echo "[3/3] Cleaning Launch Services..."
    /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user
    echo "  [OK] Launch Services cleaned"
    
    echo ""
    echo "========================================"
    echo "Uninstallation Complete!"
    echo "========================================"
    echo ""
}

# Run uninstallation
if [ "$OS" = "Darwin" ]; then
    uninstall_macos
elif [ "$OS" = "Linux" ]; then
    uninstall_linux
fi
