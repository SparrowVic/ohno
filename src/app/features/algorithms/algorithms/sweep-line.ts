import {
  GeometryEventChip,
  GeometryRect,
  GeometrySpan,
  SweepLineStepState,
} from '../models/geometry';
import { SortStep } from '../models/sort-step';

export interface SweepLineScenario {
  readonly rectangles: readonly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  }[];
}

interface RectRuntime {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface SweepEvent {
  readonly id: string;
  readonly x: number;
  readonly rectId: number;
  readonly kind: 'start' | 'end';
}

function mergeSpans(rectangles: readonly RectRuntime[]): readonly { readonly y0: number; readonly y1: number }[] {
  if (rectangles.length === 0) return [];
  const intervals = rectangles
    .map((rectangle) => ({ y0: rectangle.y, y1: rectangle.y + rectangle.height }))
    .sort((left, right) => left.y0 - right.y0);

  const merged: { y0: number; y1: number }[] = [];
  for (const interval of intervals) {
    const last = merged[merged.length - 1];
    if (!last || interval.y0 > last.y1) {
      merged.push({ ...interval });
    } else {
      last.y1 = Math.max(last.y1, interval.y1);
    }
  }
  return merged;
}

function coverageLength(rectangles: readonly RectRuntime[]): number {
  return mergeSpans(rectangles).reduce((sum, interval) => sum + (interval.y1 - interval.y0), 0);
}

function buildRects(
  rectangles: readonly RectRuntime[],
  sweepX: number | null,
  activeId: number | null,
): readonly GeometryRect[] {
  return rectangles.map((rectangle) => {
    const endX = rectangle.x + rectangle.width;
    const isFocus = activeId === rectangle.id;
    const isDone = sweepX !== null && sweepX >= endX;
    const isActive = sweepX !== null && sweepX >= rectangle.x && sweepX < endX;
    return {
      id: `R${rectangle.id}`,
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
      tone: isFocus ? 'focus' : isDone ? 'done' : isActive ? 'active' : 'pending',
      label: `R${rectangle.id}`,
    };
  });
}

function buildSpans(rectangles: readonly RectRuntime[]): readonly GeometrySpan[] {
  return mergeSpans(rectangles).map((span, index) => ({
    id: `span-${index}`,
    y0: span.y0,
    y1: span.y1,
    tone: 'merged',
    label: `${(span.y1 - span.y0).toFixed(1)}`,
  }));
}

function buildEvents(events: readonly SweepEvent[], currentIndex: number): readonly GeometryEventChip[] {
  return events.map((event, index) => ({
    id: event.id,
    label: `${event.kind === 'start' ? '+' : '−'}R${event.rectId}`,
    x: event.x,
    kind: event.kind,
    tone: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'queued',
  }));
}

function makeStep(
  rectangles: readonly RectRuntime[],
  activeRects: readonly RectRuntime[],
  events: readonly SweepEvent[],
  currentIndex: number,
  sweepX: number | null,
  coveredArea: number,
  currentEventLabel: string,
  description: string,
  activeCodeLine: number,
  phase: string,
  activeId: number | null,
): SortStep {
  const geometry: SweepLineStepState = {
    mode: 'sweep-line',
    phase,
    rectangles: buildRects(rectangles, sweepX, activeId),
    spans: buildSpans(activeRects),
    sweepX,
    fillWidth: sweepX,
    events: buildEvents(events, currentIndex),
    coveredArea: Number(coveredArea.toFixed(2)),
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

export function* sweepLineGenerator(scenario: SweepLineScenario): Generator<SortStep> {
  const rectangles: RectRuntime[] = scenario.rectangles.map((rectangle, index) => ({
    id: index,
    x: rectangle.x,
    y: rectangle.y,
    width: rectangle.width,
    height: rectangle.height,
  }));

  const events: SweepEvent[] = rectangles.flatMap((rectangle) => ([
    { id: `start-${rectangle.id}`, x: rectangle.x, rectId: rectangle.id, kind: 'start' as const },
    { id: `end-${rectangle.id}`, x: rectangle.x + rectangle.width, rectId: rectangle.id, kind: 'end' as const },
  ])).sort((left, right) => left.x === right.x ? (left.kind === 'start' ? -1 : 1) - (right.kind === 'start' ? -1 : 1) : left.x - right.x);

  let activeIds = new Set<number>();
  let previousX = events[0]?.x ?? 0;
  let coveredArea = 0;

  yield makeStep(
    rectangles,
    [],
    events,
    -1,
    null,
    coveredArea,
    'boot',
    'Queue all rectangle edges and prepare the area scanner.',
    1,
    'init',
    null,
  );

  for (let index = 0; index < events.length; index++) {
    const event = events[index]!;
    const activeRectsBefore = rectangles.filter((rectangle) => activeIds.has(rectangle.id));
    coveredArea += coverageLength(activeRectsBefore) * Math.max(0, event.x - previousX);
    previousX = event.x;

    if (event.kind === 'start') {
      activeIds.add(event.rectId);
    } else {
      activeIds.delete(event.rectId);
    }

    const activeRects = rectangles.filter((rectangle) => activeIds.has(rectangle.id));
    yield makeStep(
      rectangles,
      activeRects,
      events,
      index,
      event.x,
      coveredArea,
      `${event.kind === 'start' ? 'Enter' : 'Leave'} R${event.rectId}`,
      `Sweep hits ${event.kind === 'start' ? 'the left edge of' : 'the right edge of'} R${event.rectId}; recompute merged y-spans.`,
      event.kind === 'start' ? 3 : 4,
      'event',
      event.rectId,
    );
  }

  yield makeStep(
    rectangles,
    [],
    events,
    events.length,
    96,
    coveredArea,
    'complete',
    `Sweep complete: covered union area = ${coveredArea.toFixed(1)}.`,
    5,
    'complete',
    null,
  );
}
