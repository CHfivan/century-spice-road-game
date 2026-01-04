# Century: Spice Road - Local Multiplayer Setup

## 🎮 How to Play with Friends on Same WiFi

### Step 1: Start the Server
**Option A - Python (Easiest):**
1. Double-click `start-server.bat`
2. A command window will open showing "Serving at port 8080"

**Option B - Node.js:**
1. Double-click `start-server-node.bat`
2. Browser should open automatically

**Option C - Manual Python:**
1. Open Command Prompt in the game folder
2. Type: `python -m http.server 8080`
3. Press Enter

### Step 2: Find Your IP Address
1. Keep the server running
2. Open Command Prompt (Windows Key + R, type `cmd`)
3. Type: `ipconfig`
4. Look for "IPv4 Address" under your WiFi adapter
5. Example: `192.168.1.100`

### Step 3: Share the Game Link
**Your game URL will be:** `http://YOUR-IP-ADDRESS:8080`

**Example:** `http://192.168.1.100:8080`

### Step 4: Friends Join
1. Friends open their web browser (phone, tablet, laptop)
2. Make sure they're on the same WiFi network
3. They type your game URL in their browser
4. Everyone can now play the same game!

## 🔧 Troubleshooting

**"Can't connect" issues:**
- Make sure everyone is on the same WiFi
- Check Windows Firewall isn't blocking port 8080
- Try turning off Windows Firewall temporarily

**"Python not found" error:**
- Download Python from python.org
- Or use the file:// method below

**Alternative - File Sharing Method:**
1. Put the game folder in a shared network folder
2. Friends can open `index.html` directly from the shared folder

## 📱 Device Compatibility
- ✅ Windows/Mac/Linux computers
- ✅ iPhones/iPads (Safari)
- ✅ Android phones/tablets (Chrome)
- ✅ Any device with a modern web browser

## 🎯 Game Features
- Turn-based gameplay (players take turns on their devices)
- Real-time updates (everyone sees the current game state)
- Works with 2-5 players
- No internet connection needed (just local WiFi)

## 🚀 Pro Tips
- Use a laptop/desktop as the "host" for stability
- Keep the server computer plugged in
- Make sure all devices stay connected to WiFi
- Bookmark the game URL on each device for easy access

Have fun playing Century: Spice Road with your friends! 🎲