import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
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

const RACK_SPECS: Readonly<
  Record<string, { readonly key: string; readonly kind: MatrixRackKind }>
> = {
  Nodes: { key: RACKS.nodes, kind: 'list' },
  Meaning: { key: MATRIX.racks.meaning, kind: 'sentence' },
  'Pivot node': { key: MATRIX.racks.pivotNode, kind: 'pivot' },
  'Changed pairs': { key: MATRIX.racks.changedPairs, kind: 'done' },
  'Example shortest pairs': { key: MATRIX.racks.shortestPairs, kind: 'done' },
  'Matrix status': { key: MATRIX.racks.matrixStatus, kind: 'sentence' },
  Workers: { key: MATRIX.racks.workers, kind: 'list' },
  Jobs: { key: MATRIX.racks.jobs, kind: 'list' },
  'Active row': { key: MATRIX.racks.activeRow, kind: 'active' },
  'Reduced rows': { key: MATRIX.racks.reducedRows, kind: 'done' },
  'Active column': { key: MATRIX.racks.activeColumn, kind: 'active' },
  'Reduced columns': { key: MATRIX.racks.reducedColumns, kind: 'done' },
  'Current matches': { key: MATRIX.racks.currentMatches, kind: 'done' },
  Zeros: { key: MATRIX.racks.zeros, kind: 'zero' },
  'Optimal pairs': { key: MATRIX.racks.optimalPairs, kind: 'done' },
  'Why it works': { key: MATRIX.racks.whyItWorks, kind: 'sentence' },
  'Covered rows': { key: MATRIX.racks.coveredRows, kind: 'covered' },
  'Covered columns': { key: MATRIX.racks.coveredColumns, kind: 'covered' },
  'Next step': { key: MATRIX.racks.nextStep, kind: 'sentence' },
};

const SENTENCE_KEYS: Readonly<Record<string, string>> = {
  '∞ means currently unreachable': MATRIX.sentences.infinityUnreachable,
  'no change this pivot': MATRIX.sentences.noChange,
  'All rows now encode the shortest known distance to every destination':
    MATRIX.sentences.allRowsShortest,
  'Perfect zero matching on the reduced matrix corresponds to the minimum original cost':
    MATRIX.sentences.perfectMatchingOptimal,
  'Rebuild zero matching on the adjusted matrix': MATRIX.sentences.rebuildMatching,
};

const QUIET_SENTENCES: ReadonlySet<string> = new Set(['no change this pivot']);

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

export function matrixRackSpec(label: string | null | undefined): MatrixRackSpec {
  const spec = label ? RACK_SPECS[label] : undefined;
  return spec
    ? { title: i18nText(spec.key), kind: spec.kind }
    : { title: label ?? '', kind: 'list' };
}

export function matrixSentenceText(raw: string): TranslatableText | null {
  const key = SENTENCE_KEYS[raw];
  return key ? i18nText(key) : null;
}

export function matrixRackRows(
  items: readonly string[],
  kind: MatrixRackKind,
): MatrixRackRowView[] {
  const base = RACK_TONES[kind];
  return items.map((raw, index) => {
    const id = `${index}-${raw}`;
    const sentence = matrixSentenceText(raw);
    if (sentence || kind === 'sentence') {
      return {
        id,
        lead: '',
        value: null,
        sentence: sentence ?? raw,
        tone: QUIET_SENTENCES.has(raw) ? 'dim' : 'default',
        led: null,
        pivot: false,
      };
    }
    const pair = parseRackPair(raw);
    return {
      id,
      lead: pair ? `${pair.from} → ${pair.to}` : raw,
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
  items: readonly string[],
  size: number,
): string | null {
  if (kind === 'sentence' || items.length === 0) return null;
  if (kind === 'done' && items.every((item) => /\(\S+\)$/.test(item)))
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
  if (!computation || computation.result === null || !NUMERIC.test(computation.result))
    return new Set();
  const target = Number(computation.result);
  const pick = (predicate: (cell: MatrixCell) => boolean): ReadonlySet<string> =>
    new Set(
      state.cells
        .filter(
          (cell) =>
            predicate(cell) && NUMERIC.test(cell.valueLabel) && Number(cell.valueLabel) === target,
        )
        .map((cell) => cell.id),
    );

  if (computation.label === 'Row minimum') {
    const row = state.rowHeaders.findIndex((header) => header.status === 'active');
    return row < 0 ? new Set() : pick((cell) => cell.row === row);
  }
  if (computation.label === 'Column minimum') {
    const col = state.colHeaders.findIndex((header) => header.status === 'active');
    return col < 0 ? new Set() : pick((cell) => cell.col === col);
  }
  if (computation.label === 'Smallest uncovered') {
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
  const expression = state.computation?.expression ?? '';
  return {
    minus: /-\s*(\d+)/.exec(expression)?.[1] ?? null,
    plus: /\+\s*(\d+)/.exec(expression)?.[1] ?? null,
  };
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
  const pivot = state.pivotLabel ?? '';
  const result = computation.result ?? '';
  const expression = computation.expression;

  switch (computation.label) {
    case 'Pivot node':
      return note(
        i18nText(TITLES.pivot),
        `k = ${expression}`,
        i18nText(VERDICTS.throughPivot, { pivot }),
        'violet',
      );
    case 'Relaxation test': {
      const [direct, through] = expression.split(' vs ');
      const shorter = computation.decision === 'Pivot route is shorter.';
      return note(
        i18nText(TITLES.relaxation),
        `min(${direct ?? ''}, ${through ?? ''}) = ${shorter ? result : (direct ?? '')}`,
        shorter ? i18nText(VERDICTS.shorter, { pivot }) : i18nText(VERDICTS.keep),
        shorter ? 'pink' : 'cyan',
      );
    }
    case 'Distance update':
      return note(
        i18nText(TITLES.update),
        expression,
        i18nText(VERDICTS.updated, { pivot }),
        'lime',
      );
    case 'Row minimum':
      return note(
        i18nText(TITLES.rowMinimum),
        `min(${expression}) = ${result}`,
        i18nText(VERDICTS.rowMinimum),
        'cyan',
      );
    case 'Column minimum':
      return note(
        i18nText(TITLES.columnMinimum),
        `min(${expression}) = ${result}`,
        i18nText(VERDICTS.columnMinimum),
        'cyan',
      );
    case 'Subtract minimum': {
      const value = /-\s*(\d+)/.exec(expression)?.[1] ?? '';
      const label = /^0 created in (.+)$/.exec(result)?.[1] ?? '';
      const formulaKey = expression.startsWith('column')
        ? FORMULAS.subtractColumn
        : FORMULAS.subtractRow;
      return note(
        i18nText(TITLES.subtractMinimum),
        i18nText(formulaKey, { label, value }),
        label ? i18nText(VERDICTS.zeroCreated, { label }) : null,
        'pink',
      );
    }
    case 'Zero matching': {
      const perfect = result === 'perfect assignment found';
      return note(
        i18nText(TITLES.zeroMatching),
        expression,
        i18nText(perfect ? VERDICTS.perfect : VERDICTS.needMore),
        perfect ? 'lime' : 'amber',
      );
    }
    case 'Original total':
      return note(
        i18nText(TITLES.originalTotal),
        `${expression} = ${result}`,
        i18nText(VERDICTS.readOff),
        'lime',
      );
    case 'Minimum cover': {
      const match = /(\d+) row\(s\) \+ (\d+) column\(s\)/.exec(expression);
      return note(
        i18nText(TITLES.minimumCover),
        match
          ? i18nText(FORMULAS.cover, { rows: match[1], cols: match[2], total: result })
          : expression,
        i18nText(VERDICTS.cover),
        'amber',
      );
    }
    case 'Smallest uncovered':
      return note(
        i18nText(TITLES.smallestUncovered),
        i18nText(FORMULAS.smallest, { value: result }),
        i18nText(VERDICTS.smallest),
        'amber',
      );
    case 'Adjustment': {
      const value = /-\s*(\d+)/.exec(expression)?.[1];
      return note(
        i18nText(TITLES.adjustment),
        value ? i18nText(FORMULAS.adjustment, { value }) : expression,
        i18nText(VERDICTS.adjustment),
        'pink',
      );
    }
    default:
      return note(
        computation.label,
        result ? `${expression} = ${result}` : expression,
        null,
        'slate',
      );
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

function oldValueTag(metaLabel: string | null): TranslatableText | null {
  const value = metaLabel ? /^old (.+)$/.exec(metaLabel)?.[1] : undefined;
  return value ? i18nText(MATRIX.oldValue, { value }) : null;
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
