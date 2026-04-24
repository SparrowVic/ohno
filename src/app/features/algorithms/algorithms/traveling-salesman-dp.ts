import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { TravelingSalesmanScenario } from '../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.travelingSalesman.modeLabel'),
  phases: {
    initializeSubset: t('features.algorithms.runtime.dp.travelingSalesman.phases.initializeSubset'),
    inspectExtension: t('features.algorithms.runtime.dp.travelingSalesman.phases.inspectExtension'),
    commitSubset: t('features.algorithms.runtime.dp.travelingSalesman.phases.commitSubset'),
    inspectClosure: t('features.algorithms.runtime.dp.travelingSalesman.phases.inspectClosure'),
    pickClosingCity: t('features.algorithms.runtime.dp.travelingSalesman.phases.pickClosingCity'),
    backtrackRoute: t('features.algorithms.runtime.dp.travelingSalesman.phases.backtrackRoute'),
    complete: t('features.algorithms.runtime.dp.travelingSalesman.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.travelingSalesman.descriptions.initialize'),
    inspectExtension: t(
      'features.algorithms.runtime.dp.travelingSalesman.descriptions.inspectExtension',
    ),
    commitSubset: t('features.algorithms.runtime.dp.travelingSalesman.descriptions.commitSubset'),
    inspectClosure: t('features.algorithms.runtime.dp.travelingSalesman.descriptions.inspectClosure'),
    pickClosingCity: t(
      'features.algorithms.runtime.dp.travelingSalesman.descriptions.pickClosingCity',
    ),
    backtrackRoute: t(
      'features.algorithms.runtime.dp.travelingSalesman.descriptions.backtrackRoute',
    ),
    complete: t('features.algorithms.runtime.dp.travelingSalesman.descriptions.complete'),
  },
  insights: {
    citiesLabel: t('features.algorithms.runtime.dp.travelingSalesman.insights.citiesLabel'),
    subsetRowsLabel: t(
      'features.algorithms.runtime.dp.travelingSalesman.insights.subsetRowsLabel',
    ),
    bestOpenRouteLabel: t(
      'features.algorithms.runtime.dp.travelingSalesman.insights.bestOpenRouteLabel',
    ),
    traceDepthLabel: t(
      'features.algorithms.runtime.dp.travelingSalesman.insights.traceDepthLabel',
    ),
    startLabel: t('features.algorithms.runtime.dp.travelingSalesman.insights.startLabel'),
  },
  labels: {
    extensionLabel: t('features.algorithms.runtime.dp.travelingSalesman.labels.extensionLabel'),
    stateLabel: t('features.algorithms.runtime.dp.travelingSalesman.labels.stateLabel'),
    parentLabel: t('features.algorithms.runtime.dp.travelingSalesman.labels.parentLabel'),
    bestTourEndLabel: t(
      'features.algorithms.runtime.dp.travelingSalesman.labels.bestTourEndLabel',
    ),
    traceValue: t('features.algorithms.runtime.dp.travelingSalesman.labels.traceValue'),
    pathValue: t('features.algorithms.runtime.dp.travelingSalesman.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.travelingSalesman.labels.pathPending'),
    resultTour: t('features.algorithms.runtime.dp.travelingSalesman.labels.resultTour'),
    resultPending: t('features.algorithms.runtime.dp.travelingSalesman.labels.resultPending'),
    activeState: t('features.algorithms.runtime.dp.travelingSalesman.labels.activeState'),
    citiesItemsLabel: t('features.algorithms.runtime.dp.travelingSalesman.labels.citiesItemsLabel'),
    distanceLensLabel: t(
      'features.algorithms.runtime.dp.travelingSalesman.labels.distanceLensLabel',
    ),
    distanceEdge: t('features.algorithms.runtime.dp.travelingSalesman.labels.distanceEdge'),
    cityRowValue: t('features.algorithms.runtime.dp.travelingSalesman.labels.cityRowValue'),
    pendingValue: t('features.algorithms.runtime.dp.travelingSalesman.labels.pendingValue'),
  },
  decisions: {
    cheaperExpandedSubset: t(
      'features.algorithms.runtime.dp.travelingSalesman.decisions.cheaperExpandedSubset',
    ),
    existingStateBetter: t(
      'features.algorithms.runtime.dp.travelingSalesman.decisions.existingStateBetter',
    ),
    saveParent: t('features.algorithms.runtime.dp.travelingSalesman.decisions.saveParent'),
    newBestCycle: t('features.algorithms.runtime.dp.travelingSalesman.decisions.newBestCycle'),
    keepEarlierClosure: t(
      'features.algorithms.runtime.dp.travelingSalesman.decisions.keepEarlierClosure',
    ),
    closesCheapestVia: t(
      'features.algorithms.runtime.dp.travelingSalesman.decisions.closesCheapestVia',
    ),
    done: t('features.algorithms.runtime.dp.travelingSalesman.decisions.done'),
    jumpToPredecessor: t(
      'features.algorithms.runtime.dp.travelingSalesman.decisions.jumpToPredecessor',
    ),
  },
} as const;

export function* travelingSalesmanDpGenerator(
  scenario: TravelingSalesmanScenario,
): Generator<SortStep> {
  const cityCount = scenario.labels.length;
  const start = scenario.startIndex;
  const fullMask = (1 << cityCount) - 1;
  const validMasks = Array.from({ length: fullMask + 1 }, (_, mask) => mask).filter(
    (mask) => (mask & (1 << start)) !== 0,
  );
  const rowIndexByMask = new Map(validMasks.map((mask, index) => [mask, index]));
  const cost = validMasks.map(() => Array.from({ length: cityCount }, () => Number.POSITIVE_INFINITY));
  const parent = validMasks.map(() => Array.from({ length: cityCount }, () => null as number | null));
  const backtrackCells = new Set<string>();

  const startRow = rowIndexByMask.get(1 << start)!;
  cost[startRow]![start] = 0;

  yield createStep({
    scenario,
    validMasks,
    cost,
    parent,
    backtrackCells,
    description: i18nText(I18N.descriptions.initialize, {
      start: scenario.labels[start],
    }),
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeSubset,
    phase: 'init',
  });

  for (const mask of validMasks) {
    const row = rowIndexByMask.get(mask)!;
    for (let end = 0; end < cityCount; end++) {
      if ((mask & (1 << end)) === 0) continue;
      if (!Number.isFinite(cost[row]![end]!)) continue;

      for (let next = 0; next < cityCount; next++) {
        if ((mask & (1 << next)) !== 0) continue;
        const nextMask = mask | (1 << next);
        const nextRow = rowIndexByMask.get(nextMask)!;
        const edgeCost = scenario.distances[end]![next]!;
        const candidate = cost[row]![end]! + edgeCost;

        yield createStep({
          scenario,
          validMasks,
          cost,
          parent,
          backtrackCells,
          activeCell: [nextRow, next],
          candidateCells: [[row, end]],
          description: i18nText(I18N.descriptions.inspectExtension, {
            mask: maskLabel(mask, cityCount),
            from: scenario.labels[end],
            to: scenario.labels[next],
          }),
          activeCodeLine: 5,
          phaseLabel: I18N.phases.inspectExtension,
          phase: 'compare',
          computation: {
            label: i18nText(I18N.labels.extensionLabel, {
              mask: maskLabel(mask, cityCount),
              city: scenario.labels[next],
            }),
            expression: `${cost[row]![end]!} + ${edgeCost}`,
            result: String(candidate),
            decision:
              candidate < cost[nextRow]![next]!
                ? I18N.decisions.cheaperExpandedSubset
                : I18N.decisions.existingStateBetter,
          },
        });

        if (candidate < cost[nextRow]![next]!) {
          cost[nextRow]![next] = candidate;
          parent[nextRow]![next] = end;

          yield createStep({
            scenario,
            validMasks,
            cost,
            parent,
            backtrackCells,
            activeCell: [nextRow, next],
            candidateCells: [[row, end]],
            activeStatus: 'improved',
            description: i18nText(I18N.descriptions.commitSubset, {
              mask: maskLabel(nextMask, cityCount),
              city: scenario.labels[next],
            }),
            activeCodeLine: 6,
            phaseLabel: I18N.phases.commitSubset,
            phase: 'settle-node',
            computation: {
              label: i18nText(I18N.labels.stateLabel, {
                mask: maskLabel(nextMask, cityCount),
                city: scenario.labels[next],
              }),
              expression: i18nText(I18N.labels.parentLabel, {
                city: scenario.labels[end],
              }),
              result: String(candidate),
              decision: I18N.decisions.saveParent,
            },
          });
        }
      }
    }
  }

  const fullRow = rowIndexByMask.get(fullMask)!;
  let bestTour = Number.POSITIVE_INFINITY;
  let bestEnd = start;

  for (let end = 0; end < cityCount; end++) {
    if (end === start || !Number.isFinite(cost[fullRow]![end]!)) continue;
    const candidate = cost[fullRow]![end]! + scenario.distances[end]![start]!;

    yield createStep({
      scenario,
      validMasks,
      cost,
      parent,
      backtrackCells,
      activeCell: [fullRow, end],
      candidateCells: [[fullRow, end]],
      description: i18nText(I18N.descriptions.inspectClosure, {
        from: scenario.labels[end],
        start: scenario.labels[start],
      }),
      activeCodeLine: 8,
      phaseLabel: I18N.phases.inspectClosure,
      phase: 'compare',
      computation: {
        label: i18nText(I18N.labels.bestTourEndLabel, {
          city: scenario.labels[end],
        }),
        expression: `${cost[fullRow]![end]!} + ${scenario.distances[end]![start]!}`,
        result: String(candidate),
        decision: candidate < bestTour ? I18N.decisions.newBestCycle : I18N.decisions.keepEarlierClosure,
      },
    });

    if (candidate < bestTour) {
      bestTour = candidate;
      bestEnd = end;
    }
  }

  yield createStep({
    scenario,
    validMasks,
    cost,
    parent,
    backtrackCells,
    activeCell: [fullRow, bestEnd],
    activeStatus: 'improved',
    description: i18nText(I18N.descriptions.pickClosingCity, {
      city: scenario.labels[bestEnd],
      cost: bestTour,
    }),
    activeCodeLine: 9,
    phaseLabel: I18N.phases.pickClosingCity,
    phase: 'settle-node',
    computation: {
      label: I18N.labels.bestTourEndLabel,
      expression: scenario.labels
        .map((label, end) =>
          end === start || !Number.isFinite(cost[fullRow]![end]!)
            ? `${label}: —`
            : `${label}: ${cost[fullRow]![end]! + scenario.distances[end]![start]!}`,
        )
        .join(' · '),
      result: scenario.labels[bestEnd]!,
      decision: i18nText(I18N.decisions.closesCheapestVia, {
        city: scenario.labels[bestEnd],
      }),
    },
  });

  const reverseTrace: number[] = [];
  let cursorMask = fullMask;
  let cursorCity = bestEnd;
  while (cursorCity !== start) {
    const row = rowIndexByMask.get(cursorMask)!;
    backtrackCells.add(dpCellId(row, cursorCity));
    reverseTrace.push(cursorCity);

    yield createStep({
      scenario,
      validMasks,
      cost,
      parent,
      backtrackCells,
      activeCell: [row, cursorCity],
      activeStatus: 'backtrack',
      reverseTrace,
      description: i18nText(I18N.descriptions.backtrackRoute, {
        city: scenario.labels[cursorCity],
      }),
      activeCodeLine: 10,
      phaseLabel: I18N.phases.backtrackRoute,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.traceValue, { city: scenario.labels[cursorCity] }),
        expression:
          parent[row]![cursorCity] === null
            ? 'start'
            : i18nText(I18N.labels.parentLabel, {
                city: scenario.labels[parent[row]![cursorCity]!],
              }),
        result: reverseRouteLabel(scenario, reverseTrace),
        decision:
          parent[row]![cursorCity] === null
            ? I18N.decisions.done
            : I18N.decisions.jumpToPredecessor,
      },
    });

    const previous = parent[row]![cursorCity];
    cursorMask &= ~(1 << cursorCity);
    cursorCity = previous ?? start;
  }

  yield createStep({
    scenario,
    validMasks,
    cost,
    parent,
    backtrackCells,
    reverseTrace,
    description: I18N.descriptions.complete,
    activeCodeLine: 11,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: TravelingSalesmanScenario;
  readonly validMasks: readonly number[];
  readonly cost: readonly (readonly number[])[];
  readonly parent: readonly (readonly (number | null)[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeStatus?: 'active' | 'improved' | 'backtrack';
  readonly computation?: DpComputation | null;
  readonly reverseTrace?: readonly number[];
}): SortStep {
  const cityCount = args.scenario.labels.length;
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));

  const rowHeaders: DpHeaderConfig[] = args.validMasks.map((mask) => ({
    id: `row-${mask}`,
    label: maskLabel(mask, cityCount),
    status: (args.activeCell && args.validMasks[args.activeCell[0]] === mask ? 'active' : 'accent') as DpHeaderConfig['status'],
    metaLabel: memberLabel(mask, args.scenario.labels),
  }));
  const colHeaders: DpHeaderConfig[] = args.scenario.labels.map((label, index) => ({
    id: `col-${index}`,
    label,
    status: (args.activeCell?.[1] === index ? 'active' : index === args.scenario.startIndex ? 'source' : 'target') as DpHeaderConfig['status'],
    metaLabel: index === args.scenario.startIndex ? 'start' : 'end',
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.validMasks.length; row++) {
    const mask = args.validMasks[row]!;
    for (let col = 0; col < cityCount; col++) {
      const id = dpCellId(row, col);
      const cityInMask = (mask & (1 << col)) !== 0;
      const value = args.cost[row]![col]!;
      const reachable = Number.isFinite(value);
      const isBacktrack = args.backtrackCells.has(id);
      const tags: DpTraceTag[] = [];
      if (row === 0 && col === args.scenario.startIndex) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (isBacktrack) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.parent[row]![col] !== null) tags.push('split');

      cells.push({
        row,
        col,
        rowLabel: maskLabel(mask, cityCount),
        colLabel: args.scenario.labels[col]!,
        valueLabel: !cityInMask ? '—' : reachable ? String(value) : '∞',
        metaLabel: !cityInMask
          ? null
          : args.parent[row]![col] === null
            ? col === args.scenario.startIndex && mask === (1 << args.scenario.startIndex)
              ? 'start'
              : null
            : `from ${args.scenario.labels[args.parent[row]![col]!]}`,
        status: isBacktrack
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0 && col === args.scenario.startIndex
                ? 'base'
                : cityInMask && reachable
                  ? 'chosen'
                  : 'idle',
        tags,
      });
    }
  }

  const fullRow = args.validMasks.length - 1;
  const bestKnown = Math.min(...args.cost[fullRow]!.filter((value) => Number.isFinite(value)));
  const reverseTrace = args.reverseTrace ?? [];
  const insights: DpInsight[] = [
    { label: I18N.insights.citiesLabel, value: String(cityCount), tone: 'accent' },
    { label: I18N.insights.subsetRowsLabel, value: String(args.validMasks.length), tone: 'info' },
    {
      label: I18N.insights.bestOpenRouteLabel,
      value: Number.isFinite(bestKnown) ? String(bestKnown) : I18N.labels.pendingValue,
      tone: 'success',
    },
    { label: I18N.insights.traceDepthLabel, value: String(reverseTrace.length), tone: 'warning' },
    {
      label: I18N.insights.startLabel,
      value: args.scenario.labels[args.scenario.startIndex]!,
      tone: 'info',
    },
  ];

  return createDpStep({
    mode: 'traveling-salesman-dp',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: tspResultLabel(args.scenario, args.cost, args.validMasks),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.validMasks.length} × ${cityCount}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeState, {
            mask: maskLabel(args.validMasks[args.activeCell[0]]!, cityCount),
            city: args.scenario.labels[args.activeCell[1]],
          })
        : null,
    pathLabel: finalTourLabel(args.scenario, reverseTrace),
    primaryItemsLabel: I18N.labels.citiesItemsLabel,
    primaryItems: args.scenario.labels.map((label, index) => `${label}${index === args.scenario.startIndex ? ' (start)' : ''}`),
    secondaryItemsLabel: I18N.labels.distanceLensLabel,
    secondaryItems: args.activeCell
      ? args.scenario.distances[args.activeCell[1]]!.map((value, index) =>
          i18nText(I18N.labels.distanceEdge, {
            from: args.scenario.labels[args.activeCell![1]],
            to: args.scenario.labels[index],
            value,
          }),
        )
      : args.scenario.labels.map((label) => i18nText(I18N.labels.cityRowValue, { city: label })),
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

function maskLabel(mask: number, cityCount: number): string {
  return mask.toString(2).padStart(cityCount, '0');
}

function memberLabel(mask: number, labels: readonly string[]): string {
  return labels.filter((_, index) => (mask & (1 << index)) !== 0).join(' · ');
}

function reverseRouteLabel(
  scenario: TravelingSalesmanScenario,
  reverseTrace: readonly number[],
): TranslatableText {
  const trace = reverseTrace.length === 0
    ? scenario.labels[scenario.startIndex]!
    : `${reverseTrace.map((index) => scenario.labels[index]!).join(' ← ')} ← ${scenario.labels[scenario.startIndex]!}`;
  return i18nText(I18N.labels.traceValue, { city: trace });
}

function finalTourLabel(
  scenario: TravelingSalesmanScenario,
  reverseTrace: readonly number[],
): TranslatableText {
  if (reverseTrace.length === 0) return I18N.labels.pathPending;
  const ordered = [...reverseTrace].reverse();
  return i18nText(I18N.labels.pathValue, {
    tour: [
      scenario.labels[scenario.startIndex]!,
      ...ordered.map((index) => scenario.labels[index]!),
      scenario.labels[scenario.startIndex]!,
    ].join(' → '),
  });
}

function tspResultLabel(
  scenario: TravelingSalesmanScenario,
  cost: readonly (readonly number[])[],
  validMasks: readonly number[],
): TranslatableText {
  const fullRow = validMasks.length - 1;
  let best = Number.POSITIVE_INFINITY;
  for (let end = 0; end < scenario.labels.length; end++) {
    if (end === scenario.startIndex || !Number.isFinite(cost[fullRow]![end]!)) continue;
    best = Math.min(best, cost[fullRow]![end]! + scenario.distances[end]![scenario.startIndex]!);
  }

  return Number.isFinite(best)
    ? i18nText(I18N.labels.resultTour, { value: best })
    : I18N.labels.resultPending;
}
