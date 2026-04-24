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
  forwardHeader: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.forwardHeader'),
  forwardEquation: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.forwardEquation'),
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
  backHeader: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.backHeader'),
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
  bezoutResult: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.bezoutResult'),
  verify: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.verify'),
  resultSignoff: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.resultSignoff'),
  rsaGoal: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.goal'),
  rsaRule: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.rule'),
  rsaInvariant: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.invariant'),
  rsaInverseExists: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.inverseExists',
  ),
  rsaNoInverse: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.noInverse'),
  rsaInverseLine: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.inverseLine'),
  rsaInterpretation: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.interpretation',
  ),
  rsaSignoff: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.signoff'),
  rsaNoInverseSignoff: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.noInverseSignoff',
  ),
  diophantineGoal: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.goal',
  ),
  diophantineRule: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.rule',
  ),
  diophantineInvariant: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.invariant',
  ),
  diophantineCheck: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.check',
  ),
  diophantineNoSolution: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.noSolution',
  ),
  diophantineScale: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.scale',
  ),
  diophantineParticular: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.particular',
  ),
  diophantineGeneral: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.general',
  ),
  diophantineMinimal: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.minimal',
  ),
  diophantineSignoff: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.signoff',
  ),
  diophantineNoSolutionSignoff: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.noSolutionSignoff',
  ),
  modularGoal: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.goal',
  ),
  modularRule: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.rule',
  ),
  modularInvariant: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.invariant',
  ),
  modularCheck: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.check',
  ),
  modularNoSolution: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.noSolution',
  ),
  modularReduce: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.reduce',
  ),
  modularSolution: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.solution',
  ),
  modularAllSolutions: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.allSolutions',
  ),
  modularSignoff: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.signoff',
  ),
  modularNoSolutionSignoff: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.noSolutionSignoff',
  ),
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.setup'),
    forward: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.forward'),
    gcd: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.gcd'),
    back: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.back'),
    verify: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.verify'),
    complete: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.phases.complete'),
  },
  decisions: {
    preparing: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.preparing'),
    forwardDiv: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.forwardDiv',
    ),
    forwardStop: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.forwardStop',
    ),
    readingGcd: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.readingGcd',
    ),
    unwinding: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.unwinding'),
    verifying: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.verifying'),
    done: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.done'),
    checking: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.checking'),
    interpreting: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.interpreting',
    ),
    noSolution: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.decisions.noSolution',
    ),
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
    gcdFound: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.gcdFound'),
    backSeed: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.backSeed'),
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

function normalizeModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function formatGeneralTerm(base: number, step: number): string {
  if (step === 0) return `${base}`;
  const absStep = Math.abs(step);
  const stepTerm = absStep === 1 ? 'k' : `${absStep}k`;
  if (base === 0) return step > 0 ? stepTerm : `-${stepTerm}`;
  return `${base} ${step > 0 ? '+' : '-'} ${stepTerm}`;
}

function findSmallestRepresentative(
  x0: number,
  y0: number,
  stepX: number,
  stepY: number,
): { readonly k: number; readonly x: number; readonly y: number } {
  const centers = [stepX === 0 ? 0 : -x0 / stepX, stepY === 0 ? 0 : -y0 / stepY, 0];
  const candidates = new Set<number>();
  for (const center of centers) {
    const floor = Math.floor(center);
    for (let delta = -3; delta <= 3; delta++) {
      candidates.add(floor + delta);
      candidates.add(Math.ceil(center) + delta);
    }
  }

  let best = { k: 0, x: x0, y: y0 };
  let bestScore = Number.POSITIVE_INFINITY;
  for (const k of candidates) {
    const x = x0 + stepX * k;
    const y = y0 + stepY * k;
    const score = Math.max(Math.abs(x), Math.abs(y)) * 1000 + Math.abs(x) + Math.abs(y);
    if (score < bestScore || (score === bestScore && Math.abs(k) < Math.abs(best.k))) {
      best = { k, x, y };
      bestScore = score;
    }
  }
  return best;
}

function goalForScenario(scenario: ExtendedEuclideanScenario): ScratchpadLine['content'] {
  const flow = scenario.notebookFlow;
  switch (flow.kind) {
    case 'rsa-inverse':
      return i18nText(I18N.rsaGoal, { phi: scenario.a, e: scenario.b, n: flow.n });
    case 'linear-diophantine':
      return i18nText(I18N.diophantineGoal, {
        a: scenario.a,
        b: scenario.b,
        target: flow.target,
      });
    case 'modular-equation':
      return i18nText(I18N.modularGoal, {
        coefficient: scenario.b,
        rhs: flow.rhs,
        modulus: scenario.a,
      });
    case 'bezout':
      return i18nText(I18N.goal, { a: scenario.a, b: scenario.b });
  }
}

function ruleForScenario(scenario: ExtendedEuclideanScenario): ScratchpadLine['content'] {
  const flow = scenario.notebookFlow;
  switch (flow.kind) {
    case 'rsa-inverse':
      return i18nText(I18N.rsaRule, { phi: scenario.a, e: scenario.b });
    case 'linear-diophantine':
      return i18nText(I18N.diophantineRule, { target: flow.target });
    case 'modular-equation':
      return i18nText(I18N.modularRule, { rhs: flow.rhs });
    case 'bezout':
      return I18N.rule;
  }
}

function invariantForScenario(scenario: ExtendedEuclideanScenario): ScratchpadMargin['text'] {
  switch (scenario.notebookFlow.kind) {
    case 'rsa-inverse':
      return I18N.rsaInvariant;
    case 'linear-diophantine':
      return I18N.diophantineInvariant;
    case 'modular-equation':
      return I18N.modularInvariant;
    case 'bezout':
      return I18N.invariant;
  }
}

export function* extendedEuclideanGenerator(
  scenario: ExtendedEuclideanScenario,
): Generator<SortStep> {
  const originalA = scenario.a;
  const originalB = scenario.b;
  const presetLabel = scenario.presetLabel;
  const flow = scenario.notebookFlow;

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
      content: goalForScenario(scenario),
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
      content: ruleForScenario(scenario),
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
    text: invariantForScenario(scenario),
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

  function appendStep(
    builder: LineBuilder,
    opts: {
      readonly activeCodeLine: number;
      readonly description: SortStep['description'];
      readonly phase: ScratchpadLabTraceState['phaseLabel'];
      readonly decision: ScratchpadLabTraceState['decisionLabel'];
      readonly tone: ScratchpadLabTraceState['tone'];
      readonly resultLabel?: ScratchpadLabTraceState['resultLabel'];
    },
  ): SortStep {
    lineBuilders.push(builder);
    stepIndex += 1;
    return createScratchpadLabStep({
      activeCodeLine: opts.activeCodeLine,
      description: opts.description,
      state: snapshot({
        phase: opts.phase,
        decision: opts.decision,
        tone: opts.tone,
        currentLineId: builder.id,
        transientMargin: null,
        resultLabel: opts.resultLabel ?? null,
      }),
    });
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

  if (flow.kind === 'rsa-inverse') {
    const inverseExists = gcdValue === 1;
    const checkLine = inverseExists
      ? i18nText(I18N.rsaInverseExists, {
          e: originalB,
          phi: originalA,
          gcd: gcdValue,
        })
      : i18nText(I18N.rsaNoInverse, {
          e: originalB,
          phi: originalA,
          gcd: gcdValue,
        });
    yield appendStep(
      {
        id: 'rsa-inverse-check',
        kind: 'decision',
        indent: 0,
        marker: SECTION_MARKERS.verify,
        caption: I18N.captions.verify,
        captionPinned: true,
        content: checkLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 4,
        description: checkLine,
        phase: I18N.phases.verify,
        decision: inverseExists ? I18N.decisions.checking : I18N.decisions.noSolution,
        tone: inverseExists ? 'decide' : 'conclude',
      },
    );
    if (!inverseExists) {
      const signoff = i18nText(I18N.rsaNoInverseSignoff, {
        e: originalB,
        phi: originalA,
        gcd: gcdValue,
      });
      yield appendStep(
        {
          id: 'rsa-no-inverse-result',
          kind: 'result',
          indent: 0,
          marker: SECTION_MARKERS.result,
          caption: I18N.captions.result,
          captionPinned: true,
          content: signoff,
          instruction: null,
          annotation: null,
        },
        {
          activeCodeLine: 7,
          description: signoff,
          phase: I18N.phases.complete,
          decision: I18N.decisions.noSolution,
          tone: 'complete',
          resultLabel: signoff,
        },
      );
      return;
    }
  }

  if (flow.kind === 'linear-diophantine') {
    const hasSolution = flow.target % gcdValue === 0;
    const checkLine = hasSolution
      ? i18nText(I18N.diophantineCheck, {
          target: flow.target,
          gcd: gcdValue,
          scale: flow.target / gcdValue,
        })
      : i18nText(I18N.diophantineNoSolution, {
          target: flow.target,
          gcd: gcdValue,
          remainder: normalizeModulo(flow.target, gcdValue),
        });
    yield appendStep(
      {
        id: 'diophantine-check',
        kind: 'decision',
        indent: 0,
        marker: SECTION_MARKERS.verify,
        caption: I18N.captions.verify,
        captionPinned: true,
        content: checkLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 4,
        description: checkLine,
        phase: I18N.phases.verify,
        decision: hasSolution ? I18N.decisions.checking : I18N.decisions.noSolution,
        tone: hasSolution ? 'decide' : 'conclude',
      },
    );
    if (!hasSolution) {
      const signoff = i18nText(I18N.diophantineNoSolutionSignoff, {
        a: originalA,
        b: originalB,
        target: flow.target,
        gcd: gcdValue,
      });
      yield appendStep(
        {
          id: 'diophantine-no-solution-result',
          kind: 'result',
          indent: 0,
          marker: SECTION_MARKERS.result,
          caption: I18N.captions.result,
          captionPinned: true,
          content: signoff,
          instruction: null,
          annotation: null,
        },
        {
          activeCodeLine: 7,
          description: signoff,
          phase: I18N.phases.complete,
          decision: I18N.decisions.noSolution,
          tone: 'complete',
          resultLabel: signoff,
        },
      );
      return;
    }
  }

  if (flow.kind === 'modular-equation') {
    const hasSolution = flow.rhs % gcdValue === 0;
    const checkLine = hasSolution
      ? i18nText(I18N.modularCheck, {
          gcd: gcdValue,
          rhs: flow.rhs,
          scale: flow.rhs / gcdValue,
        })
      : i18nText(I18N.modularNoSolution, {
          gcd: gcdValue,
          rhs: flow.rhs,
          remainder: normalizeModulo(flow.rhs, gcdValue),
        });
    yield appendStep(
      {
        id: 'modular-equation-check',
        kind: 'decision',
        indent: 0,
        marker: SECTION_MARKERS.verify,
        caption: I18N.captions.verify,
        captionPinned: true,
        content: checkLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 4,
        description: checkLine,
        phase: I18N.phases.verify,
        decision: hasSolution ? I18N.decisions.checking : I18N.decisions.noSolution,
        tone: hasSolution ? 'decide' : 'conclude',
      },
    );
    if (!hasSolution) {
      const signoff = i18nText(I18N.modularNoSolutionSignoff, {
        coefficient: originalB,
        rhs: flow.rhs,
        modulus: originalA,
        gcd: gcdValue,
      });
      yield appendStep(
        {
          id: 'modular-equation-no-solution-result',
          kind: 'result',
          indent: 0,
          marker: SECTION_MARKERS.result,
          caption: I18N.captions.result,
          captionPinned: true,
          content: signoff,
          instruction: null,
          annotation: null,
        },
        {
          activeCodeLine: 7,
          description: signoff,
          phase: I18N.phases.complete,
          decision: I18N.decisions.noSolution,
          tone: 'complete',
          resultLabel: signoff,
        },
      );
      return;
    }
  }

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

  const bezoutLine = i18nText(I18N.bezoutResult, {
    s: sForA,
    a: originalA,
    t: tForB,
    b: originalB,
    gcd: gcdValue,
  });

  yield appendStep(
    {
      id: 'bezout',
      kind: 'decision',
      indent: 0,
      marker: SECTION_MARKERS.verify,
      caption: I18N.captions.verify,
      captionPinned: true,
      content: bezoutLine,
      instruction: null,
      annotation: i18nText(I18N.verify, {
        expression: bezoutExpression,
        value: checkValue,
      }),
    },
    {
      activeCodeLine: 7,
      description: bezoutLine,
      phase: I18N.phases.verify,
      decision: I18N.decisions.verifying,
      tone: 'conclude',
    },
  );

  lineBuilders.push({
    id: 'divider-conclusion',
    kind: 'divider',
    indent: 0,
    marker: null,
    caption: null,
    content: '',
    instruction: null,
    annotation: null,
  });

  if (flow.kind === 'rsa-inverse') {
    const d = normalizeModulo(tForB, originalA);
    const inverseLine = i18nText(I18N.rsaInverseLine, {
      coefficient: tForB,
      phi: originalA,
      d,
    });
    yield appendStep(
      {
        id: 'rsa-inverse-result',
        kind: 'result',
        indent: 0,
        marker: SECTION_MARKERS.result,
        caption: I18N.captions.result,
        captionPinned: true,
        content: inverseLine,
        instruction: null,
        annotation: i18nText(I18N.rsaInterpretation, {
          n: flow.n,
          e: originalB,
          d,
        }),
      },
      {
        activeCodeLine: 7,
        description: inverseLine,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'complete',
        resultLabel: i18nText(I18N.rsaSignoff, {
          n: flow.n,
          e: originalB,
          phi: originalA,
          d,
        }),
      },
    );
    return;
  }

  if (flow.kind === 'linear-diophantine') {
    const scale = flow.target / gcdValue;
    const x0 = sForA * scale;
    const y0 = tForB * scale;
    const stepX = originalB / gcdValue;
    const stepY = -originalA / gcdValue;
    const scaleLine = i18nText(I18N.diophantineScale, {
      target: flow.target,
      gcd: gcdValue,
      scale,
      s: sForA,
      t: tForB,
    });
    yield appendStep(
      {
        id: 'diophantine-scale',
        kind: 'substitute',
        indent: 1,
        marker: null,
        caption: I18N.captions.backSubstitute,
        content: scaleLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 7,
        description: scaleLine,
        phase: I18N.phases.verify,
        decision: I18N.decisions.interpreting,
        tone: 'substitute',
      },
    );

    const particularLine = i18nText(I18N.diophantineParticular, {
      x: x0,
      y: y0,
      a: originalA,
      b: originalB,
      target: flow.target,
    });
    yield appendStep(
      {
        id: 'diophantine-particular',
        kind: 'decision',
        indent: 0,
        marker: null,
        caption: I18N.captions.verify,
        content: particularLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 7,
        description: particularLine,
        phase: I18N.phases.verify,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );

    const generalLine = i18nText(I18N.diophantineGeneral, {
      xFormula: formatGeneralTerm(x0, stepX),
      yFormula: formatGeneralTerm(y0, stepY),
      stepX,
      stepY,
    });
    yield appendStep(
      {
        id: 'diophantine-general',
        kind: 'equation',
        indent: 0,
        marker: null,
        caption: I18N.captions.result,
        content: generalLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 7,
        description: generalLine,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );

    let signoff = i18nText(I18N.diophantineSignoff, {
      x: x0,
      y: y0,
      xFormula: formatGeneralTerm(x0, stepX),
      yFormula: formatGeneralTerm(y0, stepY),
    });
    if (flow.minimize) {
      const best = findSmallestRepresentative(x0, y0, stepX, stepY);
      const minimalLine = i18nText(I18N.diophantineMinimal, {
        k: best.k,
        x: best.x,
        y: best.y,
      });
      signoff = i18nText(I18N.diophantineSignoff, {
        x: best.x,
        y: best.y,
        xFormula: formatGeneralTerm(x0, stepX),
        yFormula: formatGeneralTerm(y0, stepY),
      });
      yield appendStep(
        {
          id: 'diophantine-minimal',
          kind: 'result',
          indent: 0,
          marker: SECTION_MARKERS.result,
          caption: I18N.captions.result,
          captionPinned: true,
          content: minimalLine,
          instruction: null,
          annotation: null,
        },
        {
          activeCodeLine: 7,
          description: minimalLine,
          phase: I18N.phases.complete,
          decision: I18N.decisions.done,
          tone: 'complete',
          resultLabel: signoff,
        },
      );
      return;
    }

    yield appendStep(
      {
        id: 'diophantine-result',
        kind: 'result',
        indent: 0,
        marker: SECTION_MARKERS.result,
        caption: I18N.captions.result,
        captionPinned: true,
        content: signoff,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 7,
        description: signoff,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'complete',
        resultLabel: signoff,
      },
    );
    return;
  }

  if (flow.kind === 'modular-equation') {
    const reducedCoefficient = originalB / gcdValue;
    const reducedModulus = originalA / gcdValue;
    const reducedRhs = flow.rhs / gcdValue;
    const inverse = normalizeModulo(tForB, reducedModulus);
    const x0 = normalizeModulo(reducedRhs * inverse, reducedModulus);
    const reduceLine = i18nText(I18N.modularReduce, {
      coefficient: originalB,
      rhs: flow.rhs,
      modulus: originalA,
      reducedCoefficient,
      reducedRhs,
      reducedModulus,
    });
    yield appendStep(
      {
        id: 'modular-equation-reduce',
        kind: 'equation',
        indent: 0,
        marker: null,
        caption: I18N.captions.verify,
        content: reduceLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 7,
        description: reduceLine,
        phase: I18N.phases.verify,
        decision: I18N.decisions.interpreting,
        tone: 'substitute',
      },
    );

    const solutionLine = i18nText(I18N.modularSolution, {
      inverse,
      reducedCoefficient,
      reducedModulus,
      reducedRhs,
      x: x0,
    });
    yield appendStep(
      {
        id: 'modular-equation-solution',
        kind: 'decision',
        indent: 0,
        marker: null,
        caption: I18N.captions.result,
        content: solutionLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 7,
        description: solutionLine,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );

    const allSolutions = Array.from({ length: gcdValue }, (_, k) =>
      normalizeModulo(x0 + k * reducedModulus, originalA),
    ).join(', ');
    const allSolutionsLine = i18nText(I18N.modularAllSolutions, {
      x: x0,
      reducedModulus,
      modulus: originalA,
      solutions: allSolutions,
    });
    const signoff = i18nText(I18N.modularSignoff, {
      coefficient: originalB,
      rhs: flow.rhs,
      modulus: originalA,
      solutions: allSolutions,
    });
    yield appendStep(
      {
        id: 'modular-equation-result',
        kind: 'result',
        indent: 0,
        marker: SECTION_MARKERS.result,
        caption: I18N.captions.result,
        captionPinned: true,
        content: allSolutionsLine,
        instruction: null,
        annotation: null,
      },
      {
        activeCodeLine: 7,
        description: allSolutionsLine,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'complete',
        resultLabel: signoff,
      },
    );
    return;
  }

  const signoff = i18nText(I18N.resultSignoff, {
    a: originalA,
    b: originalB,
    gcd: gcdValue,
    s: sForA,
    t: tForB,
  });
  yield appendStep(
    {
      id: 'result-line',
      kind: 'result',
      indent: 0.6,
      marker: SECTION_MARKERS.result,
      caption: I18N.captions.result,
      captionPinned: true,
      content: bezoutLine,
      instruction: null,
      annotation: null,
    },
    {
      activeCodeLine: 7,
      description: signoff,
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      resultLabel: signoff,
    },
  );
}
