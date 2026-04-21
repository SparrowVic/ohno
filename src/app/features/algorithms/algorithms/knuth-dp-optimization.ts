import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { KnuthDpScenario } from '../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.modeLabel'),
  phases: {
    initializeDiagonal: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.phases.initializeDiagonal',
    ),
    inspectWindow: t('features.algorithms.runtime.dp.knuthDpOptimization.phases.inspectWindow'),
    commitInterval: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.phases.commitInterval',
    ),
    traceLeaf: t('features.algorithms.runtime.dp.knuthDpOptimization.phases.traceLeaf'),
    traceSplit: t('features.algorithms.runtime.dp.knuthDpOptimization.phases.traceSplit'),
    complete: t('features.algorithms.runtime.dp.knuthDpOptimization.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.knuthDpOptimization.descriptions.initialize'),
    inspectWindow: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.descriptions.inspectWindow',
    ),
    commitInterval: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.descriptions.commitInterval',
    ),
    complete: t('features.algorithms.runtime.dp.knuthDpOptimization.descriptions.complete'),
    traceLeaf: t('features.algorithms.runtime.dp.knuthDpOptimization.descriptions.traceLeaf'),
    traceSplit: t('features.algorithms.runtime.dp.knuthDpOptimization.descriptions.traceSplit'),
  },
  insights: {
    filesLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.insights.filesLabel'),
    totalCostLabel: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.insights.totalCostLabel',
    ),
    traceCellsLabel: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.insights.traceCellsLabel',
    ),
    weightsLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.insights.weightsLabel'),
    shapeLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.insights.shapeLabel'),
  },
  labels: {
    resultCost: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.resultCost'),
    resultPending: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.resultPending'),
    activeInterval: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.activeInterval'),
    pathValue: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.pathPending'),
    fileSizesLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.fileSizesLabel'),
    optWindowsLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.optWindowsLabel'),
    intervalLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.intervalLabel'),
    cellLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.cellLabel'),
    leafLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.leafLabel'),
    traceLabel: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.traceLabel'),
    upperTriangle: t('features.algorithms.runtime.dp.knuthDpOptimization.labels.upperTriangle'),
  },
  decisions: {
    newBestSplit: t('features.algorithms.runtime.dp.knuthDpOptimization.decisions.newBestSplit'),
    keepEarlierSplit: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.decisions.keepEarlierSplit',
    ),
    saveOptSplit: t('features.algorithms.runtime.dp.knuthDpOptimization.decisions.saveOptSplit'),
    noFurtherSplit: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.decisions.noFurtherSplit',
    ),
    openSubintervals: t(
      'features.algorithms.runtime.dp.knuthDpOptimization.decisions.openSubintervals',
    ),
  },
} as const;

export function* knuthDpOptimizationGenerator(
  scenario: KnuthDpScenario,
): Generator<SortStep> {
  const files = scenario.files;
  const n = files.length;
  const prefix = [0];
  for (const file of files) prefix.push(prefix[prefix.length - 1]! + file);

  const dp = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => (row === col ? 0 : col < row ? null : null as number | null)),
  );
  const opt = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => (row === col ? row : col < row ? null : null as number | null)),
  );
  const traced = new Set<string>();

  yield createStep({
    scenario,
    dp,
    opt,
    traced,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeDiagonal,
    phase: 'init',
  });

  for (let span = 2; span <= n; span++) {
    for (let left = 0; left + span - 1 < n; left++) {
      const right = left + span - 1;
      const low = opt[left]![right - 1] ?? left;
      const high = Math.min(right - 1, opt[left + 1]?.[right] ?? (right - 1));
      const mergeWeight = rangeSum(prefix, left, right);
      let bestCost = Number.POSITIVE_INFINITY;
      let bestSplit = low;

      for (let split = low; split <= high; split++) {
        const candidate = (dp[left]![split] ?? 0) + (dp[split + 1]![right] ?? 0) + mergeWeight;

        yield createStep({
          scenario,
          dp,
          opt,
          traced,
          activeCell: [left, right],
          candidateCells: [[left, split], [split + 1, right]],
          description: i18nText(I18N.descriptions.inspectWindow, {
            left: left + 1,
            right: right + 1,
            low: low + 1,
            high: high + 1,
          }),
          activeCodeLine: 5,
          phaseLabel: I18N.phases.inspectWindow,
          phase: 'compare',
          computation: {
            label: i18nText(I18N.labels.intervalLabel, {
              left: left + 1,
              right: right + 1,
            }),
            expression: `${dp[left]![split] ?? 0} + ${dp[split + 1]![right] ?? 0} + ${mergeWeight}`,
            result: String(candidate),
            decision: candidate < bestCost ? I18N.decisions.newBestSplit : I18N.decisions.keepEarlierSplit,
          },
        });

        if (candidate < bestCost) {
          bestCost = candidate;
          bestSplit = split;
        }
      }

      dp[left]![right] = bestCost;
      opt[left]![right] = bestSplit;

      yield createStep({
        scenario,
        dp,
        opt,
        traced,
        activeCell: [left, right],
        activeStatus: 'improved',
        description: i18nText(I18N.descriptions.commitInterval, {
          left: left + 1,
          right: right + 1,
          split: bestSplit + 1,
        }),
        activeCodeLine: 6,
        phaseLabel: I18N.phases.commitInterval,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.cellLabel, { left: left + 1, right: right + 1 }),
          expression: `window ${low + 1}..${high + 1}`,
          result: String(bestCost),
          decision: i18nText(I18N.decisions.saveOptSplit, { split: bestSplit + 1 }),
        },
      });
    }
  }

  yield* trace(0, n - 1);

  yield createStep({
    scenario,
    dp,
    opt,
    traced,
    description: I18N.descriptions.complete,
    activeCodeLine: 8,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });

  function* trace(left: number, right: number): Generator<SortStep> {
    traced.add(dpCellId(left, right));
    if (left === right) {
      yield createStep({
        scenario,
        dp,
        opt,
        traced,
        activeCell: [left, right],
        activeStatus: 'backtrack',
        description: i18nText(I18N.descriptions.traceLeaf, { index: left + 1 }),
        activeCodeLine: 7,
        phaseLabel: I18N.phases.traceLeaf,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.leafLabel, { index: left + 1 }),
          expression: 'leaf',
          result: mergePlanLabel(opt, 0, n - 1),
          decision: I18N.decisions.noFurtherSplit,
        },
      });
      return;
    }

    const split = opt[left]![right] ?? left;
    yield createStep({
      scenario,
      dp,
      opt,
      traced,
      activeCell: [left, right],
      candidateCells: [[left, split], [split + 1, right]],
      activeStatus: 'backtrack',
      description: i18nText(I18N.descriptions.traceSplit, {
        left: left + 1,
        right: right + 1,
        split: split + 1,
      }),
      activeCodeLine: 7,
      phaseLabel: I18N.phases.traceSplit,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.traceLabel, { left: left + 1, right: right + 1 }),
        expression: `split = ${split + 1}`,
        result: mergePlanLabel(opt, 0, n - 1),
        decision: I18N.decisions.openSubintervals,
      },
    });

    yield* trace(left, split);
    yield* trace(split + 1, right);
  }
}

function createStep(args: {
  readonly scenario: KnuthDpScenario;
  readonly dp: readonly (readonly (number | null)[])[];
  readonly opt: readonly (readonly (number | null)[])[];
  readonly traced: ReadonlySet<string>;
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

  const headers: DpHeaderConfig[] = args.scenario.files.map((file, index) => ({
    id: `h-${index}`,
    label: `F${index + 1}`,
    status: (args.activeCell && (args.activeCell[0] === index || args.activeCell[1] === index) ? 'active' : 'accent') as DpHeaderConfig['status'],
    metaLabel: `${file}`,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.dp.length; row++) {
    for (let col = 0; col < args.dp[row]!.length; col++) {
      const id = dpCellId(row, col);
      const blocked = col < row;
      const diagonal = row === col;
      const tags: DpTraceTag[] = [];
      if (blocked) tags.push('blocked');
      if (diagonal) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (args.traced.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.opt[row]![col] !== null && !diagonal) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: `F${row + 1}`,
        colLabel: `F${col + 1}`,
        valueLabel: blocked ? '—' : diagonal ? '0' : args.dp[row]![col] === null ? '·' : String(args.dp[row]![col]!),
        metaLabel: blocked ? null : diagonal ? 'diag' : args.opt[row]![col] === null ? null : `k${(args.opt[row]![col] ?? row) + 1}`,
        status: blocked
          ? 'blocked'
          : args.traced.has(id)
            ? 'backtrack'
            : id === activeCellId
              ? (args.activeStatus ?? 'active')
              : candidateIds.has(id)
                ? 'candidate'
                : diagonal
                  ? 'base'
                  : args.dp[row]![col] === null
                    ? 'idle'
                    : 'chosen',
        tags,
      });
    }
  }

  const best = args.dp[0]![args.scenario.files.length - 1];
  const insights: DpInsight[] = [
    { label: I18N.insights.filesLabel, value: String(args.scenario.files.length), tone: 'accent' },
    {
      label: I18N.insights.totalCostLabel,
      value: best === null ? I18N.labels.resultPending : String(best),
      tone: 'success',
    },
    { label: I18N.insights.traceCellsLabel, value: String(args.traced.size), tone: 'warning' },
    { label: I18N.insights.weightsLabel, value: args.scenario.files.join(' · '), tone: 'info' },
    { label: I18N.insights.shapeLabel, value: I18N.labels.upperTriangle, tone: 'info' },
  ];

  return createDpStep({
    mode: 'knuth-dp-optimization',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: best === null ? I18N.labels.resultPending : i18nText(I18N.labels.resultCost, { value: best }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.scenario.files.length} × ${args.scenario.files.length}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeInterval, {
            left: args.activeCell[0] + 1,
            right: args.activeCell[1] + 1,
          })
        : null,
    pathLabel: mergePlanLabelLabel(args.opt, 0, args.scenario.files.length - 1),
    primaryItemsLabel: I18N.labels.fileSizesLabel,
    primaryItems: args.scenario.files.map((file, index) => `F${index + 1}:${file}`),
    secondaryItemsLabel: I18N.labels.optWindowsLabel,
    secondaryItems: args.scenario.files.map((_, index) => `opt row ${index + 1}`),
    insights,
    rowHeaders: headers,
    colHeaders: headers,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    tableShape: 'upper-triangle',
    computation: args.computation ?? null,
  });
}

function rangeSum(prefix: readonly number[], left: number, right: number): number {
  return prefix[right + 1]! - prefix[left]!;
}

function mergePlanLabel(
  opt: readonly (readonly (number | null)[])[],
  left: number,
  right: number,
): string {
  if (left > right) return 'pending';
  if (left === right) return `F${left + 1}`;
  const split = opt[left]![right];
  if (split === null) return `F${left + 1}..F${right + 1}`;
  return `(${mergePlanLabel(opt, left, split)} + ${mergePlanLabel(opt, split + 1, right)})`;
}

function mergePlanLabelLabel(
  opt: readonly (readonly (number | null)[])[],
  left: number,
  right: number,
): TranslatableText {
  const plan = mergePlanLabel(opt, left, right);
  return plan === 'pending' ? I18N.labels.pathPending : i18nText(I18N.labels.pathValue, { value: plan });
}
