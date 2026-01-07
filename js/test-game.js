// Century: Spice Road - Test Game Logic (Quick Win Version)
// Modified to require only 1 victory card to win

class Game {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.turn = 1;
        this.victoryCards = [];
        this.merchantCards = [];
        this.victoryDeck = [];
        this.merchantDeck = [];
        this.gameEnded = false;
        this.winner = null;
        this.finalRoundTriggered = false;
        this.finalRoundTriggerPlayer = null;
        
        // Game constants
        this.SPICE_TYPES = ['yellow', 'red', 'green', 'brown'];
        this.MAX_SPICES = 10;
    }

    setupGame(playerCount) {
        this.playerCount = playerCount;
        // TEST MODE: Always require only 1 victory card to win
        this.victoryCardsNeeded = 1;
        
        // Initialize players
        this.initializePlayers(playerCount);
        
        // Setup decks and market
        this.initializeDecks();
        this.setupMarket();
        
        // Distribute starting spices
        this.distributeStartingSpices();
        
        console.log(`TEST GAME started with ${playerCount} players - Only 1 victory card needed to win!`);
    }

    initializePlayers(count) {
        this.players = [];
        for (let i = 0; i < count; i++) {
            this.players.push(new Player(`Player ${i + 1}`, i));
        }
    }

    initializeDecks() {
        // Check if cards are loaded
        if (typeof MERCHANT_CARDS === 'undefined' || typeof VICTORY_CARDS === 'undefined') {
            throw new Error('Card data not loaded. Make sure cards.js is loaded before game.js');
        }
        
        // Initialize merchant deck (will be populated from cards.js)
        this.merchantDeck = MERCHANT_CARDS.slice(); // Use slice() instead of spread operator
        this.shuffleDeck(this.merchantDeck);
        
        // Initialize victory deck (will be populated from cards.js)
        this.victoryDeck = VICTORY_CARDS.slice(); // Use slice() instead of spread operator
        this.shuffleDeck(this.victoryDeck);
    }

    setupMarket() {
        // Setup victory cards market (5 cards)
        this.victoryCards = [];
        for (let i = 0; i < 5; i++) {
            if (this.victoryDeck.length > 0) {
                this.victoryCards.push(this.victoryDeck.pop());
            }
        }
        
        // Add coins to first two victory cards
        if (this.victoryCards[0]) this.victoryCards[0].coin = 'gold';
        if (this.victoryCards[1]) this.victoryCards[1].coin = 'silver';
        
        // Setup merchant cards market (6 cards)
        this.merchantCards = [];
        for (let i = 0; i < 6; i++) {
            if (this.merchantDeck.length > 0) {
                this.merchantCards.push(this.merchantDeck.pop());
            }
        }
    }

    distributeStartingSpices() {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (i === 0) {
                // First player: 3 yellow
                player.addSpices('yellow', 3);
            } else if (i <= 2) {
                // 2nd and 3rd players: 4 yellow each
                player.addSpices('yellow', 4);
            } else {
                // 4th and 5th players: 3 yellow and 1 red each
                player.addSpices('yellow', 3);
                player.addSpices('red', 1);
            }
        }
    }

    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    nextTurn() {
        // Check if final round is complete BEFORE changing turns
        if (this.finalRoundTriggered) {
            // Calculate how many players have had their final turn
            const triggerPlayerIndex = this.finalRoundTriggerPlayer.id;
            const currentIndex = this.currentPlayerIndex;
            
            // If we're about to return to the trigger player, the final round is complete
            const nextPlayerIndex = (currentIndex + 1) % this.players.length;
            if (nextPlayerIndex === triggerPlayerIndex) {
                // Final round is complete - determine winner
                this.endGame();
                return; // Don't advance the turn
            }
        }
        
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }
    }
    
    endGame() {
        this.gameEnded = true;
        
        // Find the player with the highest score
        let highestScore = -1;
        let winners = [];
        
        for (const player of this.players) {
            const score = this.calculateFinalScore(player);
            if (score > highestScore) {
                highestScore = score;
                winners = [player];
            } else if (score === highestScore) {
                winners.push(player);
            }
        }
        
        // In case of tie, the player who triggered the final round wins
        if (winners.length > 1 && winners.includes(this.finalRoundTriggerPlayer)) {
            this.winner = this.finalRoundTriggerPlayer;
        } else {
            this.winner = winners[0];
        }
        
        console.log(`TEST GAME ended! ${this.winner.name} wins with ${highestScore} points`);
    }

    // Action: Play Merchant Card
    playMerchantCard(player, cardIndex) {
        if (cardIndex < 0 || cardIndex >= player.hand.length) {
            return { success: false, message: "Invalid card index" };
        }

        const card = player.hand[cardIndex];
        if (!this.canPlayCard(player, card)) {
            return { success: false, message: "Cannot play this card - insufficient resources" };
        }

        // Note: Card execution is now handled by the UI system
        // The UI will handle the card effect and move the card to discard pile
        
        return { success: true, message: "Card ready to play" };
    }
    // Action: Acquire Merchant Card
    acquireMerchantCard(player, cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.merchantCards.length) {
            return { success: false, message: "Invalid card index" };
        }

        // Calculate cost (1 yellow spice per skipped card)
        const cost = cardIndex;
        if (player.spices.yellow < cost) {
            return { success: false, message: "Not enough yellow spices" };
        }

        // Pay cost and add spices to skipped cards
        if (cost > 0) {
            player.removeSpices('yellow', cost);
            for (let i = 0; i < cardIndex; i++) {
                if (!this.merchantCards[i].bonusSpices) {
                    this.merchantCards[i].bonusSpices = [];
                }
                this.merchantCards[i].bonusSpices.push('yellow');
            }
        }

        // Take the card and any bonus spices on it
        const card = this.merchantCards[cardIndex];
        if (card.bonusSpices) {
            for (const spice of card.bonusSpices) {
                player.addSpices(spice, 1);
            }
            card.bonusSpices = [];
        }

        player.hand.push(card);
        
        // Refill market
        this.refillMerchantMarket(cardIndex);
        
        return { success: true, message: "Merchant card acquired" };
    }

    // Action: Claim Victory Point Card
    claimVictoryCard(player, cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.victoryCards.length) {
            return { success: false, message: "Invalid card index" };
        }

        const card = this.victoryCards[cardIndex];
        if (!this.canAffordVictoryCard(player, card)) {
            return { success: false, message: "Cannot afford this victory card" };
        }

        // Pay the cost
        for (const [spiceType, amount] of Object.entries(card.cost)) {
            player.removeSpices(spiceType, amount);
        }

        // Gain the card and any coin
        player.victoryCards.push(card);
        if (card.coin) {
            player.coins.push(card.coin);
        }

        // Add bonus spices if any
        if (card.bonusSpices) {
            for (const [spiceType, amount] of Object.entries(card.bonusSpices)) {
                player.addSpices(spiceType, amount);
            }
        }

        // Check for game end trigger (not immediate end) - TEST MODE: Only 1 victory card needed
        if (player.victoryCards.length >= this.victoryCardsNeeded && !this.finalRoundTriggered) {
            this.finalRoundTriggered = true;
            this.finalRoundTriggerPlayer = player;
            console.log(`TEST GAME: Final round triggered by ${player.name}! Other players get one more turn each.`);
        }

        // Refill market
        this.refillVictoryMarket(cardIndex);
        
        // Check if player needs to discard spices due to bonus spices
        if (player.needsToDiscardSpices()) {
            return { success: true, message: "Victory card claimed", needsDiscard: true };
        }
        
        return { success: true, message: "Victory card claimed" };
    }
    // Action: Rest (recover all cards)
    rest(player) {
        // Use concat instead of spread operator for better compatibility
        player.hand = player.hand.concat(player.discardPile);
        player.discardPile = [];
        return { success: true, message: "All cards recovered to hand" };
    }

    canPlayCard(player, card) {
        // Check if player has required spices for the card
        switch (card.type) {
            case 'trade':
                // Check if player has input spices
                for (const [spiceType, amount] of Object.entries(card.effect.input)) {
                    if (player.spices[spiceType] < amount) {
                        return false;
                    }
                }
                return true;
            case 'upgrade':
                // Check if player has any spices to upgrade
                return player.spices.yellow > 0 || player.spices.red > 0 || player.spices.green > 0;
            case 'gain':
            case 'gain-upgrade':
                // These cards can always be played
                return true;
            default:
                return true;
        }
    }

    canAffordVictoryCard(player, card) {
        for (const [spiceType, amount] of Object.entries(card.cost)) {
            if (player.spices[spiceType] < amount) {
                return false;
            }
        }
        return true;
    }

    executeCardEffect(player, card) {
        switch (card.type) {
            case 'gain':
                for (const [spiceType, amount] of Object.entries(card.effect)) {
                    player.addSpices(spiceType, amount);
                }
                break;
            case 'upgrade':
                // Show upgrade options to player
                this.showUpgradeOptions(player, card.effect.amount);
                return; // Don't continue - wait for player choice
            case 'trade':
                // Show trade options to player (multiple ratios)
                this.showTradeOptions(player, card.effect.input, card.effect.output);
                return; // Don't continue - wait for player choice
            case 'gain-upgrade':
                // First gain spices
                for (const [spiceType, amount] of Object.entries(card.effect.gain)) {
                    player.addSpices(spiceType, amount);
                }
                // Then show upgrade options
                this.showUpgradeOptions(player, card.effect.upgrade);
                return; // Don't continue - wait for player choice
        }
    }

    showTradeOptions(player, inputRatio, outputRatio) {
        // This will be called by the UI system
        if (typeof gameUI !== 'undefined') {
            gameUI.showTradeOptions(player, inputRatio, outputRatio);
        }
    }

    showUpgradeOptions(player, upgradeAmount) {
        // This will be called by the UI system
        if (typeof gameUI !== 'undefined') {
            gameUI.showUpgradeOptions(player, upgradeAmount);
        }
    }

    refillMerchantMarket(takenIndex) {
        // Shift cards left
        this.merchantCards.splice(takenIndex, 1);
        
        // Add new card from deck if available
        if (this.merchantDeck.length > 0) {
            this.merchantCards.push(this.merchantDeck.pop());
        }
    }

    refillVictoryMarket(takenIndex) {
        // Shift cards left
        this.victoryCards.splice(takenIndex, 1);
        
        // Add new card from deck if available
        if (this.victoryDeck.length > 0) {
            this.victoryCards.push(this.victoryDeck.pop());
        }
        
        // Add coins to first two cards (gold on first, silver on second)
        // Clear existing coins first
        this.victoryCards.forEach(card => {
            delete card.coin;
        });
        
        // Add new coins
        if (this.victoryCards[0]) this.victoryCards[0].coin = 'gold';
        if (this.victoryCards[1]) this.victoryCards[1].coin = 'silver';
    }

    calculateFinalScore(player) {
        let score = 0;
        
        // 1. Victory points from cards
        for (const card of player.victoryCards) {
            score += card.points;
        }
        
        // 2. Points from coins (correct scoring)
        for (const coin of player.coins) {
            if (coin.type === 'gold') {
                score += 3; // Gold coins worth 3 points
            } else if (coin.type === 'silver') {
                score += 1; // Silver coins worth 1 point
            }
        }
        
        // 3. Points from non-yellow spices (1 point each)
        score += player.spices.red + player.spices.green + player.spices.brown;
        
        return score;
    }
}
class Player {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.spices = {
            yellow: 0,
            red: 0,
            green: 0,
            brown: 0
        };
        this.hand = [];
        this.discardPile = [];
        this.victoryCards = [];
        this.coins = [];
        
        // Add starting merchant cards
        this.addStartingCards();
    }

    addStartingCards() {
        // Add basic starting cards
        this.hand.push({
            id: 'upgrade-2',
            name: 'Upgrade 2',
            type: 'upgrade',
            effect: { amount: 2 },
            description: 'Upgrade up to 2 spice levels'
        });
        
        this.hand.push({
            id: 'gain-2y',
            name: 'Gain 2 Yellow',
            type: 'gain',
            effect: { yellow: 2 },
            description: 'Gain 2 yellow spices'
        });
    }

    addSpices(type, amount) {
        // Allow temporary overflow - we'll handle it later
        this.spices[type] += amount;
        return amount;
    }

    removeSpices(type, amount) {
        const canRemove = Math.min(amount, this.spices[type]);
        this.spices[type] -= canRemove;
        return canRemove;
    }

    getTotalSpices() {
        return Object.values(this.spices).reduce((sum, count) => sum + count, 0);
    }

    needsToDiscardSpices() {
        return this.getTotalSpices() > 10;
    }

    getExcessSpiceCount() {
        return Math.max(0, this.getTotalSpices() - 10);
    }

    canUpgrade(fromType, toType, amount) {
        const spiceIndex = ['yellow', 'red', 'green', 'brown'];
        const fromIndex = spiceIndex.indexOf(fromType);
        const toIndex = spiceIndex.indexOf(toType);
        
        if (fromIndex === -1 || toIndex === -1 || toIndex <= fromIndex) {
            return false;
        }
        
        return this.spices[fromType] >= amount;
    }

    upgradeSpices(fromType, toType, amount) {
        if (!this.canUpgrade(fromType, toType, amount)) {
            return false;
        }
        
        this.removeSpices(fromType, amount);
        this.addSpices(toType, amount);
        return true;
    }
}