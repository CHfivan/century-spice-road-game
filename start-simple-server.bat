@echo off
echo ========================================
echo Century: Spice Road - Simple Server
echo ========================================
echo.

echo Checking for available server options...
echo.

REM Get IP address
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        set IP=%%j
        goto :found
    )
)
:found

echo Your IP Address: %IP%
echo.

REM Try PowerShell server first (no installation needed)
echo Trying PowerShell HTTP Server (no installation required)...
powershell -ExecutionPolicy Bypass -File "start-powershell-server.ps1"

if errorlevel 1 (
    echo.
    echo PowerShell server failed. Trying alternatives...
    echo.
    
    REM Try Python from Microsoft Store
    echo Trying Python from Microsoft Store...
    python -m http.server 8080 --bind 0.0.0.0
    
    if errorlevel 1 (
        echo.
        echo ========================================
        echo NO SERVER SOFTWARE FOUND
        echo ========================================
        echo.
        echo You need to install one of these:
        echo.
        echo OPTION 1 - Python ^(Recommended^):
        echo   1. Go to: https://python.org
        echo   2. Download Python 3.11 or newer
        echo   3. During installation, check "Add to PATH"
        echo   4. Restart this script
        echo.
        echo OPTION 2 - Node.js:
        echo   1. Go to: https://nodejs.org
        echo   2. Download the LTS version
        echo   3. Install with default settings
        echo   4. Restart this script
        echo.
        echo OPTION 3 - Microsoft Store Python:
        echo   1. Open Microsoft Store
        echo   2. Search for "Python"
        echo   3. Install Python 3.11
        echo   4. Restart this script
        echo.
        echo OPTION 4 - Run as Administrator:
        echo   1. Right-click this file
        echo   2. Select "Run as administrator"
        echo   3. This allows PowerShell server to work
        echo.
        echo ========================================
        echo.
        pause
    )
)