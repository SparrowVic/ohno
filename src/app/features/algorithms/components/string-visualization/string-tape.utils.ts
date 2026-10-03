import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';

export type StringTone = 'idle' | 'dim' | 'ink' | 'cyan' | 'pink' | 'lime' | 'amber' | 'violet';
export type StringRowKind = 'tape' | 'values' | 'compact';
export type StringCaptionTone = 'default' | 'amber' | 'cyan' | 'lime';
export type StringMarkerVariant = 'head' | 'band';
export type StringNoteTone = 'pink' | 'amber' | 'violet' | 'cyan' | 'lime';

export interface StringCell {
  readonly key: string;
  readonly column: number;
  readonly glyph: string;
  readonly index: string | null;
  readonly tone: StringTone;
  readonly strong: boolean;
  readonly lead: boolean;
}

export interface StringRow {
  readonly id: string;
  readonly kind: StringRowKind;
  readonly caption: TranslatableText | null;
  readonly captionTone: StringCaptionTone;
  readonly aside: TranslatableText | null;
  readonly cells: readonly StringCell[];
}

export interface StringMarker {
  readonly id: string;
  readonly variant: StringMarkerVariant;
  readonly tone: StringTone;
  readonly fromRow: string;
  readonly toRow: string;
  readonly fromColumn: number;
  readonly toColumn: number;
  readonly label: TranslatableText | null;
}

export interface StringRackRow {
  readonly id: string;
  readonly lead: TranslatableText;
  readonly body: TranslatableText | null;
  readonly value: string | null;
  readonly tone: RackRowTone;
  readonly led: LedColor | null;
}

export interface StringRack {
  readonly id: string;
  readonly title: TranslatableText;
  readonly meta: string | null;
  readonly rows: readonly StringRackRow[];
  readonly empty: readonly TranslatableText[];
}

export interface StringFact {
  readonly id: string;
  readonly label: TranslatableText;
  readonly value: string;
  readonly tone: StringTone;
}

export interface StringNote {
  readonly id: string;
  readonly title: TranslatableText;
  readonly lines: readonly TranslatableText[];
  readonly tone: StringNoteTone;
}

export interface StringTreeNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly value: string | null;
  readonly tone: LedColor;
  readonly current: boolean;
}

export interface StringTreeEdge {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly tone: 'plain' | 'lime' | 'pink' | 'cyan' | 'amber' | 'dim';
  readonly label: string | null;
  readonly curved: boolean;
}

export interface StringTree {
  readonly caption: TranslatableText;
  readonly width: number;
  readonly height: number;
  readonly nodes: readonly StringTreeNode[];
  readonly edges: readonly StringTreeEdge[];
}

export interface StringDisplay {
  readonly rows: readonly StringRow[];
  readonly markers: readonly StringMarker[];
  readonly racks: readonly StringRack[];
  readonly facts: readonly StringFact[];
  readonly notes: readonly StringNote[];
  readonly tree: StringTree | null;
}

export const EMPTY_GLYPH = '·';

export function cell(
  key: string,
  column: number,
  glyph: string,
  tone: StringTone,
  options: { readonly index?: string | null; readonly strong?: boolean; readonly lead?: boolean } = {},
): StringCell {
  return {
    key,
    column,
    glyph: glyph === '' ? EMPTY_GLYPH : glyph,
    index: options.index ?? null,
    tone,
    strong: options.strong ?? false,
    lead: options.lead ?? false,
  };
}

export function charCells(
  prefix: string,
  source: string,
  offset: number,
  toneAt: (index: number) => StringTone,
  showIndex = true,
): readonly StringCell[] {
  return Array.from(source, (glyph, index) =>
    cell(`${prefix}${index}`, offset + index, glyph, toneAt(index), { index: showIndex ? String(index) : null }),
  );
}

export function valueCells(
  prefix: string,
  values: readonly (number | string | null)[],
  offset: number,
  toneAt: (index: number) => StringTone,
  strongAt: (index: number) => boolean = () => false,
): readonly StringCell[] {
  return values.map((value, index) =>
    cell(`${prefix}${index}`, offset + index, value === null ? EMPTY_GLYPH : String(value), toneAt(index), {
      strong: strongAt(index),
    }),
  );
}

export function row(
  id: string,
  kind: StringRowKind,
  cells: readonly StringCell[],
  options: {
    readonly caption?: TranslatableText | null;
    readonly captionTone?: StringCaptionTone;
    readonly aside?: TranslatableText | null;
  } = {},
): StringRow {
  return {
    id,
    kind,
    caption: options.caption ?? null,
    captionTone: options.captionTone ?? 'default',
    aside: options.aside ?? null,
    cells,
  };
}

export function head(
  id: string,
  tone: StringTone,
  fromRow: string,
  toRow: string,
  column: number,
  label: TranslatableText | null,
): StringMarker {
  return { id, variant: 'head', tone, fromRow, toRow, fromColumn: column, toColumn: column, label };
}

export function band(
  id: string,
  tone: StringTone,
  rowId: string,
  fromColumn: number,
  toColumn: number,
  label: TranslatableText | null = null,
  toRow: string = rowId,
): StringMarker {
  return {
    id,
    variant: 'band',
    tone,
    fromRow: rowId,
    toRow,
    fromColumn: Math.min(fromColumn, toColumn),
    toColumn: Math.max(fromColumn, toColumn),
    label,
  };
}

export function inRange(index: number, start: number, length: number): boolean {
  return index >= start && index < start + length;
}

export function occurrences(text: string, pattern: string): readonly number[] {
  if (pattern.length === 0 || pattern.length > text.length) return [];
  const starts: number[] = [];
  for (let start = 0; start + pattern.length <= text.length; start++) {
    if (text.startsWith(pattern, start)) starts.push(start);
  }
  return starts;
}

export function displayChar(char: string): string {
  return char === ' ' ? '␣' : char;
}

export function emptyDisplay(): StringDisplay {
  return { rows: [], markers: [], racks: [], facts: [], notes: [], tree: null };
}

export const ROW_HEIGHTS: Readonly<Record<StringRowKind | 'caption' | 'labelGap', number>> = {
  caption: 20,
  labelGap: 18,
  tape: 62,
  values: 42,
  compact: 27,
};

export interface StringGridLines {
  readonly template: string;
  readonly columns: number;
  readonly caption: Readonly<Record<string, number>>;
  readonly body: Readonly<Record<string, number>>;
}

export function stringGridLines(rows: readonly StringRow[]): StringGridLines {
  const tracks: number[] = [];
  const caption: Record<string, number> = {};
  const body: Record<string, number> = {};
  let columns = 1;
  for (const entry of rows) {
    const captioned = entry.caption !== null || entry.aside !== null;
    const below = entry.kind === 'values';
    if (captioned && !below) {
      tracks.push(ROW_HEIGHTS.caption);
      caption[entry.id] = tracks.length;
    }
    tracks.push(ROW_HEIGHTS[entry.kind]);
    body[entry.id] = tracks.length;
    if (captioned && below) {
      tracks.push(ROW_HEIGHTS.labelGap, ROW_HEIGHTS.caption);
      caption[entry.id] = tracks.length;
    }
    for (const item of entry.cells) columns = Math.max(columns, item.column + 1);
  }
  return { template: tracks.map((height) => `${height}px`).join(' '), columns, caption, body };
}

export const CELL_GAP = 3;
export const GRID_INSET = 14;

export interface StringCellMetrics {
  readonly width: number;
  readonly font: number;
}

export function stringCellMetrics(available: number, columns: number, compact: boolean): StringCellMetrics {
  const min = compact ? 22 : 24;
  const max = compact ? 30 : 40;
  const usable = available - GRID_INSET * 2 + CELL_GAP;
  const fit = columns > 0 ? Math.floor(usable / columns) - CELL_GAP : max;
  const width = Math.max(min, Math.min(max, fit));
  return { width, font: width >= 32 ? 18 : width >= 27 ? 16 : 14 };
}
