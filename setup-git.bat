@echo off
echo Setting up Git repository for Century: Spice Road...
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/windows
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo Git found! Initializing repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Complete Century Spice Road HTML5 game

Features:
- Full game mechanics (play, acquire, claim, rest)
- Upgrade system with player choices  
- Trade system with flexible ratios
- Visual spice cube display
- Local multiplayer support
- Responsive UI design
- Turn-based gameplay for 2-5 players"

echo.
echo ✅ Git repository created successfully!
echo.
echo Future commits:
echo   git add .
echo   git commit -m "Your commit message"
echo.
pause