import { Delaunay } from 'd3-delaunay';

import {
  DelaunayTriangulationStepState,
  GeometryCircleOverlay,
  GeometryEventChip,
  GeometryPoint,
  GeometryPolygonRegion,
  GeometrySegmentLine,
  PointStatus,
} from '../models/geometry';
import { SortStep } from '../models/sort-step';

export interface DelaunayTriangulationScenario {
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

interface PointRuntime {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}

interface TriangleRuntime {
  readonly id: string;
  readonly vertices: readonly [number, number, number];
  readonly circle: { readonly cx: number; readonly cy: number; readonly r: number };
}

function circumcircle(a: PointRuntime, b: PointRuntime, c: PointRuntime): { readonly cx: number; readonly cy: number; readonly r: number } {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-6) {
    const cx = (a.x + b.x + c.x) / 3;
    const cy = (a.y + b.y + c.y) / 3;
    const r = Math.max(
      Math.hypot(cx - a.x, cy - a.y),
      Math.hypot(cx - b.x, cy - b.y),
      Math.hypot(cx - c.x, cy - c.y),
    );
    return { cx, cy, r };
  }

  const ux =
    ((a.x ** 2 + a.y ** 2) * (b.y - c.y) +
      (b.x ** 2 + b.y ** 2) * (c.y - a.y) +
      (c.x ** 2 + c.y ** 2) * (a.y - b.y)) /
    d;
  const uy =
    ((a.x ** 2 + a.y ** 2) * (c.x - b.x) +
      (b.x ** 2 + b.y ** 2) * (a.x - c.x) +
      (c.x ** 2 + c.y ** 2) * (b.x - a.x)) /
    d;

  return {
    cx: Number(ux.toFixed(2)),
    cy: Number(uy.toFixed(2)),
    r: Number(Math.hypot(ux - a.x, uy - a.y).toFixed(2)),
  };
}

function buildEvents(triangles: readonly TriangleRuntime[], currentIndex: number): readonly GeometryEventChip[] {
  return triangles.map((triangle, index) => ({
    id: triangle.id,
    label: `T${index + 1}`,
    x: index,
    kind: 'intersection',
    tone: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'queued',
  }));
}

function buildPoints(points: readonly PointRuntime[], activeTriangle: TriangleRuntime | null): readonly GeometryPoint[] {
  const activeIds = new Set(activeTriangle?.vertices ?? []);
  return points.map((point) => ({
    id: point.id,
    x: point.x,
    y: point.y,
    status: (activeIds.has(point.id) ? 'compare' : 'default') as PointStatus,
    sortIndex: null,
  }));
}

function buildTriangles(
  points: readonly PointRuntime[],
  committed: readonly TriangleRuntime[],
  current: TriangleRuntime | null,
  complete: boolean,
): readonly GeometryPolygonRegion[] {
  const polygonFor = (triangle: TriangleRuntime, tone: GeometryPolygonRegion['tone']) => ({
    id: triangle.id,
    label: triangle.id,
    vertices: triangle.vertices.map((id) => ({ x: points[id]!.x, y: points[id]!.y })),
    tone,
  });

  return [
    ...committed.map((triangle) => polygonFor(triangle, complete ? 'mesh' : 'triangle')),
    ...(current ? [polygonFor(current, 'triangle-current')] : []),
  ];
}

function buildEdges(
  points: readonly PointRuntime[],
  triangles: readonly TriangleRuntime[],
): readonly GeometrySegmentLine[] {
  const unique = new Map<string, GeometrySegmentLine>();
  for (const triangle of triangles) {
    const ids = triangle.vertices;
    const edges = [
      [ids[0], ids[1]],
      [ids[1], ids[2]],
      [ids[2], ids[0]],
    ] as const;
    for (const [a, b] of edges) {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (unique.has(key)) continue;
      unique.set(key, {
        id: key,
        label: `P${a}·P${b}`,
        start: { x: points[a]!.x, y: points[a]!.y },
        end: { x: points[b]!.x, y: points[b]!.y },
        tone: 'done',
      });
    }
  }
  return [...unique.values()];
}

function makeStep(
  points: readonly PointRuntime[],
  triangles: readonly TriangleRuntime[],
  committedCount: number,
  currentIndex: number,
  description: string,
  activeCodeLine: number,
  phase: string,
  complete = false,
): SortStep {
  const committed = triangles.slice(0, Math.max(0, committedCount));
  const current = !complete && currentIndex >= 0 && currentIndex < triangles.length ? triangles[currentIndex]! : null;
  const currentCircle: GeometryCircleOverlay[] = current
    ? [{
        id: `circle-${current.id}`,
        cx: current.circle.cx,
        cy: current.circle.cy,
        r: current.circle.r,
        tone: 'current',
        label: current.id,
      }]
    : [];

  const geometry: DelaunayTriangulationStepState = {
    mode: 'delaunay-triangulation',
    phase,
    points: buildPoints(points, current),
    triangles: buildTriangles(points, committed, current, complete),
    edges: buildEdges(points, complete ? triangles : committed),
    circles: currentCircle,
    events: buildEvents(triangles, currentIndex),
    activeTriangleLabel: current?.id ?? 'mesh ready',
    triangleCount: complete ? triangles.length : committed.length,
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

export function* delaunayTriangulationGenerator(
  scenario: DelaunayTriangulationScenario,
): Generator<SortStep> {
  const points: PointRuntime[] = scenario.points.map((point, index) => ({
    id: index,
    x: point.x,
    y: point.y,
  }));

  const delaunay = Delaunay.from(
    points,
    (point) => point.x,
    (point) => point.y,
  );

  const triangles: TriangleRuntime[] = [];
  for (let index = 0; index < delaunay.triangles.length; index += 3) {
    const a = delaunay.triangles[index]!;
    const b = delaunay.triangles[index + 1]!;
    const c = delaunay.triangles[index + 2]!;
    triangles.push({
      id: `Δ${a}-${b}-${c}`,
      vertices: [a, b, c],
      circle: circumcircle(points[a]!, points[b]!, points[c]!),
    });
  }

  yield makeStep(
    points,
    triangles,
    0,
    -1,
    'Star points are ready; now grow the empty-circumcircle mesh triangle by triangle.',
    1,
    'init',
  );

  for (let index = 0; index < triangles.length; index++) {
    yield makeStep(
      points,
      triangles,
      index,
      index,
      `Test triangle ${triangles[index]!.id} with its circumcircle before committing it to the mesh.`,
      3,
      'circumcircle',
    );

    yield makeStep(
      points,
      triangles,
      index + 1,
      index + 1,
      `Triangle ${triangles[index]!.id} locks into the Delaunay mesh.`,
      4,
      'commit',
    );
  }

  yield makeStep(
    points,
    triangles,
    triangles.length,
    triangles.length,
    `Delaunay triangulation complete: ${triangles.length} triangles form the final mesh.`,
    5,
    'complete',
    true,
  );
}
