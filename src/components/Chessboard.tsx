import styled from 'styled-components';
import { ChessPiece as ChessPieceComponent } from './ChessPieces';
import { ChessPiece, Position } from '../models/types';

const BoardContainer = styled.div`
  width: 560px;
  height: 560px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  border: 2px solid #34495e;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

interface SquareProps {
  isLight: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
}

const Coordinates = styled.div<{ $isLight: boolean }>`
  position: absolute;
  font-size: 0.8rem;
  color: ${props => props.$isLight ? '#b58863' : '#f0d9b5'};
  opacity: 0.8;
`;

const FileCoordinate = styled(Coordinates)`
  bottom: 2px;
  right: 2px;
`;

const RankCoordinate = styled(Coordinates)`
  top: 2px;
  left: 2px;
`;

interface ChessboardProps {
  pieces: ChessPiece[];
  selectedPiece: ChessPiece | null;
  validMoves: Position[];
  onPieceSelect: (piece: ChessPiece | null) => void;
  onSquareClick: (position: Position) => void;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  pieces,
  selectedPiece,
  validMoves,
  onPieceSelect,
  onSquareClick,
}) => {
  const ChessSquare: React.FC<{
    x: number;
    y: number;
    piece: ChessPiece | null;
    isLight: boolean;
    isValidMove: boolean;
    isSelected: boolean;
  }> = ({ x, y, piece, isLight, isValidMove, isSelected }) => {
    return (
      <StyledSquare
        isLight={isLight}
        isHighlighted={isValidMove}
        isSelected={isSelected}
        onClick={() => {
          if (isValidMove) {
            onSquareClick({ x, y: 7 - y });
          } else if (piece) {
            onPieceSelect(piece);
          }
        }}
      >
        {piece && (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            cursor: 'pointer'
          }}>
            <ChessPieceComponent
              type={piece.type}
              color={piece.color}
            />
          </div>
        )}
        {y === 0 && <FileCoordinate $isLight={isLight}>{['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][x]}</FileCoordinate>}
        {x === 0 && <RankCoordinate $isLight={isLight}>{8 - y}</RankCoordinate>}
      </StyledSquare>
    );
  };

  return (
    <BoardContainer>
      {Array.from({ length: 8 }, (_, y) =>
        Array.from({ length: 8 }, (_, x) => {
          const piece = pieces.find(p => p.position.x === x && p.position.y === 7 - y);
          const isValidMove = validMoves.some(move => move.x === x && move.y === 7 - y);
          const isSelected = selectedPiece?.position.x === x && selectedPiece?.position.y === 7 - y;

          return (
            <ChessSquare
              key={`${x}-${y}`}
              x={x}
              y={y}
              piece={piece || null}
              isLight={(x + y) % 2 === 0}
              isValidMove={isValidMove}
              isSelected={isSelected}
            />
          );
        })
      )}
    </BoardContainer>
  );
};

const StyledSquare = styled.div<SquareProps>`
  width: 70px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: ${props => props.isLight ? '#f0d9b5' : '#b58863'};
  ${props => props.isHighlighted && `
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: rgba(106, 190, 89, 0.5);
      z-index: 1;
      transition: background-color 0.2s ease;
    }
  `}
  ${props => props.isSelected && `
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 0, 0.5);
      z-index: 1;
    }
  `}
  &:hover {
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.1);
      z-index: 1;
    }
  }
`; 