import { useEffect, useCallback, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Move, PieceColor } from '../models/types';

const SOCKET_URL = 'http://localhost:3001';

interface GameCreatedEvent {
  gameId: string;
  color: PieceColor;
}

interface GameJoinedEvent {
  gameId: string;
  color: PieceColor;
  isSpectator: boolean;
}

export const useMultiplayer = (onGameUpdate?: (gameId: string) => void) => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<PieceColor | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    const onGameCreated = ({ gameId, color }: GameCreatedEvent) => {
      console.log(`Game created: ${gameId}, you are ${color}`);
      setGameId(gameId);
      setPlayerColor(color);
      if (onGameUpdate) onGameUpdate(gameId);
    };

    const onGameJoined = ({ gameId, color, isSpectator }: GameJoinedEvent) => {
      console.log(`Joined game: ${gameId} as ${isSpectator ? 'spectator' : color}`);
      setGameId(gameId);
      if (!isSpectator) {
        setPlayerColor(color);
        if (onGameUpdate) onGameUpdate(gameId);
      }
    };

    const onMoveMade = (move: Move) => {
      console.log('Move received:', move);
    };

    socketRef.current.on('gameCreated', onGameCreated);
    socketRef.current.on('gameJoined', onGameJoined);
    socketRef.current.on('moveMade', onMoveMade);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('gameCreated', onGameCreated);
        socketRef.current.off('gameJoined', onGameJoined);
        socketRef.current.off('moveMade', onMoveMade);
        socketRef.current.disconnect();
      }
    };
  }, [onGameUpdate]);

  const createGame = useCallback(() => {
    socketRef.current?.emit('createGame');
  }, []);

  const joinGame = useCallback((gameId: string) => {
    socketRef.current?.emit('joinGame', gameId);
  }, []);

  const sendMove = useCallback((gameId: string, move: Move) => {
    socketRef.current?.emit('move', { gameId, move });
  }, []);

  return {
    createGame,
    joinGame,
    sendMove,
    gameId,
    playerColor,
  };
}; 