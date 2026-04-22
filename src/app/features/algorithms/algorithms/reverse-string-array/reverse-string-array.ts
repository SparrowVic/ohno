import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  PointerLabCell,
  PointerLabCellStatus,
  PointerLabPointer,
  PointerLabTraceState,
} from '../../models/pointer-lab';
import { SortStep } from '../../models/sort-step';
import { ReverseScenario } from '../../utils/pointer-lab-scenarios/pointer-lab-scenarios';
import { createPointerLabStep } from '../pointer-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.pointerLab.reverse.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.pointerLab.reverse.phases.setup'),
    swap: t('features.algorithms.runtime.pointerLab.reverse.phases.swap'),
    advance: t('features.algorithms.runtime.pointerLab.reverse.phases.advance'),
    complete: t('features.algorithms.runtime.pointerLab.reverse.phases.complete'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.pointerLab.reverse.descriptions.setup'),
    swap: t('features.algorithms.runtime.pointerLab.reverse.descriptions.swap'),
    advance: t('features.algorithms.runtime.pointerLab.reverse.descriptions.advance'),
    complete: t('features.algorithms.runtime.pointerLab.reverse.descriptions.complete'),
  },
  decisions: {
    probe: t('features.algorithms.runtime.pointerLab.reverse.decisions.probe'),
    swap: t('features.algorithms.runtime.pointerLab.reverse.decisions.swap'),
    converge: t('features.algorithms.runtime.pointerLab.reverse.decisions.converge'),
    done: t('features.algorithms.runtime.pointerLab.reverse.decisions.done'),
  },
  stats: {
    swapsLabel: t('features.algorithms.runtime.pointerLab.reverse.stats.swapsLabel'),
    originalLabel: t('features.algorithms.runtime.pointerLab.reverse.stats.originalLabel'),
  },
} as const;

function buildCells(
  values: readonly string[],
  overrides: Readonly<Record<number, PointerLabCellStatus>>,
): readonly PointerLabCell[] {
  return values.map((v, index) => ({
    index,
    value: v,
    status: overrides[index] ?? 'idle',
    overlay: null,
  }));
}

function pointers(left: number, right: number): readonly PointerLabPointer[] {
  return [
    { id: 'L', label: 'L', index: left, side: 'top', tone: 'accent' },
    { id: 'R', label: 'R', index: right, side: 'top', tone: 'warm' },
  ];
}

export function* reverseStringArrayGenerator(scenario: ReverseScenario): Generator<SortStep> {
  const values = [...scenario.values];
  const original = values.join('');
  const mode = I18N.modeLabel;
  const presetLabel = scenario.presetLabel;
  let left = 0;
  let right = values.length - 1;
  let swaps = 0;

  const makeState = (partial: {
    phase: TranslatableText;
    decision: TranslatableText;
    tone: PointerLabTraceState['tone'];
    cells: readonly PointerLabCell[];
    iteration: number;
    result: TranslatableText | null;
  }): PointerLabTraceState => ({
    mode: 'reverse',
    modeLabel: mode,
    presetLabel,
    phaseLabel: partial.phase,
    decisionLabel: partial.decision,
    tone: partial.tone,
    cells: partial.cells,
    pointers: pointers(left, right),
    window: null,
    stats: [
      { label: I18N.stats.originalLabel, value: original, tone: 'info' },
      { label: I18N.stats.swapsLabel, value: String(swaps), tone: 'accent' },
    ],
    resultLabel: partial.result,
    iteration: partial.iteration,
  });

  yield createPointerLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { input: original }),
    state: makeState({
      phase: I18N.phases.setup,
      decision: I18N.decisions.probe,
      tone: 'idle',
      cells: buildCells(values, { [left]: 'left', [right]: 'right' }),
      iteration: 0,
      result: null,
    }),
  });

  while (left < right) {
    // Swap left ↔ right.
    yield createPointerLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.swap, {
        left: values[left],
        right: values[right],
      }),
      state: makeState({
        phase: I18N.phases.swap,
        decision: I18N.decisions.swap,
        tone: 'swap',
        cells: buildCells(values, { [left]: 'swap', [right]: 'swap' }),
        iteration: swaps,
        result: null,
      }),
    });

    const tmp = values[left];
    values[left] = values[right];
    values[right] = tmp;
    swaps += 1;

    // Show settled cells after swap.
    yield createPointerLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.advance, {
        left: values[left],
        right: values[right],
      }),
      state: makeState({
        phase: I18N.phases.advance,
        decision: I18N.decisions.converge,
        tone: 'settle',
        cells: buildCells(values, { [left]: 'settled', [right]: 'settled' }),
        iteration: swaps,
        result: null,
      }),
    });

    left += 1;
    right -= 1;
  }

  // Final — all cells settled.
  const finalCells: Record<number, PointerLabCellStatus> = {};
  for (let i = 0; i < values.length; i++) finalCells[i] = 'settled';
  yield createPointerLabStep({
    activeCodeLine: 6,
    description: i18nText(I18N.descriptions.complete, { reversed: values.join('') }),
    state: makeState({
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      cells: buildCells(values, finalCells),
      iteration: swaps,
      result: i18nText(t('features.algorithms.runtime.pointerLab.reverse.resultFormat'), {
        reversed: values.join(''),
      }),
    }),
  });
}
