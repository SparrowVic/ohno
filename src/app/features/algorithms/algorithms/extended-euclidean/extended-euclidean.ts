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
  section: {
    forward: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.forward'),
    gcd: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.gcd'),
    check: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.check'),
    existenceCheck: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.section.existenceCheck',
    ),
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
  resultLabels: {
    check: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.resultLabels.check'),
    interpretation: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.resultLabels.interpretation',
    ),
    forK: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.resultLabels.forK'),
    neighbors: t(
      'features.algorithms.runtime.scratchpadLab.extendedEuclidean.resultLabels.neighbors',
    ),
    pick: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.resultLabels.pick'),
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
  rsaInverseExistsShort: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.inverseExistsShort',
  ),
  rsaNoInverseShort: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.noInverseShort',
  ),
  rsaInverseLine: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.inverseLine'),
  rsaPrivateKeyLine: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.privateKeyLine',
  ),
  rsaPairLine: t('features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.pairLine'),
  rsaIdentityLine: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.identityLine',
  ),
  rsaNoInverseSignoff: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.rsa.noInverseSignoff',
  ),
  diophantineCheck: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.check',
  ),
  diophantineExists: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.exists',
  ),
  diophantineBackTarget: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.backTarget',
  ),
  diophantineGeneralRule: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.generalRule',
  ),
  diophantineHere: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.diophantine.here',
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
  modularCheck: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.check',
  ),
  modularCondition: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.condition',
  ),
  modularTherefore: t(
    'features.algorithms.runtime.scratchpadLab.extendedEuclidean.modularEquation.therefore',
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

const RESULT_SECTION_MARKER = '✓';

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

interface AlgebraTerm {
  readonly coef: number;
  readonly value: number | string;
  readonly forceCoefficient?: boolean;
}

/** Render a final linear combination exactly like the written task
 *  sheet: both terms are joined with `+`, negative coefficients are
 *  parenthesized instead of converted to subtraction. */
function formatResultLinearCombo(sa: number, a: number, tb: number, b: number): string {
  return `${formatCoefficientFactor(sa)} \\cdot ${a} + ${formatCoefficientFactor(tb)} \\cdot ${b}`;
}

function formatCoefficientFactor(value: number): string {
  return value < 0 ? `(${value})` : `${value}`;
}

function formatResultCheck(sa: number, a: number, tb: number, b: number, gcd: number): string {
  const left = sa * a;
  const right = tb * b;
  return `${formatResultLinearCombo(sa, a, tb, b)} = ${formatArithmeticSum(left, right)} = ${gcd}`;
}

/** Render `q · r` inline for back-sub expressions, collapsing the
 *  multiplier when it's 1 (so we don't print "1·46" as if it were a
 *  meaningful factor). */
function formatTerm(coef: number, value: number | string, forceCoefficient = false): string {
  if (coef === 1 && !forceCoefficient) return `${value}`;
  if (coef === -1) return `-${value}`;
  return `${coef} \\cdot ${value}`;
}

function formatSignedTerms(terms: readonly AlgebraTerm[]): string {
  const nonZeroTerms = terms.filter((term) => term.coef !== 0);
  if (nonZeroTerms.length === 0) return '0';

  return nonZeroTerms
    .map((term, index) => {
      const absTerm = formatTerm(
        Math.abs(term.coef),
        term.value,
        term.forceCoefficient && index > 0,
      );
      if (index === 0) return term.coef < 0 ? `-${absTerm}` : absTerm;
      return `${term.coef < 0 ? '-' : '+'} ${absTerm}`;
    })
    .join(' ');
}

function formatRemainderAsDifference(step: ForwardEquation): string {
  return `${step.remainder} = ${step.dividend} - ${step.quotient} \\cdot ${step.divisor}`;
}

function formatBackExpression(gcdValue: number, terms: readonly AlgebraTerm[]): string {
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

function formatSignedNumber(value: number): string {
  return value < 0 ? `(${value})` : `${value}`;
}

function formatArithmeticSum(left: number, right: number): string {
  return `${left} ${right < 0 ? '-' : '+'} ${Math.abs(right)}`;
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

  const lineBuilders: LineBuilder[] = [];

  let stepIndex = 0;

  function snapshot(opts: {
    readonly phase: ScratchpadLabTraceState['phaseLabel'];
    readonly decision: ScratchpadLabTraceState['decisionLabel'];
    readonly tone: ScratchpadLabTraceState['tone'];
    readonly currentLineId: string;
    readonly transientMargin: ScratchpadMargin | null;
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
    const margins: ScratchpadMargin[] = [];
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
      resultLabel: null,
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

  function resultSectionLine(): LineBuilder {
    return paperLine({
      id: 'section-result',
      kind: 'result',
      marker: RESULT_SECTION_MARKER,
      content: I18N.section.result,
    });
  }

  yield appendPaperStep(sectionLine('section-forward', I18N.section.forward), {
    activeCodeLine: 1,
    phase: I18N.phases.forward,
    decision: I18N.decisions.forwardDiv,
    tone: 'setup',
  });

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

  yield appendPaperStep(sectionLine('section-gcd', I18N.section.gcd), {
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
    yield appendPaperStep(sectionLine('section-rsa-conclusion', I18N.section.conclusion), {
      activeCodeLine: 4,
      phase: I18N.phases.verify,
      decision: I18N.decisions.checking,
      tone: 'setup',
    });
    const inverseExists = gcdValue === 1;
    yield appendPaperStep(
      mathLine('rsa-gcd-conclusion', `\\gcd(${originalA}, ${originalB}) = ${gcdValue}`),
      {
        activeCodeLine: 4,
        phase: I18N.phases.verify,
        decision: inverseExists ? I18N.decisions.checking : I18N.decisions.noSolution,
        tone: inverseExists ? 'decide' : 'conclude',
      },
    );
    yield appendPaperStep(
      paperLine({
        id: 'rsa-inverse-check',
        kind: 'decision',
        content: inverseExists ? I18N.rsaInverseExistsShort : I18N.rsaNoInverseShort,
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
          kind: 'decision',
          content: signoff,
        }),
        {
          activeCodeLine: 7,
          phase: I18N.phases.complete,
          decision: I18N.decisions.noSolution,
          tone: 'complete',
        },
      );
      return;
    }
  }

  if (flow.kind === 'linear-diophantine') {
    yield appendPaperStep(sectionLine('section-check', I18N.section.existenceCheck), {
      activeCodeLine: 4,
      phase: I18N.phases.verify,
      decision: I18N.decisions.checking,
      tone: 'setup',
    });
    const hasSolution = flow.target % gcdValue === 0;
    const scale = flow.target / gcdValue;
    yield appendPaperStep(
      paperLine({
        id: 'diophantine-target-multiple',
        kind: 'equation',
        content: hasSolution
          ? i18nText(I18N.diophantineCheck, {
              target: flow.target,
              gcd: gcdValue,
              scale,
            })
          : i18nText(I18N.diophantineNoSolution, {
              target: flow.target,
              gcd: gcdValue,
              remainder: normalizeModulo(flow.target, gcdValue),
            }),
      }),
      {
        activeCodeLine: 4,
        phase: I18N.phases.verify,
        decision: hasSolution ? I18N.decisions.checking : I18N.decisions.noSolution,
        tone: hasSolution ? 'decide' : 'conclude',
      },
    );
    if (hasSolution) {
      yield appendPaperStep(
        paperLine({
          id: 'diophantine-exists',
          kind: 'decision',
          content: i18nText(I18N.diophantineExists, {
            gcd: gcdValue,
          }),
        }),
        {
          activeCodeLine: 4,
          phase: I18N.phases.verify,
          decision: I18N.decisions.checking,
          tone: 'decide',
        },
      );
    }
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
          kind: 'decision',
          content: signoff,
        }),
        {
          activeCodeLine: 7,
          phase: I18N.phases.complete,
          decision: I18N.decisions.noSolution,
          tone: 'complete',
        },
      );
      return;
    }
  }

  if (flow.kind === 'modular-equation') {
    yield appendPaperStep(sectionLine('section-check', I18N.section.existenceCheck), {
      activeCodeLine: 4,
      phase: I18N.phases.verify,
      decision: I18N.decisions.checking,
      tone: 'setup',
    });
    const hasSolution = flow.rhs % gcdValue === 0;
    yield appendPaperStep(
      paperLine({
        id: 'modular-equation-condition',
        kind: 'decision',
        content: I18N.modularCondition,
      }),
      {
        activeCodeLine: 4,
        phase: I18N.phases.verify,
        decision: I18N.decisions.checking,
        tone: 'setup',
      },
    );
    yield appendPaperStep(mathLine('modular-equation-condition-formula', `\\gcd(a, m) \\mid c`), {
      activeCodeLine: 4,
      phase: I18N.phases.verify,
      decision: I18N.decisions.checking,
      tone: 'compute',
    });
    yield appendPaperStep(
      mathLine('modular-equation-gcd-check', `\\gcd(${originalB}, ${originalA}) = ${gcdValue}`),
      {
        activeCodeLine: 4,
        phase: I18N.phases.verify,
        decision: I18N.decisions.checking,
        tone: 'compute',
      },
    );
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
    if (!hasSolution) {
      yield appendPaperStep(
        sectionLine('modular-equation-therefore-label', I18N.modularTherefore),
        {
          activeCodeLine: 4,
          phase: I18N.phases.verify,
          decision: I18N.decisions.noSolution,
          tone: 'setup',
        },
      );
      yield appendPaperStep(
        mathLine('modular-equation-not-divides', `${gcdValue} \\nmid ${flow.rhs}`),
        {
          activeCodeLine: 4,
          phase: I18N.phases.verify,
          decision: I18N.decisions.noSolution,
          tone: 'conclude',
        },
      );
    }
    if (hasSolution) {
      const checkLine = i18nText(I18N.modularCheck, {
        gcd: gcdValue,
        rhs: flow.rhs,
        scale: flow.rhs / gcdValue,
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
          decision: I18N.decisions.checking,
          tone: 'decide',
        },
      );
    }
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
          kind: 'decision',
          content: signoff,
        }),
        {
          activeCodeLine: 7,
          phase: I18N.phases.complete,
          decision: I18N.decisions.noSolution,
          tone: 'complete',
        },
      );
      return;
    }
  }

  yield appendPaperStep(sectionLine('section-back', I18N.section.back), {
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
    if (flow.kind === 'linear-diophantine') {
      yield appendPaperStep(
        paperLine({
          id: 'diophantine-back-target',
          kind: 'decision',
          content: i18nText(I18N.diophantineBackTarget, {
            target: flow.target,
          }),
        }),
        {
          activeCodeLine: 5,
          phase: I18N.phases.back,
          decision: I18N.decisions.unwinding,
          tone: 'conclude',
        },
      );
    }
  }

  for (let i = nonTerminalSteps.length - 2; i >= 0; i--) {
    const source = nonTerminalSteps[i];
    const q = source.quotient;
    const unchangedTerm = {
      coef: coefOfU,
      value: valueU,
      forceCoefficient: Math.abs(coefOfU) === 1 && Math.abs(coefOfV) > 1,
    };
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

  if (flow.kind === 'rsa-inverse') {
    const d = normalizeModulo(tForB, originalA);
    const product = originalB * d;
    const moduloCheck = normalizeModulo(product, originalA);
    const inverseLine = i18nText(I18N.rsaInverseLine, {
      e: originalB,
      coefficient: tForB,
      phi: originalA,
      d,
    });
    yield appendPaperStep(resultSectionLine(), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'setup',
    });
    yield appendPaperStep(
      paperLine({
        id: 'rsa-inverse-result',
        kind: 'decision',
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
        id: 'rsa-private-key',
        kind: 'equation',
        content: i18nText(I18N.rsaPrivateKeyLine, { d }),
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'complete',
      },
    );
    yield appendPaperStep(sectionLine('rsa-check-label', I18N.resultLabels.check), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'setup',
    });
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
    yield appendPaperStep(
      sectionLine('rsa-interpretation-label', I18N.resultLabels.interpretation),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'setup',
      },
    );
    yield appendPaperStep(
      paperLine({
        id: 'rsa-pair',
        kind: 'equation',
        content: i18nText(I18N.rsaPairLine, {
          e: originalB,
          d,
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
        id: 'rsa-identity',
        kind: 'equation',
        content: i18nText(I18N.rsaIdentityLine, {
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
    const ax0 = originalA * x0;
    const by0 = originalB * y0;
    yield appendPaperStep(sectionLine('section-particular', I18N.section.particular), {
      activeCodeLine: 7,
      phase: I18N.phases.verify,
      decision: I18N.decisions.interpreting,
      tone: 'setup',
    });
    yield appendPaperStep(mathLine('diophantine-x0', `x_0 = ${x0}`), {
      activeCodeLine: 7,
      phase: I18N.phases.verify,
      decision: I18N.decisions.interpreting,
      tone: 'substitute',
    });
    yield appendPaperStep(mathLine('diophantine-y0', `y_0 = ${y0}`), {
      activeCodeLine: 7,
      phase: I18N.phases.verify,
      decision: I18N.decisions.interpreting,
      tone: 'substitute',
    });
    yield appendPaperStep(
      mathLine(
        'diophantine-particular-check',
        `${originalA} \\cdot ${formatSignedNumber(x0)} + ${originalB} \\cdot ${formatSignedNumber(y0)} = ${formatArithmeticSum(ax0, by0)} = ${flow.target}`,
      ),
      {
        activeCodeLine: 7,
        phase: I18N.phases.verify,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );

    yield appendPaperStep(sectionLine('section-general', I18N.section.general), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'setup',
    });
    yield appendPaperStep(
      paperLine({
        id: 'diophantine-general-rule',
        kind: 'decision',
        content: I18N.diophantineGeneralRule,
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'setup',
      },
    );
    yield appendPaperStep(mathLine('diophantine-general-template-x', `x = x_0 + (b / g)k`), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'conclude',
    });
    yield appendPaperStep(mathLine('diophantine-general-template-y', `y = y_0 - (a / g)k`), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'conclude',
    });
    yield appendPaperStep(mathLine('diophantine-general-template-domain', `k \\in \\mathbb{Z}`), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'conclude',
    });
    yield appendPaperStep(
      paperLine({
        id: 'diophantine-here-label',
        kind: 'note',
        content: I18N.diophantineHere,
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'setup',
      },
    );
    yield appendPaperStep(mathLine('diophantine-step-g', `g = ${gcdValue}`), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'conclude',
    });
    yield appendPaperStep(
      mathLine('diophantine-step-x', `b / g = ${originalB} / ${gcdValue} = ${stepX}`),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );
    yield appendPaperStep(
      mathLine('diophantine-step-y', `a / g = ${originalA} / ${gcdValue} = ${Math.abs(stepY)}`),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );
    yield appendPaperStep(
      mathLine('diophantine-general-x', `x = ${formatGeneralTerm(x0, stepX)}`),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );
    yield appendPaperStep(
      mathLine('diophantine-general-y', `y = ${formatGeneralTerm(y0, stepY)}`),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.interpreting,
        tone: 'conclude',
      },
    );
    yield appendPaperStep(mathLine('diophantine-general-domain', `k \\in \\mathbb{Z}`), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.interpreting,
      tone: 'conclude',
    });

    const signoff = i18nText(I18N.diophantineSignoff, {
      x: x0,
      y: y0,
      xFormula: formatGeneralTerm(x0, stepX),
      yFormula: formatGeneralTerm(y0, stepY),
    });
    if (flow.minimize) {
      const best = findSmallestRepresentative(x0, y0, stepX, stepY);
      yield appendPaperStep(sectionLine('section-minimization', I18N.section.minimization), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'setup',
      });
      yield appendPaperStep(
        sectionLine('diophantine-best-k-label', i18nText(I18N.resultLabels.forK, { k: best.k })),
        {
          activeCodeLine: 7,
          phase: I18N.phases.complete,
          decision: I18N.decisions.done,
          tone: 'setup',
        },
      );
      yield appendPaperStep(mathLine('diophantine-best-x', `x = ${best.x}`), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'complete',
      });
      yield appendPaperStep(mathLine('diophantine-best-y', `y = ${best.y}`), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'complete',
      });
      yield appendPaperStep(
        sectionLine('diophantine-neighbors-label', I18N.resultLabels.neighbors),
        {
          activeCodeLine: 7,
          phase: I18N.phases.complete,
          decision: I18N.decisions.done,
          tone: 'setup',
        },
      );
      for (const k of [best.k - 1, best.k + 1]) {
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
      yield appendPaperStep(sectionLine('diophantine-pick-label', I18N.resultLabels.pick), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'setup',
      });
      yield appendPaperStep(mathLine('diophantine-minimal-x', `x = ${best.x}`), {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'complete',
      });
      yield appendPaperStep(
        paperLine({
          id: 'diophantine-minimal',
          kind: 'equation',
          content: i18nText(I18N.backSubLine, { expression: `y = ${best.y}` }),
        }),
        {
          activeCodeLine: 7,
          phase: I18N.phases.complete,
          decision: I18N.decisions.done,
          tone: 'complete',
        },
      );
      return;
    }

    yield appendPaperStep(
      paperLine({
        id: 'diophantine-result',
        kind: 'decision',
        content: signoff,
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'complete',
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
    yield appendPaperStep(resultSectionLine(), {
      activeCodeLine: 7,
      phase: I18N.phases.verify,
      decision: I18N.decisions.interpreting,
      tone: 'setup',
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
    yield appendPaperStep(
      paperLine({
        id: 'modular-equation-result',
        kind: 'equation',
        content: allSolutionsLine,
      }),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'complete',
      },
    );
    return;
  }

  yield appendPaperStep(resultSectionLine(), {
    activeCodeLine: 7,
    phase: I18N.phases.verify,
    decision: I18N.decisions.verifying,
    tone: 'setup',
  });
  yield appendPaperStep(mathLine('result-gcd', `\\gcd(${originalA}, ${originalB}) = ${gcdValue}`), {
    activeCodeLine: 7,
    phase: I18N.phases.complete,
    decision: I18N.decisions.done,
    tone: 'complete',
  });
  yield appendPaperStep(mathLine('result-s', `s = ${sForA}`), {
    activeCodeLine: 7,
    phase: I18N.phases.complete,
    decision: I18N.decisions.done,
    tone: 'complete',
  });
  yield appendPaperStep(mathLine('result-t', `t = ${tForB}`), {
    activeCodeLine: 7,
    phase: I18N.phases.complete,
    decision: I18N.decisions.done,
    tone: 'complete',
  });
  yield appendPaperStep(
    paperLine({
      id: 'result-line',
      kind: 'equation',
      indent: 0.6,
      content: i18nText(I18N.backSubLine, {
        expression: `${gcdValue} = ${formatResultLinearCombo(sForA, originalA, tForB, originalB)}`,
      }),
    }),
    {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
    },
  );
  if (scenario.presetId === 'fibonacci-chain') {
    yield appendPaperStep(sectionLine('result-check-label', I18N.resultLabels.check), {
      activeCodeLine: 7,
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'setup',
    });
    yield appendPaperStep(
      mathLine('result-check', formatResultCheck(sForA, originalA, tForB, originalB, gcdValue)),
      {
        activeCodeLine: 7,
        phase: I18N.phases.complete,
        decision: I18N.decisions.done,
        tone: 'complete',
      },
    );
  }
}
