import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  CallStackFrame,
  CallStackFrameLocal,
  CallStackFramePhase,
  CallStackLabTraceState,
  CallStackReturnedFrame,
  CallStackStat,
} from '../../models/call-stack-lab';
import { SortStep } from '../../models/sort-step';
import { RecursiveFibonacciScenario } from '../../utils/call-stack-lab-scenarios/call-stack-lab-scenarios';
import { createCallStackLabStep } from '../call-stack-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.modeLabel'),
  resultFormat: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.resultFormat'),
  phases: {
    enter: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.phases.enter'),
    base: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.phases.base'),
    descendLeft: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.phases.descendLeft'),
    descendRight: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.phases.descendRight'),
    combine: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.phases.combine'),
    return: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.phases.return'),
    complete: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.phases.complete'),
  },
  descriptions: {
    enter: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.enter'),
    base: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.base'),
    callLeft: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.callLeft'),
    gotLeft: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.gotLeft'),
    callRight: t(
      'features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.callRight',
    ),
    gotRight: t(
      'features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.gotRight',
    ),
    combine: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.combine'),
    returnBase: t(
      'features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.returnBase',
    ),
    return: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.return'),
    complete: t(
      'features.algorithms.runtime.callStackLab.recursiveFibonacci.descriptions.complete',
    ),
  },
  decisions: {
    push: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.decisions.push'),
    base: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.decisions.base'),
    leftDone: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.decisions.leftDone'),
    rightDone: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.decisions.rightDone'),
    bothDone: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.decisions.bothDone'),
    pop: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.decisions.pop'),
    done: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.decisions.done'),
  },
  stats: {
    calls: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.stats.calls'),
    depth: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.stats.depth'),
    maxDepth: t('features.algorithms.runtime.callStackLab.recursiveFibonacci.stats.maxDepth'),
  },
} as const;

/** Internal model — each time we "enter" a call we push one; when it
 *  returns, we pop. The visualization reads phase + locals from here. */
type FrameModel = {
  id: string;
  n: number;
  depth: number;
  left: number | null;
  right: number | null;
  phase: CallStackFramePhase;
};

function locals(model: FrameModel): readonly CallStackFrameLocal[] {
  const out: CallStackFrameLocal[] = [
    { label: 'n', value: String(model.n), tone: 'arg' },
  ];
  if (model.left !== null) {
    out.push({ label: 'left', value: String(model.left), tone: 'result' });
  }
  if (model.right !== null) {
    out.push({ label: 'right', value: String(model.right), tone: 'result' });
  }
  return out;
}

function toFrame(model: FrameModel, returnValue: number | null): CallStackFrame {
  return {
    id: model.id,
    title: `fib(${model.n})`,
    subtitle: null,
    locals: locals(model),
    depth: model.depth,
    phase: model.phase,
    returnValue: returnValue !== null ? String(returnValue) : null,
  };
}

export function* recursionCallStackGenerator(
  scenario: RecursiveFibonacciScenario,
): Generator<SortStep> {
  const targetN = scenario.n;
  const mode = I18N.modeLabel;
  const presetLabel = scenario.presetLabel;

  const stack: FrameModel[] = [];
  const returns: CallStackReturnedFrame[] = [];
  let idSeq = 0;
  let totalCalls = 0;
  let maxDepth = 0;
  let iteration = 0;

  const makeState = (partial: {
    phaseLabel: CallStackLabTraceState['phaseLabel'];
    decisionLabel: CallStackLabTraceState['decisionLabel'];
    tone: CallStackLabTraceState['tone'];
    transientReturn?: { frameId: string; value: number } | null;
    resultLabel: CallStackLabTraceState['resultLabel'];
  }): CallStackLabTraceState => {
    const frames = stack.map((m) => {
      const transient = partial.transientReturn;
      const retValue = transient && transient.frameId === m.id ? transient.value : null;
      return toFrame(m, retValue);
    });
    const stats: CallStackStat[] = [
      { label: I18N.stats.calls, value: String(totalCalls), tone: 'accent' },
      { label: I18N.stats.depth, value: String(stack.length), tone: 'info' },
      { label: I18N.stats.maxDepth, value: String(maxDepth), tone: 'warning' },
    ];
    return {
      mode: 'recursion-call-stack',
      modeLabel: mode,
      presetLabel,
      phaseLabel: partial.phaseLabel,
      decisionLabel: partial.decisionLabel,
      tone: partial.tone,
      frames,
      edges: [],
      recentReturns: returns.slice(0, 6),
      stats,
      resultLabel: partial.resultLabel,
      iteration,
    };
  };

  function pushFrame(n: number, depth: number): FrameModel {
    totalCalls++;
    if (depth + 1 > maxDepth) maxDepth = depth + 1;
    const frame: FrameModel = {
      id: `frame-${idSeq++}`,
      n,
      depth,
      left: null,
      right: null,
      phase: 'entering',
    };
    stack.push(frame);
    return frame;
  }

  function popFrame(value: number): void {
    const frame = stack.pop();
    if (!frame) return;
    returns.unshift({
      id: frame.id,
      title: `fib(${frame.n})`,
      returnValue: String(value),
      age: 0,
    });
    for (let i = 0; i < returns.length; i++) {
      returns[i] = { ...returns[i], age: i };
    }
    if (returns.length > 6) returns.length = 6;
  }

  function setActive(phase: CallStackFramePhase): void {
    if (stack.length > 0) stack[stack.length - 1].phase = phase;
  }

  /** Recursive driver that yields SortSteps for each transition. */
  function* run(n: number, depth: number): Generator<SortStep, number> {
    const frame = pushFrame(n, depth);
    iteration++;
    yield createCallStackLabStep({
      activeCodeLine: 1,
      description: i18nText(I18N.descriptions.enter, { n }),
      state: makeState({
        phaseLabel: I18N.phases.enter,
        decisionLabel: I18N.decisions.push,
        tone: 'descend',
        resultLabel: null,
      }),
    });

    // ---------- Base case ----------
    if (n <= 1) {
      setActive('returning');
      iteration++;
      yield createCallStackLabStep({
        activeCodeLine: 1,
        description: i18nText(I18N.descriptions.returnBase, { n, value: n }),
        state: makeState({
          phaseLabel: I18N.phases.base,
          decisionLabel: I18N.decisions.base,
          tone: 'return',
          transientReturn: { frameId: frame.id, value: n },
          resultLabel: null,
        }),
      });
      popFrame(n);
      return n;
    }

    // ---------- Descend LEFT ----------
    setActive('descending-left');
    iteration++;
    yield createCallStackLabStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.callLeft, { n, k: n - 1 }),
      state: makeState({
        phaseLabel: I18N.phases.descendLeft,
        decisionLabel: I18N.decisions.push,
        tone: 'descend',
        resultLabel: null,
      }),
    });

    const leftValue = yield* run(n - 1, depth + 1);
    frame.left = leftValue;
    setActive('combining');
    iteration++;
    yield createCallStackLabStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.gotLeft, { n, value: leftValue }),
      state: makeState({
        phaseLabel: I18N.phases.combine,
        decisionLabel: I18N.decisions.leftDone,
        tone: 'combine',
        resultLabel: null,
      }),
    });

    // ---------- Descend RIGHT ----------
    setActive('descending-right');
    iteration++;
    yield createCallStackLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.callRight, { n, k: n - 2 }),
      state: makeState({
        phaseLabel: I18N.phases.descendRight,
        decisionLabel: I18N.decisions.push,
        tone: 'descend',
        resultLabel: null,
      }),
    });

    const rightValue = yield* run(n - 2, depth + 1);
    frame.right = rightValue;
    setActive('combining');
    iteration++;
    yield createCallStackLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.gotRight, { n, value: rightValue }),
      state: makeState({
        phaseLabel: I18N.phases.combine,
        decisionLabel: I18N.decisions.rightDone,
        tone: 'combine',
        resultLabel: null,
      }),
    });

    // ---------- Combine + return ----------
    const result = leftValue + rightValue;
    setActive('combining');
    iteration++;
    yield createCallStackLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.combine, {
        n,
        left: leftValue,
        right: rightValue,
        value: result,
      }),
      state: makeState({
        phaseLabel: I18N.phases.combine,
        decisionLabel: I18N.decisions.bothDone,
        tone: 'combine',
        resultLabel: null,
      }),
    });

    setActive('returning');
    iteration++;
    yield createCallStackLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.return, { n, value: result }),
      state: makeState({
        phaseLabel: I18N.phases.return,
        decisionLabel: I18N.decisions.pop,
        tone: 'return',
        transientReturn: { frameId: frame.id, value: result },
        resultLabel: null,
      }),
    });

    popFrame(result);
    return result;
  }

  // ---------- Outer driver ----------
  const final = yield* run(targetN, 0);

  iteration++;
  yield createCallStackLabStep({
    activeCodeLine: 4,
    description: i18nText(I18N.descriptions.complete, { n: targetN, value: final }),
    state: makeState({
      phaseLabel: I18N.phases.complete,
      decisionLabel: I18N.decisions.done,
      tone: 'complete',
      resultLabel: i18nText(I18N.resultFormat, { n: targetN, value: final }),
    }),
  });
}
