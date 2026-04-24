import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  PointerLabCell,
  PointerLabCellStatus,
  PointerLabPointer,
  PointerLabTraceState,
  PointerLabWindow,
} from '../../models/pointer-lab';
import { SortStep } from '../../models/sort-step';
import { KadaneScenario } from '../../utils/scenarios/pointer-lab/pointer-lab-scenarios';
import { createPointerLabStep } from '../pointer-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.pointerLab.kadane.modeLabel'),
  resultFormat: t('features.algorithms.runtime.pointerLab.kadane.resultFormat'),
  phases: {
    init: t('features.algorithms.runtime.pointerLab.kadane.phases.init'),
    extend: t('features.algorithms.runtime.pointerLab.kadane.phases.extend'),
    restart: t('features.algorithms.runtime.pointerLab.kadane.phases.restart'),
    bestUpdate: t('features.algorithms.runtime.pointerLab.kadane.phases.bestUpdate'),
    complete: t('features.algorithms.runtime.pointerLab.kadane.phases.complete'),
  },
  descriptions: {
    init: t('features.algorithms.runtime.pointerLab.kadane.descriptions.init'),
    extend: t('features.algorithms.runtime.pointerLab.kadane.descriptions.extend'),
    restart: t('features.algorithms.runtime.pointerLab.kadane.descriptions.restart'),
    bestUpdate: t('features.algorithms.runtime.pointerLab.kadane.descriptions.bestUpdate'),
    keepBest: t('features.algorithms.runtime.pointerLab.kadane.descriptions.keepBest'),
    complete: t('features.algorithms.runtime.pointerLab.kadane.descriptions.complete'),
  },
  decisions: {
    seed: t('features.algorithms.runtime.pointerLab.kadane.decisions.seed'),
    extendWindow: t('features.algorithms.runtime.pointerLab.kadane.decisions.extendWindow'),
    resetWindow: t('features.algorithms.runtime.pointerLab.kadane.decisions.resetWindow'),
    bestUp: t('features.algorithms.runtime.pointerLab.kadane.decisions.bestUp'),
    keepBest: t('features.algorithms.runtime.pointerLab.kadane.decisions.keepBest'),
    done: t('features.algorithms.runtime.pointerLab.kadane.decisions.done'),
  },
  stats: {
    current: t('features.algorithms.runtime.pointerLab.kadane.stats.current'),
    best: t('features.algorithms.runtime.pointerLab.kadane.stats.best'),
    index: t('features.algorithms.runtime.pointerLab.kadane.stats.index'),
  },
} as const;

function buildCells(
  values: readonly number[],
  overrides: Readonly<Record<number, PointerLabCellStatus>>,
): readonly PointerLabCell[] {
  return values.map((value, index) => ({
    index,
    value: String(value),
    status: overrides[index] ?? 'idle',
    overlay: null,
  }));
}

function pointers(currentLeft: number, i: number): readonly PointerLabPointer[] {
  return [
    { id: 'L', label: 'L', index: currentLeft, side: 'bottom', tone: 'accent' },
    { id: 'i', label: 'i', index: i, side: 'top', tone: 'warm' },
  ];
}

function windowOf(left: number, right: number, tone: PointerLabWindow['tone']): PointerLabWindow {
  return { left, right, tone };
}

export function* kadaneGenerator(scenario: KadaneScenario): Generator<SortStep> {
  const values = scenario.values;
  const mode = I18N.modeLabel;
  const presetLabel = scenario.presetLabel;

  let current = values[0];
  let best = values[0];
  let currentLeft = 0;
  let bestLeft = 0;
  let bestRight = 0;

  const makeState = (partial: {
    phase: TranslatableText;
    decision: TranslatableText;
    tone: PointerLabTraceState['tone'];
    cells: readonly PointerLabCell[];
    currentLeft: number;
    i: number;
    windowTone: PointerLabWindow['tone'] | null;
    windowLeft: number;
    windowRight: number;
    iteration: number;
    result: TranslatableText | null;
  }): PointerLabTraceState => ({
    mode: 'kadane',
    modeLabel: mode,
    presetLabel,
    phaseLabel: partial.phase,
    decisionLabel: partial.decision,
    tone: partial.tone,
    cells: partial.cells,
    pointers: pointers(partial.currentLeft, partial.i),
    window:
      partial.windowTone !== null && partial.windowLeft <= partial.windowRight
        ? windowOf(partial.windowLeft, partial.windowRight, partial.windowTone)
        : null,
    stats: [
      { label: I18N.stats.current, value: String(current), tone: current > 0 ? 'accent' : 'warning' },
      {
        label: I18N.stats.best,
        value: `${best}  @[${bestLeft}..${bestRight}]`,
        tone: 'success',
      },
      { label: I18N.stats.index, value: String(partial.i), tone: 'info' },
    ],
    resultLabel: partial.result,
    iteration: partial.iteration,
  });

  // ---------- Init ----------
  const initStatus: Record<number, PointerLabCellStatus> = { 0: 'window' };
  yield createPointerLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.init, { value: values[0] }),
    state: makeState({
      phase: I18N.phases.init,
      decision: I18N.decisions.seed,
      tone: 'compare',
      cells: buildCells(values, initStatus),
      currentLeft: 0,
      i: 0,
      windowTone: 'active',
      windowLeft: 0,
      windowRight: 0,
      iteration: 0,
      result: null,
    }),
  });

  for (let i = 1; i < values.length; i++) {
    const iteration = i;
    const extended = current + values[i];
    const fresh = values[i];
    const restart = fresh > extended;

    if (restart) {
      current = fresh;
      currentLeft = i;

      const statuses: Record<number, PointerLabCellStatus> = { [i]: 'window' };
      for (let j = 0; j < i; j++) statuses[j] = 'settled';

      yield createPointerLabStep({
        activeCodeLine: 4,
        description: i18nText(I18N.descriptions.restart, { index: i, value: fresh }),
        state: makeState({
          phase: I18N.phases.restart,
          decision: I18N.decisions.resetWindow,
          tone: 'swap',
          cells: buildCells(values, statuses),
          currentLeft,
          i,
          windowTone: 'active',
          windowLeft: currentLeft,
          windowRight: i,
          iteration,
          result: null,
        }),
      });
    } else {
      current = extended;

      const statuses: Record<number, PointerLabCellStatus> = {};
      for (let j = currentLeft; j <= i; j++) statuses[j] = 'window';

      yield createPointerLabStep({
        activeCodeLine: 5,
        description: i18nText(I18N.descriptions.extend, {
          value: values[i],
          sum: current,
          left: currentLeft,
          right: i,
        }),
        state: makeState({
          phase: I18N.phases.extend,
          decision: I18N.decisions.extendWindow,
          tone: 'compare',
          cells: buildCells(values, statuses),
          currentLeft,
          i,
          windowTone: 'active',
          windowLeft: currentLeft,
          windowRight: i,
          iteration,
          result: null,
        }),
      });
    }

    if (current > best) {
      best = current;
      bestLeft = currentLeft;
      bestRight = i;

      const bestStatuses: Record<number, PointerLabCellStatus> = {};
      for (let j = bestLeft; j <= bestRight; j++) bestStatuses[j] = 'best';

      yield createPointerLabStep({
        activeCodeLine: 7,
        description: i18nText(I18N.descriptions.bestUpdate, {
          sum: best,
          left: bestLeft,
          right: bestRight,
        }),
        state: makeState({
          phase: I18N.phases.bestUpdate,
          decision: I18N.decisions.bestUp,
          tone: 'compare',
          cells: buildCells(values, bestStatuses),
          currentLeft,
          i,
          windowTone: 'best',
          windowLeft: bestLeft,
          windowRight: bestRight,
          iteration,
          result: null,
        }),
      });
    } else {
      const statuses: Record<number, PointerLabCellStatus> = {};
      for (let j = currentLeft; j <= i; j++) statuses[j] = 'window';

      yield createPointerLabStep({
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.keepBest, { current, best }),
        state: makeState({
          phase: I18N.phases.extend,
          decision: I18N.decisions.keepBest,
          tone: 'settle',
          cells: buildCells(values, statuses),
          currentLeft,
          i,
          windowTone: 'active',
          windowLeft: currentLeft,
          windowRight: i,
          iteration,
          result: null,
        }),
      });
    }
  }

  // ---------- Complete ----------
  const finalStatuses: Record<number, PointerLabCellStatus> = {};
  for (let j = bestLeft; j <= bestRight; j++) finalStatuses[j] = 'best';

  yield createPointerLabStep({
    activeCodeLine: 8,
    description: i18nText(I18N.descriptions.complete, {
      sum: best,
      left: bestLeft,
      right: bestRight,
    }),
    state: makeState({
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      cells: buildCells(values, finalStatuses),
      currentLeft: bestLeft,
      i: bestRight,
      windowTone: 'best',
      windowLeft: bestLeft,
      windowRight: bestRight,
      iteration: values.length - 1,
      result: i18nText(I18N.resultFormat, { sum: best, left: bestLeft, right: bestRight }),
    }),
  });
}
