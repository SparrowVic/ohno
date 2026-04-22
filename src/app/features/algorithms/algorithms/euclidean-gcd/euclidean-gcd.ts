import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  NumberLabFormula,
  NumberLabHistoryEntry,
  NumberLabRegister,
  NumberLabTraceState,
} from '../../models/number-lab';
import { SortStep } from '../../models/sort-step';
import { EuclideanGcdScenario } from '../../utils/number-lab-scenarios/number-lab-scenarios';
import { createNumberLabStep } from '../number-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.numberLab.gcd.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.numberLab.gcd.phases.setup'),
    remainder: t('features.algorithms.runtime.numberLab.gcd.phases.remainder'),
    swap: t('features.algorithms.runtime.numberLab.gcd.phases.swap'),
    complete: t('features.algorithms.runtime.numberLab.gcd.phases.complete'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.numberLab.gcd.descriptions.setup'),
    remainder: t('features.algorithms.runtime.numberLab.gcd.descriptions.remainder'),
    swap: t('features.algorithms.runtime.numberLab.gcd.descriptions.swap'),
    complete: t('features.algorithms.runtime.numberLab.gcd.descriptions.complete'),
  },
  decisions: {
    remainder: t('features.algorithms.runtime.numberLab.gcd.decisions.remainder'),
    swap: t('features.algorithms.runtime.numberLab.gcd.decisions.swap'),
    done: t('features.algorithms.runtime.numberLab.gcd.decisions.done'),
  },
  hints: {
    a: t('features.algorithms.runtime.numberLab.gcd.hints.a'),
    b: t('features.algorithms.runtime.numberLab.gcd.hints.b'),
    r: t('features.algorithms.runtime.numberLab.gcd.hints.r'),
  },
} as const;

function buildRegisters(
  a: number,
  b: number,
  r: number | null,
  active: 'a' | 'b' | 'r' | 'none',
): readonly NumberLabRegister[] {
  const regs: NumberLabRegister[] = [
    {
      id: 'a',
      label: 'a',
      value: String(a),
      hint: I18N.hints.a,
      tone: active === 'a' ? 'active' : 'default',
    },
    {
      id: 'b',
      label: 'b',
      value: String(b),
      hint: I18N.hints.b,
      tone: active === 'b' ? 'active' : 'default',
    },
  ];
  if (r !== null) {
    regs.push({
      id: 'r',
      label: 'r',
      value: String(r),
      hint: I18N.hints.r,
      tone: active === 'r' ? 'active' : 'settled',
    });
  }
  return regs;
}

function remainderFormula(a: number, b: number, r: number): NumberLabFormula {
  return {
    lhs: [{ text: 'r', role: 'result' }],
    rhs: [
      { text: String(a), role: 'operand' },
      { text: 'mod', role: 'operator' },
      { text: String(b), role: 'operand' },
      { text: '=', role: 'operator' },
      { text: String(r), role: 'active' },
    ],
  };
}

function historyEntry(step: number, a: number, b: number, current: boolean): NumberLabHistoryEntry {
  return {
    id: `gcd-${step}`,
    label: `#${step}`,
    value: `(${a}, ${b})`,
    isCurrent: current,
  };
}

export function* euclideanGcdGenerator(scenario: EuclideanGcdScenario): Generator<SortStep> {
  let a = Math.max(scenario.a, scenario.b);
  let b = Math.min(scenario.a, scenario.b);
  const presetLabel = scenario.presetLabel;
  const mode = I18N.modeLabel;

  const makeState = (
    partial: Omit<NumberLabTraceState, 'modeLabel' | 'presetLabel'>,
  ): NumberLabTraceState => ({ modeLabel: mode, presetLabel, ...partial });

  const history: NumberLabHistoryEntry[] = [historyEntry(0, a, b, true)];

  yield createNumberLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { a, b }),
    state: makeState({
      phaseLabel: I18N.phases.setup,
      decisionLabel: I18N.decisions.remainder,
      tone: 'idle',
      registers: buildRegisters(a, b, null, 'none'),
      history,
      formula: null,
      resultLabel: null,
      iteration: 0,
    }),
  });

  let step = 0;
  while (b !== 0) {
    step += 1;
    const r = a % b;

    // Compute remainder.
    yield createNumberLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.remainder, { a, b, r }),
      state: makeState({
        phaseLabel: I18N.phases.remainder,
        decisionLabel: I18N.decisions.remainder,
        tone: 'update',
        registers: buildRegisters(a, b, r, 'r'),
        history: history.map((h) => ({ ...h, isCurrent: false })),
        formula: remainderFormula(a, b, r),
        resultLabel: null,
        iteration: step,
      }),
    });

    // Swap: a ← b, b ← r.
    a = b;
    b = r;
    history.push(historyEntry(step, a, b, true));
    const finished = b === 0;

    yield createNumberLabStep({
      activeCodeLine: 4,
      description: finished
        ? i18nText(I18N.descriptions.complete, { gcd: a })
        : i18nText(I18N.descriptions.swap, { a, b }),
      state: makeState({
        phaseLabel: finished ? I18N.phases.complete : I18N.phases.swap,
        decisionLabel: finished ? I18N.decisions.done : I18N.decisions.swap,
        tone: finished ? 'complete' : 'settle',
        registers: buildRegisters(a, b, null, finished ? 'a' : 'none'),
        history: history.map((h, i) => ({ ...h, isCurrent: i === history.length - 1 })),
        formula: null,
        resultLabel: finished
          ? i18nText(t('features.algorithms.runtime.numberLab.gcd.resultFormat'), { gcd: a })
          : null,
        iteration: step,
      }),
    });
  }
}
