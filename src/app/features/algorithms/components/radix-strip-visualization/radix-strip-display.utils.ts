import type { SortItemSnapshot } from '../../models/sort-step';
import {
  RadixBin,
  RadixDigit,
  RadixPhase,
  RadixState,
  isSettledPhase,
  radixBins,
  radixDigits,
} from './radix-digits.utils';

export type RadixStripTone = 'idle' | 'cyan' | 'pink' | 'lime';

export type RadixStripLane = 'input' | 'output';

export interface RadixStripDigit extends RadixDigit {
  readonly tone: RadixStripTone;
}

export interface RadixStripCell {
  readonly key: string;
  readonly slot: number;
  readonly id: string | null;
  readonly value: number | null;
  readonly tone: RadixStripTone;
  readonly head: boolean;
  readonly digits: readonly RadixStripDigit[];
}

export interface RadixStripHead {
  readonly slot: number;
  readonly bucket: number;
  readonly tone: 'cyan' | 'pink';
  readonly arrow: '↓' | '↑';
}

export interface RadixStripView {
  readonly lane: RadixStripLane;
  readonly placeTone: 'cyan' | 'lime' | null;
  readonly cells: readonly RadixStripCell[];
  readonly head: RadixStripHead | null;
  readonly bins: readonly RadixBin[];
}

export interface RadixTapeLayout {
  readonly cell: number;
  readonly font: 14 | 16 | 18;
  readonly scrolls: boolean;
}

export const RADIX_TAPE_METRICS = {
  gap: 3,
  inset: 8,
  cellPad: 2,
  maxCell: 64,
  advance: 0.6,
} as const;

export const RADIX_BIN_METRICS = {
  gap: 6,
  pad: 5,
} as const;

const TAPE_FONTS = [18, 16, 14] as const;

const OUTPUT_PHASES: ReadonlySet<RadixPhase> = new Set<RadixPhase>(['gather', 'pass-complete', 'complete']);

export function radixStripView(state: RadixState): RadixStripView {
  const head = stripHead(state);
  return {
    lane: OUTPUT_PHASES.has(state.phase) ? 'output' : 'input',
    placeTone: state.exponent === null ? null : isSettledPhase(state.phase) ? 'lime' : 'cyan',
    cells: stripCells(state, head),
    head,
    bins: radixBins(state),
  };
}

export function radixCellWidth(digits: number, font: number): number {
  const { advance, cellPad } = RADIX_TAPE_METRICS;
  return Math.ceil(Math.max(1, digits) * font * advance + cellPad * 2);
}

export function radixTapeLayout(count: number, maxDigits: number, width: number): RadixTapeLayout {
  const { gap, inset, maxCell } = RADIX_TAPE_METRICS;
  const slots = Math.max(1, count);
  const fitted = Math.floor((Math.max(0, width - inset * 2) - gap * (slots - 1)) / slots);
  const minCell = radixCellWidth(maxDigits, 14);
  const cell = Math.min(Math.max(maxCell, minCell), Math.max(minCell, fitted));
  const font = TAPE_FONTS.find((size) => radixCellWidth(maxDigits, size) <= cell) ?? 14;
  return { cell, font, scrolls: fitted < minCell };
}

export function radixBinColumns(width: number, maxDigits: number): 5 | 10 {
  const { gap, pad } = RADIX_BIN_METRICS;
  const narrowest = radixCellWidth(maxDigits, 14) + pad * 2;
  return width >= narrowest * 10 + gap * 9 ? 10 : 5;
}

function stripHead(state: RadixState): RadixStripHead | null {
  if (state.activeId === null || state.activeBucket === null) return null;
  if (state.phase === 'distribute') {
    const slot = state.source.findIndex((item) => item.id === state.activeId);
    return slot < 0 ? null : { slot, bucket: state.activeBucket, tone: 'pink', arrow: '↓' };
  }
  if (state.phase === 'gather') {
    const slot = state.output.findIndex((item) => item.id === state.activeId);
    return slot < 0 ? null : { slot, bucket: state.activeBucket, tone: 'cyan', arrow: '↑' };
  }
  return null;
}

function stripCells(state: RadixState, head: RadixStripHead | null): RadixStripCell[] {
  switch (state.phase) {
    case 'focus-digit':
      return state.source.map((item, slot) => filledCell(item, slot, 'idle', 'cyan', state, false));
    case 'distribute': {
      const routed = new Set(state.buckets.flatMap((items) => items.map((item) => item.id)));
      return state.source.map((item, slot) => {
        if (head?.slot === slot) return filledCell(item, slot, 'pink', 'pink', state, true);
        if (routed.has(item.id)) return emptyCell(slot);
        return filledCell(item, slot, 'idle', 'cyan', state, false);
      });
    }
    case 'gather':
      return state.source.map((_, slot) => {
        const item = state.output[slot];
        if (!item) return emptyCell(slot);
        const active = head?.slot === slot;
        const tone = active ? 'cyan' : 'lime';
        return filledCell(item, slot, tone, tone, state, active);
      });
    case 'pass-complete':
    case 'complete':
      return state.output.map((item, slot) => filledCell(item, slot, 'lime', 'lime', state, false));
    default:
      return state.source.map((item, slot) => filledCell(item, slot, 'idle', 'idle', state, false));
  }
}

function filledCell(
  item: SortItemSnapshot,
  slot: number,
  tone: RadixStripTone,
  mark: RadixStripTone,
  state: RadixState,
  head: boolean,
): RadixStripCell {
  return {
    key: item.id,
    slot,
    id: item.id,
    value: item.value,
    tone,
    head,
    digits: radixDigits(item.value, state.maxDigits).map((digit) => ({
      ...digit,
      tone: digitTone(digit, mark, state),
    })),
  };
}

function digitTone(digit: RadixDigit, mark: RadixStripTone, state: RadixState): RadixStripTone {
  if (state.phase === 'complete') return digit.lead ? 'idle' : 'lime';
  return digit.exponent === state.exponent ? mark : 'idle';
}

function emptyCell(slot: number): RadixStripCell {
  return { key: `slot-${slot}`, slot, id: null, value: null, tone: 'idle', head: false, digits: [] };
}
