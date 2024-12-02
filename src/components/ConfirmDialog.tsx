import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background-color: #2d3436;
  padding: 2rem;
  border-radius: 1rem;
  width: 300px;
  text-align: center;
`;

const Message = styled.p`
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'confirm' | 'cancel' }>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: ${props => props.variant === 'confirm' ? '#e17055' : '#636e72'};
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.variant === 'confirm' ? '#d63031' : '#4a5568'};
  }
`;

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  showCancelButton?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  showCancelButton = true,
}) => {
  return (
    <Overlay>
      <Dialog>
        <Message>{message}</Message>
        <ButtonGroup>
          <Button variant="confirm" onClick={onConfirm}>
            {confirmText}
          </Button>
          {showCancelButton && (
            <Button variant="cancel" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </ButtonGroup>
      </Dialog>
    </Overlay>
  );
}; 