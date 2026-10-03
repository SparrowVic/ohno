import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { GeometryCoord, GeometryPolygonRegion, GeometryVectorArrow, MinkowskiSumStepState } from '../../models/geometry';
import {
  GeoRackRow,
  GeoReadoutView,
  GeoTone,
  PlaneBox,
  PlaneGrid,
  PlanePixel,
  formatNumber,
  planeBounds,
  planeFrame,
  planeGrid,
  planePoints,
  project,
  rackRow,
} from '../geo-canvas/plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;

export interface MinkowskiShapeView {
  readonly id: string;
  readonly points: string;
  readonly tone: GeoTone;
  readonly strong: boolean;
  readonly dashed: boolean;
  readonly hollow: boolean;
  readonly label: string;
  readonly labelX: number;
  readonly labelY: number;
}

export interface MinkowskiVertexView {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly current: boolean;
}

export interface MinkowskiSumView {
  readonly grid: PlaneGrid;
  readonly shapes: readonly MinkowskiShapeView[];
  readonly path: string | null;
  readonly vertices: readonly MinkowskiVertexView[];
  readonly vectorRows: readonly GeoRackRow[];
  readonly vectorMeta: string;
  readonly readout: GeoReadoutView;
}

type ShapeLook = Omit<MinkowskiShapeView, 'id' | 'points' | 'labelX' | 'labelY'>;

const SHAPE_LOOK: Partial<Record<GeometryPolygonRegion['tone'], ShapeLook>> = {
  'shape-a': { tone: 'violet', strong: false, dashed: false, hollow: false, label: 'A' },
  'shape-b': { tone: 'amber', strong: false, dashed: false, hollow: false, label: 'B' },
  'shape-reflected': { tone: 'ink', strong: false, dashed: true, hollow: true, label: '−B' },
  result: { tone: 'lime', strong: true, dashed: false, hollow: false, label: 'A ⊕ −B' },
};

const VECTOR_LOOK: Readonly<Record<GeometryVectorArrow['tone'], Pick<GeoRackRow, 'tone' | 'accent' | 'strong' | 'current' | 'led'>>> = {
  'shape-a': { tone: 'default', accent: null, strong: false, current: false, led: 'violet' },
  'shape-b': { tone: 'default', accent: null, strong: false, current: false, led: 'amber' },
  merge: { tone: 'default', accent: 'cyan', strong: false, current: false, led: 'cyan' },
  current: { tone: 'head', accent: 'cyan', strong: true, current: true, led: 'cyan' },
  done: { tone: 'dim', accent: null, strong: false, current: false, led: 'lime' },
};

function negate(vertices: readonly GeometryCoord[]): readonly GeometryCoord[] {
  return vertices.map((vertex) => ({ x: -vertex.x, y: -vertex.y }));
}

const LABEL_LIFT = 8;

export function labelAnchor(vertices: readonly GeometryCoord[]): GeometryCoord {
  return vertices.reduce((top, vertex) => (vertex.y > top.y || (vertex.y === top.y && vertex.x < top.x) ? vertex : top), vertices[0]!);
}

export function minkowskiExtent(state: MinkowskiSumStepState): readonly GeometryCoord[] {
  const find = (id: string) => state.polygons.find((polygon) => polygon.id === id)?.vertices ?? [];
  const obstacle = find('obstacle');
  const robot = find('robot');
  const reflected = find('reflected').length > 0 ? find('reflected') : negate(robot);
  const xs = (list: readonly GeometryCoord[]) => list.map((vertex) => vertex.x);
  const ys = (list: readonly GeometryCoord[]) => list.map((vertex) => vertex.y);
  const corners: GeometryCoord[] =
    obstacle.length > 0 && reflected.length > 0
      ? [
          { x: Math.min(...xs(obstacle)) + Math.min(...xs(reflected)), y: Math.min(...ys(obstacle)) + Math.min(...ys(reflected)) },
          { x: Math.max(...xs(obstacle)) + Math.max(...xs(reflected)), y: Math.max(...ys(obstacle)) + Math.max(...ys(reflected)) },
        ]
      : [];
  return [...obstacle, ...robot, ...reflected, ...negate(reflected), ...corners];
}

export function vectorValue(vector: GeometryVectorArrow): string {
  return `${formatNumber(vector.dx)}, ${formatNumber(vector.dy)}`;
}

export function minkowskiReadout(state: MinkowskiSumStepState): GeoReadoutView {
  const base = {
    title: GEO.minkowski.edges,
    caption: state.resultArea === null ? null : i18nText(GEO.minkowski.area, { value: formatNumber(state.resultArea) }),
    value: state.totalEdges > 0 ? `${state.mergedEdgeCount}/${state.totalEdges}` : '—',
    tone: (state.phase === 'complete' ? 'lime' : state.phase === 'merge' ? 'cyan' : 'dim') as GeoTone,
  };
  if (state.phase === 'complete') return { ...base, verdict: GEO.verdict.sumClosed, led: 'lime' };
  if (state.phase === 'merge' && state.activeSource) {
    const verdicts: Record<'a' | 'b' | 'both', TranslatableText> = {
      a: GEO.verdict.edgeA,
      b: GEO.verdict.edgeB,
      both: GEO.verdict.edgeBoth,
    };
    return { ...base, verdict: verdicts[state.activeSource], led: 'cyan' };
  }
  if (state.phase === 'seed') return { ...base, verdict: GEO.verdict.seeded, led: 'lime' };
  if (state.phase === 'reflect') return { ...base, verdict: GEO.verdict.reflected, led: 'cyan' };
  return { ...base, verdict: GEO.verdict.waiting, led: null };
}

export function minkowskiVectorRows(state: MinkowskiSumStepState): readonly GeoRackRow[] {
  return state.vectors.map((vector) =>
    rackRow({ id: vector.id, lead: vector.label, value: null, body: vectorValue(vector), ...VECTOR_LOOK[vector.tone] }),
  );
}

export function minkowskiSumView(state: MinkowskiSumStepState, box: PlaneBox): MinkowskiSumView {
  const frame = planeFrame(planeBounds(minkowskiExtent(state)), box);
  const preview = state.polygons.find((polygon) => polygon.tone === 'result-preview');
  const pathPixels: PlanePixel[] = (preview?.vertices ?? []).map((vertex) => project(frame, vertex));
  const complete = state.phase === 'complete';
  return {
    grid: planeGrid(frame),
    shapes: state.polygons.flatMap((polygon) => {
      const look = SHAPE_LOOK[polygon.tone];
      if (!look || polygon.vertices.length < 3) return [];
      const label = project(frame, labelAnchor(polygon.vertices));
      return [{ id: polygon.id, points: planePoints(frame, polygon.vertices), labelX: label.x, labelY: label.y - LABEL_LIFT, ...look }];
    }),
    path: preview && preview.vertices.length > 1 ? planePoints(frame, preview.vertices) : null,
    vertices: complete
      ? []
      : pathPixels.map((pixel, index) => ({ id: `v-${index}`, x: pixel.x, y: pixel.y, current: index === pathPixels.length - 1 })),
    vectorRows: minkowskiVectorRows(state),
    vectorMeta: state.totalEdges > 0 ? `${state.mergedEdgeCount}/${state.totalEdges}` : '',
    readout: minkowskiReadout(state),
  };
}
