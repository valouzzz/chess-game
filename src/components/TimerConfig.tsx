import { useState } from 'react';
import styled from 'styled-components';

const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #2d3436;
  border-radius: 0.5rem;
`;

const Title = styled.h2`
  color: #fff;
  margin: 0;
  font-size: 1.2rem;
`;

const TimeInput = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #4a5568;
  border-radius: 0.5rem;
  background-color: #1a202c;
  color: #fff;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

interface TimerConfigProps {
  onTimeChange: (minutes: number) => void;
}

export const TimerConfig: React.FC<TimerConfigProps> = ({ onTimeChange }) => {
  const [minutes, setMinutes] = useState(10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = Math.max(1, Math.min(60, parseInt(e.target.value) || 1));
    setMinutes(newMinutes);
    onTimeChange(newMinutes);
  };

  return (
    <ConfigContainer>
      <Title>Set Timer</Title>
      <TimeInput
        type="number"
        min="1"
        max="60"
        value={minutes}
        onChange={handleChange}
        placeholder="Minutes per player"
      />
    </ConfigContainer>
  );
}; 