# Century: Spice Road - HTML5 Version

A digital implementation of the popular board game Century: Spice Road.

## How to Play

1. Open `index.html` in your web browser
2. Select the number of players (2-5)
3. Click "Start Game"

## Game Rules

### Objective
Be the first player to collect 5 victory point cards (2-3 players) or 6 victory point cards (4-5 players).

### Turn Actions
On your turn, choose ONE of these actions:

1. **Play a Merchant Card** - Use a card from your hand to gain, upgrade, or trade spices
2. **Acquire a Merchant Card** - Take a card from the market (pay 1 yellow spice per skipped card)
3. **Claim a Victory Point Card** - Pay spices to claim a victory card
4. **Rest** - Return all played cards to your hand

### Spice Types
- **Yellow** (Level 1) - Basic spice
- **Red** (Level 2) - Upgraded from yellow
- **Green** (Level 3) - Upgraded from red
- **Brown** (Level 4) - Most valuable spice

### Key Rules
- Maximum 10 spices per player
- Upgrade cards let you convert lower-level spices to higher-level ones
- Victory cards may give bonus spices when claimed
- Gold coins = 5 points, Silver coins = 3 points
- Non-yellow spices = 1 point each at game end

## Features

- Full game implementation with all core mechanics
- Clean, intuitive UI
- Responsive design for different screen sizes
- Visual spice cube representation
- Turn-based gameplay
- Automatic game end detection
- Score calculation

## Future Enhancements

- AI players for single-player mode
- Online multiplayer support
- Animated card effects
- Sound effects
- Game statistics and history
- Tournament mode

## Technical Details

Built with vanilla HTML5, CSS3, and JavaScript. No external dependencies required.

### File Structure
- `index.html` - Main game interface
- `styles.css` - Game styling and layout
- `js/game.js` - Core game logic and Player class
- `js/cards.js` - Card data and definitions
- `js/ui.js` - UI management and rendering
- `js/main.js` - Application initialization

## Browser Compatibility

Works in all modern browsers that support ES6+ JavaScript features.