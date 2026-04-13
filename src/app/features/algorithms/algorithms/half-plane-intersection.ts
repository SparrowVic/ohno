import {
  GeometryConstraintLine,
  GeometryCoord,
  GeometryEventChip,
  GeometryMarker,
  GeometryPolygonRegion,
  HalfPlaneIntersectionStepState,
} from '../models/geometry';
import { SortStep } from '../models/sort-step';

export interface HalfPlaneIntersectionScenario {
  readonly constraints: readonly {
    readonly start: GeometryCoord;
    readonly end: GeometryCoord;
  }[];
}

interface ConstraintRuntime {
  readonly id: number;
  readonly start: GeometryCoord;
  readonly end: GeometryCoord;
}

function cross(a: GeometryCoord, b: GeometryCoord, p: GeometryCoord): number {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

function polygonArea(vertices: readonly GeometryCoord[]): number {
  if (vertices.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i]!;
    const next = vertices[(i + 1) % vertices.length]!;
    sum += current.x * next.y - current.y * next.x;
  }
  return Math.abs(sum) / 2;
}

function lineIntersection(
  s: GeometryCoord,
  e: GeometryCoord,
  a: GeometryCoord,
  b: GeometryCoord,
): GeometryCoord {
  const denominator = (s.x - e.x) * (a.y - b.y) - (s.y - e.y) * (a.x - b.x);
  if (Math.abs(denominator) < 1e-6) {
    return { x: Number(e.x.toFixed(2)), y: Number(e.y.toFixed(2)) };
  }

  const determinant1 = s.x * e.y - s.y * e.x;
  const determinant2 = a.x * b.y - a.y * b.x;
  const x = (determinant1 * (a.x - b.x) - (s.x - e.x) * determinant2) / denominator;
  const y = (determinant1 * (a.y - b.y) - (s.y - e.y) * determinant2) / denominator;
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function clipPolygon(
  polygon: readonly GeometryCoord[],
  constraint: ConstraintRuntime,
  keepInside: boolean,
): readonly GeometryCoord[] {
  if (polygon.length === 0) return [];
  const output: GeometryCoord[] = [];
  const epsilon = 1e-6;

  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i]!;
    const previous = polygon[(i + polygon.length - 1) % polygon.length]!;
    const currentSide = cross(constraint.start, constraint.end, current);
    const previousSide = cross(constraint.start, constraint.end, previous);
    const currentInside = keepInside ? currentSide >= -epsilon : currentSide <= epsilon;
    const previousInside = keepInside ? previousSide >= -epsilon : previousSide <= epsilon;

    if (currentInside) {
      if (!previousInside) {
        output.push(lineIntersection(previous, current, constraint.start, constraint.end));
      }
      output.push(current);
    } else if (previousInside) {
      output.push(lineIntersection(previous, current, constraint.start, constraint.end));
    }
  }

  return output;
}

function buildConstraints(
  constraints: readonly ConstraintRuntime[],
  activeId: number | null,
  processed: number,
  isEmpty: boolean,
): readonly GeometryConstraintLine[] {
  return constraints.map((constraint, index) => ({
    id: `H${constraint.id}`,
    label: `H${constraint.id}`,
    start: constraint.start,
    end: constraint.end,
    tone:
      isEmpty && activeId === constraint.id
        ? 'blocking'
        : activeId === constraint.id
          ? 'active'
          : index < processed
            ? 'applied'
            : 'pending',
    keepSide: 'left',
  }));
}

function buildEvents(
  constraints: readonly ConstraintRuntime[],
  activeId: number | null,
  processed: number,
): readonly GeometryEventChip[] {
  return constraints.map((constraint, index) => ({
    id: `constraint-${constraint.id}`,
    label: `H${constraint.id}`,
    x: index,
    kind: 'constraint',
    tone:
      activeId === constraint.id ? 'current' : index < processed ? 'done' : 'queued',
  }));
}

function makeMarkers(vertices: readonly GeometryCoord[]): readonly GeometryMarker[] {
  return vertices.map((vertex, index) => ({
    id: `V${index}`,
    x: vertex.x,
    y: vertex.y,
    tone: 'vertex',
    label: `V${index}`,
  }));
}

function makeStep(
  constraints: readonly ConstraintRuntime[],
  activeConstraintId: number | null,
  processed: number,
  polygons: readonly GeometryPolygonRegion[],
  markers: readonly GeometryMarker[],
  description: string,
  activeCodeLine: number,
  phase: string,
  currentConstraintLabel: string,
  status: 'feasible' | 'empty' | 'complete',
): SortStep {
  const feasiblePolygon = polygons.find((polygon) => polygon.tone === 'feasible' || polygon.tone === 'result');
  const geometry: HalfPlaneIntersectionStepState = {
    mode: 'half-plane-intersection',
    phase,
    constraints: buildConstraints(constraints, activeConstraintId, processed, status === 'empty'),
    polygons,
    markers,
    events: buildEvents(constraints, activeConstraintId, processed),
    feasibleArea: feasiblePolygon ? polygonArea(feasiblePolygon.vertices) : null,
    vertexCount: feasiblePolygon?.vertices.length ?? 0,
    status,
    currentConstraintLabel,
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

export function* halfPlaneIntersectionGenerator(
  scenario: HalfPlaneIntersectionScenario,
): Generator<SortStep> {
  const constraints: ConstraintRuntime[] = scenario.constraints.map((constraint, index) => ({
    id: index,
    start: constraint.start,
    end: constraint.end,
  }));

  const canvasBounds: readonly GeometryCoord[] = [
    { x: 6, y: 6 },
    { x: 94, y: 6 },
    { x: 94, y: 94 },
    { x: 6, y: 94 },
  ];

  let feasible = [...canvasBounds];

  yield makeStep(
    constraints,
    null,
    0,
    [
      {
        id: 'feasible',
        label: 'feasible region',
        vertices: feasible,
        tone: 'feasible',
      },
    ],
    makeMarkers(feasible),
    'Start from the full canvas and clip it constraint by constraint.',
    1,
    'init',
    'global region',
    'feasible',
  );

  for (let index = 0; index < constraints.length; index++) {
    const constraint = constraints[index]!;
    const forbidden = clipPolygon(canvasBounds, constraint, false);

    yield makeStep(
      constraints,
      constraint.id,
      index,
      [
        {
          id: 'feasible',
          label: 'current feasible region',
          vertices: feasible,
          tone: 'previous',
        },
        {
          id: `forbidden-${constraint.id}`,
          label: 'forbidden side',
          vertices: forbidden,
          tone: 'forbidden',
        },
      ],
      makeMarkers(feasible),
      `Apply H${constraint.id}: keep only the left side of the active boundary line.`,
      3,
      'constraint',
      `H${constraint.id}`,
      'feasible',
    );

    const nextFeasible = clipPolygon(feasible, constraint, true);
    feasible = [...nextFeasible];

    if (feasible.length === 0) {
      yield makeStep(
        constraints,
        constraint.id,
        index + 1,
        [
          {
            id: `forbidden-${constraint.id}`,
            label: 'forbidden side',
            vertices: forbidden,
            tone: 'forbidden',
          },
        ],
        [],
        `H${constraint.id} eliminates the feasible region entirely.`,
        5,
        'infeasible',
        `H${constraint.id}`,
        'empty',
      );
      return;
    }

    yield makeStep(
      constraints,
      constraint.id,
      index + 1,
      [
        {
          id: 'previous',
          label: 'previous region',
          vertices: clipPolygon(canvasBounds, constraint, false),
          tone: 'forbidden',
        },
        {
          id: 'feasible',
          label: 'updated feasible region',
          vertices: feasible,
          tone: 'feasible',
        },
      ],
      makeMarkers(feasible),
      `Clip with H${constraint.id}: the feasible polygon now has ${feasible.length} vertices.`,
      4,
      'clip',
      `H${constraint.id}`,
      'feasible',
    );
  }

  yield makeStep(
    constraints,
    null,
    constraints.length,
    [
      {
        id: 'result',
        label: 'intersection polygon',
        vertices: feasible,
        tone: 'result',
      },
    ],
    makeMarkers(feasible),
    `Intersection complete: ${feasible.length} vertices remain in the feasible polygon.`,
    6,
    'complete',
    'final feasible polygon',
    'complete',
  );
}
