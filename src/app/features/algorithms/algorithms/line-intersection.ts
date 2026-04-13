import {
  GeometryEventChip,
  GeometryMarker,
  GeometrySegmentLine,
  LineIntersectionStepState,
} from '../models/geometry';
import { SortStep } from '../models/sort-step';

export interface LineIntersectionScenario {
  readonly segments: readonly {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
  }[];
}

interface SegmentRuntime {
  readonly id: number;
  readonly start: { readonly x: number; readonly y: number };
  readonly end: { readonly x: number; readonly y: number };
}

interface IntersectionRecord {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly segmentIds: readonly [number, number];
}

interface SweepEvent {
  readonly id: string;
  readonly x: number;
  readonly label: string;
  readonly kind: 'start' | 'end' | 'intersection';
  readonly segmentIds: readonly number[];
  readonly intersection?: IntersectionRecord;
}

function cross(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function lineIntersection(
  first: SegmentRuntime,
  second: SegmentRuntime,
): IntersectionRecord | null {
  const x1 = first.start.x;
  const y1 = first.start.y;
  const x2 = first.end.x;
  const y2 = first.end.y;
  const x3 = second.start.x;
  const y3 = second.start.y;
  const x4 = second.end.x;
  const y4 = second.end.y;

  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denominator) < 1e-6) {
    return null;
  }

  const determinant1 = x1 * y2 - y1 * x2;
  const determinant2 = x3 * y4 - y3 * x4;
  const px = (determinant1 * (x3 - x4) - (x1 - x2) * determinant2) / denominator;
  const py = (determinant1 * (y3 - y4) - (y1 - y2) * determinant2) / denominator;

  const epsilon = 1e-4;
  const withinFirst =
    px >= Math.min(x1, x2) - epsilon &&
    px <= Math.max(x1, x2) + epsilon &&
    py >= Math.min(y1, y2) - epsilon &&
    py <= Math.max(y1, y2) + epsilon;
  const withinSecond =
    px >= Math.min(x3, x4) - epsilon &&
    px <= Math.max(x3, x4) + epsilon &&
    py >= Math.min(y3, y4) - epsilon &&
    py <= Math.max(y3, y4) + epsilon;

  if (!withinFirst || !withinSecond) {
    return null;
  }

  return {
    id: `I${first.id}-${second.id}`,
    x: Number(px.toFixed(2)),
    y: Number(py.toFixed(2)),
    segmentIds: [first.id, second.id],
  };
}

function yAtX(segment: SegmentRuntime, x: number): number {
  const dx = segment.end.x - segment.start.x;
  if (Math.abs(dx) < 1e-6) return segment.start.y;
  const ratio = (x - segment.start.x) / dx;
  return segment.start.y + (segment.end.y - segment.start.y) * ratio;
}

function buildSegments(
  segments: readonly SegmentRuntime[],
  sweepX: number | null,
  focusIds: ReadonlySet<number>,
  hitIds: ReadonlySet<number>,
): readonly GeometrySegmentLine[] {
  return segments.map((segment) => {
    const minX = Math.min(segment.start.x, segment.end.x);
    const maxX = Math.max(segment.start.x, segment.end.x);
    const isFocus = focusIds.has(segment.id);
    const isActive = sweepX !== null && sweepX >= minX && sweepX <= maxX;
    const isDone = sweepX !== null && sweepX > maxX;

    let tone: GeometrySegmentLine['tone'] = 'pending';
    if (isDone) tone = 'done';
    else if (hitIds.has(segment.id)) tone = 'hit';
    else if (isActive) tone = 'active';
    if (isFocus) tone = 'focus';

    return {
      id: `S${segment.id}`,
      label: `S${segment.id}`,
      start: segment.start,
      end: segment.end,
      tone,
    };
  });
}

function buildEventChips(
  events: readonly SweepEvent[],
  currentIndex: number,
): readonly GeometryEventChip[] {
  return events.map((event, index) => ({
    id: event.id,
    label: event.label,
    x: event.x,
    kind: event.kind,
    tone: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'queued',
  }));
}

function buildActiveOrder(
  segments: readonly SegmentRuntime[],
  sweepX: number | null,
): readonly string[] {
  if (sweepX === null) return [];
  return segments
    .filter((segment) => sweepX >= segment.start.x - 1e-6 && sweepX <= segment.end.x + 1e-6)
    .sort((left, right) => yAtX(left, sweepX + 0.01) - yAtX(right, sweepX + 0.01))
    .map((segment) => `S${segment.id}`);
}

function makeStep(
  segments: readonly SegmentRuntime[],
  events: readonly SweepEvent[],
  currentIndex: number,
  sweepX: number | null,
  description: string,
  activeCodeLine: number,
  phase: string,
  focusIds: ReadonlySet<number>,
  foundIntersections: readonly IntersectionRecord[],
  currentEventLabel: string,
): SortStep {
  const hitIds = new Set<number>();
  for (const intersection of foundIntersections) {
    hitIds.add(intersection.segmentIds[0]);
    hitIds.add(intersection.segmentIds[1]);
  }

  const geometry: LineIntersectionStepState = {
    mode: 'line-intersection',
    phase,
    segments: buildSegments(segments, sweepX, focusIds, hitIds),
    sweepX,
    events: buildEventChips(events, currentIndex),
    intersections: foundIntersections.map((intersection) => ({
      id: intersection.id,
      x: intersection.x,
      y: intersection.y,
      tone: currentEventLabel === intersection.id ? 'current' : 'intersection',
      label: `${intersection.segmentIds.map((id) => 'S' + id).join(' × ')}`,
    })),
    activeOrder: buildActiveOrder(segments, sweepX),
    foundCount: foundIntersections.length,
    currentEventLabel,
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

export function* lineIntersectionGenerator(
  scenario: LineIntersectionScenario,
): Generator<SortStep> {
  const segments: SegmentRuntime[] = scenario.segments.map((segment, index) => {
    const startFirst =
      segment.x1 < segment.x2 ||
      (segment.x1 === segment.x2 && segment.y1 <= segment.y2);
    return startFirst
      ? {
          id: index,
          start: { x: segment.x1, y: segment.y1 },
          end: { x: segment.x2, y: segment.y2 },
        }
      : {
          id: index,
          start: { x: segment.x2, y: segment.y2 },
          end: { x: segment.x1, y: segment.y1 },
        };
  });

  const intersections: IntersectionRecord[] = [];
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const hit = lineIntersection(segments[i]!, segments[j]!);
      if (hit) intersections.push(hit);
    }
  }

  const events: SweepEvent[] = [
    ...segments.map((segment) => ({
      id: `start-${segment.id}`,
      x: segment.start.x,
      label: `Start S${segment.id}`,
      kind: 'start' as const,
      segmentIds: [segment.id],
    })),
    ...segments.map((segment) => ({
      id: `end-${segment.id}`,
      x: segment.end.x,
      label: `End S${segment.id}`,
      kind: 'end' as const,
      segmentIds: [segment.id],
    })),
    ...intersections.map((intersection) => ({
      id: intersection.id,
      x: intersection.x,
      label: `Cross ${intersection.segmentIds.map((id) => 'S' + id).join(' · ')}`,
      kind: 'intersection' as const,
      segmentIds: [...intersection.segmentIds],
      intersection,
    })),
  ].sort((left, right) => {
    if (left.x !== right.x) return left.x - right.x;
    const rank = { start: 0, intersection: 1, end: 2 };
    return rank[left.kind] - rank[right.kind];
  });

  yield makeStep(
    segments,
    events,
    -1,
    null,
    'Laser sweep is ready: sort all endpoints and potential crossings by x.',
    1,
    'init',
    new Set<number>(),
    [],
    'boot',
  );

  const foundIntersections: IntersectionRecord[] = [];

  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const event = events[eventIndex]!;
    const focusIds = new Set(event.segmentIds);

    if (event.kind === 'start') {
      yield makeStep(
        segments,
        events,
        eventIndex,
        event.x,
        `Sweep line reaches ${event.label} and inserts the segment into the active ordering.`,
        3,
        'activate',
        focusIds,
        foundIntersections,
        event.id,
      );
      continue;
    }

    if (event.kind === 'end') {
      yield makeStep(
        segments,
        events,
        eventIndex,
        event.x,
        `Sweep line exits ${event.label}; the segment leaves the active set.`,
        4,
        'retire',
        focusIds,
        foundIntersections,
        event.id,
      );
      continue;
    }

    if (event.intersection) {
      foundIntersections.push(event.intersection);
      yield makeStep(
        segments,
        events,
        eventIndex,
        event.x,
        `${event.label} sparks a valid intersection at (${event.intersection.x.toFixed(1)}, ${event.intersection.y.toFixed(1)}).`,
        5,
        'intersection',
        focusIds,
        foundIntersections,
        event.id,
      );
    }
  }

  yield makeStep(
    segments,
    events,
    events.length,
    98,
    `Sweep complete: found ${foundIntersections.length} intersections.`,
    6,
    'complete',
    new Set<number>(),
    foundIntersections,
    'complete',
  );
}
