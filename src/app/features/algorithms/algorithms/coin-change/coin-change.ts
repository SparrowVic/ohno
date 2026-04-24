import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { CoinChangeScenario } from '../../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.coinChange.modeLabel'),
  phases: {
    initializeUnreachable: t(
      'features.algorithms.runtime.dp.coinChange.phases.initializeUnreachable',
    ),
    compareSkipTake: t('features.algorithms.runtime.dp.coinChange.phases.compareSkipTake'),
    commitBestCoinCount: t(
      'features.algorithms.runtime.dp.coinChange.phases.commitBestCoinCount',
    ),
    noSolution: t('features.algorithms.runtime.dp.coinChange.phases.noSolution'),
    backtrackTake: t('features.algorithms.runtime.dp.coinChange.phases.backtrackTake'),
    backtrackSkip: t('features.algorithms.runtime.dp.coinChange.phases.backtrackSkip'),
    optimalChangeReady: t('features.algorithms.runtime.dp.coinChange.phases.optimalChangeReady'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.coinChange.descriptions.initialize'),
    compareSkipTake: t('features.algorithms.runtime.dp.coinChange.descriptions.compareSkipTake'),
    forcedSkip: t('features.algorithms.runtime.dp.coinChange.descriptions.forcedSkip'),
    storeBest: t('features.algorithms.runtime.dp.coinChange.descriptions.storeBest'),
    unreachable: t('features.algorithms.runtime.dp.coinChange.descriptions.unreachable'),
    backtrackTake: t('features.algorithms.runtime.dp.coinChange.descriptions.backtrackTake'),
    backtrackSkip: t('features.algorithms.runtime.dp.coinChange.descriptions.backtrackSkip'),
    complete: t('features.algorithms.runtime.dp.coinChange.descriptions.complete'),
  },
  insights: {
    targetLabel: t('features.algorithms.runtime.dp.coinChange.insights.targetLabel'),
    coinsLabel: t('features.algorithms.runtime.dp.coinChange.insights.coinsLabel'),
    minCountLabel: t('features.algorithms.runtime.dp.coinChange.insights.minCountLabel'),
    pickedLabel: t('features.algorithms.runtime.dp.coinChange.insights.pickedLabel'),
    gridLabel: t('features.algorithms.runtime.dp.coinChange.insights.gridLabel'),
  },
  labels: {
    resultMinCoins: t('features.algorithms.runtime.dp.coinChange.labels.resultMinCoins'),
    coinPath: t('features.algorithms.runtime.dp.coinChange.labels.coinPath'),
    coinsPending: t('features.algorithms.runtime.dp.coinChange.labels.coinsPending'),
    denominationsLabel: t(
      'features.algorithms.runtime.dp.coinChange.labels.denominationsLabel',
    ),
    currentLensLabel: t('features.algorithms.runtime.dp.coinChange.labels.currentLensLabel'),
    unboundedRowHint: t('features.algorithms.runtime.dp.coinChange.labels.unboundedRowHint'),
    activeCell: t('features.algorithms.runtime.dp.coinChange.labels.activeCell'),
    skipValue: t('features.algorithms.runtime.dp.coinChange.labels.skipValue'),
    takeValue: t('features.algorithms.runtime.dp.coinChange.labels.takeValue'),
    takeUnavailable: t('features.algorithms.runtime.dp.coinChange.labels.takeUnavailable'),
    bestValue: t('features.algorithms.runtime.dp.coinChange.labels.bestValue'),
    coinValue: t('features.algorithms.runtime.dp.coinChange.labels.coinValue'),
    coinAmountComputation: t(
      'features.algorithms.runtime.dp.coinChange.labels.coinAmountComputation',
    ),
    dpCellComputation: t(
      'features.algorithms.runtime.dp.coinChange.labels.dpCellComputation',
    ),
    takeCoinComputation: t(
      'features.algorithms.runtime.dp.coinChange.labels.takeCoinComputation',
    ),
    skipCoinComputation: t(
      'features.algorithms.runtime.dp.coinChange.labels.skipCoinComputation',
    ),
    amountValue: t('features.algorithms.runtime.dp.coinChange.labels.amountValue'),
    rowValue: t('features.algorithms.runtime.dp.coinChange.labels.rowValue'),
  },
  decisions: {
    reuseCoinInUnboundedRow: t(
      'features.algorithms.runtime.dp.coinChange.decisions.reuseCoinInUnboundedRow',
    ),
    carryPreviousBest: t(
      'features.algorithms.runtime.dp.coinChange.decisions.carryPreviousBest',
    ),
    takeBranchChosen: t(
      'features.algorithms.runtime.dp.coinChange.decisions.takeBranchChosen',
    ),
    skipBranchKept: t('features.algorithms.runtime.dp.coinChange.decisions.skipBranchKept'),
    reuseSameDenominationRow: t(
      'features.algorithms.runtime.dp.coinChange.decisions.reuseSameDenominationRow',
    ),
    moveUpward: t('features.algorithms.runtime.dp.coinChange.decisions.moveUpward'),
  },
} as const;

export function* coinChangeGenerator(scenario: CoinChangeScenario): Generator<SortStep> {
  const coinCount = scenario.coins.length;
  const target = scenario.target;
  const table = Array.from({ length: coinCount + 1 }, (_, row) =>
    Array.from({ length: target + 1 }, (_, amount) => (amount === 0 ? 0 : row === 0 ? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY)),
  );
  const pickedCoins: number[] = [];
  const backtrackCells = new Set<string>();

  yield createStep({
    scenario,
    table,
    pickedCoins,
    backtrackCells,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeUnreachable,
    phase: 'init',
  });

  for (let row = 1; row <= coinCount; row++) {
    const coin = scenario.coins[row - 1]!;

    for (let amount = 1; amount <= target; amount++) {
      const skipValue = table[row - 1]![amount]!;
      const canTake = coin <= amount && Number.isFinite(table[row]![amount - coin]!);
      const takeValue = canTake ? table[row]![amount - coin]! + 1 : Number.POSITIVE_INFINITY;

      yield createStep({
        scenario,
        table,
        pickedCoins,
        backtrackCells,
        activeCell: [row, amount],
        candidateCells: canTake ? [[row - 1, amount], [row, amount - coin]] : [[row - 1, amount]],
        secondaryItems: [
          i18nText(I18N.labels.skipValue, { value: formatCost(skipValue) }),
          canTake
            ? i18nText(I18N.labels.takeValue, { value: formatCost(takeValue) })
            : I18N.labels.takeUnavailable,
        ],
        description: canTake
          ? i18nText(I18N.descriptions.compareSkipTake, { amount, coin })
          : i18nText(I18N.descriptions.forcedSkip, { coin, amount }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.compareSkipTake,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.coinAmountComputation, { coin, amount }),
          expression: canTake
            ? `min(dp[${row - 1}][${amount}] = ${formatCost(skipValue)}, dp[${row}][${amount - coin}] + 1 = ${formatCost(takeValue)})`
            : `${coin} > ${amount} or prior amount unreachable`,
          result: formatCost(Math.min(skipValue, takeValue)),
          decision:
            canTake && takeValue < skipValue
              ? I18N.decisions.reuseCoinInUnboundedRow
              : I18N.decisions.carryPreviousBest,
        },
      });

      table[row]![amount] = Math.min(skipValue, takeValue);

      yield createStep({
        scenario,
        table,
        pickedCoins,
        backtrackCells,
        activeCell: [row, amount],
        candidateCells: canTake ? [[row - 1, amount], [row, amount - coin]] : [[row - 1, amount]],
        activeCellStatus: Number.isFinite(table[row]![amount]!) ? (canTake && takeValue < skipValue ? 'improved' : 'chosen') : 'blocked',
        secondaryItems: [
          i18nText(I18N.labels.bestValue, { value: formatCost(table[row]![amount]!) }),
          i18nText(I18N.labels.coinValue, { coin }),
        ],
        description: i18nText(I18N.descriptions.storeBest, { amount, row }),
        activeCodeLine: 8,
        phaseLabel: I18N.phases.commitBestCoinCount,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.dpCellComputation, { row, amount }),
          expression: `${formatCost(skipValue)} vs ${formatCost(takeValue)}`,
          result: formatCost(table[row]![amount]!),
          decision:
            canTake && takeValue < skipValue
              ? I18N.decisions.takeBranchChosen
              : I18N.decisions.skipBranchKept,
        },
      });
    }
  }

  if (!Number.isFinite(table[coinCount]![target]!)) {
    yield createStep({
      scenario,
      table,
      pickedCoins,
      backtrackCells,
      description: i18nText(I18N.descriptions.unreachable, { target }),
      activeCodeLine: 15,
      phaseLabel: I18N.phases.noSolution,
      phase: 'complete',
    });
    return;
  }

  let row = coinCount;
  let amount = target;
  while (amount > 0 && row > 0) {
    backtrackCells.add(dpCellId(row, amount));
    const coin = scenario.coins[row - 1]!;
    const current = table[row]![amount]!;
    const skipValue = table[row - 1]![amount]!;
    const takeValue =
      coin <= amount && Number.isFinite(table[row]![amount - coin]!)
        ? table[row]![amount - coin]! + 1
        : Number.POSITIVE_INFINITY;

    if (takeValue <= current && takeValue < skipValue) {
      pickedCoins.unshift(coin);
      yield createStep({
        scenario,
        table,
        pickedCoins,
        backtrackCells,
        activeCell: [row, amount],
        activeCellStatus: 'backtrack',
        pathLabel: coinPathLabel(pickedCoins),
        description: i18nText(I18N.descriptions.backtrackTake, { coin }),
        activeCodeLine: 11,
        phaseLabel: I18N.phases.backtrackTake,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.takeCoinComputation, { coin }),
          expression: `${formatCost(current)} = ${formatCost(takeValue)}`,
          result: i18nText(I18N.labels.amountValue, { amount: amount - coin }),
          decision: I18N.decisions.reuseSameDenominationRow,
        },
      });
      amount -= coin;
    } else {
      yield createStep({
        scenario,
        table,
        pickedCoins,
        backtrackCells,
        activeCell: [row, amount],
        activeCellStatus: 'backtrack',
        pathLabel: coinPathLabel(pickedCoins),
        description: i18nText(I18N.descriptions.backtrackSkip, { coin }),
        activeCodeLine: 13,
        phaseLabel: I18N.phases.backtrackSkip,
        phase: 'skip-relax',
        computation: {
          label: i18nText(I18N.labels.skipCoinComputation, { coin }),
          expression: `${formatCost(current)} = ${formatCost(skipValue)}`,
          result: i18nText(I18N.labels.rowValue, { row: row - 1 }),
          decision: I18N.decisions.moveUpward,
        },
      });
      row -= 1;
    }
  }

  yield createStep({
    scenario,
    table,
    pickedCoins,
    backtrackCells,
    pathLabel: coinPathLabel(pickedCoins),
    description: i18nText(I18N.descriptions.complete, {
      target,
      best: table[coinCount]![target]!,
    }),
    activeCodeLine: 15,
    phaseLabel: I18N.phases.optimalChangeReady,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: CoinChangeScenario;
  readonly table: readonly (readonly number[])[];
  readonly pickedCoins: readonly number[];
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
    { id: 'row-0', label: 'no coins', status: 'source', metaLabel: 'base' },
    ...args.scenario.coins.map((coin, index) => ({
      id: `row-${index + 1}`,
      label: `${coin}`,
      status: (args.activeCell?.[0] === index + 1 ? 'active' : 'accent') as DpHeaderConfig['status'],
      metaLabel: 'coin',
    })),
  ];
  const colHeaders: DpHeaderConfig[] = Array.from({ length: args.scenario.target + 1 }, (_, amount) => ({
    id: `col-${amount}`,
    label: String(amount),
    status: (args.activeCell?.[1] === amount ? 'active' : amount === 0 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: amount === 0 ? 'base' : 'amt',
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let amount = 0; amount < args.table[row]!.length; amount++) {
      const id = dpCellId(row, amount);
      const value = args.table[row]![amount]!;
      const isBase = amount === 0;
      const unreachable = !Number.isFinite(value);
      const isBacktrack = args.backtrackCells.has(id);
      const tags = [
        ...(isBase ? (['base'] as const) : []),
        ...(candidateIds.has(id) ? (['best'] as const) : []),
        ...(id === activeCellId ? (['active'] as const) : []),
        ...(isBacktrack ? (['path'] as const) : []),
      ];

      cells.push({
        row,
        col: amount,
        rowLabel: row === 0 ? 'no coin' : `${args.scenario.coins[row - 1]!}`,
        colLabel: `${amount}`,
        valueLabel: formatCost(value),
        metaLabel: unreachable ? '∞' : isBacktrack ? 'picked' : null,
        status: isBacktrack
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeCellStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : isBase
                ? 'base'
                : unreachable
                  ? 'blocked'
                  : 'idle',
        tags,
      });
    }
  }

  const best = args.table[args.scenario.coins.length]![args.scenario.target]!;
  const insights: DpInsight[] = [
    { label: I18N.insights.targetLabel, value: String(args.scenario.target), tone: 'accent' },
    { label: I18N.insights.coinsLabel, value: args.scenario.coins.join(', '), tone: 'info' },
    {
      label: I18N.insights.minCountLabel,
      value: formatCost(best),
      tone: Number.isFinite(best) ? 'success' : 'warning',
    },
    { label: I18N.insights.pickedLabel, value: String(args.pickedCoins.length), tone: 'warning' },
    { label: I18N.insights.gridLabel, value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'coin-change',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultMinCoins, { value: formatCost(best) }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell
      ? i18nText(I18N.labels.activeCell, {
          row: args.activeCell[0],
          amount: args.activeCell[1],
        })
      : null,
    pathLabel: args.pathLabel ?? coinPathLabel(args.pickedCoins),
    primaryItemsLabel: I18N.labels.denominationsLabel,
    primaryItems: args.scenario.coins.map((coin) => `${coin}`),
    secondaryItemsLabel: I18N.labels.currentLensLabel,
    secondaryItems: args.secondaryItems ?? [I18N.labels.unboundedRowHint],
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

function formatCost(value: number): string {
  return Number.isFinite(value) ? String(value) : '∞';
}

function coinPathLabel(pickedCoins: readonly number[]): TranslatableText {
  return pickedCoins.length > 0
    ? i18nText(I18N.labels.coinPath, { coins: pickedCoins.join(' + ') })
    : I18N.labels.coinsPending;
}
