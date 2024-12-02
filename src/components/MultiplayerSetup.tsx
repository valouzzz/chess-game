import styled from 'styled-components';
import { useState } from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #2d3436;
  border-radius: 0.5rem;
`;

const GameId = styled.div`
  padding: 0.5rem;
  background-color: #1a202c;
  border-radius: 0.5rem;
  color: #4299e1;
  font-family: monospace;
  text-align: center;
`;

interface MultiplayerSetupProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string) => void;
  currentGameId: string | null;
}

export const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({
  onCreateGame,
  onJoinGame,
  currentGameId,
}) => {
  const [gameId, setGameId] = useState('');

  return (
    <Container>
      {currentGameId ? (
        <GameId>Partagez cet ID avec votre adversaire : {currentGameId}</GameId>
      ) : (
        <button onClick={onCreateGame}>Create New Game</button>
      )}
      <div>
        <input
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="Enter Game ID"
        />
        <button onClick={() => onJoinGame(gameId)}>Join Game</button>
      </div>
    </Container>
  );
}; 