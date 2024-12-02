import styled from 'styled-components';
import { PieceType, PieceColor } from '../models/types';
import { ChessPiece } from './ChessPieces';

const DragLayer = styled.div<{ $left: number; $top: number }>`
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  left: ${props => props.$left}px;
  top: ${props => props.$top}px;
  width: 70px;
  height: 70px;
  transform: translate(-50%, -50%);
  transition: transform 0.1s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

interface DragPreviewProps {
  type: PieceType;
  color: PieceColor;
  currentOffset: { x: number; y: number } | null;
}

export const DragPreview: React.FC<DragPreviewProps> = ({
  type,
  color,
  currentOffset,
}) => {
  if (!currentOffset) {
    return null;
  }

  return (
    <DragLayer $left={currentOffset.x} $top={currentOffset.y}>
      <ChessPiece type={type} color={color} isDragging={true} />
    </DragLayer>
  );
}; 