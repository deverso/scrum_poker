const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Armazenar salas e participantes (em memória)
const rooms = new Map();

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gerenciamento de conexões Socket.io
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Criar ou entrar em uma sala
  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        participants: new Map(),
        votes: new Map(),
        revealed: false,
        currentStory: null
      });
    }

    const room = rooms.get(roomId);
    room.participants.set(socket.id, {
      id: socket.id,
      name: userName,
      vote: null
    });

    // Notificar todos na sala sobre o novo participante
    io.to(roomId).emit('room-updated', {
      participants: Array.from(room.participants.values()),
      votes: room.revealed ? Array.from(room.votes.entries()) : null,
      revealed: room.revealed,
      currentStory: room.currentStory
    });

    console.log(`${userName} entrou na sala ${roomId}`);
  });

  // Votar
  socket.on('vote', ({ roomId, vote }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    participant.vote = vote;
    room.votes.set(socket.id, vote);

    // Notificar todos na sala sobre a atualização
    io.to(roomId).emit('vote-received', {
      participantId: socket.id,
      participantName: participant.name,
      hasVoted: true
    });

    // Verificar se todos votaram
    const allVoted = Array.from(room.participants.values()).every(p => p.vote !== null);
    if (allVoted && room.participants.size > 0) {
      io.to(roomId).emit('all-voted');
    }
  });

  // Revelar votos
  socket.on('reveal-votes', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.revealed = true;
    const votesArray = Array.from(room.votes.entries()).map(([id, vote]) => {
      const participant = room.participants.get(id);
      return {
        participantId: id,
        participantName: participant ? participant.name : 'Desconhecido',
        vote: vote
      };
    });

    io.to(roomId).emit('votes-revealed', {
      votes: votesArray,
      revealed: true
    });
  });

  // Resetar votação
  socket.on('reset-votes', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.votes.clear();
    room.revealed = false;
    room.participants.forEach(participant => {
      participant.vote = null;
    });

    io.to(roomId).emit('votes-reset', {
      participants: Array.from(room.participants.values()),
      revealed: false
    });
  });

  // Definir história atual
  socket.on('set-story', ({ roomId, story }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.currentStory = story;
    io.to(roomId).emit('story-updated', { story });
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
    
    // Remover participante de todas as salas
    rooms.forEach((room, roomId) => {
      if (room.participants.has(socket.id)) {
        room.participants.delete(socket.id);
        room.votes.delete(socket.id);
        
        // Se a sala ficou vazia, removê-la
        if (room.participants.size === 0) {
          rooms.delete(roomId);
        } else {
          // Notificar os outros participantes
          io.to(roomId).emit('room-updated', {
            participants: Array.from(room.participants.values()),
            votes: room.revealed ? Array.from(room.votes.entries()) : null,
            revealed: room.revealed,
            currentStory: room.currentStory
          });
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

