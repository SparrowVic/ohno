import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { DpCell, DpHeader, DpHeaderStatus, DpInsight, DpMode, DpTraceState, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';

const DP = I18N_KEY.features.algorithms.display.dp;
const LABELS = DP.labels;
const NOTES = I18N_KEY.features.algorithms.display.notes;
const RACKS = I18N_KEY.features.algorithms.display.racks;

export type DpCellState =
  | 'void'
  | 'pending'
  | 'idle'
  | 'base'
  | 'blocked'
  | 'active'
  | 'candidate'
  | 'improved'
  | 'chosen'
  | 'path'
  | 'match';

export type DpCellTone = 'plain' | 'dim' | 'cyan' | 'pink' | 'lime' | 'red';
export type DpHeaderTone = 'idle' | 'cyan' | 'violet' | 'lime' | 'pink';
export type DpReadoutTone = 'cyan' | 'pink' | 'lime' | 'amber';

export interface DpDisplayCell {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly state: DpCellState;
  readonly tone: DpCellTone;
  readonly strong: boolean;
  readonly focus: boolean;
  readonly value: string;
  readonly dot: boolean;
  readonly mark: boolean;
  readonly tag: TranslatableText | null;
  readonly caption: TranslatableText | null;
  readonly hint: 'match' | null;
}

export interface DpDisplayHeader {
  readonly id: string;
  readonly label: TranslatableText;
  readonly meta: TranslatableText | null;
  readonly tone: DpHeaderTone;
}

export interface DpRackRow {
  readonly id: string;
  readonly lead: TranslatableText;
  readonly value: TranslatableText | null;
  readonly valueDot: boolean;
  readonly tone: RackRowTone;
  readonly led: LedColor | null;
}

export interface DpReadout {
  readonly id: string;
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly dot: boolean;
  readonly tone: DpReadoutTone;
}

export interface DpColumnAxis {
  readonly caption: TranslatableText | null;
  readonly columnMeta: boolean;
}

export interface DpTableMetricsInput {
  readonly width: number;
  readonly height: number;
  readonly cols: number;
  readonly rows: number;
  readonly maxValueLength: number;
  readonly rowHeadChars: number;
  readonly headerHeight: number;
}

export interface DpTableMetrics {
  readonly rowHeadWidth: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
  readonly valueSize: number;
  readonly dot: boolean;
  readonly overflow: boolean;
}

interface DpItemAxis {
  readonly axis: 'row' | 'col';
  readonly offset: 0 | 1;
  readonly progress: boolean;
}

export const DP_CELL_GAP = 6;
const MIN_CELL = 40;
const MAX_CELL = 84;
const MIN_CELL_HEIGHT = 34;
const MAX_CELL_HEIGHT = 62;
const DOT_SIZES = [20, 18, 16, 14] as const;
const DOT_GLYPH_RATIO = 0.66;
const CELL_PADDING = 12;
const ROW_HEAD_CHAR = 7;
const ROW_HEAD_PADDING = 18;
const ROW_HEAD_MIN = 48;
const ROW_HEAD_MAX = 140;
const FALLBACK_WIDTH = 720;
const FALLBACK_HEIGHT = 420;
const SHAPE_INSIGHT = /\.(shape|grid|table|strip)Label$/;

const ROW_MAJOR_MODES: ReadonlySet<DpMode> = new Set<DpMode>([
  'knapsack-01',
  'longest-common-subsequence',
  'edit-distance',
  'coin-change',
  'subset-sum',
  'wildcard-matching',
  'regex-matching-dp',
  'climbing-stairs',
  'fibonacci-dp',
  'sos-dp',
  'dp-with-bitmask',
]);

const PRIMARY_AXES: Partial<Record<DpMode, DpItemAxis>> = {
  'knapsack-01': { axis: 'row', offset: 1, progress: true },
  'longest-common-subsequence': { axis: 'row', offset: 1, progress: true },
  'edit-distance': { axis: 'row', offset: 1, progress: true },
  'coin-change': { axis: 'row', offset: 1, progress: true },
  'subset-sum': { axis: 'row', offset: 1, progress: true },
  'wildcard-matching': { axis: 'row', offset: 1, progress: true },
  'regex-matching-dp': { axis: 'row', offset: 1, progress: true },
  'dp-with-bitmask': { axis: 'row', offset: 1, progress: true },
  'matrix-chain': { axis: 'row', offset: 0, progress: false },
  'longest-palindromic-subsequence': { axis: 'row', offset: 0, progress: false },
  'burst-balloons': { axis: 'row', offset: 0, progress: false },
  'knuth-dp-optimization': { axis: 'row', offset: 0, progress: false },
  'traveling-salesman-dp': { axis: 'col', offset: 0, progress: false },
  'longest-increasing-subsequence': { axis: 'col', offset: 0, progress: true },
  'climbing-stairs': { axis: 'col', offset: 0, progress: true },
  'fibonacci-dp': { axis: 'col', offset: 0, progress: true },
  'dp-convex-hull-trick': { axis: 'col', offset: 0, progress: true },
};

const SECONDARY_AXES: Partial<Record<DpMode, DpItemAxis>> = {
  'longest-common-subsequence': { axis: 'col', offset: 1, progress: false },
  'edit-distance': { axis: 'col', offset: 1, progress: false },
  'wildcard-matching': { axis: 'col', offset: 1, progress: false },
  'regex-matching-dp': { axis: 'col', offset: 1, progress: false },
};

const PRIMARY_RACK_META: Partial<Record<DpMode, string>> = {
  'knapsack-01': DP.weightValue,
};

const LABEL_KEYS: Readonly<Record<string, string>> = {
  '0 items': LABELS.zeroItems,
  'no coins': LABELS.noCoins,
  'no nums': LABELS.noNumbers,
  base: RACKS.base,
  'del base': LABELS.deleteBase,
  'ins base': LABELS.insertBase,
  coin: LABELS.coin,
  amt: LABELS.amount,
  value: LABELS.value,
  sum: LABELS.sum,
  text: LABELS.text,
  pattern: LABELS.pattern,
  dot: LABELS.dot,
  star: LABELS.star,
  count: LABELS.count,
  ground: LABELS.ground,
  step: LABELS.stair,
  term: LABELS.term,
  input: LABELS.input,
  best: LABELS.best,
  link: LABELS.link,
  len: LABELS.length,
  prev: LABELS.previous,
  ways: LABELS.ways,
  start: LABELS.start,
  end: LABELS.end,
  'after merge': LABELS.afterMerge,
  frontier: LABELS.frontier,
  empty: LABELS.empty,
  'filled bits': LABELS.filledBits,
  node: LABELS.node,
  include: LABELS.include,
  exclude: LABELS.exclude,
  weight: LABELS.weight,
  take: LABELS.take,
  skip: NOTES.skip,
  none: LABELS.none,
  point: LABELS.point,
  'best j': LABELS.bestIndex,
  state: LABELS.state,
  prefix: LABELS.prefix,
  line: LABELS.line,
  query: LABELS.query,
  cache: LABELS.cache,
  focus: LABELS.focus,
};

const LABEL_PATTERNS: readonly (readonly [RegExp, string, string])[] = [
  [/^(\d+) assigned$/, LABELS.assigned, 'count'],
  [/^(\d+) groups$/, LABELS.groups, 'count'],
  [/^bit (\d+)$/, LABELS.bit, 'n'],
];

const ROLE_TAGS: readonly (readonly [DpTraceTag, string])[] = [
  ['take', NOTES.take],
  ['skip', NOTES.skip],
  ['insert', DP.tags.insert],
  ['delete', DP.tags.delete],
  ['replace', DP.tags.replace],
  ['match', DP.tags.match],
  ['split', DP.tags.split],
];

const DIRECTION_ARROWS: Readonly<Record<string, string>> = {
  '-1,0': '↑',
  '1,0': '↓',
  '0,-1': '←',
  '0,1': '→',
  '-1,-1': '↖',
  '-1,1': '↗',
  '1,-1': '↙',
  '1,1': '↘',
};

const CELL_TONES: Readonly<Record<DpCellState, readonly [DpCellTone, boolean]>> = {
  void: ['plain', false],
  pending: ['dim', false],
  idle: ['plain', false],
  base: ['dim', false],
  blocked: ['red', false],
  active: ['cyan', true],
  candidate: ['pink', true],
  improved: ['pink', true],
  chosen: ['lime', false],
  path: ['lime', true],
  match: ['lime', false],
};

const STATUS_STATES: Readonly<Record<DpCell['status'], DpCellState>> = {
  idle: 'idle',
  base: 'base',
  blocked: 'blocked',
  active: 'active',
  candidate: 'candidate',
  improved: 'improved',
  chosen: 'chosen',
  backtrack: 'path',
  match: 'match',
};

const HEADER_TONES: Readonly<Record<DpHeaderStatus, DpHeaderTone>> = {
  idle: 'idle',
  active: 'cyan',
  source: 'violet',
  target: 'lime',
  accent: 'pink',
};

const QUIET_STATUSES: ReadonlySet<DpCell['status']> = new Set<DpCell['status']>(['idle', 'match']);

const RESTING_STATUSES: readonly DpHeaderStatus[] = ['source', 'target', 'accent'];

const INSIGHT_TONES: Readonly<Record<DpInsight['tone'], DpReadoutTone>> = {
  info: 'cyan',
  accent: 'pink',
  success: 'lime',
  warning: 'amber',
};

export function isDpNumber(value: TranslatableText | null | undefined): boolean {
  return typeof value === 'string' && /^-?\d+$/.test(value);
}

export function dpLabelText(label: string | null | undefined): TranslatableText {
  if (!label) return '';
  const key = LABEL_KEYS[label];
  if (key) return i18nText(key);
  for (const [pattern, patternKey, param] of LABEL_PATTERNS) {
    const match = label.match(pattern);
    if (match) return i18nText(patternKey, { [param]: Number(match[1]) });
  }
  return label;
}

export function dpFocusCell(state: DpTraceState | null | undefined): DpCell | null {
  if (!state) return null;
  return (
    state.cells.find((cell) => cell.tags.includes('active')) ??
    state.cells.find((cell) => cell.status === 'active') ??
    null
  );
}

export function dpPendingIds(state: DpTraceState, phase: SortStep['phase'] | undefined): ReadonlySet<string> {
  if (!ROW_MAJOR_MODES.has(state.mode)) return new Set();
  if (state.cells.some((cell) => cell.status === 'backtrack')) return new Set();
  const focus = dpFocusCell(state);
  if (!focus) {
    if (phase !== 'init') return new Set();
    return new Set(state.cells.filter((cell) => !isBaseCell(cell)).map((cell) => cell.id));
  }
  return new Set(
    state.cells
      .filter((cell) => isAfter(cell, focus) && !isBaseCell(cell) && cell.status !== 'candidate')
      .map((cell) => cell.id),
  );
}

export function dpCellState(cell: DpCell, pending: boolean, shape: DpTraceState['tableShape']): DpCellState {
  if (shape === 'upper-triangle' && cell.row > cell.col) return 'void';
  if (pending || (cell.valueLabel === '·' && QUIET_STATUSES.has(cell.status))) return 'pending';
  return STATUS_STATES[cell.status];
}

export function dpCandidateTag(cell: DpCell, focus: DpCell | null): TranslatableText | null {
  for (const [tag, key] of ROLE_TAGS) {
    if (cell.tags.includes(tag)) return i18nText(key);
  }
  if (!focus) return null;
  return DIRECTION_ARROWS[`${Math.sign(cell.row - focus.row)},${Math.sign(cell.col - focus.col)}`] ?? null;
}

export function dpCellCaption(metaLabel: string | null): TranslatableText | null {
  if (!metaLabel) return null;
  if (/^[ks]\d+$/.test(metaLabel) || /^[A-Z]\d+$/.test(metaLabel)) return metaLabel;
  const last = metaLabel.match(/^last #(\d+)$/);
  if (last) return i18nText(DP.captions.last, { id: Number(last[1]) });
  const from = metaLabel.match(/^from (\S+)$/);
  if (from) return i18nText(DP.captions.from, { city: from[1] });
  return null;
}

export function dpDisplayCell(
  cell: DpCell,
  focus: DpCell | null,
  pending: ReadonlySet<string>,
  shape: DpTraceState['tableShape'],
  result: TranslatableText | null = null,
): DpDisplayCell {
  const state = dpCellState(cell, pending.has(cell.id), shape);
  const [stateTone, strong] = CELL_TONES[state];
  const tone = state === 'blocked' && cell.valueLabel === '—' ? 'dim' : stateTone;
  const isFocus = focus?.id === cell.id && state !== 'void';
  const value = state === 'pending' ? '·' : isFocus && state === 'active' && isCellResult(result) ? result : cell.valueLabel;
  const quiet = state === 'pending' || state === 'void';
  return {
    id: cell.id,
    row: cell.row,
    col: cell.col,
    state,
    tone,
    strong: strong || (isFocus && tone !== 'plain' && tone !== 'dim'),
    focus: isFocus,
    value,
    dot: isDpNumber(value),
    mark: state === 'active',
    tag: state === 'candidate' ? dpCandidateTag(cell, focus) : null,
    caption: quiet ? null : dpCellCaption(cell.metaLabel),
    hint: state === 'pending' && cell.status === 'match' ? 'match' : null,
  };
}

export function dpDisplayRows(state: DpTraceState, phase: SortStep['phase'] | undefined): readonly (readonly DpDisplayCell[])[] {
  const focus = dpFocusCell(state);
  const pending = dpPendingIds(state, phase);
  const byRow = state.rowHeaders.map(() => [] as DpCell[]);
  const result = state.computation?.result ?? null;
  for (const cell of state.cells) byRow[cell.row]?.push(cell);
  return byRow.map((cells) =>
    cells
      .sort((left, right) => left.col - right.col)
      .map((cell) => dpDisplayCell(cell, focus, pending, state.tableShape, result)),
  );
}

export function dpHeaderTones(headers: readonly DpHeader[]): readonly DpHeaderTone[] {
  const resting = new Set<DpHeaderStatus>();
  const settled = headers.filter((header) => header.status !== 'active');
  if (settled.length > 2) {
    for (const status of RESTING_STATUSES) {
      const count = settled.filter((header) => header.status === status).length;
      if (count >= settled.length - 1) resting.add(status);
    }
  }
  return headers.map((header) => (resting.has(header.status) ? 'idle' : HEADER_TONES[header.status]));
}

export function dpColumnAxis(state: DpTraceState): DpColumnAxis {
  if (state.mode === 'knapsack-01') return { caption: DP.capacityAxis, columnMeta: false };
  const metas = state.colHeaders.slice(1).map((header) => header.metaLabel);
  const shared = metas.length > 1 && metas[0] && metas.every((meta) => meta === metas[0]);
  if (shared) return { caption: dpLabelText(metas[0]), columnMeta: false };
  return { caption: null, columnMeta: state.colHeaders.some((header) => header.metaLabel) };
}

export function dpDisplayHeaders(headers: readonly DpHeader[], withMeta: boolean): readonly DpDisplayHeader[] {
  const tones = dpHeaderTones(headers);
  return headers.map((header, index) => ({
    id: header.id,
    label: dpLabelText(header.label),
    meta: withMeta && header.metaLabel ? dpLabelText(header.metaLabel) : null,
    tone: tones[index] ?? 'idle',
  }));
}

export function dpParseItem(item: TranslatableText): { readonly lead: TranslatableText; readonly value: TranslatableText | null } {
  if (typeof item !== 'string') return { lead: item, value: null };
  const knapsack = item.match(/^(.+) w(\d+)\/v(\d+)$/);
  if (knapsack) return { lead: knapsack[1]!, value: `w${knapsack[2]} · v${knapsack[3]}` };
  const pair = item.match(/^([^:=]+?)\s*[:=]\s*(.+)$/);
  if (pair) return { lead: pair[1]!, value: pair[2]! };
  return { lead: dpLabelText(item), value: null };
}

export function dpPrimaryRackMeta(mode: DpMode): string | null {
  return PRIMARY_RACK_META[mode] ?? null;
}

export function dpPrimaryRows(state: DpTraceState): readonly DpRackRow[] {
  return dpRackRows(state, state.primaryItems, PRIMARY_AXES[state.mode] ?? null, 'primary');
}

export function dpSecondaryRows(state: DpTraceState): readonly DpRackRow[] {
  return dpRackRows(state, state.secondaryItems, SECONDARY_AXES[state.mode] ?? null, 'secondary');
}

export function dpReadouts(state: DpTraceState): readonly DpReadout[] {
  return state.insights
    .filter((insight) => insight.value !== state.dimensionsLabel && !isShapeInsight(insight))
    .map((insight, index) => ({
      id: `insight-${index}`,
      label: insight.label,
      value: insight.value,
      dot: isDpNumber(insight.value),
      tone: INSIGHT_TONES[insight.tone],
    }));
}

export function dpMaxValueLength(state: DpTraceState): number {
  return state.cells.reduce((max, cell) => Math.max(max, cell.valueLabel.length), 1);
}

export function dpRowHeadChars(state: DpTraceState): number {
  return state.rowHeaders.reduce(
    (max, header) => Math.max(max, header.label.length + 2, (header.metaLabel?.length ?? 0) + 2),
    4,
  );
}

export function dpTableMetrics(input: DpTableMetricsInput): DpTableMetrics {
  const width = input.width > 0 ? input.width : FALLBACK_WIDTH;
  const height = input.height > 0 ? input.height : FALLBACK_HEIGHT;
  const cols = Math.max(1, input.cols);
  const rows = Math.max(1, input.rows);
  const rowHeadWidth = clamp(Math.round(input.rowHeadChars * ROW_HEAD_CHAR + ROW_HEAD_PADDING), ROW_HEAD_MIN, ROW_HEAD_MAX);
  const cellWidth = clamp(Math.floor((width - rowHeadWidth - DP_CELL_GAP * cols) / cols), MIN_CELL, MAX_CELL);
  const cellHeight = clamp(
    Math.floor((height - input.headerHeight - DP_CELL_GAP * rows) / rows),
    MIN_CELL_HEIGHT,
    Math.min(MAX_CELL_HEIGHT, cellWidth + 6),
  );
  const fits = (size: number) =>
    input.maxValueLength * size * DOT_GLYPH_RATIO + CELL_PADDING <= cellWidth && size <= cellHeight * 0.55;
  const valueSize = DOT_SIZES.find(fits);
  const overflow =
    rowHeadWidth + cols * (cellWidth + DP_CELL_GAP) > width ||
    input.headerHeight + rows * (cellHeight + DP_CELL_GAP) > height;
  return valueSize
    ? { rowHeadWidth, cellWidth, cellHeight, valueSize, dot: true, overflow }
    : { rowHeadWidth, cellWidth, cellHeight, valueSize: 12, dot: false, overflow };
}

function dpRackRows(
  state: DpTraceState,
  items: readonly TranslatableText[],
  axis: DpItemAxis | null,
  prefix: string,
): readonly DpRackRow[] {
  const headers = axis ? (axis.axis === 'row' ? state.rowHeaders : state.colHeaders) : [];
  const mapped = axis !== null && headers.length - axis.offset === items.length;
  if (!axis || !mapped) {
    return items.map((item, index) => ({ id: `${prefix}-${index}`, ...plainRow(item), tone: 'default', led: null }));
  }
  const itemHeaders = headers.slice(axis.offset);
  const metaVaries = new Set(itemHeaders.map((header) => header.metaLabel)).size === itemHeaders.length;
  const focus = dpFocusCell(state);
  const tracing = state.cells.some((cell) => cell.status === 'backtrack');
  const focusIndex = focus && !tracing ? (axis.axis === 'row' ? focus.row : focus.col) - axis.offset : -1;
  const headerTones = dpHeaderTones(itemHeaders);
  const headerActive = itemHeaders.findIndex((header) => header.status === 'active');
  const activeIndex = focusIndex >= 0 ? focusIndex : tracing ? -1 : headerActive;
  return items.map((item, index) => {
    const header = itemHeaders[index]!;
    const content = metaVaries
      ? { lead: dpLabelText(header.label), value: header.metaLabel ? dpLabelText(header.metaLabel) : null }
      : dpParseItem(item);
    const tone = itemTone(index, activeIndex, axis.progress, headerTones[index] === 'pink' && activeIndex < 0);
    return {
      id: `${prefix}-${index}`,
      lead: content.lead,
      value: content.value,
      valueDot: isDpNumber(content.value),
      tone,
      led: tone === 'done' ? 'lime' : tone === 'now' ? 'cyan' : null,
    };
  });
}

function itemTone(index: number, activeIndex: number, progress: boolean, packed: boolean): RackRowTone {
  if (activeIndex < 0) return packed ? 'done' : 'default';
  if (index === activeIndex) return 'now';
  if (!progress) return 'default';
  return index < activeIndex ? 'done' : 'dim';
}

function plainRow(item: TranslatableText): Pick<DpRackRow, 'lead' | 'value' | 'valueDot'> {
  const content = dpParseItem(item);
  return { ...content, valueDot: isDpNumber(content.value) };
}

function isCellResult(result: TranslatableText | null): result is string {
  return typeof result === 'string' && (isDpNumber(result) || /^[TF∞]$/.test(result));
}

function isShapeInsight(insight: DpInsight): boolean {
  return typeof insight.label === 'string' && SHAPE_INSIGHT.test(insight.label);
}

function isBaseCell(cell: DpCell): boolean {
  return cell.status === 'base' || cell.tags.includes('base');
}

function isAfter(cell: DpCell, focus: DpCell): boolean {
  return cell.row > focus.row || (cell.row === focus.row && cell.col > focus.col);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
