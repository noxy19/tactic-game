type CellType = "WALL" | "HOLE" | "EMPTY";

export interface Position {
  x: number;
  y: number;
}

interface Cell {
  location: Position;
  type: CellType;
}
