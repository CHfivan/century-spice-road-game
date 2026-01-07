# PowerShell HTTP Server - No Python/Node.js Required
# This uses only built-in Windows PowerShell features

param(
    [int]$Port = 8080
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Century: Spice Road - PowerShell Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get IP address
$IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.InterfaceAlias -like "*Wi-Fi*"
}).IPAddress | Select-Object -First 1

if (-not $IP) {
    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.IPAddress -notlike "127.*" -and 
        $_.IPAddress -notlike "169.254.*"
    }).IPAddress | Select-Object -First 1
}

Write-Host "Your IP Address: $IP" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ACCESS FROM YOUR PHONE:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Make sure your phone is on the same WiFi network" -ForegroundColor White
Write-Host "2. Open your phone's browser" -ForegroundColor White
Write-Host "3. Try these URLs:" -ForegroundColor White
Write-Host ""
Write-Host "   Simple Test:  http://$IP`:$Port/mobile-simple.html" -ForegroundColor Cyan
Write-Host "   Debug Test:   http://$IP`:$Port/mobile-debug.html" -ForegroundColor Cyan
Write-Host "   Full Game:    http://$IP`:$Port/index.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local access: http://localhost:$Port" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$Port/")

try {
    $listener.Start()
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
    Write-Host "📁 Serving files from: $(Get-Location)" -ForegroundColor Yellow
    Write-Host ""
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get the requested file path
        $path = $request.Url.LocalPath.TrimStart('/')
        if ($path -eq '' -or $path -eq '/') {
            $path = 'index.html'
        }
        
        $filePath = Join-Path (Get-Location) $path
        
        # Log the request
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] $($request.HttpMethod) $($request.Url.LocalPath) from $($request.RemoteEndPoint.Address)" -ForegroundColor Gray
        
        if (Test-Path $filePath -PathType Leaf) {
            try {
                # Determine content type
                $contentType = switch ([System.IO.Path]::GetExtension($filePath).ToLower()) {
                    '.html' { 'text/html; charset=utf-8' }
                    '.css'  { 'text/css; charset=utf-8' }
                    '.js'   { 'application/javascript; charset=utf-8' }
                    '.json' { 'application/json; charset=utf-8' }
                    '.png'  { 'image/png' }
                    '.jpg'  { 'image/jpeg' }
                    '.jpeg' { 'image/jpeg' }
                    '.gif'  { 'image/gif' }
                    '.ico'  { 'image/x-icon' }
                    default { 'application/octet-stream' }
                }
                
                # Read file content
                $content = [System.IO.File]::ReadAllBytes($filePath)
                
                # Set response headers
                $response.ContentType = $contentType
                $response.ContentLength64 = $content.Length
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache")
                $response.StatusCode = 200
                
                # Send response
                $response.OutputStream.Write($content, 0, $content.Length)
                $response.OutputStream.Close()
                
                Write-Host "    ✅ Served: $path ($($content.Length) bytes)" -ForegroundColor Green
            }
            catch {
                Write-Host "    ❌ Error serving $path`: $($_.Exception.Message)" -ForegroundColor Red
                $response.StatusCode = 500
                $response.Close()
            }
        }
        else {
            # File not found
            $response.StatusCode = 404
            $errorContent = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $path")
            $response.ContentLength64 = $errorContent.Length
            $response.OutputStream.Write($errorContent, 0, $errorContent.Length)
            $response.OutputStream.Close()
            
            Write-Host "    ❌ Not found: $path" -ForegroundColor Red
        }
    }
}
catch [System.Net.HttpListenerException] {
    if ($_.Exception.ErrorCode -eq 5) {
        Write-Host ""
        Write-Host "❌ ACCESS DENIED ERROR" -ForegroundColor Red
        Write-Host ""
        Write-Host "This usually means you need to run PowerShell as Administrator." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "SOLUTIONS:" -ForegroundColor Cyan
        Write-Host "1. Right-click PowerShell and 'Run as Administrator'" -ForegroundColor White
        Write-Host "2. Or try a different port: .\start-powershell-server.ps1 -Port 3000" -ForegroundColor White
        Write-Host "3. Or install Python/Node.js for easier setup" -ForegroundColor White
    }
    else {
        Write-Host "❌ Server Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Unexpected Error: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    Write-Host ""
    Write-Host "Server stopped." -ForegroundColor Yellow
}