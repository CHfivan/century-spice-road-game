// Main game initialization for sidebar layout
// Based on main.js but adapted for sidebar layout

let game;
let ui;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 DOM Content Loaded - Initializing sidebar layout game...');
    
    try {
        // Initialize game
        game = new Game();
        
        // Check if we have sidebar UI available
        if (window.initializeSidebarUI) {
            ui = window.initializeSidebarUI(game);
            console.log('✅ Sidebar UI initialized');
        } else {
            // Fallback to regular UI
            ui = new GameUI(game);
            console.log('⚠️ Using fallback regular UI');
        }
        
        // Make UI accessible globally for onclick handlers
        window.gameUI = ui;
        
        // Set up game event handlers
        setupGameEventHandlers();
        
        // Show setup modal
        showSetupModal();
        
        console.log('✅ Sidebar layout game initialization complete');
        
    } catch (error) {
        console.error('❌ Error during sidebar layout game initialization:', error);
        console.error('Stack trace:', error.stack);
    }
});

function setupGameEventHandlers() {
    // Setup modal handlers
    const setupModal = document.getElementById('setup-modal');
    const startGameBtn = document.getElementById('start-game');
    const playerCountSelect = document.getElementById('player-count');
    const aiPlayersSelect = document.getElementById('ai-players');
    const aiDifficultySelect = document.getElementById('ai-difficulty');

    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            const playerCount = parseInt(playerCountSelect.value);
            const aiCount = parseInt(aiPlayersSelect.value);
            const aiDifficulty = aiDifficultySelect.value;
            
            console.log(`🎮 Starting game: ${playerCount} players, ${aiCount} AI, difficulty: ${aiDifficulty}`);
            
            startGame(playerCount, aiCount, aiDifficulty);
            hideSetupModal();
        });
    }

    // Menu handlers
    const menuBtn = document.getElementById('menu-btn');
    const gameMenuModal = document.getElementById('game-menu-modal');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => showModal('game-menu-modal'));
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => hideModal('game-menu-modal'));
    }

    // Game rules handlers
    const gameRulesBtn = document.getElementById('game-rules-btn');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    
    if (gameRulesBtn) {
        gameRulesBtn.addEventListener('click', () => {
            hideModal('game-menu-modal');
            showModal('game-rules-modal');
        });
    }
    
    if (closeRulesBtn) {
        closeRulesBtn.addEventListener('click', () => hideModal('game-rules-modal'));
    }

    // Restart game handlers
    const restartGameBtn = document.getElementById('restart-game-btn');
    const confirmRestartBtn = document.getElementById('confirm-restart-btn');
    const cancelRestartBtn = document.getElementById('cancel-restart-btn');
    
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', () => {
            hideModal('game-menu-modal');
            showModal('restart-confirm-modal');
        });
    }
    
    if (confirmRestartBtn) {
        confirmRestartBtn.addEventListener('click', () => {
            hideModal('restart-confirm-modal');
            location.reload(); // Simple restart by reloading page
        });
    }
    
    if (cancelRestartBtn) {
        cancelRestartBtn.addEventListener('click', () => hideModal('restart-confirm-modal'));
    }

    // Action modal handlers
    const confirmActionBtn = document.getElementById('confirm-action');
    const cancelActionBtn = document.getElementById('cancel-action');
    
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', () => {
            if (ui && ui.confirmCurrentAction) {
                ui.confirmCurrentAction();
            }
        });
    }
    
    if (cancelActionBtn) {
        cancelActionBtn.addEventListener('click', () => {
            if (ui && ui.cancelCurrentAction) {
                ui.cancelCurrentAction();
            }
        });
    }

    // Modal background click handlers
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

function startGame(playerCount, aiCount, aiDifficulty) {
    try {
        console.log(`🎮 Starting sidebar layout game with ${playerCount} players (${aiCount} AI)`);
        
        // Initialize game
        game.setupGame(playerCount);
        
        // Set up AI players
        if (aiCount > 0 && window.AIPlayer) {
            ui.setupAIPlayers(aiCount, aiDifficulty);
        }
        
        // Start the game using UI method
        ui.startGame(playerCount, aiCount, aiDifficulty);
        
        // Update global reference after game starts
        window.gameUI = ui;
        
        console.log('✅ Sidebar layout game started successfully');
        
    } catch (error) {
        console.error('❌ Error starting sidebar layout game:', error);
        ui.showError('Failed to start game: ' + error.message);
    }
}

function showSetupModal() {
    const modal = document.getElementById('setup-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideSetupModal() {
    const modal = document.getElementById('setup-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('❌ Global error in sidebar layout:', e.error);
    if (ui && ui.showError) {
        ui.showError('An unexpected error occurred. Please refresh the page.');
    }
});

// Export for debugging
window.sidebarGame = {
    game: () => game,
    ui: () => ui,
    restart: () => location.reload()
};