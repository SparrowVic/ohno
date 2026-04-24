import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  PointerLabCell,
  PointerLabCellStatus,
  PointerLabPointer,
  PointerLabTraceState,
} from '../../models/pointer-lab';
import { SortStep } from '../../models/sort-step';
import { PalindromeCheckScenario } from '../../utils/scenarios/pointer-lab/pointer-lab-scenarios';
import { createPointerLabStep } from '../pointer-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.pointerLab.palindrome.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.pointerLab.palindrome.phases.setup'),
    compare: t('features.algorithms.runtime.pointerLab.palindrome.phases.compare'),
    converge: t('features.algorithms.runtime.pointerLab.palindrome.phases.converge'),
    confirmed: t('features.algorithms.runtime.pointerLab.palindrome.phases.confirmed'),
    rejected: t('features.algorithms.runtime.pointerLab.palindrome.phases.rejected'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.pointerLab.palindrome.descriptions.setup'),
    match: t('features.algorithms.runtime.pointerLab.palindrome.descriptions.match'),
    mismatch: t('features.algorithms.runtime.pointerLab.palindrome.descriptions.mismatch'),
    converge: t('features.algorithms.runtime.pointerLab.palindrome.descriptions.converge'),
    confirmed: t('features.algorithms.runtime.pointerLab.palindrome.descriptions.confirmed'),
  },
  decisions: {
    probe: t('features.algorithms.runtime.pointerLab.palindrome.decisions.probe'),
    match: t('features.algorithms.runtime.pointerLab.palindrome.decisions.match'),
    mismatch: t('features.algorithms.runtime.pointerLab.palindrome.decisions.mismatch'),
    done: t('features.algorithms.runtime.pointerLab.palindrome.decisions.done'),
  },
  stats: {
    wordLabel: t('features.algorithms.runtime.pointerLab.palindrome.stats.wordLabel'),
    verdictLabel: t('features.algorithms.runtime.pointerLab.palindrome.stats.verdictLabel'),
    verdictPending: t('features.algorithms.runtime.pointerLab.palindrome.stats.verdictPending'),
    verdictPalindrome: t('features.algorithms.runtime.pointerLab.palindrome.stats.verdictPalindrome'),
    verdictNot: t('features.algorithms.runtime.pointerLab.palindrome.stats.verdictNot'),
  },
} as const;

function buildCells(
  chars: readonly string[],
  overrides: Readonly<Record<number, PointerLabCellStatus>>,
): readonly PointerLabCell[] {
  return chars.map((c, index) => ({
    index,
    value: c,
    status: overrides[index] ?? 'idle',
    overlay: null,
  }));
}

function pointers(left: number, right: number): readonly PointerLabPointer[] {
  if (left === right) {
    return [
      { id: 'L', label: 'L', index: left, side: 'top', tone: 'accent' },
      { id: 'R', label: 'R', index: right, side: 'bottom', tone: 'warm' },
    ];
  }
  return [
    { id: 'L', label: 'L', index: left, side: 'top', tone: 'accent' },
    { id: 'R', label: 'R', index: right, side: 'top', tone: 'warm' },
  ];
}

export function* palindromeCheckGenerator(
  scenario: PalindromeCheckScenario,
): Generator<SortStep> {
  const chars = Array.from(scenario.word);
  const mode = I18N.modeLabel;
  const presetLabel = scenario.presetLabel;
  let left = 0;
  let right = chars.length - 1;

  const makeState = (partial: {
    phase: TranslatableText;
    decision: TranslatableText;
    tone: PointerLabTraceState['tone'];
    cells: readonly PointerLabCell[];
    verdict: 'pending' | 'ok' | 'fail';
    iteration: number;
    result: TranslatableText | null;
  }): PointerLabTraceState => ({
    mode: 'palindrome-check',
    modeLabel: mode,
    presetLabel,
    phaseLabel: partial.phase,
    decisionLabel: partial.decision,
    tone: partial.tone,
    cells: partial.cells,
    pointers: pointers(left, right),
    window: null,
    stats: [
      { label: I18N.stats.wordLabel, value: scenario.word, tone: 'info' },
      {
        label: I18N.stats.verdictLabel,
        value:
          partial.verdict === 'ok'
            ? I18N.stats.verdictPalindrome
            : partial.verdict === 'fail'
              ? I18N.stats.verdictNot
              : I18N.stats.verdictPending,
        tone:
          partial.verdict === 'ok' ? 'success' : partial.verdict === 'fail' ? 'danger' : 'info',
      },
    ],
    resultLabel: partial.result,
    iteration: partial.iteration,
  });

  yield createPointerLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { word: scenario.word }),
    state: makeState({
      phase: I18N.phases.setup,
      decision: I18N.decisions.probe,
      tone: 'idle',
      cells: buildCells(chars, { [left]: 'left', [right]: 'right' }),
      verdict: 'pending',
      iteration: 0,
      result: null,
    }),
  });

  let iteration = 0;
  while (left < right) {
    iteration += 1;
    const leftChar = chars[left];
    const rightChar = chars[right];

    if (leftChar === rightChar) {
      yield createPointerLabStep({
        activeCodeLine: 3,
        description: i18nText(I18N.descriptions.match, { left: leftChar, right: rightChar }),
        state: makeState({
          phase: I18N.phases.compare,
          decision: I18N.decisions.match,
          tone: 'compare',
          cells: buildCells(chars, { [left]: 'match', [right]: 'match' }),
          verdict: 'pending',
          iteration,
          result: null,
        }),
      });

      const nextLeft = left + 1;
      const nextRight = right - 1;

      yield createPointerLabStep({
        activeCodeLine: 4,
        description: I18N.descriptions.converge,
        state: makeState({
          phase: I18N.phases.converge,
          decision: I18N.decisions.probe,
          tone: 'settle',
          cells: buildCells(chars, {
            [left]: 'settled',
            [right]: 'settled',
            ...(nextLeft <= nextRight
              ? { [nextLeft]: 'left', [nextRight]: 'right' }
              : {}),
          }),
          verdict: 'pending',
          iteration,
          result: null,
        }),
      });

      left = nextLeft;
      right = nextRight;
    } else {
      yield createPointerLabStep({
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.mismatch, { left: leftChar, right: rightChar }),
        state: makeState({
          phase: I18N.phases.rejected,
          decision: I18N.decisions.mismatch,
          tone: 'complete',
          cells: buildCells(chars, { [left]: 'mismatch', [right]: 'mismatch' }),
          verdict: 'fail',
          iteration,
          result: t('features.algorithms.runtime.pointerLab.palindrome.resultNot'),
        }),
      });
      return;
    }
  }

  // left >= right → palindrome confirmed. Mark everything as match.
  const confirmed: Record<number, PointerLabCellStatus> = {};
  for (let i = 0; i < chars.length; i++) confirmed[i] = 'match';
  yield createPointerLabStep({
    activeCodeLine: 8,
    description: I18N.descriptions.confirmed,
    state: makeState({
      phase: I18N.phases.confirmed,
      decision: I18N.decisions.done,
      tone: 'complete',
      cells: buildCells(chars, confirmed),
      verdict: 'ok',
      iteration,
      result: t('features.algorithms.runtime.pointerLab.palindrome.resultOk'),
    }),
  });
}
