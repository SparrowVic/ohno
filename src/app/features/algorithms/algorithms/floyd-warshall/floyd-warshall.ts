import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { MatrixCellStatus, MatrixComputation, MatrixTraceTag } from '../../models/matrix';
import { SortStep } from '../../models/sort-step';
import { FloydWarshallScenario } from '../../utils/scenarios/matrix/matrix-scenarios';
import { cellId, createMatrixStep } from '../matrix-step';
import { I18N_KEY, RUNTIME_KEY } from '../../../../core/i18n/i18n-keys';

const TEXT = RUNTIME_KEY.matrix.floydWarshall;
const MATRIX = I18N_KEY.features.algorithms.display.matrix;

const I18N = {
  phases: {
    initialize: t('features.algorithms.runtime.matrix.floydWarshall.phases.initialize'),
    pivot: t('features.algorithms.runtime.matrix.floydWarshall.phases.pivot'),
    pivotDone: t('features.algorithms.runtime.matrix.floydWarshall.phases.pivotDone'),
    complete: t('features.algorithms.runtime.matrix.floydWarshall.phases.complete'),
  },
  statuses: {
    initialize: t('features.algorithms.runtime.matrix.floydWarshall.statuses.initialize'),
    pivot: t('features.algorithms.runtime.matrix.floydWarshall.statuses.pivot'),
    compare: t('features.algorithms.runtime.matrix.floydWarshall.statuses.compare'),
    update: t('features.algorithms.runtime.matrix.floydWarshall.statuses.update'),
    pivotDone: t('features.algorithms.runtime.matrix.floydWarshall.statuses.pivotDone'),
    complete: t('features.algorithms.runtime.matrix.floydWarshall.statuses.complete'),
  },
  results: {
    updates: t('features.algorithms.runtime.matrix.floydWarshall.results.updates'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.matrix.floydWarshall.descriptions.initialize'),
    pivot: t('features.algorithms.runtime.matrix.floydWarshall.descriptions.pivot'),
    compare: t('features.algorithms.runtime.matrix.floydWarshall.descriptions.compare'),
    update: t('features.algorithms.runtime.matrix.floydWarshall.descriptions.update'),
    pivotDone: t('features.algorithms.runtime.matrix.floydWarshall.descriptions.pivotDone'),
    complete: t('features.algorithms.runtime.matrix.floydWarshall.descriptions.complete'),
  },
} as const;

export function* floydWarshallGenerator(scenario: FloydWarshallScenario): Generator<SortStep> {
  const dist = scenario.matrix.map((row) => [...row]);
  let totalUpdates = 0;

  yield createStep({
    scenario,
    dist,
    phaseLabel: i18nText(I18N.phases.initialize),
    statusLabel: i18nText(I18N.statuses.initialize),
    resultLabel: i18nText(I18N.results.updates, { count: 0 }),
    focusItemsLabel: i18nText(I18N_KEY.features.algorithms.display.racks.nodes),
    focusItems: scenario.labels,
    secondaryItemsLabel: i18nText(MATRIX.racks.meaning),
    secondaryItems: [i18nText(MATRIX.sentences.infinityUnreachable)],
    description: i18nText(I18N.descriptions.initialize),
    activeCodeLine: 2,
    phase: 'init',
  });

  for (let k = 0; k < dist.length; k++) {
    const pivotLabel = scenario.labels[k] ?? `K${k + 1}`;
    const pivotUpdates: string[] = [];

    yield createStep({
      scenario,
      dist,
      phaseLabel: i18nText(I18N.phases.pivot, { pivot: pivotLabel }),
      statusLabel: i18nText(I18N.statuses.pivot, { pivot: pivotLabel }),
      resultLabel: i18nText(I18N.results.updates, { count: totalUpdates }),
      focusItemsLabel: i18nText(MATRIX.racks.pivotNode),
      focusItems: [pivotLabel],
      secondaryItemsLabel: i18nText(MATRIX.racks.changedPairs),
      secondaryItems: pivotUpdates,
      description: i18nText(I18N.descriptions.pivot, { pivot: pivotLabel }),
      activeCodeLine: 3,
      pivotIndex: k,
      computation: {
        label: i18nText(MATRIX.notes.titles.pivot),
        expression: `${pivotLabel}`,
        result: null,
        decision: i18nText(MATRIX.notes.verdicts.throughPivot, { pivot: pivotLabel }),
      },
    });

    for (let i = 0; i < dist.length; i++) {
      for (let j = 0; j < dist.length; j++) {
        const direct = dist[i]?.[j] ?? null;
        const left = dist[i]?.[k] ?? null;
        const right = dist[k]?.[j] ?? null;
        const throughPivot = left === null || right === null ? null : left + right;
        const improved = throughPivot !== null && (direct === null || throughPivot < direct);

        yield createStep({
          scenario,
          dist,
          phaseLabel: i18nText(I18N.phases.pivot, { pivot: pivotLabel }),
          statusLabel: i18nText(I18N.statuses.compare, { from: scenario.labels[i], to: scenario.labels[j] }),
          resultLabel: i18nText(I18N.results.updates, { count: totalUpdates }),
          focusItemsLabel: i18nText(MATRIX.racks.pivotNode),
          focusItems: [pivotLabel],
          secondaryItemsLabel: i18nText(MATRIX.racks.changedPairs),
          secondaryItems: pivotUpdates.slice(-5),
          description: i18nText(I18N.descriptions.compare, { from: scenario.labels[i], pivot: pivotLabel, to: scenario.labels[j] }),
          activeCodeLine: 4,
          activeRow: i,
          activeCol: j,
          pivotIndex: k,
          cellStatuses: new Map([[cellId(i, j), 'active' satisfies MatrixCellStatus]]),
          cellTags: new Map([
            [
              cellId(i, j),
              ['active', ...(direct === null ? (['infinite'] as const) : [])] satisfies readonly MatrixTraceTag[],
            ],
          ]),
          computation: {
            label: i18nText(MATRIX.notes.titles.relaxation),
            expression: `${formatValue(direct)} vs ${formatValue(left)} + ${formatValue(right)}`,
            result: throughPivot === null ? '∞' : String(throughPivot),
            decision: improved ? i18nText(MATRIX.notes.verdicts.shorter, { pivot: pivotLabel }) : i18nText(MATRIX.notes.verdicts.keep),
          },
          metaLabels: new Map([[cellId(i, j), i18nText(TEXT.via, { pivot: pivotLabel })]]),
        });

        if (!improved) {
          continue;
        }

        dist[i]![j] = throughPivot;
        totalUpdates += 1;
        const pairLabel = `${scenario.labels[i]}→${scenario.labels[j]}=${throughPivot}`;
        pivotUpdates.push(pairLabel);

        yield createStep({
          scenario,
          dist,
          phaseLabel: i18nText(I18N.phases.pivot, { pivot: pivotLabel }),
          statusLabel: i18nText(I18N.statuses.update, { from: scenario.labels[i], to: scenario.labels[j] }),
          resultLabel: i18nText(I18N.results.updates, { count: totalUpdates }),
          focusItemsLabel: i18nText(MATRIX.racks.pivotNode),
          focusItems: [pivotLabel],
          secondaryItemsLabel: i18nText(MATRIX.racks.changedPairs),
          secondaryItems: pivotUpdates.slice(-5),
          description: i18nText(I18N.descriptions.update, { pivot: pivotLabel }),
          activeCodeLine: 5,
          activeRow: i,
          activeCol: j,
          pivotIndex: k,
          phase: 'relax',
          cellStatuses: new Map([[cellId(i, j), 'improved' satisfies MatrixCellStatus]]),
          cellTags: new Map([[cellId(i, j), ['improved'] satisfies readonly MatrixTraceTag[]]]),
          computation: {
            label: i18nText(MATRIX.notes.titles.update),
            expression: `${formatValue(direct)} → ${throughPivot}`,
            result: pairLabel,
            decision: i18nText(MATRIX.notes.verdicts.updated, { pivot: pivotLabel }),
          },
          metaLabels: new Map([[cellId(i, j), i18nText(MATRIX.oldValue, { value: formatValue(direct) })]]),
        });
      }
    }

    yield createStep({
      scenario,
      dist,
      phaseLabel: i18nText(I18N.phases.pivotDone, { pivot: pivotLabel }),
      statusLabel: i18nText(I18N.statuses.pivotDone, { count: pivotUpdates.length }),
      resultLabel: i18nText(I18N.results.updates, { count: totalUpdates }),
      focusItemsLabel: i18nText(MATRIX.racks.pivotNode),
      focusItems: [pivotLabel],
      secondaryItemsLabel: i18nText(MATRIX.racks.changedPairs),
      secondaryItems: pivotUpdates.length > 0 ? pivotUpdates : [i18nText(MATRIX.sentences.noChange)],
      description: i18nText(I18N.descriptions.pivotDone, { pivot: pivotLabel }),
      activeCodeLine: 6,
      pivotIndex: k,
      phase: 'pass-complete',
    });
  }

  yield createStep({
    scenario,
    dist,
    phaseLabel: i18nText(I18N.phases.complete),
    statusLabel: i18nText(I18N.statuses.complete),
    resultLabel: i18nText(I18N.results.updates, { count: totalUpdates }),
    focusItemsLabel: i18nText(MATRIX.racks.shortestPairs),
    focusItems: summarizeShortestPairs(scenario.labels, dist),
    secondaryItemsLabel: i18nText(MATRIX.racks.matrixStatus),
    secondaryItems: [i18nText(MATRIX.sentences.allRowsShortest)],
    description: i18nText(I18N.descriptions.complete),
    activeCodeLine: 6,
    phase: 'graph-complete',
  });
}

function createStep(args: {
  readonly scenario: FloydWarshallScenario;
  readonly dist: readonly (readonly (number | null)[])[];
  readonly phaseLabel: TranslatableText;
  readonly statusLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly focusItemsLabel: TranslatableText;
  readonly focusItems: readonly TranslatableText[];
  readonly secondaryItemsLabel: TranslatableText;
  readonly secondaryItems: readonly TranslatableText[];
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly activeRow?: number | null;
  readonly activeCol?: number | null;
  readonly pivotIndex?: number | null;
  readonly cellStatuses?: ReadonlyMap<string, MatrixCellStatus>;
  readonly cellTags?: ReadonlyMap<string, readonly MatrixTraceTag[]>;
  readonly computation?: MatrixComputation | null;
  readonly metaLabels?: ReadonlyMap<string, TranslatableText>;
}): SortStep {
  return createMatrixStep({
    mode: 'floyd-warshall',
    rowLabels: args.scenario.labels,
    colLabels: args.scenario.labels,
    values: args.dist,
    phaseLabel: args.phaseLabel,
    statusLabel: args.statusLabel,
    resultLabel: args.resultLabel,
    focusItemsLabel: args.focusItemsLabel,
    focusItems: args.focusItems,
    secondaryItemsLabel: args.secondaryItemsLabel,
    secondaryItems: args.secondaryItems,
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.phase,
    activeRow: args.activeRow,
    activeCol: args.activeCol,
    pivotIndex: args.pivotIndex,
    cellStatuses: args.cellStatuses,
    cellTags: args.cellTags,
    computation: args.computation ?? null,
    metaLabels: args.metaLabels,
  });
}

function summarizeShortestPairs(
  labels: readonly string[],
  dist: readonly (readonly (number | null)[])[],
): readonly string[] {
  const pairs: string[] = [];
  for (let i = 0; i < dist.length; i++) {
    for (let j = 0; j < dist.length; j++) {
      if (i === j) continue;
      const value = dist[i]?.[j];
      if (value !== null) {
        pairs.push(`${labels[i]}→${labels[j]} ${value}`);
      }
    }
  }
  return pairs.slice(0, 6);
}

function formatValue(value: number | null): string {
  return value === null ? '∞' : String(value);
}
