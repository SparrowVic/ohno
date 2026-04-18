import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { MatrixChainScenario } from '../utils/dp-scenarios/dp-scenarios';

export function* matrixChainMultiplicationGenerator(scenario: MatrixChainScenario): Generator<SortStep> {
  const matrixCount = scenario.dimensions.length - 1;
  const cost = Array.from({ length: matrixCount }, (_, row) =>
    Array.from({ length: matrixCount }, (_, col) => (row === col ? 0 : null as number | null)),
  );
  const split = Array.from({ length: matrixCount }, () => Array.from({ length: matrixCount }, () => null as number | null));
  const solutionCells = new Set<string>();

  yield createStep({
    scenario,
    cost,
    split,
    solutionCells,
    description: 'Start with zero cost on the diagonal: multiplying one matrix alone costs nothing.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize diagonal',
    phase: 'init',
  });

  for (let chainLength = 2; chainLength <= matrixCount; chainLength++) {
    for (let i = 0; i <= matrixCount - chainLength; i++) {
      const j = i + chainLength - 1;
      let best = Number.POSITIVE_INFINITY;
      let bestSplit: number | null = null;

      for (let k = i; k < j; k++) {
        const left = cost[i]![k] ?? 0;
        const right = cost[k + 1]![j] ?? 0;
        const merge = scenario.dimensions[i]! * scenario.dimensions[k + 1]! * scenario.dimensions[j + 1]!;
        const candidate = left + right + merge;

        yield createStep({
          scenario,
          cost,
          split,
          solutionCells,
          activeCell: [i, j],
          candidateCells: [[i, k], [k + 1, j]],
          activeCellStatus: 'active',
          secondaryItems: [`left = ${left}`, `right = ${right}`, `merge = ${merge}`],
          description: `Try split k = ${k + 1} for interval A${i + 1}..A${j + 1}.`,
          activeCodeLine: 7,
          phaseLabel: 'Inspect split candidate',
          phase: 'compare',
          computation: {
            label: `Split k = ${k + 1}`,
            expression: `${left} + ${right} + ${scenario.dimensions[i]}·${scenario.dimensions[k + 1]}·${scenario.dimensions[j + 1]}`,
            result: String(candidate),
            decision: candidate < best ? 'new best split' : 'keep older split',
          },
        });

        if (candidate < best) {
          best = candidate;
          bestSplit = k;
        }
      }

      cost[i]![j] = best;
      split[i]![j] = bestSplit;

      yield createStep({
        scenario,
        cost,
        split,
        solutionCells,
        activeCell: [i, j],
        activeCellStatus: 'improved',
        description: `Store m[${i + 1},${j + 1}] = ${best} using split k = ${(bestSplit ?? i) + 1}.`,
        activeCodeLine: 10,
        phaseLabel: 'Commit best interval',
        phase: 'settle-node',
        computation: {
          label: `m[${i + 1},${j + 1}]`,
          expression: `best split = ${(bestSplit ?? i) + 1}`,
          result: String(best),
          decision: parenthesizationFor(split, 0, matrixCount - 1),
        },
      });
    }
  }

  yield* traceSolution(0, matrixCount - 1);

  yield createStep({
    scenario,
    cost,
    split,
    solutionCells,
    description: `Optimal parenthesization is ${parenthesizationFor(split, 0, matrixCount - 1)} with cost ${cost[0]![matrixCount - 1] ?? 0}.`,
    activeCodeLine: 12,
    phaseLabel: 'Optimal chain ready',
    phase: 'complete',
  });

  function* traceSolution(i: number, j: number): Generator<SortStep> {
    solutionCells.add(dpCellId(i, j));
    if (i === j) {
      yield createStep({
        scenario,
        cost,
        split,
        solutionCells,
        activeCell: [i, j],
        activeCellStatus: 'backtrack',
        description: `A${i + 1} is a leaf matrix in the optimal multiplication tree.`,
        activeCodeLine: 11,
        phaseLabel: 'Trace leaf interval',
        phase: 'relax',
        computation: {
          label: `A${i + 1}`,
          expression: 'single matrix',
          result: '0',
          decision: 'leaf interval',
        },
      });
      return;
    }

    const k = split[i]![j] ?? i;
    yield createStep({
      scenario,
      cost,
      split,
      solutionCells,
      activeCell: [i, j],
      candidateCells: [[i, k], [k + 1, j]],
      activeCellStatus: 'backtrack',
      description: `Optimal interval A${i + 1}..A${j + 1} splits at k = ${k + 1}.`,
      activeCodeLine: 11,
      phaseLabel: 'Trace optimal split',
      phase: 'relax',
      computation: {
        label: `Trace A${i + 1}..A${j + 1}`,
        expression: `split = ${k + 1}`,
        result: parenthesizationFor(split, i, j),
        decision: 'expand left and right child intervals',
      },
    });

    yield* traceSolution(i, k);
    yield* traceSolution(k + 1, j);
  }
}

function createStep(args: {
  readonly scenario: MatrixChainScenario;
  readonly cost: readonly (readonly (number | null)[])[];
  readonly split: readonly (readonly (number | null)[])[];
  readonly solutionCells: ReadonlySet<string>;
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
  const matrixCount = args.scenario.dimensions.length - 1;
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));

  const headers: DpHeaderConfig[] = Array.from({ length: matrixCount }, (_, index) => ({
    id: `h-${index}`,
    label: `A${index + 1}`,
    status: args.activeCell && (args.activeCell[0] === index || args.activeCell[1] === index) ? 'active' : 'accent',
    metaLabel: `${args.scenario.dimensions[index]}×${args.scenario.dimensions[index + 1]}`,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < matrixCount; row++) {
    for (let col = 0; col < matrixCount; col++) {
      const id = dpCellId(row, col);
      const isBlocked = col < row;
      const isBase = row === col;
      const tags: DpTraceTag[] = [];
      if (isBase) tags.push('base');
      if (isBlocked) tags.push('blocked');
      if (candidateIds.has(id)) tags.push('best');
      if (args.solutionCells.has(id)) tags.push('path');
      if (args.activeCell && args.activeCell[0] === row && args.activeCell[1] === col) tags.push('active');
      if ((args.split[row]![col] ?? null) !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: `A${row + 1}`,
        colLabel: `A${col + 1}`,
        valueLabel: isBlocked ? '—' : isBase ? '0' : args.cost[row]![col] === null ? '∞' : String(args.cost[row]![col]!),
        metaLabel:
          isBlocked
            ? null
            : args.split[row]![col] === null
              ? row === col
                ? 'diag'
                : null
              : `k${(args.split[row]![col] ?? row) + 1}`,
        status: isBlocked
          ? 'blocked'
          : args.solutionCells.has(id)
            ? 'backtrack'
            : id === activeCellId
              ? (args.activeCellStatus ?? 'active')
              : candidateIds.has(id)
                ? 'candidate'
                : isBase
                  ? 'base'
                  : 'idle',
        tags,
      });
    }
  }

  const bestCost = args.cost[0]![matrixCount - 1];
  const insights: DpInsight[] = [
    { label: 'Matrices', value: String(matrixCount), tone: 'accent' },
    { label: 'Dims', value: args.scenario.dimensions.join(' · '), tone: 'info' },
    { label: 'Best cost', value: bestCost === null ? 'pending' : String(bestCost), tone: 'success' },
    { label: 'Solved cells', value: String(cells.filter((cell) => cell.valueLabel !== '∞' && cell.valueLabel !== '—').length), tone: 'warning' },
    { label: 'Shape', value: 'upper triangle', tone: 'info' },
  ];

  return createDpStep({
    mode: 'matrix-chain',
    modeLabel: 'Matrix Chain Multiplication',
    phaseLabel: args.phaseLabel,
    resultLabel: bestCost === null ? 'pending' : `cost = ${bestCost}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${matrixCount} × ${matrixCount}`,
    activeLabel: args.activeCell ? `A${args.activeCell[0] + 1}..A${args.activeCell[1] + 1}` : null,
    pathLabel: parenthesizationFor(args.split, 0, matrixCount - 1),
    primaryItemsLabel: 'Matrix dimensions',
    primaryItems: Array.from({ length: matrixCount }, (_, index) => `A${index + 1} ${args.scenario.dimensions[index]}×${args.scenario.dimensions[index + 1]}`),
    secondaryItemsLabel: 'Current split lens',
    secondaryItems: args.secondaryItems ?? [`optimal = ${parenthesizationFor(args.split, 0, matrixCount - 1)}`],
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

function parenthesizationFor(split: readonly (readonly (number | null)[])[], i: number, j: number): string {
  if (i > j || split.length === 0) return 'pending';
  if (i === j) return `A${i + 1}`;
  const k = split[i]![j];
  if (k === null) return `A${i + 1}..A${j + 1}`;
  return `(${parenthesizationFor(split, i, k)} · ${parenthesizationFor(split, k + 1, j)})`;
}
