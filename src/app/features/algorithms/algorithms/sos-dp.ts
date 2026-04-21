import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { SosDpScenario } from '../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.sosDp.modeLabel'),
  phases: {
    initializeBase: t('features.algorithms.runtime.dp.sosDp.phases.initializeBase'),
    carryMask: t('features.algorithms.runtime.dp.sosDp.phases.carryMask'),
    mergeSubmask: t('features.algorithms.runtime.dp.sosDp.phases.mergeSubmask'),
    commitTransition: t('features.algorithms.runtime.dp.sosDp.phases.commitTransition'),
    traceContributors: t('features.algorithms.runtime.dp.sosDp.phases.traceContributors'),
    traceBase: t('features.algorithms.runtime.dp.sosDp.phases.traceBase'),
    complete: t('features.algorithms.runtime.dp.sosDp.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.sosDp.descriptions.initialize'),
    carryMask: t('features.algorithms.runtime.dp.sosDp.descriptions.carryMask'),
    mergeSubmask: t('features.algorithms.runtime.dp.sosDp.descriptions.mergeSubmask'),
    commitTransition: t('features.algorithms.runtime.dp.sosDp.descriptions.commitTransition'),
    complete: t('features.algorithms.runtime.dp.sosDp.descriptions.complete'),
    traceBase: t('features.algorithms.runtime.dp.sosDp.descriptions.traceBase'),
    traceContributors: t('features.algorithms.runtime.dp.sosDp.descriptions.traceContributors'),
  },
  insights: {
    bitsLabel: t('features.algorithms.runtime.dp.sosDp.insights.bitsLabel'),
    masksLabel: t('features.algorithms.runtime.dp.sosDp.insights.masksLabel'),
    focusedSumLabel: t('features.algorithms.runtime.dp.sosDp.insights.focusedSumLabel'),
    contributorsLabel: t('features.algorithms.runtime.dp.sosDp.insights.contributorsLabel'),
    focusLabel: t('features.algorithms.runtime.dp.sosDp.insights.focusLabel'),
  },
  labels: {
    resultSum: t('features.algorithms.runtime.dp.sosDp.labels.resultSum'),
    activeState: t('features.algorithms.runtime.dp.sosDp.labels.activeState'),
    pathValue: t('features.algorithms.runtime.dp.sosDp.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.sosDp.labels.pathPending'),
    baseValuesLabel: t('features.algorithms.runtime.dp.sosDp.labels.baseValuesLabel'),
    activeBitsLabel: t('features.algorithms.runtime.dp.sosDp.labels.activeBitsLabel'),
    carryLabel: t('features.algorithms.runtime.dp.sosDp.labels.carryLabel'),
    mergeLabel: t('features.algorithms.runtime.dp.sosDp.labels.mergeLabel'),
    cellLabel: t('features.algorithms.runtime.dp.sosDp.labels.cellLabel'),
    stageLabel: t('features.algorithms.runtime.dp.sosDp.labels.stageLabel'),
  },
  decisions: {
    noMerge: t('features.algorithms.runtime.dp.sosDp.decisions.noMerge'),
    aggregateSubmask: t('features.algorithms.runtime.dp.sosDp.decisions.aggregateSubmask'),
    stageAccumulates: t('features.algorithms.runtime.dp.sosDp.decisions.stageAccumulates'),
    recordContributor: t('features.algorithms.runtime.dp.sosDp.decisions.recordContributor'),
    followBranches: t('features.algorithms.runtime.dp.sosDp.decisions.followBranches'),
  },
} as const;

export function* sosDpGenerator(scenario: SosDpScenario): Generator<SortStep> {
  const stages = scenario.bitCount + 1;
  const maskCount = 1 << scenario.bitCount;
  const table = Array.from({ length: stages }, (_, row) =>
    Array.from({ length: maskCount }, (_, mask) => (row === 0 ? scenario.baseValues[mask]! : 0)),
  );
  const traced = new Set<string>();
  const contributingMasks = new Set<number>();

  yield createStep({
    scenario,
    table,
    traced,
    contributingMasks,
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeBase,
    phase: 'init',
  });

  for (let bit = 0; bit < scenario.bitCount; bit++) {
    for (let mask = 0; mask < maskCount; mask++) {
      table[bit + 1]![mask] = table[bit]![mask]!;

      if ((mask & (1 << bit)) === 0) {
        yield createStep({
          scenario,
          table,
          traced,
          contributingMasks,
          activeCell: [bit + 1, mask],
          candidateCells: [[bit, mask]],
          description: i18nText(I18N.descriptions.carryMask, {
            mask: maskLabel(mask, scenario.bitCount),
            bit,
          }),
          activeCodeLine: 5,
          phaseLabel: I18N.phases.carryMask,
          phase: 'settle-node',
          computation: {
            label: i18nText(I18N.labels.carryLabel, {
              mask: maskLabel(mask, scenario.bitCount),
              bit,
            }),
            expression: `dp[${bit}][${maskLabel(mask, scenario.bitCount)}]`,
            result: String(table[bit + 1]![mask]!),
            decision: I18N.decisions.noMerge,
          },
        });
        continue;
      }

      const submask = mask ^ (1 << bit);
      const candidate = table[bit]![mask]! + table[bit]![submask]!;

      yield createStep({
        scenario,
        table,
        traced,
        contributingMasks,
        activeCell: [bit + 1, mask],
        candidateCells: [[bit, mask], [bit, submask]],
        description: i18nText(I18N.descriptions.mergeSubmask, {
          bit,
          mask: maskLabel(mask, scenario.bitCount),
          submask: maskLabel(submask, scenario.bitCount),
        }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.mergeSubmask,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.mergeLabel, {
            mask: maskLabel(mask, scenario.bitCount),
            bit,
          }),
          expression: `${table[bit]![mask]!} + ${table[bit]![submask]!}`,
          result: String(candidate),
          decision: I18N.decisions.aggregateSubmask,
        },
      });

      table[bit + 1]![mask] = candidate;

      yield createStep({
        scenario,
        table,
        traced,
        contributingMasks,
        activeCell: [bit + 1, mask],
        candidateCells: [[bit, mask], [bit, submask]],
        activeStatus: 'improved',
        description: i18nText(I18N.descriptions.commitTransition, {
          mask: maskLabel(mask, scenario.bitCount),
          bit,
        }),
        activeCodeLine: 6,
        phaseLabel: I18N.phases.commitTransition,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.cellLabel, {
            stage: bit + 1,
            mask: maskLabel(mask, scenario.bitCount),
          }),
          expression: `${table[bit]![mask]!} + ${table[bit]![submask]!}`,
          result: String(table[bit + 1]![mask]!),
          decision: I18N.decisions.stageAccumulates,
        },
      });
    }
  }

  yield* traceContributors(scenario.bitCount, scenario.focusMask);

  yield createStep({
    scenario,
    table,
    traced,
    contributingMasks,
    description: i18nText(I18N.descriptions.complete, {
      mask: maskLabel(scenario.focusMask, scenario.bitCount),
    }),
    activeCodeLine: 8,
    phaseLabel: I18N.phases.complete,
    phase: 'complete',
  });

  function* traceContributors(stage: number, mask: number): Generator<SortStep> {
    traced.add(dpCellId(stage, mask));
    if (stage === 0) {
      contributingMasks.add(mask);
      yield createStep({
        scenario,
        table,
        traced,
        contributingMasks,
        activeCell: [stage, mask],
        activeStatus: 'backtrack',
        description: i18nText(I18N.descriptions.traceBase, {
          mask: maskLabel(mask, scenario.bitCount),
        }),
        activeCodeLine: 7,
        phaseLabel: I18N.phases.traceBase,
        phase: 'relax',
        computation: {
          label: maskLabel(mask, scenario.bitCount),
          expression: `f[${maskLabel(mask, scenario.bitCount)}]`,
          result: contributorsLabel(scenario, contributingMasks),
          decision: I18N.decisions.recordContributor,
        },
      });
      return;
    }

    yield createStep({
      scenario,
      table,
      traced,
      contributingMasks,
      activeCell: [stage, mask],
      activeStatus: 'backtrack',
      description: i18nText(I18N.descriptions.traceContributors, { stage }),
      activeCodeLine: 7,
      phaseLabel: I18N.phases.traceContributors,
      phase: 'relax',
      computation: {
        label: i18nText(I18N.labels.stageLabel, {
          stage,
          mask: maskLabel(mask, scenario.bitCount),
        }),
        expression:
          (mask & (1 << (stage - 1))) !== 0
            ? 'came from mask and submask'
            : 'came only from the same mask',
        result: contributorsLabel(scenario, contributingMasks),
        decision: I18N.decisions.followBranches,
      },
    });

    yield* traceContributors(stage - 1, mask);
    if ((mask & (1 << (stage - 1))) !== 0) {
      yield* traceContributors(stage - 1, mask ^ (1 << (stage - 1)));
    }
  }
}

function createStep(args: {
  readonly scenario: SosDpScenario;
  readonly table: readonly (readonly number[])[];
  readonly traced: ReadonlySet<string>;
  readonly contributingMasks: ReadonlySet<number>;
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
  const rowHeaders: DpHeaderConfig[] = Array.from({ length: args.table.length }, (_, stage) => ({
    id: `row-${stage}`,
    label: stage === 0 ? 'base' : `bit ${stage - 1}`,
    status: (args.activeCell?.[0] === stage ? 'active' : stage === 0 ? 'source' : 'accent') as DpHeaderConfig['status'],
    metaLabel: stage === 0 ? 'f[mask]' : 'after merge',
  }));
  const colHeaders: DpHeaderConfig[] = Array.from({ length: args.table[0]!.length }, (_, mask) => ({
    id: `col-${mask}`,
    label: maskLabel(mask, args.scenario.bitCount),
    status: (args.activeCell?.[1] === mask ? 'active' : mask === args.scenario.focusMask ? 'target' : 'idle') as DpHeaderConfig['status'],
    metaLabel: mask === args.scenario.focusMask ? 'focus' : null,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let col = 0; col < args.table[row]!.length; col++) {
      const id = dpCellId(row, col);
      const tags: DpTraceTag[] = [];
      if (row === 0) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (args.traced.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (args.contributingMasks.has(col)) tags.push('take');

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? 'base' : `bit ${row - 1}`,
        colLabel: maskLabel(col, args.scenario.bitCount),
        valueLabel: String(args.table[row]![col]!),
        metaLabel:
          row === 0 && args.contributingMasks.has(col)
            ? 'src'
            : col === args.scenario.focusMask
              ? 'focus'
              : null,
        status: args.traced.has(id)
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : row === 0
                ? 'base'
                : 'chosen',
        tags,
      });
    }
  }

  const result = args.table[args.scenario.bitCount]![args.scenario.focusMask]!;
  const insights: DpInsight[] = [
    { label: I18N.insights.bitsLabel, value: String(args.scenario.bitCount), tone: 'accent' },
    { label: I18N.insights.masksLabel, value: String(args.table[0]!.length), tone: 'info' },
    { label: I18N.insights.focusedSumLabel, value: String(result), tone: 'success' },
    { label: I18N.insights.contributorsLabel, value: String(args.contributingMasks.size), tone: 'warning' },
    {
      label: I18N.insights.focusLabel,
      value: maskLabel(args.scenario.focusMask, args.scenario.bitCount),
      tone: 'info',
    },
  ];

  return createDpStep({
    mode: 'sos-dp',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultSum, { value: result }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeState, {
            row: rowHeaders[args.activeCell[0]]!.label,
            mask: maskLabel(args.activeCell[1], args.scenario.bitCount),
          })
        : null,
    pathLabel: contributorsLabel(args.scenario, args.contributingMasks),
    primaryItemsLabel: I18N.labels.baseValuesLabel,
    primaryItems: args.scenario.baseValues.map((value, mask) => `${maskLabel(mask, args.scenario.bitCount)}=${value}`),
    secondaryItemsLabel: I18N.labels.activeBitsLabel,
    secondaryItems: Array.from({ length: args.scenario.bitCount }, (_, bit) => `bit ${bit}`),
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

function maskLabel(mask: number, width: number): string {
  return mask.toString(2).padStart(width, '0');
}

function contributorsLabel(
  scenario: SosDpScenario,
  contributingMasks: ReadonlySet<number>,
): TranslatableText {
  const masks = Array.from(contributingMasks)
    .sort((left, right) => left - right)
    .map((mask) => maskLabel(mask, scenario.bitCount));
  return masks.length > 0
    ? i18nText(I18N.labels.pathValue, { masks: masks.join(' · ') })
    : I18N.labels.pathPending;
}
