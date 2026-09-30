export type PreviewTone = 'slate' | 'cyan' | 'lime' | 'pink' | 'violet';

export interface PreviewBar {
  readonly height: number;
  readonly tone: PreviewTone;
}

export interface PreviewBucket {
  readonly count: number;
  readonly tone: PreviewTone;
}

export interface PreviewGraph {
  readonly current: number;
  readonly frontier: number;
}

export interface PreviewMatrix {
  readonly columns: number;
  readonly rows: number;
  readonly filled: number;
  readonly current: number;
  readonly pink: number;
}

export interface PreviewTape {
  readonly cells: readonly PreviewTone[];
  readonly head: number;
}

export interface PreviewLine {
  readonly width: number;
  readonly tone: PreviewTone;
}

export interface PreviewXy {
  readonly points: readonly (readonly [number, number])[];
  readonly hull: readonly number[];
  readonly pink: number;
}

export function hashSeed(id: string): number {
  let hash = 0x811c9dc5;
  for (const char of id) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng: () => number, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

export function buildBars(seed: number): readonly PreviewBar[] {
  const rng = createRng(seed);
  const tailLength = pick(rng, 2, 4);
  const bodyLength = 13 - tailLength;
  const body = Array.from({ length: bodyLength }, () => pick(rng, 1, 10));
  const cyanAt = pick(rng, 0, bodyLength - 2);
  const bars: PreviewBar[] = body.map((height, index) => ({
    height,
    tone: index === cyanAt || index === cyanAt + 1 ? 'cyan' : 'slate',
  }));
  for (let index = 0; index < tailLength; index += 1) {
    bars.push({ height: 11 + index, tone: 'lime' });
  }
  return bars;
}

export function buildBuckets(seed: number): readonly PreviewBucket[] {
  const rng = createRng(seed);
  const cyanAt = pick(rng, 0, 7);
  return Array.from({ length: 8 }, (_, index) => ({
    count: pick(rng, 1, 5),
    tone: index === cyanAt ? 'cyan' : 'slate',
  }));
}

export function buildGraph(seed: number): PreviewGraph {
  const rng = createRng(seed);
  const current = pick(rng, 1, 6);
  let frontier = pick(rng, 1, 6);
  if (frontier === current) frontier = current === 6 ? 1 : current + 1;
  return { current, frontier };
}

export function buildMatrix(seed: number): PreviewMatrix {
  const rng = createRng(seed);
  const columns = 8;
  const rows = 4;
  const filled = pick(rng, 9, 27);
  return { columns, rows, filled, current: filled, pink: filled - columns };
}

export function buildTape(seed: number): PreviewTape {
  const rng = createRng(seed);
  const head = pick(rng, 2, 8);
  const cells = Array.from({ length: 12 }, (_, index): PreviewTone => {
    if (index < head) return 'lime';
    if (index === head) return 'cyan';
    if (index === head + 1) return 'pink';
    return 'slate';
  });
  return { cells, head };
}

export function buildNotebook(seed: number): readonly PreviewLine[] {
  const rng = createRng(seed);
  return [
    { width: pick(rng, 120, 170), tone: 'slate' },
    { width: pick(rng, 90, 150), tone: 'slate' },
    { width: pick(rng, 60, 110), tone: 'cyan' },
    { width: pick(rng, 100, 160), tone: 'slate' },
    { width: pick(rng, 50, 90), tone: 'lime' },
  ];
}

export function buildXy(seed: number): PreviewXy {
  const rng = createRng(seed);
  const points = Array.from({ length: 9 }, () => [pick(rng, 20, 225), pick(rng, 12, 80)] as const);
  const indexOf = (choose: (a: readonly [number, number], b: readonly [number, number]) => boolean) =>
    points.reduce((best, point, index) => (choose(point, points[best]) ? index : best), 0);
  const hull = [...new Set([
    indexOf((a, b) => a[0] < b[0]),
    indexOf((a, b) => a[1] < b[1]),
    indexOf((a, b) => a[0] > b[0]),
    indexOf((a, b) => a[1] > b[1]),
  ])];
  const pink = points.findIndex((_, index) => !hull.includes(index));
  return { points, hull, pink: pink === -1 ? 0 : pink };
}

export function buildStack(seed: number): readonly PreviewLine[] {
  const rng = createRng(seed);
  const depth = pick(rng, 3, 5);
  return Array.from({ length: depth }, (_, index) => ({
    width: 110 - index * 12,
    tone: index === 0 ? 'lime' : index === depth - 1 ? 'cyan' : 'slate',
  }));
}
