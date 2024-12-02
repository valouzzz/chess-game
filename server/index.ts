import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://your-repl-name.replit.app"],
    methods: ["GET", "POST"]
  }
});

interface GameRoom {
  white?: string;
  black?: string;
  spectators: string[];
  gameState: any;
}

const games = new Map<string, GameRoom>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', () => {
    const gameId = Math.random().toString(36).substring(7);
    games.set(gameId, {
      white: socket.id,
      spectators: [],
      gameState: null
    });
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, color: 'white' });
  });

  socket.on('joinGame', (gameId: string) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }

    if (!game.black) {
      game.black = socket.id;
      socket.join(gameId);
      socket.emit('gameJoined', { gameId, color: 'black' });
      io.to(gameId).emit('gameStarted', { white: game.white, black: game.black });
    } else {
      game.spectators.push(socket.id);
      socket.join(gameId);
      socket.emit('gameJoined', { gameId, isSpectator: true });
    }
  });

  socket.on('move', ({ gameId, move }) => {
    io.to(gameId).emit('moveMade', move);
  });

  socket.on('disconnect', () => {
    // Gérer la déconnexion et nettoyer les rooms
    games.forEach((game, gameId) => {
      if (game.white === socket.id || game.black === socket.id) {
        io.to(gameId).emit('playerDisconnected');
        games.delete(gameId);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});

// Ajoutez ces logs pour le débogage
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // ... reste du code ...
}); 