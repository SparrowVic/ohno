import { DpCellConfig, DpHeaderConfig, createDpStep } from '../dp-step';
import { DpComputation, DpInsight } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { ClimbingStairsScenario } from '../../utils/dp-scenarios/dp-scenarios';

export function* climbingStairsGenerator(scenario: ClimbingStairsScenario): Generator<SortStep> {
  const ways = Array.from({ length: scenario.steps + 1 }, () => 0);
  ways[0] = 1;
  if (scenario.steps >= 1) ways[1] = 1;

  yield createStep({
    scenario,
    ways,
    description: 'Seed the ground step and the first stair with one way each.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize first landings',
    phase: 'init',
  });

  for (let step = 2; step <= scenario.steps; step++) {
    yield createStep({
      scenario,
      ways,
      activeIndex: step,
      candidateIndexes: [step - 1, step - 2],
      description: `Ways to reach stair ${step} come from stair ${step - 1} and stair ${step - 2}.`,
      activeCodeLine: 4,
      phaseLabel: 'Inspect recurrence parents',
      phase: 'compare',
      computation: {
        label: `ways[${step}]`,
        expression: `${ways[step - 1]!} + ${ways[step - 2]!}`,
        result: String(ways[step - 1]! + ways[step - 2]!),
        decision: 'add one-step and two-step arrivals',
      },
    });

    ways[step] = ways[step - 1]! + ways[step - 2]!;

    yield createStep({
      scenario,
      ways,
      activeIndex: step,
      candidateIndexes: [step - 1, step - 2],
      activeStatus: 'improved',
      description: `Store the total number of ways to stand on stair ${step}.`,
      activeCodeLine: 5,
      phaseLabel: 'Commit stair count',
      phase: 'settle-node',
      computation: {
        label: `ways[${step}]`,
        expression: `${ways[step - 1]!} + ${ways[step - 2]!}`,
        result: String(ways[step]!),
        decision: 'recurrence committed',
      },
    });
  }

  yield createStep({
    scenario,
    ways,
    activeIndex: scenario.steps,
    activeStatus: 'chosen',
    description: `Finished counting all valid 1-step and 2-step climbs up to stair ${scenario.steps}.`,
    activeCodeLine: 6,
    phaseLabel: 'Count ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: ClimbingStairsScenario;
  readonly ways: readonly number[];
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
  const rowHeaders: DpHeaderConfig[] = [{ id: 'row-ways', label: 'ways', status: 'accent', metaLabel: 'count' }];
  const colHeaders: DpHeaderConfig[] = args.ways.map((_, index) => ({
    id: `col-${index}`,
    label: String(index),
    status: (args.activeIndex === index ? 'active' : candidateSet.has(index) ? 'accent' : index <= 1 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: index === 0 ? 'ground' : 'step',
  }));

  const cells: DpCellConfig[] = args.ways.map((value, index) => ({
    row: 0,
    col: index,
    rowLabel: 'ways',
    colLabel: `${index}`,
    valueLabel: String(value),
    metaLabel: index === 0 ? 'base' : index === args.scenario.steps ? 'goal' : null,
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
    { label: 'Stairs', value: String(args.scenario.steps), tone: 'accent' },
    { label: 'Ways', value: String(args.ways[args.scenario.steps] ?? 0), tone: 'success' },
    { label: 'Last pair', value: args.activeIndex && args.activeIndex >= 2 ? `${args.ways[args.activeIndex - 1]} + ${args.ways[args.activeIndex - 2]}` : 'seed', tone: 'warning' },
    { label: 'Base', value: '1 / 1', tone: 'info' },
    { label: 'Strip', value: `1 × ${args.ways.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'climbing-stairs',
    modeLabel: 'Climbing Stairs',
    phaseLabel: args.phaseLabel,
    resultLabel: `ways = ${args.ways[args.scenario.steps] ?? 0}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `1 × ${args.ways.length}`,
    activeLabel: args.activeIndex === undefined ? null : `step ${args.activeIndex}`,
    pathLabel: `Sequence: ${args.ways.join(' · ')}`,
    primaryItemsLabel: 'Landing indices',
    primaryItems: args.ways.map((_, index) => `step ${index}`),
    secondaryItemsLabel: 'Computed ways',
    secondaryItems: args.ways.map((value, index) => `w${index}=${value}`),
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
