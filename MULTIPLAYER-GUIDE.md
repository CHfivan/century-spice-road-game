# Century: Spice Road - Multiplayer Guide

## Overview

The multiplayer system allows players to play Century: Spice Road together across multiple devices using WebRTC peer-to-peer connections with localStorage-based signaling.

## How It Works

### Architecture
- **WebRTC**: Peer-to-peer connections for real-time game data
- **localStorage Signaling**: Simple signaling mechanism for connection establishment
- **Host-Client Model**: One player hosts the room, others join
- **Game State Sync**: Host maintains authoritative game state

### Key Components

1. **MultiplayerManager** (`js/multiplayer.js`)
   - Handles room creation/joining
   - Manages WebRTC connections
   - Processes signaling messages
   - Coordinates player management

2. **MultiplayerGame** (`js/main-multiplayer.js`)
   - Extends base Game class
   - Adds network player support
   - Handles game state synchronization
   - Manages turn validation

3. **MultiplayerGameUI** (`js/main-multiplayer.js`)
   - Extends base GameUI class
   - Adds network action broadcasting
   - Handles remote player actions
   - Manages UI for multiplayer features

## Usage Instructions

### Creating a Game Room

1. Open `multiplayer-century.html`
2. Enter your player name
3. Click "Create Game Room"
4. Configure room settings:
   - Room name
   - Maximum players (2-5)
   - AI players (0-3)
   - AI difficulty
5. Click "Create Room"
6. Share the 6-digit room code with friends

### Joining a Game Room

1. Open `multiplayer-century.html`
2. Enter your player name
3. Click "Join Game Room"
4. Enter the 6-digit room code
5. Click "Join Room"
6. Wait for host to start the game

### Playing the Game

- Only the current player can take actions
- All players see each other's:
  - Victory cards claimed
  - Coins earned
  - Cards played (in discard pile)
  - Hand size (but not actual cards)
- Game follows standard Century: Spice Road rules
- Host manages AI players if any

## Technical Details

### Connection Process

1. **Room Creation**: Host creates room data in localStorage
2. **Signaling**: Players exchange connection info via localStorage events
3. **WebRTC Setup**: Peer connections established with STUN servers
4. **Data Channels**: Game data transmitted over WebRTC data channels
5. **Game Sync**: Host broadcasts game state changes to all players

### Network Messages

- `room-update`: Player list changes
- `game-start`: Game initialization
- `game-action`: Player actions (play card, acquire, etc.)
- `game-state`: Complete game state sync
- `player-disconnected`: Player left/disconnected

### Error Handling

- Connection failures fall back to error messages
- Disconnected players marked as offline
- Host can continue game with remaining players
- Automatic cleanup of expired room data

## Limitations

- **Signaling**: Uses localStorage, requires same-origin policy
- **NAT Traversal**: May not work behind strict firewalls
- **Scalability**: Designed for 2-5 players maximum
- **Persistence**: No game save/resume functionality
- **Reconnection**: Limited reconnection support

## Troubleshooting

### Common Issues

1. **Room Not Found**
   - Check room code spelling
   - Ensure room hasn't expired (1 hour limit)
   - Verify same browser/origin

2. **Connection Failed**
   - Check internet connection
   - Try different browser
   - Disable VPN/proxy if active

3. **Game Desync**
   - Host should refresh and recreate room
   - All players rejoin with new room code

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: WebRTC support varies
- **Mobile**: Basic support, may have limitations

## Development Notes

### File Structure
```
multiplayer-century.html    # Main multiplayer interface
js/multiplayer.js          # Core networking logic
js/main-multiplayer.js     # Game integration
styles.css                 # Includes multiplayer UI styles
```

### Testing
- Use `test-multiplayer-complete.html` for system testing
- Test with multiple browser tabs/windows
- Verify WebRTC and localStorage functionality

### Future Improvements
- Dedicated signaling server
- Game persistence/save states
- Spectator mode
- Tournament/lobby system
- Mobile app integration

## Security Considerations

- All game data transmitted over encrypted WebRTC
- No server-side data storage
- Room codes expire automatically
- Local storage only for signaling

---

For technical support or bug reports, check the browser console for error messages and ensure all required JavaScript files are loaded properly.