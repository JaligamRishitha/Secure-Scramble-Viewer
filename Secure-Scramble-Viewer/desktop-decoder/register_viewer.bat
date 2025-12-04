@echo off
REM Register SSV Viewer as default handler for .ssv files

echo ========================================
echo Registering SSV Viewer (Silent Decoder)
echo ========================================
echo.

REM Get the full path to the executable
set EXE_PATH=%~dp0dist\Secure Scramble Viewer.exe

if not exist "%EXE_PATH%" (
    echo [ERROR] Secure Scramble Viewer.exe not found!
    echo Please build the application first using build_viewer.bat
    echo.
    pause
    exit /b 1
)

echo Found: %EXE_PATH%
echo.
echo This will make .ssv files open automatically!
echo Double-click .ssv → Decodes → Opens original file
echo.
pause

echo Registering file association for current user...
echo.

REM Register in HKEY_CURRENT_USER (no admin needed)
reg add "HKEY_CURRENT_USER\Software\Classes\.ssv" /ve /d "SSVFile" /f >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Registered .ssv extension
) else (
    echo [ERROR] Failed to register .ssv extension
    pause
    exit /b 1
)

reg add "HKEY_CURRENT_USER\Software\Classes\SSVFile" /ve /d "SecureScramble Viewer File" /f >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Registered SSVFile type
) else (
    echo [ERROR] Failed to register SSVFile type
)

reg add "HKEY_CURRENT_USER\Software\Classes\SSVFile\DefaultIcon" /ve /d "%EXE_PATH%,0" /f >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Registered icon
) else (
    echo [ERROR] Failed to register icon
)

reg add "HKEY_CURRENT_USER\Software\Classes\SSVFile\shell\open\command" /ve /d "\"%EXE_PATH%\" \"%%1\"" /f >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Registered open command
) else (
    echo [ERROR] Failed to register open command
)

echo.
echo ========================================
echo Registration Complete!
echo ========================================
echo.
echo Now when you double-click a .ssv file:
echo 1. It decodes automatically (no window)
echo 2. Opens the original file
echo 3. That's it! ✅
echo.
echo The decoded file is saved in:
echo   %TEMP%\ssv_viewer\
echo.
pause
