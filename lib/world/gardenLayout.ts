export const GRID_COLS = 6;
export const GRID_ROWS = 4;

export interface GridPos {
  x: number;
  y: number;
}

export function isValidCell(pos: GridPos): boolean {
  return (
    Number.isInteger(pos.x) && Number.isInteger(pos.y) &&
    pos.x >= 0 && pos.x < GRID_COLS &&
    pos.y >= 0 && pos.y < GRID_ROWS
  );
}

export function cellsEqual(a: GridPos, b: GridPos): boolean {
  return a.x === b.x && a.y === b.y;
}

export function allCells(): GridPos[] {
  const out: GridPos[] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      out.push({ x, y });
    }
  }
  return out;
}

export function adjacentCells(pos: GridPos): GridPos[] {
  const candidates = [
    { x: pos.x - 1, y: pos.y },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x, y: pos.y + 1 },
  ];
  return candidates.filter(isValidCell);
}
