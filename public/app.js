// Conectar ao servidor Socket.io
const socket = io();

// Estado da aplicação
let currentRoomId = null;
let currentUserName = null;
let myVote = null;
let participants = [];
let votesRevealed = false;

// Cartas do Fibonacci
const cards = ['1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

// Elementos DOM
const entryScreen = document.getElementById('entry-screen');
const gameScreen = document.getElementById('game-screen');
const userNameInput = document.getElementById('user-name');
const roomIdInput = document.getElementById('room-id');
const joinBtn = document.getElementById('join-btn');
const createBtn = document.getElementById('create-btn');
const leaveBtn = document.getElementById('leave-btn');
const currentRoomIdDisplay = document.getElementById('current-room-id');
const currentUserNameDisplay = document.getElementById('current-user-name');
const cardsContainer = document.getElementById('cards-container');
const voteStatus = document.getElementById('vote-status');
const participantsList = document.getElementById('participants-list');
const participantsCount = document.getElementById('participants-count');
const revealBtn = document.getElementById('reveal-btn');
const resetBtn = document.getElementById('reset-btn');
const resultsSection = document.getElementById('results-section');
const resultsDisplay = document.getElementById('results-display');
const storyDisplay = document.getElementById('story-display');
const storyInput = document.getElementById('story-input');
const setStoryBtn = document.getElementById('set-story-btn');

// Criar cartas
function createCards() {
    cardsContainer.innerHTML = '';
    cards.forEach(cardValue => {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = cardValue;
        card.addEventListener('click', () => selectCard(cardValue, card));
        cardsContainer.appendChild(card);
    });
}

// Selecionar carta
function selectCard(value, cardElement) {
    if (votesRevealed) return;
    
    // Remover seleção anterior
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    
    // Selecionar nova carta
    cardElement.classList.add('selected');
    myVote = value;
    
    // Enviar voto
    socket.emit('vote', { roomId: currentRoomId, vote: value });
    
    voteStatus.textContent = `Você votou: ${value}`;
    voteStatus.style.display = 'block';
}

// Entrar na sala
function joinRoom(roomId, userName) {
    if (!userName.trim()) {
        alert('Por favor, digite seu nome!');
        return;
    }
    
    if (!roomId.trim()) {
        alert('Por favor, digite o ID da sala!');
        return;
    }
    
    currentRoomId = roomId;
    currentUserName = userName;
    
    socket.emit('join-room', { roomId, userName });
    
    entryScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    currentRoomIdDisplay.textContent = roomId;
    currentUserNameDisplay.textContent = userName;
    
    createCards();
}

// Criar nova sala
function createRoom(userName) {
    if (!userName.trim()) {
        alert('Por favor, digite seu nome!');
        return;
    }
    
    const roomId = 'SALA-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    joinRoom(roomId, userName);
    roomIdInput.value = roomId;
}

// Event listeners
joinBtn.addEventListener('click', () => {
    joinRoom(roomIdInput.value.trim(), userNameInput.value.trim());
});

createBtn.addEventListener('click', () => {
    createRoom(userNameInput.value.trim());
});

// Permitir Enter nos inputs
userNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        roomIdInput.focus();
    }
});

roomIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinBtn.click();
    }
});

leaveBtn.addEventListener('click', () => {
    socket.disconnect();
    socket.connect();
    entryScreen.classList.add('active');
    gameScreen.classList.remove('active');
    currentRoomId = null;
    currentUserName = null;
    myVote = null;
    participants = [];
    votesRevealed = false;
    roomIdInput.value = '';
    userNameInput.value = '';
    voteStatus.style.display = 'none';
    resultsSection.classList.add('hidden');
});

revealBtn.addEventListener('click', () => {
    socket.emit('reveal-votes', { roomId: currentRoomId });
});

resetBtn.addEventListener('click', () => {
    socket.emit('reset-votes', { roomId: currentRoomId });
});

setStoryBtn.addEventListener('click', () => {
    const story = storyInput.value.trim();
    if (story) {
        socket.emit('set-story', { roomId: currentRoomId, story });
        storyInput.value = '';
    }
});

storyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setStoryBtn.click();
    }
});

// Atualizar lista de participantes
function updateParticipants(participantsList) {
    participants = participantsList;
    participantsCount.textContent = participants.length;
    
    const listHtml = participants.map(p => {
        const hasVoted = p.vote !== null;
        return `
            <div class="participant ${hasVoted ? 'voted' : ''}">
                <span class="participant-name">${p.name}</span>
                <span class="participant-status ${hasVoted ? 'voted' : ''}">
                    ${hasVoted ? '✓ Votou' : 'Aguardando...'}
                </span>
            </div>
        `;
    }).join('');
    
    participantsList.innerHTML = listHtml;
}

// Mostrar resultados
function showResults(votes) {
    votesRevealed = true;
    resultsSection.classList.remove('hidden');
    
    const resultsHtml = votes.map(v => `
        <div class="result-item">
            <div class="result-name">${v.participantName}</div>
            <div class="result-vote">${v.vote}</div>
        </div>
    `).join('');
    
    resultsDisplay.innerHTML = resultsHtml;
    
    // Desabilitar cartas
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0.5';
        card.style.cursor = 'not-allowed';
    });
    
    revealBtn.disabled = true;
    resetBtn.disabled = false;
}

// Eventos Socket.io
socket.on('room-updated', (data) => {
    updateParticipants(data.participants);
    
    if (data.revealed && data.votes) {
        const votesArray = data.votes.map(([id, vote]) => {
            const participant = data.participants.find(p => p.id === id);
            return {
                participantId: id,
                participantName: participant ? participant.name : 'Desconhecido',
                vote: vote
            };
        });
        showResults(votesArray);
    } else {
        votesRevealed = false;
        resultsSection.classList.add('hidden');
        revealBtn.disabled = false;
        resetBtn.disabled = true;
        
        // Reabilitar cartas
        document.querySelectorAll('.card').forEach(card => {
            card.style.opacity = '1';
            card.style.cursor = 'pointer';
        });
    }
    
    if (data.currentStory) {
        storyDisplay.innerHTML = `<p><strong>${data.currentStory}</strong></p>`;
    }
    
    // Verificar se todos votaram
    const allVoted = participants.every(p => p.vote !== null) && participants.length > 0;
    if (allVoted && !votesRevealed) {
        revealBtn.disabled = false;
    }
});

socket.on('vote-received', (data) => {
    // Atualizar status visual se necessário
    updateParticipants(participants);
});

socket.on('all-voted', () => {
    revealBtn.disabled = false;
    voteStatus.textContent = 'Todos votaram! Clique em "Revelar Votos" para ver os resultados.';
});

socket.on('votes-revealed', (data) => {
    showResults(data.votes);
});

socket.on('votes-reset', (data) => {
    votesRevealed = false;
    myVote = null;
    updateParticipants(data.participants);
    resultsSection.classList.add('hidden');
    voteStatus.style.display = 'none';
    revealBtn.disabled = true;
    resetBtn.disabled = true;
    
    // Limpar seleção de cartas
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    
    // Reabilitar cartas
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '1';
        card.style.cursor = 'pointer';
    });
});

socket.on('story-updated', (data) => {
    storyDisplay.innerHTML = `<p><strong>${data.story}</strong></p>`;
});

// Inicializar
createCards();

