@echo off
echo Starting Century: Spice Road Local Server with Node.js...
echo.
npx http-server -p 8080 -o
if errorlevel 1 (
    echo Node.js not found. Please install Node.js or use another method.
    pause
)