import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { useChessGame } from './hooks/useChessGame';
import { ChessPiece, Position } from './models/types';
import { Chessboard } from './components/Chessboard';
import { PawnPromotionDialog } from './components/PawnPromotionDialog';
import { TimerConfig } from './components/TimerConfig';
import { ConfirmDialog } from './components/ConfirmDialog';
import { MultiplayerSetup } from './components/MultiplayerSetup';
import { useMultiplayer } from './hooks/useMultiplayer';
import { useState, useEffect } from 'react';

const AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #2f3542;
  color: #fff;
  font-family: Arial, sans-serif;
`;

const GameContainer = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background-color: #1e272e;
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

const BoardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Timer = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  padding: 0.5rem;
  background-color: #2d3436;
  border-radius: 0.5rem;
`;

const SidePanel = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MoveHistory = styled.div`
  flex: 1;
  background-color: #2d3436;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-y: auto;
  max-height: 400px;
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #e17055;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #d63031;
  }
`;

const GameStatus = styled.div`
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffeaa7;
`;

const ConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #2d3436;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

function App() {
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const { createGame, joinGame, sendMove, playerColor } = useMultiplayer((newGameId) => {
    setCurrentGameId(newGameId);
  });
  const {
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
    isGameStarted,
  } = useChessGame((move) => {
    if (currentGameId) {
      sendMove(currentGameId, move);
    }
  });

  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showGameEndDialog, setShowGameEndDialog] = useState(false);

  useEffect(() => {
    if (isGameStarted && (gameState.isCheckmate || gameState.isStalemate || gameState.whiteTime <= 0 || gameState.blackTime <= 0)) {
      setShowGameEndDialog(true);
    }
  }, [gameState.isCheckmate, gameState.isStalemate, gameState.whiteTime, gameState.blackTime, isGameStarted]);

  const getWinner = () => {
    if (gameState.whiteTime <= 0) return 'Black';
    if (gameState.blackTime <= 0) return 'White';
    if (gameState.isCheckmate) return gameState.currentPlayer === 'white' ? 'Black' : 'White';
    return null;
  };

  const getEndGameMessage = () => {
    if (gameState.isStalemate) return 'Game ended in Stalemate!';
    const winner = getWinner();
    if (winner) {
      const reason = gameState.isCheckmate ? 'Checkmate' : 'Time Out';
      return `${winner} wins by ${reason}!`;
    }
    return '';
  };

  const handleGameEndConfirm = () => {
    setShowGameEndDialog(false);
    resetGame();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResignClick = () => {
    setShowResignConfirm(true);
  };

  const handleConfirmResign = () => {
    resignGame();
    setShowResignConfirm(false);
  };

  const handleCancelResign = () => {
    setShowResignConfirm(false);
  };

  const handleCreateGame = () => {
    createGame();
    startGame();
  };

  const handleJoinGame = (gameId: string) => {
    joinGame(gameId);
    setCurrentGameId(gameId);
  };

  const canMove = () => {
    if (!playerColor) return false;
    return gameState.currentPlayer === playerColor;
  };

  const handlePieceSelect = (piece: ChessPiece | null) => {
    if (!canMove()) return;
    selectPiece(piece);
  };

  const handleSquareClick = (position: Position) => {
    if (!canMove()) return;
    if (pendingPromotion) return;
    
    if (selectedPiece && validMoves.some(move => 
      move.x === position.x && move.y === position.y
    )) {
      movePiece(position);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AppContainer>
        <GameContainer>
          <BoardSection>
            <Timer>Black: {formatTime(gameState.blackTime)}</Timer>
            <Chessboard
              pieces={gameState.pieces}
              selectedPiece={selectedPiece}
              validMoves={validMoves}
              onPieceSelect={handlePieceSelect}
              onSquareClick={handleSquareClick}
            />
            <Timer>White: {formatTime(gameState.whiteTime)}</Timer>
          </BoardSection>
          <SidePanel>
            {!isGameStarted ? (
              <ConfigSection>
                <TimerConfig onTimeChange={setGameTime} />
                <MultiplayerSetup 
                  onCreateGame={handleCreateGame}
                  onJoinGame={handleJoinGame}
                  currentGameId={currentGameId}
                />
              </ConfigSection>
            ) : (
              <>
                <GameStatus>
                  {gameState.isCheckmate && `${gameState.currentPlayer === 'white' ? 'Black' : 'White'} wins!`}
                  {gameState.isStalemate && 'Stalemate!'}
                  {gameState.isCheck && !gameState.isCheckmate && `${gameState.currentPlayer} is in check!`}
                  {!gameState.isCheck && !gameState.isCheckmate && !gameState.isStalemate && 
                    `${gameState.currentPlayer}'s turn`}
                </GameStatus>
                <MoveHistory>
                  <h2>Move History</h2>
                  {gameState.moveHistory.map((move, index) => (
                    <div key={index}>
                      {index + 1}. {move}
                    </div>
                  ))}
                </MoveHistory>
                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <Button onClick={handleResignClick}>Resign</Button>
                  <Button onClick={resetGame}>New Game</Button>
                </div>
              </>
            )}
          </SidePanel>
        </GameContainer>
        {pendingPromotion && selectedPiece && (
          <PawnPromotionDialog
            color={selectedPiece.color}
            onSelect={promotePawn}
          />
        )}
        {showResignConfirm && (
          <ConfirmDialog
            message="Are you sure you want to resign?"
            onConfirm={handleConfirmResign}
            onCancel={handleCancelResign}
          />
        )}
        {showGameEndDialog && (
          <ConfirmDialog
            message={getEndGameMessage()}
            onConfirm={handleGameEndConfirm}
            onCancel={handleGameEndConfirm}
            confirmText="Continue"
            showCancelButton={false}
          />
        )}
      </AppContainer>
    </DndProvider>
  );
}

export default App;
