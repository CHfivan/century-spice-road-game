// Century: Spice Road - Main Application

let game;
let gameUI;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create game instance
    game = new Game();
    
    // Create UI manager
    gameUI = new GameUI(game);
    
    // Show setup modal
    document.getElementById('setup-modal').classList.remove('hidden');
    
    console.log('Century: Spice Road initialized');
});

// Global utility functions
function formatSpiceType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function getSpiceColor(type) {
    const colors = {
        yellow: '#FFD700',
        red: '#DC143C',
        green: '#228B22',
        brown: '#8B4513'
    };
    return colors[type] || '#000';
}

// Debug functions (can be removed in production)
function debugGame() {
    console.log('Current Game State:', {
        currentPlayer: game.getCurrentPlayer().name,
        turn: game.turn,
        victoryCards: game.victoryCards.length,
        merchantCards: game.merchantCards.length,
        players: game.players.map(p => ({
            name: p.name,
            spices: p.spices,
            handSize: p.hand.length,
            discardSize: p.discardPile.length,
            victoryCards: p.victoryCards.length
        }))
    });
}

function debugPlayer(playerIndex = 0) {
    const player = game.players[playerIndex];
    console.log(`Player ${player.name}:`, {
        spices: player.spices,
        totalSpices: player.getTotalSpices(),
        hand: player.hand.map(c => c.name),
        discard: player.discardPile.map(c => c.name),
        victoryCards: player.victoryCards.map(c => c.points)
    });
}

// Make debug functions available globally
window.debugGame = debugGame;
window.debugPlayer = debugPlayer;