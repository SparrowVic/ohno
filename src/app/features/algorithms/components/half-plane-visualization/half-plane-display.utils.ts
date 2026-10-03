import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  GeometryConstraintLine,
  GeometryCoord,
  GeometryPolygonRegion,
  HalfPlaneIntersectionStepState,
} from '../../models/geometry';
import {
  GeoRackRow,
  GeoReadoutView,
  GeoTone,
  LabelOffset,
  PlaneBounds,
  PlaneBox,
  PlaneGrid,
  eventProgress,
  eventRows,
  formatNumber,
  frameBounds,
  labelBox,
  placePointLabels,
  planeBounds,
  planeFrame,
  planeGrid,
  planePoints,
  project,
} from '../geo-canvas/plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;

export interface ConstraintView {
  readonly id: string;
  readonly label: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly labelX: number;
  readonly labelY: number;
  readonly tone: GeoTone;
  readonly bold: boolean;
  readonly dashed: boolean;
}

export interface RegionView {
  readonly id: string;
  readonly points: string;
  readonly tone: GeoTone;
  readonly strong: boolean;
  readonly dashed: boolean;
  readonly hollow: boolean;
}

export interface VertexView {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly labelOffset: LabelOffset;
}

export interface HalfPlaneView {
  readonly grid: PlaneGrid;
  readonly regions: readonly RegionView[];
  readonly constraints: readonly ConstraintView[];
  readonly vertices: readonly VertexView[];
  readonly constraintRows: readonly GeoRackRow[];
  readonly constraintMeta: string;
  readonly readout: GeoReadoutView;
}

const CONSTRAINT_LOOK: Readonly<Record<GeometryConstraintLine['tone'], { tone: GeoTone; bold: boolean; dashed: boolean }>> = {
  pending: { tone: 'slate', bold: false, dashed: true },
  active: { tone: 'cyan', bold: true, dashed: false },
  applied: { tone: 'lime', bold: false, dashed: false },
  blocking: { tone: 'red', bold: true, dashed: true },
};

const REGION_LOOK: Partial<Record<GeometryPolygonRegion['tone'], Omit<RegionView, 'id' | 'points'>>> = {
  feasible: { tone: 'lime', strong: false, dashed: false, hollow: false },
  result: { tone: 'lime', strong: true, dashed: false, hollow: false },
  previous: { tone: 'ink', strong: false, dashed: true, hollow: true },
  forbidden: { tone: 'pink', strong: false, dashed: false, hollow: false },
};

export function clipLineToBounds(start: GeometryCoord, end: GeometryCoord, bounds: PlaneBounds): readonly [GeometryCoord, GeometryCoord] | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return null;
  let low = -Infinity;
  let high = Infinity;
  const edges: readonly [number, number][] = [
    [-dx, start.x - bounds.minX],
    [dx, bounds.maxX - start.x],
    [-dy, start.y - bounds.minY],
    [dy, bounds.maxY - start.y],
  ];
  for (const [p, q] of edges) {
    if (Math.abs(p) < 1e-12) {
      if (q < 0) return null;
      continue;
    }
    const t = q / p;
    if (p < 0) low = Math.max(low, t);
    else high = Math.min(high, t);
  }
  if (low > high) return null;
  return [
    { x: start.x + low * dx, y: start.y + low * dy },
    { x: start.x + high * dx, y: start.y + high * dy },
  ];
}

export function halfPlaneReadout(state: HalfPlaneIntersectionStepState): GeoReadoutView {
  const empty = state.status === 'empty';
  const value = state.feasibleArea === null ? '—' : formatNumber(state.feasibleArea, 0);
  const base = {
    title: GEO.feasibleArea,
    caption: i18nText(GEO.vertexCount, { count: state.vertexCount }),
    value: empty ? '0' : value,
    tone: (empty ? 'red' : 'lime') as GeoTone,
  };
  if (empty) return { ...base, verdict: GEO.verdict.emptyRegion, led: 'red' };
  if (state.phase === 'complete') return { ...base, verdict: GEO.verdict.regionDone, led: 'lime' };
  if (state.phase === 'clip') return { ...base, verdict: i18nText(GEO.verdict.clipped, { constraint: state.currentConstraintLabel }), led: 'pink' };
  if (state.phase === 'constraint') return { ...base, verdict: GEO.verdict.keepLeft, led: 'cyan' };
  return { ...base, verdict: GEO.verdict.feasible, led: 'lime' };
}

export function halfPlaneView(state: HalfPlaneIntersectionStepState, box: PlaneBox): HalfPlaneView {
  const coords = [
    ...state.constraints.flatMap((constraint) => [constraint.start, constraint.end]),
    ...state.polygons.filter((polygon) => polygon.tone !== 'forbidden').flatMap((polygon) => polygon.vertices),
  ];
  const bounds = planeBounds(coords);
  const frame = planeFrame(bounds, box);
  const constraints = state.constraints.flatMap((constraint) => {
    const clipped = clipLineToBounds(constraint.start, constraint.end, bounds);
    if (!clipped) return [];
    const a = project(frame, clipped[0]);
    const b = project(frame, clipped[1]);
    const mid = project(frame, { x: (constraint.start.x + constraint.end.x) / 2, y: (constraint.start.y + constraint.end.y) / 2 });
    const look = CONSTRAINT_LOOK[constraint.tone];
    return [{ id: constraint.id, label: constraint.label, x1: a.x, y1: a.y, x2: b.x, y2: b.y, labelX: mid.x + 6, labelY: mid.y - 6, ...look }];
  });
  const vertexPixels = state.markers.map((marker) => ({ ...project(frame, marker), text: marker.label ?? marker.id }));
  const constraintBoxes = constraints.map((constraint) =>
    labelBox(constraint.labelX, constraint.labelY, constraint.label, { dx: 0, dy: 0, anchor: 'start' }),
  );
  const vertexLabels = placePointLabels(vertexPixels, constraintBoxes, frameBounds(frame));
  return {
    grid: planeGrid(frame),
    regions: state.polygons.flatMap((polygon) => {
      const look = REGION_LOOK[polygon.tone];
      if (!look || polygon.vertices.length < 3) return [];
      return [{ id: polygon.id, points: planePoints(frame, polygon.vertices), ...look }];
    }),
    constraints,
    vertices: state.markers.map((marker, index) => ({
      id: marker.id,
      label: vertexPixels[index]!.text,
      x: vertexPixels[index]!.x,
      y: vertexPixels[index]!.y,
      labelOffset: vertexLabels[index]!,
    })),
    constraintRows: eventRows(state.events, (event) => event.label, () => null),
    constraintMeta: eventProgress(state.events),
    readout: halfPlaneReadout(state),
  };
}
