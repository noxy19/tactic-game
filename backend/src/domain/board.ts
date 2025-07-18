type CellType = "WALL" | "HOLE" | "EMPTY";

export interface Position {
  x: number;
  y: number;
}

interface Cell {
  type: CellType;
}

export type Board = Cell[][];

export function createDefaultBoard(width: number, height: number): Board {
  return Array(width)
    .fill(null)
    .map(() => Array(height).fill({ type: "EMPTY" }));
}
