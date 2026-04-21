import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { DivideConquerDpScenario } from '../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.divideConquerDpOptimization.modeLabel'),
  phases: {
    initializeRows: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.phases.initializeRows',
    ),
    backtrackSplits: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.phases.backtrackSplits',
    ),
    complete: t('features.algorithms.runtime.dp.divideConquerDpOptimization.phases.complete'),
    inspectRange: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.phases.inspectRange',
    ),
    commitMidpoint: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.phases.commitMidpoint',
    ),
  },
  descriptions: {
    initialize: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.descriptions.initialize',
    ),
    backtrack: t('features.algorithms.runtime.dp.divideConquerDpOptimization.descriptions.backtrack'),
    complete: t('features.algorithms.runtime.dp.divideConquerDpOptimization.descriptions.complete'),
    inspectRange: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.descriptions.inspectRange',
    ),
    commitMidpoint: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.descriptions.commitMidpoint',
    ),
  },
  insights: {
    valuesLabel: t('features.algorithms.runtime.dp.divideConquerDpOptimization.insights.valuesLabel'),
    groupsLabel: t('features.algorithms.runtime.dp.divideConquerDpOptimization.insights.groupsLabel'),
    bestCostLabel: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.insights.bestCostLabel',
    ),
    partitionsLabel: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.insights.partitionsLabel',
    ),
    inputLabel: t('features.algorithms.runtime.dp.divideConquerDpOptimization.insights.inputLabel'),
  },
  labels: {
    resultCost: t('features.algorithms.runtime.dp.divideConquerDpOptimization.labels.resultCost'),
    resultPending: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.labels.resultPending',
    ),
    activeState: t('features.algorithms.runtime.dp.divideConquerDpOptimization.labels.activeState'),
    pathValue: t('features.algorithms.runtime.dp.divideConquerDpOptimization.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.divideConquerDpOptimization.labels.pathPending'),
    inputValuesLabel: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.labels.inputValuesLabel',
    ),
    groupRowsLabel: t('features.algorithms.runtime.dp.divideConquerDpOptimization.labels.groupRowsLabel'),
    stateLabel: t('features.algorithms.runtime.dp.divideConquerDpOptimization.labels.stateLabel'),
    candidateLabel: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.labels.candidateLabel',
    ),
  },
  decisions: {
    newBestSplit: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.decisions.newBestSplit',
    ),
    keepCurrentBest: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.decisions.keepCurrentBest',
    ),
    recursionWindows: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.decisions.recursionWindows',
    ),
    jumpPrevPrefix: t(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.decisions.jumpPrevPrefix',
    ),
  },
} as const;

export function* divideConquerDpOptimizationGenerator(
  scenario: DivideConquerDpScenario,
): Generator<SortStep> {
  const n = scenario.values.length;
  const groups = scenario.groups;
  const prefix = [0];
  for (const value of scenario.values) prefix.push(prefix[prefix.length - 1]! + value);

  const dp = Array.from({ length: groups + 1 }, (_, row) =>
    Array.from({ length: n + 1 }, (_, col) =>
      row === 0 && col === 0 ? 0 : Number.POSITIVE_INFINITY,
    ),
  );
  const opt = Array.from({ length: groups + 1 }, () =>
    Array.from({ length: n + 1 }, () => null as number | null),
  );
  const backtrackCells = new Set<string>();
  const partitions: Array<[number, number]> = [];

  yield createStep({
    scenario,
    dp,
    opt,
    backtrackCells,
    partitions,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeRows,
    phase: 'init',
  });

  for (let group = 1; group <= groups; group++) {
    yield* compute(group, 1, n, 0, n - 1);
  }

  let group = groups;
  let end = n;
  while (group > 0 && end > 0) {
    const split = opt[group]![end];
    if (split === null) break;
    partitions.unshift([split + 1, end]);
    backtrackCells.add(dpCellId(group, end));

    yield createStep({
      scenario,
      dp,
      opt,
      backtrackCells,
      partitions,
      activeCell: [group, end],
      activeStatus: 'backtrack',
      description: i18nText(I18N.descriptions.backtrack, {
        left: split + 1,
        right: end,
        group,
      }),
      activeCodeLine: 10,
      phaseLabel: I18N.phases.backtrackSplits,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.stateLabel, { group, end }),
        expression: `split = ${split}`,
        result: partitionsLabelText(partitions),
        decision: i18nText(I18N.decisions.jumpPrevPrefix, { split }),
      },
    });

    end = split;
    group -= 1;
  }

  yield createStep({
    scenario,
    dp,
    opt,
    backtrackCells,
    partitions,
    description: i18nText(I18N.descriptions.complete, { groups: scenario.groups }),
    activeCodeLine: 11,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });

  function* compute(
    groupIndex: number,
    left: number,
    right: number,
    optLeft: number,
    optRight: number,
  ): Generator<SortStep> {
    if (left > right) return;
    const mid = Math.floor((left + right) / 2);
    let bestCost = Number.POSITIVE_INFINITY;
    let bestSplit = optLeft;
    const upper = Math.min(mid - 1, optRight);

    for (let split = optLeft; split <= upper; split++) {
      if (!Number.isFinite(dp[groupIndex - 1]![split]!)) continue;
      const segmentCost = segmentCostFn(prefix, split + 1, mid);
      const candidate = dp[groupIndex - 1]![split]! + segmentCost;

      yield createStep({
        scenario,
        dp,
        opt,
        backtrackCells,
        partitions,
        activeCell: [groupIndex, mid],
        candidateCells: [[groupIndex - 1, split]],
        description: i18nText(I18N.descriptions.inspectRange, {
          split,
          group: groupIndex,
          mid,
        }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.inspectRange,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.candidateLabel, { group: groupIndex, mid }),
          expression: `${dp[groupIndex - 1]![split]!} + cost(${split + 1}..${mid})=${segmentCost}`,
          result: String(candidate),
          decision: candidate < bestCost ? I18N.decisions.newBestSplit : I18N.decisions.keepCurrentBest,
        },
      });

      if (candidate < bestCost) {
        bestCost = candidate;
        bestSplit = split;
      }
    }

    dp[groupIndex]![mid] = bestCost;
    opt[groupIndex]![mid] = bestSplit;

    yield createStep({
      scenario,
      dp,
      opt,
      backtrackCells,
      partitions,
      activeCell: [groupIndex, mid],
      activeStatus: 'improved',
      description: i18nText(I18N.descriptions.commitMidpoint, {
        group: groupIndex,
        mid,
        split: bestSplit,
      }),
      activeCodeLine: 6,
      phaseLabel: I18N.phases.commitMidpoint,
      phase: 'settle-node',
      computation: {
        label: i18nText(I18N.labels.stateLabel, { group: groupIndex, end: mid }),
        expression: `search ${optLeft}..${upper}`,
        result: Number.isFinite(bestCost) ? String(bestCost) : '∞',
        decision: i18nText(I18N.decisions.recursionWindows, {
          left: `${optLeft}..${bestSplit}`,
          right: `${bestSplit}..${optRight}`,
        }),
      },
    });

    yield* compute(groupIndex, left, mid - 1, optLeft, bestSplit);
    yield* compute(groupIndex, mid + 1, right, bestSplit, optRight);
  }
}

function createStep(args: {
  readonly scenario: DivideConquerDpScenario;
  readonly dp: readonly (readonly number[])[];
  readonly opt: readonly (readonly (number | null)[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly partitions: readonly (readonly [number, number])[];
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

  const rowHeaders: DpHeaderConfig[] = Array.from({ length: args.dp.length }, (_, row) => ({
    id: `row-${row}`,
    label: row === 0 ? '0' : `g${row}`,
    status: (args.activeCell?.[0] === row ? 'active' : row === 0 ? 'source' : 'accent') as DpHeaderConfig['status'],
    metaLabel: row === 0 ? 'base' : `${row} groups`,
  }));
  const colHeaders: DpHeaderConfig[] = Array.from({ length: args.dp[0]!.length }, (_, col) => ({
    id: `col-${col}`,
    label: String(col),
    status: (args.activeCell?.[1] === col ? 'active' : col === 0 ? 'source' : 'idle') as DpHeaderConfig['status'],
    metaLabel: col === 0 ? 'empty' : 'prefix',
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.dp.length; row++) {
    for (let col = 0; col < args.dp[row]!.length; col++) {
      const id = dpCellId(row, col);
      const value = args.dp[row]![col]!;
      const reachable = Number.isFinite(value);
      const tags: DpTraceTag[] = [];
      if (row === 0 && col === 0) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (args.backtrackCells.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.opt[row]![col] !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '0' : `g${row}`,
        colLabel: `${col}`,
        valueLabel: reachable ? String(value) : '∞',
        metaLabel: args.opt[row]![col] === null ? null : `s${args.opt[row]![col]}`,
        status: args.backtrackCells.has(id)
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0 && col === 0
                ? 'base'
                : reachable
                  ? 'chosen'
                  : 'idle',
        tags,
      });
    }
  }

  const bestCost = args.dp[args.scenario.groups]![args.scenario.values.length]!;
  const insights: DpInsight[] = [
    { label: I18N.insights.valuesLabel, value: String(args.scenario.values.length), tone: 'accent' },
    { label: I18N.insights.groupsLabel, value: String(args.scenario.groups), tone: 'info' },
    {
      label: I18N.insights.bestCostLabel,
      value: Number.isFinite(bestCost) ? String(bestCost) : I18N.labels.resultPending,
      tone: 'success',
    },
    { label: I18N.insights.partitionsLabel, value: String(args.partitions.length), tone: 'warning' },
    { label: I18N.insights.inputLabel, value: args.scenario.values.join(' · '), tone: 'info' },
  ];

  return createDpStep({
    mode: 'divide-conquer-dp-optimization',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: Number.isFinite(bestCost) ? i18nText(I18N.labels.resultCost, { value: bestCost }) : I18N.labels.resultPending,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.dp.length} × ${args.dp[0]!.length}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeState, {
            group: args.activeCell[0],
            end: args.activeCell[1],
          })
        : null,
    pathLabel: partitionsLabelText(args.partitions),
    primaryItemsLabel: I18N.labels.inputValuesLabel,
    primaryItems: args.scenario.values.map((value, index) => `${index + 1}:${value}`),
    secondaryItemsLabel: I18N.labels.groupRowsLabel,
    secondaryItems: Array.from({ length: args.scenario.groups }, (_, index) => `g${index + 1}`),
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

function segmentCostFn(prefix: readonly number[], left: number, right: number): number {
  const sum = prefix[right]! - prefix[left - 1]!;
  return sum * sum;
}

function partitionsLabel(partitions: readonly (readonly [number, number])[]): string {
  return partitions.map(([left, right]) => `[${left}..${right}]`).join(' | ');
}

function partitionsLabelText(
  partitions: readonly (readonly [number, number])[],
): TranslatableText {
  return partitions.length > 0
    ? i18nText(I18N.labels.pathValue, { cuts: partitionsLabel(partitions) })
    : I18N.labels.pathPending;
}
