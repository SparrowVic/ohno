import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { DelaunayTriangulationStepState } from '../../models/geometry';
import { triangleVerticesText } from '../geo-canvas/geometry-labels.utils';
import {
  GeoRackRow,
  GeoReadoutView,
  GeoTone,
  LabelOffset,
  PlaneBox,
  PlaneGrid,
  PlaneRect,
  chipBox,
  chipWidth,
  dotBox,
  eventProgress,
  eventRows,
  formatNumber,
  frameBounds,
  labelBox,
  pickPlacement,
  placePointLabels,
  planeBounds,
  planeFrame,
  planeGrid,
  planePoints,
  project,
  projectLength,
} from '../geo-canvas/plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;

export interface DelaunayTriangleView {
  readonly id: string;
  readonly points: string;
  readonly current: boolean;
}

export interface DelaunayEdgeView {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface DelaunayCircleView {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly chip: string;
  readonly chipWidth: number;
  readonly chipX: number;
  readonly chipY: number;
}

export interface DelaunayPointView {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly tone: GeoTone;
  readonly label: LabelOffset;
}

export interface DelaunayView {
  readonly grid: PlaneGrid;
  readonly clip: PlaneRect;
  readonly triangles: readonly DelaunayTriangleView[];
  readonly edges: readonly DelaunayEdgeView[];
  readonly circles: readonly DelaunayCircleView[];
  readonly points: readonly DelaunayPointView[];
  readonly eventRows: readonly GeoRackRow[];
  readonly eventMeta: string;
  readonly readout: GeoReadoutView;
}

export function delaunayMeshIds(state: DelaunayTriangulationStepState): ReadonlySet<number> {
  const ids = new Set<number>();
  for (const triangle of state.triangles) {
    if (triangle.tone === 'triangle-current') continue;
    const match = triangle.id.match(/^Δ(\d+)-(\d+)-(\d+)$/);
    match?.slice(1).forEach((id) => ids.add(Number(id)));
  }
  return ids;
}

export function delaunayReadout(state: DelaunayTriangulationStepState): GeoReadoutView {
  const circle = state.circles[0];
  const total = state.events.length;
  const count = `${state.triangleCount}/${total}`;
  if (state.phase === 'complete') {
    return { title: GEO.triangles, caption: null, value: count, tone: 'lime', verdict: i18nText(GEO.verdict.meshDone, { count: state.triangleCount }), led: 'lime' };
  }
  if (state.phase === 'circumcircle' && circle) {
    return {
      title: GEO.circumcircle,
      caption: triangleVerticesText(state.activeTriangleLabel),
      value: `r ${formatNumber(circle.r)}`,
      tone: 'cyan',
      verdict: GEO.verdict.circleEmpty,
      led: 'cyan',
    };
  }
  if (state.phase === 'commit') {
    const last = state.triangles.filter((triangle) => triangle.tone === 'triangle').at(-1);
    return {
      title: GEO.triangles,
      caption: last ? triangleVerticesText(last.id) : null,
      value: count,
      tone: 'lime',
      verdict: GEO.verdict.triangleCommitted,
      led: 'lime',
    };
  }
  return { title: GEO.triangles, caption: null, value: count, tone: 'dim', verdict: GEO.verdict.waiting, led: null };
}

const CHIP_LIFT = 14;
const CHIP_SHIFTS: readonly (readonly [number, number])[] = [
  [0, -CHIP_LIFT],
  [0, CHIP_LIFT],
  [-1, -CHIP_LIFT],
  [1, -CHIP_LIFT],
];

export function delaunayView(state: DelaunayTriangulationStepState, box: PlaneBox): DelaunayView {
  const frame = planeFrame(planeBounds(state.points), box);
  const active = new Set(state.points.filter((point) => point.status === 'compare').map((point) => point.id));
  const mesh = delaunayMeshIds(state);
  const grid = planeGrid(frame);
  const bounds = frameBounds(frame);
  const pixels = state.points.map((point) => project(frame, point));
  const requests = state.points.map((point, index) => ({ ...pixels[index]!, text: String(point.id) }));
  const labels = placePointLabels(requests, [], bounds);
  const taken: PlaneRect[] = [
    ...pixels.map((pixel) => dotBox(pixel)),
    ...requests.map((request, index) => labelBox(request.x, request.y, request.text, labels[index]!)),
  ];
  return {
    grid,
    clip: grid.plot,
    triangles: state.triangles.map((triangle) => ({
      id: triangle.id,
      points: planePoints(frame, triangle.vertices),
      current: triangle.tone === 'triangle-current',
    })),
    edges: state.edges.map((edge) => {
      const a = project(frame, edge.start);
      const b = project(frame, edge.end);
      return { id: edge.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    }),
    circles: state.circles.map((circle) => {
      const center = project(frame, { x: circle.cx, y: circle.cy });
      const chip = `r = ${formatNumber(circle.r)}`;
      const width = chipWidth(chip);
      const centers = CHIP_SHIFTS.map(([side, lift]) => ({ x: center.x + side * (width / 2 + 6), y: center.y + lift }));
      const boxes = centers.map((candidate) => chipBox(candidate, width));
      const index = pickPlacement(boxes, taken, bounds);
      taken.push(boxes[index]!);
      return {
        id: circle.id,
        cx: center.x,
        cy: center.y,
        r: projectLength(frame, circle.r),
        chip,
        chipWidth: width,
        chipX: centers[index]!.x,
        chipY: centers[index]!.y,
      };
    }),
    points: state.points.map((point, index) => ({
      id: point.id,
      x: pixels[index]!.x,
      y: pixels[index]!.y,
      tone: active.has(point.id) ? 'cyan' : mesh.has(point.id) ? 'lime' : 'slate',
      label: labels[index]!,
    })),
    eventRows: eventRows(
      state.events,
      (event) => event.label,
      () => null,
      (event) => triangleVerticesText(event.id),
    ),
    eventMeta: eventProgress(state.events),
    readout: delaunayReadout(state),
  };
}
