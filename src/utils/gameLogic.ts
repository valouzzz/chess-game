import { ChessPiece, Position, PieceType, PieceColor, Move } from '../models/types';

export const initialBoardSetup = (): ChessPiece[] => {
  const pieces: ChessPiece[] = [];

  // Helper function to add pieces
  const addPiece = (type: PieceType, color: PieceColor, x: number, y: number) => {
    pieces.push({ type, color, position: { x, y }, hasMoved: false });
  };

  // Add pawns
  for (let x = 0; x < 8; x++) {
    addPiece('pawn', 'white', x, 1);
    addPiece('pawn', 'black', x, 6);
  }

  // Add other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  pieceOrder.forEach((type, x) => {
    addPiece(type, 'white', x, 0);
    addPiece(type, 'black', x, 7);
  });

  return pieces;
};

export const isSquareUnderAttack = (
  position: Position,
  attackingColor: PieceColor,
  pieces: ChessPiece[]
): boolean => {
  return pieces
    .filter(piece => piece.color === attackingColor)
    .some(piece => {
      const moves = getValidMoves(piece, pieces, undefined, true);
      return moves.some(move => move.x === position.x && move.y === position.y);
    });
};

export const canCastle = (
  king: ChessPiece,
  rook: ChessPiece,
  pieces: ChessPiece[]
): boolean => {
  if (king.hasMoved || rook.hasMoved) return false;
  
  const y = king.position.y;
  const direction = rook.position.x > king.position.x ? 1 : -1;
  const enemyColor = king.color === 'white' ? 'black' : 'white';

  // Check if squares between king and rook are empty
  const startX = Math.min(king.position.x, rook.position.x) + 1;
  const endX = Math.max(king.position.x, rook.position.x);
  
  for (let x = startX; x < endX; x++) {
    if (pieces.some(p => p.position.x === x && p.position.y === y)) {
      return false;
    }
  }

  // Check if king's path is safe
  const kingPath = [
    king.position,
    { x: king.position.x + direction, y },
    { x: king.position.x + 2 * direction, y }
  ];

  return !kingPath.some(pos => isSquareUnderAttack(pos, enemyColor, pieces));
};

export const getValidMoves = (
  piece: ChessPiece,
  allPieces: ChessPiece[],
  lastMove?: Move,
  skipKingCheck: boolean = false
): Position[] => {
  const moves: Position[] = [];
  const { x, y } = piece.position;

  const isPositionValid = (pos: Position): boolean => {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  };

  const isPositionOccupied = (pos: Position): boolean => {
    return allPieces.some(p => p.position.x === pos.x && p.position.y === pos.y);
  };

  const isPositionOccupiedByOpponent = (pos: Position): boolean => {
    const occupyingPiece = allPieces.find(
      p => p.position.x === pos.x && p.position.y === pos.y
    );
    return occupyingPiece ? occupyingPiece.color !== piece.color : false;
  };

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? 1 : -1;
      const startRank = piece.color === 'white' ? 1 : 6;

      // Forward move
      const oneForward = { x, y: y + direction };
      if (isPositionValid(oneForward) && !isPositionOccupied(oneForward)) {
        moves.push(oneForward);

        // Initial two-square move
        if (y === startRank) {
          const twoForward = { x, y: y + 2 * direction };
          if (!isPositionOccupied(twoForward)) {
            moves.push(twoForward);
          }
        }
      }

      // Captures
      const captures = [{ x: x - 1, y: y + direction }, { x: x + 1, y: y + direction }];
      captures.forEach(pos => {
        if (isPositionValid(pos) && isPositionOccupiedByOpponent(pos)) {
          moves.push(pos);
        }
      });

      // En passant
      if (lastMove && lastMove.piece.type === 'pawn' &&
          Math.abs(lastMove.from.y - lastMove.to.y) === 2 &&
          lastMove.to.y === y &&
          Math.abs(lastMove.to.x - x) === 1) {
        moves.push({ x: lastMove.to.x, y: y + direction });
      }
      break;
    }

    case 'knight': {
      const knightMoves = [
        { x: x + 2, y: y + 1 }, { x: x + 2, y: y - 1 },
        { x: x - 2, y: y + 1 }, { x: x - 2, y: y - 1 },
        { x: x + 1, y: y + 2 }, { x: x + 1, y: y - 2 },
        { x: x - 1, y: y + 2 }, { x: x - 1, y: y - 2 }
      ];

      knightMoves.forEach(pos => {
        if (isPositionValid(pos) && 
            (!isPositionOccupied(pos) || isPositionOccupiedByOpponent(pos))) {
          moves.push(pos);
        }
      });
      break;
    }

    case 'bishop': {
      const directions = [
        { x: 1, y: 1 }, { x: 1, y: -1 },
        { x: -1, y: 1 }, { x: -1, y: -1 }
      ];

      directions.forEach(dir => {
        let newX = x + dir.x;
        let newY = y + dir.y;

        while (isPositionValid({ x: newX, y: newY })) {
          const pos = { x: newX, y: newY };
          if (!isPositionOccupied(pos)) {
            moves.push(pos);
          } else {
            if (isPositionOccupiedByOpponent(pos)) {
              moves.push(pos);
            }
            break;
          }
          newX += dir.x;
          newY += dir.y;
        }
      });
      break;
    }

    case 'rook': {
      const directions = [
        { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 0 }, { x: -1, y: 0 }
      ];

      directions.forEach(dir => {
        let newX = x + dir.x;
        let newY = y + dir.y;

        while (isPositionValid({ x: newX, y: newY })) {
          const pos = { x: newX, y: newY };
          if (!isPositionOccupied(pos)) {
            moves.push(pos);
          } else {
            if (isPositionOccupiedByOpponent(pos)) {
              moves.push(pos);
            }
            break;
          }
          newX += dir.x;
          newY += dir.y;
        }
      });
      break;
    }

    case 'queen': {
      const directions = [
        { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 1, y: 1 }, { x: 1, y: -1 },
        { x: -1, y: 1 }, { x: -1, y: -1 }
      ];

      directions.forEach(dir => {
        let newX = x + dir.x;
        let newY = y + dir.y;

        while (isPositionValid({ x: newX, y: newY })) {
          const pos = { x: newX, y: newY };
          if (!isPositionOccupied(pos)) {
            moves.push(pos);
          } else {
            if (isPositionOccupiedByOpponent(pos)) {
              moves.push(pos);
            }
            break;
          }
          newX += dir.x;
          newY += dir.y;
        }
      });
      break;
    }

    case 'king': {
      const kingMoves = [
        { x: x + 1, y }, { x: x - 1, y },
        { x, y: y + 1 }, { x, y: y - 1 },
        { x: x + 1, y: y + 1 }, { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 }, { x: x - 1, y: y - 1 }
      ];

      kingMoves.forEach(pos => {
        if (isPositionValid(pos) && 
            (!isPositionOccupied(pos) || isPositionOccupiedByOpponent(pos))) {
          moves.push(pos);
        }
      });

      // Castling
      if (!piece.hasMoved && !skipKingCheck) {
        // Kingside castling
        const kingsideRook = allPieces.find(
          p => p.type === 'rook' && p.color === piece.color && 
          p.position.x === 7 && p.position.y === y && !p.hasMoved
        );
        if (kingsideRook && canCastle(piece, kingsideRook, allPieces)) {
          moves.push({ x: x + 2, y });
        }

        // Queenside castling
        const queensideRook = allPieces.find(
          p => p.type === 'rook' && p.color === piece.color && 
          p.position.x === 0 && p.position.y === y && !p.hasMoved
        );
        if (queensideRook && canCastle(piece, queensideRook, allPieces)) {
          moves.push({ x: x - 2, y });
        }
      }
      break;
    }
  }

  // Filter moves that would put the king in check
  if (!skipKingCheck) {
    return moves.filter(move => {
      const newPieces = allPieces.map(p => {
        if (p === piece) {
          return { ...p, position: move };
        }
        if (p.position.x === move.x && p.position.y === move.y) {
          return null; // Captured piece
        }
        return p;
      }).filter(Boolean) as ChessPiece[];

      const king = newPieces.find(
        p => p.type === 'king' && p.color === piece.color
      )!;
      return !isSquareUnderAttack(
        king.position,
        piece.color === 'white' ? 'black' : 'white',
        newPieces
      );
    });
  }

  return moves;
};

export const isKingInCheck = (
  kingColor: PieceColor,
  pieces: ChessPiece[]
): boolean => {
  const king = pieces.find(p => p.type === 'king' && p.color === kingColor);
  if (!king) return false;

  return pieces.some(piece => {
    if (piece.color === kingColor) return false;
    const validMoves = getValidMoves(piece, pieces);
    return validMoves.some(move => 
      move.x === king.position.x && move.y === king.position.y
    );
  });
};

export const isCheckmate = (
  kingColor: PieceColor,
  pieces: ChessPiece[]
): boolean => {
  if (!isKingInCheck(kingColor, pieces)) return false;

  return pieces
    .filter(piece => piece.color === kingColor)
    .every(piece => getValidMoves(piece, pieces).length === 0);
};

export const isStalemate = (
  currentPlayer: PieceColor,
  pieces: ChessPiece[]
): boolean => {
  if (isKingInCheck(currentPlayer, pieces)) return false;

  return pieces
    .filter(piece => piece.color === currentPlayer)
    .every(piece => getValidMoves(piece, pieces).length === 0);
};

export const convertToAlgebraicNotation = (
  from: Position,
  to: Position,
  piece: ChessPiece,
  pieces: ChessPiece[]
): string => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const pieceSymbols: Record<PieceType, string> = {
    king: 'K',
    queen: 'Q',
    rook: 'R',
    bishop: 'B',
    knight: 'N',
    pawn: ''
  };

  const fromSquare = `${files[from.x]}${from.y + 1}`;
  const toSquare = `${files[to.x]}${to.y + 1}`;
  const pieceSymbol = pieceSymbols[piece.type];
  const capturedPiece = pieces.find(p => 
    p.position.x === to.x && p.position.y === to.y && p.color !== piece.color
  );

  return `${pieceSymbol}${fromSquare}${capturedPiece ? 'x' : '-'}${toSquare}`;
}; 