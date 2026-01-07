// Century: Spice Road - Main Application

let game;
let gameUI;
let aiElementsCheckAttempts = 0;
const MAX_CHECK_ATTEMPTS = 3;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing game...');
    
    // Create game instance
    game = new Game();
    
    // Create UI manager
    gameUI = new GameUI(game);
    
    // Show setup modal with a small delay to ensure all elements are rendered
    setTimeout(() => {
        const setupModal = document.getElementById('setup-modal');
        if (setupModal) {
            setupModal.classList.remove('hidden');
            console.log('Setup modal shown');
            
            // Debug: Check if AI elements exist with limited retry logic
            checkAIElements();
        } else {
            console.error('Setup modal not found!');
        }
    }, 100);
    
    console.log('Century: Spice Road initialized');
});

function checkAIElements() {
    aiElementsCheckAttempts++;
    console.log(`Checking AI elements (attempt ${aiElementsCheckAttempts}/${MAX_CHECK_ATTEMPTS})...`);
    
    const aiPlayersEl = document.getElementById('ai-players');
    const aiDifficultyEl = document.getElementById('ai-difficulty');
    
    if (aiPlayersEl && aiDifficultyEl) {
        console.log('✅ AI setup elements found');
        console.log('AI Players options:', aiPlayersEl.options.length);
        console.log('AI Difficulty options:', aiDifficultyEl.options.length);
        
        // Ensure elements are visible
        aiPlayersEl.style.display = 'block';
        aiPlayersEl.style.visibility = 'visible';
        aiDifficultyEl.style.display = 'block';
        aiDifficultyEl.style.visibility = 'visible';
        
        // Check parent elements
        const setupOptions = document.querySelector('.setup-options');
        if (setupOptions) {
            setupOptions.style.display = 'flex';
            setupOptions.style.flexDirection = 'column';
        }
        
        // Reset attempt counter
        aiElementsCheckAttempts = 0;
        
    } else {
        console.error('❌ AI setup elements missing:', {
            aiPlayers: !!aiPlayersEl,
            aiDifficulty: !!aiDifficultyEl
        });
        
        // Debug: Check all elements in the modal
        const setupModal = document.getElementById('setup-modal');
        if (setupModal) {
            console.log('Setup modal found, checking contents...');
            const allSelects = setupModal.querySelectorAll('select');
            console.log('All select elements found:', allSelects.length);
            allSelects.forEach((select, index) => {
                console.log(`Select ${index}: id="${select.id}", name="${select.name}"`);
            });
            
            const allDivs = setupModal.querySelectorAll('div');
            console.log('All div elements in modal:', allDivs.length);
            
            const setupSections = setupModal.querySelectorAll('.setup-section');
            console.log('Setup sections found:', setupSections.length);
        }
        
        // Only retry if we haven't exceeded max attempts
        if (aiElementsCheckAttempts < MAX_CHECK_ATTEMPTS) {
            console.log(`Retrying in 500ms... (attempt ${aiElementsCheckAttempts + 1}/${MAX_CHECK_ATTEMPTS})`);
            setTimeout(() => {
                checkAIElements();
            }, 500);
        } else {
            console.error('❌ Max retry attempts reached. AI elements not found.');
            console.log('Proceeding without AI setup validation...');
        }
    }
}

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

// Manual AI elements check function for debugging
function manualCheckAIElements() {
    console.log('=== Manual AI Elements Check ===');
    const aiPlayersEl = document.getElementById('ai-players');
    const aiDifficultyEl = document.getElementById('ai-difficulty');
    const playerCountEl = document.getElementById('player-count');
    
    console.log('AI Players element:', aiPlayersEl);
    console.log('AI Difficulty element:', aiDifficultyEl);
    console.log('Player Count element:', playerCountEl);
    
    if (aiPlayersEl) {
        console.log('AI Players computed style:', getComputedStyle(aiPlayersEl));
    }
    
    if (aiDifficultyEl) {
        console.log('AI Difficulty computed style:', getComputedStyle(aiDifficultyEl));
    }
}

// Make debug functions available globally
window.debugGame = debugGame;
window.debugPlayer = debugPlayer;
window.manualCheckAIElements = manualCheckAIElements;