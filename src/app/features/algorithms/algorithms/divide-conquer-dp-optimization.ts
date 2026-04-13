import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { DivideConquerDpScenario } from '../utils/dp-scenarios';

export function* divideConquerDpOptimizationGenerator(scenario: DivideConquerDpScenario): Generator<SortStep> {
  const n = scenario.values.length;
  const groups = scenario.groups;
  const prefix = [0];
  for (const value of scenario.values) prefix.push(prefix[prefix.length - 1]! + value);

  const dp = Array.from({ length: groups + 1 }, (_, row) =>
    Array.from({ length: n + 1 }, (_, col) => (row === 0 && col === 0 ? 0 : Number.POSITIVE_INFINITY)),
  );
  const opt = Array.from({ length: groups + 1 }, () => Array.from({ length: n + 1 }, () => null as number | null));
  const backtrackCells = new Set<string>();
  const partitions: Array<[number, number]> = [];

  yield createStep({
    scenario,
    dp,
    opt,
    backtrackCells,
    partitions,
    description: 'Seed the DP with zero cost for zero groups over zero elements and infinity everywhere else.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize DP rows',
    phase: 'init',
  });

  for (let group = 1; group <= groups; group++) {
    yield* compute(group, 1, n, 0, n - 1);
  }

  let group = groups;
  let end = n;
  while (group > 0 && end > 0) {
    const split = opt[group]![end];
    if (split === null) break;
    partitions.unshift([split + 1, end]);
    backtrackCells.add(dpCellId(group, end));

    yield createStep({
      scenario,
      dp,
      opt,
      backtrackCells,
      partitions,
      activeCell: [group, end],
      activeStatus: 'backtrack',
      description: `Recover partition ${split + 1}..${end} from group row ${group}.`,
      activeCodeLine: 10,
      phaseLabel: 'Backtrack split points',
      phase: 'relax',
      computation: {
        label: `group ${group}, end ${end}`,
        expression: `split = ${split}`,
        result: partitionsLabel(partitions),
        decision: `jump to previous prefix ${split}`,
      },
    });

    end = split;
    group -= 1;
  }

  yield createStep({
    scenario,
    dp,
    opt,
    backtrackCells,
    partitions,
    description: `Recovered one optimal partitioning into ${scenario.groups} groups.`,
    activeCodeLine: 11,
    phaseLabel: 'Partition plan ready',
    phase: 'complete',
  });

  function* compute(groupIndex: number, left: number, right: number, optLeft: number, optRight: number): Generator<SortStep> {
    if (left > right) return;
    const mid = Math.floor((left + right) / 2);
    let bestCost = Number.POSITIVE_INFINITY;
    let bestSplit = optLeft;
    const upper = Math.min(mid - 1, optRight);

    for (let split = optLeft; split <= upper; split++) {
      if (!Number.isFinite(dp[groupIndex - 1]![split]!)) continue;
      const segmentCost = segmentCostFn(prefix, split + 1, mid);
      const candidate = dp[groupIndex - 1]![split]! + segmentCost;

      yield createStep({
        scenario,
        dp,
        opt,
        backtrackCells,
        partitions,
        activeCell: [groupIndex, mid],
        candidateCells: [[groupIndex - 1, split]],
        description: `Try split ${split} for group ${groupIndex} ending at prefix ${mid}.`,
        activeCodeLine: 5,
        phaseLabel: 'Inspect monotone split range',
        phase: 'compare',
        computation: {
          label: `g=${groupIndex}, mid=${mid}`,
          expression: `${dp[groupIndex - 1]![split]!} + cost(${split + 1}..${mid})=${segmentCost}`,
          result: String(candidate),
          decision: candidate < bestCost ? 'new best split inside narrowed search window' : 'keep current best split',
        },
      });

      if (candidate < bestCost) {
        bestCost = candidate;
        bestSplit = split;
      }
    }

    dp[groupIndex]![mid] = bestCost;
    opt[groupIndex]![mid] = bestSplit;

    yield createStep({
      scenario,
      dp,
      opt,
      backtrackCells,
      partitions,
      activeCell: [groupIndex, mid],
      activeStatus: 'improved',
      description: `Commit dp[${groupIndex}][${mid}] with opt split ${bestSplit}.`,
      activeCodeLine: 6,
      phaseLabel: 'Commit midpoint answer',
      phase: 'settle-node',
      computation: {
        label: `dp[${groupIndex}][${mid}]`,
        expression: `search ${optLeft}..${upper}`,
        result: Number.isFinite(bestCost) ? String(bestCost) : '∞',
        decision: `left recursion gets ${optLeft}..${bestSplit}, right recursion gets ${bestSplit}..${optRight}`,
      },
    });

    yield* compute(groupIndex, left, mid - 1, optLeft, bestSplit);
    yield* compute(groupIndex, mid + 1, right, bestSplit, optRight);
  }
}

function createStep(args: {
  readonly scenario: DivideConquerDpScenario;
  readonly dp: readonly (readonly number[])[];
  readonly opt: readonly (readonly (number | null)[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly partitions: readonly (readonly [number, number])[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeStatus?: 'active' | 'improved' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));

  const rowHeaders: DpHeaderConfig[] = Array.from({ length: args.dp.length }, (_, row) => ({
    id: `row-${row}`,
    label: row === 0 ? '0' : `g${row}`,
    status: (args.activeCell?.[0] === row ? 'active' : row === 0 ? 'source' : 'accent') as DpHeaderConfig['status'],
    metaLabel: row === 0 ? 'base' : `${row} groups`,
  }));
  const colHeaders: DpHeaderConfig[] = Array.from({ length: args.dp[0]!.length }, (_, col) => ({
    id: `col-${col}`,
    label: String(col),
    status: (args.activeCell?.[1] === col ? 'active' : col === 0 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: col === 0 ? 'empty' : `prefix`,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.dp.length; row++) {
    for (let col = 0; col < args.dp[row]!.length; col++) {
      const id = dpCellId(row, col);
      const value = args.dp[row]![col]!;
      const reachable = Number.isFinite(value);
      const tags: DpTraceTag[] = [];
      if (row === 0 && col === 0) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (args.backtrackCells.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.opt[row]![col] !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '0' : `g${row}`,
        colLabel: `${col}`,
        valueLabel: reachable ? String(value) : '∞',
        metaLabel: args.opt[row]![col] === null ? null : `s${args.opt[row]![col]}`,
        status: args.backtrackCells.has(id)
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0 && col === 0
                ? 'base'
                : reachable
                  ? 'chosen'
                  : 'idle',
        tags,
      });
    }
  }

  const bestCost = args.dp[args.scenario.groups]![args.scenario.values.length]!;
  const insights: DpInsight[] = [
    { label: 'Values', value: String(args.scenario.values.length), tone: 'accent' },
    { label: 'Groups', value: String(args.scenario.groups), tone: 'info' },
    { label: 'Best cost', value: Number.isFinite(bestCost) ? String(bestCost) : 'pending', tone: 'success' },
    { label: 'Partitions', value: String(args.partitions.length), tone: 'warning' },
    { label: 'Input', value: args.scenario.values.join(' · '), tone: 'info' },
  ];

  return createDpStep({
    mode: 'divide-conquer-dp-optimization',
    modeLabel: 'Divide & Conquer DP Optimization',
    phaseLabel: args.phaseLabel,
    resultLabel: Number.isFinite(bestCost) ? `cost = ${bestCost}` : 'cost pending',
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.dp.length} × ${args.dp[0]!.length}`,
    activeLabel: args.activeCell ? `g${args.activeCell[0]} × ${args.activeCell[1]}` : null,
    pathLabel: partitionsLabel(args.partitions),
    primaryItemsLabel: 'Input values',
    primaryItems: args.scenario.values.map((value, index) => `${index + 1}:${value}`),
    secondaryItemsLabel: 'Group rows',
    secondaryItems: Array.from({ length: args.scenario.groups }, (_, index) => `g${index + 1}`),
    insights,
    rowHeaders,
    colHeaders,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    computation: args.computation ?? null,
  });
}

function segmentCostFn(prefix: readonly number[], left: number, right: number): number {
  const sum = prefix[right]! - prefix[left - 1]!;
  return sum * sum;
}

function partitionsLabel(partitions: readonly (readonly [number, number])[]): string {
  return partitions.length > 0 ? `Cuts: ${partitions.map(([left, right]) => `[${left}..${right}]`).join(' | ')}` : 'Cuts: pending';
}
