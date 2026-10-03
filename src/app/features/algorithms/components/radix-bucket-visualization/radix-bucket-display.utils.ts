import type { SortItemSnapshot, SortPhase, SortStep } from '../../models/sort-step';

export type RadixCardTone = 'idle' | 'pink' | 'lime';
export type RadixDigitTone = 'cyan' | 'pink' | 'lime';
export type RadixBinTone = 'idle' | 'cyan' | 'pink';
export type RadixStreamRole = 'input' | 'output';
export type RadixValueFont = 'dot' | 'mono';
export type RadixPlaceName = 'ones' | 'tens' | 'hundreds' | 'power';

export type RadixCardPlacement =
  | { readonly zone: 'stream'; readonly slot: number }
  | { readonly zone: 'bin'; readonly bucket: number; readonly index: number };

export interface RadixCardView {
  readonly id: string;
  readonly value: number;
  readonly digits: readonly string[];
  readonly tone: RadixCardTone;
  readonly active: boolean;
  readonly full: boolean;
  readonly litIndex: number | null;
  readonly litTone: RadixDigitTone | null;
  readonly placement: RadixCardPlacement;
}

export interface RadixBinView {
  readonly bucket: number;
  readonly count: number;
  readonly tone: RadixBinTone;
}

export interface RadixFlight {
  readonly kind: 'distribute' | 'gather';
  readonly slot: number;
  readonly bucket: number;
}

export interface RadixPlace {
  readonly exponent: number;
  readonly name: RadixPlaceName;
  readonly tone: RadixDigitTone;
}

export interface RadixScene {
  readonly phase: SortPhase;
  readonly cards: readonly RadixCardView[];
  readonly bins: readonly RadixBinView[];
  readonly role: RadixStreamRole;
  readonly slotCount: number;
  readonly maxDigits: number;
  readonly maxLoad: number;
  readonly activeId: string | null;
  readonly place: RadixPlace | null;
  readonly flight: RadixFlight | null;
}

export interface RadixLayoutInput {
  readonly width: number;
  readonly height: number;
  readonly count: number;
  readonly maxDigits: number;
  readonly maxLoad: number;
}

export interface RadixCardMetrics {
  readonly width: number;
  readonly fullHeight: number;
  readonly compactHeight: number;
  readonly valueFont: RadixValueFont;
  readonly valueSize: number;
  readonly valueCap: number;
  readonly digitSize: number;
  readonly digitCap: number;
  readonly digitPitch: number;
  readonly padY: number;
}

export interface RadixStreamGrid {
  readonly x: number;
  readonly y: number;
  readonly columns: number;
  readonly rows: number;
  readonly gapX: number;
  readonly gapY: number;
  readonly width: number;
  readonly height: number;
}

export interface RadixBinGrid {
  readonly x: number;
  readonly y: number;
  readonly columns: number;
  readonly rows: number;
  readonly width: number;
  readonly height: number;
  readonly gapX: number;
  readonly gapY: number;
  readonly header: number;
  readonly padding: number;
  readonly pitch: number;
  readonly capacity: number;
}

export interface RadixBucketLayout {
  readonly width: number;
  readonly height: number;
  readonly naturalHeight: number;
  readonly card: RadixCardMetrics;
  readonly stream: RadixStreamGrid;
  readonly bins: RadixBinGrid;
  readonly labels: { readonly streamY: number; readonly binsY: number };
}

export interface RadixPoint {
  readonly x: number;
  readonly y: number;
}

export interface RadixRect extends RadixPoint {
  readonly width: number;
  readonly height: number;
}

export interface RadixCardFrame extends RadixRect {
  readonly fullness: number;
  readonly hidden: boolean;
}

export interface RadixCardText {
  readonly valueX: number;
  readonly valueY: number;
  readonly digitsY: number;
  readonly digitXs: readonly number[];
  readonly digitsOpacity: number;
}

export interface RadixGuide {
  readonly from: RadixPoint;
  readonly to: RadixPoint;
}

export interface RadixBinSlot {
  readonly slot: number;
  readonly hidden: boolean;
}

export const RADIX_BUCKET_COUNT = 10;

export const RADIX_BUCKET_METRICS = {
  labelLine: 18,
  zoneGap: 28,
  zoneGapGrowth: 28,
  streamGapY: 8,
  streamGapRatio: 0.32,
  cardPadX: 4,
  cardPadY: 7,
  cardRowGap: 6,
  cardMaxWidth: 54,
  compactPad: 6,
  binGapY: 14,
  binHeader: 26,
  binPadding: 5,
  stackGap: 3,
  naturalCapacityMin: 4,
  naturalCapacityMax: 9,
  naturalHeadroom: 1,
  minCapacity: 2,
  dotMin: 14,
  dotMax: 18,
  monoMin: 10,
  monoMax: 13,
  digitSize: 10,
  digitSpacingMin: 2,
  digitSpacingMax: 4,
  glyphAdvance: 0.6,
  dotCap: 0.7,
  monoCap: 0.73,
} as const;

const TIGHT_SPACING = {
  labelLine: 16,
  zoneGap: 20,
  binHeader: 22,
  compactPad: 5,
  stackGap: 2,
  streamGapY: 6,
  dotMax: 15,
  naturalCapacityMin: 3,
  naturalHeadroom: 0,
} as const;

const COMFORT_SPACING = {
  labelLine: RADIX_BUCKET_METRICS.labelLine,
  zoneGap: RADIX_BUCKET_METRICS.zoneGap,
  binHeader: RADIX_BUCKET_METRICS.binHeader,
  compactPad: RADIX_BUCKET_METRICS.compactPad,
  stackGap: RADIX_BUCKET_METRICS.stackGap,
  streamGapY: RADIX_BUCKET_METRICS.streamGapY,
  dotMax: RADIX_BUCKET_METRICS.dotMax,
  naturalCapacityMin: RADIX_BUCKET_METRICS.naturalCapacityMin,
  naturalHeadroom: RADIX_BUCKET_METRICS.naturalHeadroom,
} as const;

type Spacing = { readonly [K in keyof typeof COMFORT_SPACING]: number };

const PASS_PHASES: ReadonlySet<SortPhase> = new Set<SortPhase>(['focus-digit', 'distribute', 'gather', 'pass-complete']);
const OUTPUT_PHASES: ReadonlySet<SortPhase> = new Set<SortPhase>(['gather', 'pass-complete', 'complete']);
const SETTLED_PHASES: ReadonlySet<SortPhase> = new Set<SortPhase>(['pass-complete', 'complete']);

export function radixDigitCount(value: number): number {
  return Math.max(1, String(Math.max(0, Math.floor(value))).length);
}

export function radixDigitAt(value: number, exponent: number): number {
  return Math.floor(value / 10 ** exponent) % 10;
}

export function radixDigits(value: number, maxDigits: number): string[] {
  return String(Math.max(0, Math.floor(value))).padStart(maxDigits, '0').split('');
}

export function radixPlaceName(exponent: number): RadixPlaceName {
  if (exponent === 0) return 'ones';
  if (exponent === 1) return 'tens';
  if (exponent === 2) return 'hundreds';
  return 'power';
}

export function radixMaxLoad(values: readonly number[], maxDigits: number): number {
  let max = 0;
  for (let exponent = 0; exponent < maxDigits; exponent++) {
    const counts = new Array<number>(RADIX_BUCKET_COUNT).fill(0);
    for (const value of values) counts[radixDigitAt(value, exponent)]++;
    max = Math.max(max, ...counts);
  }
  return max;
}

export function radixScene(step: SortStep | null, array: readonly number[]): RadixScene {
  const fallback: SortItemSnapshot[] = array.map((value, index) => ({ id: `rdx-${index}`, value }));
  const items = step?.items ?? fallback;
  const source = step?.sourceItems?.length ? step.sourceItems : items;
  const phase: SortPhase = step?.phase ?? 'idle';
  const unique = uniqueItems(source, items, step?.buckets?.flatMap((bucket) => bucket.items) ?? []);
  const values = unique.map((item) => item.value);
  const maxDigits = step?.maxDigits ?? radixDigitCount(Math.max(0, ...values));
  const moving = phase === 'distribute' || phase === 'gather';
  const activeId = moving ? (step?.activeItemId ?? null) : null;
  const activeBucket = moving ? (step?.activeBucket ?? null) : null;
  const exponent = step?.digitIndex ?? null;
  const litIndex = exponent !== null && exponent < maxDigits && phase !== 'complete' ? maxDigits - 1 - exponent : null;
  const bucketOf = bucketPlacements(step);
  const streamOrder = phase === 'distribute' ? source : items;
  const sourceSlots = indexById(source);
  const streamSlots = indexById(streamOrder);

  const cards = unique.map<RadixCardView>((item) => {
    const active = item.id === activeId;
    const inBin = bucketOf.get(item.id);
    const placement: RadixCardPlacement = inBin
      ? { zone: 'bin', bucket: inBin.bucket, index: inBin.index }
      : { zone: 'stream', slot: streamSlots.get(item.id) ?? sourceSlots.get(item.id) ?? 0 };
    const litTone = litIndex === null ? null : digitTone(phase, active);
    return {
      id: item.id,
      value: item.value,
      digits: radixDigits(item.value, maxDigits),
      tone: SETTLED_PHASES.has(phase) ? 'lime' : active ? 'pink' : 'idle',
      active,
      full: placement.zone === 'stream' || active,
      litIndex: litTone ? litIndex : null,
      litTone,
      placement,
    };
  });

  const bins = Array.from({ length: RADIX_BUCKET_COUNT }, (_, bucket): RadixBinView => ({
    bucket,
    count: step?.buckets?.find((entry) => entry.bucket === bucket)?.items.length ?? 0,
    tone: bucket === activeBucket ? (phase === 'distribute' ? 'pink' : 'cyan') : 'idle',
  }));

  return {
    phase,
    cards,
    bins,
    role: OUTPUT_PHASES.has(phase) ? 'output' : 'input',
    slotCount: Math.max(source.length, items.length, unique.length),
    maxDigits,
    maxLoad: radixMaxLoad(values, maxDigits),
    activeId,
    place:
      exponent !== null && PASS_PHASES.has(phase)
        ? { exponent, name: radixPlaceName(exponent), tone: phase === 'pass-complete' ? 'lime' : 'cyan' }
        : null,
    flight: flightFor(phase, activeId, activeBucket, sourceSlots, streamSlots, bucketOf),
  };
}

function uniqueItems(...groups: readonly (readonly SortItemSnapshot[])[]): SortItemSnapshot[] {
  const byId = new Map<string, SortItemSnapshot>();
  for (const group of groups) {
    for (const item of group) if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return [...byId.values()];
}

function bucketPlacements(step: SortStep | null): Map<string, { bucket: number; index: number }> {
  const placements = new Map<string, { bucket: number; index: number }>();
  for (const entry of step?.buckets ?? []) {
    entry.items.forEach((item, index) => placements.set(item.id, { bucket: entry.bucket, index }));
  }
  return placements;
}

function indexById(items: readonly SortItemSnapshot[]): Map<string, number> {
  return new Map(items.map((item, index) => [item.id, index]));
}

function digitTone(phase: SortPhase, active: boolean): RadixDigitTone | null {
  if (phase === 'focus-digit') return 'cyan';
  if (phase === 'distribute' || phase === 'gather') return active ? 'pink' : 'cyan';
  if (phase === 'pass-complete') return 'lime';
  return null;
}

function flightFor(
  phase: SortPhase,
  activeId: string | null,
  activeBucket: number | null,
  sourceSlots: ReadonlyMap<string, number>,
  streamSlots: ReadonlyMap<string, number>,
  bucketOf: ReadonlyMap<string, { bucket: number; index: number }>,
): RadixFlight | null {
  if (activeId === null || activeBucket === null) return null;
  if (phase === 'distribute') {
    const slot = sourceSlots.get(activeId);
    const target = bucketOf.get(activeId);
    return slot === undefined || !target ? null : { kind: 'distribute', slot, bucket: target.bucket };
  }
  const slot = streamSlots.get(activeId);
  return slot === undefined ? null : { kind: 'gather', slot, bucket: activeBucket };
}

export function radixCardMetrics(width: number, maxDigits: number, spacing: Spacing = COMFORT_SPACING): RadixCardMetrics {
  const m = RADIX_BUCKET_METRICS;
  const inner = Math.max(0, width - m.cardPadX * 2);
  const fitted = Math.floor(inner / (maxDigits * m.glyphAdvance));
  const dot = fitted >= m.dotMin;
  const valueSize = dot ? Math.min(spacing.dotMax, fitted) : clamp(fitted, m.monoMin, m.monoMax);
  const valueCap = valueSize * (dot ? m.dotCap : m.monoCap);
  const digitCap = m.digitSize * m.monoCap;
  const spacingX = clamp(
    (inner - maxDigits * m.digitSize * m.glyphAdvance) / Math.max(1, maxDigits - 1),
    m.digitSpacingMin,
    m.digitSpacingMax,
  );
  return {
    width,
    fullHeight: Math.ceil(m.cardPadY * 2 + valueCap + m.cardRowGap + digitCap),
    compactHeight: Math.ceil(valueCap + spacing.compactPad * 2),
    valueFont: dot ? 'dot' : 'mono',
    valueSize,
    valueCap,
    digitSize: m.digitSize,
    digitCap,
    digitPitch: m.digitSize * m.glyphAdvance + spacingX,
    padY: m.cardPadY,
  };
}

export function radixMinCardWidth(maxDigits: number): number {
  const m = RADIX_BUCKET_METRICS;
  const value = maxDigits * m.glyphAdvance * m.dotMin;
  const digits = maxDigits * m.glyphAdvance * m.digitSize + (maxDigits - 1) * m.digitSpacingMin;
  return Math.max(value, digits) + m.cardPadX * 2;
}

function streamColumns(width: number, count: number, minWidth: number): { columns: number; gapX: number; cardWidth: number } {
  for (let rows = 1; rows <= count; rows++) {
    const columns = Math.ceil(count / rows);
    const gapX = clamp((width / columns) * 0.14, 4, 10);
    const cardWidth = (width - (columns - 1) * gapX) / columns;
    if (cardWidth >= minWidth) return { columns, gapX, cardWidth };
  }
  return { columns: 1, gapX: 4, cardWidth: width };
}

export function radixBucketLayout(input: RadixLayoutInput): RadixBucketLayout {
  const comfort = layoutWith(input, COMFORT_SPACING);
  const narrow = comfort.bins.rows > 1;
  if (input.height <= 0) return narrow ? layoutWith(input, TIGHT_SPACING) : comfort;
  const naturalHeight = narrow ? layoutWith({ ...input, height: 0 }, TIGHT_SPACING).naturalHeight : comfort.naturalHeight;
  if (comfort.bins.capacity >= input.maxLoad && radixLayoutFits(comfort)) return { ...comfort, naturalHeight };
  const tight = layoutWith(input, TIGHT_SPACING);
  const preferTight = tight.bins.capacity > comfort.bins.capacity || !radixLayoutFits(comfort);
  return { ...(preferTight ? tight : comfort), naturalHeight };
}

export function radixLayoutFits(layout: RadixBucketLayout): boolean {
  const { bins } = layout;
  return bins.y + bins.rows * bins.height + (bins.rows - 1) * bins.gapY <= layout.height + 0.5;
}

function layoutWith(input: RadixLayoutInput, spacing: Spacing): RadixBucketLayout {
  const m = RADIX_BUCKET_METRICS;
  const width = Math.max(1, input.width);
  const count = Math.max(1, input.count);
  const maxDigits = Math.max(1, input.maxDigits);
  const minWidth = radixMinCardWidth(maxDigits);

  const wideGap = clamp(width * 0.01, 6, 10);
  const wideBin = (width - (RADIX_BUCKET_COUNT - 1) * wideGap) / RADIX_BUCKET_COUNT;
  const binColumns = wideBin - m.binPadding * 2 >= minWidth ? RADIX_BUCKET_COUNT : RADIX_BUCKET_COUNT / 2;
  const binRows = RADIX_BUCKET_COUNT / binColumns;
  const binGapX = binColumns === RADIX_BUCKET_COUNT ? wideGap : clamp(width * 0.02, 6, 10);
  const binWidth = (width - (binColumns - 1) * binGapX) / binColumns;

  const stream = streamColumns(width, count, minWidth);
  const cardWidth = Math.floor(Math.min(stream.cardWidth, binWidth - m.binPadding * 2, m.cardMaxWidth));
  const card = radixCardMetrics(cardWidth, maxDigits, spacing);
  const streamRows = Math.ceil(count / stream.columns);
  const spread = stream.columns > 1 ? (width - stream.columns * cardWidth) / (stream.columns - 1) : 0;
  const streamGapX = clamp(spread, stream.gapX, Math.max(stream.gapX, cardWidth * m.streamGapRatio));
  const streamWidth = stream.columns * cardWidth + (stream.columns - 1) * streamGapX;
  const streamHeight = streamRows * card.fullHeight + (streamRows - 1) * spacing.streamGapY;
  const binsTop = spacing.labelLine + streamHeight + spacing.zoneGap;
  const pitch = card.compactHeight + spacing.stackGap;
  const binHeightFor = (capacity: number) => spacing.binHeader + (capacity - 1) * pitch + card.fullHeight + m.binPadding;
  const contentHeightFor = (binHeight: number) => binsTop + binRows * binHeight + (binRows - 1) * m.binGapY;
  const naturalCapacity = clamp(input.maxLoad + spacing.naturalHeadroom, spacing.naturalCapacityMin, m.naturalCapacityMax);
  const naturalHeight = Math.ceil(contentHeightFor(binHeightFor(naturalCapacity)));
  const height = input.height > 0 ? input.height : naturalHeight;
  const available = Math.max(0, (height - binsTop - (binRows - 1) * m.binGapY) / binRows);
  const fitted = Math.max(m.minCapacity, Math.floor((available - binHeightFor(1)) / pitch) + 1);
  const capacity = Math.min(fitted, Math.max(naturalCapacity, input.maxLoad));
  const binHeight = capacity < fitted ? binHeightFor(capacity) : Math.max(available, binHeightFor(capacity));
  const leftover = Math.max(0, height - contentHeightFor(binHeight));
  const extraGap = Math.floor(Math.min(leftover / 2, m.zoneGapGrowth));
  const offsetY = Math.floor((leftover - extraGap) / 2);
  const streamY = offsetY + spacing.labelLine;
  const binsY = offsetY + binsTop + extraGap;

  return {
    width,
    height,
    naturalHeight,
    card,
    stream: {
      x: (width - streamWidth) / 2,
      y: streamY,
      columns: stream.columns,
      rows: streamRows,
      gapX: streamGapX,
      gapY: spacing.streamGapY,
      width: streamWidth,
      height: streamHeight,
    },
    bins: {
      x: 0,
      y: binsY,
      columns: binColumns,
      rows: binRows,
      width: binWidth,
      height: binHeight,
      gapX: binGapX,
      gapY: m.binGapY,
      header: spacing.binHeader,
      padding: m.binPadding,
      pitch,
      capacity,
    },
    labels: { streamY: streamY - 8, binsY: binsY - Math.round(spacing.zoneGap * 0.32) },
  };
}

export function radixStreamSlot(layout: RadixBucketLayout, slot: number): RadixPoint {
  const { stream, card } = layout;
  const column = slot % stream.columns;
  const row = Math.floor(slot / stream.columns);
  return {
    x: stream.x + column * (card.width + stream.gapX),
    y: stream.y + row * (card.fullHeight + stream.gapY),
  };
}

export function radixBinRect(layout: RadixBucketLayout, bucket: number): RadixRect {
  const { bins } = layout;
  const column = bucket % bins.columns;
  const row = Math.floor(bucket / bins.columns);
  return {
    x: bins.x + column * (bins.width + bins.gapX),
    y: bins.y + row * (bins.height + bins.gapY),
    width: bins.width,
    height: bins.height,
  };
}

export function radixBinSlot(layout: RadixBucketLayout, bucket: number, slot: number): RadixPoint {
  const rect = radixBinRect(layout, bucket);
  return {
    x: rect.x + (rect.width - layout.card.width) / 2,
    y: rect.y + layout.bins.header + slot * layout.bins.pitch,
  };
}

export function radixVisibleBinSlot(index: number, count: number, capacity: number, active: boolean): RadixBinSlot {
  if (count <= capacity || index < capacity - 1) return { slot: index, hidden: false };
  return { slot: capacity - 1, hidden: !active };
}

export function radixOverflow(count: number, capacity: number): number {
  return count > capacity ? count - (capacity - 1) : 0;
}

export function radixCardFrame(layout: RadixBucketLayout, scene: RadixScene, card: RadixCardView): RadixCardFrame {
  const height = card.full ? layout.card.fullHeight : layout.card.compactHeight;
  const fullness = card.full ? 1 : 0;
  if (card.placement.zone === 'stream') {
    const point = radixStreamSlot(layout, card.placement.slot);
    return { ...point, width: layout.card.width, height, fullness, hidden: false };
  }
  const { bucket, index } = card.placement;
  const count = scene.bins[bucket]?.count ?? index + 1;
  const visible = radixVisibleBinSlot(index, count, layout.bins.capacity, card.active);
  const point = radixBinSlot(layout, bucket, visible.slot);
  return { ...point, width: layout.card.width, height, fullness, hidden: visible.hidden };
}

export function radixChipVisible(scene: RadixScene, bucket: number, capacity: number): boolean {
  const count = scene.bins[bucket]?.count ?? 0;
  if (radixOverflow(count, capacity) === 0) return false;
  const active = scene.cards.find((card) => card.active);
  return !(active?.placement.zone === 'bin' && active.placement.bucket === bucket && active.placement.index >= capacity - 1);
}

export function radixCardText(metrics: RadixCardMetrics, digitCount: number, height: number, fullness: number): RadixCardText {
  const compactBaseline = (height + metrics.valueCap) / 2;
  const fullBaseline = metrics.padY + metrics.valueCap;
  const center = metrics.width / 2;
  return {
    valueX: center,
    valueY: lerp(compactBaseline, fullBaseline, fullness),
    digitsY: height - metrics.padY + 1,
    digitXs: Array.from({ length: digitCount }, (_, index) => center + (index - (digitCount - 1) / 2) * metrics.digitPitch),
    digitsOpacity: clamp(fullness * 1.5 - 0.5, 0, 1),
  };
}

export function radixGuide(layout: RadixBucketLayout, scene: RadixScene): RadixGuide | null {
  const flight = scene.flight;
  if (!flight) return null;
  const slot = radixStreamSlot(layout, flight.slot);
  const streamAnchor = { x: slot.x + layout.card.width / 2, y: slot.y + layout.card.fullHeight };
  const bin = radixBinRect(layout, flight.bucket);
  const binAnchor = { x: bin.x + bin.width / 2, y: bin.y };
  return flight.kind === 'distribute' ? { from: streamAnchor, to: binAnchor } : { from: binAnchor, to: streamAnchor };
}

export function radixGuidePath(guide: RadixGuide): string {
  const { from, to } = guide;
  const middle = (from.y + to.y) / 2;
  return `M ${round(from.x)} ${round(from.y)} C ${round(from.x)} ${round(middle)}, ${round(to.x)} ${round(middle)}, ${round(to.x)} ${round(to.y)}`;
}

export function radixFlightPoint(from: RadixPoint, to: RadixPoint, progress: number): RadixPoint {
  const middle = (from.y + to.y) / 2;
  const inverse = 1 - progress;
  const a = inverse * inverse * inverse;
  const b = 3 * inverse * inverse * progress;
  const c = 3 * inverse * progress * progress;
  const d = progress * progress * progress;
  return {
    x: a * from.x + b * from.x + c * to.x + d * to.x,
    y: a * from.y + b * middle + c * middle + d * to.y,
  };
}

export function radixZoneChanges(
  previous: readonly RadixCardView[],
  next: readonly RadixCardView[],
): number {
  const zones = new Map(previous.map((card) => [card.id, zoneKey(card.placement)]));
  return next.filter((card) => zones.has(card.id) && zones.get(card.id) !== zoneKey(card.placement)).length;
}

function zoneKey(placement: RadixCardPlacement): string {
  return placement.zone === 'stream' ? 'stream' : `bin-${placement.bucket}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
