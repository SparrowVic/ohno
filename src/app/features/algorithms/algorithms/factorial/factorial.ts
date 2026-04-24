import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  NumberLabFormula,
  NumberLabHistoryEntry,
  NumberLabRegister,
  NumberLabTraceState,
} from '../../models/number-lab';
import { SortStep } from '../../models/sort-step';
import { FactorialScenario } from '../../utils/scenarios/number-lab/number-lab-scenarios';
import { createNumberLabStep } from '../number-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.numberLab.factorial.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.numberLab.factorial.phases.setup'),
    multiply: t('features.algorithms.runtime.numberLab.factorial.phases.multiply'),
    advance: t('features.algorithms.runtime.numberLab.factorial.phases.advance'),
    complete: t('features.algorithms.runtime.numberLab.factorial.phases.complete'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.numberLab.factorial.descriptions.setup'),
    multiply: t('features.algorithms.runtime.numberLab.factorial.descriptions.multiply'),
    advance: t('features.algorithms.runtime.numberLab.factorial.descriptions.advance'),
    complete: t('features.algorithms.runtime.numberLab.factorial.descriptions.complete'),
    zero: t('features.algorithms.runtime.numberLab.factorial.descriptions.zero'),
  },
  decisions: {
    multiply: t('features.algorithms.runtime.numberLab.factorial.decisions.multiply'),
    advance: t('features.algorithms.runtime.numberLab.factorial.decisions.advance'),
    done: t('features.algorithms.runtime.numberLab.factorial.decisions.done'),
    zero: t('features.algorithms.runtime.numberLab.factorial.decisions.zero'),
  },
  hints: {
    product: t('features.algorithms.runtime.numberLab.factorial.hints.product'),
    counter: t('features.algorithms.runtime.numberLab.factorial.hints.counter'),
  },
} as const;

function historyEntry(k: number, value: number, current: boolean): NumberLabHistoryEntry {
  return { id: `fact-${k}`, label: `${k}!`, value: String(value), isCurrent: current };
}

function buildRegisters(
  k: number,
  product: number,
  n: number,
  activeRole: 'k' | 'product' | 'none',
): readonly NumberLabRegister[] {
  return [
    {
      id: 'k',
      label: 'i',
      value: String(k),
      hint: I18N.hints.counter,
      tone: activeRole === 'k' ? 'active' : 'default',
    },
    {
      id: 'product',
      label: 'acc',
      value: String(product),
      hint: I18N.hints.product,
      tone: activeRole === 'product' ? 'active' : 'settled',
    },
    {
      id: 'n',
      label: 'n',
      value: String(n),
      hint: null,
      tone: 'muted',
    },
  ];
}

function multiplyFormula(k: number, prevProduct: number, product: number): NumberLabFormula {
  return {
    lhs: [{ text: 'acc', role: 'result' }],
    rhs: [
      { text: String(prevProduct), role: 'operand' },
      { text: '×', role: 'operator' },
      { text: String(k), role: 'operand' },
      { text: '=', role: 'operator' },
      { text: String(product), role: 'active' },
    ],
  };
}

export function* factorialGenerator(scenario: FactorialScenario): Generator<SortStep> {
  const { n, presetLabel } = scenario;
  const mode = I18N.modeLabel;

  const makeState = (partial: Omit<NumberLabTraceState, 'modeLabel' | 'presetLabel'>): NumberLabTraceState => ({
    modeLabel: mode,
    presetLabel,
    ...partial,
  });

  yield createNumberLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { n }),
    state: makeState({
      phaseLabel: I18N.phases.setup,
      decisionLabel: n === 0 ? I18N.decisions.zero : I18N.decisions.multiply,
      tone: 'idle',
      registers: buildRegisters(n === 0 ? 0 : 1, 1, n, 'product'),
      history: [historyEntry(0, 1, false)],
      formula: null,
      resultLabel: null,
      iteration: 0,
    }),
  });

  if (n === 0) {
    yield createNumberLabStep({
      activeCodeLine: 2,
      description: I18N.descriptions.zero,
      state: makeState({
        phaseLabel: I18N.phases.complete,
        decisionLabel: I18N.decisions.done,
        tone: 'complete',
        registers: buildRegisters(0, 1, 0, 'product'),
        history: [historyEntry(0, 1, true)],
        formula: null,
        resultLabel: i18nText(t('features.algorithms.runtime.numberLab.factorial.resultFormat'), {
          n: 0,
          value: 1,
        }),
        iteration: 0,
      }),
    });
    return;
  }

  let product = 1;
  const history: NumberLabHistoryEntry[] = [historyEntry(0, 1, false)];

  for (let k = 1; k <= n; k++) {
    const prevProduct = product;
    product = product * k;

    yield createNumberLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.multiply, { k, prev: prevProduct, product }),
      state: makeState({
        phaseLabel: I18N.phases.multiply,
        decisionLabel: I18N.decisions.multiply,
        tone: 'update',
        registers: buildRegisters(k, product, n, 'product'),
        history: history.map((h) => ({ ...h, isCurrent: false })),
        formula: multiplyFormula(k, prevProduct, product),
        resultLabel: null,
        iteration: k,
      }),
    });

    history.push(historyEntry(k, product, true));
    const settledHistory = history.map((h, i) => ({ ...h, isCurrent: i === history.length - 1 }));
    const isLast = k === n;

    yield createNumberLabStep({
      activeCodeLine: 5,
      description: isLast
        ? i18nText(I18N.descriptions.complete, { n, value: product })
        : i18nText(I18N.descriptions.advance, { k }),
      state: makeState({
        phaseLabel: isLast ? I18N.phases.complete : I18N.phases.advance,
        decisionLabel: isLast ? I18N.decisions.done : I18N.decisions.advance,
        tone: isLast ? 'complete' : 'settle',
        registers: buildRegisters(k, product, n, 'product'),
        history: settledHistory,
        formula: null,
        resultLabel: isLast
          ? i18nText(t('features.algorithms.runtime.numberLab.factorial.resultFormat'), {
              n,
              value: product,
            })
          : null,
        iteration: k,
      }),
    });
  }
}
