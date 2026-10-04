import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { I18nTextParams, i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import {
  ClosestPairStepState,
  GeometryBand,
  GeometryDivider,
  GeometryPairLine,
  GeometryPoint,
  PointStatus,
} from '../models/geometry';
import { SortStep } from '../models/sort-step';
import { I18N_KEY } from '../../../core/i18n/i18n-keys';

const GEO = I18N_KEY.features.algorithms.display.geometry;

const I18N = {
  descriptions: {
    initialize: t('features.algorithms.runtime.geometry.closestPair.descriptions.initialize'),
    sort: t('features.algorithms.runtime.geometry.closestPair.descriptions.sort'),
    baseSingle: {
      whole: t('features.algorithms.runtime.geometry.closestPair.descriptions.baseSingle.whole'),
      slice: t('features.algorithms.runtime.geometry.closestPair.descriptions.baseSingle.slice'),
    },
    baseBrute: {
      whole: t('features.algorithms.runtime.geometry.closestPair.descriptions.baseBrute.whole'),
      slice: t('features.algorithms.runtime.geometry.closestPair.descriptions.baseBrute.slice'),
    },
    split: {
      whole: t('features.algorithms.runtime.geometry.closestPair.descriptions.split.whole'),
      slice: t('features.algorithms.runtime.geometry.closestPair.descriptions.split.slice'),
    },
    compare: t('features.algorithms.runtime.geometry.closestPair.descriptions.compare'),
    localBest: t('features.algorithms.runtime.geometry.closestPair.descriptions.localBest'),
    merge: t('features.algorithms.runtime.geometry.closestPair.descriptions.merge'),
    strip: t('features.algorithms.runtime.geometry.closestPair.descriptions.strip'),
    stripCheck: t('features.algorithms.runtime.geometry.closestPair.descriptions.stripCheck'),
    stripWin: t('features.algorithms.runtime.geometry.closestPair.descriptions.stripWin'),
    complete: t('features.algorithms.runtime.geometry.closestPair.descriptions.complete'),
    noPair: t('features.algorithms.runtime.geometry.closestPair.descriptions.noPair'),
  },
} as const;

export interface ClosestPairScenario {
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

interface RawPoint {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}

interface PairResult {
  readonly pointIds: readonly [number, number];
  readonly distance: number;
}

interface ClosestPairStepOptions {
  readonly phase: string;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly activeIds: ReadonlySet<number>;
  readonly leftIds?: ReadonlySet<number>;
  readonly rightIds?: ReadonlySet<number>;
  readonly stripIds?: ReadonlySet<number>;
  readonly currentPair?: readonly [number, number] | null;
  readonly bestPair?: readonly [number, number] | null;
  readonly bestDistance?: number | null;
  readonly candidateDistance?: number | null;
  readonly regionBounds: readonly [number, number] | null;
  readonly regionLabel: TranslatableText;
  readonly trail: readonly string[];
  readonly depth: number;
  readonly midX?: number | null;
  readonly stripWidth?: number | null;
  readonly checkedPairs: number;
  readonly bands?: readonly GeometryBand[];
  readonly dividers?: readonly GeometryDivider[];
  readonly finalPair?: boolean;
}

function distance(left: RawPoint, right: RawPoint): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function samePair(
  left: readonly [number, number] | null | undefined,
  right: readonly [number, number] | null | undefined,
): boolean {
  if (!left || !right) return false;
  return (
    (left[0] === right[0] && left[1] === right[1]) ||
    (left[0] === right[1] && left[1] === right[0])
  );
}

function comparePairs(left: PairResult | null, right: PairResult | null): PairResult | null {
  if (!left) return right;
  if (!right) return left;
  return left.distance <= right.distance ? left : right;
}

function regionDescription(
  keys: { readonly whole: string; readonly slice: string },
  trail: readonly string[],
  count: number,
  extra: I18nTextParams = {},
): TranslatableText {
  const path = trail.filter((part) => part !== 'root').join(' / ');
  return path ? i18nText(keys.slice, { path, count, ...extra }) : i18nText(keys.whole, { count, ...extra });
}

function pairLabel(pair: readonly [number, number] | null | undefined): string {
  if (!pair) return '—';
  return `P${pair[0]} · P${pair[1]}`;
}

function buildRegionBounds(points: readonly RawPoint[]): readonly [number, number] | null {
  if (points.length === 0) return null;
  let minX = points[0]!.x;
  let maxX = points[0]!.x;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
  }

  let x0 = Math.max(4, minX - 5);
  let x1 = Math.min(96, maxX + 5);
  if (x1 - x0 < 14) {
    const center = (x0 + x1) / 2;
    x0 = Math.max(4, center - 7);
    x1 = Math.min(96, center + 7);
  }
  return [x0, x1];
}

function makePointStatus(
  pointId: number,
  activeIds: ReadonlySet<number>,
  leftIds: ReadonlySet<number>,
  rightIds: ReadonlySet<number>,
  stripIds: ReadonlySet<number>,
  currentPair: readonly [number, number] | null,
  bestPair: readonly [number, number] | null,
): PointStatus {
  if (bestPair?.includes(pointId)) return 'best';
  if (currentPair?.includes(pointId)) return 'compare';
  if (stripIds.has(pointId)) return 'strip';
  if (leftIds.has(pointId)) return 'left';
  if (rightIds.has(pointId)) return 'right';
  return activeIds.has(pointId) ? 'default' : 'dimmed';
}

function makePairLines(
  currentPair: readonly [number, number] | null,
  bestPair: readonly [number, number] | null,
  candidateDistance: number | null,
  bestDistance: number | null,
  finalPair: boolean,
): readonly GeometryPairLine[] {
  const lines: GeometryPairLine[] = [];

  if (bestPair && bestDistance !== null) {
    lines.push({
      pointIds: bestPair,
      tone: finalPair ? 'final' : 'best',
      distance: bestDistance,
      label: finalPair ? 'closest pair' : 'best so far',
    });
  }

  if (currentPair && candidateDistance !== null && !samePair(currentPair, bestPair)) {
    lines.push({
      pointIds: currentPair,
      tone: 'candidate',
      distance: candidateDistance,
      label: 'current check',
    });
  }

  return lines;
}

function buildPoints(rawPoints: readonly RawPoint[], options: ClosestPairStepOptions): readonly GeometryPoint[] {
  const leftIds = options.leftIds ?? new Set<number>();
  const rightIds = options.rightIds ?? new Set<number>();
  const stripIds = options.stripIds ?? new Set<number>();
  const currentPair = options.currentPair ?? null;
  const bestPair = options.bestPair ?? null;

  return rawPoints.map((point) => ({
    id: point.id,
    x: point.x,
    y: point.y,
    status: makePointStatus(point.id, options.activeIds, leftIds, rightIds, stripIds, currentPair, bestPair),
    sortIndex: null,
  }));
}

const TRAIL_KEYS: Readonly<Record<string, string>> = {
  root: GEO.trail.root,
  L: GEO.trail.left,
  R: GEO.trail.right,
  merge: GEO.trail.merge,
  strip: GEO.trail.strip,
  done: GEO.trail.done,
};

function trailText(step: string): TranslatableText {
  const key = TRAIL_KEYS[step];
  return key ? i18nText(key) : step;
}

function regionText(trail: readonly string[], count: number): TranslatableText {
  const path = trail.filter((part) => part !== 'root').join(' / ');
  return path ? i18nText(GEO.region.slice, { path, count }) : i18nText(GEO.region.whole, { count });
}

function makeStep(
  rawPoints: readonly RawPoint[],
  options: ClosestPairStepOptions,
): SortStep {
  const geometry: ClosestPairStepState = {
    mode: 'closest-pair',
    points: buildPoints(rawPoints, options),
    phase: options.phase,
    bands: options.bands ?? [],
    dividers: options.dividers ?? [],
    pairLines: makePairLines(
      options.currentPair ?? null,
      options.bestPair ?? null,
      options.candidateDistance ?? null,
      options.bestDistance ?? null,
      options.finalPair ?? false,
    ),
    regionBounds: options.regionBounds,
    regionLabel: options.regionLabel,
    trail: options.trail.map(trailText),
    depth: options.depth,
    midX: options.midX ?? null,
    stripWidth: options.stripWidth ?? null,
    bestDistance: options.bestDistance ?? null,
    candidateDistance: options.candidateDistance ?? null,
    checkedPairs: options.checkedPairs,
    currentPair: options.currentPair ?? null,
    bestPair: options.bestPair ?? null,
  };

  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: 0,
    activeCodeLine: options.activeCodeLine,
    description: options.description,
    phase: 'idle',
    geometry,
  };
}

export function* closestPairOfPointsGenerator(
  scenario: ClosestPairScenario,
): Generator<SortStep> {
  const rawPoints: RawPoint[] = scenario.points.map((point, index) => ({
    id: index,
    x: point.x,
    y: point.y,
  }));

  const allIds = new Set(rawPoints.map((point) => point.id));
  const sortedByX = [...rawPoints].sort((left, right) =>
    left.x === right.x ? left.y - right.y : left.x - right.x,
  );
  const sortedByY = [...rawPoints].sort((left, right) =>
    left.y === right.y ? left.x - right.x : left.y - right.y,
  );
  let checkedPairs = 0;

  yield makeStep(rawPoints, {
    phase: 'init',
    description: i18nText(I18N.descriptions.initialize),
    activeCodeLine: 1,
    activeIds: allIds,
    regionBounds: buildRegionBounds(rawPoints),
    regionLabel: i18nText(GEO.region.points, { count: rawPoints.length }),
    trail: ['root'],
    depth: 0,
    checkedPairs,
    bands: [
      {
        x0: 4,
        x1: 96,
        tone: 'region',
        label: 'full field',
        depth: 0,
      },
    ],
  });

  yield makeStep(rawPoints, {
    phase: 'sort',
    description: i18nText(I18N.descriptions.sort),
    activeCodeLine: 2,
    activeIds: allIds,
    regionBounds: buildRegionBounds(rawPoints),
    regionLabel: i18nText(GEO.region.sorted, { first: `P${sortedByX[0]?.id ?? 0}`, last: `P${sortedByX[sortedByX.length - 1]?.id ?? 0}` }),
    trail: ['root'],
    depth: 0,
    checkedPairs,
    bands: [
      {
        x0: 4,
        x1: 96,
        tone: 'region',
        label: 'global ordering ready',
        depth: 0,
      },
    ],
  });

  function* solve(
    px: readonly RawPoint[],
    py: readonly RawPoint[],
    depth: number,
    trail: readonly string[],
  ): Generator<SortStep, PairResult | null> {
    const activeIds = new Set(px.map((point) => point.id));
    const regionBounds = buildRegionBounds(px);
    const regionLabel = regionText(trail, px.length);

    if (px.length <= 1) {
      yield makeStep(rawPoints, {
        phase: 'base',
        description: regionDescription(I18N.descriptions.baseSingle, trail, px.length),
        activeCodeLine: 6,
        activeIds,
        regionBounds,
        regionLabel,
        trail,
        depth,
        checkedPairs,
        bands: regionBounds
          ? [{ x0: regionBounds[0], x1: regionBounds[1], tone: 'region', label: 'base case', depth }]
          : [],
      });
      return null;
    }

    if (px.length <= 3) {
      let best: PairResult | null = null;

      yield makeStep(rawPoints, {
        phase: 'base',
        description: regionDescription(I18N.descriptions.baseBrute, trail, px.length),
        activeCodeLine: 6,
        activeIds,
        regionBounds,
        regionLabel,
        trail,
        depth,
        checkedPairs,
        bands: regionBounds
          ? [{ x0: regionBounds[0], x1: regionBounds[1], tone: 'region', label: 'brute force', depth }]
          : [],
      });

      for (let i = 0; i < px.length; i++) {
        for (let j = i + 1; j < px.length; j++) {
          const currentPair: readonly [number, number] = [px[i]!.id, px[j]!.id];
          const currentDistance = distance(px[i]!, px[j]!);
          checkedPairs += 1;

          yield makeStep(rawPoints, {
            phase: 'compare',
            description: i18nText(I18N.descriptions.compare, { pair: pairLabel(currentPair) }),
            activeCodeLine: 6,
            activeIds,
            currentPair,
            bestPair: best?.pointIds ?? null,
            bestDistance: best?.distance ?? null,
            candidateDistance: currentDistance,
            regionBounds,
            regionLabel,
            trail,
            depth,
            checkedPairs,
            bands: regionBounds
              ? [{ x0: regionBounds[0], x1: regionBounds[1], tone: 'region', label: 'brute force', depth }]
              : [],
          });

          if (!best || currentDistance < best.distance) {
            best = { pointIds: currentPair, distance: currentDistance };
            yield makeStep(rawPoints, {
              phase: 'update',
              description: i18nText(I18N.descriptions.localBest, { pair: pairLabel(currentPair), distance: currentDistance.toFixed(2) }),
              activeCodeLine: 6,
              activeIds,
              bestPair: best.pointIds,
              bestDistance: best.distance,
              regionBounds,
              regionLabel,
              trail,
              depth,
              checkedPairs,
              bands: regionBounds
                ? [{ x0: regionBounds[0], x1: regionBounds[1], tone: 'region', label: 'local winner', depth }]
                : [],
            });
          }
        }
      }

      return best;
    }

    const midIndex = Math.floor(px.length / 2);
    const leftPx = px.slice(0, midIndex);
    const rightPx = px.slice(midIndex);
    const midX = (leftPx[leftPx.length - 1]!.x + rightPx[0]!.x) / 2;
    const leftIds = new Set(leftPx.map((point) => point.id));
    const rightIds = new Set(rightPx.map((point) => point.id));
    const leftPy = py.filter((point) => leftIds.has(point.id));
    const rightPy = py.filter((point) => rightIds.has(point.id));

    const leftBounds = buildRegionBounds(leftPx);
    const rightBounds = buildRegionBounds(rightPx);

    yield makeStep(rawPoints, {
      phase: 'divide',
      description: regionDescription(I18N.descriptions.split, trail, px.length, { x: midX.toFixed(1) }),
      activeCodeLine: 7,
      activeIds,
      leftIds,
      rightIds,
      regionBounds,
      regionLabel,
      trail,
      depth,
      midX,
      checkedPairs,
      bands: [
        ...(leftBounds
          ? [{ x0: leftBounds[0], x1: leftBounds[1], tone: 'left' as const, label: 'left half', depth }]
          : []),
        ...(rightBounds
          ? [{ x0: rightBounds[0], x1: rightBounds[1], tone: 'right' as const, label: 'right half', depth }]
          : []),
      ],
      dividers: [{ x: midX, tone: 'split', label: 'split' }],
    });

    const leftBest = yield* solve(leftPx, leftPy, depth + 1, [...trail, 'L']);
    const rightBest = yield* solve(rightPx, rightPy, depth + 1, [...trail, 'R']);
    let best = comparePairs(leftBest, rightBest);

    yield makeStep(rawPoints, {
      phase: 'merge',
      description: i18nText(I18N.descriptions.merge),
      activeCodeLine: 8,
      activeIds,
      leftIds,
      rightIds,
      bestPair: best?.pointIds ?? null,
      bestDistance: best?.distance ?? null,
      regionBounds,
      regionLabel,
      trail: [...trail, 'merge'],
      depth,
      midX,
      checkedPairs,
      bands: [
        ...(leftBounds
          ? [{ x0: leftBounds[0], x1: leftBounds[1], tone: 'left' as const, label: 'solved left', depth }]
          : []),
        ...(rightBounds
          ? [{ x0: rightBounds[0], x1: rightBounds[1], tone: 'right' as const, label: 'solved right', depth }]
          : []),
      ],
      dividers: [{ x: midX, tone: 'split', label: 'merge line' }],
    });

    if (!best) {
      return null;
    }

    let currentBest: PairResult = best;
    const strip = py.filter((point) => Math.abs(point.x - midX) < currentBest.distance);
    const stripIds = new Set(strip.map((point) => point.id));

    yield makeStep(rawPoints, {
      phase: 'strip',
      description: i18nText(I18N.descriptions.strip, { width: currentBest.distance.toFixed(2) }),
      activeCodeLine: 9,
      activeIds,
      stripIds,
      bestPair: currentBest.pointIds,
      bestDistance: currentBest.distance,
      regionBounds,
      regionLabel,
      trail: [...trail, 'strip'],
      depth,
      midX,
      stripWidth: currentBest.distance,
      checkedPairs,
      bands: [
        ...(regionBounds
          ? [{ x0: regionBounds[0], x1: regionBounds[1], tone: 'region' as const, label: 'merge window', depth }]
          : []),
        {
          x0: Math.max(4, midX - currentBest.distance),
          x1: Math.min(96, midX + currentBest.distance),
          tone: 'strip',
          label: 'delta strip',
          depth,
        },
      ],
      dividers: [
        { x: midX, tone: 'split', label: 'mid' },
        { x: Math.max(4, midX - currentBest.distance), tone: 'strip', label: '-δ' },
        { x: Math.min(96, midX + currentBest.distance), tone: 'strip', label: '+δ' },
      ],
    });

    for (let i = 0; i < strip.length; i++) {
      for (
        let j = i + 1;
        j < strip.length && j <= i + 7 && strip[j]!.y - strip[i]!.y < currentBest.distance;
        j++
      ) {
        const currentPair: readonly [number, number] = [strip[i]!.id, strip[j]!.id];
        const currentDistance = distance(strip[i]!, strip[j]!);
        checkedPairs += 1;

        yield makeStep(rawPoints, {
          phase: 'compare-strip',
          description: i18nText(I18N.descriptions.stripCheck, { pair: pairLabel(currentPair) }),
          activeCodeLine: 10,
          activeIds,
          stripIds,
          currentPair,
          bestPair: currentBest.pointIds,
          bestDistance: currentBest.distance,
          candidateDistance: currentDistance,
          regionBounds,
          regionLabel,
          trail: [...trail, 'strip'],
          depth,
          midX,
          stripWidth: currentBest.distance,
          checkedPairs,
          bands: [
            ...(regionBounds
              ? [{ x0: regionBounds[0], x1: regionBounds[1], tone: 'region' as const, label: 'merge window', depth }]
              : []),
            {
              x0: Math.max(4, midX - currentBest.distance),
              x1: Math.min(96, midX + currentBest.distance),
              tone: 'strip',
              label: 'delta strip',
              depth,
            },
          ],
          dividers: [
            { x: midX, tone: 'split', label: 'mid' },
            { x: Math.max(4, midX - currentBest.distance), tone: 'strip', label: '-δ' },
            { x: Math.min(96, midX + currentBest.distance), tone: 'strip', label: '+δ' },
          ],
        });

        if (currentDistance < currentBest.distance) {
          currentBest = { pointIds: currentPair, distance: currentDistance };
          yield makeStep(rawPoints, {
            phase: 'update',
            description: i18nText(I18N.descriptions.stripWin, { pair: pairLabel(currentPair), distance: currentDistance.toFixed(2) }),
            activeCodeLine: 10,
            activeIds,
            stripIds,
            bestPair: currentBest.pointIds,
            bestDistance: currentBest.distance,
            regionBounds,
            regionLabel,
            trail: [...trail, 'strip'],
            depth,
            midX,
            stripWidth: currentBest.distance,
            checkedPairs,
            bands: [
              ...(regionBounds
                ? [{ x0: regionBounds[0], x1: regionBounds[1], tone: 'region' as const, label: 'merge window', depth }]
                : []),
              {
                x0: Math.max(4, midX - currentBest.distance),
                x1: Math.min(96, midX + currentBest.distance),
                tone: 'strip',
                label: 'tightened strip',
                depth,
              },
            ],
            dividers: [
              { x: midX, tone: 'split', label: 'mid' },
              { x: Math.max(4, midX - currentBest.distance), tone: 'strip', label: '-δ' },
              { x: Math.min(96, midX + currentBest.distance), tone: 'strip', label: '+δ' },
            ],
          });
        }
      }
    }

    return currentBest;
  }

  const best = yield* solve(sortedByX, sortedByY, 0, ['root']);

  yield makeStep(rawPoints, {
    phase: 'complete',
    description: best
      ? i18nText(I18N.descriptions.complete, { pair: pairLabel(best.pointIds), distance: best.distance.toFixed(2) })
      : i18nText(I18N.descriptions.noPair),
    activeCodeLine: 11,
    activeIds: allIds,
    bestPair: best?.pointIds ?? null,
    bestDistance: best?.distance ?? null,
    regionBounds: buildRegionBounds(rawPoints),
    regionLabel: i18nText(GEO.region.optimum),
    trail: ['root', 'done'],
    depth: 0,
    checkedPairs,
    finalPair: true,
    bands: [
      {
        x0: 4,
        x1: 96,
        tone: 'region',
        label: 'full field',
        depth: 0,
      },
    ],
  });
}
