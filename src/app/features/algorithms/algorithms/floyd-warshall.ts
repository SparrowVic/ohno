import { MatrixCellStatus, MatrixComputation, MatrixTraceTag } from '../models/matrix';
import { SortStep } from '../models/sort-step';
import { FloydWarshallScenario } from '../utils/matrix-scenarios/matrix-scenarios';
import { cellId, createMatrixStep } from './matrix-step';

export function* floydWarshallGenerator(scenario: FloydWarshallScenario): Generator<SortStep> {
  const dist = scenario.matrix.map((row) => [...row]);
  let totalUpdates = 0;

  yield createStep({
    scenario,
    dist,
    phaseLabel: 'Initialize distance matrix',
    statusLabel: 'Direct edges and self-distances loaded',
    resultLabel: 'updates 0',
    focusItemsLabel: 'Nodes',
    focusItems: scenario.labels,
    secondaryItemsLabel: 'Meaning',
    secondaryItems: ['∞ means currently unreachable'],
    description: 'Start from the adjacency matrix: direct edges are known, everything else is unreachable.',
    activeCodeLine: 2,
    phase: 'init',
  });

  for (let k = 0; k < dist.length; k++) {
    const pivotLabel = scenario.labels[k] ?? `K${k + 1}`;
    const pivotUpdates: string[] = [];

    yield createStep({
      scenario,
      dist,
      phaseLabel: `Pivot ${pivotLabel}`,
      statusLabel: `Allow routes that pass through ${pivotLabel}`,
      resultLabel: `updates ${totalUpdates}`,
      focusItemsLabel: 'Pivot node',
      focusItems: [pivotLabel],
      secondaryItemsLabel: 'Changed pairs',
      secondaryItems: pivotUpdates,
      description: `Use ${pivotLabel} as the newest allowed intermediate node for every pair (i, j).`,
      activeCodeLine: 3,
      pivotIndex: k,
      computation: {
        label: 'Pivot node',
        expression: `${pivotLabel}`,
        result: null,
        decision: `Every route may now optionally pass through ${pivotLabel}.`,
      },
    });

    for (let i = 0; i < dist.length; i++) {
      for (let j = 0; j < dist.length; j++) {
        const direct = dist[i]?.[j] ?? null;
        const left = dist[i]?.[k] ?? null;
        const right = dist[k]?.[j] ?? null;
        const throughPivot = left === null || right === null ? null : left + right;
        const improved = throughPivot !== null && (direct === null || throughPivot < direct);

        yield createStep({
          scenario,
          dist,
          phaseLabel: `Pivot ${pivotLabel}`,
          statusLabel: `Compare ${scenario.labels[i]} → ${scenario.labels[j]}`,
          resultLabel: `updates ${totalUpdates}`,
          focusItemsLabel: 'Pivot node',
          focusItems: [pivotLabel],
          secondaryItemsLabel: 'Changed pairs',
          secondaryItems: pivotUpdates.slice(-5),
          description: `Check whether ${scenario.labels[i]} → ${pivotLabel} → ${scenario.labels[j]} beats the current path.`,
          activeCodeLine: 4,
          activeRow: i,
          activeCol: j,
          pivotIndex: k,
          cellStatuses: new Map([[cellId(i, j), 'active' satisfies MatrixCellStatus]]),
          cellTags: new Map([
            [
              cellId(i, j),
              ['active', ...(direct === null ? (['infinite'] as const) : [])] satisfies readonly MatrixTraceTag[],
            ],
          ]),
          computation: {
            label: 'Relaxation test',
            expression: `${formatValue(direct)} vs ${formatValue(left)} + ${formatValue(right)}`,
            result: throughPivot === null ? '∞' : String(throughPivot),
            decision: improved ? 'Pivot route is shorter.' : 'Keep the current best distance.',
          },
          metaLabels: new Map([[cellId(i, j), `via ${pivotLabel}`]]),
        });

        if (!improved) {
          continue;
        }

        dist[i]![j] = throughPivot;
        totalUpdates += 1;
        const pairLabel = `${scenario.labels[i]}→${scenario.labels[j]}=${throughPivot}`;
        pivotUpdates.push(pairLabel);

        yield createStep({
          scenario,
          dist,
          phaseLabel: `Pivot ${pivotLabel}`,
          statusLabel: `Update ${scenario.labels[i]} → ${scenario.labels[j]}`,
          resultLabel: `updates ${totalUpdates}`,
          focusItemsLabel: 'Pivot node',
          focusItems: [pivotLabel],
          secondaryItemsLabel: 'Changed pairs',
          secondaryItems: pivotUpdates.slice(-5),
          description: `Replace the old value with the shorter route that passes through ${pivotLabel}.`,
          activeCodeLine: 5,
          activeRow: i,
          activeCol: j,
          pivotIndex: k,
          phase: 'relax',
          cellStatuses: new Map([[cellId(i, j), 'improved' satisfies MatrixCellStatus]]),
          cellTags: new Map([[cellId(i, j), ['improved'] satisfies readonly MatrixTraceTag[]]]),
          computation: {
            label: 'Distance update',
            expression: `${formatValue(direct)} → ${throughPivot}`,
            result: pairLabel,
            decision: `The shortest known path now goes through ${pivotLabel}.`,
          },
          metaLabels: new Map([[cellId(i, j), `old ${formatValue(direct)}`]]),
        });
      }
    }

    yield createStep({
      scenario,
      dist,
      phaseLabel: `Pivot ${pivotLabel} complete`,
      statusLabel: `${pivotUpdates.length} pair(s) improved`,
      resultLabel: `updates ${totalUpdates}`,
      focusItemsLabel: 'Pivot node',
      focusItems: [pivotLabel],
      secondaryItemsLabel: 'Changed pairs',
      secondaryItems: pivotUpdates.length > 0 ? pivotUpdates : ['no change this pivot'],
      description: `All pairs have been tested against pivot ${pivotLabel}.`,
      activeCodeLine: 6,
      pivotIndex: k,
      phase: 'pass-complete',
    });
  }

  yield createStep({
    scenario,
    dist,
    phaseLabel: 'All-pairs shortest paths ready',
    statusLabel: 'Every pivot has been processed',
    resultLabel: `updates ${totalUpdates}`,
    focusItemsLabel: 'Example shortest pairs',
    focusItems: summarizeShortestPairs(scenario.labels, dist),
    secondaryItemsLabel: 'Matrix status',
    secondaryItems: ['All rows now encode the shortest known distance to every destination'],
    description: 'Floyd-Warshall is complete: the matrix now stores shortest-path distances for every ordered pair.',
    activeCodeLine: 6,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly scenario: FloydWarshallScenario;
  readonly dist: readonly (readonly (number | null)[])[];
  readonly phaseLabel: string;
  readonly statusLabel: string;
  readonly resultLabel: string;
  readonly focusItemsLabel: string;
  readonly focusItems: readonly string[];
  readonly secondaryItemsLabel: string;
  readonly secondaryItems: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly activeRow?: number | null;
  readonly activeCol?: number | null;
  readonly pivotIndex?: number | null;
  readonly cellStatuses?: ReadonlyMap<string, MatrixCellStatus>;
  readonly cellTags?: ReadonlyMap<string, readonly MatrixTraceTag[]>;
  readonly computation?: MatrixComputation | null;
  readonly metaLabels?: ReadonlyMap<string, string>;
}): SortStep {
  return createMatrixStep({
    mode: 'floyd-warshall',
    rowLabels: args.scenario.labels,
    colLabels: args.scenario.labels,
    values: args.dist,
    phaseLabel: args.phaseLabel,
    statusLabel: args.statusLabel,
    resultLabel: args.resultLabel,
    focusItemsLabel: args.focusItemsLabel,
    focusItems: args.focusItems,
    secondaryItemsLabel: args.secondaryItemsLabel,
    secondaryItems: args.secondaryItems,
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.phase,
    activeRow: args.activeRow,
    activeCol: args.activeCol,
    pivotIndex: args.pivotIndex,
    cellStatuses: args.cellStatuses,
    cellTags: args.cellTags,
    computation: args.computation ?? null,
    metaLabels: args.metaLabels,
  });
}

function summarizeShortestPairs(
  labels: readonly string[],
  dist: readonly (readonly (number | null)[])[],
): readonly string[] {
  const pairs: string[] = [];
  for (let i = 0; i < dist.length; i++) {
    for (let j = 0; j < dist.length; j++) {
      if (i === j) continue;
      const value = dist[i]?.[j];
      if (value !== null) {
        pairs.push(`${labels[i]}→${labels[j]} ${value}`);
      }
    }
  }
  return pairs.slice(0, 6);
}

function formatValue(value: number | null): string {
  return value === null ? '∞' : String(value);
}
