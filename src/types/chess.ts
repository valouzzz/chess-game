export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Position {
  x: number;
  y: number;
}

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: Position;
} 