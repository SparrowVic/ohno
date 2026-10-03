import { GeometryCoord, GeometryEventChip } from '../../models/geometry';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import type { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';

export interface PlaneBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly step: number;
}

export interface PlaneBox {
  readonly width: number;
  readonly height: number;
}

export interface PlaneMargin {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export interface PlaneFrame {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly scale: number;
  readonly bounds: PlaneBounds;
}

export interface PlanePixel {
  readonly x: number;
  readonly y: number;
}

export interface PlaneGridLine {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly edge: boolean;
}

export interface PlaneTick {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

export interface PlaneRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PlaneGrid {
  readonly viewBox: string;
  readonly plot: PlaneRect;
  readonly lines: readonly PlaneGridLine[];
  readonly xTicks: readonly PlaneTick[];
  readonly yTicks: readonly PlaneTick[];
}

export type GeoTone = 'slate' | 'cyan' | 'pink' | 'lime' | 'violet' | 'amber' | 'red' | 'ink' | 'dim';
export type GeoAccent = 'cyan' | 'pink' | 'lime' | 'violet' | 'amber' | 'red';

export interface GeoRackRow {
  readonly id: string;
  readonly lead: TranslatableText;
  readonly body: TranslatableText | null;
  readonly value: string | null;
  readonly tone: RackRowTone;
  readonly accent: GeoAccent | null;
  readonly strong: boolean;
  readonly current: boolean;
  readonly led: LedColor | null;
}

export interface GeoReadoutView {
  readonly title: TranslatableText;
  readonly caption: TranslatableText | null;
  readonly value: string;
  readonly tone: GeoTone;
  readonly verdict: TranslatableText | null;
  readonly led: LedColor | null;
}

export const PLANE_MARGIN: PlaneMargin = { left: 30, right: 14, top: 14, bottom: 26 };
export const PLANE_FALLBACK_BOX: PlaneBox = { width: 640, height: 420 };
const DEFAULT_BOUNDS: PlaneBounds = { minX: 0, maxX: 100, minY: 0, maxY: 100, step: 10 };
const NICE_STEPS = [1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 500];
const MAX_DIVISIONS = 10;
const MINUS = '−';
const CHIP_GLYPH = 6.2;
const CHIP_PADDING = 6;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function snapDown(value: number, step: number): number {
  return round2(Math.floor(value / step + 1e-9) * step);
}

function snapUp(value: number, step: number): number {
  return round2(Math.ceil(value / step - 1e-9) * step);
}

export function planeBounds(coords: readonly GeometryCoord[]): PlaneBounds {
  const finite = coords.filter((coord) => Number.isFinite(coord.x) && Number.isFinite(coord.y));
  if (finite.length === 0) return DEFAULT_BOUNDS;
  const xs = finite.map((coord) => coord.x);
  const ys = finite.map((coord) => coord.y);
  const rawMinX = Math.min(...xs);
  const rawMaxX = Math.max(...xs);
  const rawMinY = Math.min(...ys);
  const rawMaxY = Math.max(...ys);
  const span = Math.max(rawMaxX - rawMinX, rawMaxY - rawMinY, 1);
  const step = NICE_STEPS.find((candidate) => span / candidate <= MAX_DIVISIONS) ?? NICE_STEPS[NICE_STEPS.length - 1]!;
  const minX = snapDown(rawMinX, step);
  const minY = snapDown(rawMinY, step);
  const maxX = Math.max(snapUp(rawMaxX, step), round2(minX + step));
  const maxY = Math.max(snapUp(rawMaxY, step), round2(minY + step));
  return { minX, maxX, minY, maxY, step };
}

export function planeFrame(bounds: PlaneBounds, box: PlaneBox, margin: PlaneMargin = PLANE_MARGIN): PlaneFrame {
  const width = Math.max(1, box.width || PLANE_FALLBACK_BOX.width);
  const height = Math.max(1, box.height || PLANE_FALLBACK_BOX.height);
  const availableWidth = Math.max(1, width - margin.left - margin.right);
  const availableHeight = Math.max(1, height - margin.top - margin.bottom);
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  const scale = Math.min(availableWidth / spanX, availableHeight / spanY);
  const plotWidth = round2(spanX * scale);
  const plotHeight = round2(spanY * scale);
  return {
    width: round2(width),
    height: round2(height),
    left: round2(margin.left + (availableWidth - plotWidth) / 2),
    top: round2(margin.top + (availableHeight - plotHeight) / 2),
    plotWidth,
    plotHeight,
    scale,
    bounds,
  };
}

export function projectX(frame: PlaneFrame, x: number): number {
  return round2(frame.left + (x - frame.bounds.minX) * frame.scale);
}

export function projectY(frame: PlaneFrame, y: number): number {
  return round2(frame.top + (frame.bounds.maxY - y) * frame.scale);
}

export function project(frame: PlaneFrame, coord: GeometryCoord): PlanePixel {
  return { x: projectX(frame, coord.x), y: projectY(frame, coord.y) };
}

export function projectLength(frame: PlaneFrame, length: number): number {
  return round2(length * frame.scale);
}

export function planePoints(frame: PlaneFrame, coords: readonly GeometryCoord[]): string {
  return coords
    .map((coord) => {
      const pixel = project(frame, coord);
      return `${pixel.x},${pixel.y}`;
    })
    .join(' ');
}

export function chipWidth(text: string): number {
  return Math.round(text.length * CHIP_GLYPH + CHIP_PADDING * 2);
}

export function formatNumber(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits));
  const text = String(Math.abs(rounded));
  return rounded < 0 ? `${MINUS}${text}` : text;
}

export function formatSigned(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits));
  if (rounded === 0) return '0';
  return `${rounded > 0 ? '+' : MINUS}${String(Math.abs(rounded))}`;
}

function tickValues(min: number, max: number, step: number): readonly number[] {
  const count = Math.round((max - min) / step);
  return Array.from({ length: count + 1 }, (_, index) => round2(min + index * step));
}

export function planeGrid(frame: PlaneFrame): PlaneGrid {
  const { bounds } = frame;
  const right = round2(frame.left + frame.plotWidth);
  const bottom = round2(frame.top + frame.plotHeight);
  const xs = tickValues(bounds.minX, bounds.maxX, bounds.step);
  const ys = tickValues(bounds.minY, bounds.maxY, bounds.step);
  const vertical = xs.map((value, index) => {
    const x = projectX(frame, value);
    return { id: `x${index}`, x1: x, y1: frame.top, x2: x, y2: bottom, edge: index === 0 || index === xs.length - 1 };
  });
  const horizontal = ys.map((value, index) => {
    const y = projectY(frame, value);
    return { id: `y${index}`, x1: frame.left, y1: y, x2: right, y2: y, edge: index === 0 || index === ys.length - 1 };
  });
  return {
    viewBox: `0 0 ${frame.width} ${frame.height}`,
    plot: { x: frame.left, y: frame.top, width: frame.plotWidth, height: frame.plotHeight },
    lines: [...vertical, ...horizontal],
    xTicks: xs.map((value, index) => ({ id: `tx${index}`, label: formatNumber(value, 2), x: projectX(frame, value), y: round2(bottom + 15) })),
    yTicks: ys.map((value, index) => ({ id: `ty${index}`, label: formatNumber(value, 2), x: round2(frame.left - 7), y: projectY(frame, value) })),
  };
}

export function turnArcPath(origin: PlanePixel, vertex: PlanePixel, target: PlanePixel, radius: number): string | null {
  const fromAngle = Math.atan2(origin.y - vertex.y, origin.x - vertex.x);
  const toAngle = Math.atan2(target.y - vertex.y, target.x - vertex.x);
  if (!Number.isFinite(fromAngle) || !Number.isFinite(toAngle)) return null;
  let delta = toAngle - fromAngle;
  while (delta <= -Math.PI) delta += Math.PI * 2;
  while (delta > Math.PI) delta -= Math.PI * 2;
  if (Math.abs(delta) < 1e-3) return null;
  const start = { x: round2(vertex.x + radius * Math.cos(fromAngle)), y: round2(vertex.y + radius * Math.sin(fromAngle)) };
  const end = { x: round2(vertex.x + radius * Math.cos(toAngle)), y: round2(vertex.y + radius * Math.sin(toAngle)) };
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${delta > 0 ? 1 : 0} ${end.x} ${end.y}`;
}

export function rackRow(partial: Partial<GeoRackRow> & Pick<GeoRackRow, 'id' | 'lead'>): GeoRackRow {
  return {
    body: null,
    value: null,
    tone: 'default',
    accent: null,
    strong: false,
    current: false,
    led: null,
    ...partial,
  };
}

const EVENT_TONES: Readonly<Record<GeometryEventChip['tone'], { tone: RackRowTone; led: LedColor; current: boolean }>> = {
  current: { tone: 'head', led: 'cyan', current: true },
  done: { tone: 'default', led: 'lime', current: false },
  queued: { tone: 'default', led: 'slate', current: false },
};

export function eventRows(
  events: readonly GeometryEventChip[],
  lead: (event: GeometryEventChip) => TranslatableText,
  value: (event: GeometryEventChip) => string | null,
  body: (event: GeometryEventChip) => TranslatableText | null = () => null,
): readonly GeoRackRow[] {
  return events.map((event) => {
    const look = EVENT_TONES[event.tone];
    return rackRow({
      id: event.id,
      lead: lead(event),
      body: body(event),
      value: value(event),
      tone: look.tone,
      current: look.current,
      led: look.led,
    });
  });
}

export function eventProgress(events: readonly GeometryEventChip[]): string {
  const done = events.filter((event) => event.tone === 'done').length;
  return `${done}/${events.length}`;
}
