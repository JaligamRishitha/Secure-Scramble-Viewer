# Secure Scramble Viewer - macOS & Linux Installation

## 🎯 Overview

This guide covers building and installing the Secure Scramble Viewer on macOS and Linux.

## 📋 Prerequisites

### macOS
- macOS 10.13 or later
- Python 3.8+ (install via Homebrew: `brew install python3`)
- Xcode Command Line Tools: `xcode-select --install`

### Linux
- Ubuntu 20.04+ / Debian 10+ / Fedora 33+ / Arch Linux
- Python 3.8+
- Tkinter: `sudo apt install python3-tk` (Ubuntu/Debian)

## 🚀 Quick Installation

### Step 1: Build the Viewer

```bash
cd desktop-decoder

# Make script executable
chmod +x build_viewer.sh

# Build
./build_viewer.sh
```

**Output:** `dist/Secure Scramble Viewer`

### Step 2: Install System-Wide

```bash
# Make install script executable
chmod +x install_viewer.sh

# Install (requires sudo)
sudo ./install_viewer.sh
```

### Step 3: Done!

Now you can:
- Double-click .ssv files to open them
- Run: `ssv-viewer file.ssv`
- Right-click .ssv files → Open With → Secure Scramble Viewer

## 📝 Detailed Instructions

### Building on macOS

```bash
# 1. Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Python 3
brew install python3

# 3. Navigate to project
cd desktop-decoder

# 4. Make script executable
chmod +x build_viewer.sh

# 5. Build
./build_viewer.sh
```

**What it does:**
- Installs cryptography, pyinstaller
- Installs Pillow, PyMuPDF, python-docx, openpyxl, python-pptx
- Creates executable in `dist/` folder

### Building on Linux (Ubuntu/Debian)

```bash
# 1. Install dependencies
sudo apt update
sudo apt install python3 python3-pip python3-tk

# 2. Navigate to project
cd desktop-decoder

# 3. Make script executable
chmod +x build_viewer.sh

# 4. Build
./build_viewer.sh
```

### Building on Linux (Fedora)

```bash
# 1. Install dependencies
sudo dnf install python3 python3-pip python3-tkinter

# 2. Navigate to project
cd desktop-decoder

# 3. Make script executable
chmod +x build_viewer.sh

# 4. Build
./build_viewer.sh
```

### Building on Linux (Arch)

```bash
# 1. Install dependencies
sudo pacman -S python python-pip tk

# 2. Navigate to project
cd desktop-decoder

# 3. Make script executable
chmod +x build_viewer.sh

# 4. Build
./build_viewer.sh
```

## 🔧 Installation

### macOS Installation

```bash
# Install system-wide
sudo ./install_viewer.sh
```

**What it installs:**
- Executable: `/usr/local/bin/ssv-viewer`
- Application: `/Applications/Secure Scramble Viewer.app`
- File association: .ssv files open with viewer

**First run:**
1. Open System Preferences → Security & Privacy
2. Click "Open Anyway" when prompted
3. Or: Right-click app → Open (first time only)

### Linux Installation

```bash
# Install system-wide
sudo ./install_viewer.sh
```

**What it installs:**
- Executable: `/usr/local/bin/ssv-viewer`
- Desktop entry: `/usr/share/applications/ssv-viewer.desktop`
- MIME type: `/usr/share/mime/packages/ssv.xml`
- File association: .ssv files open with viewer

## 🎮 Usage

### Command Line

```bash
# Open a file
ssv-viewer file.ssv

# Or with full path
/usr/local/bin/ssv-viewer /path/to/file.ssv
```

### GUI

**macOS:**
1. Double-click .ssv file
2. Or: Right-click → Open With → Secure Scramble Viewer
3. Or: Open from Applications folder

**Linux:**
1. Double-click .ssv file
2. Or: Right-click → Open With → Secure Scramble Viewer
3. Or: Run from application menu

## 🔐 Secret Key Configuration

The viewer needs the same secret key as your backend.

**Location:** `~/.ssv_decoder/config.txt`

**Setup:**

```bash
# Create config directory
mkdir -p ~/.ssv_decoder

# Create config file
echo "YOUR_SECRET_KEY_HERE" > ~/.ssv_decoder/config.txt

# Set permissions (important!)
chmod 600 ~/.ssv_decoder/config.txt
```

**Example:**

```bash
echo "XsPnogOqsLaGxNGW9ZfeL/gnuGQoW7UzluhwAWyXK4A=" > ~/.ssv_decoder/config.txt
```

## 🗑️ Uninstallation

```bash
# Make uninstall script executable
chmod +x uninstall_viewer.sh

# Uninstall
sudo ./uninstall_viewer.sh
```

**What it removes:**
- Executable
- Application bundle (macOS)
- Desktop entry (Linux)
- MIME type (Linux)
- File associations

## 🐛 Troubleshooting

### macOS: "App is damaged and can't be opened"

**Solution:**
```bash
# Remove quarantine attribute
sudo xattr -rd com.apple.quarantine "/Applications/Secure Scramble Viewer.app"
```

### macOS: "App from unidentified developer"

**Solution:**
1. System Preferences → Security & Privacy
2. Click "Open Anyway"
3. Or: Right-click app → Open

### Linux: "Permission denied"

**Solution:**
```bash
# Make executable
chmod +x "dist/Secure Scramble Viewer"

# Or after installation
chmod +x /usr/local/bin/ssv-viewer
```

### Linux: "No module named 'tkinter'"

**Solution:**
```bash
# Ubuntu/Debian
sudo apt install python3-tk

# Fedora
sudo dnf install python3-tkinter

# Arch
sudo pacman -S tk
```

### "Failed to execute script"

**Solution:**
```bash
# Rebuild with verbose output
pyinstaller --onefile --windowed --name "Secure Scramble Viewer" ssv_viewer_enhanced.py --debug all
```

### File association not working

**macOS:**
```bash
# Re-register with Launch Services
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "/Applications/Secure Scramble Viewer.app"
```

**Linux:**
```bash
# Update MIME database
sudo update-mime-database /usr/share/mime

# Update desktop database
sudo update-desktop-database

# Set default application
xdg-mime default ssv-viewer.desktop application/x-ssv
```

## 📊 Build Options

### Minimal Build (No Document Libraries)

```bash
# Install only core dependencies
pip3 install cryptography pyinstaller

# Build
pyinstaller --onefile --windowed --name "Secure Scramble Viewer" ssv_viewer_enhanced.py
```

**Result:** Text files work, images/PDFs show info only

### Full Build (All Features)

```bash
# Install all dependencies
pip3 install cryptography pyinstaller Pillow PyMuPDF python-docx openpyxl python-pptx

# Build
./build_viewer.sh
```

**Result:** All file types fully supported

## 🎯 Distribution

### Creating a DMG (macOS)

```bash
# Install create-dmg
brew install create-dmg

# Create DMG
create-dmg \
  --volname "Secure Scramble Viewer" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --app-drop-link 600 185 \
  "Secure-Scramble-Viewer.dmg" \
  "/Applications/Secure Scramble Viewer.app"
```

### Creating a DEB Package (Debian/Ubuntu)

```bash
# Create package structure
mkdir -p ssv-viewer_1.0/DEBIAN
mkdir -p ssv-viewer_1.0/usr/local/bin
mkdir -p ssv-viewer_1.0/usr/share/applications
mkdir -p ssv-viewer_1.0/usr/share/mime/packages

# Copy files
cp "dist/Secure Scramble Viewer" ssv-viewer_1.0/usr/local/bin/ssv-viewer
cp ssv-viewer.desktop ssv-viewer_1.0/usr/share/applications/
cp ssv.xml ssv-viewer_1.0/usr/share/mime/packages/

# Create control file
cat > ssv-viewer_1.0/DEBIAN/control << EOF
Package: ssv-viewer
Version: 1.0
Architecture: amd64
Maintainer: Your Name <your@email.com>
Description: Secure Scramble Viewer
 View encrypted SSV files securely
EOF

# Build package
dpkg-deb --build ssv-viewer_1.0
```

### Creating an AppImage (Linux)

```bash
# Install appimagetool
wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
chmod +x appimagetool-x86_64.AppImage

# Create AppDir structure
mkdir -p SSV-Viewer.AppDir/usr/bin
mkdir -p SSV-Viewer.AppDir/usr/share/applications
mkdir -p SSV-Viewer.AppDir/usr/share/icons

# Copy files
cp "dist/Secure Scramble Viewer" SSV-Viewer.AppDir/usr/bin/ssv-viewer
cp ssv-viewer.desktop SSV-Viewer.AppDir/
cp icon.png SSV-Viewer.AppDir/ssv-viewer.png

# Create AppRun
cat > SSV-Viewer.AppDir/AppRun << 'EOF'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export PATH="${HERE}/usr/bin:${PATH}"
exec "${HERE}/usr/bin/ssv-viewer" "$@"
EOF
chmod +x SSV-Viewer.AppDir/AppRun

# Build AppImage
./appimagetool-x86_64.AppImage SSV-Viewer.AppDir
```

## 📝 Summary

### Quick Commands

```bash
# Build
chmod +x build_viewer.sh
./build_viewer.sh

# Install
chmod +x install_viewer.sh
sudo ./install_viewer.sh

# Uninstall
chmod +x uninstall_viewer.sh
sudo ./uninstall_viewer.sh

# Run
ssv-viewer file.ssv
```

### File Locations

**macOS:**
- Executable: `/usr/local/bin/ssv-viewer`
- App: `/Applications/Secure Scramble Viewer.app`
- Config: `~/.ssv_decoder/config.txt`

**Linux:**
- Executable: `/usr/local/bin/ssv-viewer`
- Desktop: `/usr/share/applications/ssv-viewer.desktop`
- MIME: `/usr/share/mime/packages/ssv.xml`
- Config: `~/.ssv_decoder/config.txt`

## ✅ Verification

```bash
# Check installation
which ssv-viewer

# Check version
ssv-viewer --version

# Test with file
ssv-viewer test.ssv

# Check file association (Linux)
xdg-mime query default application/x-ssv
```

---

**Secure Scramble Viewer is now installed on macOS/Linux!** 🎉
