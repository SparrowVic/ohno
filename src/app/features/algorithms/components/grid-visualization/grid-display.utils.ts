import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { GridCellStatus, GridTraceCell, GridTraceState } from '../../models/grid';
import { SortPhase } from '../../models/sort-step';

export type GridDisplayTone = 'cyan' | 'pink' | 'lime' | 'violet' | 'amber' | 'red' | 'slate';
export type GridCellDetail = 'full' | 'value';

export interface GridScores {
  readonly g: number;
  readonly h: number;
  readonly f: number;
}

export interface GridDisplayCell {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly status: GridCellStatus;
  readonly tone: GridDisplayTone | null;
  readonly value: string;
  readonly numeric: boolean;
  readonly scores: GridScores | null;
  readonly isSource: boolean;
  readonly isTarget: boolean;
  readonly isCurrent: boolean;
  readonly shade: number;
}

export interface GridRackRow {
  readonly id: string;
  readonly label: string;
  readonly detail: string | null;
  readonly value: string;
  readonly tone: RackRowTone;
  readonly role: 'source' | 'goal' | null;
}

export interface GridBoardMetrics {
  readonly cellSize: number;
  readonly gap: number;
  readonly detail: GridCellDetail;
  readonly valueSize: number;
  readonly mark: boolean;
  readonly dotCapacity: number;
}

export const GRID_CELL_GAP = 4;
export const GRID_CELL_GAP_TIGHT = 2;
export const GRID_TIGHT_BELOW = 28;
export const GRID_HEADER_SIZE = 18;
export const GRID_BOARD_PADDING = 4;
export const GRID_CELL_MIN = 18;
export const GRID_CELL_MAX = 64;
export const GRID_CELL_MAX_STACKED = 40;
export const GRID_FULL_DETAIL_MIN = 54;
export const GRID_MARK_MIN = 40;
export const GRID_VALUE_MIN_PX = 14;
export const GRID_VALUE_MAX_PX = 22;
export const GRID_VISIT_LIMIT = 12;
export const GRID_DOT_ADVANCE = 0.66;
export const GRID_CELL_INSET = 4;

const STATUS_TONES: Readonly<Record<GridCellStatus, GridDisplayTone | null>> = {
  idle: null,
  wall: 'slate',
  source: 'violet',
  goal: 'violet',
  frontier: 'amber',
  current: 'cyan',
  filled: 'lime',
  closed: 'lime',
  path: 'lime',
  blocked: 'red',
};

const SCORE_PATTERN = /^g(\d+)\s*·\s*f(\d+)$/;
const NUMERIC_PATTERN = /^\d+$/;
const SHADE_PATTERN = /^color-(\d+)$/;
const IDLE_GLYPH = '·';
const UNKNOWN_GLYPH = '?';

export function gridStatusTone(status: GridCellStatus): GridDisplayTone | null {
  return STATUS_TONES[status];
}

export function gridScores(metaLabel: string | null): GridScores | null {
  const match = metaLabel ? SCORE_PATTERN.exec(metaLabel.trim()) : null;
  if (!match) return null;
  const g = Number(match[1]);
  const f = Number(match[2]);
  return { g, h: f - g, f };
}

export function gridShade(tone: string | null | undefined): number {
  const match = tone ? SHADE_PATTERN.exec(tone) : null;
  if (!match) return 0;
  return Math.min(4, Math.max(0, Number(match[1])));
}

export function gridPathOrder(state: GridTraceState | null): ReadonlyMap<string, number> {
  const order = new Map<string, number>();
  if (!state || !state.sourceCellId) return order;
  const onPath = new Set(
    state.cells.filter((cell) => cell.status === 'path' || cell.tags.includes('path')).map((cell) => cell.id),
  );
  if (onPath.size === 0) return order;
  const byPosition = new Map(state.cells.map((cell) => [`${cell.row}:${cell.col}`, cell]));
  const source = state.cells.find((cell) => cell.id === state.sourceCellId);
  if (!source) return order;
  onPath.add(source.id);
  let current: GridTraceCell | undefined = source;
  let index = 0;
  while (current) {
    order.set(current.id, index++);
    current = nextOnPath(current, byPosition, onPath, order);
  }
  return order;
}

export function gridDisplayCells(state: GridTraceState | null): GridDisplayCell[] {
  if (!state) return [];
  const pathOrder = gridPathOrder(state);
  return state.cells.map((cell) => {
    const isSource = cell.id === state.sourceCellId;
    const isTarget = cell.id === state.targetCellId;
    const isCurrent = cell.id === state.activeCellId;
    const baseValue = gridCellValue(cell, state.mode, pathOrder.get(cell.id) ?? null, isSource || isTarget);
    const value = isCurrent && baseValue === IDLE_GLYPH ? UNKNOWN_GLYPH : baseValue;
    return {
      id: cell.id,
      row: cell.row,
      col: cell.col,
      status: cell.status,
      tone: gridStatusTone(cell.status),
      value,
      numeric: NUMERIC_PATTERN.test(value),
      scores: gridScores(cell.metaLabel),
      isSource,
      isTarget,
      isCurrent,
      shade: state.mode === 'flood-fill' ? gridShade(cell.tone) : 0,
    };
  });
}

function gridCellValue(
  cell: GridTraceCell,
  mode: GridTraceState['mode'],
  pathIndex: number | null,
  isEndpoint: boolean,
): string {
  if (cell.status === 'wall') return '';
  if (mode === 'a-star' && pathIndex !== null && !isEndpoint) return String(pathIndex);
  const label = cell.valueLabel.trim();
  return label.length > 0 ? label : IDLE_GLYPH;
}

export function gridBoardMetrics(
  width: number,
  height: number,
  rows: number,
  cols: number,
  maxCell = GRID_CELL_MAX,
): GridBoardMetrics {
  const safeRows = Math.max(1, rows);
  const safeCols = Math.max(1, cols);
  const fit = (gap: number): number => {
    if (width <= 0 || height <= 0) return 40;
    const span = (size: number, count: number): number =>
      Math.floor((size - GRID_HEADER_SIZE - GRID_BOARD_PADDING - gap * count) / count);
    return Math.min(span(width, safeCols), span(height, safeRows));
  };
  const wide = fit(GRID_CELL_GAP);
  const gap = wide < GRID_TIGHT_BELOW ? GRID_CELL_GAP_TIGHT : GRID_CELL_GAP;
  const raw = gap === GRID_CELL_GAP ? wide : fit(gap);
  const cellSize = Math.min(maxCell, Math.max(GRID_CELL_MIN, raw));
  const valueSize = Math.min(GRID_VALUE_MAX_PX, Math.max(GRID_VALUE_MIN_PX, Math.round(cellSize * 0.4)));
  return {
    cellSize,
    gap,
    detail: cellSize >= GRID_FULL_DETAIL_MIN ? 'full' : 'value',
    valueSize,
    mark: cellSize >= GRID_MARK_MIN,
    dotCapacity: Math.max(1, Math.floor((cellSize - GRID_CELL_INSET) / (valueSize * GRID_DOT_ADVANCE))),
  };
}

export function gridFrontierRows(state: GridTraceState | null): GridRackRow[] {
  if (!state) return [];
  const frontier = state.cells.filter((cell) => cell.status === 'frontier');
  const active = gridActiveCell(state);
  if (active && active.status !== 'wall' && frontier.length < state.frontierCount) frontier.push(active);
  const queueOrder = state.frontierOrder ?? null;
  const toneOf = (cell: GridTraceCell, index: number): RackRowTone => {
    if (cell.id === state.activeCellId) return 'now';
    return index === 0 && (state.mode === 'a-star' || queueOrder !== null) ? 'head' : 'default';
  };
  if (state.mode === 'a-star') {
    const scored = frontier
      .map((cell) => ({ cell, scores: gridScores(cell.metaLabel) }))
      .sort((left, right) => {
        const leftF = left.scores?.f ?? Number.NEGATIVE_INFINITY;
        const rightF = right.scores?.f ?? Number.NEGATIVE_INFINITY;
        if (leftF !== rightF) return leftF - rightF;
        return left.cell.id.localeCompare(right.cell.id);
      });
    return scored.map(({ cell, scores }, index) => ({
      id: cell.id,
      label: cellLabel(cell),
      detail: scores ? `g${scores.g} h${scores.h}` : null,
      value: scores ? String(scores.f) : IDLE_GLYPH,
      tone: toneOf(cell, index),
      role: cell.id === state.sourceCellId ? 'source' : null,
    }));
  }
  const rank = new Map((queueOrder ?? []).map((id, index) => [id, index] as const));
  const position = (cell: GridTraceCell): number => rank.get(cell.id) ?? Number.POSITIVE_INFINITY;
  return frontier
    .sort((left, right) => position(left) - position(right) || left.row - right.row || left.col - right.col)
    .map((cell, index) => ({
      id: cell.id,
      label: cellLabel(cell),
      detail: null,
      value: cell.valueLabel,
      tone: toneOf(cell, index),
      role: cell.id === state.sourceCellId ? 'source' : null,
    }));
}

export function gridVisitRows(state: GridTraceState | null, limit = GRID_VISIT_LIMIT): GridRackRow[] {
  if (!state) return [];
  const total = state.visitOrder.length;
  return state.visitOrder
    .slice(Math.max(0, total - limit))
    .map((label, offset, recent) => ({
      id: `${total - recent.length + offset}:${label}`,
      label,
      detail: null,
      value: String(total - recent.length + offset + 1),
      tone: 'done' as const,
      role: null,
    }))
    .reverse();
}

export function gridPathRows(state: GridTraceState | null): GridRackRow[] {
  if (!state) return [];
  const order = gridPathOrder(state);
  const byId = new Map(state.cells.map((cell) => [cell.id, cell]));
  return [...order.entries()].map(([id, index]) => {
    const cell = byId.get(id);
    const role = id === state.sourceCellId ? 'source' : id === state.targetCellId ? 'goal' : null;
    return {
      id,
      label: cell ? cellLabel(cell) : id,
      detail: null,
      value: String(index),
      tone: 'done',
      role,
    };
  });
}

export function gridDecisionTone(phase: SortPhase | undefined, state: GridTraceState | null): GridDisplayTone {
  switch (phase) {
    case 'init':
      return 'violet';
    case 'pick-node':
    case 'inspect-edge':
      return 'cyan';
    case 'relax':
      return 'pink';
    case 'skip-relax':
      return state?.mode === 'flood-fill' ? 'red' : 'amber';
    case 'graph-complete':
      return (state?.resultCount ?? 0) > 0 ? 'lime' : 'red';
    default:
      return 'slate';
  }
}

export function gridActiveCell(state: GridTraceState | null): GridTraceCell | null {
  if (!state?.activeCellId) return null;
  return state.cells.find((cell) => cell.id === state.activeCellId) ?? null;
}

function nextOnPath(
  cell: GridTraceCell,
  byPosition: ReadonlyMap<string, GridTraceCell>,
  onPath: ReadonlySet<string>,
  order: ReadonlyMap<string, number>,
): GridTraceCell | undefined {
  const { row, col } = cell;
  const neighbours: readonly (readonly [number, number])[] = [
    [row - 1, col],
    [row, col + 1],
    [row + 1, col],
    [row, col - 1],
  ];
  return neighbours
    .map(([r, c]) => byPosition.get(`${r}:${c}`))
    .find((next): next is GridTraceCell => !!next && onPath.has(next.id) && !order.has(next.id));
}

function cellLabel(cell: GridTraceCell): string {
  return `r${cell.row} c${cell.col}`;
}
