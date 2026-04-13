import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { ProfileDpScenario } from '../utils/dp-scenarios';

type ProfileTransition = { readonly nextMask: number; readonly label: string };

const PROFILE_TRANSITIONS: Record<number, readonly ProfileTransition[]> = {
  0: [
    { nextMask: 0, label: 'vertical domino' },
    { nextMask: 3, label: 'two horizontals' },
  ],
  1: [{ nextMask: 2, label: 'bottom horizontal' }],
  2: [{ nextMask: 1, label: 'top horizontal' }],
  3: [{ nextMask: 0, label: 'already filled' }],
};

export function* profileDpGenerator(scenario: ProfileDpScenario): Generator<SortStep> {
  const maskCount = 1 << scenario.height;
  const dp = Array.from({ length: scenario.columns + 1 }, () => Array.from({ length: maskCount }, () => 0));
  const parentMask = Array.from({ length: scenario.columns + 1 }, () => Array.from({ length: maskCount }, () => null as number | null));
  const traced = new Set<string>();
  const route: number[] = [];

  dp[0]![0] = 1;

  yield createStep({
    scenario,
    dp,
    parentMask,
    traced,
    route,
    description: 'Seed column 0 with an empty frontier mask before any dominoes are placed.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize empty profile',
    phase: 'init',
  });

  for (let column = 0; column < scenario.columns; column++) {
    for (let mask = 0; mask < maskCount; mask++) {
      const ways = dp[column]![mask]!;
      if (ways === 0) continue;

      for (const transition of PROFILE_TRANSITIONS[mask] ?? []) {
        const nextMask = transition.nextMask;
        const nextWays = dp[column + 1]![nextMask]! + ways;

        yield createStep({
          scenario,
          dp,
          parentMask,
          traced,
          route,
          activeCell: [column + 1, nextMask],
          candidateCells: [[column, mask]],
          description: `At column ${column + 1}, frontier ${profileLabel(mask)} can transition to ${profileLabel(nextMask)} via ${transition.label}.`,
          activeCodeLine: 5,
          phaseLabel: 'Inspect profile transition',
          phase: 'compare',
          computation: {
            label: `${profileLabel(mask)} -> ${profileLabel(nextMask)}`,
            expression: `${dp[column + 1]![nextMask]!} + ${ways}`,
            result: String(nextWays),
            decision: 'add every valid tiling continuation for this frontier',
          },
        });

        dp[column + 1]![nextMask] = nextWays;
        if (parentMask[column + 1]![nextMask] === null) {
          parentMask[column + 1]![nextMask] = mask;
        }

        yield createStep({
          scenario,
          dp,
          parentMask,
          traced,
          route,
          activeCell: [column + 1, nextMask],
          candidateCells: [[column, mask]],
          activeStatus: 'improved',
          description: `Commit the new tiling count for column ${column + 1} and frontier ${profileLabel(nextMask)}.`,
          activeCodeLine: 6,
          phaseLabel: 'Commit profile count',
          phase: 'settle-node',
          computation: {
            label: `dp[${column + 1}][${profileLabel(nextMask)}]`,
            expression: `${dp[column + 1]![nextMask]! - ways} + ${ways}`,
            result: String(dp[column + 1]![nextMask]!),
            decision: `store one parent frontier ${profileLabel(parentMask[column + 1]![nextMask] ?? 0)}`,
          },
        });
      }
    }
  }

  let column = scenario.columns;
  let mask = 0;
  while (column >= 0) {
    traced.add(dpCellId(column, mask));
    route.unshift(mask);

    yield createStep({
      scenario,
      dp,
      parentMask,
      traced,
      route,
      activeCell: [column, mask],
      activeStatus: 'backtrack',
      description: `Trace one valid frontier route ending in empty mask ${profileLabel(mask)}.`,
      activeCodeLine: 8,
      phaseLabel: 'Backtrack profile route',
      phase: 'relax',
      computation: {
        label: `column ${column}`,
        expression: `mask ${profileLabel(mask)}`,
        result: routeLabel(route),
        decision: column === 0 ? 'origin frontier reached' : `jump to parent ${profileLabel(parentMask[column]![mask] ?? 0)}`,
      },
    });

    if (column === 0) break;
    mask = parentMask[column]![mask] ?? 0;
    column -= 1;
  }

  yield createStep({
    scenario,
    dp,
    parentMask,
    traced,
    route,
    description: `Finished counting profile transitions for a ${scenario.height}×${scenario.columns} domino board.`,
    activeCodeLine: 9,
    phaseLabel: 'Tiling counts ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: ProfileDpScenario;
  readonly dp: readonly (readonly number[])[];
  readonly parentMask: readonly (readonly (number | null)[])[];
  readonly traced: ReadonlySet<string>;
  readonly route: readonly number[];
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

  const rowHeaders: DpHeaderConfig[] = Array.from({ length: args.dp.length }, (_, column) => ({
    id: `row-${column}`,
    label: `c${column}`,
    status: (args.activeCell?.[0] === column ? 'active' : column === 0 ? 'source' : 'accent') as DpHeaderConfig['status'],
    metaLabel: column === 0 ? 'start' : 'frontier',
  }));
  const colHeaders: DpHeaderConfig[] = Array.from({ length: args.dp[0]!.length }, (_, mask) => ({
    id: `col-${mask}`,
    label: profileLabel(mask),
    status: (args.activeCell?.[1] === mask ? 'active' : mask === 0 ? 'target' : 'idle') as DpHeaderConfig['status'],
    metaLabel: mask === 0 ? 'empty' : 'filled bits',
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.dp.length; row++) {
    for (let col = 0; col < args.dp[row]!.length; col++) {
      const id = dpCellId(row, col);
      const tags: DpTraceTag[] = [];
      if (row === 0 && col === 0) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (args.traced.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.parentMask[row]![col] !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: `c${row}`,
        colLabel: profileLabel(col),
        valueLabel: String(args.dp[row]![col]!),
        metaLabel: args.parentMask[row]![col] === null ? (row === 0 && col === 0 ? 'seed' : null) : profileLabel(args.parentMask[row]![col] ?? 0),
        status: args.traced.has(id)
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0 && col === 0
                ? 'base'
                : args.dp[row]![col]! > 0
                  ? 'chosen'
                  : 'idle',
        tags,
      });
    }
  }

  const result = args.dp[args.scenario.columns]![0]!;
  const insights: DpInsight[] = [
    { label: 'Board', value: `${args.scenario.height}×${args.scenario.columns}`, tone: 'accent' },
    { label: 'Profiles', value: String(args.dp[0]!.length), tone: 'info' },
    { label: 'Tilings', value: String(result), tone: 'success' },
    { label: 'Route masks', value: String(args.route.length), tone: 'warning' },
    { label: 'Goal mask', value: profileLabel(0), tone: 'info' },
  ];

  return createDpStep({
    mode: 'profile-dp',
    modeLabel: 'Profile DP',
    phaseLabel: args.phaseLabel,
    resultLabel: `tilings = ${result}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.dp.length} × ${args.dp[0]!.length}`,
    activeLabel: args.activeCell ? `c${args.activeCell[0]} × ${profileLabel(args.activeCell[1])}` : null,
    pathLabel: routeLabel(args.route),
    primaryItemsLabel: 'Profiles',
    primaryItems: Array.from({ length: args.dp[0]!.length }, (_, mask) => profileLabel(mask)),
    secondaryItemsLabel: 'Column fronts',
    secondaryItems: Array.from({ length: args.dp.length }, (_, column) => `c${column}`),
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

function profileLabel(mask: number): string {
  return mask.toString(2).padStart(2, '0');
}

function routeLabel(route: readonly number[]): string {
  return route.length > 0 ? `Route: ${route.map((mask) => profileLabel(mask)).join(' → ')}` : 'Route: pending';
}
