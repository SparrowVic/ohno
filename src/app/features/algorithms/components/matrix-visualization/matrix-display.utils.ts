import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, isI18nText, translatableKey } from '../../../../core/i18n/translatable-text';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import {
  MatrixCell,
  MatrixHeader,
  MatrixHeaderStatus,
  MatrixTraceState,
} from '../../models/matrix';

const MATRIX = I18N_KEY.features.algorithms.display.matrix;
const RACKS = I18N_KEY.features.algorithms.display.racks;
const TITLES = MATRIX.notes.titles;
const VERDICTS = MATRIX.notes.verdicts;
const FORMULAS = MATRIX.notes.formulas;

export type MatrixTone = 'cyan' | 'pink' | 'lime' | 'violet' | 'amber' | 'red' | 'slate';
export type MatrixCellTone = MatrixTone | 'ink' | 'dim';
export type MatrixHeaderTone = Exclude<MatrixTone, 'pink' | 'red' | 'slate'> | 'ink';
export type MatrixRackKind = 'list' | 'pivot' | 'active' | 'done' | 'zero' | 'covered' | 'sentence';
export type MatrixBandTone = 'violet' | 'amber' | 'cyan';

export interface MatrixFocus {
  readonly row: number;
  readonly col: number;
}

export interface MatrixCellView {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly value: string;
  readonly font: 'dot' | 'mono';
  readonly tone: MatrixCellTone;
  readonly mark: string | null;
  readonly tag: TranslatableText | null;
  readonly zero: boolean;
  readonly ring: boolean;
  readonly current: boolean;
  readonly settled: boolean;
  readonly ariaLabel: string;
}

export interface MatrixHeaderView {
  readonly id: string;
  readonly index: number;
  readonly label: string;
  readonly tone: MatrixHeaderTone;
  readonly pivot: boolean;
  readonly sub: string | null;
}

export interface MatrixBand {
  readonly id: string;
  readonly axis: 'row' | 'col';
  readonly index: number;
  readonly tone: MatrixBandTone;
}

export interface MatrixRackSpec {
  readonly title: TranslatableText;
  readonly kind: MatrixRackKind;
}

export interface MatrixRackRowView {
  readonly id: string;
  readonly lead: string;
  readonly value: string | null;
  readonly sentence: TranslatableText | null;
  readonly tone: RackRowTone;
  readonly led: MatrixTone | null;
  readonly pivot: boolean;
}

export interface MatrixNote {
  readonly title: TranslatableText;
  readonly formula: TranslatableText;
  readonly verdict: TranslatableText | null;
  readonly tone: MatrixTone;
}

const RACK_KINDS: Readonly<Record<string, MatrixRackKind>> = {
  [RACKS.nodes]: 'list',
  [MATRIX.racks.meaning]: 'sentence',
  [MATRIX.racks.pivotNode]: 'pivot',
  [MATRIX.racks.changedPairs]: 'done',
  [MATRIX.racks.shortestPairs]: 'done',
  [MATRIX.racks.matrixStatus]: 'sentence',
  [MATRIX.racks.workers]: 'list',
  [MATRIX.racks.jobs]: 'list',
  [MATRIX.racks.activeRow]: 'active',
  [MATRIX.racks.reducedRows]: 'done',
  [MATRIX.racks.activeColumn]: 'active',
  [MATRIX.racks.reducedColumns]: 'done',
  [MATRIX.racks.currentMatches]: 'done',
  [MATRIX.racks.zeros]: 'zero',
  [MATRIX.racks.optimalPairs]: 'done',
  [MATRIX.racks.whyItWorks]: 'sentence',
  [MATRIX.racks.coveredRows]: 'covered',
  [MATRIX.racks.coveredColumns]: 'covered',
  [MATRIX.racks.nextStep]: 'sentence',
};

const HEADER_TONES: Readonly<Record<MatrixHeaderStatus, MatrixHeaderTone>> = {
  idle: 'ink',
  active: 'cyan',
  pivot: 'violet',
  covered: 'amber',
  assignment: 'lime',
};

const RACK_TONES: Readonly<
  Record<MatrixRackKind, { readonly tone: RackRowTone; readonly led: MatrixTone | null }>
> = {
  list: { tone: 'default', led: 'slate' },
  pivot: { tone: 'head', led: 'violet' },
  active: { tone: 'head', led: 'cyan' },
  done: { tone: 'done', led: 'lime' },
  zero: { tone: 'default', led: 'cyan' },
  covered: { tone: 'default', led: 'amber' },
  sentence: { tone: 'default', led: null },
};

const NUMERIC = /^-?\d+(\.\d+)?$/;
const DOT_MAX_CHARS = 4;

export function matrixRackSpec(label: TranslatableText | null | undefined): MatrixRackSpec {
  const key = translatableKey(label);
  return { title: label ?? '', kind: (key && RACK_KINDS[key]) || 'list' };
}

export function matrixRackRows(
  items: readonly TranslatableText[],
  kind: MatrixRackKind,
): MatrixRackRowView[] {
  const base = RACK_TONES[kind];
  return items.map((item, index) => {
    const id = `${index}-${translatableKey(item)}`;
    if (typeof item !== 'string' || kind === 'sentence') {
      return {
        id,
        lead: '',
        value: null,
        sentence: item,
        tone: translatableKey(item) === MATRIX.sentences.noChange ? 'dim' : 'default',
        led: null,
        pivot: false,
      };
    }
    const pair = parseRackPair(item);
    return {
      id,
      lead: pair ? `${pair.from} → ${pair.to}` : item,
      value: pair?.value ?? null,
      sentence: null,
      tone: base.tone,
      led: base.led,
      pivot: kind === 'pivot',
    };
  });
}

export function matrixRackMeta(
  kind: MatrixRackKind,
  items: readonly TranslatableText[],
  size: number,
): string | null {
  if (kind === 'sentence' || items.length === 0) return null;
  if (kind === 'done' && items.every((item) => typeof item === 'string' && /\(\S+\)$/.test(item)))
    return `${items.length}/${size}`;
  if (kind === 'list' || kind === 'zero' || kind === 'covered') return String(items.length);
  return null;
}

export function parseRackPair(
  raw: string,
): { from: string; to: string; value: string | null } | null {
  const match = /^(.+?)→(.+?)(?:\s*=\s*(\S+)|\s+\((\S+)\)|\s+(\S+))?$/.exec(raw.trim());
  if (!match) return null;
  return {
    from: match[1]!.trim(),
    to: match[2]!.trim(),
    value: match[3] ?? match[4] ?? match[5] ?? null,
  };
}

export function matrixPivotIndex(state: MatrixTraceState): number {
  if (!state.pivotLabel) return -1;
  return state.rowHeaders.findIndex((header) => header.label === state.pivotLabel);
}

export function matrixFocus(state: MatrixTraceState): MatrixFocus | null {
  const cell =
    state.cells.find((entry) => entry.status === 'active') ??
    (state.mode === 'floyd-warshall'
      ? state.cells.find((entry) => entry.status === 'improved')
      : undefined);
  return cell ? { row: cell.row, col: cell.col } : null;
}

export function matrixCandidateIds(state: MatrixTraceState): ReadonlyMap<string, string> {
  const result = new Map<string, string>();
  if (state.mode !== 'floyd-warshall') return result;
  const pivot = matrixPivotIndex(state);
  const focus = matrixFocus(state);
  if (pivot < 0 || !focus) return result;
  const pivotLabel = state.rowHeaders[pivot]?.label ?? '';
  const rowLabel = state.rowHeaders[focus.row]?.label ?? '';
  const colLabel = state.colHeaders[focus.col]?.label ?? '';
  const left = cellKey(focus.row, pivot);
  const right = cellKey(pivot, focus.col);
  const current = cellKey(focus.row, focus.col);
  if (left !== current) result.set(left, `${rowLabel}→${pivotLabel}`);
  if (right !== current && right !== left) result.set(right, `${pivotLabel}→${colLabel}`);
  return result;
}

export function matrixMinimumIds(state: MatrixTraceState): ReadonlySet<string> {
  const computation = state.computation;
  if (!computation || typeof computation.result !== 'string' || !NUMERIC.test(computation.result))
    return new Set();
  const target = Number(computation.result);
  const label = translatableKey(computation.label);
  const pick = (predicate: (cell: MatrixCell) => boolean): ReadonlySet<string> =>
    new Set(
      state.cells
        .filter(
          (cell) =>
            predicate(cell) && NUMERIC.test(cell.valueLabel) && Number(cell.valueLabel) === target,
        )
        .map((cell) => cell.id),
    );

  if (label === TITLES.rowMinimum) {
    const row = state.rowHeaders.findIndex((header) => header.status === 'active');
    return row < 0 ? new Set() : pick((cell) => cell.row === row);
  }
  if (label === TITLES.columnMinimum) {
    const col = state.colHeaders.findIndex((header) => header.status === 'active');
    return col < 0 ? new Set() : pick((cell) => cell.col === col);
  }
  if (label === TITLES.smallestUncovered) {
    const rows = coveredIndices(state.rowHeaders);
    const cols = coveredIndices(state.colHeaders);
    return pick((cell) => !rows.has(cell.row) && !cols.has(cell.col));
  }
  return new Set();
}

export function matrixShiftAmount(state: MatrixTraceState): {
  minus: string | null;
  plus: string | null;
} {
  const expression = state.computation?.expression;
  if (!isI18nText(expression)) return { minus: null, plus: null };
  const value = expression.params?.['value'];
  const amount = value === undefined || value === null ? null : String(value);
  if (expression.key === FORMULAS.adjustment) return { minus: amount, plus: amount };
  if (expression.key === FORMULAS.subtractRow || expression.key === FORMULAS.subtractColumn) return { minus: amount, plus: null };
  return { minus: null, plus: null };
}

export function matrixCellViews(state: MatrixTraceState, complete = false): MatrixCellView[] {
  const candidates = matrixCandidateIds(state);
  const minimums = matrixMinimumIds(state);
  const pivot = matrixPivotIndex(state);
  const shift = matrixShiftAmount(state);
  const hungarian = state.mode === 'hungarian';

  return [...state.cells]
    .sort((left, right) => left.row - right.row || left.col - right.col)
    .map((cell) => {
      const key = cellKey(cell.row, cell.col);
      const numeric = NUMERIC.test(cell.valueLabel);
      const zero = hungarian && numeric && Number(cell.valueLabel) === 0;
      const base = {
        id: cell.id,
        row: cell.row,
        col: cell.col,
        value: cell.valueLabel,
        font:
          numeric && cell.valueLabel.length <= DOT_MAX_CHARS ? ('dot' as const) : ('mono' as const),
        zero,
        ring: false,
        current: false,
        settled: false,
        mark: null,
        tag: null,
        ariaLabel: `${cell.rowLabel} → ${cell.colLabel}: ${cell.valueLabel}`,
      };
      const idleTone: MatrixCellTone = !numeric
        ? 'dim'
        : !hungarian && cell.row === cell.col
          ? 'dim'
          : 'ink';

      switch (cell.status) {
        case 'active':
          return { ...base, tone: 'cyan', mark: '?', current: true };
        case 'improved':
          return {
            ...base,
            tone: 'lime',
            current: true,
            tag: oldValueTag(cell.metaLabel),
          };
        case 'assignment':
          return { ...base, tone: 'lime', ring: true };
        case 'adjusted':
          return { ...base, tone: 'pink', tag: shift.minus ? `−${shift.minus}` : null };
        case 'candidate':
          return { ...base, tone: 'pink', tag: shift.plus ? `+${shift.plus}` : null };
        case 'blocked':
          return { ...base, tone: 'red' };
        default:
          break;
      }

      const leg = candidates.get(key);
      if (leg) return { ...base, tone: 'pink', tag: leg };
      if (minimums.has(cell.id)) return { ...base, tone: 'cyan', tag: 'min' };
      if (!hungarian && pivot >= 0 && cell.row === pivot && cell.col === pivot)
        return { ...base, tone: 'violet' };
      const settled = complete && !hungarian && numeric && cell.row !== cell.col;
      return { ...base, tone: idleTone, settled };
    });
}

export function matrixRowHeaderViews(state: MatrixTraceState): MatrixHeaderView[] {
  const pivot = matrixPivotIndex(state);
  const assigned = new Map<number, string>();
  if (state.mode === 'hungarian') {
    for (const cell of state.cells) {
      if (cell.status === 'assignment') assigned.set(cell.row, cell.colLabel);
    }
  }
  return state.rowHeaders.map((header, index) => {
    const target = assigned.get(index);
    return headerView(header, index, pivot, target ? `→ ${target}` : null, target ? 'lime' : null);
  });
}

export function matrixColHeaderViews(state: MatrixTraceState): MatrixHeaderView[] {
  const pivot = matrixPivotIndex(state);
  const assigned = new Set<number>();
  if (state.mode === 'hungarian') {
    for (const cell of state.cells) {
      if (cell.status === 'assignment') assigned.add(cell.col);
    }
  }
  return state.colHeaders.map((header, index) =>
    headerView(header, index, pivot, null, assigned.has(index) ? 'lime' : null),
  );
}

export function matrixBands(state: MatrixTraceState): MatrixBand[] {
  const bands: MatrixBand[] = [];
  if (state.mode === 'floyd-warshall') {
    const pivot = matrixPivotIndex(state);
    if (pivot >= 0) {
      bands.push({ id: `row-pivot-${pivot}`, axis: 'row', index: pivot, tone: 'violet' });
      bands.push({ id: `col-pivot-${pivot}`, axis: 'col', index: pivot, tone: 'violet' });
    }
    return bands;
  }
  state.rowHeaders.forEach((header, index) => {
    if (header.status === 'covered')
      bands.push({ id: `row-covered-${index}`, axis: 'row', index, tone: 'amber' });
    if (header.status === 'active')
      bands.push({ id: `row-active-${index}`, axis: 'row', index, tone: 'cyan' });
  });
  state.colHeaders.forEach((header, index) => {
    if (header.status === 'covered')
      bands.push({ id: `col-covered-${index}`, axis: 'col', index, tone: 'amber' });
    if (header.status === 'active')
      bands.push({ id: `col-active-${index}`, axis: 'col', index, tone: 'cyan' });
  });
  return bands;
}

export function matrixCornerKey(state: MatrixTraceState): string {
  return state.mode === 'floyd-warshall' ? MATRIX.corner.dist : MATRIX.corner.cost;
}

export function matrixDensity(size: number): 'regular' | 'compact' | 'dense' {
  if (size >= 8) return 'dense';
  if (size >= 6) return 'compact';
  return 'regular';
}

export function matrixNote(state: MatrixTraceState): MatrixNote | null {
  const computation = state.computation;
  if (!computation) return null;
  const { label, expression, result, decision } = computation;
  const plainExpression = typeof expression === 'string' ? expression : null;
  const plainResult = typeof result === 'string' ? result : null;

  switch (translatableKey(label)) {
    case TITLES.pivot:
      return note(label, plainExpression === null ? expression : `k = ${plainExpression}`, decision, 'violet');
    case TITLES.relaxation: {
      const [direct, through] = plainExpression?.split(' vs ') ?? [];
      const shorter = translatableKey(decision) === VERDICTS.shorter;
      return note(
        label,
        `min(${direct ?? ''}, ${through ?? ''}) = ${shorter ? (plainResult ?? '') : (direct ?? '')}`,
        decision,
        shorter ? 'pink' : 'cyan',
      );
    }
    case TITLES.update:
      return note(label, expression, decision, 'lime');
    case TITLES.rowMinimum:
    case TITLES.columnMinimum:
      return note(
        label,
        plainExpression !== null && plainResult !== null ? `min(${plainExpression}) = ${plainResult}` : expression,
        decision,
        'cyan',
      );
    case TITLES.subtractMinimum:
      return note(label, expression, result, 'pink');
    case TITLES.zeroMatching:
      return note(label, expression, decision, translatableKey(decision) === VERDICTS.perfect ? 'lime' : 'amber');
    case TITLES.originalTotal:
      return note(
        label,
        plainExpression !== null && plainResult !== null ? `${plainExpression} = ${plainResult}` : expression,
        decision,
        'lime',
      );
    case TITLES.minimumCover:
    case TITLES.smallestUncovered:
      return note(label, expression, decision, 'amber');
    case TITLES.adjustment:
      return note(label, expression, decision, 'pink');
    default:
      return note(label, expression, null, 'slate');
  }
}

function note(
  title: TranslatableText,
  formula: TranslatableText,
  verdict: TranslatableText | null,
  tone: MatrixTone,
): MatrixNote {
  return { title, formula, verdict, tone };
}

function oldValueTag(metaLabel: TranslatableText | null): TranslatableText | null {
  return isI18nText(metaLabel) && metaLabel.key === MATRIX.oldValue ? metaLabel : null;
}

function headerView(
  header: MatrixHeader,
  index: number,
  pivot: number,
  sub: string | null,
  override: MatrixHeaderTone | null,
): MatrixHeaderView {
  const tone = header.status === 'idle' && override ? override : HEADER_TONES[header.status];
  return { id: header.id, index, label: header.label, tone, pivot: index === pivot, sub };
}

function coveredIndices(headers: readonly MatrixHeader[]): ReadonlySet<number> {
  return new Set(headers.flatMap((header, index) => (header.status === 'covered' ? [index] : [])));
}

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}
