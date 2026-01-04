// Century: Spice Road - AI Player Implementation

class AIPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
        this.name = `AI (${difficulty})`;
        this.thinkingTime = this.getThinkingTime();
    }
    
    getThinkingTime() {
        switch (this.difficulty) {
            case 'easy': return 1000; // 1 second
            case 'medium': return 2000; // 2 seconds
            case 'hard': return 3000; // 3 seconds
            default: return 2000;
        }
    }
    
    // Main AI decision making method
    async makeDecision(game, player) {
        console.log(`${this.name} is thinking...`);
        
        // Simulate thinking time
        await this.delay(this.thinkingTime);
        
        // Analyze game state and make decision
        const decision = this.analyzeGameState(game, player);
        
        console.log(`${this.name} decided to:`, decision.action);
        return decision;
    }
    
    analyzeGameState(game, player) {
        const actions = this.getPossibleActions(game, player);
        
        // Score each action based on AI strategy
        const scoredActions = actions.map(action => ({
            ...action,
            score: this.scoreAction(action, game, player)
        }));
        
        // Sort by score (highest first)
        scoredActions.sort((a, b) => b.score - a.score);
        
        // Add some randomness based on difficulty
        const randomFactor = this.getRandomFactor();
        const selectedIndex = Math.floor(Math.random() * Math.min(randomFactor, scoredActions.length));
        
        return scoredActions[selectedIndex] || scoredActions[0];
    }
    
    getPossibleActions(game, player) {
        const actions = [];
        
        // Always can rest if have cards in discard
        if (player.discardPile.length > 0) {
            actions.push({ action: 'rest' });
        }
        
        // Can play cards from hand
        player.hand.forEach((card, index) => {
            if (game.canPlayCard(player, card)) {
                actions.push({ 
                    action: 'playCard', 
                    cardIndex: index,
                    card: card
                });
            }
        });
        
        // Can acquire merchant cards
        game.merchantCards.forEach((card, index) => {
            const cost = index; // Yellow spices needed
            if (player.spices.yellow >= cost) {
                actions.push({
                    action: 'acquireCard',
                    cardIndex: index,
                    cost: cost,
                    card: card
                });
            }
        });
        
        // Can claim victory cards
        game.victoryCards.forEach((card, index) => {
            if (game.canAffordVictoryCard(player, card)) {
                actions.push({
                    action: 'claimVictory',
                    cardIndex: index,
                    card: card
                });
            }
        });
        
        return actions;
    }
    
    scoreAction(action, game, player) {
        let score = 0;
        
        switch (action.action) {
            case 'claimVictory':
                // Highest priority - winning the game
                score = 1000 + action.card.points;
                
                // Bonus if this wins the game
                if (player.victoryCards.length + 1 >= game.victoryCardsNeeded) {
                    score += 500;
                }
                break;
                
            case 'playCard':
                score = this.scoreCardPlay(action.card, player);
                break;
                
            case 'acquireCard':
                score = this.scoreCardAcquisition(action.card, action.cost, player);
                break;
                
            case 'rest':
                // Rest is good when hand is empty or mostly empty
                score = 50 + (player.discardPile.length * 10) - (player.hand.length * 5);
                break;
        }
        
        // Add difficulty-based scoring adjustments
        score = this.adjustScoreForDifficulty(score, action);
        
        return score;
    }
    
    scoreCardPlay(card, player) {
        let score = 30; // Base score for playing a card
        
        switch (card.type) {
            case 'gain':
                // Score based on spices gained
                for (const [spiceType, amount] of Object.entries(card.effect)) {
                    score += amount * this.getSpiceValue(spiceType);
                }
                break;
                
            case 'upgrade':
                // Score based on potential upgrades
                const upgradeValue = this.calculateUpgradeValue(player, card.effect.amount);
                score += upgradeValue;
                break;
                
            case 'trade':
                // Score based on trade efficiency
                const tradeValue = this.calculateTradeValue(player, card.effect.input, card.effect.output);
                score += tradeValue;
                break;
                
            case 'gain-upgrade':
                // Combination of gain and upgrade
                for (const [spiceType, amount] of Object.entries(card.effect.gain)) {
                    score += amount * this.getSpiceValue(spiceType);
                }
                const upgradeVal = this.calculateUpgradeValue(player, card.effect.upgrade);
                score += upgradeVal;
                break;
        }
        
        return score;
    }
    
    scoreCardAcquisition(card, cost, player) {
        let score = this.scoreCardPlay(card, player) - (cost * 5); // Subtract cost
        
        // Bonus for powerful cards
        if (card.type === 'upgrade' && card.effect.amount >= 3) {
            score += 20;
        }
        
        if (card.type === 'trade') {
            const outputValue = Object.entries(card.effect.output)
                .reduce((sum, [type, amount]) => sum + (amount * this.getSpiceValue(type)), 0);
            if (outputValue >= 15) { // High-value trade
                score += 15;
            }
        }
        
        return score;
    }
    
    getSpiceValue(spiceType) {
        const values = { yellow: 1, red: 3, green: 5, brown: 7 };
        return values[spiceType] || 0;
    }
    
    calculateUpgradeValue(player, upgradeAmount) {
        let value = 0;
        const spiceTypes = ['yellow', 'red', 'green', 'brown'];
        
        // Calculate potential upgrade value
        for (let i = 0; i < spiceTypes.length - 1; i++) {
            const fromType = spiceTypes[i];
            const toType = spiceTypes[i + 1];
            const available = player.spices[fromType];
            
            if (available > 0) {
                const canUpgrade = Math.min(available, upgradeAmount);
                const valueGain = canUpgrade * (this.getSpiceValue(toType) - this.getSpiceValue(fromType));
                value += valueGain;
            }
        }
        
        return value;
    }
    
    calculateTradeValue(player, input, output) {
        // Check if player can afford the trade
        for (const [spiceType, amount] of Object.entries(input)) {
            if (player.spices[spiceType] < amount) {
                return -50; // Can't afford trade
            }
        }
        
        // Calculate value difference
        const inputValue = Object.entries(input)
            .reduce((sum, [type, amount]) => sum + (amount * this.getSpiceValue(type)), 0);
        const outputValue = Object.entries(output)
            .reduce((sum, [type, amount]) => sum + (amount * this.getSpiceValue(type)), 0);
        
        return outputValue - inputValue;
    }
    
    getRandomFactor() {
        switch (this.difficulty) {
            case 'easy': return 3; // Consider top 3 actions
            case 'medium': return 2; // Consider top 2 actions
            case 'hard': return 1; // Always pick best action
            default: return 2;
        }
    }
    
    adjustScoreForDifficulty(score, action) {
        if (this.difficulty === 'easy') {
            // Easy AI makes some suboptimal choices
            score += Math.random() * 20 - 10; // ±10 random adjustment
        } else if (this.difficulty === 'hard') {
            // Hard AI gets bonus for strategic actions
            if (action.action === 'claimVictory' || action.action === 'acquireCard') {
                score += 10;
            }
        }
        
        return score;
    }
    
    // Execute the chosen action
    async executeAction(decision, game, player, gameUI) {
        switch (decision.action) {
            case 'playCard':
                return await this.executePlayCard(decision, game, player, gameUI);
            case 'acquireCard':
                return await this.executeAcquireCard(decision, game, player, gameUI);
            case 'claimVictory':
                return await this.executeClaimVictory(decision, game, player, gameUI);
            case 'rest':
                return await this.executeRest(decision, game, player, gameUI);
        }
    }
    
    async executePlayCard(decision, game, player, gameUI) {
        const card = decision.card;
        
        // Handle different card types
        if (card.type === 'gain') {
            // Simple gain card - execute immediately
            for (const [spiceType, amount] of Object.entries(card.effect)) {
                player.addSpices(spiceType, amount);
            }
            player.discardPile.push(player.hand.splice(decision.cardIndex, 1)[0]);
        } else if (card.type === 'upgrade') {
            // AI needs to choose upgrades
            const upgrades = this.chooseUpgrades(player, card.effect.amount);
            this.executeUpgrades(player, upgrades);
            player.discardPile.push(player.hand.splice(decision.cardIndex, 1)[0]);
        } else if (card.type === 'trade') {
            // AI needs to choose trade amount
            const tradeAmount = this.chooseTradeAmount(player, card.effect.input, card.effect.output);
            this.executeTrade(player, card.effect.input, card.effect.output, tradeAmount);
            player.discardPile.push(player.hand.splice(decision.cardIndex, 1)[0]);
        }
        
        return { success: true };
    }
    
    async executeAcquireCard(decision, game, player, gameUI) {
        const result = game.acquireMerchantCard(player, decision.cardIndex);
        return result;
    }
    
    async executeClaimVictory(decision, game, player, gameUI) {
        const result = game.claimVictoryCard(player, decision.cardIndex);
        return result;
    }
    
    async executeRest(decision, game, player, gameUI) {
        const result = game.rest(player);
        return result;
    }
    
    chooseUpgrades(player, upgradeAmount) {
        const upgrades = [];
        const spiceTypes = ['yellow', 'red', 'green', 'brown'];
        let remainingUpgrades = upgradeAmount;
        
        // Prioritize upgrading to higher value spices
        for (let i = spiceTypes.length - 2; i >= 0 && remainingUpgrades > 0; i--) {
            const fromType = spiceTypes[i];
            const toType = spiceTypes[i + 1];
            const available = player.spices[fromType];
            
            if (available > 0) {
                const upgradeCount = Math.min(available, remainingUpgrades);
                if (upgradeCount > 0) {
                    upgrades.push({ from: fromType, to: toType, count: upgradeCount });
                    remainingUpgrades -= upgradeCount;
                }
            }
        }
        
        return upgrades;
    }
    
    executeUpgrades(player, upgrades) {
        for (const upgrade of upgrades) {
            player.removeSpices(upgrade.from, upgrade.count);
            player.addSpices(upgrade.to, upgrade.count);
        }
    }
    
    chooseTradeAmount(player, inputRatio, outputRatio) {
        // Calculate maximum possible trades
        let maxTrades = Infinity;
        
        for (const [spiceType, amount] of Object.entries(inputRatio)) {
            const available = player.spices[spiceType];
            const possibleTrades = Math.floor(available / amount);
            maxTrades = Math.min(maxTrades, possibleTrades);
        }
        
        // AI usually trades as much as possible, but sometimes holds back
        const tradeAmount = this.difficulty === 'hard' ? maxTrades : 
                           Math.max(1, Math.floor(maxTrades * (0.7 + Math.random() * 0.3)));
        
        return Math.min(tradeAmount, maxTrades);
    }
    
    executeTrade(player, inputRatio, outputRatio, multiplier) {
        // Remove input spices
        for (const [spiceType, amount] of Object.entries(inputRatio)) {
            player.removeSpices(spiceType, amount * multiplier);
        }
        
        // Add output spices
        for (const [spiceType, amount] of Object.entries(outputRatio)) {
            player.addSpices(spiceType, amount * multiplier);
        }
    }
    
    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}