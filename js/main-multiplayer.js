// Century: Spice Road - Multiplayer Main Application

let game;
let gameUI;
let multiplayerGame = false;

// Initialize the multiplayer game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Multiplayer Century: Spice Road initialized');
    
    // Start with lobby screen
    showScreen('lobby-screen');
    
    // Set default player name
    const playerNameInput = document.getElementById('player-name');
    if (playerNameInput) {
        playerNameInput.value = 'Player' + Math.floor(Math.random() * 1000);
    }
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// Extend the Game class for multiplayer support
class MultiplayerGame extends Game {
    constructor() {
        super();
        this.networkPlayers = [];
        this.myPlayerId = null;
        this.isNetworkGame = false;
    }
    
    setupNetworkGame(players, aiCount, aiDifficulty) {
        this.networkPlayers = players;
        this.isNetworkGame = true;
        
        // Setup game with network players
        const totalPlayers = players.filter(p => !p.isAI).length + aiCount;
        this.setupGame(totalPlayers);
        
        // Map network players to game players
        let playerIndex = 0;
        players.forEach(networkPlayer => {
            if (playerIndex < this.players.length) {
                this.players[playerIndex].name = networkPlayer.name;
                this.players[playerIndex].networkId = networkPlayer.id;
                this.players[playerIndex].isAI = networkPlayer.isAI;
                
                if (networkPlayer.name === (window.multiplayerManager ? window.multiplayerManager.playerName : '')) {
                    this.myPlayerId = networkPlayer.id;
                }
                
                playerIndex++;
            }
        });
        
        console.log('Network game setup complete');
    }
    
    updateFromNetwork(gameState) {
        // Update game state from network
        this.currentPlayerIndex = gameState.currentPlayerIndex;
        this.turn = gameState.turn;
        this.victoryCards = gameState.victoryCards;
        this.merchantCards = gameState.merchantCards;
        this.finalRoundTriggered = gameState.finalRoundTriggered;
        this.finalRoundTriggerPlayer = gameState.finalRoundTriggerPlayer;
        
        // Update players
        gameState.players.forEach((networkPlayer, index) => {
            if (this.players[index]) {
                Object.assign(this.players[index], networkPlayer);
            }
        });
    }
    
    getNetworkState() {
        return {
            currentPlayerIndex: this.currentPlayerIndex,
            turn: this.turn,
            victoryCards: this.victoryCards,
            merchantCards: this.merchantCards,
            finalRoundTriggered: this.finalRoundTriggered,
            finalRoundTriggerPlayer: this.finalRoundTriggerPlayer,
            players: this.players.map(player => ({
                name: player.name,
                networkId: player.networkId,
                isAI: player.isAI,
                spices: player.spices,
                hand: player.hand,
                discardPile: player.discardPile,
                victoryCards: player.victoryCards,
                coins: player.coins
            }))
        };
    }
    
    isMyTurn() {
        if (!this.isNetworkGame) return true;
        
        const currentPlayer = this.getCurrentPlayer();
        return currentPlayer && currentPlayer.networkId === this.myPlayerId;
    }
    
    canTakeAction() {
        return this.isMyTurn() && !this.gameEnded;
    }
}

// Extend the GameUI class for multiplayer support
class MultiplayerGameUI extends GameUI {
    constructor(game) {
        super(game);
        this.isNetworkGame = false;
    }
    
    startNetworkGame(players, aiCount, aiDifficulty) {
        this.isNetworkGame = true;
        
        // Create game instance
        game = new MultiplayerGame();
        this.game = game;
        
        // Setup network game
        game.setupNetworkGame(players, aiCount, aiDifficulty);
        
        // Initialize AI players
        this.initializeAIPlayers(aiCount, aiDifficulty);
        
        // Initialize game statistics
        this.initializeGameStats();
        
        this.renderGame();
        
        // Store initial turn state and save initial game state
        this.storeTurnStartState();
        this.saveGameState();
        
        // Check if first player is AI
        this.checkForAITurn();
        
        console.log('Network game UI initialized');
    }
    
    handleNetworkAction(action) {
        // Handle actions received from other players
        console.log('Received network action:', action);
        
        // Apply the action to the game state
        switch (action.type) {
            case 'play-card':
                this.handleNetworkPlayCard(action);
                break;
            case 'acquire-card':
                this.handleNetworkAcquireCard(action);
                break;
            case 'claim-victory':
                this.handleNetworkClaimVictory(action);
                break;
            case 'rest':
                this.handleNetworkRest(action);
                break;
            case 'end-turn':
                this.handleNetworkEndTurn(action);
                break;
        }
        
        this.renderGame();
    }
    
    handleNetworkPlayCard(action) {
        const player = this.game.players.find(p => p.networkId === action.playerId);
        if (player && action.cardIndex < player.hand.length) {
            const card = player.hand[action.cardIndex];
            
            // Execute card effect
            this.game.executeCardEffect(player, card);
            
            // Move card to discard
            player.discardPile.push(player.hand.splice(action.cardIndex, 1)[0]);
        }
    }
    
    handleNetworkAcquireCard(action) {
        const player = this.game.players.find(p => p.networkId === action.playerId);
        if (player) {
            this.game.acquireMerchantCard(player, action.cardIndex);
        }
    }
    
    handleNetworkClaimVictory(action) {
        const player = this.game.players.find(p => p.networkId === action.playerId);
        if (player) {
            this.game.claimVictoryCard(player, action.cardIndex);
        }
    }
    
    handleNetworkRest(action) {
        const player = this.game.players.find(p => p.networkId === action.playerId);
        if (player) {
            this.game.rest(player);
        }
    }
    
    handleNetworkEndTurn(action) {
        this.game.nextTurn();
        this.checkForAITurn();
    }
    
    // Override action methods to send network messages
    showPlayCardAction() {
        if (!this.game.canTakeAction()) {
            this.showError("It's not your turn!");
            return;
        }
        
        super.showPlayCardAction();
    }
    
    showAcquireCardAction() {
        if (!this.game.canTakeAction()) {
            this.showError("It's not your turn!");
            return;
        }
        
        super.showAcquireCardAction();
    }
    
    showClaimVictoryAction() {
        if (!this.game.canTakeAction()) {
            this.showError("It's not your turn!");
            return;
        }
        
        super.showClaimVictoryAction();
    }
    
    showRestAction() {
        if (!this.game.canTakeAction()) {
            this.showError("It's not your turn!");
            return;
        }
        
        super.showRestAction();
    }
    
    // Override nextTurn to send network updates
    nextTurn() {
        if (this.isNetworkGame && window.multiplayerManager) {
            // Send action to network
            window.multiplayerManager.sendGameAction({
                type: 'end-turn',
                playerId: this.game.myPlayerId
            });
            
            // Send updated game state if host
            if (window.multiplayerManager.isHost) {
                window.multiplayerManager.sendGameState(this.game.getNetworkState());
            }
        }
        
        super.nextTurn();
    }
    
    // Override card play completion to send network updates
    completeCardPlay() {
        if (this.isNetworkGame && this.pendingCardPlay && window.multiplayerManager) {
            // Send card play action to network
            window.multiplayerManager.sendGameAction({
                type: 'play-card',
                playerId: this.game.myPlayerId,
                cardIndex: this.pendingCardPlay.cardIndex,
                card: this.pendingCardPlay.card
            });
        }
        
        super.completeCardPlay();
    }
    
    // Override merchant card purchase to send network updates
    executeMerchantCardPurchase() {
        if (this.isNetworkGame && window.multiplayerManager) {
            const cardIndex = this.pendingMerchantCardIndex || this.selectedCard;
            
            // Send acquire action to network
            window.multiplayerManager.sendGameAction({
                type: 'acquire-card',
                playerId: this.game.myPlayerId,
                cardIndex: cardIndex
            });
        }
        
        super.executeMerchantCardPurchase();
    }
    
    // Override victory card claim to send network updates
    showClaimVictoryAction() {
        if (!this.game.canTakeAction()) {
            this.showError("It's not your turn!");
            return;
        }
        
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
        
        // Send claim action to network
        if (this.isNetworkGame && window.multiplayerManager) {
            window.multiplayerManager.sendGameAction({
                type: 'claim-victory',
                playerId: this.game.myPlayerId,
                cardIndex: this.selectedCard
            });
        }
        
        // Execute the action
        const currentPlayer = this.game.getCurrentPlayer();
        const result = this.game.claimVictoryCard(currentPlayer, this.selectedCard);
        if (result.success) {
            console.log(result.message);
            this.clearSelection();
            
            // Check if player needs to discard spices
            if (result.needsDiscard) {
                this.showSpiceDiscardModal(currentPlayer, 'victory');
                return;
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
    
    // Override rest action to send network updates
    showRestAction() {
        if (!this.game.canTakeAction()) {
            this.showError("It's not your turn!");
            return;
        }
        
        const currentPlayer = this.game.getCurrentPlayer();
        if (currentPlayer.discardPile.length === 0) {
            this.showError('No cards to recover!');
            return;
        }
        
        // Save game state before action
        this.saveGameState();
        
        // Send rest action to network
        if (this.isNetworkGame && window.multiplayerManager) {
            window.multiplayerManager.sendGameAction({
                type: 'rest',
                playerId: this.game.myPlayerId
            });
        }
        
        const result = this.game.rest(currentPlayer);
        if (result.success) {
            console.log(result.message);
            this.clearSelection();
            this.nextTurn();
        }
    }
    
    // Override player element creation to show network status
    createPlayerElement(player, index) {
        const playerDiv = super.createPlayerElement(player, index);
        
        // Add network status indicator for multiplayer games
        if (this.isNetworkGame) {
            const playerInfo = playerDiv.querySelector('.player-info');
            if (playerInfo) {
                const networkStatus = document.createElement('div');
                networkStatus.className = 'network-status';
                
                if (player.isAI) {
                    networkStatus.innerHTML = '🤖 AI';
                } else if (player.networkId === this.game.myPlayerId) {
                    networkStatus.innerHTML = '👤 You';
                } else {
                    networkStatus.innerHTML = '🌐 Remote';
                }
                
                playerInfo.appendChild(networkStatus);
            }
            
            // Disable interactions for other players' cards
            if (player.networkId !== this.game.myPlayerId && !player.isAI) {
                const handCards = playerDiv.querySelectorAll('.hand-cards .card');
                handCards.forEach(card => {
                    card.style.pointerEvents = 'none';
                    card.style.opacity = '0.7';
                });
            }
        }
        
        return playerDiv;
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

// Initialize multiplayer game UI when needed
function initializeMultiplayerGame() {
    if (!game) {
        game = new MultiplayerGame();
    }
    
    if (!gameUI) {
        gameUI = new MultiplayerGameUI(game);
    }
    
    return { game, gameUI };
}