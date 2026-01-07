# Century: Spice Road - HTML5 Version

A comprehensive digital implementation of the popular board game Century: Spice Road with advanced features and AI opponents.

## 🎮 How to Play

1. Open `index.html` in your web browser
2. Configure game settings:
   - Select number of players (2-5)
   - Choose AI opponents (0-4)
   - Set AI difficulty (Easy/Medium/Hard)
3. Click "Start Game"

## 🎯 Game Rules

### Objective
Be the first player to collect 5 victory point cards (2-3 players) or 6 victory point cards (4-5 players) to trigger the final round. Highest total score wins!

### Turn Actions
On your turn, choose ONE of these actions:

1. **Play a Merchant Card (1)** - Use a card from your hand to gain, upgrade, or trade spices
2. **Acquire a Merchant Card (2)** - Take a card from the market (pay 1 yellow spice per skipped card)
3. **Claim a Victory Point Card (3)** - Pay spices to claim a victory card
4. **Rest (4)** - Return all played cards to your hand

### Spice System
- **Yellow** (Level 1) - Basic spice, starting resource
- **Red** (Level 2) - Upgraded from yellow
- **Green** (Level 3) - Upgraded from red  
- **Brown** (Level 4) - Most valuable spice

### Key Rules
- Maximum 10 spices per player (choose which to discard if exceeded)
- Upgrade cards let you convert lower-level spices to higher-level ones
- Victory cards may give bonus spices when claimed
- Gold coins = 5 points, Silver coins = 3 points
- Non-yellow spices = 1 point each at game end

## ✨ Advanced Features

### 🌐 Multiplayer Mode
- **Cross-Device Play**: Play with friends on different devices
- **Room System**: Create or join game rooms with 6-digit codes
- **Real-Time Sync**: All players see actions in real-time
- **Mixed AI Support**: Add AI players to multiplayer games
- **WebRTC Technology**: Peer-to-peer connections for low latency

**To play multiplayer:**
1. Open `multiplayer-century.html`
2. Create a room or join with a room code
3. Configure players and AI settings
4. Start the game when all players are ready

See `MULTIPLAYER-GUIDE.md` for detailed instructions.

### 🤖 AI Players
- **Three Difficulty Levels**: Easy, Medium, Hard
- **Smart Decision Making**: AI evaluates all possible actions and chooses strategically
- **Realistic Gameplay**: AI has thinking time and makes human-like decisions
- **Mixed Games**: Play with any combination of human and AI players

### 📊 Analytics & Statistics
- **Game History**: Track all completed games with detailed records
- **Player Statistics**: Win rates, average scores, best performances
- **Achievement System**: Unlock achievements for special accomplishments
- **Trends Analysis**: See how your gameplay improves over time
- **Data Export/Import**: Backup and restore your game statistics

### 🎨 Enhanced User Experience
- **Smooth Animations**: Cards, buttons, and UI elements animate beautifully
- **Interactive Tooltips**: Hover over cards for detailed explanations
- **Keyboard Shortcuts**: Quick actions with number keys (1-4), Ctrl+U for undo, H for help
- **Undo System**: Undo your last action if you make a mistake
- **Visual Feedback**: Clear indicators for selections, AI turns, and game states
- **Responsive Design**: Works great on desktop, tablet, and mobile devices

### 🎮 Game Management
- **Final Round System**: Proper implementation of Century: Spice Road end-game rules
- **Spice Overflow Management**: Choose which spices to discard when exceeding limits
- **Modal-Based Interactions**: Clean, intuitive interface for all player choices
- **Game End Analysis**: Detailed score breakdown and winner celebration
- **Help System**: Comprehensive in-game help and tutorial information

## 🚀 Technical Features

### Core Implementation
- **Vanilla JavaScript**: No external dependencies, fast loading
- **Modular Architecture**: Separate files for game logic, UI, AI, and analytics
- **Local Storage**: Persistent statistics and game history
- **Cross-Browser Compatible**: Works in all modern browsers

### Performance Optimizations
- **Efficient Rendering**: Smart UI updates only when needed
- **Memory Management**: Proper cleanup and state management
- **Smooth Animations**: Hardware-accelerated CSS transitions
- **Responsive Layout**: Adaptive design for all screen sizes

## 🎯 Game Modes

### Single Player
- Play against 1-4 AI opponents
- Choose AI difficulty to match your skill level
- Perfect for learning the game or practicing strategies

### Multiplayer
- 2-5 human players on the same device
- Pass-and-play style gameplay
- Great for family game nights

### Mixed Games
- Any combination of human and AI players
- Fill empty seats with AI for consistent player counts
- Customize the experience to your preferences

## 📈 Statistics Tracking

### Individual Stats
- Games played and won
- Win percentage and average score
- Best and worst performances
- Victory cards and coins collected

### Game Analytics
- Total games played (human vs AI)
- Average game duration
- Most popular player counts
- Recent game history with details

### Achievement System
- **First Victory**: Win your first game
- **Perfect Game**: Win with exactly the required victory cards
- **Master Merchant**: Score 80+ points in a game
- **Speed Merchant**: Win in under 15 minutes
- **AI Challenger**: Beat hard AI opponents
- **Veteran Trader**: Win 10 games
- **Trading Champion**: Maintain 75%+ win rate

## 🎨 Visual Design

### Card System
- **Authentic Design**: Cards match the original game's visual style
- **Clear Iconography**: Easy-to-understand spice and action symbols
- **Visual Spice Cubes**: See actual quantities instead of just numbers
- **Hover Effects**: Interactive feedback for better usability

### UI Elements
- **Themed Colors**: Warm spice-trade inspired color palette
- **Smooth Transitions**: Polished animations throughout
- **Clear Typography**: Easy-to-read fonts and sizing
- **Intuitive Layout**: Logical organization of game elements

## 🔧 Development Features

### Testing Tools
- `test-quick-win.html` - Quick game testing (1 victory card to win)
- `test-final-round.html` - Final round mechanics testing
- `test-game-end.html` - Game end modal testing
- Multiple test files for different scenarios

### Local Multiplayer Setup
- `start-server.bat` - Python HTTP server for local network play
- `start-server-node.bat` - Node.js HTTP server alternative
- `LOCAL-MULTIPLAYER-SETUP.md` - Detailed setup instructions

### Version Control
- Complete Git history with detailed commit messages
- `setup-git.bat` - Easy Git repository initialization
- `BACKUP-INSTRUCTIONS.md` - Data backup and recovery guide

## 🎯 Future Enhancements

### Planned Features
- **Online Multiplayer**: Real-time games with remote players
- **Tournament Mode**: Bracket-style competitions
- **Custom Card Sets**: Create and share custom merchant cards
- **Replay System**: Watch and analyze completed games
- **Advanced AI**: Machine learning-based opponents
- **Mobile App**: Native iOS and Android versions

### Possible Expansions
- **Century: Eastern Wonders**: Second game in the series
- **Century: A New World**: Third game in the series
- **Combined Games**: Play with multiple Century games together

## 🛠️ Technical Requirements

### Browser Support
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- JavaScript ES6+ support required
- Local Storage support for statistics

### Performance
- Minimum 1GB RAM recommended
- Works on devices from phones to desktops
- Optimized for 60fps animations

## 📝 File Structure

```
├── index.html              # Main game interface
├── styles.css              # Complete styling and animations
├── js/
│   ├── game.js             # Core game logic and rules
│   ├── cards.js            # Official card data (45 merchant + victory cards)
│   ├── ui.js               # User interface management
│   ├── ai-player.js        # AI opponent system
│   ├── analytics.js        # Statistics and achievement tracking
│   └── main.js             # Application initialization
├── test-*.html             # Various testing interfaces
├── start-server*.bat       # Local multiplayer server scripts
└── *.md                    # Documentation and setup guides
```

## 🏆 Achievements

This implementation includes a comprehensive achievement system that rewards players for various accomplishments:

- **Gameplay Achievements**: Perfect games, high scores, speed runs
- **Progression Achievements**: First win, milestone victories
- **Challenge Achievements**: Beating AI opponents, maintaining win streaks
- **Social Achievements**: Playing with different player counts

## 📊 Analytics Dashboard

Access detailed statistics through the in-game statistics panel:

- **Overall Statistics**: Total games, AI vs human games, average duration
- **Player Rankings**: Win rates, average scores, best performances  
- **Recent Games**: History of your last games with winners and scores
- **Trends Analysis**: See how your gameplay evolves over time

## 🎮 Getting Started

1. **Download**: Clone or download all files to your computer
2. **Open**: Double-click `index.html` to start playing immediately
3. **Configure**: Choose your preferred game settings
4. **Play**: Enjoy the full Century: Spice Road experience!

For local network multiplayer, see `LOCAL-MULTIPLAYER-SETUP.md` for detailed instructions.

---

**Built with ❤️ for board game enthusiasts**

*This is an unofficial digital implementation created for educational and entertainment purposes.*