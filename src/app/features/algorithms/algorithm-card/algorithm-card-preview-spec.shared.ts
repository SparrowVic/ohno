export type PaintTone = 'primary' | 'cool' | 'warm' | 'success' | 'danger' | 'ghost' | 'muted';

export interface PreviewRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly rx?: number;
  readonly dasharray?: string;
}

export interface PreviewLine {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly stroke: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly dasharray?: string;
}

export interface PreviewCircle {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly dasharray?: string;
}

export interface PreviewPath {
  readonly d: string;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly dasharray?: string;
}

export interface PreviewSpec {
  readonly rects: readonly PreviewRect[];
  readonly lines: readonly PreviewLine[];
  readonly circles: readonly PreviewCircle[];
  readonly paths: readonly PreviewPath[];
}

export interface GraphNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

export const PAINT = {
  primaryFill: 'rgb(var(--card-accent-rgb) / 0.18)',
  primaryStroke: 'rgb(var(--card-accent-rgb) / 0.92)',
  coolFill: 'rgb(125 211 252 / 0.16)',
  coolStroke: 'rgb(125 211 252 / 0.92)',
  warmFill: 'rgb(255 214 102 / 0.16)',
  warmStroke: 'rgb(255 214 102 / 0.94)',
  successFill: 'rgb(110 231 183 / 0.16)',
  successStroke: 'rgb(110 231 183 / 0.94)',
  dangerFill: 'rgb(251 113 133 / 0.16)',
  dangerStroke: 'rgb(251 113 133 / 0.94)',
  ghostFill: 'rgba(255, 255, 255, 0.045)',
  ghostStroke: 'rgba(255, 255, 255, 0.16)',
  mutedFill: 'rgba(255, 255, 255, 0.025)',
  mutedStroke: 'rgba(255, 255, 255, 0.08)',
  glow: 'rgba(255, 255, 255, 0.72)',
} as const;

const EMPTY_SPEC: PreviewSpec = {
  rects: [],
  lines: [],
  circles: [],
  paths: [],
};

export const GRAPH_RING: readonly GraphNode[] = [
  { id: 'a', x: 42, y: 44 },
  { id: 'b', x: 84, y: 20 },
  { id: 'c', x: 126, y: 44 },
  { id: 'd', x: 172, y: 18 },
  { id: 'e', x: 220, y: 44 },
  { id: 'f', x: 266, y: 20 },
  { id: 'g', x: 292, y: 48 },
  { id: 'h', x: 214, y: 70 },
  { id: 'i', x: 138, y: 70 },
  { id: 'j', x: 70, y: 66 },
] as const;

export const GRAPH_RING_EDGES: ReadonlyArray<readonly [string, string]> = [
  ['a', 'b'],
  ['a', 'j'],
  ['b', 'c'],
  ['c', 'd'],
  ['c', 'i'],
  ['d', 'e'],
  ['e', 'f'],
  ['e', 'h'],
  ['f', 'g'],
  ['h', 'i'],
  ['i', 'j'],
  ['c', 'h'],
] as const;

export const TREE_NODES: readonly GraphNode[] = [
  { id: 'r', x: 160, y: 14 },
  { id: 'a', x: 112, y: 34 },
  { id: 'b', x: 208, y: 34 },
  { id: 'c', x: 80, y: 58 },
  { id: 'd', x: 136, y: 58 },
  { id: 'e', x: 184, y: 58 },
  { id: 'f', x: 240, y: 58 },
] as const;

export const TREE_EDGES: ReadonlyArray<readonly [string, string]> = [
  ['r', 'a'],
  ['r', 'b'],
  ['a', 'c'],
  ['a', 'd'],
  ['b', 'e'],
  ['b', 'f'],
] as const;

export const DAG_NODES: readonly GraphNode[] = [
  { id: 'a', x: 44, y: 20 },
  { id: 'b', x: 44, y: 56 },
  { id: 'c', x: 112, y: 20 },
  { id: 'd', x: 112, y: 56 },
  { id: 'e', x: 180, y: 20 },
  { id: 'f', x: 180, y: 56 },
  { id: 'g', x: 248, y: 38 },
  { id: 'h', x: 296, y: 38 },
] as const;

export const DAG_EDGES: ReadonlyArray<readonly [string, string]> = [
  ['a', 'c'],
  ['a', 'd'],
  ['b', 'd'],
  ['c', 'e'],
  ['c', 'f'],
  ['d', 'f'],
  ['e', 'g'],
  ['f', 'g'],
  ['g', 'h'],
] as const;

export const NETWORK_NODES: readonly GraphNode[] = [
  { id: 's', x: 34, y: 38 },
  { id: 'u', x: 108, y: 20 },
  { id: 'v', x: 108, y: 58 },
  { id: 'x', x: 186, y: 20 },
  { id: 'y', x: 186, y: 58 },
  { id: 't', x: 286, y: 38 },
] as const;

export const NETWORK_EDGES: ReadonlyArray<readonly [string, string]> = [
  ['s', 'u'],
  ['s', 'v'],
  ['u', 'x'],
  ['u', 'y'],
  ['v', 'x'],
  ['v', 'y'],
  ['x', 't'],
  ['y', 't'],
] as const;

export const BIPARTITE_NODES: readonly GraphNode[] = [
  { id: 'l1', x: 78, y: 16 },
  { id: 'l2', x: 78, y: 38 },
  { id: 'l3', x: 78, y: 60 },
  { id: 'r1', x: 242, y: 16 },
  { id: 'r2', x: 242, y: 38 },
  { id: 'r3', x: 242, y: 60 },
] as const;

export const BIPARTITE_EDGES: ReadonlyArray<readonly [string, string]> = [
  ['l1', 'r1'],
  ['l1', 'r2'],
  ['l2', 'r2'],
  ['l2', 'r3'],
  ['l3', 'r1'],
  ['l3', 'r3'],
] as const;

function fillColor(tone: PaintTone): string {
  switch (tone) {
    case 'primary':
      return PAINT.primaryFill;
    case 'cool':
      return PAINT.coolFill;
    case 'warm':
      return PAINT.warmFill;
    case 'success':
      return PAINT.successFill;
    case 'danger':
      return PAINT.dangerFill;
    case 'muted':
      return PAINT.mutedFill;
    case 'ghost':
    default:
      return PAINT.ghostFill;
  }
}

function strokeColor(tone: PaintTone): string {
  switch (tone) {
    case 'primary':
      return PAINT.primaryStroke;
    case 'cool':
      return PAINT.coolStroke;
    case 'warm':
      return PAINT.warmStroke;
    case 'success':
      return PAINT.successStroke;
    case 'danger':
      return PAINT.dangerStroke;
    case 'muted':
      return PAINT.mutedStroke;
    case 'ghost':
    default:
      return PAINT.ghostStroke;
  }
}

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  tone: PaintTone,
  extra: Partial<PreviewRect> = {},
): PreviewRect {
  return {
    x,
    y,
    width,
    height,
    rx: 6,
    fill: fillColor(tone),
    stroke: strokeColor(tone),
    strokeWidth: 0.9,
    ...extra,
  };
}

export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tone: PaintTone,
  extra: Partial<PreviewLine> = {},
): PreviewLine {
  return {
    x1,
    y1,
    x2,
    y2,
    stroke: strokeColor(tone),
    strokeWidth: 1.4,
    ...extra,
  };
}

export function circle(
  cx: number,
  cy: number,
  r: number,
  tone: PaintTone,
  extra: Partial<PreviewCircle> = {},
): PreviewCircle {
  return {
    cx,
    cy,
    r,
    fill: fillColor(tone),
    stroke: strokeColor(tone),
    strokeWidth: 1,
    ...extra,
  };
}

export function path(
  d: string,
  tone: PaintTone,
  extra: Partial<PreviewPath> = {},
): PreviewPath {
  return {
    d,
    fill: fillColor(tone),
    stroke: strokeColor(tone),
    strokeWidth: 1,
    ...extra,
  };
}

export function mergeSpecs(...specs: readonly PreviewSpec[]): PreviewSpec {
  return specs.reduce(
    (acc, spec) => ({
      rects: [...acc.rects, ...spec.rects],
      lines: [...acc.lines, ...spec.lines],
      circles: [...acc.circles, ...spec.circles],
      paths: [...acc.paths, ...spec.paths],
    }),
    EMPTY_SPEC,
  );
}

export function polylinePath(
  points: ReadonlyArray<readonly [number, number]>,
  close = false,
): string {
  if (points.length === 0) {
    return '';
  }

  const [first, ...rest] = points;
  const head = `M${first[0]} ${first[1]}`;
  const tail = rest.map(([x, y]) => `L${x} ${y}`).join(' ');
  return `${head}${tail ? ` ${tail}` : ''}${close ? ' Z' : ''}`;
}

export function barScene(
  values: readonly number[],
  toneByIndex: Partial<Record<number, PaintTone>>,
  options: {
    readonly liftedIndex?: number;
    readonly splitAfter?: readonly number[];
    readonly overlayLines?: readonly PreviewLine[];
  } = {},
): PreviewSpec {
  const barWidth = 20;
  const gap = 7;
  const startX = 24;
  const baseline = 68;
  const rects = values.map((value, index) => {
    const height = 12 + value * 0.42;
    const lifted = index === options.liftedIndex ? 7 : 0;
    return rect(
      startX + index * (barWidth + gap),
      baseline - height - lifted,
      barWidth,
      height,
      toneByIndex[index] ?? 'ghost',
      { rx: 8 },
    );
  });

  const lines = [line(16, baseline + 2, 304, baseline + 2, 'muted', { strokeWidth: 1 })];

  for (const split of options.splitAfter ?? []) {
    const x = startX + split * (barWidth + gap) - gap / 2;
    lines.push(line(x, 14, x, baseline + 2, 'muted', { dasharray: '3 4', opacity: 0.85 }));
  }

  return {
    rects,
    lines: options.overlayLines ? [...lines, ...options.overlayLines] : lines,
    circles: [],
    paths: [],
  };
}

export function stripScene(
  count: number,
  toneByIndex: Partial<Record<number, PaintTone>>,
  options: {
    readonly x?: number;
    readonly y?: number;
    readonly size?: number;
    readonly gap?: number;
  } = {},
): PreviewSpec {
  const size = options.size ?? 22;
  const gap = options.gap ?? 6;
  const startX = options.x ?? 22;
  const y = options.y ?? 18;

  return {
    rects: Array.from({ length: count }, (_, index) =>
      rect(startX + index * (size + gap), y, size, size, toneByIndex[index] ?? 'ghost'),
    ),
    lines: [],
    circles: [],
    paths: [],
  };
}

export function matrixScene(
  rows: number,
  cols: number,
  toneByCell: Record<string, PaintTone>,
  options: {
    readonly x?: number;
    readonly y?: number;
    readonly size?: number;
    readonly gap?: number;
  } = {},
): PreviewSpec {
  const size = options.size ?? 18;
  const gap = options.gap ?? 4;
  const startX = options.x ?? 36;
  const startY = options.y ?? 14;

  return {
    rects: Array.from({ length: rows * cols }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return rect(
        startX + col * (size + gap),
        startY + row * (size + gap),
        size,
        size,
        toneByCell[`${row}:${col}`] ?? 'ghost',
        { rx: 5 },
      );
    }),
    lines: [],
    circles: [],
    paths: [],
  };
}

export function edgeKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

export function graphScene(
  nodes: readonly GraphNode[],
  edges: ReadonlyArray<readonly [string, string]>,
  nodeTones: Partial<Record<string, PaintTone>>,
  edgeTones: Partial<Record<string, PaintTone>>,
  extra: {
    readonly paths?: readonly PreviewPath[];
    readonly lines?: readonly PreviewLine[];
    readonly circles?: readonly PreviewCircle[];
  } = {},
): PreviewSpec {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const baseLines = edges.map(([from, to]) => {
    const a = byId.get(from)!;
    const b = byId.get(to)!;
    return line(a.x, a.y, b.x, b.y, edgeTones[edgeKey(from, to)] ?? 'muted', {
      strokeWidth: edgeTones[edgeKey(from, to)] ? 2.2 : 1.35,
    });
  });

  const circles = nodes.map((node) => circle(node.x, node.y, 6.5, nodeTones[node.id] ?? 'ghost'));

  return {
    rects: [],
    lines: extra.lines ? [...baseLines, ...extra.lines] : baseLines,
    circles: extra.circles ? [...circles, ...extra.circles] : circles,
    paths: extra.paths ?? [],
  };
}

export function pointsScene(
  points: ReadonlyArray<readonly [number, number]>,
  highlighted: Partial<Record<number, PaintTone>>,
  extra: {
    readonly paths?: readonly PreviewPath[];
    readonly lines?: readonly PreviewLine[];
  } = {},
): PreviewSpec {
  return {
    rects: [],
    lines: extra.lines ?? [],
    circles: points.map(([x, y], index) => circle(x, y, 4.8, highlighted[index] ?? 'ghost')),
    paths: extra.paths ?? [],
  };
}
