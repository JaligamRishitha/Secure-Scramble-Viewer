#!/bin/bash
# Install Secure Scramble Viewer on Linux/macOS

echo "========================================"
echo "Installing Secure Scramble Viewer"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "[ERROR] Please run as root (use sudo)"
    exit 1
fi

# Check if executable exists
if [ ! -f "dist/Secure Scramble Viewer" ]; then
    echo "[ERROR] Executable not found!"
    echo "Please build first: ./build_viewer.sh"
    exit 1
fi

# Detect OS
OS=$(uname -s)

if [ "$OS" = "Darwin" ]; then
    echo "Detected: macOS"
    install_macos
elif [ "$OS" = "Linux" ]; then
    echo "Detected: Linux"
    install_linux
else
    echo "[ERROR] Unsupported OS: $OS"
    exit 1
fi

install_linux() {
    echo ""
    echo "[1/4] Installing executable..."
    
    # Copy executable
    cp "dist/Secure Scramble Viewer" /usr/local/bin/ssv-viewer
    chmod +x /usr/local/bin/ssv-viewer
    echo "  [OK] Installed to /usr/local/bin/ssv-viewer"
    
    echo ""
    echo "[2/4] Creating desktop entry..."
    
    # Create .desktop file
    cat > /usr/share/applications/ssv-viewer.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Secure Scramble Viewer
Comment=View encrypted SSV files securely
Exec=/usr/local/bin/ssv-viewer %f
Icon=document-viewer
Terminal=false
Categories=Office;Viewer;
MimeType=application/x-ssv;
EOF
    
    echo "  [OK] Desktop entry created"
    
    echo ""
    echo "[3/4] Registering MIME type..."
    
    # Create MIME type
    cat > /usr/share/mime/packages/ssv.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
    <mime-type type="application/x-ssv">
        <comment>Secure Scramble Viewer File</comment>
        <glob pattern="*.ssv"/>
        <icon name="document-viewer"/>
    </mime-type>
</mime-info>
EOF
    
    # Update MIME database
    update-mime-database /usr/share/mime > /dev/null 2>&1
    echo "  [OK] MIME type registered"
    
    echo ""
    echo "[4/4] Setting default application..."
    
    # Set default application
    xdg-mime default ssv-viewer.desktop application/x-ssv
    echo "  [OK] Default application set"
    
    echo ""
    echo "========================================"
    echo "Installation Complete!"
    echo "========================================"
    echo ""
    echo "You can now:"
    echo "1. Double-click .ssv files to open them"
    echo "2. Run: ssv-viewer file.ssv"
    echo "3. Right-click .ssv files → Open With → Secure Scramble Viewer"
    echo ""
}

install_macos() {
    echo ""
    echo "[1/3] Installing executable..."
    
    # Copy executable
    cp "dist/Secure Scramble Viewer" /usr/local/bin/ssv-viewer
    chmod +x /usr/local/bin/ssv-viewer
    echo "  [OK] Installed to /usr/local/bin/ssv-viewer"
    
    echo ""
    echo "[2/3] Creating application bundle..."
    
    # Create .app bundle
    APP_DIR="/Applications/Secure Scramble Viewer.app"
    mkdir -p "$APP_DIR/Contents/MacOS"
    mkdir -p "$APP_DIR/Contents/Resources"
    
    # Copy executable
    cp "dist/Secure Scramble Viewer" "$APP_DIR/Contents/MacOS/Secure Scramble Viewer"
    chmod +x "$APP_DIR/Contents/MacOS/Secure Scramble Viewer"
    
    # Create Info.plist
    cat > "$APP_DIR/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Secure Scramble Viewer</string>
    <key>CFBundleIdentifier</key>
    <string>com.securescramble.viewer</string>
    <key>CFBundleName</key>
    <string>Secure Scramble Viewer</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundleDocumentTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeExtensions</key>
            <array>
                <string>ssv</string>
            </array>
            <key>CFBundleTypeName</key>
            <string>Secure Scramble Viewer File</string>
            <key>CFBundleTypeRole</key>
            <string>Viewer</string>
            <key>LSHandlerRank</key>
            <string>Owner</string>
        </dict>
    </array>
</dict>
</plist>
EOF
    
    echo "  [OK] Application bundle created"
    
    echo ""
    echo "[3/3] Registering file association..."
    
    # Register with Launch Services
    /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_DIR"
    
    echo "  [OK] File association registered"
    
    echo ""
    echo "========================================"
    echo "Installation Complete!"
    echo "========================================"
    echo ""
    echo "You can now:"
    echo "1. Double-click .ssv files to open them"
    echo "2. Run: ssv-viewer file.ssv"
    echo "3. Open from Applications folder"
    echo "4. Right-click .ssv files → Open With → Secure Scramble Viewer"
    echo ""
    echo "Note: You may need to allow the app in System Preferences → Security & Privacy"
    echo ""
}

# Run installation
if [ "$OS" = "Darwin" ]; then
    install_macos
elif [ "$OS" = "Linux" ]; then
    install_linux
fi
