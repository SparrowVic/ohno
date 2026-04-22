import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  NumberLabFormula,
  NumberLabHistoryEntry,
  NumberLabRegister,
  NumberLabTraceState,
} from '../../models/number-lab';
import { SortStep } from '../../models/sort-step';
import { FibonacciScenario } from '../../utils/number-lab-scenarios/number-lab-scenarios';
import { createNumberLabStep } from '../number-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.numberLab.fibonacci.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.numberLab.fibonacci.phases.setup'),
    base: t('features.algorithms.runtime.numberLab.fibonacci.phases.base'),
    emit: t('features.algorithms.runtime.numberLab.fibonacci.phases.emit'),
    advance: t('features.algorithms.runtime.numberLab.fibonacci.phases.advance'),
    complete: t('features.algorithms.runtime.numberLab.fibonacci.phases.complete'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.numberLab.fibonacci.descriptions.setup'),
    baseF0: t('features.algorithms.runtime.numberLab.fibonacci.descriptions.baseF0'),
    baseF1: t('features.algorithms.runtime.numberLab.fibonacci.descriptions.baseF1'),
    emit: t('features.algorithms.runtime.numberLab.fibonacci.descriptions.emit'),
    advance: t('features.algorithms.runtime.numberLab.fibonacci.descriptions.advance'),
    complete: t('features.algorithms.runtime.numberLab.fibonacci.descriptions.complete'),
  },
  decisions: {
    baseCase: t('features.algorithms.runtime.numberLab.fibonacci.decisions.baseCase'),
    sumPrev: t('features.algorithms.runtime.numberLab.fibonacci.decisions.sumPrev'),
    advance: t('features.algorithms.runtime.numberLab.fibonacci.decisions.advance'),
    done: t('features.algorithms.runtime.numberLab.fibonacci.decisions.done'),
  },
  registers: {
    prev: t('features.algorithms.runtime.numberLab.fibonacci.registers.prev'),
    curr: t('features.algorithms.runtime.numberLab.fibonacci.registers.curr'),
    next: t('features.algorithms.runtime.numberLab.fibonacci.registers.next'),
    n: t('features.algorithms.runtime.numberLab.fibonacci.registers.n'),
  },
  hints: {
    rollWindow: t('features.algorithms.runtime.numberLab.fibonacci.hints.rollWindow'),
    nextSum: t('features.algorithms.runtime.numberLab.fibonacci.hints.nextSum'),
    terminal: t('features.algorithms.runtime.numberLab.fibonacci.hints.terminal'),
  },
} as const;

function historyEntry(index: number, value: number, current: boolean): NumberLabHistoryEntry {
  return {
    id: `F-${index}`,
    label: `F(${index})`,
    value: String(value),
    isCurrent: current,
  };
}

function buildRegisters(
  prev: number,
  curr: number,
  n: number,
  activeRole: 'prev' | 'curr' | 'next' | 'none',
  next: number | null,
): readonly NumberLabRegister[] {
  const regs: NumberLabRegister[] = [
    {
      id: 'prev',
      label: 'Fₙ₋₁',
      value: String(prev),
      hint: activeRole === 'prev' ? I18N.hints.rollWindow : null,
      tone: activeRole === 'prev' ? 'active' : 'default',
    },
    {
      id: 'curr',
      label: 'Fₙ',
      value: String(curr),
      hint: activeRole === 'curr' ? I18N.hints.rollWindow : null,
      tone: activeRole === 'curr' ? 'active' : 'default',
    },
  ];
  if (next !== null) {
    regs.push({
      id: 'next',
      label: 'Fₙ₊₁',
      value: String(next),
      hint: activeRole === 'next' ? I18N.hints.nextSum : null,
      tone: activeRole === 'next' ? 'active' : 'settled',
    });
  }
  regs.push({
    id: 'n',
    label: I18N.registers.n,
    value: String(n),
    hint: I18N.hints.terminal,
    tone: 'muted',
  });
  return regs;
}

function sumFormula(prev: number, curr: number, sum: number): NumberLabFormula {
  return {
    lhs: [{ text: 'Fₙ₊₁', role: 'result' }],
    rhs: [
      { text: String(curr), role: 'operand' },
      { text: '+', role: 'operator' },
      { text: String(prev), role: 'operand' },
      { text: '=', role: 'operator' },
      { text: String(sum), role: 'active' },
    ],
  };
}

export function* fibonacciIterativeGenerator(scenario: FibonacciScenario): Generator<SortStep> {
  const { n, presetLabel } = scenario;
  const mode = I18N.modeLabel;

  const makeState = (partial: {
    phaseLabel: NumberLabTraceState['phaseLabel'];
    decisionLabel: NumberLabTraceState['decisionLabel'];
    tone: NumberLabTraceState['tone'];
    registers: NumberLabTraceState['registers'];
    history: NumberLabTraceState['history'];
    formula: NumberLabFormula | null;
    resultLabel: NumberLabTraceState['resultLabel'];
    iteration: number;
  }): NumberLabTraceState => ({
    modeLabel: mode,
    presetLabel,
    ...partial,
  });

  // Setup — no registers yet, just the goal.
  yield createNumberLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { n }),
    state: makeState({
      phaseLabel: I18N.phases.setup,
      decisionLabel: I18N.decisions.baseCase,
      tone: 'idle',
      registers: [
        {
          id: 'n',
          label: I18N.registers.n,
          value: String(n),
          hint: I18N.hints.terminal,
          tone: 'active',
        },
      ],
      history: [],
      formula: null,
      resultLabel: null,
      iteration: 0,
    }),
  });

  if (n === 0) {
    yield createNumberLabStep({
      activeCodeLine: 2,
      description: I18N.descriptions.baseF0,
      state: makeState({
        phaseLabel: I18N.phases.complete,
        decisionLabel: I18N.decisions.done,
        tone: 'complete',
        registers: buildRegisters(0, 0, 0, 'curr', null),
        history: [historyEntry(0, 0, true)],
        formula: null,
        resultLabel: i18nText(
          t('features.algorithms.runtime.numberLab.fibonacci.resultFormat'),
          { n, value: 0 },
        ),
        iteration: 0,
      }),
    });
    return;
  }

  let prev = 0;
  let curr = 1;
  const history: NumberLabHistoryEntry[] = [
    historyEntry(0, 0, false),
  ];

  // Emit F(0) = 0.
  yield createNumberLabStep({
    activeCodeLine: 2,
    description: I18N.descriptions.baseF0,
    state: makeState({
      phaseLabel: I18N.phases.base,
      decisionLabel: I18N.decisions.baseCase,
      tone: 'emit',
      registers: buildRegisters(prev, curr, n, 'prev', null),
      history: [historyEntry(0, 0, true)],
      formula: null,
      resultLabel: null,
      iteration: 0,
    }),
  });

  if (n === 1) {
    history.push(historyEntry(1, 1, true));
    yield createNumberLabStep({
      activeCodeLine: 3,
      description: I18N.descriptions.baseF1,
      state: makeState({
        phaseLabel: I18N.phases.complete,
        decisionLabel: I18N.decisions.done,
        tone: 'complete',
        registers: buildRegisters(prev, curr, n, 'curr', null),
        history,
        formula: null,
        resultLabel: i18nText(
          t('features.algorithms.runtime.numberLab.fibonacci.resultFormat'),
          { n: 1, value: 1 },
        ),
        iteration: 1,
      }),
    });
    return;
  }

  // Emit F(1) = 1.
  history.push(historyEntry(1, 1, true));
  yield createNumberLabStep({
    activeCodeLine: 3,
    description: I18N.descriptions.baseF1,
    state: makeState({
      phaseLabel: I18N.phases.base,
      decisionLabel: I18N.decisions.baseCase,
      tone: 'emit',
      registers: buildRegisters(prev, curr, n, 'curr', null),
      history: history.map((h) => ({ ...h, isCurrent: h.id === 'F-1' })),
      formula: null,
      resultLabel: null,
      iteration: 1,
    }),
  });

  for (let i = 2; i <= n; i++) {
    const next = prev + curr;

    // Show the sum formula — new value is being computed.
    yield createNumberLabStep({
      activeCodeLine: 6,
      description: i18nText(I18N.descriptions.emit, { index: i, prev, curr, next }),
      state: makeState({
        phaseLabel: I18N.phases.emit,
        decisionLabel: I18N.decisions.sumPrev,
        tone: 'update',
        registers: buildRegisters(prev, curr, n, 'next', next),
        history: history.map((h) => ({ ...h, isCurrent: false })),
        formula: sumFormula(prev, curr, next),
        resultLabel: null,
        iteration: i,
      }),
    });

    // Commit to history — pulse the new chip.
    history.push(historyEntry(i, next, true));
    const settledHistory = history.map((h, idx) => ({
      ...h,
      isCurrent: idx === history.length - 1,
    }));

    // Roll the window — prev ← curr, curr ← next.
    prev = curr;
    curr = next;

    const isLast = i === n;
    yield createNumberLabStep({
      activeCodeLine: 8,
      description: isLast
        ? i18nText(I18N.descriptions.complete, { n, value: curr })
        : i18nText(I18N.descriptions.advance, { index: i }),
      state: makeState({
        phaseLabel: isLast ? I18N.phases.complete : I18N.phases.advance,
        decisionLabel: isLast ? I18N.decisions.done : I18N.decisions.advance,
        tone: isLast ? 'complete' : 'settle',
        registers: buildRegisters(prev, curr, n, isLast ? 'curr' : 'curr', null),
        history: settledHistory,
        formula: null,
        resultLabel: isLast
          ? i18nText(t('features.algorithms.runtime.numberLab.fibonacci.resultFormat'), {
              n,
              value: curr,
            })
          : null,
        iteration: i,
      }),
    });
  }
}
