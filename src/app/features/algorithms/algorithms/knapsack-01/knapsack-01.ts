import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { KnapsackScenario } from '../../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.knapsack01.modeLabel'),
  phases: {
    initializeBaseRow: t('features.algorithms.runtime.dp.knapsack01.phases.initializeBaseRow'),
    compareSkipTake: t('features.algorithms.runtime.dp.knapsack01.phases.compareSkipTake'),
    commitTableCell: t('features.algorithms.runtime.dp.knapsack01.phases.commitTableCell'),
    backtrackChosenItem: t(
      'features.algorithms.runtime.dp.knapsack01.phases.backtrackChosenItem',
    ),
    backtrackSkip: t('features.algorithms.runtime.dp.knapsack01.phases.backtrackSkip'),
    optimalSolutionReady: t(
      'features.algorithms.runtime.dp.knapsack01.phases.optimalSolutionReady',
    ),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.knapsack01.descriptions.initialize'),
    compareSkipTake: t('features.algorithms.runtime.dp.knapsack01.descriptions.compareSkipTake'),
    forcedSkip: t('features.algorithms.runtime.dp.knapsack01.descriptions.forcedSkip'),
    commitCell: t('features.algorithms.runtime.dp.knapsack01.descriptions.commitCell'),
    backtrackChosen: t('features.algorithms.runtime.dp.knapsack01.descriptions.backtrackChosen'),
    backtrackSkip: t('features.algorithms.runtime.dp.knapsack01.descriptions.backtrackSkip'),
    complete: t('features.algorithms.runtime.dp.knapsack01.descriptions.complete'),
  },
  insights: {
    capacityLabel: t('features.algorithms.runtime.dp.knapsack01.insights.capacityLabel'),
    itemsLabel: t('features.algorithms.runtime.dp.knapsack01.insights.itemsLabel'),
    bestValueLabel: t('features.algorithms.runtime.dp.knapsack01.insights.bestValueLabel'),
    pickedLabel: t('features.algorithms.runtime.dp.knapsack01.insights.pickedLabel'),
    tableLabel: t('features.algorithms.runtime.dp.knapsack01.insights.tableLabel'),
  },
  labels: {
    resultBest: t('features.algorithms.runtime.dp.knapsack01.labels.resultBest'),
    packPath: t('features.algorithms.runtime.dp.knapsack01.labels.packPath'),
    packPending: t('features.algorithms.runtime.dp.knapsack01.labels.packPending'),
    activeCell: t('features.algorithms.runtime.dp.knapsack01.labels.activeCell'),
    itemsListLabel: t('features.algorithms.runtime.dp.knapsack01.labels.itemsListLabel'),
    currentLensLabel: t('features.algorithms.runtime.dp.knapsack01.labels.currentLensLabel'),
    tableFill: t('features.algorithms.runtime.dp.knapsack01.labels.tableFill'),
    skipValue: t('features.algorithms.runtime.dp.knapsack01.labels.skipValue'),
    takeValue: t('features.algorithms.runtime.dp.knapsack01.labels.takeValue'),
    takeUnavailable: t('features.algorithms.runtime.dp.knapsack01.labels.takeUnavailable'),
    bestSoFar: t('features.algorithms.runtime.dp.knapsack01.labels.bestSoFar'),
    entersCandidate: t('features.algorithms.runtime.dp.knapsack01.labels.entersCandidate'),
    skippedHere: t('features.algorithms.runtime.dp.knapsack01.labels.skippedHere'),
    itemAtCapacity: t('features.algorithms.runtime.dp.knapsack01.labels.itemAtCapacity'),
    dpCellComputation: t('features.algorithms.runtime.dp.knapsack01.labels.dpCellComputation'),
    backtrackItem: t('features.algorithms.runtime.dp.knapsack01.labels.backtrackItem'),
    capValue: t('features.algorithms.runtime.dp.knapsack01.labels.capValue'),
    rowValue: t('features.algorithms.runtime.dp.knapsack01.labels.rowValue'),
  },
  decisions: {
    takeBranchWins: t('features.algorithms.runtime.dp.knapsack01.decisions.takeBranchWins'),
    skipBranchStaysBest: t(
      'features.algorithms.runtime.dp.knapsack01.decisions.skipBranchStaysBest',
    ),
    forcedSkip: t('features.algorithms.runtime.dp.knapsack01.decisions.forcedSkip'),
    keepTakeBranch: t('features.algorithms.runtime.dp.knapsack01.decisions.keepTakeBranch'),
    keepSkipBranch: t('features.algorithms.runtime.dp.knapsack01.decisions.keepSkipBranch'),
    itemSelected: t('features.algorithms.runtime.dp.knapsack01.decisions.itemSelected'),
    itemSkipped: t('features.algorithms.runtime.dp.knapsack01.decisions.itemSkipped'),
  },
} as const;

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
    description: i18nText(I18N.descriptions.initialize, {
      rows: itemCount + 1,
      cols: capacity + 1,
    }),
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeBaseRow,
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
          i18nText(I18N.labels.skipValue, { value: skipValue }),
          canTake ? i18nText(I18N.labels.takeValue, { value: takeValue }) : I18N.labels.takeUnavailable,
        ],
        description: canTake
          ? i18nText(I18N.descriptions.compareSkipTake, { cap, item: item.label })
          : i18nText(I18N.descriptions.forcedSkip, { item: item.label, cap }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.compareSkipTake,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.itemAtCapacity, { item: item.label, cap }),
          expression: canTake
            ? `max(dp[${row - 1}][${cap}] = ${skipValue}, dp[${row - 1}][${cap - item.weight}] + ${item.value} = ${takeValue})`
            : `item weight ${item.weight} > capacity ${cap}`,
          result: canTake ? String(Math.max(skipValue, takeValue ?? 0)) : String(skipValue),
          decision: canTake
            ? takeValue! > skipValue
              ? I18N.decisions.takeBranchWins
              : I18N.decisions.skipBranchStaysBest
            : I18N.decisions.forcedSkip,
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
          i18nText(I18N.labels.bestSoFar, { value: table[row]![cap]! }),
          canTake && (takeValue ?? Number.NEGATIVE_INFINITY) > skipValue
            ? i18nText(I18N.labels.entersCandidate, { item: item.label })
            : i18nText(I18N.labels.skippedHere, { item: item.label }),
        ],
        description: i18nText(I18N.descriptions.commitCell, {
          row,
          cap,
          value: table[row]![cap]!,
        }),
        activeCodeLine: 8,
        phaseLabel: I18N.phases.commitTableCell,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.dpCellComputation, { row, cap }),
          expression: canTake ? `${skipValue} vs ${takeValue}` : `${skipValue} only`,
          result: String(table[row]![cap]!),
          decision:
            canTake && (takeValue ?? Number.NEGATIVE_INFINITY) > skipValue
              ? I18N.decisions.keepTakeBranch
              : I18N.decisions.keepSkipBranch,
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
        pathLabel: packedItemsLabel(scenario, chosenItems),
        description: i18nText(I18N.descriptions.backtrackChosen, {
          item: item.label,
          weight: item.weight,
        }),
        activeCodeLine: 11,
        phaseLabel: I18N.phases.backtrackChosenItem,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.backtrackItem, { item: item.label }),
          expression: `${current} = ${takeValue}`,
          result: i18nText(I18N.labels.capValue, { cap: cap - item.weight }),
          decision: I18N.decisions.itemSelected,
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
        pathLabel: packedItemsLabel(scenario, chosenItems),
        description: i18nText(I18N.descriptions.backtrackSkip, { item: item.label }),
        activeCodeLine: 13,
        phaseLabel: I18N.phases.backtrackSkip,
        phase: 'skip-relax',
        computation: {
          label: i18nText(I18N.labels.backtrackItem, { item: item.label }),
          expression: `${current} = ${skipValue}`,
          result: i18nText(I18N.labels.rowValue, { row: row - 1 }),
          decision: I18N.decisions.itemSkipped,
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
    description: i18nText(I18N.descriptions.complete, {
      value: table[itemCount]![capacity]!,
      count: chosenItems.size,
    }),
    activeCodeLine: 15,
    phaseLabel: I18N.phases.optimalSolutionReady,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: KnapsackScenario;
  readonly table: readonly (readonly number[])[];
  readonly chosenItems: ReadonlySet<number>;
  readonly backtrackCells: ReadonlySet<string>;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'improved' | 'chosen' | 'blocked' | 'backtrack';
  readonly secondaryItems?: readonly TranslatableText[];
  readonly pathLabel?: TranslatableText;
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
    { label: I18N.insights.capacityLabel, value: String(args.scenario.capacity), tone: 'accent' },
    { label: I18N.insights.itemsLabel, value: String(args.scenario.items.length), tone: 'info' },
    {
      label: I18N.insights.bestValueLabel,
      value: String(args.table[args.scenario.items.length]![args.scenario.capacity]!),
      tone: 'success',
    },
    { label: I18N.insights.pickedLabel, value: String(args.chosenItems.size), tone: 'warning' },
    { label: I18N.insights.tableLabel, value: `${args.table.length} × ${args.scenario.capacity + 1}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'knapsack-01',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultBest, {
      value: args.table[args.scenario.items.length]![args.scenario.capacity]!,
    }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.scenario.capacity + 1}`,
    activeLabel: args.activeCell
      ? i18nText(I18N.labels.activeCell, { row: args.activeCell[0], cap: args.activeCell[1] })
      : null,
    pathLabel: args.pathLabel ?? packedItemsLabel(args.scenario, args.chosenItems),
    primaryItemsLabel: I18N.labels.itemsListLabel,
    primaryItems: args.scenario.items.map((item) => `${item.label} w${item.weight}/v${item.value}`),
    secondaryItemsLabel: I18N.labels.currentLensLabel,
    secondaryItems:
      args.secondaryItems ??
      (args.chosenItems.size > 0
        ? [...args.chosenItems].map((index) => args.scenario.items[index]!.label)
        : [I18N.labels.tableFill]),
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

function packedItemsLabel(
  scenario: KnapsackScenario,
  chosenItems: ReadonlySet<number>,
): TranslatableText {
  const labels = [...chosenItems]
    .sort((left, right) => left - right)
    .map((index) => scenario.items[index]!.label);
  return labels.length > 0
    ? i18nText(I18N.labels.packPath, { items: labels.join(', ') })
    : I18N.labels.packPending;
}
