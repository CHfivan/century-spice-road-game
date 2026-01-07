@echo off
echo ========================================
echo Century: Spice Road - Mobile Server
echo ========================================
echo.

echo Getting your computer's IP address...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        set IP=%%j
        goto :found
    )
)
:found

echo.
echo Starting local server on port 8080...
echo.
echo ========================================
echo ACCESS FROM YOUR PHONE:
echo.
echo 1. Make sure your phone is on the same WiFi network
echo 2. Open your phone's browser
echo 3. Try these URLs in order:
echo.
echo    Simple Test:  http://%IP%:8080/mobile-simple.html
echo    Debug Test:   http://%IP%:8080/mobile-debug.html
echo    Full Game:    http://%IP%:8080/index.html
echo.
echo Local access: http://localhost:8080
echo Network access: http://%IP%:8080
echo ========================================
echo.
echo TROUBLESHOOTING:
echo - If loading stops at 5%%, try the Simple Test first
echo - Check Windows Firewall settings
echo - Make sure both devices are on same WiFi
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try Python 3 first with CORS headers
echo Starting Python server with CORS support...
python -c "
import http.server
import socketserver
from http.server import SimpleHTTPRequestHandler

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

PORT = 8080
Handler = CORSRequestHandler

with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    print(f'Server running at http://0.0.0.0:{PORT}/')
    httpd.serve_forever()
"

if errorlevel 1 (
    echo Python 3 not found, trying basic Python server...
    python -m http.server 8080 --bind 0.0.0.0
)
if errorlevel 1 (
    echo Python not found. Trying Node.js...
    npx http-server -p 8080 -a 0.0.0.0 --cors
)
if errorlevel 1 (
    echo.
    echo ERROR: No suitable server found!
    echo Please install one of the following:
    echo - Python 3: https://python.org
    echo - Node.js: https://nodejs.org
    echo.
    echo Or check MOBILE-TROUBLESHOOTING.md for more solutions
    echo.
    pause
)