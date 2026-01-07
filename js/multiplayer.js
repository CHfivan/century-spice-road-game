// Century: Spice Road - Multiplayer Networking

class MultiplayerManager {
    constructor() {
        this.isHost = false;
        this.roomCode = null;
        this.playerName = '';
        this.players = [];
        this.maxPlayers = 4;
        this.aiCount = 0;
        this.aiDifficulty = 'medium';
        this.gameState = null;
        this.connections = new Map(); // peer connections
        this.dataChannels = new Map(); // data channels for each peer
        this.localPeer = null;
        this.isConnected = false;
        
        // Simple signaling using a public STUN server and localStorage for demo
        // In production, you'd use a proper signaling server
        this.signalingChannel = 'century-spice-road-signaling';
        
        this.initializeEventListeners();
        this.startSignalingListener();
    }
    
    initializeEventListeners() {
        // Lobby events
        document.getElementById('create-room-btn').addEventListener('click', () => this.showCreateRoom());
        document.getElementById('join-room-btn').addEventListener('click', () => this.showJoinRoom());
        
        // Room creation events
        document.getElementById('back-to-lobby-btn').addEventListener('click', () => this.showLobby());
        document.getElementById('create-room-confirm-btn').addEventListener('click', () => this.createRoom());
        
        // Room join events
        document.getElementById('back-to-lobby2-btn').addEventListener('click', () => this.showLobby());
        document.getElementById('join-room-confirm-btn').addEventListener('click', () => this.joinRoom());
        
        // Game room events
        document.getElementById('leave-room-btn').addEventListener('click', () => this.leaveRoom());
        document.getElementById('start-multiplayer-game-btn').addEventListener('click', () => this.startMultiplayerGame());
        document.getElementById('end-game-btn').addEventListener('click', () => this.endGame());
        
        // Settings change events
        document.getElementById('room-ai-count').addEventListener('change', (e) => this.updateGameSettings());
        document.getElementById('room-ai-diff').addEventListener('change', (e) => this.updateGameSettings());
        
        // Player name validation
        document.getElementById('player-name').addEventListener('input', (e) => {
            this.playerName = e.target.value.trim() || 'Player';
        });
        
        // Room code formatting
        document.getElementById('room-code').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }
    
    showLobby() {
        this.showScreen('lobby-screen');
        this.leaveRoom();
    }
    
    showCreateRoom() {
        this.showScreen('room-creation-screen');
        document.getElementById('room-name').value = `${this.playerName || 'Player'}'s Room`;
    }
    
    showJoinRoom() {
        this.showScreen('room-join-screen');
        document.getElementById('room-code').value = '';
    }
    
    async createRoom() {
        const roomName = document.getElementById('room-name').value.trim() || 'Game Room';
        this.maxPlayers = parseInt(document.getElementById('max-players').value);
        this.aiCount = parseInt(document.getElementById('room-ai-players').value);
        this.aiDifficulty = document.getElementById('room-ai-difficulty').value;
        
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        this.playerName = document.getElementById('player-name').value.trim() || 'Host';
        
        // Initialize as host
        this.players = [{
            id: 'host',
            name: this.playerName,
            isHost: true,
            isAI: false,
            connected: true
        }];
        
        // Add AI players if specified
        for (let i = 0; i < this.aiCount; i++) {
            this.players.push({
                id: `ai-${i}`,
                name: `AI Player ${i + 1}`,
                isHost: false,
                isAI: true,
                connected: true
            });
        }
        
        try {
            await this.initializePeerConnection();
            this.publishRoom(roomName);
            this.showGameRoom(roomName);
            this.updateRoomDisplay();
            this.showMessage('Room created! Share the room code with your friends.', 'success');
        } catch (error) {
            console.error('Failed to create room:', error);
            this.showMessage('Failed to create room. Please try again.', 'error');
        }
    }
    
    async joinRoom() {
        const roomCode = document.getElementById('room-code').value.trim();
        if (roomCode.length !== 6) {
            this.showMessage('Please enter a valid 6-digit room code', 'error');
            return;
        }
        
        this.roomCode = roomCode;
        this.isHost = false;
        this.playerName = document.getElementById('player-name').value.trim() || 'Player';
        
        try {
            const roomData = await this.findRoom(roomCode);
            if (!roomData) {
                this.showMessage('Room not found. Please check the room code.', 'error');
                return;
            }
            
            if (roomData.players.length >= roomData.maxPlayers) {
                this.showMessage('Room is full. Cannot join.', 'error');
                return;
            }
            
            await this.connectToRoom(roomData);
            this.showMessage('Joining room...', 'info');
        } catch (error) {
            console.error('Failed to join room:', error);
            this.showMessage('Failed to join room. Please try again.', 'error');
        }
    }
    
    async initializePeerConnection() {
        // Create peer connection with STUN servers for NAT traversal
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.localPeer = new RTCPeerConnection(configuration);
        
        // Handle ICE candidates
        this.localPeer.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignalingMessage({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    roomCode: this.roomCode
                });
            }
        };
        
        // Handle incoming data channels
        this.localPeer.ondatachannel = (event) => {
            const channel = event.channel;
            this.setupDataChannel(channel, 'remote');
        };
        
        return this.localPeer;
    }
    
    setupDataChannel(channel, peerId) {
        channel.onopen = () => {
            console.log(`Data channel opened with ${peerId}`);
            this.isConnected = true;
            this.updateConnectionStatus('Connected');
        };
        
        channel.onclose = () => {
            console.log(`Data channel closed with ${peerId}`);
            this.isConnected = false;
            this.updateConnectionStatus('Disconnected');
        };
        
        channel.onmessage = (event) => {
            this.handleNetworkMessage(JSON.parse(event.data));
        };
        
        channel.onerror = (error) => {
            console.error('Data channel error:', error);
            this.updateConnectionStatus('Connection Error');
        };
        
        this.dataChannels.set(peerId, channel);
    }
    
    publishRoom(roomName) {
        const roomData = {
            code: this.roomCode,
            name: roomName,
            host: this.playerName,
            players: this.players,
            maxPlayers: this.maxPlayers,
            aiCount: this.aiCount,
            aiDifficulty: this.aiDifficulty,
            timestamp: Date.now()
        };
        
        // Store room data in localStorage for simple signaling
        // In production, use a proper signaling server
        localStorage.setItem(`room-${this.roomCode}`, JSON.stringify(roomData));
        
        // Set expiration (clean up after 1 hour)
        setTimeout(() => {
            localStorage.removeItem(`room-${this.roomCode}`);
        }, 3600000);
    }
    
    async findRoom(roomCode) {
        const roomData = localStorage.getItem(`room-${roomCode}`);
        return roomData ? JSON.parse(roomData) : null;
    }
    
    async connectToRoom(roomData) {
        this.maxPlayers = roomData.maxPlayers;
        this.players = roomData.players;
        
        // Add self to players list
        this.players.push({
            id: `player-${Date.now()}`,
            name: this.playerName,
            isHost: false,
            isAI: false,
            connected: false
        });
        
        await this.initializePeerConnection();
        
        // Create data channel to host
        const dataChannel = this.localPeer.createDataChannel('game-data');
        this.setupDataChannel(dataChannel, 'host');
        
        // Create offer and send to host via signaling
        const offer = await this.localPeer.createOffer();
        await this.localPeer.setLocalDescription(offer);
        
        this.sendSignalingMessage({
            type: 'join-request',
            offer: offer,
            playerName: this.playerName,
            roomCode: this.roomCode
        });
        
        this.showGameRoom(roomData.name);
    }
    
    showGameRoom(roomName) {
        this.showScreen('game-room-screen');
        document.getElementById('room-title').textContent = roomName;
        document.getElementById('room-code-display').textContent = `Room Code: ${this.roomCode}`;
        
        // Show room controls only for host
        const roomControls = document.getElementById('room-controls');
        if (this.isHost) {
            roomControls.style.display = 'block';
        } else {
            roomControls.style.display = 'none';
        }
    }
    
    updateRoomDisplay() {
        const playersList = document.getElementById('room-players-list');
        const playerCount = document.getElementById('player-count-display');
        
        playerCount.textContent = `(${this.players.length}/${this.maxPlayers})`;
        
        playersList.innerHTML = '';
        this.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'room-player';
            
            let statusIcon = '🔴'; // disconnected
            if (player.connected) statusIcon = '🟢'; // connected
            if (player.isAI) statusIcon = '🤖'; // AI
            
            playerDiv.innerHTML = `
                <div class="player-info">
                    <span class="player-status">${statusIcon}</span>
                    <span class="player-name">${player.name}</span>
                    ${player.isHost ? '<span class="host-badge">HOST</span>' : ''}
                </div>
            `;
            
            playersList.appendChild(playerDiv);
        });
        
        // Update start button state
        const startBtn = document.getElementById('start-multiplayer-game-btn');
        const connectedPlayers = this.players.filter(p => p.connected || p.isAI).length;
        const canStart = this.isHost && connectedPlayers >= 2;
        
        startBtn.disabled = !canStart;
        startBtn.textContent = canStart ? 'Start Game' : `Need ${2 - connectedPlayers} more players`;
    }
    
    updateGameSettings() {
        if (!this.isHost) return;
        
        this.aiCount = parseInt(document.getElementById('room-ai-count').value);
        this.aiDifficulty = document.getElementById('room-ai-diff').value;
        
        // Update AI players in the list
        this.players = this.players.filter(p => !p.isAI);
        
        for (let i = 0; i < this.aiCount; i++) {
            this.players.push({
                id: `ai-${i}`,
                name: `AI Player ${i + 1} (${this.aiDifficulty})`,
                isHost: false,
                isAI: true,
                connected: true
            });
        }
        
        this.updateRoomDisplay();
        this.broadcastToAll({
            type: 'room-update',
            players: this.players,
            aiCount: this.aiCount,
            aiDifficulty: this.aiDifficulty
        });
    }
    
    startSignalingListener() {
        // Listen for signaling messages via localStorage events
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('signal-')) {
                const message = JSON.parse(event.newValue);
                if (message.roomCode === this.roomCode) {
                    this.handleSignalingMessage(message);
                }
            }
        });
        
        // Also check periodically for messages
        setInterval(() => {
            this.checkSignalingMessages();
        }, 1000);
    }
    
    sendSignalingMessage(message) {
        const signalId = `signal-${Date.now()}-${Math.random()}`;
        localStorage.setItem(signalId, JSON.stringify(message));
        
        // Clean up after 30 seconds
        setTimeout(() => {
            localStorage.removeItem(signalId);
        }, 30000);
    }
    
    checkSignalingMessages() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('signal-')) {
                try {
                    const message = JSON.parse(localStorage.getItem(key));
                    if (message.roomCode === this.roomCode) {
                        this.handleSignalingMessage(message);
                    }
                } catch (error) {
                    // Ignore invalid messages
                }
            }
        });
    }
    
    async handleSignalingMessage(message) {
        try {
            switch (message.type) {
                case 'join-request':
                    if (this.isHost) {
                        await this.handleJoinRequest(message);
                    }
                    break;
                    
                case 'join-response':
                    if (!this.isHost) {
                        await this.handleJoinResponse(message);
                    }
                    break;
                    
                case 'ice-candidate':
                    if (this.localPeer) {
                        await this.localPeer.addIceCandidate(message.candidate);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling signaling message:', error);
        }
    }
    
    async handleJoinRequest(message) {
        // Host receives join request
        const answer = await this.localPeer.createAnswer(message.offer);
        await this.localPeer.setLocalDescription(answer);
        await this.localPeer.setRemoteDescription(message.offer);
        
        // Update players list
        const newPlayer = {
            id: `player-${Date.now()}`,
            name: message.playerName,
            isHost: false,
            isAI: false,
            connected: true
        };
        
        this.players.push(newPlayer);
        this.updateRoomDisplay();
        
        // Send response
        this.sendSignalingMessage({
            type: 'join-response',
            answer: answer,
            players: this.players,
            roomCode: this.roomCode
        });
        
        this.showMessage(`${message.playerName} joined the room`, 'success');
    }
    
    async handleJoinResponse(message) {
        // Player receives join response from host
        await this.localPeer.setRemoteDescription(message.answer);
        
        this.players = message.players;
        this.updateRoomDisplay();
        
        this.showMessage('Successfully joined the room!', 'success');
    }
    
    broadcastToAll(message) {
        this.dataChannels.forEach((channel, peerId) => {
            if (channel.readyState === 'open') {
                try {
                    channel.send(JSON.stringify(message));
                } catch (error) {
                    console.error(`Failed to send message to ${peerId}:`, error);
                }
            }
        });
    }
    
    handleNetworkMessage(message) {
        switch (message.type) {
            case 'room-update':
                this.players = message.players;
                this.aiCount = message.aiCount;
                this.aiDifficulty = message.aiDifficulty;
                this.updateRoomDisplay();
                break;
                
            case 'game-start':
                this.startNetworkGame(message.gameData);
                break;
                
            case 'game-action':
                this.handleGameAction(message.action);
                break;
                
            case 'game-state':
                this.updateGameState(message.gameState);
                break;
                
            case 'player-disconnected':
                this.handlePlayerDisconnected(message.playerId);
                break;
        }
    }
    
    startMultiplayerGame() {
        if (!this.isHost) return;
        
        const connectedPlayers = this.players.filter(p => p.connected || p.isAI);
        if (connectedPlayers.length < 2) {
            this.showMessage('Need at least 2 players to start', 'error');
            return;
        }
        
        // Initialize game with network players
        const gameData = {
            players: this.players,
            aiCount: this.aiCount,
            aiDifficulty: this.aiDifficulty
        };
        
        this.broadcastToAll({
            type: 'game-start',
            gameData: gameData
        });
        
        this.startNetworkGame(gameData);
    }
    
    startNetworkGame(gameData) {
        this.showScreen('game-screen');
        
        // Initialize the game with network players
        if (typeof game !== 'undefined') {
            game.setupNetworkGame(gameData.players, gameData.aiCount, gameData.aiDifficulty);
            gameUI.startNetworkGame(gameData.players, gameData.aiCount, gameData.aiDifficulty);
        }
        
        this.showMessage('Game started!', 'success');
    }
    
    handleGameAction(action) {
        // Handle game actions from other players
        if (typeof gameUI !== 'undefined') {
            gameUI.handleNetworkAction(action);
        }
    }
    
    updateGameState(gameState) {
        // Update local game state from network
        if (typeof game !== 'undefined') {
            game.updateFromNetwork(gameState);
            gameUI.renderGame();
        }
    }
    
    sendGameAction(action) {
        // Send game action to all players
        this.broadcastToAll({
            type: 'game-action',
            action: action,
            playerId: this.getMyPlayerId()
        });
    }
    
    sendGameState(gameState) {
        // Send complete game state (host only)
        if (this.isHost) {
            this.broadcastToAll({
                type: 'game-state',
                gameState: gameState
            });
        }
    }
    
    getMyPlayerId() {
        const myPlayer = this.players.find(p => p.name === this.playerName && !p.isAI);
        return myPlayer ? myPlayer.id : null;
    }
    
    handlePlayerDisconnected(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.connected = false;
            this.updateRoomDisplay();
            this.showMessage(`${player.name} disconnected`, 'error');
        }
    }
    
    leaveRoom() {
        // Clean up connections
        this.dataChannels.forEach(channel => {
            if (channel.readyState === 'open') {
                channel.close();
            }
        });
        this.dataChannels.clear();
        
        if (this.localPeer) {
            this.localPeer.close();
            this.localPeer = null;
        }
        
        // Notify others of disconnection
        if (this.roomCode) {
            this.broadcastToAll({
                type: 'player-disconnected',
                playerId: this.getMyPlayerId()
            });
        }
        
        // Clean up room data if host
        if (this.isHost && this.roomCode) {
            localStorage.removeItem(`room-${this.roomCode}`);
        }
        
        // Reset state
        this.isHost = false;
        this.roomCode = null;
        this.players = [];
        this.isConnected = false;
        
        this.showLobby();
    }
    
    endGame() {
        this.leaveRoom();
    }
    
    updateConnectionStatus(status) {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.textContent = status;
            statusEl.className = status.toLowerCase().replace(' ', '-');
        }
    }
    
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('game-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `game-message ${type}`;
            messageEl.classList.remove('hidden');
            
            setTimeout(() => {
                messageEl.classList.add('hidden');
            }, 3000);
        }
        
        // Also show in room messages if in room
        const roomMessages = document.getElementById('room-messages');
        if (roomMessages) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `room-message ${type}`;
            msgDiv.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
            roomMessages.appendChild(msgDiv);
            roomMessages.scrollTop = roomMessages.scrollHeight;
            
            // Keep only last 10 messages
            while (roomMessages.children.length > 10) {
                roomMessages.removeChild(roomMessages.firstChild);
            }
        }
    }
}

// Global multiplayer manager instance
let multiplayerManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.multiplayerManager = new MultiplayerManager();
    console.log('Multiplayer manager initialized');
});