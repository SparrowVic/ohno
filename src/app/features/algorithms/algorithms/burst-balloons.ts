import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { BurstBalloonsScenario } from '../utils/dp-scenarios/dp-scenarios';

export function* burstBalloonsGenerator(scenario: BurstBalloonsScenario): Generator<SortStep> {
  const balloons = scenario.balloons;
  const count = balloons.length;
  const padded = [1, ...balloons, 1];
  const score = Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, col) => (col < row ? null : null as number | null)),
  );
  const lastBurst = Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, col) => (col < row ? null : null as number | null)),
  );
  const solutionCells = new Set<string>();
  const order: number[] = [];

  yield createStep({
    scenario,
    score,
    lastBurst,
    solutionCells,
    order,
    description: 'Pad the array with sentinel 1s so every interval can treat its chosen last balloon uniformly.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize interval canvas',
    phase: 'init',
  });

  for (let span = 1; span <= count; span++) {
    for (let left = 1; left <= count - span + 1; left++) {
      const right = left + span - 1;
      let best = 0;
      let bestIndex = left;

      for (let pivot = left; pivot <= right; pivot++) {
        const row = left - 1;
        const col = right - 1;
        const leftScore = pivot > left ? (score[left - 1]![pivot - 2] ?? 0) : 0;
        const rightScore = pivot < right ? (score[pivot]![right - 1] ?? 0) : 0;
        const burstGain = padded[left - 1]! * padded[pivot]! * padded[right + 1]!;
        const candidate = leftScore + burstGain + rightScore;

        yield createStep({
          scenario,
          score,
          lastBurst,
          solutionCells,
          order,
          activeCell: [row, col],
          candidateCells: [
            ...(pivot > left ? ([[left - 1, pivot - 2]] as const) : []),
            ...(pivot < right ? ([[pivot, right - 1]] as const) : []),
          ],
          secondaryItems: [`left = ${leftScore}`, `burst = ${burstGain}`, `right = ${rightScore}`],
          description: `Try keeping balloon #${pivot} as the last one burst inside interval #${left}..#${right}.`,
          activeCodeLine: 6,
          phaseLabel: 'Inspect last-burst candidate',
          phase: 'compare',
          computation: {
            label: `Interval #${left}..#${right}`,
            expression: `${leftScore} + ${padded[left - 1]}·${padded[pivot]}·${padded[right + 1]} + ${rightScore}`,
            result: String(candidate),
            decision: candidate > best ? 'new best last balloon' : 'keep previous split',
          },
        });

        if (candidate > best) {
          best = candidate;
          bestIndex = pivot;
        }
      }

      score[left - 1]![right - 1] = best;
      lastBurst[left - 1]![right - 1] = bestIndex - 1;

      yield createStep({
        scenario,
        score,
        lastBurst,
        solutionCells,
        order,
        activeCell: [left - 1, right - 1],
        activeCellStatus: 'improved',
        description: `Store best coin haul for interval #${left}..#${right} with balloon #${bestIndex} as the last burst.`,
        activeCodeLine: 9,
        phaseLabel: 'Commit best interval score',
        phase: 'settle-node',
        computation: {
          label: `dp[${left}][${right}]`,
          expression: `last = #${bestIndex}`,
          result: String(best),
          decision: `split saved for interval #${left}..#${right}`,
        },
      });
    }
  }

  yield* trace(1, count);

  yield createStep({
    scenario,
    score,
    lastBurst,
    solutionCells,
    order,
    description: `Recovered one optimal burst order with ${score[0]![count - 1] ?? 0} coins.`,
    activeCodeLine: 11,
    phaseLabel: 'Burst plan ready',
    phase: 'complete',
  });

  function* trace(left: number, right: number): Generator<SortStep> {
    if (left > right) return;

    const row = left - 1;
    const col = right - 1;
    const pivotIndex = (lastBurst[row]![col] ?? row) + 1;
    solutionCells.add(dpCellId(row, col));

    yield createStep({
      scenario,
      score,
      lastBurst,
      solutionCells,
      order,
      activeCell: [row, col],
      candidateCells: [
        ...(pivotIndex > left ? ([[left - 1, pivotIndex - 2]] as const) : []),
        ...(pivotIndex < right ? ([[pivotIndex, right - 1]] as const) : []),
      ],
      activeCellStatus: 'backtrack',
      description: `Optimal interval #${left}..#${right} leaves balloon #${pivotIndex} for the final pop in this subproblem.`,
      activeCodeLine: 10,
      phaseLabel: 'Trace saved split',
      phase: 'relax',
      computation: {
        label: `Trace #${left}..#${right}`,
        expression: `last burst = #${pivotIndex}`,
        result: orderLabel(order),
        decision: 'expand left and right subintervals first',
      },
    });

    yield* trace(left, pivotIndex - 1);
    yield* trace(pivotIndex + 1, right);

    order.push(pivotIndex);
    yield createStep({
      scenario,
      score,
      lastBurst,
      solutionCells,
      order,
      activeCell: [row, col],
      activeCellStatus: 'backtrack',
      description: `After both sides are solved, balloon #${pivotIndex} bursts last for interval #${left}..#${right}.`,
      activeCodeLine: 10,
      phaseLabel: 'Append burst to route',
      phase: 'relax',
      computation: {
        label: `Burst #${pivotIndex}`,
        expression: `value = ${balloons[pivotIndex - 1]!}`,
        result: orderLabel(order),
        decision: 'append interval finisher to burst order',
      },
    });
  }
}

function createStep(args: {
  readonly scenario: BurstBalloonsScenario;
  readonly score: readonly (readonly (number | null)[])[];
  readonly lastBurst: readonly (readonly (number | null)[])[];
  readonly solutionCells: ReadonlySet<string>;
  readonly order: readonly number[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'improved' | 'backtrack';
  readonly secondaryItems?: readonly string[];
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));
  const headers: DpHeaderConfig[] = args.scenario.balloons.map((value, index) => ({
    id: `h-${index}`,
    label: `#${index + 1}`,
    status: (args.activeCell && (args.activeCell[0] === index || args.activeCell[1] === index) ? 'active' : 'accent') as DpHeaderConfig['status'],
    metaLabel: `v${value}`,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.score.length; row++) {
    for (let col = 0; col < args.score[row]!.length; col++) {
      const id = dpCellId(row, col);
      const blocked = col < row;
      const savedSplit = args.lastBurst[row]![col];
      const tags: DpTraceTag[] = [];
      if (blocked) tags.push('blocked');
      if (savedSplit !== null) tags.push('split');
      if (candidateIds.has(id)) tags.push('best');
      if (args.solutionCells.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');

      cells.push({
        row,
        col,
        rowLabel: `#${row + 1}`,
        colLabel: `#${col + 1}`,
        valueLabel: blocked ? '—' : args.score[row]![col] === null ? '·' : String(args.score[row]![col]!),
        metaLabel: blocked ? null : savedSplit === null ? null : `last #${savedSplit + 1}`,
        status: blocked
          ? 'blocked'
          : args.solutionCells.has(id)
            ? 'backtrack'
            : id === activeCellId
              ? (args.activeCellStatus ?? 'active')
              : candidateIds.has(id)
                ? 'candidate'
                : savedSplit === null
                  ? 'idle'
                  : 'chosen',
        tags,
      });
    }
  }

  const best = args.score[0]?.[args.scenario.balloons.length - 1] ?? null;
  const insights: DpInsight[] = [
    { label: 'Balloons', value: String(args.scenario.balloons.length), tone: 'accent' },
    { label: 'Values', value: args.scenario.balloons.join(', '), tone: 'info' },
    { label: 'Best coins', value: best === null ? 'pending' : String(best), tone: 'success' },
    { label: 'Burst order', value: String(args.order.length), tone: 'warning' },
    { label: 'Shape', value: 'upper triangle', tone: 'info' },
  ];

  return createDpStep({
    mode: 'burst-balloons',
    modeLabel: 'Burst Balloons',
    phaseLabel: args.phaseLabel,
    resultLabel: best === null ? 'coins pending' : `coins = ${best}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.scenario.balloons.length} × ${args.scenario.balloons.length}`,
    activeLabel: args.activeCell ? `#${args.activeCell[0] + 1}..#${args.activeCell[1] + 1}` : null,
    pathLabel: orderLabel(args.order),
    primaryItemsLabel: 'Balloon values',
    primaryItems: args.scenario.balloons.map((value, index) => `#${index + 1}=${value}`),
    secondaryItemsLabel: 'Interval lens',
    secondaryItems: args.secondaryItems ?? [`sentinels = 1 | ${args.scenario.balloons.join(' ')} | 1`, `order size = ${args.order.length}`],
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

function orderLabel(order: readonly number[]): string {
  return order.length > 0 ? `Order: ${order.map((index) => `#${index}`).join(' → ')}` : 'Order: pending';
}
