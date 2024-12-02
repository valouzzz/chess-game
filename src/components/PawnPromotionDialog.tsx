import styled from 'styled-components';
import { PieceType, PieceColor } from '../models/types';
import { ChessPiece } from './ChessPieces';

const Dialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #2d3436;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const PieceButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 0.5rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PieceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`;

interface PawnPromotionDialogProps {
  color: PieceColor;
  onSelect: (type: PieceType) => void;
}

const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

export const PawnPromotionDialog: React.FC<PawnPromotionDialogProps> = ({
  color,
  onSelect,
}) => {
  return (
    <Dialog>
      <PieceGrid>
        {promotionPieces.map(type => (
          <PieceButton key={type} onClick={() => onSelect(type)}>
            <ChessPiece type={type} color={color} />
          </PieceButton>
        ))}
      </PieceGrid>
    </Dialog>
  );
}; 