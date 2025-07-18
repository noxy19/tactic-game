import React, { useMemo } from 'react';
import map2 from '../maps/map2.png';

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
  // Calculate total board size including gaps and padding
  const totalWidth = useMemo(() => {
    const cellsWidth = size * 40; // Each cell is 40px
    const gapsWidth = (size - 1) * 2; // 2px gaps between cells
    const padding = 8; // 4px padding on each side
    return cellsWidth + gapsWidth + padding;
  }, [size]);

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
            backgroundColor: inRange ? 'rgba(255, 244, 179, 0.5)' : 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isYourTurn ? 'pointer' : 'default',
            border: '1px solid rgba(255, 255, 255, 0.2)',
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
        padding: 4,
        width: totalWidth,
        height: totalWidth,
        backgroundImage: `url(${map2})`,
        backgroundSize: `${totalWidth}px ${totalWidth}px`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: 8,
      }}
    >
      {cells}
    </div>
  );
} 