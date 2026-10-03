import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  PointerLabCellStatus,
  PointerLabMode,
  PointerLabPointer,
  PointerLabStat,
  PointerLabTraceState,
  PointerLabWindow,
} from '../../models/pointer-lab';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import {
  TapeLayout,
  TapeMetrics,
  TapeSpan,
  assignLanes,
  chipWidth,
  clampIndex,
  tapeCenter,
  tapeSpan,
} from '../../utils/helpers/tape-layout/tape-layout.utils';

export type PointerCellTone = 'idle' | 'cyan' | 'pink' | 'lime' | 'red' | 'settled' | 'dim' | 'window';

export type PointerChipTone = 'cyan' | 'pink' | 'violet' | 'lime' | 'slate';

export type PointerBandTone = 'cyan' | 'lime' | 'amber';

export interface PointerTapeCell {
  readonly index: number;
  readonly glyph: string;
  readonly symbol: boolean;
  readonly tone: PointerCellTone;
  readonly overlay: string | null;
  readonly focus: boolean;
}

export interface PointerCursor {
  readonly id: string;
  readonly label: string;
  readonly index: number;
  readonly off: boolean;
  readonly tone: PointerChipTone;
  readonly side: 'top' | 'bottom';
  readonly lane: number;
  readonly x: number;
}

export interface PointerBand extends TapeSpan {
  readonly from: number;
  readonly to: number;
  readonly tone: PointerBandTone;
}

export interface PointerStatRow {
  readonly id: string;
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly led: LedColor;
  readonly dot: boolean;
}

export interface PointerTapeView {
  readonly cells: readonly PointerTapeCell[];
  readonly focus: number | null;
  readonly window: PointerLabWindow | null;
}

export interface PointerLanes {
  readonly top: number;
  readonly bottom: number;
}

export const POINTER_TAPE_METRICS: TapeMetrics = {
  gap: 5,
  inset: 14,
  minCell: 34,
  maxCell: 58,
  pad: 14,
  advance: 0.62,
  fonts: [22, 20, 18, 16, 14],
};

export const POINTER_BAND_OUTSET = 5;

export const POINTER_CELL_TONES: Readonly<Record<PointerLabCellStatus, PointerCellTone>> = {
  idle: 'idle',
  left: 'cyan',
  right: 'pink',
  window: 'window',
  match: 'lime',
  mismatch: 'red',
  swap: 'pink',
  settled: 'settled',
  best: 'lime',
};

export const POINTER_SETTLED_TONES: Readonly<Record<PointerLabMode, PointerCellTone>> = {
  'two-pointers': 'dim',
  'sliding-window': 'dim',
  kadane: 'dim',
  'palindrome-check': 'settled',
  reverse: 'settled',
};

export function pointerCellTone(mode: PointerLabMode, status: PointerLabCellStatus): PointerCellTone {
  return status === 'settled' ? POINTER_SETTLED_TONES[mode] : POINTER_CELL_TONES[status];
}

export const POINTER_CHIP_TONES: Readonly<Record<PointerLabPointer['tone'], PointerChipTone>> = {
  accent: 'cyan',
  warm: 'pink',
  route: 'violet',
  hit: 'lime',
  muted: 'slate',
};

export const POINTER_BAND_TONES: Readonly<Record<PointerLabWindow['tone'], PointerBandTone>> = {
  active: 'cyan',
  best: 'lime',
  preview: 'amber',
};

export const POINTER_STAT_LEDS: Readonly<Record<PointerLabStat['tone'], LedColor>> = {
  info: 'slate',
  accent: 'cyan',
  warning: 'amber',
  success: 'lime',
  danger: 'red',
};

const VISIBLE_GLYPHS: Readonly<Record<string, string>> = {
  ' ': '␣',
  '': '·',
};

const NUMERIC = /^-?\d+(?:\.\d+)?$/;

export function pointerGlyph(value: string): string {
  return VISIBLE_GLYPHS[value] ?? value;
}

export function pointerFocus(state: PointerLabTraceState): number | null {
  const count = state.cells.length;
  if (count === 0 || state.pointers.length === 0) return null;
  const indices = state.pointers.map((pointer) => clampIndex(pointer.index, count));
  return Math.round(indices.reduce((sum, index) => sum + index, 0) / indices.length);
}

export function pointerTapeView(state: PointerLabTraceState): PointerTapeView {
  const focus = pointerFocus(state);
  return {
    cells: state.cells.map((cell) => ({
      index: cell.index,
      glyph: pointerGlyph(cell.value),
      symbol: cell.value in VISIBLE_GLYPHS,
      tone: pointerCellTone(state.mode, cell.status),
      overlay: cell.overlay,
      focus: cell.index === focus,
    })),
    focus,
    window: state.window,
  };
}

export function pointerCursors(state: PointerLabTraceState, layout: TapeLayout): PointerCursor[] {
  const count = state.cells.length;
  const placed = state.pointers.map((pointer) => ({ pointer, index: clampIndex(pointer.index, count) }));
  const lanes = new Map<string, number>();
  for (const side of ['top', 'bottom'] as const) {
    const group = placed.filter((entry) => entry.pointer.side === side);
    const assigned = assignLanes(
      group.map((entry) => ({ index: entry.index, width: chipWidth(entry.pointer.label) })),
      layout.pitch,
    );
    group.forEach((entry, position) => lanes.set(entry.pointer.id, assigned[position] ?? 0));
  }
  return placed.map(({ pointer, index }) => ({
    id: pointer.id,
    label: pointer.label,
    index,
    off: pointer.index !== index,
    tone: POINTER_CHIP_TONES[pointer.tone],
    side: pointer.side,
    lane: lanes.get(pointer.id) ?? 0,
    x: tapeCenter(index, layout),
  }));
}

export function pointerLanes(cursors: readonly PointerCursor[]): PointerLanes {
  const depth = (side: 'top' | 'bottom') =>
    cursors.filter((cursor) => cursor.side === side).reduce((deepest, cursor) => Math.max(deepest, cursor.lane + 1), 1);
  return { top: depth('top'), bottom: depth('bottom') };
}

export function pointerBand(window: PointerLabWindow | null, count: number, layout: TapeLayout): PointerBand | null {
  if (!window || count === 0) return null;
  const from = clampIndex(Math.min(window.left, window.right), count);
  const to = clampIndex(Math.max(window.left, window.right), count);
  return { from, to, tone: POINTER_BAND_TONES[window.tone], ...tapeSpan(from, to, layout, POINTER_BAND_OUTSET) };
}

export function isDotValue(value: TranslatableText): boolean {
  return typeof value === 'string' && !looksLikeI18nKey(value) && NUMERIC.test(value.trim());
}

export function pointerStatRows(state: PointerLabTraceState): PointerStatRow[] {
  return state.stats.map((stat, index) => ({
    id: `stat-${index}`,
    label: stat.label,
    value: stat.value,
    led: POINTER_STAT_LEDS[stat.tone],
    dot: isDotValue(stat.value),
  }));
}

export function pointerChars(state: PointerLabTraceState): number {
  return state.cells.reduce((longest, cell) => Math.max(longest, pointerGlyph(cell.value).length), 1);
}
