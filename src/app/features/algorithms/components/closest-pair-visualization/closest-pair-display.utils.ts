import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { ClosestPairStepState, GeometryBand, GeometryPairLine, GeometryPoint } from '../../models/geometry';
import { dividerText } from '../geo-canvas/geometry-labels.utils';
import {
  GeoRackRow,
  GeoReadoutView,
  GeoTone,
  LabelOffset,
  PlaneBox,
  PlaneGrid,
  PlanePixel,
  PlaneRect,
  chipBox,
  chipWidth,
  dotBox,
  formatNumber,
  frameBounds,
  labelBox,
  planeBounds,
  planeFrame,
  pickPlacement,
  placePointLabels,
  planeGrid,
  project,
  projectX,
  rackRow,
} from '../geo-canvas/plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;

export interface ClosestPointView {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly tone: GeoTone;
  readonly current: boolean;
  readonly label: LabelOffset;
}

export interface ClosestBandView {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly tone: GeoTone;
  readonly hollow: boolean;
}

export interface ClosestDividerView {
  readonly id: string;
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
  readonly tone: GeoTone;
  readonly label: TranslatableText;
}

export interface ClosestPairLineView {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly tone: GeoTone;
  readonly dashed: boolean;
  readonly chipX: number;
  readonly chipY: number;
  readonly distance: string;
  readonly chipWidth: number;
}

export interface ClosestPairView {
  readonly grid: PlaneGrid;
  readonly bands: readonly ClosestBandView[];
  readonly dividers: readonly ClosestDividerView[];
  readonly pairs: readonly ClosestPairLineView[];
  readonly points: readonly ClosestPointView[];
  readonly trailRows: readonly GeoRackRow[];
  readonly readout: GeoReadoutView;
}

const POINT_TONES: Readonly<Record<string, GeoTone>> = {
  compare: 'cyan',
  best: 'lime',
  strip: 'amber',
  left: 'violet',
  right: 'ink',
  dimmed: 'dim',
};

const BAND_TONES: Readonly<Record<GeometryBand['tone'], GeoTone>> = {
  region: 'slate',
  left: 'violet',
  right: 'ink',
  strip: 'amber',
};

const PAIR_TONES: Readonly<Record<GeometryPairLine['tone'], { tone: GeoTone; dashed: boolean }>> = {
  candidate: { tone: 'cyan', dashed: true },
  best: { tone: 'lime', dashed: false },
  final: { tone: 'lime', dashed: false },
};

export function closestPointTone(point: GeometryPoint): GeoTone {
  return POINT_TONES[point.status] ?? 'slate';
}

export function closestTrailRows(state: ClosestPairStepState): readonly GeoRackRow[] {
  const steps = state.trail.map((step, index) =>
    rackRow({
      id: `trail-${index}`,
      lead: String(index).padStart(2, '0'),
      body: step,
      tone: index === state.trail.length - 1 ? 'head' : 'default',
      current: index === state.trail.length - 1,
    }),
  );
  return [
    ...steps,
    rackRow({ id: 'region', lead: GEO.closestPair.region, body: state.regionLabel, accent: 'violet' }),
  ];
}

function pairText(pair: readonly [number, number] | null): string | null {
  return pair ? `P${pair[0]} · P${pair[1]}` : null;
}

export function closestReadout(state: ClosestPairStepState): GeoReadoutView {
  const value = state.bestDistance === null ? '—' : formatNumber(state.bestDistance, 2);
  const base = { title: GEO.closestPair.bestPair, caption: pairText(state.bestPair), value, tone: (state.bestDistance === null ? 'dim' : 'lime') as GeoTone };
  if (state.phase === 'complete') return { ...base, verdict: GEO.verdict.closestFound, led: 'lime' };
  if (state.phase === 'update') return { ...base, verdict: GEO.verdict.better, led: 'lime' };
  if (state.currentPair && state.candidateDistance !== null) {
    return {
      ...base,
      verdict: i18nText(GEO.verdict.candidate, { pair: pairText(state.currentPair), value: formatNumber(state.candidateDistance, 2) }),
      led: 'cyan',
    };
  }
  return { ...base, verdict: state.bestDistance === null ? GEO.closestPair.noPair : null, led: null };
}

const CHIP_LIFTS = [14, 26];
const CHIP_STOPS = [0.5, 0.3, 0.7, 0.15, 0.85];

export function chipCenters(a: PlanePixel, b: PlanePixel): readonly PlanePixel[] {
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const normal = { x: -(b.y - a.y) / length, y: (b.x - a.x) / length };
  const upward = normal.y <= 0 ? normal : { x: -normal.x, y: -normal.y };
  return CHIP_LIFTS.flatMap((lift) =>
    CHIP_STOPS.flatMap((stop) => {
      const base = { x: a.x + (b.x - a.x) * stop, y: a.y + (b.y - a.y) * stop };
      return [1, -1].map((side) => ({
        x: Math.round(base.x + upward.x * lift * side),
        y: Math.round(base.y + upward.y * lift * side),
      }));
    }),
  );
}

export function closestPairView(state: ClosestPairStepState, box: PlaneBox): ClosestPairView {
  const frame = planeFrame(planeBounds(state.points), box);
  const byId = new Map(state.points.map((point) => [point.id, point]));
  const top = frame.top;
  const bottom = frame.top + frame.plotHeight;
  const clampX = (x: number) => Math.min(frame.left + frame.plotWidth, Math.max(frame.left, projectX(frame, x)));
  const current = state.currentPair?.[1] ?? null;
  const bounds = frameBounds(frame);
  const pixels = state.points.map((point) => project(frame, point));
  const requests = state.points.map((point, index) => ({ ...pixels[index]!, text: String(point.id) }));
  const labels = placePointLabels(requests, [], bounds);
  const taken: PlaneRect[] = [
    ...pixels.map((pixel) => dotBox(pixel)),
    ...requests.map((request, index) => labelBox(request.x, request.y, request.text, labels[index]!)),
  ];
  return {
    grid: planeGrid(frame),
    bands: state.bands.map((band, index) => {
      const x0 = clampX(band.x0);
      const x1 = clampX(band.x1);
      return { id: `band-${index}`, x: x0, y: top, width: Math.max(0, x1 - x0), height: frame.plotHeight, tone: BAND_TONES[band.tone], hollow: band.tone === 'region' };
    }),
    dividers: state.dividers.map((divider, index) => ({
      id: `divider-${index}`,
      x: clampX(divider.x),
      y1: top,
      y2: bottom,
      tone: divider.tone === 'strip' ? 'amber' : 'ink',
      label: dividerText(divider.label),
    })),
    pairs: state.pairLines.flatMap((pair, index) => {
      const from = byId.get(pair.pointIds[0]);
      const to = byId.get(pair.pointIds[1]);
      if (!from || !to) return [];
      const a = project(frame, from);
      const b = project(frame, to);
      const look = PAIR_TONES[pair.tone];
      const distance = formatNumber(pair.distance, 2);
      const width = chipWidth(distance);
      const centers = chipCenters(a, b);
      const boxes = centers.map((center) => chipBox(center, width));
      const slot = pickPlacement(boxes, taken, bounds);
      taken.push(boxes[slot]!);
      return [{
        id: `pair-${index}-${pair.tone}`,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        tone: look.tone,
        dashed: look.dashed,
        chipX: centers[slot]!.x,
        chipY: centers[slot]!.y,
        distance,
        chipWidth: width,
      }];
    }),
    points: state.points.map((point, index) => ({
      id: point.id,
      x: pixels[index]!.x,
      y: pixels[index]!.y,
      tone: closestPointTone(point),
      current: point.id === current,
      label: labels[index]!,
    })),
    trailRows: closestTrailRows(state),
    readout: closestReadout(state),
  };
}
