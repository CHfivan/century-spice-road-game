// Century: Spice Road - Game Analytics and Statistics

class GameAnalytics {
    constructor() {
        this.gameHistory = [];
        this.playerStats = {};
        this.loadFromStorage();
    }
    
    // Record a completed game
    recordGame(gameData) {
        const gameRecord = {
            id: this.generateGameId(),
            timestamp: Date.now(),
            date: new Date().toISOString(),
            playerCount: gameData.playerCount,
            aiCount: gameData.aiCount || 0,
            aiDifficulty: gameData.aiDifficulty || 'none',
            duration: gameData.duration,
            winner: gameData.winner,
            finalScores: gameData.finalScores,
            players: gameData.players.map(player => ({
                name: player.name,
                isAI: player.isAI || false,
                finalScore: gameData.finalScores.find(s => s.name === player.name)?.score || 0,
                victoryCards: player.victoryCards.length,
                coins: player.coins.length,
                actions: gameData.playerActions?.find(a => a.name === player.name) || {}
            })),
            gameStats: gameData.gameStats || {}
        };
        
        this.gameHistory.push(gameRecord);
        this.updatePlayerStats(gameRecord);
        this.saveToStorage();
        
        console.log('Game recorded:', gameRecord);
        return gameRecord;
    }
    
    updatePlayerStats(gameRecord) {
        gameRecord.players.forEach(player => {
            if (!this.playerStats[player.name]) {
                this.playerStats[player.name] = {
                    gamesPlayed: 0,
                    wins: 0,
                    totalScore: 0,
                    averageScore: 0,
                    bestScore: 0,
                    worstScore: Infinity,
                    victoryCardsTotal: 0,
                    coinsTotal: 0,
                    winRate: 0,
                    isAI: player.isAI
                };
            }
            
            const stats = this.playerStats[player.name];
            stats.gamesPlayed++;
            stats.totalScore += player.finalScore;
            stats.averageScore = Math.round(stats.totalScore / stats.gamesPlayed);
            stats.bestScore = Math.max(stats.bestScore, player.finalScore);
            stats.worstScore = Math.min(stats.worstScore, player.finalScore);
            stats.victoryCardsTotal += player.victoryCards;
            stats.coinsTotal += player.coins;
            
            if (gameRecord.winner.name === player.name) {
                stats.wins++;
            }
            
            stats.winRate = Math.round((stats.wins / stats.gamesPlayed) * 100);
        });
    }
    
    // Get comprehensive statistics
    getOverallStats() {
        const totalGames = this.gameHistory.length;
        if (totalGames === 0) {
            return {
                totalGames: 0,
                message: 'No games played yet'
            };
        }
        
        const playerCounts = {};
        const aiGames = this.gameHistory.filter(g => g.aiCount > 0).length;
        const averageDuration = this.gameHistory.reduce((sum, g) => sum + (g.duration || 0), 0) / totalGames;
        
        this.gameHistory.forEach(game => {
            playerCounts[game.playerCount] = (playerCounts[game.playerCount] || 0) + 1;
        });
        
        const mostCommonPlayerCount = Object.entries(playerCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
        
        return {
            totalGames,
            aiGames,
            humanOnlyGames: totalGames - aiGames,
            averageDuration: Math.round(averageDuration / 1000 / 60), // minutes
            mostCommonPlayerCount,
            playerCounts,
            recentGames: this.gameHistory.slice(-5).reverse()
        };
    }
    
    getPlayerStats(playerName = null) {
        if (playerName) {
            return this.playerStats[playerName] || null;
        }
        
        // Return top players by win rate
        return Object.entries(this.playerStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.winRate - a.winRate);
    }
    
    getGameTrends() {
        if (this.gameHistory.length < 2) {
            return { message: 'Need at least 2 games for trends' };
        }
        
        const recentGames = this.gameHistory.slice(-10);
        const scores = recentGames.map(g => 
            Math.max(...g.finalScores.map(s => s.score))
        );
        
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const trend = scores.length > 1 ? 
            (scores[scores.length - 1] - scores[0]) / scores.length : 0;
        
        return {
            averageRecentScore: Math.round(averageScore),
            scoreTrend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            recentHighScore: Math.max(...scores),
            recentLowScore: Math.min(...scores)
        };
    }
    
    // Achievement system
    checkAchievements(gameRecord) {
        const achievements = [];
        const winner = gameRecord.players.find(p => p.name === gameRecord.winner.name);
        
        if (!winner) return achievements;
        
        // Perfect game (won with exactly the required victory cards)
        if (winner.victoryCards === (gameRecord.playerCount <= 3 ? 5 : 6)) {
            achievements.push({
                id: 'perfect_game',
                name: 'Perfect Victory',
                description: 'Won with exactly the required number of victory cards',
                icon: '🎯'
            });
        }
        
        // High scorer (score > 80)
        if (winner.finalScore >= 80) {
            achievements.push({
                id: 'high_scorer',
                name: 'Master Merchant',
                description: 'Achieved a score of 80 or higher',
                icon: '💰'
            });
        }
        
        // Speed demon (won in under 15 minutes)
        if (gameRecord.duration && gameRecord.duration < 15 * 60 * 1000) {
            achievements.push({
                id: 'speed_demon',
                name: 'Speed Merchant',
                description: 'Won a game in under 15 minutes',
                icon: '⚡'
            });
        }
        
        // AI Challenger (beat AI on hard difficulty)
        if (gameRecord.aiCount > 0 && gameRecord.aiDifficulty === 'hard' && !winner.isAI) {
            achievements.push({
                id: 'ai_challenger',
                name: 'AI Challenger',
                description: 'Defeated AI players on hard difficulty',
                icon: '🤖'
            });
        }
        
        // Check milestone achievements
        const playerStats = this.playerStats[winner.name];
        if (playerStats) {
            if (playerStats.wins === 1) {
                achievements.push({
                    id: 'first_win',
                    name: 'First Victory',
                    description: 'Won your first game',
                    icon: '🏆'
                });
            }
            
            if (playerStats.wins === 10) {
                achievements.push({
                    id: 'veteran',
                    name: 'Veteran Trader',
                    description: 'Won 10 games',
                    icon: '🎖️'
                });
            }
            
            if (playerStats.winRate >= 75 && playerStats.gamesPlayed >= 4) {
                achievements.push({
                    id: 'champion',
                    name: 'Trading Champion',
                    description: 'Maintained 75%+ win rate over 4+ games',
                    icon: '👑'
                });
            }
        }
        
        return achievements;
    }
    
    // Export data for backup
    exportData() {
        return {
            gameHistory: this.gameHistory,
            playerStats: this.playerStats,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    // Import data from backup
    importData(data) {
        try {
            if (data.gameHistory && data.playerStats) {
                this.gameHistory = data.gameHistory;
                this.playerStats = data.playerStats;
                this.saveToStorage();
                return { success: true, message: 'Data imported successfully' };
            }
            return { success: false, message: 'Invalid data format' };
        } catch (error) {
            return { success: false, message: 'Import failed: ' + error.message };
        }
    }
    
    // Clear all data
    clearAllData() {
        this.gameHistory = [];
        this.playerStats = {};
        this.saveToStorage();
    }
    
    // Storage methods
    saveToStorage() {
        try {
            const data = {
                gameHistory: this.gameHistory,
                playerStats: this.playerStats
            };
            localStorage.setItem('centurySpiceRoadStats', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save analytics data:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const data = localStorage.getItem('centurySpiceRoadStats');
            if (data) {
                const parsed = JSON.parse(data);
                this.gameHistory = parsed.gameHistory || [];
                this.playerStats = parsed.playerStats || {};
            }
        } catch (error) {
            console.warn('Failed to load analytics data:', error);
            this.gameHistory = [];
            this.playerStats = {};
        }
    }
    
    generateGameId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Global analytics instance
const gameAnalytics = new GameAnalytics();