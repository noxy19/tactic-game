export interface Position {
  x: number;
  y: number;
}

// Returns inclusive path (excluding starting position) from from -> to moving 1 step at a time Manhattan
export function buildPath(from: Position, to: Position): Position[] {
  const path: Position[] = [];
  let cx = from.x;
  let cy = from.y;
  const dx = Math.sign(to.x - cx);
  const dy = Math.sign(to.y - cy);
  while (cx !== to.x || cy !== to.y) {
    if (cx !== to.x) cx += dx;
    else if (cy !== to.y) cy += dy;
    path.push({ x: cx, y: cy });
  }
  return path;
} 