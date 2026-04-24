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
import { SlidingWindowScenario } from '../../utils/scenarios/pointer-lab/pointer-lab-scenarios';
import { createPointerLabStep } from '../pointer-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.pointerLab.slidingWindow.modeLabel'),
  phases: {
    warmup: t('features.algorithms.runtime.pointerLab.slidingWindow.phases.warmup'),
    slide: t('features.algorithms.runtime.pointerLab.slidingWindow.phases.slide'),
    bestUpdate: t('features.algorithms.runtime.pointerLab.slidingWindow.phases.bestUpdate'),
    complete: t('features.algorithms.runtime.pointerLab.slidingWindow.phases.complete'),
  },
  descriptions: {
    warmup: t('features.algorithms.runtime.pointerLab.slidingWindow.descriptions.warmup'),
    slide: t('features.algorithms.runtime.pointerLab.slidingWindow.descriptions.slide'),
    bestUpdate: t('features.algorithms.runtime.pointerLab.slidingWindow.descriptions.bestUpdate'),
    keepBest: t('features.algorithms.runtime.pointerLab.slidingWindow.descriptions.keepBest'),
    complete: t('features.algorithms.runtime.pointerLab.slidingWindow.descriptions.complete'),
  },
  decisions: {
    fillFirst: t('features.algorithms.runtime.pointerLab.slidingWindow.decisions.fillFirst'),
    rollForward: t('features.algorithms.runtime.pointerLab.slidingWindow.decisions.rollForward'),
    bestUpdate: t('features.algorithms.runtime.pointerLab.slidingWindow.decisions.bestUpdate'),
    keepBest: t('features.algorithms.runtime.pointerLab.slidingWindow.decisions.keepBest'),
    done: t('features.algorithms.runtime.pointerLab.slidingWindow.decisions.done'),
  },
  stats: {
    windowSum: t('features.algorithms.runtime.pointerLab.slidingWindow.stats.windowSum'),
    best: t('features.algorithms.runtime.pointerLab.slidingWindow.stats.best'),
    windowSize: t('features.algorithms.runtime.pointerLab.slidingWindow.stats.windowSize'),
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

function pointers(left: number, right: number): readonly PointerLabPointer[] {
  return [
    { id: 'L', label: 'L', index: left, side: 'bottom', tone: 'accent' },
    { id: 'R', label: 'R', index: right, side: 'top', tone: 'warm' },
  ];
}

function windowOf(left: number, right: number, tone: PointerLabWindow['tone']): PointerLabWindow {
  return { left, right, tone };
}

export function* slidingWindowGenerator(scenario: SlidingWindowScenario): Generator<SortStep> {
  const values = scenario.values;
  const k = Math.min(scenario.windowSize, values.length);
  const mode = I18N.modeLabel;
  const presetLabel = scenario.presetLabel;

  const makeState = (partial: {
    phase: TranslatableText;
    decision: TranslatableText;
    tone: PointerLabTraceState['tone'];
    cells: readonly PointerLabCell[];
    left: number;
    right: number;
    windowTone: PointerLabWindow['tone'];
    sum: number;
    best: number;
    bestLeft: number;
    bestRight: number;
    iteration: number;
    result: TranslatableText | null;
  }): PointerLabTraceState => ({
    mode: 'sliding-window',
    modeLabel: mode,
    presetLabel,
    phaseLabel: partial.phase,
    decisionLabel: partial.decision,
    tone: partial.tone,
    cells: partial.cells,
    pointers: pointers(partial.left, partial.right),
    window: partial.left <= partial.right
      ? windowOf(partial.left, partial.right, partial.windowTone)
      : null,
    stats: [
      {
        label: I18N.stats.windowSum,
        value: String(partial.sum),
        tone: 'accent',
      },
      {
        label: I18N.stats.best,
        value: `${partial.best}  @[${partial.bestLeft}..${partial.bestRight}]`,
        tone: 'success',
      },
      {
        label: I18N.stats.windowSize,
        value: String(k),
        tone: 'info',
      },
    ],
    resultLabel: partial.result,
    iteration: partial.iteration,
  });

  // Warm-up — fill the first window.
  let sum = 0;
  for (let i = 0; i < k; i++) sum += values[i];
  let best = sum;
  let bestLeft = 0;
  let bestRight = k - 1;

  const windowCells = (left: number, right: number): Record<number, PointerLabCellStatus> => {
    const out: Record<number, PointerLabCellStatus> = {};
    for (let i = left; i <= right; i++) out[i] = 'window';
    return out;
  };

  yield createPointerLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.warmup, { k, sum }),
    state: makeState({
      phase: I18N.phases.warmup,
      decision: I18N.decisions.fillFirst,
      tone: 'compare',
      cells: buildCells(values, windowCells(0, k - 1)),
      left: 0,
      right: k - 1,
      windowTone: 'active',
      sum,
      best,
      bestLeft,
      bestRight,
      iteration: 0,
      result: null,
    }),
  });

  let iteration = 0;
  for (let right = k; right < values.length; right++) {
    iteration += 1;
    const left = right - k + 1;
    const previousLeft = left - 1;

    sum = sum - values[previousLeft] + values[right];

    // Slide: visualize with both old-left and new-right highlighted.
    const slideStatus: Record<number, PointerLabCellStatus> = windowCells(left, right);
    slideStatus[previousLeft] = 'settled';

    yield createPointerLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.slide, {
        out: values[previousLeft],
        in: values[right],
        sum,
      }),
      state: makeState({
        phase: I18N.phases.slide,
        decision: I18N.decisions.rollForward,
        tone: 'swap',
        cells: buildCells(values, slideStatus),
        left,
        right,
        windowTone: 'active',
        sum,
        best,
        bestLeft,
        bestRight,
        iteration,
        result: null,
      }),
    });

    if (sum > best) {
      best = sum;
      bestLeft = left;
      bestRight = right;

      yield createPointerLabStep({
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.bestUpdate, { sum, left, right }),
        state: makeState({
          phase: I18N.phases.bestUpdate,
          decision: I18N.decisions.bestUpdate,
          tone: 'compare',
          cells: buildCells(values, windowCells(left, right)),
          left,
          right,
          windowTone: 'best',
          sum,
          best,
          bestLeft,
          bestRight,
          iteration,
          result: null,
        }),
      });
    } else {
      yield createPointerLabStep({
        activeCodeLine: 7,
        description: i18nText(I18N.descriptions.keepBest, { sum, best }),
        state: makeState({
          phase: I18N.phases.slide,
          decision: I18N.decisions.keepBest,
          tone: 'settle',
          cells: buildCells(values, windowCells(left, right)),
          left,
          right,
          windowTone: 'active',
          sum,
          best,
          bestLeft,
          bestRight,
          iteration,
          result: null,
        }),
      });
    }
  }

  yield createPointerLabStep({
    activeCodeLine: 9,
    description: i18nText(I18N.descriptions.complete, { best, left: bestLeft, right: bestRight }),
    state: makeState({
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      cells: buildCells(values, windowCells(bestLeft, bestRight)),
      left: bestLeft,
      right: bestRight,
      windowTone: 'best',
      sum: best,
      best,
      bestLeft,
      bestRight,
      iteration,
      result: i18nText(t('features.algorithms.runtime.pointerLab.slidingWindow.resultFormat'), {
        best,
        left: bestLeft,
        right: bestRight,
      }),
    }),
  });
}
