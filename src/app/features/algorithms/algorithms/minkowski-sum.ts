import {
  GeometryCoord,
  GeometryEventChip,
  GeometryPolygonRegion,
  GeometryVectorArrow,
  MinkowskiSumStepState,
} from '../models/geometry';
import { SortStep } from '../models/sort-step';

export interface MinkowskiSumScenario {
  readonly obstacle: readonly GeometryCoord[];
  readonly robot: readonly GeometryCoord[];
}

function signedArea(vertices: readonly GeometryCoord[]): number {
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i]!;
    const next = vertices[(i + 1) % vertices.length]!;
    area += current.x * next.y - current.y * next.x;
  }
  return area / 2;
}

function ensureCounterClockwise(vertices: readonly GeometryCoord[]): readonly GeometryCoord[] {
  return signedArea(vertices) >= 0 ? [...vertices] : [...vertices].reverse();
}

function rotateToAnchor(vertices: readonly GeometryCoord[]): readonly GeometryCoord[] {
  let bestIndex = 0;
  for (let i = 1; i < vertices.length; i++) {
    const current = vertices[i]!;
    const best = vertices[bestIndex]!;
    if (current.y < best.y || (current.y === best.y && current.x < best.x)) {
      bestIndex = i;
    }
  }
  return [...vertices.slice(bestIndex), ...vertices.slice(0, bestIndex)];
}

function reflect(vertices: readonly GeometryCoord[]): readonly GeometryCoord[] {
  return vertices.map((vertex) => ({ x: -vertex.x, y: -vertex.y }));
}

function edgeVectors(vertices: readonly GeometryCoord[]): readonly GeometryCoord[] {
  return vertices.map((vertex, index) => {
    const next = vertices[(index + 1) % vertices.length]!;
    return { x: next.x - vertex.x, y: next.y - vertex.y };
  });
}

function add(left: GeometryCoord, right: GeometryCoord): GeometryCoord {
  return {
    x: Number((left.x + right.x).toFixed(2)),
    y: Number((left.y + right.y).toFixed(2)),
  };
}

function polygonArea(vertices: readonly GeometryCoord[]): number {
  return Math.abs(signedArea(vertices));
}

function makeEvents(totalSteps: number, currentStep: number): readonly GeometryEventChip[] {
  return Array.from({ length: totalSteps }, (_, index) => ({
    id: `merge-${index}`,
    label: `m${index + 1}`,
    x: index,
    kind: 'vector',
    tone: index < currentStep ? 'done' : index === currentStep ? 'current' : 'queued',
  }));
}

function makeVectors(
  aEdges: readonly GeometryCoord[],
  bEdges: readonly GeometryCoord[],
  current: { readonly a: number | null; readonly b: number | null },
  completed: { readonly a: number; readonly b: number },
): readonly GeometryVectorArrow[] {
  const vectors: GeometryVectorArrow[] = [];

  aEdges.forEach((edge, index) => {
    vectors.push({
      id: `a-${index}`,
      label: `A${index + 1}`,
      dx: edge.x,
      dy: edge.y,
      tone: current.a === index ? 'current' : index < completed.a ? 'done' : 'shape-a',
    });
  });

  bEdges.forEach((edge, index) => {
    vectors.push({
      id: `b-${index}`,
      label: `B${index + 1}`,
      dx: edge.x,
      dy: edge.y,
      tone: current.b === index ? 'current' : index < completed.b ? 'done' : 'shape-b',
    });
  });

  return vectors;
}

function makeStep(
  polygons: readonly GeometryPolygonRegion[],
  vectors: readonly GeometryVectorArrow[],
  events: readonly GeometryEventChip[],
  description: string,
  activeCodeLine: number,
  phase: string,
  activeSource: 'a' | 'b' | 'both' | null,
  mergedEdgeCount: number,
  totalEdges: number,
  currentVectorLabel: string | null,
): SortStep {
  const resultPolygon = polygons.find(
    (polygon) => polygon.tone === 'result' || polygon.tone === 'result-preview',
  );
  const geometry: MinkowskiSumStepState = {
    mode: 'minkowski-sum',
    phase,
    polygons,
    vectors,
    events,
    activeSource,
    mergedEdgeCount,
    totalEdges,
    currentVectorLabel,
    resultArea: resultPolygon && resultPolygon.vertices.length >= 3 ? polygonArea(resultPolygon.vertices) : null,
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

export function* minkowskiSumGenerator(
  scenario: MinkowskiSumScenario,
): Generator<SortStep> {
  const obstacle = rotateToAnchor(ensureCounterClockwise(scenario.obstacle));
  const robot = rotateToAnchor(ensureCounterClockwise(scenario.robot));
  const reflectedRobot = rotateToAnchor(ensureCounterClockwise(reflect(robot)));

  yield makeStep(
    [
      { id: 'obstacle', label: 'obstacle A', vertices: obstacle, tone: 'shape-a' },
      { id: 'robot', label: 'robot B', vertices: robot, tone: 'shape-b' },
    ],
    [],
    [],
    'Start with the obstacle shape and the robot footprint.',
    1,
    'init',
    null,
    0,
    0,
    null,
  );

  yield makeStep(
    [
      { id: 'obstacle', label: 'obstacle A', vertices: obstacle, tone: 'shape-a' },
      { id: 'robot', label: 'robot B', vertices: robot, tone: 'shape-b' },
      { id: 'reflected', label: "reflected robot B'", vertices: reflectedRobot, tone: 'shape-reflected' },
    ],
    [],
    [],
    "Reflect the robot through the origin to build the configuration-space obstacle A ⊕ (-B).",
    2,
    'reflect',
    null,
    0,
    0,
    null,
  );

  const aEdges = edgeVectors(obstacle);
  const bEdges = edgeVectors(reflectedRobot);
  const totalSteps = obstacle.length + reflectedRobot.length;

  let current = add(obstacle[0]!, reflectedRobot[0]!);
  const resultVertices: GeometryCoord[] = [current];
  let i = 0;
  let j = 0;
  let stepIndex = 0;

  yield makeStep(
    [
      { id: 'obstacle', label: 'obstacle A', vertices: obstacle, tone: 'shape-a' },
      { id: 'reflected', label: "reflected robot B'", vertices: reflectedRobot, tone: 'shape-reflected' },
      { id: 'result-preview', label: 'sum path', vertices: resultVertices, tone: 'result-preview' },
    ],
    makeVectors(aEdges, bEdges, { a: 0, b: 0 }, { a: 0, b: 0 }),
    makeEvents(totalSteps, 0),
    `Seed the result polygon with A0 + B'0 = (${current.x.toFixed(1)}, ${current.y.toFixed(1)}).`,
    3,
    'seed',
    null,
    0,
    totalSteps,
    'A0 + B0',
  );

  while (i < aEdges.length || j < bEdges.length) {
    const edgeA = aEdges[i % aEdges.length]!;
    const edgeB = bEdges[j % bEdges.length]!;
    const crossValue = edgeA.x * edgeB.y - edgeA.y * edgeB.x;

    let activeSource: 'a' | 'b' | 'both';
    let delta: GeometryCoord;
    if (i >= aEdges.length) {
      activeSource = 'b';
      delta = edgeB;
      j += 1;
    } else if (j >= bEdges.length) {
      activeSource = 'a';
      delta = edgeA;
      i += 1;
    } else if (Math.abs(crossValue) < 1e-6) {
      activeSource = 'both';
      delta = add(edgeA, edgeB);
      i += 1;
      j += 1;
    } else if (crossValue > 0) {
      activeSource = 'a';
      delta = edgeA;
      i += 1;
    } else {
      activeSource = 'b';
      delta = edgeB;
      j += 1;
    }

    current = add(current, delta);
    resultVertices.push(current);
    stepIndex += 1;

    yield makeStep(
      [
        { id: 'obstacle', label: 'obstacle A', vertices: obstacle, tone: 'shape-a' },
        { id: 'reflected', label: "reflected robot B'", vertices: reflectedRobot, tone: 'shape-reflected' },
        { id: 'result-preview', label: 'sum path', vertices: resultVertices, tone: 'result-preview' },
      ],
      makeVectors(aEdges, bEdges, { a: i < aEdges.length ? i : null, b: j < bEdges.length ? j : null }, { a: i, b: j }),
      makeEvents(totalSteps, Math.min(stepIndex, totalSteps - 1)),
      `Advance by ${activeSource === 'both' ? 'both edge families' : `the ${activeSource.toUpperCase()} edge family`} and append the next result vertex.`,
      5,
      'merge',
      activeSource,
      stepIndex,
      totalSteps,
      activeSource === 'both' ? 'A + B' : activeSource === 'a' ? `A${i}` : `B${j}`,
    );
  }

  yield makeStep(
    [
      { id: 'obstacle', label: 'obstacle A', vertices: obstacle, tone: 'shape-a' },
      { id: 'robot', label: 'robot B', vertices: robot, tone: 'shape-b' },
      { id: 'reflected', label: "reflected robot B'", vertices: reflectedRobot, tone: 'shape-reflected' },
      { id: 'result', label: 'configuration-space obstacle', vertices: resultVertices, tone: 'result' },
    ],
    makeVectors(aEdges, bEdges, { a: null, b: null }, { a: aEdges.length, b: bEdges.length }),
    makeEvents(totalSteps, totalSteps),
    'The merged edge walk closes the full Minkowski sum polygon.',
    6,
    'complete',
    null,
    totalSteps,
    totalSteps,
    null,
  );
}
