import { useState, useEffect, useCallback } from 'react';
import { ChessPiece, Position, PieceColor, Move, GameState, PieceType } from '../models/types';
import {
  initialBoardSetup,
  getValidMoves,
  isKingInCheck,
  isCheckmate,
  isStalemate,
  convertToAlgebraicNotation,
} from '../utils/gameLogic';

interface UseChessGame {
  gameState: GameState;
  selectedPiece: ChessPiece | null;
  validMoves: Position[];
  selectPiece: (piece: ChessPiece | null) => void;
  movePiece: (to: Position) => void;
  resetGame: () => void;
  resignGame: () => void;
  promotePawn: (type: PieceType) => void;
  pendingPromotion: Position | null;
  setGameTime: (minutes: number) => void;
  startGame: () => void;
  isGameStarted: boolean;
}

export const useChessGame = (onMove?: (move: Move) => void) => {
  const [initialTime, setInitialTime] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => ({
    pieces: initialBoardSetup(),
    currentPlayer: 'white',
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    moveHistory: [],
    whiteTime: 0,
    blackTime: 0,
  }));

  const [gameStarted, setGameStarted] = useState(false);

  const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<Move | undefined>(undefined);
  const [pendingPromotion, setPendingPromotion] = useState<Position | null>(null);
  const [configuredTime, setConfiguredTime] = useState(10 * 60); // 10 minutes par défaut

  const setGameTime = useCallback((minutes: number) => {
    setConfiguredTime(minutes * 60);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setInitialTime(configuredTime);
    setGameState({
      pieces: initialBoardSetup(),
      currentPlayer: 'white',
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      moveHistory: [],
      whiteTime: configuredTime,
      blackTime: configuredTime,
    });
  }, [configuredTime]);

  // Modify timer effect to only start when initialTime is set
  useEffect(() => {
    if (!initialTime || gameState.isCheckmate || gameState.isStalemate) return;

    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        whiteTime: prev.currentPlayer === 'white' ? prev.whiteTime - 1 : prev.whiteTime,
        blackTime: prev.currentPlayer === 'black' ? prev.blackTime - 1 : prev.blackTime,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.currentPlayer, gameState.isCheckmate, gameState.isStalemate, initialTime]);

  const selectPiece = useCallback((piece: ChessPiece | null) => {
    if (!gameStarted || !piece || piece.color !== gameState.currentPlayer || pendingPromotion) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    setSelectedPiece(piece);
    setValidMoves(getValidMoves(piece, gameState.pieces, lastMove));
  }, [gameState.currentPlayer, gameState.pieces, lastMove, pendingPromotion, gameStarted]);

  const handleCastling = useCallback((
    king: ChessPiece,
    to: Position,
    pieces: ChessPiece[]
  ): ChessPiece[] => {
    const isCastling = king.type === 'king' && Math.abs(to.x - king.position.x) === 2;
    if (!isCastling) return pieces;

    const isKingside = to.x > king.position.x;
    const rookX = isKingside ? 7 : 0;
    const newRookX = isKingside ? to.x - 1 : to.x + 1;

    return pieces.map(piece => {
      if (piece === king) {
        return { ...piece, position: to, hasMoved: true };
      }
      if (piece.type === 'rook' && 
          piece.color === king.color && 
          piece.position.x === rookX && 
          piece.position.y === king.position.y) {
        return {
          ...piece,
          position: { x: newRookX, y: king.position.y },
          hasMoved: true
        };
      }
      return piece;
    });
  }, []);

  const movePiece = useCallback((to: Position) => {
    if (!gameStarted || !selectedPiece || pendingPromotion) return;

    const isValidMove = validMoves.some(move => move.x === to.x && move.y === to.y);
    if (!isValidMove) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    // Check for pawn promotion
    if (selectedPiece.type === 'pawn' && 
        ((selectedPiece.color === 'white' && to.y === 7) ||
         (selectedPiece.color === 'black' && to.y === 0))) {
      setPendingPromotion(to);
      return;
    }

    let newPieces = gameState.pieces.map(piece => {
      if (piece === selectedPiece) {
        return { ...piece, position: to, hasMoved: true };
      }
      // Remove captured piece
      if (piece.position.x === to.x && piece.position.y === to.y) {
        return null;
      }
      return piece;
    }).filter(Boolean) as ChessPiece[];

    // Handle castling
    newPieces = handleCastling(selectedPiece, to, newPieces);

    const move: Move = {
      from: selectedPiece.position,
      to,
      piece: selectedPiece,
    };

    const moveNotation = convertToAlgebraicNotation(
      selectedPiece.position,
      to,
      selectedPiece,
      gameState.pieces
    );

    const nextPlayer: PieceColor = gameState.currentPlayer === 'white' ? 'black' : 'white';
    const isInCheck = isKingInCheck(nextPlayer, newPieces);
    const isInCheckmate = isCheckmate(nextPlayer, newPieces);
    const isInStalemate = isStalemate(nextPlayer, newPieces);

    setGameState(prev => ({
      ...prev,
      pieces: newPieces,
      currentPlayer: nextPlayer,
      isCheck: isInCheck,
      isCheckmate: isInCheckmate,
      isStalemate: isInStalemate,
      moveHistory: [...prev.moveHistory, moveNotation],
    }));

    setLastMove(move);
    setSelectedPiece(null);
    setValidMoves([]);

    if (onMove) {
      onMove({
        from: selectedPiece.position,
        to,
        piece: selectedPiece
      });
    }
  }, [selectedPiece, validMoves, gameState, handleCastling, pendingPromotion, gameStarted, onMove]);

  const promotePawn = useCallback((type: PieceType) => {
    if (!selectedPiece || !pendingPromotion) return;

    const newPieces = gameState.pieces.map(piece => {
      if (piece === selectedPiece) {
        return {
          ...piece,
          type,
          position: pendingPromotion,
          hasMoved: true
        };
      }
      // Remove captured piece
      if (piece.position.x === pendingPromotion.x && 
          piece.position.y === pendingPromotion.y) {
        return null;
      }
      return piece;
    }).filter(Boolean) as ChessPiece[];

    const moveNotation = `${convertToAlgebraicNotation(
      selectedPiece.position,
      pendingPromotion,
      selectedPiece,
      gameState.pieces
    )}=${type.toUpperCase()}`;

    const nextPlayer: PieceColor = gameState.currentPlayer === 'white' ? 'black' : 'white';
    const isInCheck = isKingInCheck(nextPlayer, newPieces);
    const isInCheckmate = isCheckmate(nextPlayer, newPieces);
    const isInStalemate = isStalemate(nextPlayer, newPieces);

    setGameState(prev => ({
      ...prev,
      pieces: newPieces,
      currentPlayer: nextPlayer,
      isCheck: isInCheck,
      isCheckmate: isInCheckmate,
      isStalemate: isInStalemate,
      moveHistory: [...prev.moveHistory, moveNotation],
    }));

    setPendingPromotion(null);
    setSelectedPiece(null);
    setValidMoves([]);
  }, [selectedPiece, pendingPromotion, gameState]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setInitialTime(null);
    setGameState({
      pieces: initialBoardSetup(),
      currentPlayer: 'white',
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      moveHistory: [],
      whiteTime: 0,
      blackTime: 0,
    });
    setSelectedPiece(null);
    setValidMoves([]);
    setLastMove(undefined);
  }, []);

  const resignGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isCheckmate: true,
      currentPlayer: prev.currentPlayer === 'white' ? 'black' : 'white'
    }));
  }, []);

  // Effet pour détecter la fin de partie par temps écoulé
  useEffect(() => {
    if (!initialTime || !gameStarted) return;
    
    if (gameState.whiteTime <= 0 || gameState.blackTime <= 0) {
      setGameState(prev => ({
        ...prev,
        isCheckmate: true,
        currentPlayer: prev.whiteTime <= 0 ? 'white' : 'black'
      }));
    }
  }, [gameState.whiteTime, gameState.blackTime, initialTime, gameStarted]);

  return {
    gameState,
    selectedPiece,
    validMoves,
    selectPiece,
    movePiece,
    resetGame,
    resignGame,
    promotePawn,
    pendingPromotion,
    setGameTime,
    startGame,
    isGameStarted: gameStarted,
  };
}; 