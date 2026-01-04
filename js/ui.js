// Century: Spice Road - UI Management

class GameUI {
    constructor(game) {
        this.game = game;
        this.selectedCard = null;
        this.selectedCardType = null; // 'hand', 'merchant', or 'victory'
        this.selectedAction = null;
        this.pendingCardPlay = null; // Stores card info until effect is chosen
        this.finalRoundMessageShown = false; // Track if final round message was shown
        this.gameHistory = []; // Store game states for undo functionality
        this.maxHistorySize = 10; // Limit history size
        this.aiPlayers = []; // Store AI player instances
        this.isAITurn = false; // Track if it's currently an AI turn
        this.initializeEventListeners();
    }

    // Message display system
    showMessage(message, type = 'error', duration = 3000) {
        const messageElement = document.getElementById('game-message');
        
        // For game end messages, add a close button
        if (type === 'success' && duration > 5000) {
            messageElement.innerHTML = `
                ${message}
                <br><br>
                <button onclick="document.getElementById('game-message').classList.add('hidden')" 
                        style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); 
                               color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    Close
                </button>
            `;
        } else {
            messageElement.textContent = message;
        }
        
        messageElement.className = `game-message ${type}`;
        
        // Auto-hide after duration (unless it's a long message with close button)
        if (duration < 10000) {
            setTimeout(() => {
                messageElement.classList.add('hidden');
            }, duration);
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    initializeEventListeners() {
        // Setup modal
        document.getElementById('start-game').addEventListener('click', () => {
            const playerCount = parseInt(document.getElementById('player-count').value);
            const aiCount = parseInt(document.getElementById('ai-players').value);
            const aiDifficulty = document.getElementById('ai-difficulty').value;
            
            // Validate AI count doesn't exceed total players
            if (aiCount >= playerCount) {
                alert('AI players must be less than total players');
                return;
            }
            
            this.startGame(playerCount, aiCount, aiDifficulty);
        });

        // Cancel button for action modal
        document.getElementById('cancel-action').addEventListener('click', () => {
            this.cancelAction();
        });

        // Confirm button for action modal
        document.getElementById('confirm-action').addEventListener('click', () => {
            this.confirmAction();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelpModal();
            });
        }

        // Note: Action button event listeners are now added dynamically in renderPlayers()
        // when the current player's board is rendered
    }
    
    handleKeyboardShortcuts(event) {
        // Only handle shortcuts if no modal is open and game is running
        if (document.querySelector('.modal:not(.hidden)') || this.game.gameEnded) {
            return;
        }
        
        const currentPlayer = this.game.getCurrentPlayer();
        if (!currentPlayer) return;
        
        switch (event.key.toLowerCase()) {
            case '1':
                event.preventDefault();
                this.showPlayCardAction();
                break;
            case '2':
                event.preventDefault();
                this.showAcquireCardAction();
                break;
            case '3':
                event.preventDefault();
                this.showClaimVictoryAction();
                break;
            case '4':
                event.preventDefault();
                this.showRestAction();
                break;
            case 'u':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.undoLastAction();
                }
                break;
            case 'h':
                event.preventDefault();
                this.showHelpModal();
                break;
            case 'escape':
                event.preventDefault();
                this.clearSelection();
                break;
        }
    }
    
    showHelpModal() {
        const modal = document.getElementById('action-modal');
        const title = document.getElementById('action-title');
        const content = document.getElementById('action-content');
        
        title.textContent = 'Game Help & Shortcuts';
        
        content.innerHTML = `
            <div class="help-content">
                <h4>How to Play</h4>
                <p>Choose one action per turn:</p>
                <ul>
                    <li><strong>Play Card (1)</strong> - Use a card from your hand</li>
                    <li><strong>Acquire Card (2)</strong> - Buy a merchant card from the market</li>
                    <li><strong>Claim Victory (3)</strong> - Purchase a victory point card</li>
                    <li><strong>Rest (4)</strong> - Return all played cards to your hand</li>
                </ul>
                
                <h4>Keyboard Shortcuts</h4>
                <ul>
                    <li><strong>1-4</strong> - Quick action selection</li>
                    <li><strong>Ctrl+U</strong> - Undo last action</li>
                    <li><strong>H</strong> - Show this help</li>
                    <li><strong>Escape</strong> - Clear selection</li>
                </ul>
                
                <h4>Spice System</h4>
                <p>Yellow → Red → Green → Brown (increasing value)</p>
                <p>Maximum 10 spices per player</p>
                
                <h4>Winning</h4>
                <p>First to get ${this.game.victoryCardsNeeded} victory cards triggers final round</p>
                <p>Highest total score wins (victory points + coins + spices)</p>
            </div>
        `;
        
        // Hide default buttons and show close button
        document.getElementById('confirm-action').style.display = 'none';
        document.getElementById('cancel-action').textContent = 'Close';
        document.getElementById('cancel-action').style.display = 'block';
        
        modal.classList.remove('hidden');
    }

    startGame(playerCount, aiCount = 0, aiDifficulty = 'medium') {
        try {
            console.log('Starting game with', playerCount, 'players,', aiCount, 'AI players');
            this.game.setupGame(playerCount);
            
            // Initialize AI players
            this.initializeAIPlayers(aiCount, aiDifficulty);
            
            // Initialize game statistics
            this.initializeGameStats();
            
            document.getElementById('setup-modal').classList.add('hidden');
            console.log('Modal hidden');
            
            this.renderGame();
            console.log('Game rendered');
            
            // Store initial turn state and save initial game state
            this.storeTurnStartState();
            this.saveGameState();
            
            // Check if first player is AI
            this.checkForAITurn();
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.showError('Error starting game: ' + error.message);
        }
    }
    
    initializeAIPlayers(aiCount, difficulty) {
        this.aiPlayers = [];
        
        // Create AI players for the last N players
        for (let i = 0; i < aiCount; i++) {
            const playerIndex = this.game.players.length - 1 - i;
            if (playerIndex >= 0) {
                const aiPlayer = new AIPlayer(difficulty);
                this.aiPlayers[playerIndex] = aiPlayer;
                
                // Update player name to indicate AI
                this.game.players[playerIndex].name = `AI ${i + 1} (${difficulty})`;
                this.game.players[playerIndex].isAI = true;
            }
        }
        
        console.log('AI players initialized:', this.aiPlayers);
    }
    
    async checkForAITurn() {
        const currentPlayer = this.game.getCurrentPlayer();
        const currentPlayerIndex = this.game.currentPlayerIndex;
        
        if (this.aiPlayers[currentPlayerIndex] && !this.game.gameEnded) {
            this.isAITurn = true;
            await this.executeAITurn(currentPlayerIndex);
        } else {
            this.isAITurn = false;
        }
    }
    
    async executeAITurn(playerIndex) {
        const aiPlayer = this.aiPlayers[playerIndex];
        const player = this.game.players[playerIndex];
        
        try {
            // Show AI thinking message
            this.showInfo(`${player.name} is thinking...`);
            
            // Get AI decision
            const decision = await aiPlayer.makeDecision(this.game, player);
            
            // Save game state before AI action
            this.saveGameState();
            
            // Execute the decision
            const result = await aiPlayer.executeAction(decision, this.game, player, this);
            
            if (result.success) {
                console.log(`${player.name} completed action:`, decision.action);
                
                // Handle spice overflow if needed
                if (player.needsToDiscardSpices()) {
                    this.handleAISpiceOverflow(player);
                }
                
                // Check for game end conditions
                if (this.game.finalRoundTriggered && !this.finalRoundMessageShown) {
                    this.showInfo(`${this.game.finalRoundTriggerPlayer.name} has triggered the final round! Each remaining player gets one more turn.`);
                    this.finalRoundMessageShown = true;
                }
                
                if (this.game.gameEnded) {
                    this.showGameEnd();
                } else {
                    // Continue to next turn
                    setTimeout(() => {
                        this.nextTurn();
                    }, 1000); // Small delay to show the action
                }
            } else {
                this.showError(`${player.name} action failed: ${result.message}`);
                // Try again with a different action
                setTimeout(() => {
                    this.executeAITurn(playerIndex);
                }, 1000);
            }
        } catch (error) {
            console.error('AI turn error:', error);
            this.showError(`${player.name} encountered an error`);
            this.nextTurn(); // Skip this turn
        }
    }
    
    handleAISpiceOverflow(player) {
        // AI automatically discards lowest value spices
        const excessCount = player.getExcessSpiceCount();
        const spiceTypes = ['yellow', 'red', 'green', 'brown'];
        let discarded = 0;
        
        for (const spiceType of spiceTypes) {
            while (player.spices[spiceType] > 0 && discarded < excessCount) {
                player.removeSpices(spiceType, 1);
                discarded++;
            }
            if (discarded >= excessCount) break;
        }
        
        console.log(`${player.name} discarded ${discarded} excess spices`);
    }
    
    initializeGameStats() {
        this.gameStats = {
            startTime: Date.now(),
            turnCount: 0,
            playerActions: this.game.players.map(player => ({
                name: player.name,
                cardsPlayed: 0,
                cardsAcquired: 0,
                victoryCardsClaimed: 0,
                restsUsed: 0,
                spicesGained: 0,
                spicesUpgraded: 0
            }))
        };
    }
    
    updatePlayerStats(playerIndex, action, data = {}) {
        if (!this.gameStats || !this.gameStats.playerActions[playerIndex]) return;
        
        const stats = this.gameStats.playerActions[playerIndex];
        
        switch (action) {
            case 'cardPlayed':
                stats.cardsPlayed++;
                break;
            case 'cardAcquired':
                stats.cardsAcquired++;
                break;
            case 'victoryCardClaimed':
                stats.victoryCardsClaimed++;
                break;
            case 'rest':
                stats.restsUsed++;
                break;
            case 'spicesGained':
                stats.spicesGained += data.amount || 0;
                break;
            case 'spicesUpgraded':
                stats.spicesUpgraded += data.amount || 0;
                break;
        }
    }

    renderGame() {
        // Force clear all selections when rendering
        this.clearSelection();
        
        this.renderHeader();
        this.renderVictoryCards();
        this.renderMerchantCards();
        this.renderPlayers();
        
        console.log('Game rendered for player:', this.game.getCurrentPlayer().name);
    }

    renderHeader() {
        const currentPlayer = this.game.getCurrentPlayer();
        document.getElementById('current-player').textContent = `${currentPlayer.name}'s Turn`;
        
        let turnText = `Turn ${this.game.turn}`;
        if (this.game.finalRoundTriggered) {
            turnText += ' - FINAL ROUND!';
        }
        document.getElementById('turn-counter').textContent = turnText;
    }

    renderVictoryCards() {
        const container = document.getElementById('victory-cards-row');
        container.innerHTML = '';

        this.game.victoryCards.forEach((card, index) => {
            const cardElement = this.createVictoryCardElement(card, index);
            container.appendChild(cardElement);
        });
    }

    renderMerchantCards() {
        const container = document.getElementById('merchant-cards-row');
        container.innerHTML = '';

        this.game.merchantCards.forEach((card, index) => {
            const cardElement = this.createMerchantCardElement(card, index);
            container.appendChild(cardElement);
        });
    }

    renderPlayers() {
        const container = document.getElementById('players-area');
        container.innerHTML = '';

        this.game.players.forEach((player, index) => {
            const playerElement = this.createPlayerElement(player, index);
            container.appendChild(playerElement);
        });
    }

    createVictoryCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card victory-card';
        cardDiv.dataset.index = index;
        
        // Add coin if present
        if (card.coin) {
            const coin = document.createElement('div');
            coin.className = `coin coin-${card.coin}`;
            cardDiv.appendChild(coin);
        }

        cardDiv.innerHTML += `
            <div class="card-header">
                <strong>${card.points} VP</strong>
            </div>
            <div class="card-cost">
                ${this.renderSpiceCost(card.cost)}
            </div>
            ${card.bonusSpices ? `<div class="bonus-spices">Bonus: ${this.renderSpices(card.bonusSpices)}</div>` : ''}
        `;

        cardDiv.addEventListener('click', () => {
            this.selectVictoryCard(index);
        });

        return cardDiv;
    }
    createMerchantCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card merchant-card tooltip';
        cardDiv.dataset.index = index;

        // Add bonus spices if present
        let bonusSpicesHtml = '';
        if (card.bonusSpices && card.bonusSpices.length > 0) {
            bonusSpicesHtml = `<div class="bonus-spices">${card.bonusSpices.map(spice => 
                `<div class="spice-cube spice-${spice}"></div>`
            ).join('')}</div>`;
        }

        // Add tooltip with card description
        const tooltipText = this.getCardTooltip(card);

        // Only show the card effect, no name or description
        cardDiv.innerHTML = `
            <div class="card-effect">
                ${this.renderCardEffect(card)}
            </div>
            ${bonusSpicesHtml}
            <span class="tooltiptext">${tooltipText}</span>
        `;

        cardDiv.addEventListener('click', () => {
            this.selectMerchantCard(index);
        });

        return cardDiv;
    }

    createPlayerElement(player, index) {
        const playerDiv = document.createElement('div');
        const isAI = this.aiPlayers[index] ? true : false;
        const aiClass = isAI ? ' ai-player' : '';
        const activeClass = index === this.game.currentPlayerIndex ? ' active' : '';
        
        playerDiv.className = `player-board${activeClass}${aiClass}`;

        playerDiv.innerHTML = `
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="victory-points">
                    ${player.victoryCards.length}/${this.game.victoryCardsNeeded} Victory Cards
                    ${player.victoryCards.length >= this.game.victoryCardsNeeded ? ' 🏆' : ''}
                </div>
            </div>
            
            <div class="spice-storage">
                ${this.renderSpiceStorage(player)}
            </div>
            
            <div class="player-cards">
                <div class="player-hand">
                    <h4>Hand (${player.hand.length})</h4>
                    <div class="hand-cards">
                        ${player.hand.map((card, cardIndex) => 
                            `<div class="card mini-card merchant-card" data-player="${index}" data-card="${cardIndex}">
                                <div class="card-effect">${this.renderCardEffect(card)}</div>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="player-discard">
                    <h4>Played (${player.discardPile.length})</h4>
                    <div class="discard-cards">
                        ${player.discardPile.map(card => 
                            `<div class="card mini-card merchant-card">
                                <div class="card-effect">${this.renderCardEffect(card)}</div>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            </div>
            
            ${index === this.game.currentPlayerIndex && !isAI ? this.renderActionButtons() : ''}
        `;

        // Add event listeners for hand cards for ALL players (not just current player)
        const handCards = playerDiv.querySelectorAll('.hand-cards .card');
        handCards.forEach((cardElement, cardIndex) => {
            cardElement.addEventListener('click', () => {
                // Only allow selection if this is the current player and not AI
                if (index === this.game.currentPlayerIndex && !isAI) {
                    this.selectHandCard(cardIndex);
                } else if (isAI) {
                    this.showError('Cannot control AI player');
                } else {
                    this.showError('Cannot select other player\'s cards');
                }
            });
        });

        // Add action buttons and their event listeners only for current human player
        if (index === this.game.currentPlayerIndex && !isAI) {
            // Add event listeners for action buttons
            const playCardBtn = playerDiv.querySelector('#play-card-btn');
            const acquireCardBtn = playerDiv.querySelector('#acquire-card-btn');
            const claimVictoryBtn = playerDiv.querySelector('#claim-victory-btn');
            const restBtn = playerDiv.querySelector('#rest-btn');
            const undoBtn = playerDiv.querySelector('#undo-btn');
            
            if (playCardBtn) playCardBtn.addEventListener('click', () => this.showPlayCardAction());
            if (acquireCardBtn) acquireCardBtn.addEventListener('click', () => this.showAcquireCardAction());
            if (claimVictoryBtn) claimVictoryBtn.addEventListener('click', () => this.showClaimVictoryAction());
            if (restBtn) restBtn.addEventListener('click', () => this.showRestAction());
            if (undoBtn && !undoBtn.disabled) {
                undoBtn.addEventListener('click', () => this.undoLastAction());
            }
        }

        return playerDiv;
    }

    getCardTooltip(card) {
        switch (card.type) {
            case 'gain':
                const spiceList = Object.entries(card.effect)
                    .map(([type, count]) => `${count} ${type}`)
                    .join(', ');
                return `Gain ${spiceList}`;
            case 'upgrade':
                return `Upgrade up to ${card.effect.amount} spice levels (e.g., yellow → red → green → brown)`;
            case 'trade':
                const inputList = Object.entries(card.effect.input)
                    .map(([type, count]) => `${count} ${type}`)
                    .join(', ');
                const outputList = Object.entries(card.effect.output)
                    .map(([type, count]) => `${count} ${type}`)
                    .join(', ');
                return `Trade ${inputList} for ${outputList}. You can trade multiple times if you have enough spices.`;
            case 'gain-upgrade':
                const gainList = Object.entries(card.effect.gain)
                    .map(([type, count]) => `${count} ${type}`)
                    .join(', ');
                return `Gain ${gainList}, then upgrade up to ${card.effect.upgrade} spice levels`;
            default:
                return card.description || 'Unknown card type';
        }
    }

    renderSpiceStorage(player) {
        let html = '';
        let spiceIndex = 0;
        const totalSpices = player.getTotalSpices();
        const isOverflow = totalSpices > 10;
        
        // Add overflow class if needed
        const overflowClass = isOverflow ? ' overflow' : '';
        
        // Render spices in order: yellow, red, green, brown
        for (const [spiceType, count] of Object.entries(player.spices)) {
            for (let i = 0; i < count; i++) {
                html += `<div class="spice-slot filled">
                    <div class="spice-cube spice-${spiceType}"></div>
                </div>`;
                spiceIndex++;
            }
        }
        
        // Fill remaining slots
        for (let i = spiceIndex; i < 10; i++) {
            html += `<div class="spice-slot"></div>`;
        }
        
        return `<div class="spice-storage-container${overflowClass}">${html}</div>`;
    }
    saveGameState() {
        // Create a deep copy of the current game state
        const gameState = {
            players: this.game.players.map(player => ({
                name: player.name,
                id: player.id,
                spices: { ...player.spices },
                hand: [...player.hand],
                discardPile: [...player.discardPile],
                victoryCards: [...player.victoryCards],
                coins: [...player.coins]
            })),
            currentPlayerIndex: this.game.currentPlayerIndex,
            turn: this.game.turn,
            victoryCards: [...this.game.victoryCards],
            merchantCards: [...this.game.merchantCards],
            finalRoundTriggered: this.game.finalRoundTriggered,
            finalRoundTriggerPlayer: this.game.finalRoundTriggerPlayer ? {
                name: this.game.finalRoundTriggerPlayer.name,
                id: this.game.finalRoundTriggerPlayer.id
            } : null
        };
        
        this.gameHistory.push(gameState);
        
        // Limit history size
        if (this.gameHistory.length > this.maxHistorySize) {
            this.gameHistory.shift();
        }
        
        console.log('Game state saved, history size:', this.gameHistory.length);
    }
    
    canUndo() {
        return this.gameHistory.length > 0 && !this.game.gameEnded;
    }
    
    undoLastAction() {
        if (!this.canUndo()) {
            this.showError('Cannot undo - no previous actions available');
            return;
        }
        
        const previousState = this.gameHistory.pop();
        
        // Restore game state
        this.game.currentPlayerIndex = previousState.currentPlayerIndex;
        this.game.turn = previousState.turn;
        this.game.victoryCards = [...previousState.victoryCards];
        this.game.merchantCards = [...previousState.merchantCards];
        this.game.finalRoundTriggered = previousState.finalRoundTriggered;
        this.game.finalRoundTriggerPlayer = previousState.finalRoundTriggerPlayer ? 
            this.game.players.find(p => p.id === previousState.finalRoundTriggerPlayer.id) : null;
        
        // Restore player states
        for (let i = 0; i < this.game.players.length; i++) {
            const player = this.game.players[i];
            const savedPlayer = previousState.players[i];
            
            player.spices = { ...savedPlayer.spices };
            player.hand = [...savedPlayer.hand];
            player.discardPile = [...savedPlayer.discardPile];
            player.victoryCards = [...savedPlayer.victoryCards];
            player.coins = [...savedPlayer.coins];
        }
        
        this.clearSelection();
        this.renderGame();
        this.showInfo('Action undone');
        
        console.log('Game state restored, history size:', this.gameHistory.length);
    }

    renderActionButtons() {
        const undoDisabled = !this.canUndo() ? 'disabled' : '';
        return `
            <div class="action-buttons">
                <button class="action-btn" id="play-card-btn" data-shortcut="1" title="Play Card (Press 1)">Play Card</button>
                <button class="action-btn" id="acquire-card-btn" data-shortcut="2" title="Acquire Card (Press 2)">Acquire Card</button>
                <button class="action-btn" id="claim-victory-btn" data-shortcut="3" title="Claim Victory (Press 3)">Claim Victory</button>
                <button class="action-btn" id="rest-btn" data-shortcut="4" title="Rest (Press 4)">Rest</button>
                <button class="action-btn secondary ${undoDisabled}" id="undo-btn" ${undoDisabled} title="Undo (Ctrl+U)">Undo</button>
            </div>
        `;
    }

    renderCardEffect(card) {
        switch (card.type) {
            case 'gain':
                return this.renderSpices(card.effect);
            case 'upgrade':
                return `<div class="upgrade-effect">↑${card.effect.amount}</div>`;
            case 'trade':
                return `<div class="trade-effect">
                    <div class="trade-input">${this.renderSpices(card.effect.input)}</div>
                    <div class="trade-arrow">↓</div>
                    <div class="trade-output">${this.renderSpices(card.effect.output)}</div>
                </div>`;
            case 'gain-upgrade':
                return `<div class="combo-effect">
                    ${this.renderSpices(card.effect.gain)}
                    <div class="upgrade-effect">↑${card.effect.upgrade}</div>
                </div>`;
            default:
                return '';
        }
    }

    renderSpices(spices) {
        return Object.entries(spices)
            .map(([type, count]) => {
                // Create multiple cubes instead of showing count + 1 cube
                let cubes = '';
                for (let i = 0; i < count; i++) {
                    cubes += `<div class="spice-cube spice-${type}"></div>`;
                }
                return `<div class="spice-group">${cubes}</div>`;
            })
            .join('');
    }

    renderSpiceCost(cost) {
        return Object.entries(cost)
            .map(([type, count]) => {
                // Create multiple cubes instead of showing count + 1 cube
                let cubes = '';
                for (let i = 0; i < count; i++) {
                    cubes += `<div class="spice-cube spice-${type}"></div>`;
                }
                return `<div class="spice-group">${cubes}</div>`;
            })
            .join('');
    }

    // Action handlers
    showPlayCardAction() {
        const currentPlayer = this.game.getCurrentPlayer();
        if (currentPlayer.hand.length === 0) {
            this.showError('No cards in hand to play!');
            return;
        }
        
        if (this.selectedCardType !== 'hand' || this.selectedCard === null) {
            this.showError('Please select a card from your hand first!');
            return;
        }
        
        // Verify the selected card belongs to current player
        if (this.selectedCard >= currentPlayer.hand.length) {
            this.showError('Invalid card selection!');
            this.clearSelection();
            return;
        }

        const card = currentPlayer.hand[this.selectedCard];
        
        // Check if player can play this card
        if (!this.game.canPlayCard(currentPlayer, card)) {
            this.showError('Cannot play this card - insufficient resources');
            return;
        }

        // Store the card info for later execution
        this.pendingCardPlay = {
            player: currentPlayer,
            cardIndex: this.selectedCard,
            card: card
        };

        // Handle different card types
        if (card.type === 'upgrade') {
            // Show upgrade options - card not played yet
            this.showUpgradeOptions(currentPlayer, card.effect.amount);
        } else if (card.type === 'trade') {
            // Show trade options - card not played yet
            this.showTradeOptions(currentPlayer, card.effect.input, card.effect.output);
        } else if (card.type === 'gain-upgrade') {
            // First gain spices, then show upgrade options
            for (const [spiceType, amount] of Object.entries(card.effect.gain)) {
                currentPlayer.addSpices(spiceType, amount);
            }
            this.showUpgradeOptions(currentPlayer, card.effect.upgrade);
        } else {
            // Simple cards (gain) - execute immediately
            this.executeCardPlay();
        }
    }

    showAcquireCardAction() {
        if (this.game.merchantCards.length === 0) {
            this.showError('No merchant cards available!');
            return;
        }
        
        if (this.selectedCardType !== 'merchant' || this.selectedCard === null) {
            this.showError('Please select a merchant card from the market first!');
            return;
        }
        
        // Save game state before action
        this.saveGameState();
        
        // Check if player is buying a non-first card and show warning
        if (this.selectedCard > 0) {
            this.showMerchantCardWarning(this.selectedCard);
            return;
        }
        
        // Execute the action immediately for first card
        this.executeMerchantCardPurchase();
    }
    
    showMerchantCardWarning(cardIndex) {
        const modal = document.getElementById('action-modal');
        const title = document.getElementById('action-title');
        const content = document.getElementById('action-content');
        
        const cost = cardIndex; // Cost is 1 yellow per skipped card
        title.textContent = 'Confirm Merchant Card Purchase';
        
        let html = '<div class="merchant-warning-container">';
        html += `<p>This will cost ${cost} yellow spice${cost > 1 ? 's' : ''} and place yellow cubes on the skipped cards.</p>`;
        html += '<p>Do you want to continue?</p>';
        html += '</div>';
        
        content.innerHTML = html;
        
        // Store the card index for later
        this.pendingMerchantCardIndex = cardIndex;
        
        modal.classList.remove('hidden');
    }
    
    executeMerchantCardPurchase() {
        const modal = document.getElementById('action-modal');
        modal.classList.add('hidden'); // Close the modal first
        
        const currentPlayer = this.game.getCurrentPlayer();
        const cardIndex = this.pendingMerchantCardIndex || this.selectedCard;
        
        const result = this.game.acquireMerchantCard(currentPlayer, cardIndex);
        if (result.success) {
            console.log(result.message);
            this.clearSelection();
            this.pendingMerchantCardIndex = null;
            
            if (this.game.gameEnded) {
                this.showGameEnd();
            } else {
                this.nextTurn();
            }
        } else {
            this.showError(result.message);
        }
    }

    showClaimVictoryAction() {
        if (this.game.victoryCards.length === 0) {
            this.showError('No victory cards available!');
            return;
        }
        
        if (this.selectedCardType !== 'victory' || this.selectedCard === null) {
            this.showError('Please select a victory card first!');
            return;
        }
        
        // Save game state before action
        this.saveGameState();
        
        // Execute the action immediately
        const currentPlayer = this.game.getCurrentPlayer();
        const result = this.game.claimVictoryCard(currentPlayer, this.selectedCard);
        if (result.success) {
            // No alert for successful claim - just continue
            console.log(result.message);
            this.clearSelection();
            
            // Check if player needs to discard spices
            if (result.needsDiscard) {
                this.showSpiceDiscardModal(currentPlayer, 'victory');
                return; // Don't continue turn yet
            }
            
            // Check if final round was just triggered
            if (this.game.finalRoundTriggered && !this.finalRoundMessageShown) {
                this.showInfo(`${this.game.finalRoundTriggerPlayer.name} has triggered the final round! Each remaining player gets one more turn.`);
                this.finalRoundMessageShown = true;
            }
            
            if (this.game.gameEnded) {
                this.showGameEnd();
            } else {
                this.nextTurn();
            }
        } else {
            this.showError(result.message);
        }
    }

    showRestAction() {
        const currentPlayer = this.game.getCurrentPlayer();
        if (currentPlayer.discardPile.length === 0) {
            this.showError('No cards to recover!');
            return;
        }
        
        // Save game state before action
        this.saveGameState();
        
        const result = this.game.rest(currentPlayer);
        if (result.success) {
            // No alert for successful rest - just continue
            console.log(result.message);
            this.clearSelection();
            this.nextTurn();
        }
    }

    selectHandCard(cardIndex) {
        // Only allow selection for current player
        const currentPlayer = this.game.getCurrentPlayer();
        
        this.selectedCard = cardIndex;
        this.selectedCardType = 'hand';
        
        // Clear other selections
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Highlight selected card (only current player's cards)
        const currentPlayerBoard = document.querySelector('.player-board.active');
        if (currentPlayerBoard) {
            const cardElement = currentPlayerBoard.querySelector(`[data-card="${cardIndex}"]`);
            if (cardElement) {
                cardElement.classList.add('selected');
            }
        }
        
        console.log('Selected hand card:', cardIndex, 'for', currentPlayer.name);
    }

    selectMerchantCard(cardIndex) {
        // Allow selection regardless of current action
        this.selectedCard = cardIndex;
        this.selectedCardType = 'merchant';
        
        // Clear other selections
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Highlight selected card
        const cardElement = document.querySelector(`#merchant-cards-row .card[data-index="${cardIndex}"]`);
        if (cardElement) {
            cardElement.classList.add('selected');
        }
        
        console.log('Selected merchant card:', cardIndex);
    }

    selectVictoryCard(cardIndex) {
        // Allow selection regardless of current action
        this.selectedCard = cardIndex;
        this.selectedCardType = 'victory';
        
        // Clear other selections
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Highlight selected card
        const cardElement = document.querySelector(`#victory-cards-row .card[data-index="${cardIndex}"]`);
        if (cardElement) {
            cardElement.classList.add('selected');
        }
        
        console.log('Selected victory card:', cardIndex);
    }

    showUpgradeModal(player, options, upgradeAmount) {
        const modal = document.getElementById('action-modal');
        const title = document.getElementById('action-title');
        const content = document.getElementById('action-content');
        
        title.textContent = `Choose Upgrades (${upgradeAmount} levels available)`;
        
        let html = '<div class="upgrade-options-container">';
        html += '<p>Click on upgrade options to select them. You can select multiple options:</p>';
        html += '<div class="upgrade-options-grid">';
        
        // Generate individual upgrade options (not combinations)
        const individualOptions = this.generateIndividualUpgradeOptions(player, upgradeAmount);
        
        individualOptions.forEach((option, index) => {
            html += `<div class="upgrade-option selectable-option" data-option-index="${index}" onclick="gameUI.toggleUpgradeOption(${index})">`;
            html += '<div class="upgrade-visual">';
            html += this.renderUpgradeOptionVisual(option);
            html += '</div>';
            html += '</div>';
        });
        
        html += '</div>';
        html += '<div class="upgrade-summary">';
        html += '<div class="levels-used">Levels used: <span id="levels-used">0</span>/' + upgradeAmount + '</div>';
        html += '<div class="selected-upgrades">Selected: <span id="selected-upgrades">None</span></div>';
        html += '</div>';
        html += '</div>';
        
        content.innerHTML = html;
        
        // Store upgrade info
        this.currentUpgradePlayer = player;
        this.availableUpgradeLevels = upgradeAmount;
        this.individualUpgradeOptions = individualOptions;
        this.selectedUpgradeOptions = [];
        
        modal.classList.remove('hidden');
    }
    
    generateIndividualUpgradeOptions(player, upgradeAmount) {
        const options = [];
        const spiceTypes = ['yellow', 'red', 'green', 'brown'];
        
        // Generate all possible individual upgrades
        for (let fromIndex = 0; fromIndex < spiceTypes.length - 1; fromIndex++) {
            const fromType = spiceTypes[fromIndex];
            const available = player.spices[fromType];
            
            if (available > 0) {
                // Single level upgrades
                const toType = spiceTypes[fromIndex + 1];
                for (let count = 1; count <= Math.min(available, upgradeAmount); count++) {
                    options.push({
                        from: fromType,
                        to: toType,
                        count: count,
                        levels: 1,
                        totalLevels: count * 1
                    });
                }
                
                // Multi-level upgrades (if possible)
                if (upgradeAmount >= 2 && fromIndex < spiceTypes.length - 2) {
                    const toType2 = spiceTypes[fromIndex + 2];
                    const maxCount = Math.floor(upgradeAmount / 2);
                    for (let count = 1; count <= Math.min(available, maxCount); count++) {
                        options.push({
                            from: fromType,
                            to: toType2,
                            count: count,
                            levels: 2,
                            totalLevels: count * 2
                        });
                    }
                }
                
                // Three-level upgrades (yellow to brown)
                if (upgradeAmount >= 3 && fromType === 'yellow') {
                    const maxCount = Math.floor(upgradeAmount / 3);
                    for (let count = 1; count <= Math.min(available, maxCount); count++) {
                        options.push({
                            from: 'yellow',
                            to: 'brown',
                            count: count,
                            levels: 3,
                            totalLevels: count * 3
                        });
                    }
                }
            }
        }
        
        return options;
    }
    
    renderUpgradeOptionVisual(option) {
        let html = '<div class="upgrade-option-visual">';
        
        // Show input spices
        html += '<div class="upgrade-input">';
        for (let i = 0; i < option.count; i++) {
            html += `<div class="spice-cube spice-${option.from}"></div>`;
        }
        html += '</div>';
        
        // Show arrow
        html += '<div class="upgrade-arrow">→</div>';
        
        // Show output spices
        html += '<div class="upgrade-output">';
        for (let i = 0; i < option.count; i++) {
            html += `<div class="spice-cube spice-${option.to}"></div>`;
        }
        html += '</div>';
        
        // Show level cost
        html += `<div class="upgrade-cost">(${option.totalLevels} level${option.totalLevels > 1 ? 's' : ''})</div>`;
        
        html += '</div>';
        return html;
    }
    
    toggleUpgradeOption(optionIndex) {
        const option = this.individualUpgradeOptions[optionIndex];
        const optionElement = document.querySelector(`[data-option-index="${optionIndex}"]`);
        
        if (this.selectedUpgradeOptions.includes(optionIndex)) {
            // Deselect
            this.selectedUpgradeOptions = this.selectedUpgradeOptions.filter(i => i !== optionIndex);
            optionElement.classList.remove('selected');
        } else {
            // Check if we have enough levels remaining
            const currentLevelsUsed = this.selectedUpgradeOptions.reduce((sum, i) => {
                return sum + this.individualUpgradeOptions[i].totalLevels;
            }, 0);
            
            if (currentLevelsUsed + option.totalLevels <= this.availableUpgradeLevels) {
                // Check if this conflicts with already selected options (same spice type)
                const spicesNeeded = { yellow: 0, red: 0, green: 0, brown: 0 };
                
                // Count spices needed for all selected options plus this one
                for (const i of this.selectedUpgradeOptions) {
                    const selectedOption = this.individualUpgradeOptions[i];
                    spicesNeeded[selectedOption.from] += selectedOption.count;
                }
                spicesNeeded[option.from] += option.count;
                
                // Check if we have enough spices
                const hasEnoughSpices = Object.entries(spicesNeeded).every(([spiceType, needed]) => {
                    return this.currentUpgradePlayer.spices[spiceType] >= needed;
                });
                
                if (hasEnoughSpices) {
                    // Select
                    this.selectedUpgradeOptions.push(optionIndex);
                    optionElement.classList.add('selected');
                } else {
                    this.showError('Not enough spices available for this combination');
                }
            } else {
                this.showError('Not enough upgrade levels remaining');
            }
        }
        
        this.updateUpgradeSummary();
    }
    
    updateUpgradeSummary() {
        const levelsUsed = this.selectedUpgradeOptions.reduce((sum, i) => {
            return sum + this.individualUpgradeOptions[i].totalLevels;
        }, 0);
        
        document.getElementById('levels-used').textContent = levelsUsed;
        
        if (this.selectedUpgradeOptions.length === 0) {
            document.getElementById('selected-upgrades').textContent = 'None';
        } else {
            const descriptions = this.selectedUpgradeOptions.map(i => {
                const option = this.individualUpgradeOptions[i];
                return `${option.count} ${option.from} → ${option.count} ${option.to}`;
            });
            document.getElementById('selected-upgrades').textContent = descriptions.join(', ');
        }
        
        // Enable/disable confirm button
        const confirmBtn = document.getElementById('confirm-action');
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedUpgradeOptions.length === 0;
        }
    }

    
    showUpgradeOptions(player, upgradeAmount) {
        // Generate all possible individual upgrade options
        const options = this.generateIndividualUpgradeOptions(player, upgradeAmount);
        
        if (options.length === 0) {
            this.showError('No spices available to upgrade!');
            // If no upgrades possible, complete the card play anyway
            this.completeCardPlay();
            return;
        }
        
        // Show upgrade selection modal
        this.showUpgradeModal(player, options, upgradeAmount);
    }
    
    generateUpgradeOptions(player, upgradeAmount) {
        // This method is now replaced by generateIndividualUpgradeOptions
        // Keeping for backward compatibility if needed
        return [];
    }

    showTradeOptions(player, inputRatio, outputRatio) {
        // Calculate maximum possible trades
        const maxTrades = this.calculateMaxTrades(player, inputRatio);
        
        if (maxTrades === 0) {
            this.showError('You don\'t have enough spices for this trade!');
            return;
        }
        
        // Show trade selection modal
        this.showTradeModal(player, inputRatio, outputRatio, maxTrades);
    }
    
    calculateMaxTrades(player, inputRatio) {
        let maxTrades = Infinity;
        
        // Check each input spice requirement
        for (const [spiceType, amount] of Object.entries(inputRatio)) {
            const available = player.spices[spiceType];
            const possibleTrades = Math.floor(available / amount);
            maxTrades = Math.min(maxTrades, possibleTrades);
        }
        
        return maxTrades === Infinity ? 0 : maxTrades;
    }
    
    showTradeModal(player, inputRatio, outputRatio, maxTrades) {
        const modal = document.getElementById('action-modal');
        const title = document.getElementById('action-title');
        const content = document.getElementById('action-content');
        
        title.textContent = 'Choose Trade Amount';
        
        let html = '<div class="trade-options-container">';
        html += '<p>Click on trade options to select one:</p>';
        html += '<div class="trade-options-grid">';
        
        // Add trade options (1x, 2x, 3x, etc.)
        for (let multiplier = 1; multiplier <= maxTrades; multiplier++) {
            html += `<div class="trade-option selectable-option" data-multiplier="${multiplier}" onclick="gameUI.selectTradeOption(${multiplier})">`;
            html += '<div class="trade-description">';
            html += `<div class="trade-input-display">${this.formatTradeSpices(inputRatio, multiplier)}</div>`;
            html += `<div class="trade-arrow-display">↓</div>`;
            html += `<div class="trade-output-display">${this.formatTradeSpices(outputRatio, multiplier)}</div>`;
            html += '</div>';
            html += `<div class="trade-multiplier">×${multiplier}</div>`;
            html += '</div>';
        }
        
        html += '</div>';
        html += '<div class="trade-summary">Selected: <span id="selected-trade">None</span></div>';
        html += '</div>';
        
        content.innerHTML = html;
        
        // Store trade info for later use
        this.currentTradeInput = inputRatio;
        this.currentTradeOutput = outputRatio;
        this.currentTradePlayer = player;
        this.selectedTradeMultiplier = null;
        
        modal.classList.remove('hidden');
    }
    
    selectTradeOption(multiplier) {
        // Deselect all options
        document.querySelectorAll('.trade-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select the clicked option
        const optionElement = document.querySelector(`[data-multiplier="${multiplier}"]`);
        optionElement.classList.add('selected');
        
        this.selectedTradeMultiplier = multiplier;
        
        // Update summary
        const inputDesc = this.formatTradeSpicesText(this.currentTradeInput, multiplier);
        const outputDesc = this.formatTradeSpicesText(this.currentTradeOutput, multiplier);
        document.getElementById('selected-trade').textContent = `${inputDesc} → ${outputDesc}`;
        
        // Enable confirm button
        const confirmBtn = document.getElementById('confirm-action');
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }
    
    formatTradeSpicesText(spiceRatio, multiplier) {
        return Object.entries(spiceRatio)
            .map(([type, amount]) => `${amount * multiplier} ${type}`)
            .join(', ');
    }
    
    formatTradeSpices(spiceRatio, multiplier) {
        return Object.entries(spiceRatio)
            .map(([type, amount]) => {
                const totalAmount = amount * multiplier;
                // Create multiple cubes instead of showing count + 1 cube
                let cubes = '';
                for (let i = 0; i < totalAmount; i++) {
                    cubes += `<div class="spice-cube spice-${type}"></div>`;
                }
                return `<div class="spice-group">${cubes}</div>`;
            })
            .join('');
    }
    
    executeSelectedTrade() {
        if (!this.selectedTradeMultiplier) {
            this.showError('Please select a trade option');
            return;
        }
        
        const modal = document.getElementById('action-modal');
        modal.classList.add('hidden');
        
        // Execute the trade
        const player = this.currentTradePlayer;
        const multiplier = this.selectedTradeMultiplier;
        
        // Remove input spices
        for (const [spiceType, amount] of Object.entries(this.currentTradeInput)) {
            player.removeSpices(spiceType, amount * multiplier);
        }
        
        // Add output spices
        for (const [spiceType, amount] of Object.entries(this.currentTradeOutput)) {
            player.addSpices(spiceType, amount * multiplier);
        }
        
        console.log(`Trade executed: ${multiplier}x multiplier`);
        
        // Clean up trade data
        this.currentTradeInput = null;
        this.currentTradeOutput = null;
        this.currentTradePlayer = null;
        this.selectedTradeMultiplier = null;
        
        // Check if player needs to discard spices due to overflow
        if (player.needsToDiscardSpices()) {
            this.showSpiceDiscardModal(player);
            return; // Don't complete card play yet - wait for discard choice
        }
        
        // Complete the card play (move card to discard pile)
        this.completeCardPlay();
    }

    executeSelectedUpgrades() {
        if (this.selectedUpgradeOptions.length === 0) {
            this.showError('Please select at least one upgrade option');
            return;
        }
        
        const modal = document.getElementById('action-modal');
        modal.classList.add('hidden');
        
        const player = this.currentUpgradePlayer;
        
        // Execute all selected upgrades
        for (const optionIndex of this.selectedUpgradeOptions) {
            const option = this.individualUpgradeOptions[optionIndex];
            
            // Remove input spices and add output spices
            player.removeSpices(option.from, option.count);
            player.addSpices(option.to, option.count);
            
            console.log(`Upgrade executed: ${option.count} ${option.from} → ${option.count} ${option.to}`);
        }
        
        // Clean up upgrade data
        this.currentUpgradePlayer = null;
        this.availableUpgradeLevels = 0;
        this.individualUpgradeOptions = [];
        this.selectedUpgradeOptions = [];
        
        // Check if player needs to discard spices due to overflow (shouldn't happen with upgrades, but just in case)
        if (player.needsToDiscardSpices()) {
            this.showSpiceDiscardModal(player);
            return; // Don't complete card play yet - wait for discard choice
        }
        
        // Complete the card play (move card to discard pile)
        this.completeCardPlay();
    }

    showSpiceDiscardModal(player, actionType = 'card') {
        const modal = document.getElementById('action-modal');
        const title = document.getElementById('action-title');
        const content = document.getElementById('action-content');
        
        const excessCount = player.getExcessSpiceCount();
        title.textContent = `Discard ${excessCount} Spice${excessCount > 1 ? 's' : ''} (${player.getTotalSpices()}/10)`;
        
        let html = '<div class="spice-discard-container">';
        html += '<p>You have too many spices! Click on spices to discard them:</p>';
        html += '<div class="spice-selection-area">';
        
        // Show all spices the player currently has
        const spiceTypes = ['yellow', 'red', 'green', 'brown'];
        for (const spiceType of spiceTypes) {
            const count = player.spices[spiceType];
            if (count > 0) {
                html += `<div class="spice-type-group">`;
                html += `<h4>${spiceType.charAt(0).toUpperCase() + spiceType.slice(1)} (${count})</h4>`;
                html += `<div class="spice-cubes-row">`;
                
                for (let i = 0; i < count; i++) {
                    html += `<div class="spice-cube spice-${spiceType} selectable-cube" 
                                  data-spice="${spiceType}" data-index="${i}"
                                  onclick="gameUI.toggleSpiceSelection(this)">
                             </div>`;
                }
                
                html += `</div></div>`;
            }
        }
        
        html += '</div>';
        html += `<div class="discard-info">Selected for discard: <span id="discard-count">0</span>/${excessCount}</div>`;
        html += '</div>';
        
        content.innerHTML = html;
        
        // Store discard info
        this.discardingPlayer = player;
        this.requiredDiscardCount = excessCount;
        this.selectedForDiscard = [];
        this.discardActionType = actionType; // 'card' or 'victory'
        
        modal.classList.remove('hidden');
    }
    
    toggleSpiceSelection(cubeElement) {
        const spiceType = cubeElement.dataset.spice;
        const index = parseInt(cubeElement.dataset.index);
        const cubeId = `${spiceType}-${index}`;
        
        if (cubeElement.classList.contains('selected-for-discard')) {
            // Deselect
            cubeElement.classList.remove('selected-for-discard');
            this.selectedForDiscard = this.selectedForDiscard.filter(id => id !== cubeId);
        } else {
            // Select (if we haven't reached the limit)
            if (this.selectedForDiscard.length < this.requiredDiscardCount) {
                cubeElement.classList.add('selected-for-discard');
                this.selectedForDiscard.push(cubeId);
            }
        }
        
        // Update discard count display
        document.getElementById('discard-count').textContent = this.selectedForDiscard.length;
        
        // Enable confirm button if we have the right number selected
        const confirmBtn = document.getElementById('confirm-action');
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedForDiscard.length !== this.requiredDiscardCount;
        }
    }
    
    executeSpiceDiscard() {
        if (this.selectedForDiscard.length !== this.requiredDiscardCount) {
            this.showError(`Please select exactly ${this.requiredDiscardCount} spice${this.requiredDiscardCount > 1 ? 's' : ''} to discard`);
            return;
        }
        
        // Count how many of each type to discard
        const discardCounts = { yellow: 0, red: 0, green: 0, brown: 0 };
        for (const cubeId of this.selectedForDiscard) {
            const spiceType = cubeId.split('-')[0];
            discardCounts[spiceType]++;
        }
        
        // Remove the selected spices
        for (const [spiceType, count] of Object.entries(discardCounts)) {
            this.discardingPlayer.removeSpices(spiceType, count);
        }
        
        console.log('Discarded spices:', discardCounts);
        
        // Hide modal
        const modal = document.getElementById('action-modal');
        modal.classList.add('hidden');
        
        // Clean up
        this.discardingPlayer = null;
        this.requiredDiscardCount = 0;
        this.selectedForDiscard = [];
        const actionType = this.discardActionType;
        this.discardActionType = null;
        
        // Complete the appropriate action
        if (actionType === 'victory') {
            // For victory cards, check if final round was triggered and show message
            if (this.game.finalRoundTriggered && !this.finalRoundMessageShown) {
                this.showInfo(`${this.game.finalRoundTriggerPlayer.name} has triggered the final round! Each remaining player gets one more turn.`);
                this.finalRoundMessageShown = true;
            }
            
            // For victory cards, just continue the turn
            if (this.game.gameEnded) {
                this.showGameEnd();
            } else {
                this.nextTurn();
            }
        } else {
            // For card play, complete the card play
            this.completeCardPlay();
        }
    }
    
    completeCardPlay() {
        if (!this.pendingCardPlay) {
            console.error('No pending card play to complete');
            return;
        }

        const { player, cardIndex, card } = this.pendingCardPlay;
        
        // Move card from hand to discard pile
        player.discardPile.push(player.hand.splice(cardIndex, 1)[0]);
        
        // Clear pending action
        this.pendingCardPlay = null;
        
        console.log('Card play completed:', card.name);
        // No alert for successful card play - just continue
        
        this.clearSelection();
        
        if (this.game.gameEnded) {
            this.showGameEnd();
        } else {
            this.nextTurn();
        }
    }

    clearSelection() {
        this.selectedCard = null;
        this.selectedCardType = null;
        
        // Remove selection from ALL cards
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });
        
        console.log('All selections cleared');
    }

    nextTurn() {
        console.log('=== TURN CHANGE ===');
        console.log('Previous player:', this.game.getCurrentPlayer().name);
        
        this.clearSelection();
        this.game.nextTurn();
        
        // Check if game ended as a result of the turn change
        if (this.game.gameEnded) {
            console.log('Game ended during turn change');
            this.showGameEnd();
            return;
        }
        
        console.log('New current player:', this.game.getCurrentPlayer().name);
        console.log('===================');
        
        // Store turn start state for potential cancellation
        this.storeTurnStartState();
        
        this.renderGame();
        
        // Check if it's an AI turn
        this.checkForAITurn();
    }
    
    storeTurnStartState() {
        const currentPlayer = this.game.getCurrentPlayer();
        this.turnStartState = {
            spices: { ...currentPlayer.spices },
            handSize: currentPlayer.hand.length,
            discardSize: currentPlayer.discardPile.length
        };
    }
    
    revertToTurnStart() {
        if (this.turnStartState) {
            const currentPlayer = this.game.getCurrentPlayer();
            currentPlayer.spices = { ...this.turnStartState.spices };
            console.log('Player state reverted to turn start');
        }
    }

    showGameEnd() {
        const winner = this.game.winner;
        const finalScores = this.game.players.map(player => {
            const score = this.game.calculateFinalScore(player);
            const breakdown = this.calculateScoreBreakdown(player);
            return {
                name: player.name,
                score: score,
                breakdown: breakdown
            };
        }).sort((a, b) => b.score - a.score);

        // Show game end modal instead of message
        this.showGameEndModal(winner, finalScores);
        
        // Also log to console for reference
        console.log('Game ended - winner:', winner.name);
    }
    
    showGameEndModal(winner, finalScores) {
        const modal = document.getElementById('action-modal');
        const title = document.getElementById('action-title');
        const content = document.getElementById('action-content');
        
        title.textContent = '🎉 GAME OVER! 🎉';
        
        let html = '<div class="game-end-container">';
        html += `<div class="winner-announcement">${winner.name} WINS!</div>`;
        html += '<div class="final-scores">';
        html += '<h3>📊 FINAL SCORES</h3>';
        html += '<div class="scores-table">';
        
        finalScores.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
            html += `<div class="score-row ${index === 0 ? 'winner-row' : ''}">`;
            html += `<div class="player-rank">${medal} ${index + 1}.</div>`;
            html += `<div class="player-name">${player.name}</div>`;
            html += `<div class="player-total">${player.score} pts</div>`;
            html += '</div>';
            
            // Score breakdown
            html += '<div class="score-breakdown">';
            html += `<div class="breakdown-item">Victory Cards: ${player.breakdown.victoryPoints} pts</div>`;
            if (player.breakdown.goldCoins > 0) {
                html += `<div class="breakdown-item">Gold Coins: ${player.breakdown.goldCoins} × 5 = ${player.breakdown.goldPoints} pts</div>`;
            }
            if (player.breakdown.silverCoins > 0) {
                html += `<div class="breakdown-item">Silver Coins: ${player.breakdown.silverCoins} × 3 = ${player.breakdown.silverPoints} pts</div>`;
            }
            if (player.breakdown.spicePoints > 0) {
                html += `<div class="breakdown-item">Spices (R/G/B): ${player.breakdown.spicePoints} pts</div>`;
            }
            html += '</div>';
        });
        
        html += '</div></div>';
        html += '<div class="game-end-buttons">';
        html += '<button id="play-again-btn" class="game-end-btn primary">Play Again</button>';
        html += '<button id="close-game-btn" class="game-end-btn secondary">Close</button>';
        html += '</div>';
        html += '</div>';
        
        content.innerHTML = html;
        
        // Add event listeners for the buttons
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.playAgain();
        });
        
        document.getElementById('close-game-btn').addEventListener('click', () => {
            this.closeGame();
        });
        
        // Hide the default modal buttons
        document.getElementById('confirm-action').style.display = 'none';
        document.getElementById('cancel-action').style.display = 'none';
        
        modal.classList.remove('hidden');
    }
    
    playAgain() {
        // Reset the game and show setup modal
        location.reload(); // Simple way to reset everything
    }
    
    closeGame() {
        // Close the browser tab/window
        window.close();
        
        // If window.close() doesn't work (some browsers block it), show a message
        setTimeout(() => {
            alert('Please close this tab manually.');
        }, 100);
    }
    
    calculateScoreBreakdown(player) {
        let victoryPoints = 0;
        for (const card of player.victoryCards) {
            victoryPoints += card.points;
        }
        
        let goldCoins = 0;
        let silverCoins = 0;
        for (const coin of player.coins) {
            if (coin === 'gold') goldCoins++;
            else if (coin === 'silver') silverCoins++;
        }
        
        const spicePoints = player.spices.red + player.spices.green + player.spices.brown;
        
        return {
            victoryPoints,
            goldCoins,
            silverCoins,
            goldPoints: goldCoins * 5,
            silverPoints: silverCoins * 3,
            spicePoints
        };
    }

    executeCardPlay() {
        if (!this.pendingCardPlay) {
            console.error('No pending card play to execute');
            return;
        }

        const { player, cardIndex, card } = this.pendingCardPlay;
        
        // Execute simple card effects (gain cards)
        if (card.type === 'gain') {
            for (const [spiceType, amount] of Object.entries(card.effect)) {
                player.addSpices(spiceType, amount);
            }
        }
        
        // Check if player needs to discard spices due to overflow
        if (player.needsToDiscardSpices()) {
            this.showSpiceDiscardModal(player);
            return; // Don't complete card play yet - wait for discard choice
        }
        
        // Move card from hand to discard pile
        player.discardPile.push(player.hand.splice(cardIndex, 1)[0]);
        
        // Clear pending action
        this.pendingCardPlay = null;
        
        console.log('Card played successfully:', card.name);
        // No alert for successful card play - just continue
        
        this.clearSelection();
        
        if (this.game.gameEnded) {
            this.showGameEnd();
        } else {
            this.nextTurn();
        }
    }

    confirmAction() {
        // Check if we're in spice discard mode
        if (this.discardingPlayer && this.requiredDiscardCount > 0) {
            this.executeSpiceDiscard();
        }
        // Check if we're in upgrade selection mode
        else if (this.currentUpgradePlayer && this.selectedUpgradeOptions) {
            this.executeSelectedUpgrades();
        }
        // Check if we're in trade selection mode
        else if (this.currentTradePlayer && this.selectedTradeMultiplier) {
            this.executeSelectedTrade();
        }
        // Check if we're confirming merchant card purchase
        else if (this.pendingMerchantCardIndex !== null && this.pendingMerchantCardIndex !== undefined) {
            this.executeMerchantCardPurchase();
        }
    }

    cancelAction() {
        const modal = document.getElementById('action-modal');
        modal.classList.add('hidden');
        
        // If we're in spice discard mode, revert the spices
        if (this.discardingPlayer && this.requiredDiscardCount > 0) {
            // Revert spices to before the card was played
            if (this.pendingCardPlay) {
                const card = this.pendingCardPlay.card;
                const player = this.pendingCardPlay.player;
                
                // Undo the spice changes based on card type
                if (card.type === 'gain') {
                    for (const [spiceType, amount] of Object.entries(card.effect)) {
                        player.removeSpices(spiceType, amount);
                    }
                } else if (card.type === 'gain-upgrade') {
                    for (const [spiceType, amount] of Object.entries(card.effect.gain)) {
                        player.removeSpices(spiceType, amount);
                    }
                }
            }
            
            // Clean up discard state
            this.discardingPlayer = null;
            this.requiredDiscardCount = 0;
            this.selectedForDiscard = [];
            this.discardActionType = null;
            
            console.log('Spice discard cancelled - spices reverted');
        }
        
        // If there was a pending card play, cancel it
        if (this.pendingCardPlay) {
            console.log('Card play cancelled - card remains in hand');
            this.pendingCardPlay = null;
        }
        
        // Clean up any stored action data
        this.currentUpgradeOptions = null;
        this.currentUpgradePlayer = null;
        this.availableUpgradeLevels = 0;
        this.individualUpgradeOptions = [];
        this.selectedUpgradeOptions = [];
        this.currentTradeInput = null;
        this.currentTradeOutput = null;
        this.currentTradePlayer = null;
        this.selectedTradeMultiplier = null;
        this.pendingMerchantCardIndex = null;
        
        console.log('Action cancelled - turn continues');
        
        // Continue with turn (no changes made, card not played)
        this.renderGame();
    }
}