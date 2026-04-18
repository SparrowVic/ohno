export interface FloodFillScenario {
  readonly kind: 'flood-fill';
  readonly size: number;
  readonly cells: readonly number[][];
  readonly startRow: number;
  readonly startCol: number;
  readonly sourceColor: number;
  readonly fillColor: number;
}

export interface AStarScenario {
  readonly kind: 'a-star';
  readonly size: number;
  readonly walls: ReadonlySet<string>;
  readonly startRow: number;
  readonly startCol: number;
  readonly goalRow: number;
  readonly goalCol: number;
}

export function createFloodFillScenario(size: number): FloodFillScenario {
  const colors = 4;
  const cells = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.floor(Math.random() * colors) + 1),
  );

  for (let pass = 0; pass < 2; pass++) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const picks = [cells[row]?.[col] ?? 1];
        for (const [nextRow, nextCol] of neighbors(row, col, size)) {
          picks.push(cells[nextRow]?.[nextCol] ?? 1);
        }
        cells[row]![col] = mode(picks);
      }
    }
  }

  const startRow = Math.floor(size * 0.35);
  const startCol = Math.floor(size * 0.35);
  const sourceColor = cells[startRow]?.[startCol] ?? 1;
  let fillColor = ((sourceColor + 1) % colors) + 1;
  if (fillColor === sourceColor) fillColor = colors;

  return {
    kind: 'flood-fill',
    size,
    cells,
    startRow,
    startCol,
    sourceColor,
    fillColor,
  };
}

export function createAStarScenario(size: number): AStarScenario {
  const startRow = 0;
  const startCol = 0;
  const goalRow = size - 1;
  const goalCol = size - 1;
  const reserved = new Set<string>([cellId(startRow, startCol), cellId(goalRow, goalCol)]);
  let row = startRow;
  let col = startCol;

  while (row !== goalRow || col !== goalCol) {
    const canGoDown = row < goalRow;
    const canGoRight = col < goalCol;
    if (canGoDown && canGoRight) {
      if (Math.random() > 0.5) {
        row += 1;
      } else {
        col += 1;
      }
    } else if (canGoDown) {
      row += 1;
    } else {
      col += 1;
    }
    reserved.add(cellId(row, col));
  }

  const walls = new Set<string>();
  for (let currentRow = 0; currentRow < size; currentRow++) {
    for (let currentCol = 0; currentCol < size; currentCol++) {
      const id = cellId(currentRow, currentCol);
      if (reserved.has(id)) continue;
      if (Math.random() < 0.18) {
        walls.add(id);
      }
    }
  }

  return {
    kind: 'a-star',
    size,
    walls,
    startRow,
    startCol,
    goalRow,
    goalCol,
  };
}

export function cellId(row: number, col: number): string {
  return `${row}:${col}`;
}

export function labelForCell(row: number, col: number): string {
  return `r${row} c${col}`;
}

export function neighbors(row: number, col: number, size: number): readonly [number, number][] {
  const result: [number, number][] = [];
  if (row > 0) result.push([row - 1, col]);
  if (col < size - 1) result.push([row, col + 1]);
  if (row < size - 1) result.push([row + 1, col]);
  if (col > 0) result.push([row, col - 1]);
  return result;
}

function mode(values: readonly number[]): number {
  const counts = new Map<number, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0] - right[0])[0]?.[0] ?? 1;
}
