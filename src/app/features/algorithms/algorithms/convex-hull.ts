import { ConvexHullStepState, GeometryEdge, GeometryPoint, PointStatus } from '../models/geometry';
import { SortStep } from '../models/sort-step';

export interface ConvexHullScenario {
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

type RawPt = { readonly x: number; readonly y: number };

/** Cross product of vectors OA and OB. > 0 = CCW (left turn), < 0 = CW (right turn). */
function cross(O: RawPt, A: RawPt, B: RawPt): number {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

function buildStackEdges(stackIds: readonly number[]): readonly GeometryEdge[] {
  const edges: GeometryEdge[] = [];
  for (let i = 0; i + 1 < stackIds.length; i++) {
    edges.push({ fromId: stackIds[i]!, toId: stackIds[i + 1]!, kind: 'stack' });
  }
  return edges;
}

function makeStep(
  pts: readonly GeometryPoint[],
  edges: readonly GeometryEdge[],
  stackIds: readonly number[],
  phase: string,
  description: string,
  activeCodeLine: number,
  turnCheck: readonly [number, number, number] | null,
  crossProduct: number | null,
): SortStep {
  const geometry: ConvexHullStepState = {
    mode: 'convex-hull',
    points: pts,
    edges,
    stackIds,
    phase,
    turnCheck,
    crossProduct,
  };
  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: 0,
    activeCodeLine,
    description,
    phase: 'idle',
    geometry,
  };
}

export function* convexHullGenerator(scenario: ConvexHullScenario): Generator<SortStep> {
  const raw = scenario.points;
  const n = raw.length;

  // Phase 1 – initialize: all points default
  let pts: GeometryPoint[] = raw.map((p, i) => ({
    id: i,
    x: p.x,
    y: p.y,
    status: 'default' as PointStatus,
    sortIndex: null,
  }));

  yield makeStep(pts, [], [], 'init', 'Graham Scan: begin with all points unmarked.', 1, null, null);

  if (n < 3) {
    pts = pts.map((p) => ({ ...p, status: 'hull' as PointStatus }));
    yield makeStep(pts, [], pts.map((p) => p.id), 'complete', 'Need at least 3 points for a convex hull.', 10, null, null);
    return;
  }

  // Phase 2 – find pivot: minimum y, ties broken by minimum x
  let pivotId = 0;
  for (let i = 1; i < n; i++) {
    const c = raw[i]!;
    const piv = raw[pivotId]!;
    if (c.y < piv.y || (c.y === piv.y && c.x < piv.x)) {
      pivotId = i;
    }
  }

  pts = pts.map((p) => ({
    ...p,
    status: (p.id === pivotId ? 'pivot' : 'default') as PointStatus,
  }));
  yield makeStep(
    pts,
    [],
    [],
    'pivot',
    `Pivot P${pivotId} at (${raw[pivotId]!.x.toFixed(0)}, ${raw[pivotId]!.y.toFixed(0)}) — bottommost point.`,
    2,
    null,
    null,
  );

  // Phase 3 – sort remaining points by polar angle CCW from pivot
  const pivot = raw[pivotId]!;
  const otherIds = raw.map((_, i) => i).filter((i) => i !== pivotId);
  otherIds.sort((a, b) => {
    const pa = raw[a]!;
    const pb = raw[b]!;
    const angA = Math.atan2(pa.y - pivot.y, pa.x - pivot.x);
    const angB = Math.atan2(pb.y - pivot.y, pb.x - pivot.x);
    if (Math.abs(angA - angB) > 1e-9) return angA - angB;
    // Collinear: keep closer point first (will be popped by cross product = 0)
    const da = (pa.x - pivot.x) ** 2 + (pa.y - pivot.y) ** 2;
    const db = (pb.x - pivot.x) ** 2 + (pb.y - pivot.y) ** 2;
    return da - db;
  });

  pts = pts.map((p) => {
    if (p.id === pivotId) return { ...p, status: 'pivot' as PointStatus, sortIndex: 0 };
    const si = otherIds.indexOf(p.id);
    return { ...p, status: 'sorted' as PointStatus, sortIndex: si + 1 };
  });

  yield makeStep(pts, [], [], 'sort', 'Points sorted by polar angle CCW from pivot. Numbers show angular order.', 3, null, null);

  // Phase 4 – initialize stack with pivot + first sorted point
  const sorted = [pivotId, ...otherIds];
  let stackIds: number[] = [sorted[0]!, sorted[1]!];

  pts = pts.map((p) => ({
    ...p,
    status: (stackIds.includes(p.id) ? 'stack' : 'sorted') as PointStatus,
  }));
  let edges = buildStackEdges(stackIds);

  yield makeStep(
    pts,
    edges,
    stackIds,
    'init-stack',
    `Stack initialized: [P${stackIds[0]}, P${stackIds[1]}].`,
    4,
    null,
    null,
  );

  // Phase 5+ – process each remaining sorted point
  for (let i = 2; i < sorted.length; i++) {
    const curId = sorted[i]!;

    // Cross-product check loop
    while (stackIds.length >= 2) {
      const topId = stackIds[stackIds.length - 1]!;
      const belowId = stackIds[stackIds.length - 2]!;
      const cpVal = cross(raw[belowId]!, raw[topId]!, raw[curId]!);

      pts = pts.map((p) => {
        if (p.id === curId || p.id === topId || p.id === belowId)
          return { ...p, status: 'checking' as PointStatus };
        if (stackIds.includes(p.id)) return { ...p, status: 'stack' as PointStatus };
        return { ...p, status: 'sorted' as PointStatus };
      });
      edges = buildStackEdges(stackIds);

      const verdict =
        cpVal > 0
          ? `Left turn → keep, then push P${curId}`
          : cpVal === 0
            ? `Collinear → pop P${topId}`
            : `Right turn → pop P${topId}`;

      yield makeStep(
        pts,
        edges,
        stackIds,
        'checking',
        `cross(P${belowId}, P${topId}, P${curId}) = ${cpVal.toFixed(1)}. ${verdict}.`,
        7,
        [belowId, topId, curId],
        cpVal,
      );

      if (cpVal > 0) break;

      // Pop non-left-turn point
      const poppedId = stackIds[stackIds.length - 1]!;
      stackIds = stackIds.slice(0, -1);

      pts = pts.map((p) => {
        if (p.id === poppedId) return { ...p, status: 'rejected' as PointStatus };
        if (stackIds.includes(p.id)) return { ...p, status: 'stack' as PointStatus };
        if (p.id === curId) return { ...p, status: 'checking' as PointStatus };
        return { ...p, status: 'sorted' as PointStatus };
      });
      edges = buildStackEdges(stackIds);

      yield makeStep(
        pts,
        edges,
        stackIds,
        'pop',
        `Popped P${poppedId} from stack (not a left turn).`,
        8,
        null,
        null,
      );
    }

    // Push current point onto stack
    stackIds = [...stackIds, curId];
    pts = pts.map((p) => ({
      ...p,
      status: (stackIds.includes(p.id) ? 'stack' : 'sorted') as PointStatus,
    }));
    edges = buildStackEdges(stackIds);

    yield makeStep(
      pts,
      edges,
      stackIds,
      'push',
      `Pushed P${curId}. Stack: [${stackIds.map((id) => 'P' + id).join(', ')}].`,
      9,
      null,
      null,
    );
  }

  // Complete – mark hull vertices and close the polygon
  const hullIds = [...stackIds];
  pts = pts.map((p) => ({
    ...p,
    status: (hullIds.includes(p.id) ? 'hull' : 'rejected') as PointStatus,
  }));
  const hullEdges: GeometryEdge[] = hullIds.map((id, idx) => ({
    fromId: id,
    toId: hullIds[(idx + 1) % hullIds.length]!,
    kind: 'hull',
  }));

  yield makeStep(
    pts,
    hullEdges,
    hullIds,
    'complete',
    `Convex hull: ${hullIds.length} vertices — ${hullIds.map((id) => 'P' + id).join(' → ')}.`,
    10,
    null,
    null,
  );
}
