import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { CoinChangeScenario } from '../utils/dp-scenarios';

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
    description: 'Initialize amount 0 with 0 coins and mark every other amount as unreachable before processing denominations.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize unreachable states',
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
          `skip = ${formatCost(skipValue)}`,
          canTake ? `take = ${formatCost(takeValue)}` : 'take unavailable',
        ],
        description: canTake
          ? `At amount ${amount}, compare skipping coin ${coin} with taking it again from the same row.`
          : `Coin ${coin} cannot help amount ${amount}, so only the skip branch survives.`,
        activeCodeLine: 5,
        phaseLabel: 'Compare skip vs take',
        phase: 'compare',
        computation: {
          label: `${coin} for amount ${amount}`,
          expression: canTake
            ? `min(dp[${row - 1}][${amount}] = ${formatCost(skipValue)}, dp[${row}][${amount - coin}] + 1 = ${formatCost(takeValue)})`
            : `${coin} > ${amount} or prior amount unreachable`,
          result: formatCost(Math.min(skipValue, takeValue)),
          decision: canTake && takeValue < skipValue ? 'reuse coin in unbounded row' : 'carry previous best',
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
        secondaryItems: [`best = ${formatCost(table[row]![amount]!)}`, `coin ${coin}`],
        description: `Store minimum coins for amount ${amount} using first ${row} denomination(s).`,
        activeCodeLine: 8,
        phaseLabel: 'Commit best coin count',
        phase: 'settle-node',
        computation: {
          label: `dp[${row}][${amount}]`,
          expression: `${formatCost(skipValue)} vs ${formatCost(takeValue)}`,
          result: formatCost(table[row]![amount]!),
          decision: canTake && takeValue < skipValue ? 'take branch chosen' : 'skip branch kept',
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
      description: `Target ${target} is unreachable with the available denominations.`,
      activeCodeLine: 15,
      phaseLabel: 'No solution',
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
        pathLabel: `Coins: ${pickedCoins.join(' + ')}`,
        description: `Take coin ${coin} and stay on the same row because coins are unbounded.`,
        activeCodeLine: 11,
        phaseLabel: 'Backtrack take',
        phase: 'relax',
        computation: {
          label: `Take ${coin}`,
          expression: `${formatCost(current)} = ${formatCost(takeValue)}`,
          result: `amount ${amount - coin}`,
          decision: 'reuse same denomination row',
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
        pathLabel: pickedCoins.length > 0 ? `Coins: ${pickedCoins.join(' + ')}` : 'Coins: tracing...',
        description: `Skip denomination ${coin} and move to the previous row.`,
        activeCodeLine: 13,
        phaseLabel: 'Backtrack skip',
        phase: 'skip-relax',
        computation: {
          label: `Skip ${coin}`,
          expression: `${formatCost(current)} = ${formatCost(skipValue)}`,
          result: `row ${row - 1}`,
          decision: 'move upward',
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
    pathLabel: `Coins: ${pickedCoins.join(' + ')}`,
    description: `Minimum coins for amount ${target} is ${table[coinCount]![target]!}.`,
    activeCodeLine: 15,
    phaseLabel: 'Optimal change ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: CoinChangeScenario;
  readonly table: readonly (readonly number[])[];
  readonly pickedCoins: readonly number[];
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
    { label: 'Target', value: String(args.scenario.target), tone: 'accent' },
    { label: 'Coins', value: args.scenario.coins.join(', '), tone: 'info' },
    { label: 'Min count', value: formatCost(best), tone: Number.isFinite(best) ? 'success' : 'warning' },
    { label: 'Picked', value: String(args.pickedCoins.length), tone: 'warning' },
    { label: 'Grid', value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'coin-change',
    modeLabel: 'Coin Change',
    phaseLabel: args.phaseLabel,
    resultLabel: `min coins = ${formatCost(best)}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? `coin row ${args.activeCell[0]} · amount ${args.activeCell[1]}` : null,
    pathLabel: args.pathLabel ?? (args.pickedCoins.length > 0 ? `Coins: ${args.pickedCoins.join(' + ')}` : 'Coins: pending'),
    primaryItemsLabel: 'Denominations',
    primaryItems: args.scenario.coins.map((coin) => `${coin}`),
    secondaryItemsLabel: 'Current lens',
    secondaryItems: args.secondaryItems ?? ['unbounded take stays on same row'],
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
