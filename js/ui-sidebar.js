// Sidebar Layout UI Extensions
// This file extends the main UI.js with sidebar-specific functionality

class SidebarUI extends GameUI {
    constructor(game) {
        super(game);
        this.sidebarLayout = true;
    }

    // Override the renderPlayers method to use sidebar layout
    renderPlayers() {
        this.renderSidebarPlayers();
    }

    // Override renderGame to use sidebar layout
    renderGame() {
        // Force clear all selections when rendering
        this.clearSelection();
        
        this.renderHeader();
        this.renderSidebarLayout();
        
        console.log('Sidebar game rendered for player:', this.game.getCurrentPlayer().name);
    }

    // Override the original updateDisplay to use sidebar layout
    updateDisplay() {
        if (this.sidebarLayout) {
            this.renderSidebarLayout();
        } else {
            super.updateDisplay();
        }
    }

    renderSidebarLayout() {
        // Render victory cards and merchant market in main area
        this.renderVictoryCards();
        this.renderMerchantCards();
        
        // Render players with sidebar layout
        this.renderSidebarPlayers();
        
        // Update coin tracking
        this.updateCoinTracking();
        
        // Update all compact player displays
        this.updateAllCompactPlayers();
    }

    updateAllCompactPlayers() {
        // Update all compact player displays (coins, points, card counts)
        this.game.players.forEach((player, index) => {
            if (index > 0) { // Skip player 1 (main board)
                this.updateCompactPlayerDisplay(index);
            }
        });
    }

    updateCompactPlayerDisplay(playerIndex) {
        const player = this.game.players[playerIndex];
        if (!player) return;

        // Update coins display
        const compactBoard = document.querySelector(`[data-player="${playerIndex}"] .compact-coins-display`);
        if (compactBoard) {
            compactBoard.innerHTML = this.renderCompactCoins(player);
        }
        
        // Update points display
        const pointsDisplay = document.querySelector(`[data-player="${playerIndex}"] .compact-victory-points`);
        if (pointsDisplay) {
            const currentPoints = this.calculatePlayerCurrentPoints(player);
            const hasVictoryCards = player.victoryCards && player.victoryCards.length > 0;
            const hasCoins = player.coins && player.coins.length > 0;
            const displayPoints = hasVictoryCards || hasCoins ? currentPoints : 0;
            pointsDisplay.textContent = `${displayPoints} pts`;
        }

        // Update card counts
        const handIndicator = document.querySelector(`[data-player="${playerIndex}"] .hand-indicator .card-indicator-count`);
        const playedIndicator = document.querySelector(`[data-player="${playerIndex}"] .played-indicator .card-indicator-count`);
        const victoryIndicator = document.querySelector(`[data-player="${playerIndex}"] .victory-indicator .card-indicator-count`);
        
        if (handIndicator) handIndicator.textContent = player.hand.length;
        if (playedIndicator) playedIndicator.textContent = player.discardPile.length;
        if (victoryIndicator) victoryIndicator.textContent = player.victoryCards.length;

        // Update spice storage
        const compactStorage = document.querySelector(`[data-player="${playerIndex}"] .compact-spice-storage`);
        if (compactStorage) {
            compactStorage.innerHTML = this.renderCompactSpiceStorage(player);
        }
    }

    renderSidebarPlayers() {
        const player1Area = document.getElementById('player1-area');
        const compactPlayersArea = document.getElementById('compact-players-area');
        
        if (!player1Area) {
            console.error('❌ player1-area element not found');
            return;
        }
        
        if (!compactPlayersArea) {
            console.error('❌ compact-players-area element not found');
            return;
        }

        // Clear existing content
        player1Area.innerHTML = '';
        compactPlayersArea.innerHTML = '';

        if (!this.game.players || this.game.players.length === 0) {
            console.error('❌ No players found in game');
            return;
        }

        this.game.players.forEach((player, index) => {
            if (index === 0) {
                // Player 1 gets full board in main area
                const playerElement = this.createPlayerElement(player, index);
                
                // Override hand display for Player 1 - always show cards
                const handSection = playerElement.querySelector('.player-hand');
                if (handSection) {
                    const handCards = handSection.querySelector('.hand-cards');
                    if (handCards) {
                        handCards.innerHTML = player.hand.map((card, cardIndex) => 
                            `<div class="card mini-card merchant-card" data-player="${index}" data-card="${cardIndex}">
                                <div class="card-effect">${this.renderCardEffect(card)}</div>
                            </div>`
                        ).join('');
                        
                        // Add click listeners for Player 1's hand cards
                        const cardElements = handCards.querySelectorAll('.card');
                        cardElements.forEach((cardElement, cardIndex) => {
                            cardElement.addEventListener('click', () => {
                                this.selectHandCard(cardIndex);
                            });
                        });
                    }
                }
                
                playerElement.classList.add('main-player-board');
                player1Area.appendChild(playerElement);
            } else {
                // Other players get compact boards in sidebar
                const compactElement = this.createCompactPlayerElement(player, index);
                compactPlayersArea.appendChild(compactElement);
            }
        });
    }

    createCompactPlayerElement(player, index) {
        const playerDiv = document.createElement('div');
        const isAI = this.aiPlayers[index] ? true : false;
        const aiClass = isAI ? ' ai-player' : '';
        const activeClass = index === this.game.currentPlayerIndex ? ' active' : '';
        
        playerDiv.className = `compact-player-board${activeClass}${aiClass}`;
        playerDiv.setAttribute('data-player', index);

        // Calculate current points
        const currentPoints = this.calculatePlayerCurrentPoints(player);
        
        // Only show points if player has victory cards or coins
        const hasVictoryCards = player.victoryCards && player.victoryCards.length > 0;
        const hasCoins = player.coins && player.coins.length > 0;
        const displayPoints = hasVictoryCards || hasCoins ? currentPoints : 0;
        
        // Count cards
        const handCount = player.hand.length;
        const playedCount = player.discardPile.length;
        const victoryCount = player.victoryCards.length;

        playerDiv.innerHTML = `
            <div class="compact-player-info">
                <div class="compact-player-name">${player.name}</div>
                <div class="compact-victory-points">${displayPoints} pts</div>
            </div>
            
            <div class="compact-spice-storage">
                ${this.renderCompactSpiceStorage(player)}
            </div>
            
            <div class="compact-coins-display">
                ${this.renderCompactCoins(player)}
            </div>
            
            <div class="card-indicators">
                <div class="card-indicator hand-indicator" data-type="hand">
                    <span class="card-indicator-icon">🃏</span>
                    <span class="card-indicator-count">${handCount}</span>
                </div>
                <div class="card-indicator played-indicator" data-type="played">
                    <span class="card-indicator-icon">📤</span>
                    <span class="card-indicator-count">${playedCount}</span>
                </div>
                <div class="card-indicator victory-indicator" data-type="victory">
                    <span class="card-indicator-icon">🏆</span>
                    <span class="card-indicator-count">${victoryCount}</span>
                </div>
            </div>
        `;

        // Attach tooltip listeners
        setTimeout(() => {
            if (window.attachTooltipListeners) {
                window.attachTooltipListeners(index, player);
            }
        }, 100);

        return playerDiv;
    }

    renderCompactSpiceStorage(player) {
        let html = '';
        
        // Debug: Log player spices
        console.log(`Rendering spices for ${player.name}:`, player.spices);
        
        for (let i = 0; i < 10; i++) {
            const spice = player.spices[i];
            const slotClass = spice ? 'compact-spice-slot filled' : 'compact-spice-slot';
            const spiceHtml = spice ? `<div class="spice-cube spice-${spice}"></div>` : '';
            html += `<div class="${slotClass}">${spiceHtml}</div>`;
        }
        
        // Alternative: render based on spice counts
        if (html.indexOf('spice-cube') === -1) {
            // If no spices found in array format, try object format
            html = '';
            let slotIndex = 0;
            
            Object.entries(player.spices).forEach(([spiceType, count]) => {
                for (let i = 0; i < count && slotIndex < 10; i++) {
                    html += `<div class="compact-spice-slot filled"><div class="spice-cube spice-${spiceType}"></div></div>`;
                    slotIndex++;
                }
            });
            
            // Fill remaining slots
            while (slotIndex < 10) {
                html += `<div class="compact-spice-slot"></div>`;
                slotIndex++;
            }
        }
        
        return html;
    }

    renderCompactCoins(player) {
        let goldCount = 0;
        let silverCount = 0;
        
        // Handle both array and object formats for coins
        if (Array.isArray(player.coins)) {
            // Array format: [{type: 'gold'}, {type: 'silver'}, ...]
            goldCount = player.coins.filter(coin => coin.type === 'gold').length;
            silverCount = player.coins.filter(coin => coin.type === 'silver').length;
        } else if (player.coins && typeof player.coins === 'object') {
            // Object format: {gold: 2, silver: 1}
            goldCount = player.coins.gold || 0;
            silverCount = player.coins.silver || 0;
        }
        
        let html = '';
        
        if (goldCount > 0) {
            html += `
                <div class="compact-coin-group">
                    <div class="compact-coin gold">🪙</div>
                    <span class="compact-coin-count">${goldCount}</span>
                </div>
            `;
        }
        
        if (silverCount > 0) {
            html += `
                <div class="compact-coin-group">
                    <div class="compact-coin silver">🥈</div>
                    <span class="compact-coin-count">${silverCount}</span>
                </div>
            `;
        }
        
        if (goldCount === 0 && silverCount === 0) {
            html = '<div style="color: #999; font-size: 0.7em;">No coins</div>';
        }
        
        return html;
    }

    // Override player selection for sidebar layout
    selectHandCard(cardIndex) {
        // Always allow selection for player 1 in single-player mode
        super.selectHandCard(cardIndex);
    }

    // Update coin tracking to work with sidebar layout
    updateCoinTracking() {
        // Call the main coin rendering method
        if (this.renderCoinBars) {
            this.renderCoinBars();
        }
        
        // Update all compact player displays
        this.updateAllCompactPlayers();
    }

    // Override spice updates for sidebar layout
    updatePlayerSpices(playerIndex) {
        // Update compact display if it's not player 1
        if (playerIndex > 0) {
            this.updateCompactPlayerDisplay(playerIndex);
        }
    }

    // Override card count updates
    updatePlayerCards(playerIndex) {
        // Update compact indicators if it's not player 1
        if (playerIndex > 0) {
            this.updateCompactPlayerDisplay(playerIndex);
        }
    }
}

// Initialize sidebar UI when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the sidebar layout page
    if (document.querySelector('.players-sidebar')) {
        console.log('🎮 Initializing Sidebar Layout UI');
        
        // Override the global UI initialization
        window.initializeSidebarUI = function(game) {
            return new SidebarUI(game);
        };
    }
});