import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { SubsetSumScenario } from '../utils/dp-scenarios';

export function* subsetSumGenerator(scenario: SubsetSumScenario): Generator<SortStep> {
  const count = scenario.numbers.length;
  const target = scenario.target;
  const table = Array.from({ length: count + 1 }, () => Array.from({ length: target + 1 }, () => false));
  table[0]![0] = true;
  const chosenIndexes = new Set<number>();
  const backtrackCells = new Set<string>();

  yield createStep({
    scenario,
    table,
    chosenIndexes,
    backtrackCells,
    description: 'Seed sum 0 as reachable and mark every other sum unreachable before considering any numbers.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize boolean table',
    phase: 'init',
  });

  for (let row = 1; row <= count; row++) {
    const value = scenario.numbers[row - 1]!;

    for (let sum = 0; sum <= target; sum++) {
      const skipReachable = table[row - 1]![sum]!;
      const canTake = value <= sum;
      const takeReachable = canTake ? table[row - 1]![sum - value]! : false;

      yield createStep({
        scenario,
        table,
        chosenIndexes,
        backtrackCells,
        activeCell: [row, sum],
        candidateCells: canTake ? [[row - 1, sum], [row - 1, sum - value]] : [[row - 1, sum]],
        secondaryItems: [
          `skip = ${boolLabel(skipReachable)}`,
          canTake ? `take = ${boolLabel(takeReachable)}` : 'take unavailable',
        ],
        description: canTake
          ? `Check whether sum ${sum} is reachable by skipping ${value} or taking it.`
          : `${value} is larger than sum ${sum}, so only the skip branch is legal.`,
        activeCodeLine: 5,
        phaseLabel: 'Check subset branches',
        phase: 'compare',
        computation: {
          label: `${value} for sum ${sum}`,
          expression: canTake
            ? `dp[${row - 1}][${sum}] OR dp[${row - 1}][${sum - value}]`
            : `${value} > ${sum}`,
          result: boolLabel(skipReachable || takeReachable),
          decision: takeReachable && !skipReachable ? 'take branch opens new reachable sum' : skipReachable ? 'skip branch already reaches it' : 'sum stays unreachable',
        },
      });

      table[row]![sum] = skipReachable || takeReachable;

      yield createStep({
        scenario,
        table,
        chosenIndexes,
        backtrackCells,
        activeCell: [row, sum],
        candidateCells: canTake ? [[row - 1, sum], [row - 1, sum - value]] : [[row - 1, sum]],
        activeCellStatus: table[row]![sum]! ? (takeReachable && !skipReachable ? 'improved' : 'chosen') : 'blocked',
        description: `Store reachability of sum ${sum} after processing first ${row} number(s).`,
        activeCodeLine: 8,
        phaseLabel: 'Commit reachable state',
        phase: 'settle-node',
        computation: {
          label: `dp[${row}][${sum}]`,
          expression: `${boolLabel(skipReachable)} | ${boolLabel(takeReachable)}`,
          result: boolLabel(table[row]![sum]!),
          decision: table[row]![sum]! ? 'reachable' : 'still impossible',
        },
      });
    }
  }

  if (!table[count]![target]!) {
    yield createStep({
      scenario,
      table,
      chosenIndexes,
      backtrackCells,
      description: `Target sum ${target} is impossible with the available numbers.`,
      activeCodeLine: 15,
      phaseLabel: 'No subset found',
      phase: 'complete',
    });
    return;
  }

  let row = count;
  let sum = target;
  while (row > 0 && sum >= 0) {
    backtrackCells.add(dpCellId(row, sum));
    const value = scenario.numbers[row - 1]!;
    if (table[row - 1]![sum]!) {
      yield createStep({
        scenario,
        table,
        chosenIndexes,
        backtrackCells,
        activeCell: [row, sum],
        activeCellStatus: 'backtrack',
        pathLabel: subsetLabel(scenario, chosenIndexes),
        description: `Sum ${sum} was already reachable without ${value}, so move upward and skip it.`,
        activeCodeLine: 13,
        phaseLabel: 'Backtrack skip',
        phase: 'skip-relax',
        computation: {
          label: `Skip ${value}`,
          expression: 'reachable above',
          result: `row ${row - 1}`,
          decision: 'skip value',
        },
      });
      row -= 1;
      continue;
    }

    if (sum >= value && table[row - 1]![sum - value]!) {
      chosenIndexes.add(row - 1);
      yield createStep({
        scenario,
        table,
        chosenIndexes,
        backtrackCells,
        activeCell: [row, sum],
        activeCellStatus: 'backtrack',
        pathLabel: subsetLabel(scenario, chosenIndexes),
        description: `${value} participates in the winning subset, so jump to sum ${sum - value}.`,
        activeCodeLine: 11,
        phaseLabel: 'Backtrack take',
        phase: 'relax',
        computation: {
          label: `Take ${value}`,
          expression: `sum ${sum} -> ${sum - value}`,
          result: boolLabel(true),
          decision: 'include value in subset',
        },
      });
      sum -= value;
      row -= 1;
      continue;
    }

    row -= 1;
  }

  yield createStep({
    scenario,
    table,
    chosenIndexes,
    backtrackCells,
    pathLabel: subsetLabel(scenario, chosenIndexes),
    description: `Recovered one subset that reaches ${target}.`,
    activeCodeLine: 15,
    phaseLabel: 'Subset ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: SubsetSumScenario;
  readonly table: readonly (readonly boolean[])[];
  readonly chosenIndexes: ReadonlySet<number>;
  readonly backtrackCells: ReadonlySet<string>;
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'improved' | 'chosen' | 'blocked' | 'backtrack';
  readonly secondaryItems?: readonly string[];
  readonly pathLabel?: string;
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-0', label: 'no nums', status: 'source', metaLabel: 'base' },
    ...args.scenario.numbers.map((value, index) => ({
      id: `row-${index + 1}`,
      label: `${value}`,
      status: (args.activeCell?.[0] === index + 1 ? 'active' : args.chosenIndexes.has(index) ? 'accent' : 'idle') as DpHeaderConfig['status'],
      metaLabel: 'value',
    })),
  ];
  const colHeaders: DpHeaderConfig[] = Array.from({ length: args.scenario.target + 1 }, (_, sum) => ({
    id: `col-${sum}`,
    label: String(sum),
    status: (args.activeCell?.[1] === sum ? 'active' : sum === 0 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: sum === 0 ? 'base' : 'sum',
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let sum = 0; sum < args.table[row]!.length; sum++) {
      const id = dpCellId(row, sum);
      const reachable = args.table[row]![sum]!;
      const isBase = row === 0 || sum === 0;
      const isBacktrack = args.backtrackCells.has(id);
      const tags = [
        ...(isBase ? (['base'] as const) : []),
        ...(candidateIds.has(id) ? (['best'] as const) : []),
        ...(id === activeCellId ? (['active'] as const) : []),
        ...(isBacktrack ? (['path'] as const) : []),
      ];

      cells.push({
        row,
        col: sum,
        rowLabel: row === 0 ? 'no nums' : `${args.scenario.numbers[row - 1]!}`,
        colLabel: `${sum}`,
        valueLabel: boolLabel(reachable),
        metaLabel: isBacktrack ? 'subset' : reachable ? 'yes' : 'no',
        status: isBacktrack
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeCellStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : isBase
                ? 'base'
                : reachable
                  ? 'chosen'
                  : 'blocked',
        tags,
      });
    }
  }

  const best = args.table[args.scenario.numbers.length]![args.scenario.target]!;
  const insights: DpInsight[] = [
    { label: 'Target', value: String(args.scenario.target), tone: 'accent' },
    { label: 'Values', value: args.scenario.numbers.join(', '), tone: 'info' },
    { label: 'Reachable', value: boolLabel(best), tone: best ? 'success' : 'warning' },
    { label: 'Chosen', value: String(args.chosenIndexes.size), tone: 'warning' },
    { label: 'Grid', value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'subset-sum',
    modeLabel: 'Subset Sum',
    phaseLabel: args.phaseLabel,
    resultLabel: `target = ${boolLabel(best)}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? `row ${args.activeCell[0]} · sum ${args.activeCell[1]}` : null,
    pathLabel: args.pathLabel ?? subsetLabel(args.scenario, args.chosenIndexes),
    primaryItemsLabel: 'Numbers',
    primaryItems: args.scenario.numbers.map((value) => `${value}`),
    secondaryItemsLabel: 'Current lens',
    secondaryItems: args.secondaryItems ?? ['boolean reachability'],
    insights,
    rowHeaders,
    colHeaders,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    tableShape: 'full',
    computation: args.computation ?? null,
  });
}

function subsetLabel(scenario: SubsetSumScenario, chosenIndexes: ReadonlySet<number>): string {
  const chosen = [...chosenIndexes]
    .sort((left, right) => left - right)
    .map((index) => scenario.numbers[index]!);
  return chosen.length > 0 ? `Subset: ${chosen.join(' + ')}` : 'Subset: pending';
}

function boolLabel(value: boolean): string {
  return value ? 'T' : 'F';
}
