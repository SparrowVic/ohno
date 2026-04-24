import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { MatrixChainScenario } from '../../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.matrixChain.modeLabel'),
  phases: {
    initializeDiagonal: t('features.algorithms.runtime.dp.matrixChain.phases.initializeDiagonal'),
    inspectCandidate: t('features.algorithms.runtime.dp.matrixChain.phases.inspectCandidate'),
    commitInterval: t('features.algorithms.runtime.dp.matrixChain.phases.commitInterval'),
    traceLeaf: t('features.algorithms.runtime.dp.matrixChain.phases.traceLeaf'),
    traceSplit: t('features.algorithms.runtime.dp.matrixChain.phases.traceSplit'),
    complete: t('features.algorithms.runtime.dp.matrixChain.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.matrixChain.descriptions.initialize'),
    inspectCandidate: t(
      'features.algorithms.runtime.dp.matrixChain.descriptions.inspectCandidate',
    ),
    commitInterval: t('features.algorithms.runtime.dp.matrixChain.descriptions.commitInterval'),
    complete: t('features.algorithms.runtime.dp.matrixChain.descriptions.complete'),
    traceLeaf: t('features.algorithms.runtime.dp.matrixChain.descriptions.traceLeaf'),
    traceSplit: t('features.algorithms.runtime.dp.matrixChain.descriptions.traceSplit'),
  },
  insights: {
    matricesLabel: t('features.algorithms.runtime.dp.matrixChain.insights.matricesLabel'),
    dimensionsLabel: t('features.algorithms.runtime.dp.matrixChain.insights.dimensionsLabel'),
    bestCostLabel: t('features.algorithms.runtime.dp.matrixChain.insights.bestCostLabel'),
    solvedCellsLabel: t('features.algorithms.runtime.dp.matrixChain.insights.solvedCellsLabel'),
    shapeLabel: t('features.algorithms.runtime.dp.matrixChain.insights.shapeLabel'),
  },
  labels: {
    leftValue: t('features.algorithms.runtime.dp.matrixChain.labels.leftValue'),
    rightValue: t('features.algorithms.runtime.dp.matrixChain.labels.rightValue'),
    mergeValue: t('features.algorithms.runtime.dp.matrixChain.labels.mergeValue'),
    splitLabel: t('features.algorithms.runtime.dp.matrixChain.labels.splitLabel'),
    cellLabel: t('features.algorithms.runtime.dp.matrixChain.labels.cellLabel'),
    resultCost: t('features.algorithms.runtime.dp.matrixChain.labels.resultCost'),
    resultPending: t('features.algorithms.runtime.dp.matrixChain.labels.resultPending'),
    activeInterval: t('features.algorithms.runtime.dp.matrixChain.labels.activeInterval'),
    matrixDimensionsLabel: t(
      'features.algorithms.runtime.dp.matrixChain.labels.matrixDimensionsLabel',
    ),
    currentSplitLensLabel: t(
      'features.algorithms.runtime.dp.matrixChain.labels.currentSplitLensLabel',
    ),
    optimalValue: t('features.algorithms.runtime.dp.matrixChain.labels.optimalValue'),
    leafMatrix: t('features.algorithms.runtime.dp.matrixChain.labels.leafMatrix'),
    traceInterval: t('features.algorithms.runtime.dp.matrixChain.labels.traceInterval'),
    upperTriangle: t('features.algorithms.runtime.dp.matrixChain.labels.upperTriangle'),
  },
  decisions: {
    newBestSplit: t('features.algorithms.runtime.dp.matrixChain.decisions.newBestSplit'),
    keepOlderSplit: t('features.algorithms.runtime.dp.matrixChain.decisions.keepOlderSplit'),
    leafInterval: t('features.algorithms.runtime.dp.matrixChain.decisions.leafInterval'),
    expandChildren: t('features.algorithms.runtime.dp.matrixChain.decisions.expandChildren'),
    splitSaved: t('features.algorithms.runtime.dp.matrixChain.decisions.splitSaved'),
  },
} as const;

export function* matrixChainMultiplicationGenerator(scenario: MatrixChainScenario): Generator<SortStep> {
  const matrixCount = scenario.dimensions.length - 1;
  const cost = Array.from({ length: matrixCount }, (_, row) =>
    Array.from({ length: matrixCount }, (_, col) => (row === col ? 0 : null as number | null)),
  );
  const split = Array.from({ length: matrixCount }, () => Array.from({ length: matrixCount }, () => null as number | null));
  const solutionCells = new Set<string>();

  yield createStep({
    scenario,
    cost,
    split,
    solutionCells,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeDiagonal,
    phase: 'init',
  });

  for (let chainLength = 2; chainLength <= matrixCount; chainLength++) {
    for (let i = 0; i <= matrixCount - chainLength; i++) {
      const j = i + chainLength - 1;
      let best = Number.POSITIVE_INFINITY;
      let bestSplit: number | null = null;

      for (let k = i; k < j; k++) {
        const left = cost[i]![k] ?? 0;
        const right = cost[k + 1]![j] ?? 0;
        const merge = scenario.dimensions[i]! * scenario.dimensions[k + 1]! * scenario.dimensions[j + 1]!;
        const candidate = left + right + merge;

        yield createStep({
          scenario,
          cost,
          split,
          solutionCells,
          activeCell: [i, j],
          candidateCells: [[i, k], [k + 1, j]],
          activeCellStatus: 'active',
          secondaryItems: [
            i18nText(I18N.labels.leftValue, { value: left }),
            i18nText(I18N.labels.rightValue, { value: right }),
            i18nText(I18N.labels.mergeValue, { value: merge }),
          ],
          description: i18nText(I18N.descriptions.inspectCandidate, {
            split: k + 1,
            left: i + 1,
            right: j + 1,
          }),
          activeCodeLine: 7,
          phaseLabel: I18N.phases.inspectCandidate,
          phase: 'compare',
          computation: {
            label: i18nText(I18N.labels.splitLabel, { split: k + 1 }),
            expression: `${left} + ${right} + ${scenario.dimensions[i]}·${scenario.dimensions[k + 1]}·${scenario.dimensions[j + 1]}`,
            result: String(candidate),
            decision: candidate < best ? I18N.decisions.newBestSplit : I18N.decisions.keepOlderSplit,
          },
        });

        if (candidate < best) {
          best = candidate;
          bestSplit = k;
        }
      }

      cost[i]![j] = best;
      split[i]![j] = bestSplit;

      yield createStep({
        scenario,
        cost,
        split,
        solutionCells,
        activeCell: [i, j],
        activeCellStatus: 'improved',
        description: i18nText(I18N.descriptions.commitInterval, {
          left: i + 1,
          right: j + 1,
          value: best,
          split: (bestSplit ?? i) + 1,
        }),
        activeCodeLine: 10,
        phaseLabel: I18N.phases.commitInterval,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.cellLabel, { row: i + 1, col: j + 1 }),
          expression: `best split = ${(bestSplit ?? i) + 1}`,
          result: String(best),
          decision: i18nText(I18N.decisions.splitSaved, { left: i + 1, right: j + 1 }),
        },
      });
    }
  }

  yield* traceSolution(0, matrixCount - 1);

  yield createStep({
    scenario,
    cost,
    split,
    solutionCells,
    description: i18nText(I18N.descriptions.complete, {
      plan: parenthesizationFor(split, 0, matrixCount - 1),
      cost: cost[0]![matrixCount - 1] ?? 0,
    }),
    activeCodeLine: 12,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });

  function* traceSolution(i: number, j: number): Generator<SortStep> {
    solutionCells.add(dpCellId(i, j));
    if (i === j) {
      yield createStep({
        scenario,
        cost,
        split,
        solutionCells,
        activeCell: [i, j],
        activeCellStatus: 'backtrack',
        description: i18nText(I18N.descriptions.traceLeaf, { index: i + 1 }),
        activeCodeLine: 11,
        phaseLabel: I18N.phases.traceLeaf,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.leafMatrix, { index: i + 1 }),
          expression: 'single matrix',
          result: '0',
          decision: I18N.decisions.leafInterval,
        },
      });
      return;
    }

    const k = split[i]![j] ?? i;
    yield createStep({
      scenario,
      cost,
      split,
      solutionCells,
      activeCell: [i, j],
      candidateCells: [[i, k], [k + 1, j]],
      activeCellStatus: 'backtrack',
      description: i18nText(I18N.descriptions.traceSplit, {
        left: i + 1,
        right: j + 1,
        split: k + 1,
      }),
      activeCodeLine: 11,
      phaseLabel: I18N.phases.traceSplit,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.traceInterval, { left: i + 1, right: j + 1 }),
        expression: `split = ${k + 1}`,
        result: parenthesizationFor(split, i, j),
        decision: I18N.decisions.expandChildren,
      },
    });

    yield* traceSolution(i, k);
    yield* traceSolution(k + 1, j);
  }
}

function createStep(args: {
  readonly scenario: MatrixChainScenario;
  readonly cost: readonly (readonly (number | null)[])[];
  readonly split: readonly (readonly (number | null)[])[];
  readonly solutionCells: ReadonlySet<string>;
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
  const matrixCount = args.scenario.dimensions.length - 1;
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));

  const headers: DpHeaderConfig[] = Array.from({ length: matrixCount }, (_, index) => ({
    id: `h-${index}`,
    label: `A${index + 1}`,
    status: args.activeCell && (args.activeCell[0] === index || args.activeCell[1] === index) ? 'active' : 'accent',
    metaLabel: `${args.scenario.dimensions[index]}×${args.scenario.dimensions[index + 1]}`,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < matrixCount; row++) {
    for (let col = 0; col < matrixCount; col++) {
      const id = dpCellId(row, col);
      const isBlocked = col < row;
      const isBase = row === col;
      const tags: DpTraceTag[] = [];
      if (isBase) tags.push('base');
      if (isBlocked) tags.push('blocked');
      if (candidateIds.has(id)) tags.push('best');
      if (args.solutionCells.has(id)) tags.push('path');
      if (args.activeCell && args.activeCell[0] === row && args.activeCell[1] === col) tags.push('active');
      if ((args.split[row]![col] ?? null) !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: `A${row + 1}`,
        colLabel: `A${col + 1}`,
        valueLabel: isBlocked ? '—' : isBase ? '0' : args.cost[row]![col] === null ? '∞' : String(args.cost[row]![col]!),
        metaLabel:
          isBlocked
            ? null
            : args.split[row]![col] === null
              ? row === col
                ? 'diag'
                : null
              : `k${(args.split[row]![col] ?? row) + 1}`,
        status: isBlocked
          ? 'blocked'
          : args.solutionCells.has(id)
            ? 'backtrack'
            : id === activeCellId
              ? (args.activeCellStatus ?? 'active')
              : candidateIds.has(id)
                ? 'candidate'
                : isBase
                  ? 'base'
                  : 'idle',
        tags,
      });
    }
  }

  const bestCost = args.cost[0]![matrixCount - 1];
  const insights: DpInsight[] = [
    { label: I18N.insights.matricesLabel, value: String(matrixCount), tone: 'accent' },
    { label: I18N.insights.dimensionsLabel, value: args.scenario.dimensions.join(' · '), tone: 'info' },
    {
      label: I18N.insights.bestCostLabel,
      value: bestCost === null ? I18N.labels.resultPending : String(bestCost),
      tone: 'success',
    },
    {
      label: I18N.insights.solvedCellsLabel,
      value: String(cells.filter((cell) => cell.valueLabel !== '∞' && cell.valueLabel !== '—').length),
      tone: 'warning',
    },
    { label: I18N.insights.shapeLabel, value: I18N.labels.upperTriangle, tone: 'info' },
  ];

  return createDpStep({
    mode: 'matrix-chain',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: bestCost === null ? I18N.labels.resultPending : i18nText(I18N.labels.resultCost, { value: bestCost }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${matrixCount} × ${matrixCount}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeInterval, {
            left: args.activeCell[0] + 1,
            right: args.activeCell[1] + 1,
          })
        : null,
    pathLabel: parenthesizationFor(args.split, 0, matrixCount - 1),
    primaryItemsLabel: I18N.labels.matrixDimensionsLabel,
    primaryItems: Array.from({ length: matrixCount }, (_, index) => `A${index + 1} ${args.scenario.dimensions[index]}×${args.scenario.dimensions[index + 1]}`),
    secondaryItemsLabel: I18N.labels.currentSplitLensLabel,
    secondaryItems:
      args.secondaryItems ??
      [i18nText(I18N.labels.optimalValue, { value: parenthesizationFor(args.split, 0, matrixCount - 1) })],
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

function parenthesizationFor(split: readonly (readonly (number | null)[])[], i: number, j: number): string {
  if (i > j || split.length === 0) return 'pending';
  if (i === j) return `A${i + 1}`;
  const k = split[i]![j];
  if (k === null) return `A${i + 1}..A${j + 1}`;
  return `(${parenthesizationFor(split, i, k)} · ${parenthesizationFor(split, k + 1, j)})`;
}
