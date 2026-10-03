import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { MatrixGridCell, MatrixGridCellState, MatrixGridTraceState } from '../../models/matrix-grid';

export type MatrixGridTone = 'idle' | 'cyan' | 'pink' | 'lime' | 'violet' | 'red';
export type MatrixGridCellTone = MatrixGridTone | 'zero';
export type MatrixGridGlyph = 'dot' | 'mono' | 'mono-long';
export type MatrixGridTagKind = 'operation' | 'ratio' | 'skip';

export interface MatrixGridCellView {
  readonly key: string;
  readonly row: number;
  readonly col: number;
  readonly value: string;
  readonly tone: MatrixGridCellTone;
  readonly band: boolean;
  readonly pivot: boolean;
  readonly strong: boolean;
  readonly rhs: boolean;
  readonly glyph: MatrixGridGlyph;
}

export interface MatrixGridRowTag {
  readonly kind: MatrixGridTagKind;
  readonly text: string;
  readonly tone: MatrixGridTone;
}

export interface MatrixGridRowView {
  readonly index: number;
  readonly label: string;
  readonly sub: string | null;
  readonly tone: MatrixGridTone;
  readonly objective: boolean;
  readonly cells: readonly MatrixGridCellView[];
  readonly tag: MatrixGridRowTag | null;
}

export interface MatrixGridColumnView {
  readonly index: number;
  readonly label: string;
  readonly active: boolean;
  readonly rhs: boolean;
}

export interface MatrixGridTableView {
  readonly symbol: string;
  readonly size: string;
  readonly columns: readonly MatrixGridColumnView[];
  readonly rows: readonly MatrixGridRowView[];
  readonly pivot: { readonly row: number; readonly col: number } | null;
  readonly hasTags: boolean;
}

export interface MatrixGridHistoryEntry {
  readonly id: string;
  readonly order: string;
  readonly kind: 'operation' | 'pivot' | 'pending';
  readonly text: string;
  readonly entering: string;
  readonly leaving: string;
  readonly value: string | null;
  readonly glyph: MatrixGridGlyph;
  readonly tone: RackRowTone;
}

export interface MatrixGridSolutionRow {
  readonly id: string;
  readonly kind: 'value' | 'free' | 'none';
  readonly label: string;
  readonly sub: string | null;
  readonly value: string;
  readonly glyph: MatrixGridGlyph;
  readonly tone: RackRowTone;
}

interface MatrixGridRoles {
  readonly pivot: { readonly row: number; readonly col: number } | null;
  readonly activeCol: number | null;
  readonly sources: ReadonlySet<number>;
  readonly targets: ReadonlySet<number>;
  readonly attending: ReadonlySet<number>;
  readonly conflicts: ReadonlySet<number>;
  readonly candidate: { readonly row: number; readonly col: number } | null;
  readonly zeroCol: number | null;
  readonly conflictCol: number | null;
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;
const SUBSCRIPTS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'] as const;
const EPSILON = 1e-9;
const DOT_INTEGER = /^-?\d{1,4}$/;
const MONO_SHORT_LENGTH = 5;

export function subscript(value: number): string {
  return String(value)
    .split('')
    .map((digit) => SUBSCRIPTS[Number(digit)] ?? digit)
    .join('');
}

export function parseCellNumber(value: string): number | null {
  const text = value.trim().replace('−', '-');
  if (text === '') return null;
  const fraction = text.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    return denominator === 0 ? null : Number(fraction[1]) / denominator;
  }
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function cellGlyph(value: string): MatrixGridGlyph {
  if (DOT_INTEGER.test(value)) return 'dot';
  return value.length > MONO_SHORT_LENGTH ? 'mono-long' : 'mono';
}

export function formatRatio(value: number): string {
  if (Math.abs(value - Math.round(value)) < EPSILON) return String(Math.round(value));
  return value.toFixed(3).replace(/\.?0+$/, '');
}

export function matrixGridColumnLabel(state: MatrixGridTraceState, col: number): string {
  if (state.dividerCol !== null && col >= state.dividerCol) return 'b';
  if (state.mode === 'simplex') {
    const decisionCount = simplexDecisionCount(state);
    if (col >= decisionCount) return `s${subscript(col - decisionCount + 1)}`;
  }
  return VARIABLE_NAMES[col] ?? `x${subscript(col + 1)}`;
}

export function latexToPlain(text: string): string {
  return text
    .replace(/\[\[\/?math\]\]/g, '')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\rightarrow|\\to/g, '→')
    .replace(/\\le\b/g, '≤')
    .replace(/\\ge\b/g, '≥')
    .replace(/\\cdot/g, '·')
    .replace(/\\[,;: ]/g, ' ')
    .replace(/_\{(\d+)\}|_(\d)/g, (_match, braced: string | undefined, single: string | undefined) =>
      subscript(Number(braced ?? single)),
    )
    .replace(/[{}\\]/g, '')
    .replace(/(^|[\s(])-/g, '$1−')
    .replace(/ - /g, ' − ')
    .replace(/([\d)])R/g, '$1·R')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isRowOperationLabel(label: TranslatableText | null | undefined): label is string {
  return typeof label === 'string' && label.includes('R_') && !label.includes('\\begin');
}

export function operationTagText(label: string): string {
  const plain = latexToPlain(label);
  const arrow = plain.indexOf('←');
  return arrow >= 0 ? plain.slice(arrow + 1).trim() : plain;
}

export function cellAt(state: MatrixGridTraceState, row: number, col: number): MatrixGridCell | undefined {
  return state.cells.find((cell) => cell.row === row && cell.col === col);
}

export function leadingColumn(state: MatrixGridTraceState, row: number): number | null {
  const limit = coefficientLimit(state);
  for (let col = 0; col < limit; col++) {
    const value = parseCellNumber(cellAt(state, row, col)?.value ?? '');
    if (value !== null && Math.abs(value) > EPSILON) return col;
  }
  return null;
}

export function simplexBasis(state: MatrixGridTraceState): readonly (number | null)[] {
  const constraintRows = state.rows - 1;
  const limit = coefficientLimit(state);
  return Array.from({ length: constraintRows }, (_, row) => {
    for (let col = 0; col < limit; col++) {
      if (isUnitColumn(state, col, row)) return col;
    }
    return null;
  });
}

export function buildMatrixGridTable(state: MatrixGridTraceState): MatrixGridTableView {
  const roles = resolveRoles(state);
  const basis = state.mode === 'simplex' ? simplexBasis(state) : [];
  const complete = state.tone === 'complete';
  const rows: MatrixGridRowView[] = Array.from({ length: state.rows }, (_, row) => {
    const objective = isObjectiveRow(state, row);
    const cells = Array.from({ length: state.cols }, (_, col) => cellView(state, roles, row, col, complete));
    return {
      index: row,
      label: objective ? 'z' : `R${subscript(row + 1)}`,
      sub: objective ? null : basisLabel(state, basis[row] ?? null),
      tone: rowTone(roles, row, objective && complete),
      objective,
      cells,
      tag: rowTag(state, roles, row),
    };
  });
  const columns = Array.from({ length: state.cols }, (_, col) => ({
    index: col,
    label: matrixGridColumnLabel(state, col),
    active: roles.activeCol === col,
    rhs: isRhsColumn(state, col),
  }));
  return {
    symbol: state.mode === 'simplex' ? 'T' : '[A|b]',
    size: `${state.rows} × ${state.cols}`,
    columns,
    rows,
    pivot: roles.pivot,
    hasTags: rows.some((row) => row.tag !== null),
  };
}

export function buildOperationHistory(trail: readonly MatrixGridTraceState[]): readonly MatrixGridHistoryEntry[] {
  const current = trail.at(-1);
  if (!current) return [];
  return current.mode === 'simplex' ? simplexHistory(trail, current) : gaussianHistory(trail, current);
}

export function buildSolutionRows(state: MatrixGridTraceState): readonly MatrixGridSolutionRow[] {
  return state.mode === 'simplex' ? simplexSolution(state) : gaussianSolution(state);
}

function gaussianHistory(
  trail: readonly MatrixGridTraceState[],
  current: MatrixGridTraceState,
): readonly MatrixGridHistoryEntry[] {
  const entries: MatrixGridHistoryEntry[] = [];
  let previous: string | null = null;
  trail.forEach((state, index) => {
    const label = state.operationLabel;
    if (!isRowOperationLabel(label) || label === previous) return;
    previous = label;
    entries.push(historyEntry(`op-${index}`, entries.length + 1, 'operation', latexToPlain(label)));
  });
  const live = current.tone === 'pivot' || current.tone === 'eliminate';
  return markHead(entries, live);
}

function simplexHistory(
  trail: readonly MatrixGridTraceState[],
  current: MatrixGridTraceState,
): readonly MatrixGridHistoryEntry[] {
  const entries: MatrixGridHistoryEntry[] = [];
  let pendingCol: number | null = null;
  trail.forEach((state, index) => {
    const pivot = realPivotCell(state);
    if (pivot) {
      const leavingCol = simplexBasis(state)[pivot.row] ?? null;
      entries.push({
        ...historyEntry(`pivot-${index}`, entries.length + 1, 'pivot', ''),
        entering: matrixGridColumnLabel(state, pivot.col),
        leaving: leavingCol === null ? `R${subscript(pivot.row + 1)}` : matrixGridColumnLabel(state, leavingCol),
        value: pivot.value,
        glyph: cellGlyph(pivot.value),
      });
      pendingCol = null;
      return;
    }
    if (state.cells.some((cell) => cell.state === 'updated')) return;
    pendingCol = simplexEnteringColumn(state) ?? pendingCol;
  });
  if (pendingCol !== null && current.tone !== 'complete') {
    entries.push({
      ...historyEntry('pending', entries.length + 1, 'pending', ''),
      entering: matrixGridColumnLabel(current, pendingCol),
    });
    return markHead(entries, current.tone !== 'fail');
  }
  return markHead(entries, current.tone === 'pivot');
}

function historyEntry(
  id: string,
  order: number,
  kind: MatrixGridHistoryEntry['kind'],
  text: string,
): MatrixGridHistoryEntry {
  return {
    id,
    order: String(order).padStart(2, '0'),
    kind,
    text,
    entering: '',
    leaving: '',
    value: null,
    glyph: 'mono',
    tone: 'default',
  };
}

function markHead(entries: readonly MatrixGridHistoryEntry[], live: boolean): readonly MatrixGridHistoryEntry[] {
  const lastIndex = entries.length - 1;
  return entries
    .map((entry, index) => (live && index === lastIndex ? { ...entry, tone: 'head' as const } : entry))
    .reverse();
}

function gaussianSolution(state: MatrixGridTraceState): readonly MatrixGridSolutionRow[] {
  if (state.tone === 'fail') {
    return [{ id: 'none', kind: 'none', label: '∅', sub: null, value: '', glyph: 'mono', tone: 'dim' }];
  }
  if (state.tone !== 'complete' || state.dividerCol === null) return [];
  const divider = state.dividerCol;
  return Array.from({ length: divider }, (_, col) => {
    const label = matrixGridColumnLabel(state, col);
    const row = Array.from({ length: state.rows }, (_, index) => index).find(
      (index) => leadingColumn(state, index) === col && isSame(numberAt(state, index, col), 1),
    );
    if (row === undefined) {
      return { id: `free-${col}`, kind: 'free' as const, label, sub: null, value: '', glyph: 'mono' as const, tone: 'dim' as const };
    }
    const value = parametricValue(state, row, col);
    return {
      id: `value-${col}`,
      kind: 'value' as const,
      label,
      sub: `R${subscript(row + 1)}`,
      value,
      glyph: cellGlyph(value),
      tone: 'done' as const,
    };
  });
}

export function parametricValue(state: MatrixGridTraceState, row: number, col: number): string {
  const divider = coefficientLimit(state);
  const rhs = cellAt(state, row, divider)?.value ?? '0';
  const terms: string[] = [];
  for (let other = 0; other < divider; other++) {
    const coefficient = cellAt(state, row, other)?.value ?? '0';
    const number = parseCellNumber(coefficient);
    if (other === col || number === null || isSame(number, 0)) continue;
    const magnitude = coefficient.replace(/^-/, '');
    const factor = magnitude === '1' ? '' : `${magnitude}·`;
    terms.push(`${number > 0 ? '−' : '+'} ${factor}${matrixGridColumnLabel(state, other)}`);
  }
  if (terms.length === 0) return rhs;
  const lead = isSame(parseCellNumber(rhs), 0) ? '' : `${rhs} `;
  const expression = `${lead}${terms.join(' ')}`;
  return lead ? expression : expression.replace(/^\+ /, '').replace(/^− /, '−');
}

function simplexSolution(state: MatrixGridTraceState): readonly MatrixGridSolutionRow[] {
  if (state.dividerCol === null) return [];
  const divider = state.dividerCol;
  const tone: RackRowTone = state.tone === 'complete' ? 'done' : 'default';
  const rows: MatrixGridSolutionRow[] = simplexBasis(state).map((col, row) => {
    const value = cellAt(state, row, divider)?.value ?? '—';
    return {
      id: `basis-${row}`,
      kind: 'value',
      label: col === null ? '—' : matrixGridColumnLabel(state, col),
      sub: `R${subscript(row + 1)}`,
      value,
      glyph: cellGlyph(value),
      tone,
    };
  });
  const objective = cellAt(state, state.rows - 1, divider)?.value ?? '—';
  rows.push({ id: 'objective', kind: 'value', label: 'z', sub: null, value: objective, glyph: cellGlyph(objective), tone });
  return rows;
}

function resolveRoles(state: MatrixGridTraceState): MatrixGridRoles {
  return state.mode === 'simplex' ? simplexRoles(state) : gaussianRoles(state);
}

function gaussianRoles(state: MatrixGridTraceState): MatrixGridRoles {
  const pivotRows = rowsWith(state, 'pivot-row');
  const eliminating = rowsWith(state, 'eliminating');
  const updated = rowsWith(state, 'updated');
  const conflicts = state.tone === 'fail' ? contradictionRows(state) : new Set<number>();
  const empty = new Set<number>();

  if (pivotRows.size === 1 && eliminating.size + updated.size > 0) {
    const source = [...pivotRows][0];
    const pivot = pivotAt(state, source);
    return {
      ...baseRoles(conflicts),
      pivot,
      activeCol: pivot?.col ?? null,
      sources: pivotRows,
      targets: new Set([...eliminating, ...updated]),
      zeroCol: pivot?.col ?? null,
    };
  }
  if (pivotRows.size === 1 || (updated.size === 1 && pivotRows.size === 0)) {
    const row = [...pivotRows, ...updated][0];
    const pivot = pivotAt(state, row);
    return { ...baseRoles(conflicts), pivot, activeCol: pivot?.col ?? null, targets: new Set([row]), zeroCol: pivot?.col ?? null };
  }
  if (pivotRows.size + updated.size >= 2) {
    return { ...baseRoles(conflicts), targets: new Set([...pivotRows, ...updated]) };
  }
  return { ...baseRoles(conflicts), sources: empty };
}

export function simplexEnteringColumn(state: MatrixGridTraceState): number | null {
  const marked = stateColumn(state, 'pivot-col');
  if (marked !== null) return marked;
  const objectiveRow = state.rows - 1;
  const selecting = state.cells.some(
    (cell) => (cell.row === objectiveRow && cell.state === 'pivot-row') || (cell.row !== objectiveRow && cell.state === 'eliminating'),
  );
  return selecting ? mostNegativeReducedCost(state) : null;
}

function mostNegativeReducedCost(state: MatrixGridTraceState): number | null {
  const objectiveRow = state.rows - 1;
  let entering: number | null = null;
  let mostNegative = -EPSILON;
  for (let col = 0; col < coefficientLimit(state); col++) {
    const value = numberAt(state, objectiveRow, col);
    if (value !== null && value < mostNegative) {
      mostNegative = value;
      entering = col;
    }
  }
  return entering;
}

function simplexRoles(state: MatrixGridTraceState): MatrixGridRoles {
  const real = realPivotCell(state);
  const objectiveRow = state.rows - 1;
  const updated = rowsWith(state, 'updated');
  const attending = rowsWith(state, 'eliminating');
  const activeCol = real?.col ?? simplexEnteringColumn(state);
  const selectingColumn = state.cells.some((cell) => cell.row === objectiveRow && (cell.state === 'pivot-row' || cell.state === 'pivot'));
  const objectivePivot = selectingColumn && activeCol !== null && !real ? { row: objectiveRow, col: activeCol } : null;

  if (state.tone === 'fail') {
    const conflictCol = mostNegativeReducedCost(state);
    return { ...baseRoles(new Set()), activeCol: conflictCol, conflictCol };
  }

  if (updated.size > 0 && activeCol !== null) {
    const row = [...updated][0];
    return {
      ...baseRoles(new Set()),
      pivot: { row, col: activeCol },
      activeCol,
      targets: updated,
      zeroCol: activeCol,
    };
  }
  return {
    ...baseRoles(new Set()),
    pivot: real ? { row: real.row, col: real.col } : null,
    activeCol,
    attending: activeCol === null ? new Set() : attending,
    candidate: objectivePivot,
  };
}

function baseRoles(conflicts: ReadonlySet<number>): MatrixGridRoles {
  return {
    pivot: null,
    activeCol: null,
    sources: new Set(),
    targets: new Set(),
    attending: new Set(),
    conflicts,
    candidate: null,
    zeroCol: null,
    conflictCol: null,
  };
}

function cellView(
  state: MatrixGridTraceState,
  roles: MatrixGridRoles,
  row: number,
  col: number,
  complete: boolean,
): MatrixGridCellView {
  const cell = cellAt(state, row, col);
  const value = cell?.value ?? '';
  const rhs = isRhsColumn(state, col);
  const pivot = roles.pivot !== null && roles.pivot.row === row && roles.pivot.col === col;
  const band = roles.pivot !== null && !pivot && (roles.pivot.row === row || roles.pivot.col === col);
  return {
    key: `r${row}c${col}`,
    row,
    col,
    value,
    tone: cellTone(state, roles, cell?.state ?? 'idle', row, col, value, rhs, pivot, complete),
    band: band || (roles.pivot === null && roles.activeCol === col && !rhs),
    pivot,
    strong: pivot || (roles.conflicts.has(row) && rhs) || isFocusCell(roles, row, col, rhs),
    rhs,
    glyph: cellGlyph(value),
  };
}

function isFocusCell(roles: MatrixGridRoles, row: number, col: number, rhs: boolean): boolean {
  if (roles.candidate && roles.candidate.row === row && roles.candidate.col === col) return true;
  return roles.attending.has(row) && (col === roles.activeCol || rhs);
}

function cellTone(
  state: MatrixGridTraceState,
  roles: MatrixGridRoles,
  cellState: MatrixGridCellState,
  row: number,
  col: number,
  value: string,
  rhs: boolean,
  pivot: boolean,
  complete: boolean,
): MatrixGridCellTone {
  if (pivot) return 'violet';
  if (roles.conflicts.has(row)) return 'red';
  if (roles.conflictCol === col && !isObjectiveRow(state, row)) return 'red';
  if (roles.candidate && roles.candidate.row === row && roles.candidate.col === col) return 'cyan';
  if (isEliminatedZero(state, roles, row, col, value)) return 'zero';
  if (roles.targets.has(row)) return 'pink';
  if (roles.sources.has(row)) return 'cyan';
  if (roles.attending.has(row) && (col === roles.activeCol || rhs)) return 'cyan';
  if (cellState === 'leading') return 'lime';
  if (complete && rhs) return 'lime';
  return 'idle';
}

function isEliminatedZero(
  state: MatrixGridTraceState,
  roles: MatrixGridRoles,
  row: number,
  col: number,
  value: string,
): boolean {
  if (isRhsColumn(state, col) || !isSame(parseCellNumber(value), 0)) return false;
  if (state.mode === 'simplex') return roles.zeroCol === col && roles.pivot !== null && roles.pivot.row !== row;
  for (let other = 0; other < state.rows; other++) {
    if (other !== row && leadingColumn(state, other) === col && isSame(numberAt(state, other, col), 1)) return true;
  }
  return false;
}

function rowTone(roles: MatrixGridRoles, row: number, settledObjective: boolean): MatrixGridTone {
  if (roles.conflicts.has(row)) return 'red';
  if (roles.targets.has(row)) return 'pink';
  if (roles.sources.has(row) || roles.attending.has(row)) return 'cyan';
  if (roles.pivot && roles.pivot.row === row) return 'violet';
  if (roles.candidate && roles.candidate.row === row) return 'cyan';
  if (settledObjective) return 'lime';
  return 'idle';
}

function rowTag(state: MatrixGridTraceState, roles: MatrixGridRoles, row: number): MatrixGridRowTag | null {
  if (state.mode === 'gaussian-elimination') {
    if (!roles.targets.has(row) || !isRowOperationLabel(state.operationLabel)) return null;
    return { kind: 'operation', text: operationTagText(state.operationLabel), tone: 'pink' };
  }
  if (!roles.attending.has(row) || roles.activeCol === null || state.dividerCol === null) return null;
  const coefficientText = cellAt(state, row, roles.activeCol)?.value ?? '';
  const rhsText = cellAt(state, row, state.dividerCol)?.value ?? '';
  const coefficient = parseCellNumber(coefficientText);
  const rhs = parseCellNumber(rhsText);
  if (coefficient === null || rhs === null) return null;
  if (coefficient <= EPSILON) return { kind: 'skip', text: `${coefficientText} ≤ 0`, tone: 'cyan' };
  return { kind: 'ratio', text: `${rhsText} / ${coefficientText} = ${formatRatio(rhs / coefficient)}`, tone: 'cyan' };
}

function pivotAt(state: MatrixGridTraceState, row: number): { row: number; col: number } | null {
  const col = leadingColumn(state, row);
  return col === null ? null : { row, col };
}

function realPivotCell(state: MatrixGridTraceState): MatrixGridCell | null {
  return state.cells.find((cell) => cell.state === 'pivot' && !isObjectiveRow(state, cell.row)) ?? null;
}

function stateColumn(state: MatrixGridTraceState, cellState: MatrixGridCellState): number | null {
  return state.cells.find((cell) => cell.state === cellState)?.col ?? null;
}

function rowsWith(state: MatrixGridTraceState, cellState: MatrixGridCellState): Set<number> {
  return new Set(
    state.cells
      .filter((cell) => cell.state === cellState && !(state.mode === 'simplex' && isObjectiveRow(state, cell.row)))
      .map((cell) => cell.row),
  );
}

function contradictionRows(state: MatrixGridTraceState): Set<number> {
  const rows = new Set<number>();
  if (state.dividerCol === null) return rows;
  for (let row = 0; row < state.rows; row++) {
    if (leadingColumn(state, row) === null && !isSame(numberAt(state, row, state.dividerCol), 0)) rows.add(row);
  }
  return rows;
}

function isUnitColumn(state: MatrixGridTraceState, col: number, unitRow: number): boolean {
  for (let row = 0; row < state.rows; row++) {
    const expected = row === unitRow ? 1 : 0;
    if (!isSame(numberAt(state, row, col), expected)) return false;
  }
  return true;
}

function basisLabel(state: MatrixGridTraceState, col: number | null): string | null {
  return col === null ? null : matrixGridColumnLabel(state, col);
}

function simplexDecisionCount(state: MatrixGridTraceState): number {
  return coefficientLimit(state) - (state.rows - 1);
}

function coefficientLimit(state: MatrixGridTraceState): number {
  return state.dividerCol ?? state.cols;
}

function isRhsColumn(state: MatrixGridTraceState, col: number): boolean {
  return state.dividerCol !== null && col >= state.dividerCol;
}

function isObjectiveRow(state: MatrixGridTraceState, row: number): boolean {
  return state.mode === 'simplex' && row === state.rows - 1;
}

function numberAt(state: MatrixGridTraceState, row: number, col: number): number | null {
  return parseCellNumber(cellAt(state, row, col)?.value ?? '');
}

function isSame(value: number | null, expected: number): boolean {
  return value !== null && Math.abs(value - expected) < EPSILON;
}

export interface MatrixGridFacts {
  readonly pivot: string | null;
  readonly pivotValue: string | null;
  readonly operation: string | null;
  readonly sources: string | null;
  readonly targets: string | null;
  readonly entering: string | null;
}

export function buildMatrixGridFacts(state: MatrixGridTraceState, table: MatrixGridTableView): MatrixGridFacts {
  const pivot = table.pivot;
  return {
    pivot: pivot ? `${table.rows[pivot.row]?.label ?? ''} · ${matrixGridColumnLabel(state, pivot.col)}` : null,
    pivotValue: pivot ? (cellAt(state, pivot.row, pivot.col)?.value ?? null) : null,
    operation: isRowOperationLabel(state.operationLabel) ? latexToPlain(state.operationLabel) : null,
    sources: state.mode === 'simplex' ? null : joinRowLabels(table, 'cyan'),
    targets: joinRowLabels(table, 'pink'),
    entering: state.mode === 'simplex' ? (table.columns.find((column) => column.active)?.label ?? null) : null,
  };
}

function joinRowLabels(table: MatrixGridTableView, tone: MatrixGridTone): string | null {
  const labels = table.rows.filter((row) => row.tone === tone).map((row) => row.label);
  return labels.length > 0 ? labels.join(', ') : null;
}
