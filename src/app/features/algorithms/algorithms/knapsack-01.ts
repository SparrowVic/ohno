import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { KnapsackScenario } from '../utils/dp-scenarios';

export function* knapsack01Generator(scenario: KnapsackScenario): Generator<SortStep> {
  const itemCount = scenario.items.length;
  const capacity = scenario.capacity;
  const table = Array.from({ length: itemCount + 1 }, () =>
    Array.from({ length: capacity + 1 }, () => 0),
  );
  const chosenItems = new Set<number>();
  const backtrackCells = new Set<string>();

  yield createStep({
    scenario,
    table,
    chosenItems,
    backtrackCells,
    description: `Initialize a ${itemCount + 1} × ${capacity + 1} table. Row 0 and capacity 0 form the base cases.`,
    activeCodeLine: 2,
    phaseLabel: 'Initialize base row',
    phase: 'init',
  });

  for (let row = 1; row <= itemCount; row++) {
    const item = scenario.items[row - 1]!;

    for (let cap = 0; cap <= capacity; cap++) {
      const skipValue = table[row - 1]![cap]!;
      const canTake = item.weight <= cap;
      const takeValue = canTake ? table[row - 1]![cap - item.weight]! + item.value : null;

      yield createStep({
        scenario,
        table,
        chosenItems,
        backtrackCells,
        activeCell: [row, cap],
        candidateCells: canTake
          ? [
              [row - 1, cap],
              [row - 1, cap - item.weight],
            ]
          : [[row - 1, cap]],
        secondaryItems: [
          `skip = ${skipValue}`,
          canTake ? `take = ${takeValue}` : `take unavailable`,
        ],
        description: canTake
          ? `At capacity ${cap}, compare skipping ${item.label} with taking it.`
          : `${item.label} is too heavy for capacity ${cap}, so only the skip branch is legal.`,
        activeCodeLine: 5,
        phaseLabel: 'Compare skip vs take',
        phase: 'compare',
        computation: {
          label: `${item.label} at capacity ${cap}`,
          expression: canTake
            ? `max(dp[${row - 1}][${cap}] = ${skipValue}, dp[${row - 1}][${cap - item.weight}] + ${item.value} = ${takeValue})`
            : `item weight ${item.weight} > capacity ${cap}`,
          result: canTake ? String(Math.max(skipValue, takeValue ?? 0)) : String(skipValue),
          decision: canTake
            ? takeValue! > skipValue
              ? 'take branch wins'
              : 'skip branch stays best'
            : 'forced skip',
        },
      });

      table[row]![cap] = canTake
        ? Math.max(skipValue, takeValue ?? Number.NEGATIVE_INFINITY)
        : skipValue;

      yield createStep({
        scenario,
        table,
        chosenItems,
        backtrackCells,
        activeCell: [row, cap],
        candidateCells: canTake
          ? [
              [row - 1, cap],
              [row - 1, cap - item.weight],
            ]
          : [[row - 1, cap]],
        activeCellStatus:
          canTake && (takeValue ?? Number.NEGATIVE_INFINITY) > skipValue
            ? 'improved'
            : canTake
              ? 'chosen'
              : 'blocked',
        secondaryItems: [
          `best so far = ${table[row]![cap]!}`,
          canTake && (takeValue ?? Number.NEGATIVE_INFINITY) > skipValue
            ? `${item.label} enters candidate pack`
            : `${item.label} skipped here`,
        ],
        description: `Write dp[${row}][${cap}] = ${table[row]![cap]!}.`,
        activeCodeLine: 8,
        phaseLabel: 'Commit table cell',
        phase: 'settle-node',
        computation: {
          label: `dp[${row}][${cap}]`,
          expression: canTake ? `${skipValue} vs ${takeValue}` : `${skipValue} only`,
          result: String(table[row]![cap]!),
          decision:
            canTake && (takeValue ?? Number.NEGATIVE_INFINITY) > skipValue
              ? 'keep take branch'
              : 'keep skip branch',
        },
      });
    }
  }

  let row = itemCount;
  let cap = capacity;
  while (row > 0 && cap >= 0) {
    const item = scenario.items[row - 1]!;
    const current = table[row]![cap]!;
    const skipValue = table[row - 1]![cap]!;
    const takeValue = item.weight <= cap ? table[row - 1]![cap - item.weight]! + item.value : null;
    backtrackCells.add(dpCellId(row, cap));

    if (takeValue !== null && current === takeValue && current !== skipValue) {
      chosenItems.add(row - 1);
      yield createStep({
        scenario,
        table,
        chosenItems,
        backtrackCells,
        activeCell: [row, cap],
        activeCellStatus: 'backtrack',
        pathLabel: `Take ${item.label}`,
        description: `${item.label} belongs to the optimal backpack, so jump diagonally by its weight ${item.weight}.`,
        activeCodeLine: 11,
        phaseLabel: 'Backtrack chosen item',
        phase: 'relax',
        computation: {
          label: `Backtrack ${item.label}`,
          expression: `${current} = ${takeValue}`,
          result: `cap ${cap - item.weight}`,
          decision: 'item selected',
        },
      });
      cap -= item.weight;
    } else {
      yield createStep({
        scenario,
        table,
        chosenItems,
        backtrackCells,
        activeCell: [row, cap],
        activeCellStatus: 'backtrack',
        pathLabel: `Skip ${item.label}`,
        description: `${item.label} is not part of the optimal backpack at this capacity, so move upward.`,
        activeCodeLine: 13,
        phaseLabel: 'Backtrack skip',
        phase: 'skip-relax',
        computation: {
          label: `Backtrack ${item.label}`,
          expression: `${current} = ${skipValue}`,
          result: `row ${row - 1}`,
          decision: 'item skipped',
        },
      });
    }
    row -= 1;
  }

  yield createStep({
    scenario,
    table,
    chosenItems,
    backtrackCells,
    pathLabel: packedItemsLabel(scenario, chosenItems),
    description: `Optimal backpack value is ${table[itemCount]![capacity]!} with ${chosenItems.size} selected item(s).`,
    activeCodeLine: 15,
    phaseLabel: 'Optimal solution ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: KnapsackScenario;
  readonly table: readonly (readonly number[])[];
  readonly chosenItems: ReadonlySet<number>;
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
    { id: 'row-0', label: '0 items', status: 'source', metaLabel: 'base' },
    ...args.scenario.items.map((item, index) => ({
      id: `row-${index + 1}`,
      label: item.label,
      status: (args.activeCell?.[0] === index + 1
        ? 'active'
        : args.chosenItems.has(index)
          ? 'accent'
          : 'idle') as DpHeaderConfig['status'],
      metaLabel: `w${item.weight} · v${item.value}`,
    })),
  ];
  const colHeaders: DpHeaderConfig[] = Array.from(
    { length: args.scenario.capacity + 1 },
    (_, cap) => ({
      id: `col-${cap}`,
      label: String(cap),
      status: args.activeCell?.[1] === cap ? 'active' : cap === 0 ? 'source' : 'idle',
      metaLabel: cap === 0 ? 'base' : null,
    }),
  );

  const cells: DpCellConfig[] = [];
  const activeRow = args.activeCell?.[0] ?? null;
  const activeCap = args.activeCell?.[1] ?? null;
  const activeItem =
    activeRow && activeRow > 0 ? (args.scenario.items[activeRow - 1] ?? null) : null;

  for (let row = 0; row < args.table.length; row++) {
    const rowLabel = row === 0 ? 'base' : args.scenario.items[row - 1]!.label;
    for (let cap = 0; cap < args.table[row]!.length; cap++) {
      const id = dpCellId(row, cap);
      const isBase = row === 0 || cap === 0;
      const isBacktrack = args.backtrackCells.has(id);
      const isSkipCandidate =
        activeRow !== null && activeCap !== null && row === activeRow - 1 && cap === activeCap;
      const isTakeCandidate =
        activeRow !== null &&
        activeCap !== null &&
        activeItem !== null &&
        activeItem.weight <= activeCap &&
        row === activeRow - 1 &&
        cap === activeCap - activeItem.weight;
      const candidateRole = isTakeCandidate ? 'take' : isSkipCandidate ? 'skip' : null;
      const status = isBacktrack
        ? 'backtrack'
        : id === activeCellId
          ? (args.activeCellStatus ?? 'active')
          : candidateIds.has(id)
            ? 'candidate'
            : isBase
              ? 'base'
              : 'idle';
      const tags = [
        ...(isBase ? (['base'] as const) : []),
        ...(candidateRole
          ? ([candidateRole] as const)
          : candidateIds.has(id)
            ? (['best'] as const)
            : []),
        ...(id === activeCellId ? (['active'] as const) : []),
        ...(isBacktrack ? (['path'] as const) : []),
      ];

      cells.push({
        row,
        col: cap,
        rowLabel,
        colLabel: `cap ${cap}`,
        valueLabel: String(args.table[row]![cap]!),
        metaLabel:
          row > 0 && args.chosenItems.has(row - 1) && isBacktrack
            ? 'packed'
            : id === activeCellId && args.activeCellStatus === 'blocked'
              ? 'too heavy'
              : id === activeCellId && args.phase === 'compare'
                ? 'compare'
                : id === activeCellId && args.phase === 'settle-node'
                  ? 'commit'
                  : id === activeCellId && (args.phase === 'relax' || args.phase === 'skip-relax')
                    ? 'trace'
                    : candidateRole === 'skip'
                      ? 'skip'
                      : candidateRole === 'take'
                        ? 'take'
                        : null,
        status,
        tags,
      });
    }
  }

  const insights: DpInsight[] = [
    { label: 'Capacity', value: String(args.scenario.capacity), tone: 'accent' },
    { label: 'Items', value: String(args.scenario.items.length), tone: 'info' },
    {
      label: 'Best value',
      value: String(args.table[args.scenario.items.length]![args.scenario.capacity]!),
      tone: 'success',
    },
    { label: 'Picked', value: String(args.chosenItems.size), tone: 'warning' },
    { label: 'Table', value: `${args.table.length} × ${args.scenario.capacity + 1}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'knapsack-01',
    modeLabel: 'Knapsack 0/1',
    phaseLabel: args.phaseLabel,
    resultLabel: `best = ${args.table[args.scenario.items.length]![args.scenario.capacity]!}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.scenario.capacity + 1}`,
    activeLabel: args.activeCell ? `row ${args.activeCell[0]} · cap ${args.activeCell[1]}` : null,
    pathLabel: args.pathLabel ?? packedItemsLabel(args.scenario, args.chosenItems),
    primaryItemsLabel: 'Items',
    primaryItems: args.scenario.items.map((item) => `${item.label} w${item.weight}/v${item.value}`),
    secondaryItemsLabel: 'Current lens',
    secondaryItems:
      args.secondaryItems ??
      (args.chosenItems.size > 0
        ? [...args.chosenItems].map((index) => args.scenario.items[index]!.label)
        : ['table fill']),
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

function packedItemsLabel(scenario: KnapsackScenario, chosenItems: ReadonlySet<number>): string {
  const labels = [...chosenItems]
    .sort((left, right) => left - right)
    .map((index) => scenario.items[index]!.label);
  return labels.length > 0 ? `Pack: ${labels.join(', ')}` : 'Pack: not traced yet';
}
