import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  NumberLabFormula,
  NumberLabHistoryEntry,
  NumberLabRegister,
  NumberLabTraceState,
} from '../../models/number-lab';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { EuclideanGcdScenario } from '../../utils/number-lab-scenarios/number-lab-scenarios';
import { createNumberLabStep } from '../number-lab-step';
import { withScratchpad } from '../scratchpad-lab-step';

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
  scratchpad: {
    scratchpadModeLabel: t('features.algorithms.runtime.scratchpadLab.gcd.modeLabel'),
    goal: t('features.algorithms.runtime.scratchpadLab.gcd.goal'),
    rule: t('features.algorithms.runtime.scratchpadLab.gcd.rule'),
    invariant: t('features.algorithms.runtime.scratchpadLab.gcd.invariant'),
    firstPair: t('features.algorithms.runtime.scratchpadLab.gcd.firstPair'),
    substitute: t('features.algorithms.runtime.scratchpadLab.gcd.substitute'),
    remainderAnnotation: t(
      'features.algorithms.runtime.scratchpadLab.gcd.remainderAnnotation',
    ),
    remainderInstruction: t(
      'features.algorithms.runtime.scratchpadLab.gcd.remainderInstruction',
    ),
    bZeroDecision: t('features.algorithms.runtime.scratchpadLab.gcd.bZeroDecision'),
    bNonZeroHint: t('features.algorithms.runtime.scratchpadLab.gcd.bNonZeroHint'),
    resultLine: t('features.algorithms.runtime.scratchpadLab.gcd.resultLine'),
    resultSignoff: t('features.algorithms.runtime.scratchpadLab.gcd.resultSignoff'),
    captions: {
      setup: t('features.algorithms.runtime.scratchpadLab.gcd.captions.setup'),
      substitute: t('features.algorithms.runtime.scratchpadLab.gcd.captions.substitute'),
      decision: t('features.algorithms.runtime.scratchpadLab.gcd.captions.decision'),
      result: t('features.algorithms.runtime.scratchpadLab.gcd.captions.result'),
    },
    phases: {
      setup: t('features.algorithms.runtime.scratchpadLab.gcd.phases.setup'),
      compute: t('features.algorithms.runtime.scratchpadLab.gcd.phases.compute'),
      substitute: t('features.algorithms.runtime.scratchpadLab.gcd.phases.substitute'),
      decide: t('features.algorithms.runtime.scratchpadLab.gcd.phases.decide'),
      complete: t('features.algorithms.runtime.scratchpadLab.gcd.phases.complete'),
    },
    decisions: {
      settingUp: t('features.algorithms.runtime.scratchpadLab.gcd.decisions.settingUp'),
      computing: t('features.algorithms.runtime.scratchpadLab.gcd.decisions.computing'),
      substituting: t('features.algorithms.runtime.scratchpadLab.gcd.decisions.substituting'),
      bIsZero: t('features.algorithms.runtime.scratchpadLab.gcd.decisions.bIsZero'),
      complete: t('features.algorithms.runtime.scratchpadLab.gcd.decisions.complete'),
    },
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

/** Structured builder for scratchpad lines. Starting with the setup
 *  preamble; substitute lines are appended one-per-iteration so
 *  students see the derivation grow line by line. */
type LineBuilder = {
  readonly id: string;
  readonly kind: ScratchpadLine['kind'];
  readonly indent: number;
  readonly marker: string | null;
  readonly caption: ScratchpadLine['caption'];
  readonly content: ScratchpadLine['content'];
  readonly instruction: ScratchpadLine['instruction'];
  readonly annotation: ScratchpadLine['annotation'];
};

/* Section-level markers, shared vocabulary with extended-euclidean:
 *    ①   — phase start (the initial pair)
 *    ⟹  — "therefore" (loop condition met, stop — logical consequence,
 *          not a new phase, so we reuse the arrow EEA uses to announce
 *          "gcd = last remainder" rather than giving this line a second
 *          ordinal)
 *    ✓   — final answer
 *  Keeping the same glyphs with the same meanings across the number-
 *  theory family means students don't relearn the alphabet each time. */
const SECTION_MARKERS = {
  start: '①',
  decision: '⟹',
  result: '✓',
} as const;

export function* euclideanGcdGenerator(scenario: EuclideanGcdScenario): Generator<SortStep> {
  let a = Math.max(scenario.a, scenario.b);
  let b = Math.min(scenario.a, scenario.b);
  const originalA = a;
  const originalB = b;
  const presetLabel = scenario.presetLabel;
  const mode = I18N.modeLabel;

  const makeNumberLabState = (
    partial: Omit<NumberLabTraceState, 'modeLabel' | 'presetLabel'>,
  ): NumberLabTraceState => ({ modeLabel: mode, presetLabel, ...partial });

  const history: NumberLabHistoryEntry[] = [historyEntry(0, a, b, true)];

  // ------------ Scratchpad state ------------
  // Lines accumulate across steps; we just change which one is "current".
  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      content: i18nText(I18N.scratchpad.goal, { a, b }),
      instruction: null,
      annotation: null,
    },
    {
      id: 'divider-pre',
      kind: 'divider',
      indent: 0,
      marker: null,
      caption: null,
      content: '',
      instruction: null,
      annotation: null,
    },
    {
      id: 'rule',
      kind: 'note',
      indent: 0,
      marker: null,
      caption: null,
      content: I18N.scratchpad.rule,
      instruction: null,
      annotation: null,
    },
    {
      id: 'divider-post',
      kind: 'divider',
      indent: 0,
      marker: null,
      caption: null,
      content: '',
      instruction: null,
      annotation: null,
    },
    {
      id: 'pair-0',
      kind: 'equation',
      indent: 0,
      marker: SECTION_MARKERS.start,
      caption: I18N.scratchpad.captions.setup,
      content: i18nText(I18N.scratchpad.firstPair, { a, b }),
      instruction: null,
      annotation: null,
    },
  ];

  const globalInvariant: ScratchpadMargin = {
    id: 'invariant',
    anchorLineId: null,
    text: I18N.scratchpad.invariant,
    tone: 'invariant',
  };

  /** Build the final scratchpad line list, with the newest non-divider
   *  line marked `current` and earlier lines `settled`. Margin array
   *  may include a transient margin anchored to the currently-active
   *  pair line while the remainder is being computed. */
  function snapshot(opts: {
    readonly phase: ScratchpadLabTraceState['phaseLabel'];
    readonly decision: ScratchpadLabTraceState['decisionLabel'];
    readonly tone: ScratchpadLabTraceState['tone'];
    readonly iteration: number;
    readonly resultLabel: ScratchpadLabTraceState['resultLabel'];
    readonly currentLineId: string;
    readonly transientMargin: ScratchpadMargin | null;
  }): ScratchpadLabTraceState {
    const currentIdx = lineBuilders.findIndex((l) => l.id === opts.currentLineId);
    const lines: ScratchpadLine[] = lineBuilders.map((builder, index) => {
      const isCurrent = index === currentIdx;
      const state: ScratchpadLineState = isCurrent ? 'current' : 'settled';
      return {
        id: builder.id,
        kind: builder.kind,
        indent: builder.indent,
        marker: builder.marker,
        caption: builder.caption,
        content: builder.content,
        instruction: builder.instruction,
        annotation: builder.annotation,
        state,
      };
    });

    const margins: ScratchpadMargin[] = [globalInvariant];
    if (opts.transientMargin) margins.push(opts.transientMargin);

    return {
      mode: 'euclidean-gcd',
      modeLabel: I18N.scratchpad.scratchpadModeLabel,
      phaseLabel: opts.phase,
      decisionLabel: opts.decision,
      presetLabel,
      tone: opts.tone,
      lines,
      margins,
      resultLabel: opts.resultLabel,
      iteration: opts.iteration,
    };
  }

  // ------------ Step 0: setup ------------
  yield withScratchpad(
    createNumberLabStep({
      activeCodeLine: 1,
      description: i18nText(I18N.descriptions.setup, { a, b }),
      state: makeNumberLabState({
        phaseLabel: I18N.phases.setup,
        decisionLabel: I18N.decisions.remainder,
        tone: 'idle',
        registers: buildRegisters(a, b, null, 'none'),
        history,
        formula: null,
        resultLabel: null,
        iteration: 0,
      }),
    }),
    snapshot({
      phase: I18N.scratchpad.phases.setup,
      decision: I18N.scratchpad.decisions.settingUp,
      tone: 'setup',
      iteration: 0,
      resultLabel: null,
      currentLineId: 'pair-0',
      transientMargin: null,
    }),
  );

  let step = 0;
  while (b !== 0) {
    step += 1;
    const r = a % b;
    const pairLineId = `pair-${step - 1}`;
    const substituteLineId = `sub-${step}`;

    // ---- Remainder compute ----
    // Scratchpad pauses on the current pair line and shows a sticky
    // "→ Policz a mod b" chip on the margin as an "upcoming operation"
    // preview. At the swap step the same instruction migrates onto the
    // new substitute line as a persistent chip, so the tag never
    // disappears — the student always sees *what* produced each line.
    const upcomingInstructionMargin: ScratchpadMargin = {
      id: `upcoming-${step}`,
      anchorLineId: pairLineId,
      text: i18nText(I18N.scratchpad.remainderInstruction, { a, b }),
      tone: 'hint',
    };

    yield withScratchpad(
      createNumberLabStep({
        activeCodeLine: 3,
        description: i18nText(I18N.descriptions.remainder, { a, b, r }),
        state: makeNumberLabState({
          phaseLabel: I18N.phases.remainder,
          decisionLabel: I18N.decisions.remainder,
          tone: 'update',
          registers: buildRegisters(a, b, r, 'r'),
          history: history.map((h) => ({ ...h, isCurrent: false })),
          formula: remainderFormula(a, b, r),
          resultLabel: null,
          iteration: step,
        }),
      }),
      snapshot({
        phase: I18N.scratchpad.phases.compute,
        decision: I18N.scratchpad.decisions.computing,
        tone: 'compute',
        iteration: step,
        resultLabel: null,
        currentLineId: pairLineId,
        transientMargin: upcomingInstructionMargin,
      }),
    );

    // ---- Swap: append the substitute line revealing the new pair ----
    const prevA = a;
    const prevB = b;
    a = b;
    b = r;
    history.push(historyEntry(step, a, b, true));
    const finished = b === 0;

    // The imperative "→ Policz a mod b" chip only makes sense while the
    // operation is pending (carried as a transient margin above, anchored
    // to the pair line). Once we emit the substitute line the operation
    // is already done, so we keep only the annotation ("a mod b = r")
    // as a record of what produced the line. No persistent instruction.
    lineBuilders.push({
      id: substituteLineId,
      kind: 'substitute',
      // Indented one step in — substitutes are a nested block inside
      // the pair-0 header, the way nested code reads as a sub-scope.
      // Gives the classic "hanging = under the previous line" shape.
      indent: 1,
      marker: null,
      caption: I18N.scratchpad.captions.substitute,
      content: i18nText(I18N.scratchpad.substitute, { a, b }),
      instruction: null,
      annotation: i18nText(I18N.scratchpad.remainderAnnotation, { prevA, prevB, r }),
    });

    if (finished) {
      // Append decision + result lines in the same step so the student
      // sees the concluding beat as a single coherent block.
      lineBuilders.push({
        id: 'decision',
        kind: 'decision',
        indent: 0,
        marker: SECTION_MARKERS.decision,
        caption: I18N.scratchpad.captions.decision,
        content: i18nText(I18N.scratchpad.bZeroDecision, { a }),
        instruction: null,
        annotation: null,
      });
      lineBuilders.push({
        id: 'result-line',
        kind: 'result',
        // Result box sits a half-step in, same as the final `= 12`
        // textbook style where the punchline is set off from the
        // preceding reasoning but doesn't stray as deep as the
        // cascading substitutes.
        indent: 0.6,
        marker: '✓',
        caption: I18N.scratchpad.captions.result,
        content: i18nText(I18N.scratchpad.resultLine, { gcd: a }),
        instruction: null,
        annotation: null,
      });

      yield withScratchpad(
        createNumberLabStep({
          activeCodeLine: 4,
          description: i18nText(I18N.descriptions.complete, { gcd: a }),
          state: makeNumberLabState({
            phaseLabel: I18N.phases.complete,
            decisionLabel: I18N.decisions.done,
            tone: 'complete',
            registers: buildRegisters(a, b, null, 'a'),
            history: history.map((h, i) => ({ ...h, isCurrent: i === history.length - 1 })),
            formula: null,
            resultLabel: i18nText(
              t('features.algorithms.runtime.numberLab.gcd.resultFormat'),
              { gcd: a },
            ),
            iteration: step,
          }),
        }),
        snapshot({
          phase: I18N.scratchpad.phases.complete,
          decision: I18N.scratchpad.decisions.complete,
          tone: 'complete',
          iteration: step,
          resultLabel: i18nText(I18N.scratchpad.resultSignoff, {
            a: originalA,
            b: originalB,
            gcd: a,
          }),
          currentLineId: 'result-line',
          transientMargin: null,
        }),
      );
    } else {
      yield withScratchpad(
        createNumberLabStep({
          activeCodeLine: 4,
          description: i18nText(I18N.descriptions.swap, { a, b }),
          state: makeNumberLabState({
            phaseLabel: I18N.phases.swap,
            decisionLabel: I18N.decisions.swap,
            tone: 'settle',
            registers: buildRegisters(a, b, null, 'none'),
            history: history.map((h, i) => ({ ...h, isCurrent: i === history.length - 1 })),
            formula: null,
            resultLabel: null,
            iteration: step,
          }),
        }),
        snapshot({
          phase: I18N.scratchpad.phases.substitute,
          decision: I18N.scratchpad.decisions.substituting,
          tone: 'substitute',
          iteration: step,
          resultLabel: null,
          currentLineId: substituteLineId,
          transientMargin: null,
        }),
      );
    }
  }
}
