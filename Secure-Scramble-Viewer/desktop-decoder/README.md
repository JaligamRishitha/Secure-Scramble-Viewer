# Secure Scramble Viewer - Desktop Application

## 🎯 What This Does

View encrypted .ssv files securely with **no download capability**.

**Features:**
- 🔍 Images with zoom (25% - 300%)
- 📄 PDF viewing with page navigation
- 📝 Word documents (.docx)
- 📊 Excel spreadsheets (.xlsx)
- 📽️ PowerPoint presentations (.pptx)
- 📃 Text and code files
- 🔒 View-only mode (no save, no copy, no export)

## 🚀 Quick Start

### Windows

```cmd
cd desktop-decoder
build_viewer.bat
register_viewer.bat
```

### macOS / Linux

```bash
cd desktop-decoder
chmod +x build_viewer.sh install_viewer.sh
./build_viewer.sh
sudo ./install_viewer.sh
```

## 📋 Requirements

- **Python 3.8+** (64-bit recommended)
- **Windows:** Python + pip
- **macOS:** Python 3 (`brew install python3`)
- **Linux:** Python 3 + tkinter (`sudo apt install python3-tk`)

## 🎮 Usage

### After Installation

**Windows:**
- Double-click .ssv files
- Or run: `"Secure Scramble Viewer.exe" file.ssv`

**macOS / Linux:**
- Double-click .ssv files
- Or run: `ssv-viewer file.ssv`

### Features

**Images:**
- Full display with zoom controls
- Zoom in/out buttons
- Reset to 100%
- High-quality rendering

**PDFs:**
- Full page rendering
- Previous/Next navigation
- Page counter
- High-resolution display

**Documents:**
- Word: Full text display
- Excel: Multiple sheets with tabs
- PowerPoint: All slides
- Text: Syntax highlighting

## 🔐 Secret Key Setup (REQUIRED)

⚠️ **IMPORTANT:** The viewer needs the same SECRET_KEY as your backend to decrypt files!

**Get your SECRET_KEY from:**
- Backend `.env` file: `SECRET_KEY=XsPnogOqsLaGxNGW9ZfeL/gnuGQoW7UzluhwAWyXK4A=`
- Or Docker `.env` file in the project root

**Windows:**
```cmd
mkdir %USERPROFILE%\.ssv_decoder
echo XsPnogOqsLaGxNGW9ZfeL/gnuGQoW7UzluhwAWyXK4A= > %USERPROFILE%\.ssv_decoder\config.txt
```

**macOS / Linux:**
```bash
mkdir -p ~/.ssv_decoder
echo "XsPnogOqsLaGxNGW9ZfeL/gnuGQoW7UzluhwAWyXK4A=" > ~/.ssv_decoder/config.txt
chmod 600 ~/.ssv_decoder/config.txt
```

**Verify configuration:**
```bash
# Windows
type    

# macOS/Linux
cat ~/.ssv_decoder/config.txt
```

The key should match exactly with your backend SECRET_KEY!

## 📁 File Locations

### Windows
- Executable: `dist\Secure Scramble Viewer.exe`
- Config: `%USERPROFILE%\.ssv_decoder\config.txt`

### macOS
- Executable: `/usr/local/bin/ssv-viewer`
- App: `/Applications/Secure Scramble Viewer.app`
- Config: `~/.ssv_decoder/config.txt`

### Linux
- Executable: `/usr/local/bin/ssv-viewer`
- Desktop: `/usr/share/applications/ssv-viewer.desktop`
- Config: `~/.ssv_decoder/config.txt`

## 🔧 Dependencies

**Required:**
- cryptography - File decryption
- pyinstaller - Building executable

**Optional (for full features):**
- Pillow - Images with zoom
- PyMuPDF - PDF viewing
- python-docx - Word documents
- openpyxl - Excel spreadsheets
- python-pptx - PowerPoint presentations

**Install all:**
```bash
pip install -r requirements.txt
```

## 🐛 Troubleshooting

### Windows: Pillow installation fails
- Use 64-bit Python
- Or: Viewer works without Pillow (images show info only)

### macOS: "App is damaged"
```bash
sudo xattr -rd com.apple.quarantine "/Applications/Secure Scramble Viewer.app"
```

### Linux: "No module named 'tkinter'"
```bash
sudo apt install python3-tk  # Ubuntu/Debian
sudo dnf install python3-tkinter  # Fedora
```

### PDF/Images don't display
- Check libraries are installed: `pip list`
- Rebuild viewer: `build_viewer.bat` or `./build_viewer.sh`

## 🗑️ Uninstallation

**Windows:**
- Delete: `dist\Secure Scramble Viewer.exe`
- Remove registry: Run `register_viewer.bat` and decline

**macOS / Linux:**
```bash
sudo ./uninstall_viewer.sh
```

## 📊 Security Features

- ✅ No temp files created
- ✅ No external apps opened
- ✅ No save/download buttons
- ✅ No copy/paste
- ✅ Right-click disabled
- ✅ Watermarked display
- ✅ Memory-only decryption
- ✅ Content cleared on close

## 📝 Files

- `ssv_viewer_enhanced.py` - Main viewer application
- `build_viewer.bat` - Windows build script
- `build_viewer.sh` - macOS/Linux build script
- `register_viewer.bat` - Windows file association
- `install_viewer.sh` - macOS/Linux installation
- `uninstall_viewer.sh` - macOS/Linux uninstallation
- `requirements.txt` - Python dependencies
- `README.md` - This file
- `MACOS_LINUX_INSTALLATION.md` - Detailed macOS/Linux guide

## ✅ Supported File Types

| Type | Extensions | Display |
|------|-----------|---------|
| Images | .jpg, .png, .gif, .bmp, .webp | Full with zoom |
| PDF | .pdf | Full with navigation |
| Word | .docx | Full text |
| Excel | .xlsx | Full with tabs |
| PowerPoint | .pptx | Full slides |
| Text | .txt, .md, .log, .csv, .json, .xml | Full display |
| Code | .html, .css, .js, .py, .java, .c, .cpp | Syntax highlighted |

## 🎯 Quick Commands

```bash
# Windows
build_viewer.bat
register_viewer.bat
"dist\Secure Scramble Viewer.exe" file.ssv

# macOS/Linux
./build_viewer.sh
sudo ./install_viewer.sh
ssv-viewer file.ssv
```

---

**Secure viewing with full document support!** 🔒✅
