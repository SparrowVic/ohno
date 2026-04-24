import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { ProfileDpScenario } from '../utils/scenarios/dp/dp-scenarios';

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

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.profileDp.modeLabel'),
  phases: {
    initializeProfile: t('features.algorithms.runtime.dp.profileDp.phases.initializeProfile'),
    inspectTransition: t('features.algorithms.runtime.dp.profileDp.phases.inspectTransition'),
    commitCount: t('features.algorithms.runtime.dp.profileDp.phases.commitCount'),
    backtrackRoute: t('features.algorithms.runtime.dp.profileDp.phases.backtrackRoute'),
    complete: t('features.algorithms.runtime.dp.profileDp.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.profileDp.descriptions.initialize'),
    inspectTransition: t('features.algorithms.runtime.dp.profileDp.descriptions.inspectTransition'),
    commitCount: t('features.algorithms.runtime.dp.profileDp.descriptions.commitCount'),
    backtrackRoute: t('features.algorithms.runtime.dp.profileDp.descriptions.backtrackRoute'),
    complete: t('features.algorithms.runtime.dp.profileDp.descriptions.complete'),
  },
  insights: {
    boardLabel: t('features.algorithms.runtime.dp.profileDp.insights.boardLabel'),
    profilesLabel: t('features.algorithms.runtime.dp.profileDp.insights.profilesLabel'),
    tilingsLabel: t('features.algorithms.runtime.dp.profileDp.insights.tilingsLabel'),
    routeMasksLabel: t('features.algorithms.runtime.dp.profileDp.insights.routeMasksLabel'),
    goalMaskLabel: t('features.algorithms.runtime.dp.profileDp.insights.goalMaskLabel'),
  },
  labels: {
    resultTilings: t('features.algorithms.runtime.dp.profileDp.labels.resultTilings'),
    activeState: t('features.algorithms.runtime.dp.profileDp.labels.activeState'),
    pathValue: t('features.algorithms.runtime.dp.profileDp.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.profileDp.labels.pathPending'),
    profilesLabel: t('features.algorithms.runtime.dp.profileDp.labels.profilesLabel'),
    columnFrontsLabel: t('features.algorithms.runtime.dp.profileDp.labels.columnFrontsLabel'),
    transitionLabel: t('features.algorithms.runtime.dp.profileDp.labels.transitionLabel'),
    cellLabel: t('features.algorithms.runtime.dp.profileDp.labels.cellLabel'),
    parentValue: t('features.algorithms.runtime.dp.profileDp.labels.parentValue'),
    boardValue: t('features.algorithms.runtime.dp.profileDp.labels.boardValue'),
  },
  decisions: {
    addContinuations: t('features.algorithms.runtime.dp.profileDp.decisions.addContinuations'),
    storeParentFrontier: t('features.algorithms.runtime.dp.profileDp.decisions.storeParentFrontier'),
    originReached: t('features.algorithms.runtime.dp.profileDp.decisions.originReached'),
    jumpToParent: t('features.algorithms.runtime.dp.profileDp.decisions.jumpToParent'),
  },
} as const;

export function* profileDpGenerator(scenario: ProfileDpScenario): Generator<SortStep> {
  const maskCount = 1 << scenario.height;
  const dp = Array.from({ length: scenario.columns + 1 }, () => Array.from({ length: maskCount }, () => 0));
  const parentMask = Array.from({ length: scenario.columns + 1 }, () =>
    Array.from({ length: maskCount }, () => null as number | null),
  );
  const traced = new Set<string>();
  const route: number[] = [];

  dp[0]![0] = 1;

  yield createStep({
    scenario,
    dp,
    parentMask,
    traced,
    route,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeProfile,
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
          description: i18nText(I18N.descriptions.inspectTransition, {
            column: column + 1,
            from: profileLabel(mask, scenario.height),
            to: profileLabel(nextMask, scenario.height),
            transition: transition.label,
          }),
          activeCodeLine: 5,
          phaseLabel: I18N.phases.inspectTransition,
          phase: 'compare',
          computation: {
            label: i18nText(I18N.labels.transitionLabel, {
              from: profileLabel(mask, scenario.height),
              to: profileLabel(nextMask, scenario.height),
            }),
            expression: `${dp[column + 1]![nextMask]!} + ${ways}`,
            result: String(nextWays),
            decision: I18N.decisions.addContinuations,
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
          description: i18nText(I18N.descriptions.commitCount, {
            column: column + 1,
            mask: profileLabel(nextMask, scenario.height),
          }),
          activeCodeLine: 6,
          phaseLabel: I18N.phases.commitCount,
          phase: 'settle-node',
          computation: {
            label: i18nText(I18N.labels.cellLabel, {
              column: column + 1,
              mask: profileLabel(nextMask, scenario.height),
            }),
            expression: `${dp[column + 1]![nextMask]! - ways} + ${ways}`,
            result: String(dp[column + 1]![nextMask]!),
            decision: i18nText(I18N.decisions.storeParentFrontier, {
              mask: profileLabel(parentMask[column + 1]![nextMask] ?? 0, scenario.height),
            }),
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
      description: i18nText(I18N.descriptions.backtrackRoute, {
        mask: profileLabel(mask, scenario.height),
      }),
      activeCodeLine: 8,
      phaseLabel: I18N.phases.backtrackRoute,
      phase: 'relax',
      computation: {
        label: `column ${column}`,
        expression: `mask ${profileLabel(mask, scenario.height)}`,
        result: routeLabel(route, scenario.height),
        decision:
          column === 0
            ? I18N.decisions.originReached
            : i18nText(I18N.decisions.jumpToParent, {
                mask: profileLabel(parentMask[column]![mask] ?? 0, scenario.height),
              }),
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
    description: i18nText(I18N.descriptions.complete, {
      board: `${scenario.height}×${scenario.columns}`,
    }),
    activeCodeLine: 9,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: ProfileDpScenario;
  readonly dp: readonly (readonly number[])[];
  readonly parentMask: readonly (readonly (number | null)[])[];
  readonly traced: ReadonlySet<string>;
  readonly route: readonly number[];
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
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
    label: profileLabel(mask, args.scenario.height),
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
        colLabel: profileLabel(col, args.scenario.height),
        valueLabel: String(args.dp[row]![col]!),
        metaLabel:
          args.parentMask[row]![col] === null
            ? row === 0 && col === 0
              ? 'seed'
              : null
            : profileLabel(args.parentMask[row]![col] ?? 0, args.scenario.height),
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
    {
      label: I18N.insights.boardLabel,
      value: i18nText(I18N.labels.boardValue, {
        height: args.scenario.height,
        columns: args.scenario.columns,
      }),
      tone: 'accent',
    },
    { label: I18N.insights.profilesLabel, value: String(args.dp[0]!.length), tone: 'info' },
    { label: I18N.insights.tilingsLabel, value: String(result), tone: 'success' },
    { label: I18N.insights.routeMasksLabel, value: String(args.route.length), tone: 'warning' },
    { label: I18N.insights.goalMaskLabel, value: profileLabel(0, args.scenario.height), tone: 'info' },
  ];

  return createDpStep({
    mode: 'profile-dp',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultTilings, { value: result }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.dp.length} × ${args.dp[0]!.length}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeState, {
            column: args.activeCell[0],
            mask: profileLabel(args.activeCell[1], args.scenario.height),
          })
        : null,
    pathLabel: routeLabel(args.route, args.scenario.height),
    primaryItemsLabel: I18N.labels.profilesLabel,
    primaryItems: Array.from({ length: args.dp[0]!.length }, (_, mask) => profileLabel(mask, args.scenario.height)),
    secondaryItemsLabel: I18N.labels.columnFrontsLabel,
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

function profileLabel(mask: number, width: number): string {
  return mask.toString(2).padStart(width, '0');
}

function routeLabel(route: readonly number[], width: number): TranslatableText {
  return route.length > 0
    ? i18nText(I18N.labels.pathValue, {
        route: route.map((mask) => profileLabel(mask, width)).join(' → '),
      })
    : I18N.labels.pathPending;
}
