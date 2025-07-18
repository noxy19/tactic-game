import React from 'react';

interface Position {
  x: number;
  y: number;
}

interface BoardProps {
  size: number;
  playerPositions: Record<string, Position>;
  isYourTurn: boolean;
  selfId: string;
  highlightCells?: Set<string>; // keys like "x-y"
  onCellClick?: (x: number, y: number) => void;
}

export default function Board({ size, playerPositions, isYourTurn, selfId, onCellClick, highlightCells }: BoardProps) {
  const cells: JSX.Element[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const occupantId = Object.keys(playerPositions).find((id) => {
        const pos = playerPositions[id];
        return pos.x === x && pos.y === y;
      });
      const key = `${x}-${y}`;
      const inRange = highlightCells?.has(key);
      cells.push(
        <div
          key={key}
          onClick={isYourTurn ? () => onCellClick?.(x, y) : undefined}
          style={{
            width: 40,
            height: 40,
            background: inRange ? '#fff4b3' : (x + y) % 2 === 0 ? '#b9c6d0' : '#e3e9ee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isYourTurn ? 'pointer' : 'default',
          }}
        >
          {occupantId && (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: occupantId === selfId ? 'dodgerblue' : 'crimson',
              }}
            />
          )}
        </div>
      );
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 40px)`,
        gap: 2,
      }}
    >
      {cells}
    </div>
  );
} 