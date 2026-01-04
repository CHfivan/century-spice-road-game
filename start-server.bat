@echo off
echo Starting Century: Spice Road Local Server...
echo.
echo Trying Python 3...
python -m http.server 8080
if errorlevel 1 (
    echo Python 3 not found, trying Python 2...
    python -m SimpleHTTPServer 8080
)
if errorlevel 1 (
    echo Python not found. Please install Python or use another method.
    pause
)