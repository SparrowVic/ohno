import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { BurstBalloonsScenario } from '../../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.burstBalloons.modeLabel'),
  phases: {
    initializeCanvas: t('features.algorithms.runtime.dp.burstBalloons.phases.initializeCanvas'),
    inspectCandidate: t('features.algorithms.runtime.dp.burstBalloons.phases.inspectCandidate'),
    commitScore: t('features.algorithms.runtime.dp.burstBalloons.phases.commitScore'),
    traceSplit: t('features.algorithms.runtime.dp.burstBalloons.phases.traceSplit'),
    appendBurst: t('features.algorithms.runtime.dp.burstBalloons.phases.appendBurst'),
    complete: t('features.algorithms.runtime.dp.burstBalloons.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.burstBalloons.descriptions.initialize'),
    inspectCandidate: t('features.algorithms.runtime.dp.burstBalloons.descriptions.inspectCandidate'),
    commitScore: t('features.algorithms.runtime.dp.burstBalloons.descriptions.commitScore'),
    traceSplit: t('features.algorithms.runtime.dp.burstBalloons.descriptions.traceSplit'),
    appendBurst: t('features.algorithms.runtime.dp.burstBalloons.descriptions.appendBurst'),
    complete: t('features.algorithms.runtime.dp.burstBalloons.descriptions.complete'),
  },
  insights: {
    balloonsLabel: t('features.algorithms.runtime.dp.burstBalloons.insights.balloonsLabel'),
    valuesLabel: t('features.algorithms.runtime.dp.burstBalloons.insights.valuesLabel'),
    bestCoinsLabel: t('features.algorithms.runtime.dp.burstBalloons.insights.bestCoinsLabel'),
    burstOrderLabel: t('features.algorithms.runtime.dp.burstBalloons.insights.burstOrderLabel'),
    shapeLabel: t('features.algorithms.runtime.dp.burstBalloons.insights.shapeLabel'),
  },
  labels: {
    leftValue: t('features.algorithms.runtime.dp.burstBalloons.labels.leftValue'),
    burstValue: t('features.algorithms.runtime.dp.burstBalloons.labels.burstValue'),
    rightValue: t('features.algorithms.runtime.dp.burstBalloons.labels.rightValue'),
    intervalComputation: t('features.algorithms.runtime.dp.burstBalloons.labels.intervalComputation'),
    dpCell: t('features.algorithms.runtime.dp.burstBalloons.labels.dpCell'),
    traceInterval: t('features.algorithms.runtime.dp.burstBalloons.labels.traceInterval'),
    burstLabel: t('features.algorithms.runtime.dp.burstBalloons.labels.burstLabel'),
    resultCoins: t('features.algorithms.runtime.dp.burstBalloons.labels.resultCoins'),
    resultPending: t('features.algorithms.runtime.dp.burstBalloons.labels.resultPending'),
    activeInterval: t('features.algorithms.runtime.dp.burstBalloons.labels.activeInterval'),
    pathValue: t('features.algorithms.runtime.dp.burstBalloons.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.burstBalloons.labels.pathPending'),
    balloonValuesLabel: t(
      'features.algorithms.runtime.dp.burstBalloons.labels.balloonValuesLabel',
    ),
    intervalLensLabel: t('features.algorithms.runtime.dp.burstBalloons.labels.intervalLensLabel'),
    sentinelsValue: t('features.algorithms.runtime.dp.burstBalloons.labels.sentinelsValue'),
    orderSizeValue: t('features.algorithms.runtime.dp.burstBalloons.labels.orderSizeValue'),
    intervalRange: t('features.algorithms.runtime.dp.burstBalloons.labels.intervalRange'),
    lastPivot: t('features.algorithms.runtime.dp.burstBalloons.labels.lastPivot'),
    upperTriangle: t('features.algorithms.runtime.dp.burstBalloons.labels.upperTriangle'),
    pending: t('features.algorithms.runtime.dp.burstBalloons.labels.pending'),
  },
  decisions: {
    newBestLastBalloon: t(
      'features.algorithms.runtime.dp.burstBalloons.decisions.newBestLastBalloon',
    ),
    keepPreviousSplit: t(
      'features.algorithms.runtime.dp.burstBalloons.decisions.keepPreviousSplit',
    ),
    splitSaved: t('features.algorithms.runtime.dp.burstBalloons.decisions.splitSaved'),
    expandSubintervals: t(
      'features.algorithms.runtime.dp.burstBalloons.decisions.expandSubintervals',
    ),
    appendFinisher: t('features.algorithms.runtime.dp.burstBalloons.decisions.appendFinisher'),
  },
} as const;

export function* burstBalloonsGenerator(scenario: BurstBalloonsScenario): Generator<SortStep> {
  const balloons = scenario.balloons;
  const count = balloons.length;
  const padded = [1, ...balloons, 1];
  const score = Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, col) => (col < row ? null : null as number | null)),
  );
  const lastBurst = Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, col) => (col < row ? null : null as number | null)),
  );
  const solutionCells = new Set<string>();
  const order: number[] = [];

  yield createStep({
    scenario,
    score,
    lastBurst,
    solutionCells,
    order,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeCanvas,
    phase: 'init',
  });

  for (let span = 1; span <= count; span++) {
    for (let left = 1; left <= count - span + 1; left++) {
      const right = left + span - 1;
      let best = 0;
      let bestIndex = left;

      for (let pivot = left; pivot <= right; pivot++) {
        const row = left - 1;
        const col = right - 1;
        const leftScore = pivot > left ? (score[left - 1]![pivot - 2] ?? 0) : 0;
        const rightScore = pivot < right ? (score[pivot]![right - 1] ?? 0) : 0;
        const burstGain = padded[left - 1]! * padded[pivot]! * padded[right + 1]!;
        const candidate = leftScore + burstGain + rightScore;

        yield createStep({
          scenario,
          score,
          lastBurst,
          solutionCells,
          order,
          activeCell: [row, col],
          candidateCells: [
            ...(pivot > left ? ([[left - 1, pivot - 2]] as const) : []),
            ...(pivot < right ? ([[pivot, right - 1]] as const) : []),
          ],
          secondaryItems: [
            i18nText(I18N.labels.leftValue, { value: leftScore }),
            i18nText(I18N.labels.burstValue, { value: burstGain }),
            i18nText(I18N.labels.rightValue, { value: rightScore }),
          ],
          description: i18nText(I18N.descriptions.inspectCandidate, {
            pivot,
            left,
            right,
          }),
          activeCodeLine: 6,
          phaseLabel: I18N.phases.inspectCandidate,
          phase: 'compare',
          computation: {
            label: i18nText(I18N.labels.intervalComputation, { left, right }),
            expression: `${leftScore} + ${padded[left - 1]}·${padded[pivot]}·${padded[right + 1]} + ${rightScore}`,
            result: String(candidate),
            decision: candidate > best ? I18N.decisions.newBestLastBalloon : I18N.decisions.keepPreviousSplit,
          },
        });

        if (candidate > best) {
          best = candidate;
          bestIndex = pivot;
        }
      }

      score[left - 1]![right - 1] = best;
      lastBurst[left - 1]![right - 1] = bestIndex - 1;

      yield createStep({
        scenario,
        score,
        lastBurst,
        solutionCells,
        order,
        activeCell: [left - 1, right - 1],
        activeCellStatus: 'improved',
        description: i18nText(I18N.descriptions.commitScore, {
          left,
          right,
          pivot: bestIndex,
        }),
        activeCodeLine: 9,
        phaseLabel: I18N.phases.commitScore,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.dpCell, { left, right }),
          expression: `last = #${bestIndex}`,
          result: String(best),
          decision: i18nText(I18N.decisions.splitSaved, { left, right }),
        },
      });
    }
  }

  yield* trace(1, count);

  yield createStep({
    scenario,
    score,
    lastBurst,
    solutionCells,
    order,
    description: i18nText(I18N.descriptions.complete, {
      coins: score[0]![count - 1] ?? 0,
    }),
    activeCodeLine: 11,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });

  function* trace(left: number, right: number): Generator<SortStep> {
    if (left > right) return;

    const row = left - 1;
    const col = right - 1;
    const pivotIndex = (lastBurst[row]![col] ?? row) + 1;
    solutionCells.add(dpCellId(row, col));

    yield createStep({
      scenario,
      score,
      lastBurst,
      solutionCells,
      order,
      activeCell: [row, col],
      candidateCells: [
        ...(pivotIndex > left ? ([[left - 1, pivotIndex - 2]] as const) : []),
        ...(pivotIndex < right ? ([[pivotIndex, right - 1]] as const) : []),
      ],
      activeCellStatus: 'backtrack',
      description: i18nText(I18N.descriptions.traceSplit, {
        left,
        right,
        pivot: pivotIndex,
      }),
      activeCodeLine: 10,
      phaseLabel: I18N.phases.traceSplit,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.traceInterval, { left, right }),
        expression: `last burst = #${pivotIndex}`,
        result: orderLabel(order),
        decision: I18N.decisions.expandSubintervals,
      },
    });

    yield* trace(left, pivotIndex - 1);
    yield* trace(pivotIndex + 1, right);

    order.push(pivotIndex);
    yield createStep({
      scenario,
      score,
      lastBurst,
      solutionCells,
      order,
      activeCell: [row, col],
      activeCellStatus: 'backtrack',
      description: i18nText(I18N.descriptions.appendBurst, {
        pivot: pivotIndex,
        left,
        right,
      }),
      activeCodeLine: 10,
      phaseLabel: I18N.phases.appendBurst,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.burstLabel, { pivot: pivotIndex }),
        expression: `value = ${balloons[pivotIndex - 1]!}`,
        result: orderLabel(order),
        decision: I18N.decisions.appendFinisher,
      },
    });
  }
}

function createStep(args: {
  readonly scenario: BurstBalloonsScenario;
  readonly score: readonly (readonly (number | null)[])[];
  readonly lastBurst: readonly (readonly (number | null)[])[];
  readonly solutionCells: ReadonlySet<string>;
  readonly order: readonly number[];
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'improved' | 'backtrack';
  readonly secondaryItems?: readonly TranslatableText[];
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));
  const headers: DpHeaderConfig[] = args.scenario.balloons.map((value, index) => ({
    id: `h-${index}`,
    label: `#${index + 1}`,
    status: (args.activeCell && (args.activeCell[0] === index || args.activeCell[1] === index) ? 'active' : 'accent') as DpHeaderConfig['status'],
    metaLabel: `v${value}`,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.score.length; row++) {
    for (let col = 0; col < args.score[row]!.length; col++) {
      const id = dpCellId(row, col);
      const blocked = col < row;
      const savedSplit = args.lastBurst[row]![col];
      const tags: DpTraceTag[] = [];
      if (blocked) tags.push('blocked');
      if (savedSplit !== null) tags.push('split');
      if (candidateIds.has(id)) tags.push('best');
      if (args.solutionCells.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');

      cells.push({
        row,
        col,
        rowLabel: `#${row + 1}`,
        colLabel: `#${col + 1}`,
        valueLabel: blocked ? '—' : args.score[row]![col] === null ? '·' : String(args.score[row]![col]!),
        metaLabel: blocked ? null : savedSplit === null ? null : `last #${savedSplit + 1}`,
        status: blocked
          ? 'blocked'
          : args.solutionCells.has(id)
            ? 'backtrack'
            : id === activeCellId
              ? (args.activeCellStatus ?? 'active')
              : candidateIds.has(id)
                ? 'candidate'
                : savedSplit === null
                  ? 'idle'
                  : 'chosen',
        tags,
      });
    }
  }

  const best = args.score[0]?.[args.scenario.balloons.length - 1] ?? null;
  const insights: DpInsight[] = [
    { label: I18N.insights.balloonsLabel, value: String(args.scenario.balloons.length), tone: 'accent' },
    { label: I18N.insights.valuesLabel, value: args.scenario.balloons.join(', '), tone: 'info' },
    {
      label: I18N.insights.bestCoinsLabel,
      value: best === null ? I18N.labels.pending : String(best),
      tone: 'success',
    },
    { label: I18N.insights.burstOrderLabel, value: String(args.order.length), tone: 'warning' },
    { label: I18N.insights.shapeLabel, value: I18N.labels.upperTriangle, tone: 'info' },
  ];

  return createDpStep({
    mode: 'burst-balloons',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: best === null ? I18N.labels.resultPending : i18nText(I18N.labels.resultCoins, { value: best }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.scenario.balloons.length} × ${args.scenario.balloons.length}`,
    activeLabel: args.activeCell
      ? i18nText(I18N.labels.activeInterval, {
          left: args.activeCell[0] + 1,
          right: args.activeCell[1] + 1,
        })
      : null,
    pathLabel: orderLabel(args.order),
    primaryItemsLabel: I18N.labels.balloonValuesLabel,
    primaryItems: args.scenario.balloons.map((value, index) => `#${index + 1}=${value}`),
    secondaryItemsLabel: I18N.labels.intervalLensLabel,
    secondaryItems: args.secondaryItems ?? [
      i18nText(I18N.labels.sentinelsValue, { values: args.scenario.balloons.join(' ') }),
      i18nText(I18N.labels.orderSizeValue, { size: args.order.length }),
    ],
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

function orderLabel(order: readonly number[]): TranslatableText {
  return order.length > 0
    ? i18nText(I18N.labels.pathValue, {
        order: order.map((index) => `#${index}`).join(' → '),
      })
    : I18N.labels.pathPending;
}
