import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { BitmaskDpScenario } from '../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.bitmaskDp.modeLabel'),
  phases: {
    initializeSubset: t('features.algorithms.runtime.dp.bitmaskDp.phases.initializeSubset'),
    inspectAssignment: t('features.algorithms.runtime.dp.bitmaskDp.phases.inspectAssignment'),
    commitAssignment: t('features.algorithms.runtime.dp.bitmaskDp.phases.commitAssignment'),
    recoverAssignment: t('features.algorithms.runtime.dp.bitmaskDp.phases.recoverAssignment'),
    complete: t('features.algorithms.runtime.dp.bitmaskDp.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.bitmaskDp.descriptions.initialize'),
    inspectAssignment: t(
      'features.algorithms.runtime.dp.bitmaskDp.descriptions.inspectAssignment',
    ),
    commitAssignment: t(
      'features.algorithms.runtime.dp.bitmaskDp.descriptions.commitAssignment',
    ),
    recoverAssignment: t(
      'features.algorithms.runtime.dp.bitmaskDp.descriptions.recoverAssignment',
    ),
    complete: t('features.algorithms.runtime.dp.bitmaskDp.descriptions.complete'),
  },
  insights: {
    workersLabel: t('features.algorithms.runtime.dp.bitmaskDp.insights.workersLabel'),
    masksLabel: t('features.algorithms.runtime.dp.bitmaskDp.insights.masksLabel'),
    bestCostLabel: t('features.algorithms.runtime.dp.bitmaskDp.insights.bestCostLabel'),
    chosenJobsLabel: t('features.algorithms.runtime.dp.bitmaskDp.insights.chosenJobsLabel'),
    jobsLabel: t('features.algorithms.runtime.dp.bitmaskDp.insights.jobsLabel'),
  },
  labels: {
    assignPair: t('features.algorithms.runtime.dp.bitmaskDp.labels.assignPair'),
    stateLabel: t('features.algorithms.runtime.dp.bitmaskDp.labels.stateLabel'),
    unreachable: t('features.algorithms.runtime.dp.bitmaskDp.labels.unreachable'),
    parentJob: t('features.algorithms.runtime.dp.bitmaskDp.labels.parentJob'),
    resultCost: t('features.algorithms.runtime.dp.bitmaskDp.labels.resultCost'),
    resultPending: t('features.algorithms.runtime.dp.bitmaskDp.labels.resultPending'),
    activeState: t('features.algorithms.runtime.dp.bitmaskDp.labels.activeState'),
    pathValue: t('features.algorithms.runtime.dp.bitmaskDp.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.bitmaskDp.labels.pathPending'),
    workersItemsLabel: t('features.algorithms.runtime.dp.bitmaskDp.labels.workersItemsLabel'),
    jobsItemsLabel: t('features.algorithms.runtime.dp.bitmaskDp.labels.jobsItemsLabel'),
    pendingValue: t('features.algorithms.runtime.dp.bitmaskDp.labels.pendingValue'),
  },
  decisions: {
    cheaperAssignment: t('features.algorithms.runtime.dp.bitmaskDp.decisions.cheaperAssignment'),
    keepPreviousBest: t('features.algorithms.runtime.dp.bitmaskDp.decisions.keepPreviousBest'),
    noValidParentState: t(
      'features.algorithms.runtime.dp.bitmaskDp.decisions.noValidParentState',
    ),
    storeParentJob: t('features.algorithms.runtime.dp.bitmaskDp.decisions.storeParentJob'),
    removeJobFromMask: t('features.algorithms.runtime.dp.bitmaskDp.decisions.removeJobFromMask'),
  },
} as const;

export function* dpWithBitmaskGenerator(scenario: BitmaskDpScenario): Generator<SortStep> {
  const workerCount = scenario.workers.length;
  const allMasks = 1 << scenario.jobs.length;
  const dp = Array.from({ length: workerCount + 1 }, () =>
    Array.from({ length: allMasks }, () => Number.POSITIVE_INFINITY),
  );
  const parentJob = Array.from({ length: workerCount + 1 }, () =>
    Array.from({ length: allMasks }, () => null as number | null),
  );
  const backtrackCells = new Set<string>();
  const assignment = new Map<number, number>();

  dp[0]![0] = 0;

  yield createStep({
    scenario,
    dp,
    parentJob,
    backtrackCells,
    assignment,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeSubset,
    phase: 'init',
  });

  for (let worker = 1; worker <= workerCount; worker++) {
    for (let mask = 0; mask < allMasks; mask++) {
      if (popcount(mask) !== worker) continue;

      let bestCost = Number.POSITIVE_INFINITY;
      let bestJob: number | null = null;

      for (let job = 0; job < scenario.jobs.length; job++) {
        if ((mask & (1 << job)) === 0) continue;
        const previousMask = mask ^ (1 << job);
        const previousCost = dp[worker - 1]![previousMask]!;
        if (!Number.isFinite(previousCost)) continue;
        const candidate = previousCost + scenario.costs[worker - 1]![job]!;

        yield createStep({
          scenario,
          dp,
          parentJob,
          backtrackCells,
          assignment,
          activeCell: [worker, mask],
          candidateCells: [[worker - 1, previousMask]],
          description: i18nText(I18N.descriptions.inspectAssignment, {
            worker: scenario.workers[worker - 1],
            job: scenario.jobs[job],
            mask: maskLabel(previousMask, scenario.jobs.length),
          }),
          activeCodeLine: 5,
          phaseLabel: I18N.phases.inspectAssignment,
          phase: 'compare',
          computation: {
            label: i18nText(I18N.labels.assignPair, {
              worker: scenario.workers[worker - 1],
              job: scenario.jobs[job],
            }),
            expression: `${previousCost} + ${scenario.costs[worker - 1]![job]!}`,
            result: String(candidate),
            decision:
              candidate < bestCost ? I18N.decisions.cheaperAssignment : I18N.decisions.keepPreviousBest,
          },
        });

        if (candidate < bestCost) {
          bestCost = candidate;
          bestJob = job;
        }
      }

      dp[worker]![mask] = bestCost;
      parentJob[worker]![mask] = bestJob;

      yield createStep({
        scenario,
        dp,
        parentJob,
        backtrackCells,
        assignment,
        activeCell: [worker, mask],
        activeStatus: Number.isFinite(bestCost) ? 'improved' : 'blocked',
        description: i18nText(I18N.descriptions.commitAssignment, {
          worker,
          mask: maskLabel(mask, scenario.jobs.length),
        }),
        activeCodeLine: 6,
        phaseLabel: I18N.phases.commitAssignment,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.stateLabel, {
            worker,
            mask: maskLabel(mask, scenario.jobs.length),
          }),
          expression:
            bestJob === null
              ? I18N.labels.unreachable
              : i18nText(I18N.labels.parentJob, {
                  job: scenario.jobs[bestJob],
                }),
          result: Number.isFinite(bestCost) ? String(bestCost) : '∞',
          decision: bestJob === null ? I18N.decisions.noValidParentState : I18N.decisions.storeParentJob,
        },
      });
    }
  }

  let worker = workerCount;
  let mask = allMasks - 1;
  while (worker > 0 && mask >= 0) {
    const job = parentJob[worker]![mask];
    if (job === null) break;
    assignment.set(worker - 1, job);
    backtrackCells.add(dpCellId(worker, mask));

    yield createStep({
      scenario,
      dp,
      parentJob,
      backtrackCells,
      assignment,
      activeCell: [worker, mask],
      activeStatus: 'backtrack',
      description: i18nText(I18N.descriptions.recoverAssignment, {
        worker: scenario.workers[worker - 1],
        job: scenario.jobs[job],
      }),
      activeCodeLine: 8,
      phaseLabel: I18N.phases.recoverAssignment,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.assignPair, {
          worker: scenario.workers[worker - 1],
          job: scenario.jobs[job],
        }),
        expression: `mask ${maskLabel(mask, scenario.jobs.length)}`,
        result: assignmentLabel(scenario, assignment),
        decision: I18N.decisions.removeJobFromMask,
      },
    });

    mask ^= 1 << job;
    worker -= 1;
  }

  yield createStep({
    scenario,
    dp,
    parentJob,
    backtrackCells,
    assignment,
    description: I18N.descriptions.complete,
    activeCodeLine: 9,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: BitmaskDpScenario;
  readonly dp: readonly (readonly number[])[];
  readonly parentJob: readonly (readonly (number | null)[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly assignment: ReadonlyMap<number, number>;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeStatus?: 'active' | 'improved' | 'blocked' | 'backtrack';
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));

  const rowHeaders: DpHeaderConfig[] = Array.from({ length: args.scenario.workers.length + 1 }, (_, worker) => ({
    id: `row-${worker}`,
    label: worker === 0 ? '0' : args.scenario.workers[worker - 1]!,
    status: (args.activeCell?.[0] === worker ? 'active' : worker === 0 ? 'source' : 'accent') as DpHeaderConfig['status'],
    metaLabel: worker === 0 ? 'base' : `${worker} assigned`,
  }));
  const colHeaders: DpHeaderConfig[] = Array.from({ length: 1 << args.scenario.jobs.length }, (_, mask) => ({
    id: `col-${mask}`,
    label: maskLabel(mask, args.scenario.jobs.length),
    status: (args.activeCell?.[1] === mask ? 'active' : mask === 0 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: jobMembers(mask, args.scenario.jobs),
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.dp.length; row++) {
    for (let col = 0; col < args.dp[row]!.length; col++) {
      const id = dpCellId(row, col);
      const value = args.dp[row]![col]!;
      const reachable = Number.isFinite(value);
      const pop = popcount(col);
      const valid = pop === row;
      const tags: DpTraceTag[] = [];
      if (row === 0 && col === 0) tags.push('base');
      if (!valid) tags.push('blocked');
      if (candidateIds.has(id)) tags.push('best');
      if (args.backtrackCells.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.parentJob[row]![col] !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '0' : args.scenario.workers[row - 1]!,
        colLabel: maskLabel(col, args.scenario.jobs.length),
        valueLabel: !valid ? '—' : reachable ? String(value) : '∞',
        metaLabel: !valid
          ? null
          : args.parentJob[row]![col] === null
            ? row === 0 && col === 0
              ? 'start'
              : null
            : args.scenario.jobs[args.parentJob[row]![col]!]!,
        status: args.backtrackCells.has(id)
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0 && col === 0
                ? 'base'
                : valid && reachable
                  ? 'chosen'
                  : !valid
                    ? 'blocked'
                    : 'idle',
        tags,
      });
    }
  }

  const finalMask = (1 << args.scenario.jobs.length) - 1;
  const finalCost = args.dp[args.scenario.workers.length]![finalMask]!;
  const insights: DpInsight[] = [
    { label: I18N.insights.workersLabel, value: String(args.scenario.workers.length), tone: 'accent' },
    { label: I18N.insights.masksLabel, value: String(1 << args.scenario.jobs.length), tone: 'info' },
    {
      label: I18N.insights.bestCostLabel,
      value: Number.isFinite(finalCost) ? String(finalCost) : I18N.labels.pendingValue,
      tone: 'success',
    },
    { label: I18N.insights.chosenJobsLabel, value: String(args.assignment.size), tone: 'warning' },
    { label: I18N.insights.jobsLabel, value: args.scenario.jobs.join(' · '), tone: 'info' },
  ];

  return createDpStep({
    mode: 'dp-with-bitmask',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: Number.isFinite(finalCost)
      ? i18nText(I18N.labels.resultCost, { value: finalCost })
      : I18N.labels.resultPending,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.dp.length} × ${args.dp[0]!.length}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeState, {
            worker: rowHeaders[args.activeCell[0]]!.label,
            mask: maskLabel(args.activeCell[1], args.scenario.jobs.length),
          })
        : null,
    pathLabel: assignmentLabel(args.scenario, args.assignment),
    primaryItemsLabel: I18N.labels.workersItemsLabel,
    primaryItems: args.scenario.workers.map((worker) => worker),
    secondaryItemsLabel: I18N.labels.jobsItemsLabel,
    secondaryItems: args.scenario.jobs.map((job) => job),
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

function popcount(value: number): number {
  let count = 0;
  let current = value;
  while (current > 0) {
    current &= current - 1;
    count += 1;
  }
  return count;
}

function maskLabel(mask: number, width: number): string {
  return mask.toString(2).padStart(width, '0');
}

function jobMembers(mask: number, jobs: readonly string[]): string {
  const members = jobs.filter((_, index) => (mask & (1 << index)) !== 0);
  return members.length > 0 ? members.join(' · ') : 'none';
}

function assignmentLabel(
  scenario: BitmaskDpScenario,
  assignment: ReadonlyMap<number, number>,
): TranslatableText {
  const parts = Array.from(assignment.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([worker, job]) => `${scenario.workers[worker]!}→${scenario.jobs[job]!}`);
  return parts.length > 0
    ? i18nText(I18N.labels.pathValue, { assignments: parts.join(' · ') })
    : I18N.labels.pathPending;
}
