# 📱 Mobile Access Setup for Century: Spice Road

## Quick Start

### Option 1: Using the Mobile Server Script (Recommended)
1. **Double-click** `start-mobile-server.bat` (Windows) or run `start-mobile-server.ps1` (PowerShell)
2. The script will show you the exact URL to use on your phone
3. Open your phone's browser and go to the displayed URL

### Option 2: Manual Setup
1. **Start a local server:**
   - Run `start-server.bat` or `start-server-node.bat`
   - Or use PowerShell: `python -m http.server 8080 --bind 0.0.0.0`

2. **Find your computer's IP address:**
   - Windows: Open Command Prompt and type `ipconfig`
   - Look for "IPv4 Address" under your WiFi adapter
   - It will look like `192.168.1.xxx` or `10.0.0.xxx`

3. **Access from your phone:**
   - Make sure your phone is on the same WiFi network
   - Open your phone's browser
   - Go to: `http://YOUR_IP_ADDRESS:8080`
   - Example: `http://192.168.1.100:8080`

## Mobile Optimizations

The game includes several mobile-friendly features:

### 🎮 Touch Controls
- Larger touch targets for cards and buttons
- Improved button spacing for finger navigation
- Responsive card sizing for different screen sizes

### 📱 Screen Adaptations
- Optimized layout for portrait and landscape modes
- Scalable UI elements that work on small screens
- Mobile-friendly modal dialogs and setup screens

### 🔧 Technical Improvements
- Prevents iOS zoom on form inputs
- Better viewport handling for mobile browsers
- Touch-friendly spice cube interactions

## Troubleshooting

### Can't Connect from Phone?
1. **Check WiFi**: Ensure both devices are on the same network
2. **Firewall**: Windows Firewall might block the connection
   - Allow Python or Node.js through Windows Firewall
   - Or temporarily disable firewall for testing
3. **IP Address**: Double-check the IP address is correct
4. **Port**: Make sure port 8080 isn't blocked

### Game Runs Slowly on Phone?
- Close other browser tabs
- Try landscape mode for better layout
- Restart the browser if needed

### Touch Issues?
- Make sure you're tapping directly on cards/buttons
- Try a slight tap-and-hold if quick taps don't register
- Zoom out if elements seem too small

## Server Requirements

You need one of these installed on your computer:
- **Python 3** (recommended): https://python.org
- **Node.js**: https://nodejs.org

## Network Security

The local server only runs on your home network and is automatically stopped when you close the command window. No external access is possible.

## Tips for Best Mobile Experience

1. **Use landscape mode** for the best layout
2. **Full-screen mode** in your browser (if available)
3. **Good lighting** to see the colorful spice cubes clearly
4. **Stable WiFi** connection for smooth gameplay

Enjoy playing Century: Spice Road on your phone! 🎲📱