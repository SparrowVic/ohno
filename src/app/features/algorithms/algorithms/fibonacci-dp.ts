import { DpCellConfig, DpHeaderConfig, createDpStep } from './dp-step';
import { DpComputation, DpInsight } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { FibonacciScenario } from '../utils/dp-scenarios';

export function* fibonacciDpGenerator(scenario: FibonacciScenario): Generator<SortStep> {
  const fib = Array.from({ length: scenario.n + 1 }, () => 0);
  if (scenario.n >= 1) fib[1] = 1;

  yield createStep({
    scenario,
    fib,
    description: 'Seed F(0) = 0 and F(1) = 1 before tabulating larger terms.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize base terms',
    phase: 'init',
  });

  for (let index = 2; index <= scenario.n; index++) {
    yield createStep({
      scenario,
      fib,
      activeIndex: index,
      candidateIndexes: [index - 1, index - 2],
      description: `F(${index}) is the sum of the two previous Fibonacci terms.`,
      activeCodeLine: 4,
      phaseLabel: 'Inspect recurrence parents',
      phase: 'compare',
      computation: {
        label: `F(${index})`,
        expression: `${fib[index - 1]!} + ${fib[index - 2]!}`,
        result: String(fib[index - 1]! + fib[index - 2]!),
        decision: 'combine adjacent cached terms',
      },
    });

    fib[index] = fib[index - 1]! + fib[index - 2]!;

    yield createStep({
      scenario,
      fib,
      activeIndex: index,
      candidateIndexes: [index - 1, index - 2],
      activeStatus: 'improved',
      description: `Store F(${index}) in the table so later terms can reuse it instantly.`,
      activeCodeLine: 5,
      phaseLabel: 'Commit Fibonacci term',
      phase: 'settle-node',
      computation: {
        label: `F(${index})`,
        expression: `${fib[index - 1]!} + ${fib[index - 2]!}`,
        result: String(fib[index]!),
        decision: 'cache filled for future terms',
      },
    });
  }

  yield createStep({
    scenario,
    fib,
    activeIndex: scenario.n,
    activeStatus: 'chosen',
    description: `Tabulation finishes with F(${scenario.n}) ready at the end of the strip.`,
    activeCodeLine: 6,
    phaseLabel: 'Fibonacci ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: FibonacciScenario;
  readonly fib: readonly number[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeIndex?: number;
  readonly candidateIndexes?: readonly number[];
  readonly activeStatus?: 'active' | 'improved' | 'chosen';
  readonly computation?: DpComputation | null;
}): SortStep {
  const candidateSet = new Set(args.candidateIndexes ?? []);
  const rowHeaders: DpHeaderConfig[] = [{ id: 'row-fib', label: 'fib', status: 'accent', metaLabel: 'cache' }];
  const colHeaders: DpHeaderConfig[] = args.fib.map((_, index) => ({
    id: `col-${index}`,
    label: String(index),
    status: (args.activeIndex === index ? 'active' : candidateSet.has(index) ? 'accent' : index <= 1 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: index <= 1 ? 'base' : 'term',
  }));

  const cells: DpCellConfig[] = args.fib.map((value, index) => ({
    row: 0,
    col: index,
    rowLabel: 'fib',
    colLabel: `${index}`,
    valueLabel: String(value),
    metaLabel: index === args.scenario.n ? 'target' : null,
    status:
      args.activeIndex === index
        ? (args.activeStatus ?? 'active')
        : index <= 1
          ? 'base'
          : candidateSet.has(index)
            ? 'candidate'
            : index < (args.activeIndex ?? 0)
              ? 'chosen'
              : 'idle',
    tags: [
      ...(index <= 1 ? (['base'] as const) : []),
      ...(candidateSet.has(index) ? (['best'] as const) : []),
      ...(args.activeIndex === index ? (['active'] as const) : []),
    ],
  }));

  const insights: DpInsight[] = [
    { label: 'n', value: String(args.scenario.n), tone: 'accent' },
    { label: 'F(n)', value: String(args.fib[args.scenario.n] ?? 0), tone: 'success' },
    { label: 'Growth', value: args.activeIndex && args.activeIndex >= 2 ? `${args.fib[args.activeIndex - 2]} → ${args.fib[args.activeIndex - 1]}` : 'seed', tone: 'warning' },
    { label: 'Base', value: '0 / 1', tone: 'info' },
    { label: 'Strip', value: `1 × ${args.fib.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'fibonacci-dp',
    modeLabel: 'Fibonacci DP',
    phaseLabel: args.phaseLabel,
    resultLabel: `F(${args.scenario.n}) = ${args.fib[args.scenario.n] ?? 0}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `1 × ${args.fib.length}`,
    activeLabel: args.activeIndex === undefined ? null : `term ${args.activeIndex}`,
    pathLabel: `Sequence: ${args.fib.join(' · ')}`,
    primaryItemsLabel: 'Term indices',
    primaryItems: args.fib.map((_, index) => `F(${index})`),
    secondaryItemsLabel: 'Cached values',
    secondaryItems: args.fib.map((value, index) => `F${index}=${value}`),
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
