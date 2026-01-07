@echo off
echo ========================================
echo Network Connectivity Checker
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
echo Your computer's IP address: %IP%
echo.
echo Testing network connectivity...
echo.

REM Test if we can bind to the network interface
echo Starting test server on port 8081...
timeout /t 2 /nobreak >nul
start /min python -m http.server 8081 --bind 0.0.0.0
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo MOBILE ACCESS INFORMATION:
echo.
echo 1. Make sure your phone is connected to the same WiFi
echo 2. On your phone, go to: http://%IP%:8080
echo 3. If that doesn't work, try: http://%IP%:8081
echo.
echo If you still can't connect:
echo - Check Windows Firewall settings
echo - Verify both devices are on same network
echo - Try restarting your router
echo ========================================
echo.

taskkill /f /im python.exe >nul 2>&1
echo Test complete. Press any key to exit.
pause >nul