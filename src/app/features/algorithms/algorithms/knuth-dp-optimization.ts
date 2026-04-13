import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { KnuthDpScenario } from '../utils/dp-scenarios';

export function* knuthDpOptimizationGenerator(scenario: KnuthDpScenario): Generator<SortStep> {
  const files = scenario.files;
  const n = files.length;
  const prefix = [0];
  for (const file of files) prefix.push(prefix[prefix.length - 1]! + file);

  const dp = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => (row === col ? 0 : col < row ? null : null as number | null)),
  );
  const opt = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => (row === col ? row : col < row ? null : null as number | null)),
  );
  const traced = new Set<string>();

  yield createStep({
    scenario,
    dp,
    opt,
    traced,
    description: 'Set the diagonal to zero because a single file needs no merge cost.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize diagonal',
    phase: 'init',
  });

  for (let span = 2; span <= n; span++) {
    for (let left = 0; left + span - 1 < n; left++) {
      const right = left + span - 1;
      const low = opt[left]![right - 1] ?? left;
      const high = Math.min(right - 1, opt[left + 1]?.[right] ?? (right - 1));
      const mergeWeight = rangeSum(prefix, left, right);
      let bestCost = Number.POSITIVE_INFINITY;
      let bestSplit = low;

      for (let split = low; split <= high; split++) {
        const candidate = (dp[left]![split] ?? 0) + (dp[split + 1]![right] ?? 0) + mergeWeight;

        yield createStep({
          scenario,
          dp,
          opt,
          traced,
          activeCell: [left, right],
          candidateCells: [[left, split], [split + 1, right]],
          description: `Knuth narrows the split search for interval ${left + 1}..${right + 1} to ${low + 1}..${high + 1}.`,
          activeCodeLine: 5,
          phaseLabel: 'Inspect narrowed split window',
          phase: 'compare',
          computation: {
            label: `files ${left + 1}..${right + 1}`,
            expression: `${dp[left]![split] ?? 0} + ${dp[split + 1]![right] ?? 0} + ${mergeWeight}`,
            result: String(candidate),
            decision: candidate < bestCost ? 'new best split inside Knuth window' : 'keep earlier split',
          },
        });

        if (candidate < bestCost) {
          bestCost = candidate;
          bestSplit = split;
        }
      }

      dp[left]![right] = bestCost;
      opt[left]![right] = bestSplit;

      yield createStep({
        scenario,
        dp,
        opt,
        traced,
        activeCell: [left, right],
        activeStatus: 'improved',
        description: `Commit dp[${left + 1}][${right + 1}] with split ${bestSplit + 1}.`,
        activeCodeLine: 6,
        phaseLabel: 'Commit interval answer',
        phase: 'settle-node',
        computation: {
          label: `dp[${left + 1}][${right + 1}]`,
          expression: `window ${low + 1}..${high + 1}`,
          result: String(bestCost),
          decision: `opt split saved as ${bestSplit + 1}`,
        },
      });
    }
  }

  yield* trace(0, n - 1);

  yield createStep({
    scenario,
    dp,
    opt,
    traced,
    description: `Recovered one optimal merge plan using the saved Knuth split windows.`,
    activeCodeLine: 8,
    phaseLabel: 'Merge plan ready',
    phase: 'complete',
  });

  function* trace(left: number, right: number): Generator<SortStep> {
    traced.add(dpCellId(left, right));
    if (left === right) {
      yield createStep({
        scenario,
        dp,
        opt,
        traced,
        activeCell: [left, right],
        activeStatus: 'backtrack',
        description: `File ${left + 1} is a leaf in the optimal merge tree.`,
        activeCodeLine: 7,
        phaseLabel: 'Trace merge leaf',
        phase: 'relax',
        computation: {
          label: `file ${left + 1}`,
          expression: 'leaf',
          result: mergePlanLabel(opt, 0, n - 1),
          decision: 'no further split needed',
        },
      });
      return;
    }

    const split = opt[left]![right] ?? left;
    yield createStep({
      scenario,
      dp,
      opt,
      traced,
      activeCell: [left, right],
      candidateCells: [[left, split], [split + 1, right]],
      activeStatus: 'backtrack',
      description: `Interval ${left + 1}..${right + 1} expands through saved split ${split + 1}.`,
      activeCodeLine: 7,
      phaseLabel: 'Trace merge split',
      phase: 'relax',
      computation: {
        label: `trace ${left + 1}..${right + 1}`,
        expression: `split = ${split + 1}`,
        result: mergePlanLabel(opt, 0, n - 1),
        decision: 'open left and right subintervals',
      },
    });

    yield* trace(left, split);
    yield* trace(split + 1, right);
  }
}

function createStep(args: {
  readonly scenario: KnuthDpScenario;
  readonly dp: readonly (readonly (number | null)[])[];
  readonly opt: readonly (readonly (number | null)[])[];
  readonly traced: ReadonlySet<string>;
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

  const headers: DpHeaderConfig[] = args.scenario.files.map((file, index) => ({
    id: `h-${index}`,
    label: `F${index + 1}`,
    status: (args.activeCell && (args.activeCell[0] === index || args.activeCell[1] === index) ? 'active' : 'accent') as DpHeaderConfig['status'],
    metaLabel: `${file}`,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.dp.length; row++) {
    for (let col = 0; col < args.dp[row]!.length; col++) {
      const id = dpCellId(row, col);
      const blocked = col < row;
      const diagonal = row === col;
      const tags: DpTraceTag[] = [];
      if (blocked) tags.push('blocked');
      if (diagonal) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (args.traced.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.opt[row]![col] !== null && !diagonal) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: `F${row + 1}`,
        colLabel: `F${col + 1}`,
        valueLabel: blocked ? '—' : diagonal ? '0' : args.dp[row]![col] === null ? '·' : String(args.dp[row]![col]!),
        metaLabel: blocked ? null : diagonal ? 'diag' : args.opt[row]![col] === null ? null : `k${(args.opt[row]![col] ?? row) + 1}`,
        status: blocked
          ? 'blocked'
          : args.traced.has(id)
            ? 'backtrack'
            : id === activeCellId
              ? (args.activeStatus ?? 'active')
              : candidateIds.has(id)
                ? 'candidate'
                : diagonal
                  ? 'base'
                  : args.dp[row]![col] === null
                    ? 'idle'
                    : 'chosen',
        tags,
      });
    }
  }

  const best = args.dp[0]![args.scenario.files.length - 1];
  const insights: DpInsight[] = [
    { label: 'Files', value: String(args.scenario.files.length), tone: 'accent' },
    { label: 'Total merge cost', value: best === null ? 'pending' : String(best), tone: 'success' },
    { label: 'Trace cells', value: String(args.traced.size), tone: 'warning' },
    { label: 'Weights', value: args.scenario.files.join(' · '), tone: 'info' },
    { label: 'Shape', value: 'upper triangle', tone: 'info' },
  ];

  return createDpStep({
    mode: 'knuth-dp-optimization',
    modeLabel: 'Knuth DP Optimization',
    phaseLabel: args.phaseLabel,
    resultLabel: best === null ? 'merge pending' : `cost = ${best}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.scenario.files.length} × ${args.scenario.files.length}`,
    activeLabel: args.activeCell ? `F${args.activeCell[0] + 1}..F${args.activeCell[1] + 1}` : null,
    pathLabel: mergePlanLabel(args.opt, 0, args.scenario.files.length - 1),
    primaryItemsLabel: 'File sizes',
    primaryItems: args.scenario.files.map((file, index) => `F${index + 1}:${file}`),
    secondaryItemsLabel: 'Opt windows',
    secondaryItems: args.scenario.files.map((_, index) => `opt row ${index + 1}`),
    insights,
    rowHeaders: headers,
    colHeaders: headers,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    tableShape: 'upper-triangle',
    computation: args.computation ?? null,
  });
}

function rangeSum(prefix: readonly number[], left: number, right: number): number {
  return prefix[right + 1]! - prefix[left]!;
}

function mergePlanLabel(opt: readonly (readonly (number | null)[])[], left: number, right: number): string {
  if (left > right) return 'pending';
  if (left === right) return `F${left + 1}`;
  const split = opt[left]![right];
  if (split === null) return `F${left + 1}..F${right + 1}`;
  return `(${mergePlanLabel(opt, left, split)} + ${mergePlanLabel(opt, split + 1, right)})`;
}
