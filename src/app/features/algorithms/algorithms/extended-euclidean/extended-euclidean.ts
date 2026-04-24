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
  section: {
    forward: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.forward'),
    gcd: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.gcd'),
    check: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.check'),
    back: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.back'),
    result: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.result'),
    particular: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.particular'),
    general: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.general'),
    minimization: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.minimization',
    ),
    interpretation: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.interpretation',
    ),
    conclusion: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.conclusion'),
  },
  gcdLine: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.gcdLine'),
  modularRemainderCheck: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularRemainderCheck',
  ),
  rsaProductCheck: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.productCheck',
  ),
  rsaModuloCheck: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.moduloCheck'),
  diophantineStepSizes: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.stepSizes',
  ),
  diophantineCandidate: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.candidate',
  ),
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
  /** Keep structural preamble lines visible after the active step moves on. */
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
function formatTerm(coef: number, value: number | string): string {
  if (coef === 1) return `${value}`;
  if (coef === -1) return `-${value}`;
  return `${coef} \\cdot ${value}`;
}

function formatSignedTerms(
  terms: readonly { readonly coef: number; readonly value: number | string }[],
): string {
  const nonZeroTerms = terms.filter((term) => term.coef !== 0);
  if (nonZeroTerms.length === 0) return '0';

  return nonZeroTerms
    .map((term, index) => {
      const absTerm = formatTerm(Math.abs(term.coef), term.value);
      if (index === 0) return term.coef < 0 ? `-${absTerm}` : absTerm;
      return `${term.coef < 0 ? '-' : '+'} ${absTerm}`;
    })
    .join(' ');
}

function formatRemainderAsDifference(step: ForwardEquation): string {
  return `${step.remainder} = ${step.dividend} - ${step.quotient} \\cdot ${step.divisor}`;
}

function formatBackExpression(
  gcdValue: number,
  terms: readonly { readonly coef: number; readonly value: number | string }[],
): string {
  return `${gcdValue} = ${formatSignedTerms(terms)}`;
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

  function paperLine(opts: {
    readonly id: string;
    readonly kind: ScratchpadLine['kind'];
    readonly content: ScratchpadLine['content'];
    readonly indent?: number;
    readonly marker?: string | null;
    readonly annotation?: ScratchpadLine['annotation'];
  }): LineBuilder {
    return {
      id: opts.id,
      kind: opts.kind,
      indent: opts.indent ?? 0,
      marker: opts.marker ?? null,
      caption: null,
      content: opts.content,
      instruction: null,
      annotation: opts.annotation ?? null,
    };
  }

  function appendPaperStep(
    builder: LineBuilder,
    opts: {
      readonly activeCodeLine: number;
      readonly phase: ScratchpadLabTraceState['phaseLabel'];
      readonly decision: ScratchpadLabTraceState['decisionLabel'];
      readonly tone: ScratchpadLabTraceState['tone'];
      readonly resultLabel?: ScratchpadLabTraceState['resultLabel'];
    },
  ): SortStep {
    return appendStep(builder, {
      ...opts,
      description: builder.content,
    });
  }

  function mathLine(id: string, expression: string, indent = 0): LineBuilder {
    return paperLine({
      id,
      kind: 'equation',
      indent,
      content: i18nText(I18N.backSubLine, { expression }),
    });
  }

  function sectionLine(
    id: string,
    content: ScratchpadLine['content'],
    marker: string | null = null,
  ): LineBuilder {
    return paperLine({
      id,
      kind: 'note',
      marker,
      content,
    });
  }

  yield appendPaperStep(
    sectionLine('section-forward', I18N.section.forward, SECTION_MARKERS.forward),
    {
      activeCodeLine: 1,
      phase: I18N.phases.forward,
      decision: I18N.decisions.forwardDiv,
      tone: 'setup',
    },
  );

  for (let i = 0; i < forwardSteps.length; i++) {
    const step = forwardSteps[i];
    const lineId = `fwd-${i}`;
    const isTerminal = step.remainder === 0;
    yield appendPaperStep(
      paperLine({
        id: lineId,
        kind: 'equation',
        content: i18nText(I18N.forwardEquation, {
          a: step.dividend,
          q: step.quotient,
          b: step.divisor,
          r: step.remainder,
        }),
        annotation: isTerminal
          ? null
          : i18nText(I18N.forwardAnnotation, {
              a: step.dividend,
              b: step.divisor,
              r: step.remainder,
            }),
      }),
      {
        activeCodeLine: isTerminal ? 3 : 2,
        phase: I18N.phases.forward,
        decision: isTerminal ? I18N.decisions.forwardStop : I18N.decisions.forwardDiv,
        tone: isTerminal ? 'decide' : 'compute',
      },
    );
  }

  yield appendPaperStep(sectionLine('section-gcd', I18N.section.gcd, SECTION_MARKERS.gcd), {
    activeCodeLine: 4,
    phase: I18N.phases.gcd,
    decision: I18N.decisions.readingGcd,
    tone: 'setup',
  });

  yield appendPaperStep(
    paperLine({
      id: 'gcd-announce',
      kind: 'decision',
      content: i18nText(I18N.gcdLine, { gcd: gcdValue }),
    }),
    {
      activeCodeLine: 4,
      phase: I18N.phases.gcd,
      decision: I18N.decisions.readingGcd,
      tone: 'substitute',
    },
  );

  if (flow.kind === 'rsa-inverse') {
    yield appendPaperStep(
      sectionLine('section-check', I18N.section.check, SECTION_MARKERS.verify),
      {
        activeCodeLine: 4,
        phase: I18N.phases.verify,
        decision: I18N.decisions.checking,
        tone: 'setup',
      },
    );
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
    yield appendPaperStep(
      paperLine({
        id: 'rsa-inverse-check',
        kind: 'decision',
        content: checkLine,
      }),
      {
        activeCodeLine: 4,
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
      yield appendPaperStep(sectionLine('section-conclusion', I18N.section.conclusion), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.noSolution,
        tone: 'setup',
      });
      yield appendPaperStep(
        paperLine({
          id: 'rsa-no-inverse-result',
          kind: 'result',
          marker: SECTION_MARKERS.result,
          content: signoff,
        }),
        {
          activeCodeLine: 7,
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
    yield appendPaperStep(
      sectionLine('section-check', I18N.section.check, SECTION_MARKERS.verify),
      {
        activeCodeLine: 4,
        phase: I18N.phases.verify,
        decision: I18N.decisions.checking,
        tone: 'setup',
      },
    );
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
    yield appendPaperStep(
      paperLine({
        id: 'diophantine-check',
        kind: 'decision',
        content: checkLine,
      }),
      {
        activeCodeLine: 4,
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
      yield appendPaperStep(sectionLine('section-conclusion', I18N.section.conclusion), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.noSolution,
        tone: 'setup',
      });
      yield appendPaperStep(
        paperLine({
          id: 'diophantine-no-solution-result',
          kind: 'result',
          marker: SECTION_MARKERS.result,
          content: signoff,
        }),
        {
          activeCodeLine: 7,
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
    yield appendPaperStep(
      sectionLine('section-check', I18N.section.check, SECTION_MARKERS.verify),
      {
        activeCodeLine: 4,
        phase: I18N.phases.verify,
        decision: I18N.decisions.checking,
        tone: 'setup',
      },
    );
    const hasSolution = flow.rhs % gcdValue === 0;
    yield appendPaperStep(
      paperLine({
        id: 'modular-equation-remainder-check',
        kind: 'equation',
        content: i18nText(I18N.modularRemainderCheck, {
          value: flow.rhs,
          divisor: gcdValue,
          remainder: normalizeModulo(flow.rhs, gcdValue),
        }),
      }),
      {
        activeCodeLine: 4,
        phase: I18N.phases.verify,
        decision: I18N.decisions.checking,
        tone: 'compute',
      },
    );
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
    yield appendPaperStep(
      paperLine({
        id: 'modular-equation-check',
        kind: 'decision',
        content: checkLine,
      }),
      {
        activeCodeLine: 4,
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
      yield appendPaperStep(sectionLine('section-conclusion', I18N.section.conclusion), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.noSolution,
        tone: 'setup',
      });
      yield appendPaperStep(
        paperLine({
          id: 'modular-equation-no-solution-result',
          kind: 'result',
          marker: SECTION_MARKERS.result,
          content: signoff,
        }),
        {
          activeCodeLine: 7,
          phase: I18N.phases.complete,
          decision: I18N.decisions.noSolution,
          tone: 'complete',
          resultLabel: signoff,
        },
      );
      return;
    }
  }

  yield appendPaperStep(sectionLine('section-back', I18N.section.back, SECTION_MARKERS.back), {
    activeCodeLine: 5,
    phase: I18N.phases.back,
    decision: I18N.decisions.unwinding,
    tone: 'setup',
  });

  const nonTerminalSteps = forwardSteps.filter((s) => s.remainder !== 0);
  let valueU: number;
  let valueV: number;
  let coefOfU: number;
  let coefOfV: number;

  {
    const seed = nonTerminalSteps[nonTerminalSteps.length - 1];
    valueU = seed.dividend;
    valueV = seed.divisor;
    coefOfU = 1;
    coefOfV = -seed.quotient;
    yield appendPaperStep(mathLine('back-seed', formatRemainderAsDifference(seed), 1), {
      activeCodeLine: 5,
      phase: I18N.phases.back,
      decision: I18N.decisions.unwinding,
      tone: 'substitute',
    });
  }

  for (let i = nonTerminalSteps.length - 2; i >= 0; i--) {
    const source = nonTerminalSteps[i];
    const q = source.quotient;
    const unchangedTerm = { coef: coefOfU, value: valueU };
    const substitutedTerm = {
      coef: coefOfV,
      value: `(${source.dividend} - ${q} \\cdot ${source.divisor})`,
    };
    const substitution = formatBackExpression(
      gcdValue,
      coefOfV > 0 ? [substitutedTerm, unchangedTerm] : [unchangedTerm, substitutedTerm],
    );
    const expanded = formatBackExpression(
      gcdValue,
      coefOfV > 0
        ? [
            { coef: coefOfV, value: source.dividend },
            { coef: -coefOfV * q, value: source.divisor },
            { coef: coefOfU, value: valueU },
          ]
        : [
            { coef: coefOfU, value: valueU },
            { coef: coefOfV, value: source.dividend },
            { coef: -coefOfV * q, value: source.divisor },
          ],
    );
    const newCoefOfU = coefOfV;
    const newCoefOfV = coefOfU - q * coefOfV;
    const newValueU = source.dividend;
    const newValueV = source.divisor;
    const collected = formatBackExpression(
      gcdValue,
      newCoefOfV > 0
        ? [
            { coef: newCoefOfV, value: newValueV },
            { coef: newCoefOfU, value: newValueU },
          ]
        : [
            { coef: newCoefOfU, value: newValueU },
            { coef: newCoefOfV, value: newValueV },
          ],
    );
    const stepNumber = nonTerminalSteps.length - 1 - i;

    yield appendPaperStep(
      mathLine(`back-source-${stepNumber}`, formatRemainderAsDifference(source), 1),
      {
        activeCodeLine: 6,
        phase: I18N.phases.back,
        decision: I18N.decisions.unwinding,
        tone: 'substitute',
      },
    );
    yield appendPaperStep(mathLine(`back-substitute-${stepNumber}`, substitution, 1), {
      activeCodeLine: 6,
      phase: I18N.phases.back,
      decision: I18N.decisions.unwinding,
      tone: 'substitute',
    });
    yield appendPaperStep(mathLine(`back-expand-${stepNumber}`, expanded, 1), {
      activeCodeLine: 6,
      phase: I18N.phases.back,
      decision: I18N.decisions.unwinding,
      tone: 'substitute',
    });
    yield appendPaperStep(mathLine(`back-collect-${stepNumber}`, collected, 1), {
      activeCodeLine: 6,
      phase: I18N.phases.back,
      decision: I18N.decisions.unwinding,
      tone: 'substitute',
    });

    coefOfU = newCoefOfU;
    coefOfV = newCoefOfV;
    valueU = newValueU;
    valueV = newValueV;
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

  yield appendPaperStep(
    sectionLine('section-result', I18N.section.result, SECTION_MARKERS.result),
    {
      activeCodeLine: 7,
      phase: I18N.phases.verify,
      decision: I18N.decisions.verifying,
      tone: 'setup',
    },
  );

  yield appendPaperStep(
    paperLine({
      id: 'bezout',
      kind: 'decision',
      content: bezoutLine,
      annotation: i18nText(I18N.verify, {
        expression: bezoutExpression,
        value: checkValue,
      }),
    }),
    {
      activeCodeLine: 7,
      phase: I18N.phases.verify,
      decision: I18N.decisions.verifying,
      tone: 'conclude',
    },
  );

  if (flow.kind === 'rsa-inverse') {
    const d = normalizeModulo(tForB, originalA);
    const product = originalB * d;
    const moduloCheck = normalizeModulo(product, originalA);
    const inverseLine = i18nText(I18N.rsaInverseLine, {
      coefficient: tForB,
      phi: originalA,
      d,
    });
    yield appendPaperStep(
      paperLine({
        id: 'rsa-inverse-result',
        kind: 'result',
        content: inverseLine,
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'complete',
      },
    );
    yield appendPaperStep(
      paperLine({
        id: 'rsa-product-check',
        kind: 'equation',
        content: i18nText(I18N.rsaProductCheck, {
          e: originalB,
          d,
          product,
        }),
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'complete',
      },
    );
    yield appendPaperStep(
      paperLine({
        id: 'rsa-modulo-check',
        kind: 'equation',
        content: i18nText(I18N.rsaModuloCheck, {
          product,
          phi: originalA,
          remainder: moduloCheck,
        }),
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'complete',
      },
    );
    const signoff = i18nText(I18N.rsaSignoff, {
      n: flow.n,
      e: originalB,
      phi: originalA,
      d,
    });
    yield appendPaperStep(sectionLine('section-interpretation', I18N.section.interpretation), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'setup',
    });
    yield appendPaperStep(
      paperLine({
        id: 'rsa-interpretation',
        kind: 'result',
        content: i18nText(I18N.rsaInterpretation, {
          n: flow.n,
          e: originalB,
          d,
        }),
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'complete',
        resultLabel: signoff,
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
    yield appendPaperStep(sectionLine('section-particular', I18N.section.particular), {
      activeCodeLine: 7,
      phase: I18N.phases.verify,
      decision: I18N.decisions.interpreting,
      tone: 'setup',
    });
    yield appendPaperStep(
      paperLine({
        id: 'diophantine-scale',
        kind: 'substitute',
        indent: 1,
        content: scaleLine,
      }),
      {
        activeCodeLine: 7,
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
    yield appendPaperStep(
      paperLine({
        id: 'diophantine-particular',
        kind: 'decision',
        content: particularLine,
      }),
      {
        activeCodeLine: 7,
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
    yield appendPaperStep(sectionLine('section-general', I18N.section.general), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'setup',
    });
    yield appendPaperStep(
      paperLine({
        id: 'diophantine-step-sizes',
        kind: 'equation',
        content: i18nText(I18N.diophantineStepSizes, {
          gcd: gcdValue,
          stepX,
          stepY: Math.abs(stepY),
        }),
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );
    yield appendPaperStep(
      paperLine({
        id: 'diophantine-general',
        kind: 'equation',
        content: generalLine,
      }),
      {
        activeCodeLine: 7,
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
      yield appendPaperStep(sectionLine('section-minimization', I18N.section.minimization), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'setup',
      });
      for (const k of [best.k - 1, best.k, best.k + 1]) {
        yield appendPaperStep(
          paperLine({
            id: `diophantine-candidate-${k}`,
            kind: 'equation',
            content: i18nText(I18N.diophantineCandidate, {
              k,
              x: x0 + stepX * k,
              y: y0 + stepY * k,
            }),
          }),
          {
            activeCodeLine: 7,
            phase: I18N.phases.complete,
            decision: I18N.decisions.done,
            tone: k === best.k ? 'complete' : 'conclude',
          },
        );
      }
      yield appendPaperStep(
        paperLine({
          id: 'diophantine-minimal',
          kind: 'result',
          marker: SECTION_MARKERS.result,
          content: minimalLine,
        }),
        {
          activeCodeLine: 7,
          phase: I18N.phases.complete,
          decision: I18N.decisions.done,
          tone: 'complete',
          resultLabel: signoff,
        },
      );
      return;
    }

    yield appendPaperStep(
      paperLine({
        id: 'diophantine-result',
        kind: 'result',
        marker: SECTION_MARKERS.result,
        content: signoff,
      }),
      {
        activeCodeLine: 7,
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
    yield appendPaperStep(
      paperLine({
        id: 'modular-equation-reduce',
        kind: 'equation',
        content: reduceLine,
      }),
      {
        activeCodeLine: 7,
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
    yield appendPaperStep(
      paperLine({
        id: 'modular-equation-solution',
        kind: 'decision',
        content: solutionLine,
      }),
      {
        activeCodeLine: 7,
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
    yield appendPaperStep(
      paperLine({
        id: 'modular-equation-result',
        kind: 'result',
        marker: SECTION_MARKERS.result,
        content: allSolutionsLine,
      }),
      {
        activeCodeLine: 7,
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
  yield appendPaperStep(
    paperLine({
      id: 'result-line',
      kind: 'result',
      indent: 0.6,
      marker: SECTION_MARKERS.result,
      content: bezoutLine,
    }),
    {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      resultLabel: signoff,
    },
  );
}
