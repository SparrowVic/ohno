import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { ExtendedEuclideanScenario } from '../../utils/scenarios/number-lab/extended-euclidean-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

/**
 * Extended Euclidean — finds integers s, t satisfying Bézout's
 * identity `s·a + t·b = gcd(a, b)` by running the classic Euclidean
 * division chain forwards, then unwinding the equations backwards to
 * express the remainder in terms of the two original inputs.
 *
 * The chalkboard view is the whole point: this algorithm has two
 * distinct phases (forward division + back-substitution) that a
 * teacher literally writes out on the board. The scratchpad emits
 * every intermediate equation as its own line so the student can
 * follow the coefficients folding into place.
 */

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.modeLabel'),
  goal: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.goal'),
  rule: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rule'),
  invariant: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.invariant'),
  forwardHeader: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.forwardHeader',
  ),
  forwardEquation: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.forwardEquation',
  ),
  forwardAnnotation: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.forwardAnnotation',
  ),
  forwardInstruction: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.forwardInstruction',
  ),
  forwardStopDecision: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.forwardStopDecision',
  ),
  gcdFound: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.gcdFound'),
  backHeader: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.backHeader',
  ),
  /** First back-sub line — the "seed" that reads off the Bézout
   *  expression directly from the last non-trivial forward equation. */
  backSeed: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.backSeed'),
  backSeedInstruction: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.backSeedInstruction',
  ),
  /** Mid-chain substitution — takes the current "gcd = x·u + y·v"
   *  expression and rewrites one of the variables using a forward
   *  step further up the chain. */
  backSubLine: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.backSubLine'),
  backSubInstruction: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.backSubInstruction',
  ),
  backSubAnnotation: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.backSubAnnotation',
  ),
  bezoutResult: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.bezoutResult',
  ),
  verify: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.verify'),
  resultSignoff: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.resultSignoff',
  ),
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.setup'),
    forward: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.forward'),
    gcd: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.gcd'),
    back: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.back'),
    verify: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.verify'),
    complete: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.complete',
    ),
  },
  decisions: {
    preparing: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.preparing',
    ),
    forwardDiv: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.forwardDiv',
    ),
    forwardStop: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.forwardStop',
    ),
    readingGcd: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.readingGcd',
    ),
    unwinding: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.unwinding',
    ),
    verifying: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.verifying',
    ),
    done: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.done'),
  },
  captions: {
    forwardStart: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.forwardStart',
    ),
    forwardContinue: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.forwardContinue',
    ),
    forwardStop: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.forwardStop',
    ),
    gcdFound: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.gcdFound',
    ),
    backSeed: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.backSeed',
    ),
    backSubstitute: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.backSubstitute',
    ),
    verify: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.verify'),
    result: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.result'),
  },
} as const;

const SECTION_MARKERS = {
  forward: '①',
  gcd: '⟹',
  back: '②',
  verify: '③',
  result: '✓',
} as const;

type LineBuilder = {
  readonly id: string;
  readonly kind: ScratchpadLine['kind'];
  readonly indent: number;
  readonly marker: string | null;
  readonly caption: ScratchpadLine['caption'];
  /** Phase-entry captions that should stay visible on settled lines —
   *  first forward row, terminal forward row, gcd announce, back-seed,
   *  verify, result. Looping captions (middle forward rows, back-sub
   *  iterations) leave this falsy so they only show while `current`. */
  readonly captionPinned?: boolean;
  readonly content: ScratchpadLine['content'];
  readonly instruction: ScratchpadLine['instruction'];
  readonly annotation: ScratchpadLine['annotation'];
};

interface ForwardEquation {
  readonly dividend: number;
  readonly divisor: number;
  readonly quotient: number;
  readonly remainder: number;
}

/** Render a signed coefficient pair (s, t) as a textbook expression
 *  of the form `s·a + t·b` (or minus when s/t is negative). */
function formatLinearCombo(sa: number, a: number, tb: number, b: number): string {
  const parts: string[] = [];
  parts.push(`${sa} \\cdot ${a}`);
  if (tb >= 0) parts.push(`+ ${tb} \\cdot ${b}`);
  else parts.push(`- ${Math.abs(tb)} \\cdot ${b}`);
  return parts.join(' ');
}

/** Render `q · r` inline for back-sub expressions, collapsing the
 *  multiplier when it's 1 (so we don't print "1·46" as if it were a
 *  meaningful factor). */
function formatTerm(coef: number, value: number): string {
  if (coef === 1) return `${value}`;
  if (coef === -1) return `-${value}`;
  return `${coef} \\cdot ${value}`;
}

export function* extendedEuclideanGenerator(
  scenario: ExtendedEuclideanScenario,
): Generator<SortStep> {
  const originalA = scenario.a;
  const originalB = scenario.b;
  const presetLabel = scenario.presetLabel;

  // ---------- Phase 1 — forward pass ----------
  // Collect every `a = q·b + r` step. The last non-zero remainder is
  // the gcd; the last entry (whose remainder is 0) is the terminator
  // and carries no algebraic content for back-substitution.
  const forwardSteps: ForwardEquation[] = [];
  {
    let x = originalA;
    let y = originalB;
    while (y !== 0) {
      const q = Math.floor(x / y);
      const r = x - q * y;
      forwardSteps.push({ dividend: x, divisor: y, quotient: q, remainder: r });
      [x, y] = [y, r];
    }
  }

  const gcdValue = forwardSteps[forwardSteps.length - 1]?.divisor ?? originalB;

  // ---------- Scratchpad skeleton (preamble) ----------
  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      captionPinned: true,
      content: i18nText(I18N.goal, { a: originalA, b: originalB }),
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
      content: I18N.rule,
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
  ];

  const globalInvariant: ScratchpadMargin = {
    id: 'invariant',
    anchorLineId: null,
    text: I18N.invariant,
    tone: 'invariant',
  };

  let stepIndex = 0;

  function snapshot(opts: {
    readonly phase: ScratchpadLabTraceState['phaseLabel'];
    readonly decision: ScratchpadLabTraceState['decisionLabel'];
    readonly tone: ScratchpadLabTraceState['tone'];
    readonly currentLineId: string;
    readonly transientMargin: ScratchpadMargin | null;
    readonly resultLabel: ScratchpadLabTraceState['resultLabel'];
  }): ScratchpadLabTraceState {
    const currentIdx = lineBuilders.findIndex((l) => l.id === opts.currentLineId);
    const lines: ScratchpadLine[] = lineBuilders.map((builder, index) => {
      const state: ScratchpadLineState = index === currentIdx ? 'current' : 'settled';
      return {
        id: builder.id,
        kind: builder.kind,
        indent: builder.indent,
        marker: builder.marker,
        caption: builder.caption,
        captionPinned: builder.captionPinned,
        content: builder.content,
        instruction: builder.instruction,
        annotation: builder.annotation,
        state,
      };
    });
    const margins: ScratchpadMargin[] = [globalInvariant];
    if (opts.transientMargin) margins.push(opts.transientMargin);
    return {
      mode: 'extended-euclidean',
      modeLabel: I18N.modeLabel,
      phaseLabel: opts.phase,
      decisionLabel: opts.decision,
      presetLabel,
      taskPrompt: scenario.taskPrompt ?? null,
      tone: opts.tone,
      lines,
      margins,
      resultLabel: opts.resultLabel,
      iteration: stepIndex,
    };
  }

  // ---------- Step 0 — setup beat ----------
  // Append the first forward row here so the initial frame has a
  // concrete equation to anchor the eye; the remaining forward rows
  // appear one per step below.
  const first = forwardSteps[0];
  lineBuilders.push({
    id: 'fwd-0',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.forward,
    caption: I18N.captions.forwardStart,
    captionPinned: true,
    content: i18nText(I18N.forwardEquation, {
      a: first.dividend,
      q: first.quotient,
      b: first.divisor,
      r: first.remainder,
    }),
    instruction: i18nText(I18N.forwardInstruction, { a: first.dividend, b: first.divisor }),
    annotation: i18nText(I18N.forwardAnnotation, {
      a: first.dividend,
      b: first.divisor,
      r: first.remainder,
    }),
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.forwardInstruction, {
      a: first.dividend,
      b: first.divisor,
    }),
    state: snapshot({
      phase: I18N.phases.forward,
      decision: I18N.decisions.forwardDiv,
      tone: 'compute',
      currentLineId: 'fwd-0',
      transientMargin: null,
      resultLabel: null,
    }),
  });

  // ---------- Remaining forward rows ----------
  // Middle forward rows drop the imperative chip: once the equation is
  // on the board, "→ Rozpisz a = q·b + r" on a completed line reads as
  // temporally wrong (the action is already done, the annotation below
  // records what fell out). The first row (`fwd-0`) keeps its chip as a
  // "start here" anchor while the board is otherwise empty; the terminal
  // row keeps a chip because its text is the stop-decision label
  // ("Reszta spadła do 0 — koniec"), not an imperative about the
  // computation on that line.
  for (let i = 1; i < forwardSteps.length; i++) {
    const step = forwardSteps[i];
    const lineId = `fwd-${i}`;
    const isTerminal = step.remainder === 0;
    lineBuilders.push({
      id: lineId,
      kind: 'equation',
      indent: 0,
      marker: null,
      caption: isTerminal ? I18N.captions.forwardStop : I18N.captions.forwardContinue,
      captionPinned: isTerminal,
      content: i18nText(I18N.forwardEquation, {
        a: step.dividend,
        q: step.quotient,
        b: step.divisor,
        r: step.remainder,
      }),
      instruction: isTerminal
        ? i18nText(I18N.forwardStopDecision, { a: step.dividend, b: step.divisor })
        : null,
      annotation: i18nText(I18N.forwardAnnotation, {
        a: step.dividend,
        b: step.divisor,
        r: step.remainder,
      }),
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: isTerminal ? 3 : 2,
      description: i18nText(I18N.forwardInstruction, {
        a: step.dividend,
        b: step.divisor,
      }),
      state: snapshot({
        phase: I18N.phases.forward,
        decision: isTerminal ? I18N.decisions.forwardStop : I18N.decisions.forwardDiv,
        tone: isTerminal ? 'decide' : 'compute',
        currentLineId: lineId,
        transientMargin: null,
        resultLabel: null,
      }),
    });
  }

  // ---------- Gcd identified ----------
  lineBuilders.push({
    id: 'gcd-announce',
    kind: 'decision',
    indent: 0,
    marker: SECTION_MARKERS.gcd,
    caption: I18N.captions.gcdFound,
    captionPinned: true,
    content: i18nText(I18N.gcdFound, { gcd: gcdValue }),
    instruction: null,
    annotation: null,
  });
  lineBuilders.push({
    id: 'divider-mid',
    kind: 'divider',
    indent: 0,
    marker: null,
    caption: null,
    content: '',
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 4,
    description: i18nText(I18N.gcdFound, { gcd: gcdValue }),
    state: snapshot({
      phase: I18N.phases.gcd,
      decision: I18N.decisions.readingGcd,
      tone: 'substitute',
      currentLineId: 'gcd-announce',
      transientMargin: null,
      resultLabel: null,
    }),
  });

  // ---------- Phase 2 — back-substitution ----------
  // We carry an expression of the form `gcd = coefOfU · u + coefOfV · v`
  // where u and v are two "live" values from the forward chain. Each
  // back-sub rewrites v (the newer one) using the forward equation
  // that produced it. After k substitutions we've eliminated the k
  // most recent intermediates; once u and v are the original a and b,
  // we've reached the Bézout identity.
  //
  // Start: the second-to-last forward equation (the one that produced
  // the gcd as its remainder) gives us `gcd = dividend − quotient ·
  // divisor`. That's the seed expression with coefOfU = 1 (for
  // dividend), coefOfV = −quotient (for divisor).

  const nonTerminalSteps = forwardSteps.filter((s) => s.remainder !== 0);
  // Which forward-chain variables currently appear in the expression:
  // valueU is the older (outer) — always the "dividend" side of the
  // forward equation we last substituted against.
  // valueV is the newer (inner) — the "divisor" of that equation.
  let valueU: number;
  let valueV: number;
  let coefOfU: number;
  let coefOfV: number;

  {
    const seed = nonTerminalSteps[nonTerminalSteps.length - 1];
    // seed: gcd = seed.dividend − seed.quotient · seed.divisor
    valueU = seed.dividend;
    valueV = seed.divisor;
    coefOfU = 1;
    coefOfV = -seed.quotient;

    const seedContent = `${gcdValue} = ${formatTerm(coefOfU, valueU)} ${
      coefOfV >= 0 ? '+' : '-'
    } ${formatTerm(Math.abs(coefOfV), valueV)}`;

    lineBuilders.push({
      id: 'back-seed',
      kind: 'substitute',
      indent: 1,
      marker: SECTION_MARKERS.back,
      caption: I18N.captions.backSeed,
      captionPinned: true,
      content: i18nText(I18N.backSeed, {
        gcd: gcdValue,
        expression: seedContent,
      }),
      instruction: i18nText(I18N.backSeedInstruction, {
        a: seed.dividend,
        b: seed.divisor,
      }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 5,
      description: i18nText(I18N.backSeed, {
        gcd: gcdValue,
        expression: seedContent,
      }),
      state: snapshot({
        phase: I18N.phases.back,
        decision: I18N.decisions.unwinding,
        tone: 'substitute',
        currentLineId: 'back-seed',
        transientMargin: null,
        resultLabel: null,
      }),
    });
  }

  // Walk backwards through earlier forward steps; each one lets us
  // replace `valueV` with `(dividend − quotient · divisor)` of that
  // earlier step.
  for (let i = nonTerminalSteps.length - 2; i >= 0; i--) {
    const source = nonTerminalSteps[i];
    // source: valueV = source.dividend − source.quotient · source.divisor
    // Current expr: gcd = coefOfU · valueU + coefOfV · valueV
    //             = coefOfU · valueU + coefOfV · (source.dividend − source.quotient · source.divisor)
    //             = coefOfU · valueU + coefOfV · source.dividend − coefOfV · source.quotient · source.divisor
    // After rewriting: the "old" valueU keeps its role; source.dividend takes over as new valueU,
    // and source.divisor becomes the new valueV.
    // But source.dividend equals the previous valueV's "source.dividend" which should be
    // the previous (outer) value. Actually in standard EEA back-sub, source.dividend ==
    // previous step's divisor. Let me recompute the bookkeeping:
    //
    //  source.dividend = next step's divisor ≡ our current valueU  (because nonTerminalSteps
    //  are in forward order and valueU cascades). So after substitution we have:
    //    gcd = (coefOfU + coefOfV) · valueU + (−coefOfV · source.quotient) · source.divisor
    //  Wait, that's only true if source.dividend == valueU. Let me verify:
    //    forward step i:      source.dividend = d_i,      source.divisor = d_{i+1},     source.remainder = d_{i+2}
    //    forward step i+1:    dividend = d_{i+1},         divisor = d_{i+2},            remainder = d_{i+3}
    //  So yes: source.dividend == next step's divisor. And at step (i+1) as the seed we had
    //  valueU = d_{i+1}, valueV = d_{i+2}. But source.dividend = d_i (one earlier).
    //
    //  Hmm — so source.dividend ≠ valueU in general. Let me trace more carefully.
    //
    //  Seed (last non-terminal step k): valueU = d_k, valueV = d_{k+1} (where d_k is last
    //  dividend, d_{k+1} is last divisor which equals the gcd's immediate predecessor).
    //
    //  Step i = k−1: source.dividend = d_{k−1}, source.divisor = d_k, source.remainder = d_{k+1}.
    //  source lets us write: d_{k+1} = d_{k−1} − source.quotient · d_k = source.dividend − source.quotient · source.divisor.
    //  But valueV = d_{k+1}, valueU = d_k. So source.divisor = valueU. Rewriting:
    //    gcd = coefOfU · d_k + coefOfV · (d_{k−1} − q · d_k)
    //        = coefOfV · d_{k−1} + (coefOfU − q · coefOfV) · d_k
    //  New expression: outer becomes source.dividend = d_{k−1}, inner becomes source.divisor = d_k.
    //  Equivalently valueU_new = source.dividend, valueV_new = source.divisor (the old valueU).

    const q = source.quotient;
    const newCoefOfU = coefOfV;
    const newCoefOfV = coefOfU - q * coefOfV;
    const newValueU = source.dividend;
    const newValueV = source.divisor;

    coefOfU = newCoefOfU;
    coefOfV = newCoefOfV;
    valueU = newValueU;
    valueV = newValueV;

    const lineId = `back-${nonTerminalSteps.length - 1 - i}`;
    const bodyExpression = `${gcdValue} = ${formatTerm(coefOfU, valueU)} ${
      coefOfV >= 0 ? '+' : '-'
    } ${formatTerm(Math.abs(coefOfV), valueV)}`;

    lineBuilders.push({
      id: lineId,
      kind: 'substitute',
      indent: 1,
      marker: null,
      caption: I18N.captions.backSubstitute,
      content: i18nText(I18N.backSubLine, { expression: bodyExpression }),
      instruction: i18nText(I18N.backSubInstruction, {
        a: source.dividend,
        q,
        b: source.divisor,
      }),
      annotation: i18nText(I18N.backSubAnnotation, {
        coefA: coefOfU,
        a: valueU,
        coefB: coefOfV,
        b: valueV,
      }),
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 6,
      description: i18nText(I18N.backSubLine, { expression: bodyExpression }),
      state: snapshot({
        phase: I18N.phases.back,
        decision: I18N.decisions.unwinding,
        tone: 'substitute',
        currentLineId: lineId,
        transientMargin: null,
        resultLabel: null,
      }),
    });
  }

  // After the loop `coefOfU, valueU` should be the coefficient and
  // value for the original `a`, `coefOfV, valueV` for `b`. Which is
  // which depends on the parity of substitutions, so we align at the
  // end rather than assume.
  let sForA: number;
  let tForB: number;
  if (valueU === originalA && valueV === originalB) {
    sForA = coefOfU;
    tForB = coefOfV;
  } else if (valueU === originalB && valueV === originalA) {
    sForA = coefOfV;
    tForB = coefOfU;
  } else {
    // Fallback: should never happen for well-formed inputs, but
    // keep the viz robust.
    sForA = coefOfU;
    tForB = coefOfV;
  }

  const bezoutExpression = formatLinearCombo(sForA, originalA, tForB, originalB);
  const checkValue = sForA * originalA + tForB * originalB;

  lineBuilders.push({
    id: 'bezout',
    kind: 'decision',
    indent: 0,
    marker: SECTION_MARKERS.verify,
    caption: I18N.captions.verify,
    captionPinned: true,
    content: i18nText(I18N.bezoutResult, {
      s: sForA,
      a: originalA,
      t: tForB,
      b: originalB,
      gcd: gcdValue,
    }),
    instruction: null,
    annotation: i18nText(I18N.verify, {
      expression: bezoutExpression,
      value: checkValue,
    }),
  });

  lineBuilders.push({
    id: 'result-line',
    kind: 'result',
    indent: 0.6,
    marker: SECTION_MARKERS.result,
    caption: I18N.captions.result,
    captionPinned: true,
    content: i18nText(I18N.bezoutResult, {
      s: sForA,
      a: originalA,
      t: tForB,
      b: originalB,
      gcd: gcdValue,
    }),
    instruction: null,
    annotation: null,
  });

  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 7,
    description: i18nText(I18N.resultSignoff, {
      a: originalA,
      b: originalB,
      gcd: gcdValue,
      s: sForA,
      t: tForB,
    }),
    state: snapshot({
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      currentLineId: 'result-line',
      transientMargin: null,
      resultLabel: i18nText(I18N.resultSignoff, {
        a: originalA,
        b: originalB,
        gcd: gcdValue,
        s: sForA,
        t: tForB,
      }),
    }),
  });
}
