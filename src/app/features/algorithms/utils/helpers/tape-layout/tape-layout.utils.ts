export interface TapeMetrics {
  readonly gap: number;
  readonly inset: number;
  readonly minCell: number;
  readonly maxCell: number;
  readonly pad: number;
  readonly advance: number;
  readonly fonts: readonly number[];
}

export interface TapeLayout {
  readonly cell: number;
  readonly font: number;
  readonly pitch: number;
  readonly scrolls: boolean;
}

export interface TapeSpan {
  readonly left: number;
  readonly width: number;
}

export interface LaneItem {
  readonly index: number;
  readonly width: number;
}

export const CHIP_METRICS = {
  charWidth: 6.4,
  pad: 16,
  spacing: 4,
} as const;

export function tapeLayout(count: number, maxChars: number, width: number, metrics: TapeMetrics): TapeLayout {
  const slots = Math.max(1, count);
  const room = Math.max(0, width - metrics.inset * 2 - (slots - 1) * metrics.gap);
  const available = Math.floor(room / slots);
  const fonts = metrics.fonts.length > 0 ? metrics.fonts : [14];
  for (const font of fonts) {
    const need = cellNeed(maxChars, font, metrics);
    if (available >= need) {
      const cell = Math.min(available, Math.max(need, metrics.maxCell));
      return { cell, font, pitch: cell + metrics.gap, scrolls: false };
    }
  }
  const font = fonts[fonts.length - 1] ?? 14;
  const cell = cellNeed(maxChars, font, metrics);
  return { cell, font, pitch: cell + metrics.gap, scrolls: true };
}

export function cellNeed(maxChars: number, font: number, metrics: TapeMetrics): number {
  const glyphs = Math.max(1, maxChars);
  return Math.max(metrics.minCell, Math.ceil(glyphs * font * metrics.advance + metrics.pad));
}

export function tapeSpan(from: number, to: number, layout: TapeLayout, outset = 0): TapeSpan {
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  return {
    left: start * layout.pitch - outset,
    width: (end - start + 1) * layout.pitch - (layout.pitch - layout.cell) + outset * 2,
  };
}

export function tapeCenter(index: number, layout: TapeLayout): number {
  return index * layout.pitch + layout.cell / 2;
}

export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

export function chipWidth(label: string): number {
  return Math.ceil(Math.max(1, label.length) * CHIP_METRICS.charWidth + CHIP_METRICS.pad);
}

export function assignLanes(items: readonly LaneItem[], pitch: number): number[] {
  const order = items.map((item, position) => ({ item, position })).sort((a, b) => a.item.index - b.item.index);
  const laneEnds: { center: number; half: number }[] = [];
  const lanes = new Array<number>(items.length).fill(0);
  for (const { item, position } of order) {
    const center = item.index * pitch;
    const half = item.width / 2;
    let lane = laneEnds.findIndex((end) => center - half >= end.center + end.half + CHIP_METRICS.spacing);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = { center, half };
    lanes[position] = lane;
  }
  return lanes;
}

export function maxChars(values: readonly (string | number)[]): number {
  return values.reduce<number>((longest, value) => Math.max(longest, String(value).length), 1);
}
