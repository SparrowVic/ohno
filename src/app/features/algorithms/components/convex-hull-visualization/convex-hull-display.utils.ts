import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { ConvexHullStepState, GeometryPoint } from '../../models/geometry';
import {
  GeoRackRow,
  GeoReadoutView,
  GeoTone,
  PlaneBox,
  PlaneGrid,
  LabelOffset,
  formatSigned,
  frameBounds,
  planeBounds,
  planeFrame,
  planeGrid,
  planePoints,
  placePointLabels,
  project,
  rackRow,
  turnArcPath,
} from '../geo-canvas/plane-display.utils';

const GEO = I18N_KEY.features.algorithms.display.geometry;
const RACKS = I18N_KEY.features.algorithms.display.racks;
const ARC_RADIUS = 14;

export interface HullPointView {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly tone: GeoTone;
  readonly current: boolean;
  readonly rejected: boolean;
  readonly label: LabelOffset;
}

export interface ConvexHullView {
  readonly grid: PlaneGrid;
  readonly points: readonly HullPointView[];
  readonly stackPath: string | null;
  readonly hullPolygon: string | null;
  readonly checkPath: string | null;
  readonly checkArc: string | null;
  readonly stackRows: readonly GeoRackRow[];
  readonly readout: GeoReadoutView;
}

export function hullCandidateId(state: ConvexHullStepState): number | null {
  if (state.turnCheck) return state.turnCheck[2];
  if (state.phase === 'pop') return state.points.find((point) => point.status === 'checking')?.id ?? null;
  return null;
}

export function hullPivotId(state: ConvexHullStepState): number | null {
  return state.points.find((point) => point.status === 'pivot' || point.sortIndex === 0)?.id ?? state.stackIds[0] ?? null;
}

export function hullRejectedIds(state: ConvexHullStepState): ReadonlySet<number> {
  const stack = new Set(state.stackIds);
  const rejected = new Set(state.points.filter((point) => point.status === 'rejected').map((point) => point.id));
  const order = (point: GeometryPoint | undefined) => point?.sortIndex ?? -1;
  const byId = new Map(state.points.map((point) => [point.id, point]));
  const candidate = hullCandidateId(state);
  const reached = [...state.stackIds, ...(candidate === null ? [] : [candidate])];
  const frontier = Math.max(-1, ...reached.map((id) => order(byId.get(id))));
  for (const point of state.points) {
    const index = order(point);
    if (index > 0 && index < frontier && !stack.has(point.id)) rejected.add(point.id);
  }
  return rejected;
}

export function hullDrawnRejectedIds(state: ConvexHullStepState): ReadonlySet<number> {
  const candidate = hullCandidateId(state);
  return new Set([...hullRejectedIds(state)].filter((id) => id !== candidate));
}

function pointTone(id: number, state: ConvexHullStepState, pivot: number | null, candidate: number | null): GeoTone {
  if (id === candidate) return 'cyan';
  if (id === pivot) return 'violet';
  if (state.stackIds.includes(id)) return 'lime';
  return 'slate';
}

function currentPointId(state: ConvexHullStepState, pivot: number | null, candidate: number | null): number | null {
  if (candidate !== null) return candidate;
  if (state.phase === 'pivot') return pivot;
  if (state.phase === 'push') return state.stackIds[state.stackIds.length - 1] ?? null;
  return null;
}

export function hullStackRows(state: ConvexHullStepState): readonly GeoRackRow[] {
  const candidate = hullCandidateId(state);
  const rows: GeoRackRow[] = [];
  if (candidate !== null) {
    rows.push(rackRow({ id: 'candidate', lead: RACKS.candidate, value: String(candidate), accent: 'cyan', strong: true, current: true }));
  }
  const stack = state.stackIds;
  if (stack.length === 0) {
    const pivot = hullPivotId(state);
    if (pivot !== null && state.phase !== 'init') {
      rows.push(rackRow({ id: `stack-${pivot}`, lead: RACKS.pivot, value: String(pivot), accent: 'violet' }));
    }
    return rows;
  }
  for (let index = stack.length - 1; index >= 0; index--) {
    const id = stack[index]!;
    const isTop = index === stack.length - 1;
    const isBase = index === 0;
    rows.push(
      rackRow({
        id: `stack-${id}`,
        lead: isBase ? RACKS.pivot : isTop ? GEO.top : '',
        value: String(id),
        accent: isBase ? 'violet' : 'lime',
        strong: isTop && !isBase,
        current: isTop && candidate === null,
      }),
    );
  }
  return rows;
}

export function hullReadout(state: ConvexHullStepState): GeoReadoutView {
  const cross = state.crossProduct;
  const check = state.turnCheck;
  const caption = check ? i18nText(GEO.crossCaption, { o: check[0], a: check[1], b: check[2] }) : null;
  const base = { title: RACKS.crossProduct, caption };
  if (cross !== null) {
    if (cross > 0) return { ...base, value: formatSigned(cross), tone: 'cyan', verdict: GEO.verdict.keep, led: 'lime' };
    if (cross === 0) return { ...base, value: formatSigned(cross), tone: 'pink', verdict: GEO.verdict.popCollinear, led: 'pink' };
    return { ...base, value: formatSigned(cross), tone: 'pink', verdict: GEO.verdict.popRight, led: 'pink' };
  }
  if (state.phase === 'complete') {
    return { ...base, title: RACKS.vertices, value: String(state.stackIds.length), tone: 'lime', verdict: GEO.verdict.hullClosed, led: 'lime' };
  }
  const popped = state.phase === 'pop' ? state.points.find((point) => point.status === 'rejected') : undefined;
  if (popped) {
    return { ...base, value: '—', tone: 'dim', verdict: i18nText(GEO.verdict.popped, { id: popped.id }), led: 'pink' };
  }
  const top = state.stackIds[state.stackIds.length - 1];
  if (state.phase === 'push' && top !== undefined) {
    return { ...base, value: '—', tone: 'dim', verdict: i18nText(GEO.verdict.pushed, { id: top }), led: 'lime' };
  }
  return { ...base, value: '—', tone: 'dim', verdict: GEO.verdict.waiting, led: null };
}

export function convexHullView(state: ConvexHullStepState, box: PlaneBox): ConvexHullView {
  const frame = planeFrame(planeBounds(state.points), box);
  const byId = new Map(state.points.map((point) => [point.id, point]));
  const pivot = hullPivotId(state);
  const candidate = hullCandidateId(state);
  const current = currentPointId(state, pivot, candidate);
  const rejected = hullDrawnRejectedIds(state);
  const complete = state.phase === 'complete';
  const stackCoords = state.stackIds.map((id) => byId.get(id)).filter((point): point is GeometryPoint => !!point);
  const check = state.turnCheck?.map((id) => byId.get(id));
  const checkPixels = check && check.every(Boolean) ? (check as GeometryPoint[]).map((point) => project(frame, point)) : null;
  const pixels = state.points.map((point) => project(frame, point));
  const labels = placePointLabels(
    state.points.map((point, index) => ({ ...pixels[index]!, text: String(point.id) })),
    [],
    frameBounds(frame),
  );
  return {
    grid: planeGrid(frame),
    points: state.points.map((point, index) => {
      const isRejected = rejected.has(point.id);
      return {
        id: point.id,
        x: pixels[index]!.x,
        y: pixels[index]!.y,
        tone: isRejected ? 'pink' : pointTone(point.id, state, pivot, candidate),
        current: point.id === current,
        rejected: isRejected,
        label: labels[index]!,
      };
    }),
    stackPath: !complete && stackCoords.length > 1 ? planePoints(frame, stackCoords) : null,
    hullPolygon: complete && stackCoords.length > 2 ? planePoints(frame, stackCoords) : null,
    checkPath: checkPixels ? `${checkPixels[1]!.x},${checkPixels[1]!.y} ${checkPixels[2]!.x},${checkPixels[2]!.y}` : null,
    checkArc: checkPixels ? turnArcPath(checkPixels[0]!, checkPixels[1]!, checkPixels[2]!, ARC_RADIUS) : null,
    stackRows: hullStackRows(state),
    readout: hullReadout(state),
  };
}
