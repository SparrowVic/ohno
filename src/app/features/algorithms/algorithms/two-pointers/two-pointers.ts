import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  PointerLabCell,
  PointerLabCellStatus,
  PointerLabPointer,
  PointerLabTraceState,
} from '../../models/pointer-lab';
import { SortStep } from '../../models/sort-step';
import { TwoPointersScenario } from '../../utils/scenarios/pointer-lab/pointer-lab-scenarios';
import { createPointerLabStep } from '../pointer-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.pointerLab.twoPointers.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.pointerLab.twoPointers.phases.setup'),
    compare: t('features.algorithms.runtime.pointerLab.twoPointers.phases.compare'),
    shrinkLeft: t('features.algorithms.runtime.pointerLab.twoPointers.phases.shrinkLeft'),
    shrinkRight: t('features.algorithms.runtime.pointerLab.twoPointers.phases.shrinkRight'),
    hit: t('features.algorithms.runtime.pointerLab.twoPointers.phases.hit'),
    miss: t('features.algorithms.runtime.pointerLab.twoPointers.phases.miss'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.pointerLab.twoPointers.descriptions.setup'),
    compare: t('features.algorithms.runtime.pointerLab.twoPointers.descriptions.compare'),
    shrinkLeft: t('features.algorithms.runtime.pointerLab.twoPointers.descriptions.shrinkLeft'),
    shrinkRight: t('features.algorithms.runtime.pointerLab.twoPointers.descriptions.shrinkRight'),
    hit: t('features.algorithms.runtime.pointerLab.twoPointers.descriptions.hit'),
    miss: t('features.algorithms.runtime.pointerLab.twoPointers.descriptions.miss'),
  },
  decisions: {
    tooSmall: t('features.algorithms.runtime.pointerLab.twoPointers.decisions.tooSmall'),
    tooBig: t('features.algorithms.runtime.pointerLab.twoPointers.decisions.tooBig'),
    match: t('features.algorithms.runtime.pointerLab.twoPointers.decisions.match'),
    noPair: t('features.algorithms.runtime.pointerLab.twoPointers.decisions.noPair'),
    probe: t('features.algorithms.runtime.pointerLab.twoPointers.decisions.probe'),
  },
  stats: {
    sumLabel: t('features.algorithms.runtime.pointerLab.twoPointers.stats.sumLabel'),
    targetLabel: t('features.algorithms.runtime.pointerLab.twoPointers.stats.targetLabel'),
  },
} as const;

function buildCells(
  values: readonly number[],
  statuses: Readonly<Record<number, PointerLabCellStatus>>,
): readonly PointerLabCell[] {
  return values.map((value, index) => ({
    index,
    value: String(value),
    status: statuses[index] ?? 'idle',
    overlay: null,
  }));
}

function pointers(left: number, right: number): readonly PointerLabPointer[] {
  return [
    { id: 'L', label: 'L', index: left, side: 'top', tone: 'accent' },
    { id: 'R', label: 'R', index: right, side: 'top', tone: 'warm' },
  ];
}

function stats(sum: number, target: number) {
  const delta = sum - target;
  const sumTone: 'success' | 'warning' | 'accent' =
    delta === 0 ? 'success' : delta < 0 ? 'warning' : 'accent';
  return [
    {
      label: I18N.stats.sumLabel,
      value: String(sum),
      tone: sumTone,
    },
    {
      label: I18N.stats.targetLabel,
      value: String(target),
      tone: 'info' as const,
    },
  ];
}

export function* twoPointersGenerator(scenario: TwoPointersScenario): Generator<SortStep> {
  const values = [...scenario.values].sort((x, y) => x - y);
  const target = scenario.target;
  const mode = I18N.modeLabel;
  const presetLabel = scenario.presetLabel;
  let left = 0;
  let right = values.length - 1;

  const makeState = (partial: {
    phase: TranslatableText;
    decision: TranslatableText;
    tone: PointerLabTraceState['tone'];
    cells: readonly PointerLabCell[];
    result: TranslatableText | null;
    iteration: number;
  }): PointerLabTraceState => ({
    mode: 'two-pointers',
    modeLabel: mode,
    phaseLabel: partial.phase,
    decisionLabel: partial.decision,
    presetLabel,
    tone: partial.tone,
    cells: partial.cells,
    pointers: pointers(left, right),
    window: null,
    stats: stats(values[left] + values[right], target),
    resultLabel: partial.result,
    iteration: partial.iteration,
  });

  yield createPointerLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { target, size: values.length }),
    state: makeState({
      phase: I18N.phases.setup,
      decision: I18N.decisions.probe,
      tone: 'idle',
      cells: buildCells(values, { [left]: 'left', [right]: 'right' }),
      result: null,
      iteration: 0,
    }),
  });

  let iteration = 0;
  while (left < right) {
    iteration += 1;
    const sum = values[left] + values[right];

    // Compare step.
    yield createPointerLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.compare, {
        left: values[left],
        right: values[right],
        sum,
        target,
      }),
      state: makeState({
        phase: I18N.phases.compare,
        decision: I18N.decisions.probe,
        tone: 'compare',
        cells: buildCells(values, { [left]: 'left', [right]: 'right' }),
        result: null,
        iteration,
      }),
    });

    if (sum === target) {
      yield createPointerLabStep({
        activeCodeLine: 5,
        description: i18nText(I18N.descriptions.hit, {
          left: values[left],
          right: values[right],
          target,
        }),
        state: makeState({
          phase: I18N.phases.hit,
          decision: I18N.decisions.match,
          tone: 'complete',
          cells: buildCells(values, { [left]: 'match', [right]: 'match' }),
          result: i18nText(t('features.algorithms.runtime.pointerLab.twoPointers.resultHit'), {
            left: values[left],
            right: values[right],
            target,
          }),
          iteration,
        }),
      });
      return;
    }

    if (sum < target) {
      // Move left forward.
      const nextLeft = left + 1;
      yield createPointerLabStep({
        activeCodeLine: 7,
        description: I18N.descriptions.shrinkLeft,
        state: makeState({
          phase: I18N.phases.shrinkLeft,
          decision: I18N.decisions.tooSmall,
          tone: 'swap',
          cells: buildCells(values, { [left]: 'settled', [right]: 'right', [nextLeft]: 'left' }),
          result: null,
          iteration,
        }),
      });
      left = nextLeft;
    } else {
      const nextRight = right - 1;
      yield createPointerLabStep({
        activeCodeLine: 9,
        description: I18N.descriptions.shrinkRight,
        state: makeState({
          phase: I18N.phases.shrinkRight,
          decision: I18N.decisions.tooBig,
          tone: 'swap',
          cells: buildCells(values, { [right]: 'settled', [left]: 'left', [nextRight]: 'right' }),
          result: null,
          iteration,
        }),
      });
      right = nextRight;
    }
  }

  yield createPointerLabStep({
    activeCodeLine: 11,
    description: i18nText(I18N.descriptions.miss, { target }),
    state: makeState({
      phase: I18N.phases.miss,
      decision: I18N.decisions.noPair,
      tone: 'complete',
      cells: buildCells(values, {}),
      result: t('features.algorithms.runtime.pointerLab.twoPointers.resultMiss'),
      iteration,
    }),
  });
}
