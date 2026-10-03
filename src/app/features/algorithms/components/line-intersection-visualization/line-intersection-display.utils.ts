import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { GeometrySegmentLine, LineIntersectionStepState } from '../../models/geometry';
import { lineEventText } from '../geo-canvas/geometry-labels.utils';
import {
  GeoRackRow,
  GeoReadoutView,
  GeoTone,
  LabelOffset,
  PlaneBox,
  PlaneGrid,
  eventProgress,
  eventRows,
  dotBox,
  formatNumber,
  frameBounds,
  placeLabels,
  planeBounds,
  planeFrame,
  planeGrid,
  project,
  projectX,
  rackRow,
} from '../geo-canvas/plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;

export interface SegmentView {
  readonly id: string;
  readonly label: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly tone: GeoTone;
  readonly bold: boolean;
  readonly labelOffset: LabelOffset;
}

export interface CrossingView {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly tone: GeoTone;
  readonly current: boolean;
}

export interface SweepView {
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
  readonly label: TranslatableText;
}

export interface LineIntersectionView {
  readonly grid: PlaneGrid;
  readonly segments: readonly SegmentView[];
  readonly crossings: readonly CrossingView[];
  readonly sweep: SweepView | null;
  readonly eventRows: readonly GeoRackRow[];
  readonly eventMeta: string;
  readonly orderRows: readonly GeoRackRow[];
  readonly readout: GeoReadoutView;
}

const SEGMENT_TONES: Readonly<Record<GeometrySegmentLine['tone'], GeoTone>> = {
  pending: 'slate',
  active: 'ink',
  focus: 'cyan',
  hit: 'lime',
  done: 'dim',
};

export function eventSegment(eventId: string): string | null {
  const match = eventId.match(/^(?:start|end)-(\d+)$/);
  return match ? `S${match[1]}` : null;
}

export function lineReadout(state: LineIntersectionStepState): GeoReadoutView {
  const base = { title: GEO.crossings, caption: null, value: String(state.foundCount), tone: (state.foundCount > 0 ? 'lime' : 'dim') as GeoTone };
  const segment = eventSegment(state.currentEventLabel);
  const current = state.intersections.find((marker) => marker.tone === 'current');
  if (state.phase === 'intersection' && current) {
    return { ...base, verdict: i18nText(GEO.verdict.crossFound, { x: formatNumber(current.x), y: formatNumber(current.y) }), led: 'lime' };
  }
  if (state.phase === 'activate' && segment) return { ...base, verdict: i18nText(GEO.verdict.inserted, { segment }), led: 'cyan' };
  if (state.phase === 'retire' && segment) return { ...base, verdict: i18nText(GEO.verdict.retired, { segment }), led: 'slate' };
  if (state.phase === 'complete') return { ...base, verdict: GEO.verdict.sweepDone, led: 'lime' };
  return { ...base, verdict: GEO.verdict.waiting, led: null };
}

export function lineOrderRows(state: LineIntersectionStepState): readonly GeoRackRow[] {
  const focus = new Set(state.segments.filter((segment) => segment.tone === 'focus').map((segment) => segment.id));
  return [...state.activeOrder].reverse().map((id, index) =>
    rackRow({ id: `order-${id}`, lead: id, value: String(state.activeOrder.length - index), accent: focus.has(id) ? 'cyan' : null, strong: focus.has(id) }),
  );
}

const SEGMENT_LABEL_OFFSETS: readonly LabelOffset[] = [
  { dx: -7, dy: 3, anchor: 'end' },
  { dx: 0, dy: -8, anchor: 'middle' },
  { dx: 0, dy: 15, anchor: 'middle' },
  { dx: -7, dy: -7, anchor: 'end' },
  { dx: -7, dy: 13, anchor: 'end' },
];

export function lineIntersectionView(state: LineIntersectionStepState, box: PlaneBox): LineIntersectionView {
  const coords = state.segments.flatMap((segment) => [segment.start, segment.end]);
  const frame = planeFrame(planeBounds(coords), box);
  const sweepX = state.sweepX === null ? null : Math.min(frame.left + frame.plotWidth, Math.max(frame.left, projectX(frame, state.sweepX)));
  const ends = state.segments.map((segment) => [project(frame, segment.start), project(frame, segment.end)] as const);
  const obstacles = [
    ...ends.flatMap(([start, end]) => [dotBox(start, 4), dotBox(end, 4)]),
    ...state.intersections.map((marker) => dotBox(project(frame, marker))),
  ];
  const labels = placeLabels(
    state.segments.map((segment, index) => ({ ...ends[index]![0], text: segment.label })),
    obstacles,
    frameBounds(frame),
    SEGMENT_LABEL_OFFSETS,
  );
  return {
    grid: planeGrid(frame),
    segments: state.segments.map((segment, index) => {
      const [start, end] = ends[index]!;
      const tone = SEGMENT_TONES[segment.tone];
      return {
        id: segment.id,
        label: segment.label,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        tone,
        bold: tone === 'cyan' || tone === 'lime',
        labelOffset: labels[index]!,
      };
    }),
    crossings: state.intersections.map((marker) => {
      const pixel = project(frame, marker);
      const current = marker.tone === 'current';
      return { id: marker.id, x: pixel.x, y: pixel.y, tone: current ? 'cyan' : 'lime', current };
    }),
    sweep:
      sweepX === null || state.phase === 'complete'
        ? null
        : { x: sweepX, y1: frame.top, y2: frame.top + frame.plotHeight, label: i18nText(GEO.sweepX, { value: formatNumber(state.sweepX ?? 0) }) },
    eventRows: eventRows(state.events, (event) => lineEventText(event.label), (event) => formatNumber(event.x)),
    eventMeta: eventProgress(state.events),
    orderRows: lineOrderRows(state),
    readout: lineReadout(state),
  };
}
