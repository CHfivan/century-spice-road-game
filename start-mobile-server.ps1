# Century: Spice Road - Mobile Server (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Century: Spice Road - Mobile Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Getting your computer's IP address..." -ForegroundColor Yellow
$IP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"}).IPAddress | Select-Object -First 1

if (-not $IP) {
    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"}).IPAddress | Select-Object -First 1
}

Write-Host ""
Write-Host "Starting local server on port 8080..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ACCESS FROM YOUR PHONE:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Make sure your phone is on the same WiFi network" -ForegroundColor White
Write-Host "2. Open your phone's browser" -ForegroundColor White
Write-Host "3. Go to: http://$IP`:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local access: http://localhost:8080" -ForegroundColor Gray
Write-Host "Network access: http://$IP`:8080" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Try different server options
try {
    Write-Host "Starting Python HTTP server..." -ForegroundColor Yellow
    python -m http.server 8080 --bind 0.0.0.0
} catch {
    try {
        Write-Host "Python 3 not found, trying Node.js..." -ForegroundColor Yellow
        npx http-server -p 8080 -a 0.0.0.0
    } catch {
        Write-Host ""
        Write-Host "ERROR: No suitable server found!" -ForegroundColor Red
        Write-Host "Please install one of the following:" -ForegroundColor Yellow
        Write-Host "- Python 3: https://python.org" -ForegroundColor White
        Write-Host "- Node.js: https://nodejs.org" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
    }
}