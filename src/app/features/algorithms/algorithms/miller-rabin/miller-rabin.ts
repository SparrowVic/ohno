import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { MillerRabinScenario } from '../../utils/scenarios/number-lab/miller-rabin-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

/**
 * Miller-Rabin primality test — chalkboard narration.
 *
 * Given an odd integer `n > 3` and a list of witness bases, decide
 * whether `n` is composite (definitive) or "probably prime" (every
 * witness passed). Setup writes `n − 1 = 2^r · d` with `d` odd;
 * then for each witness `a` the scratchpad walks the square chain
 * `x = a^d mod n`, `x ← x² mod n` until either `x = 1` / `x = n − 1`
 * (witness passes) or the chain completes without hitting `n − 1`
 * (witness proves compositeness).
 *
 * This is a scratchpad-only algorithm — no register dashboard would
 * add anything over the derivation itself, which is the whole point.
 */

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.millerRabin.modeLabel'),
  goal: t('features.algorithms.runtime.scratchpadLab.millerRabin.goal'),
  rule: t('features.algorithms.runtime.scratchpadLab.millerRabin.rule'),
  invariant: t('features.algorithms.runtime.scratchpadLab.millerRabin.invariant'),
  setup: {
    decompose: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.setup.decompose',
    ),
    decomposeInstruction: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.setup.decomposeInstruction',
    ),
    decomposeAnnotation: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.setup.decomposeAnnotation',
    ),
  },
  witness: {
    header: t('features.algorithms.runtime.scratchpadLab.millerRabin.witness.header'),
    seed: t('features.algorithms.runtime.scratchpadLab.millerRabin.witness.seed'),
    seedInstruction: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.witness.seedInstruction',
    ),
    squareStep: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.witness.squareStep',
    ),
    squareStepInstruction: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.witness.squareStepInstruction',
    ),
    passImmediate: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.witness.passImmediate',
    ),
    passMinusOne: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.witness.passMinusOne',
    ),
    witnessFound: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.witness.witnessFound',
    ),
  },
  result: {
    probablyPrime: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.probablyPrime',
    ),
    composite: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.composite',
    ),
    signoffPrime: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.signoffPrime',
    ),
    signoffComposite: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.result.signoffComposite',
    ),
  },
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.millerRabin.phases.setup'),
    witness: t('features.algorithms.runtime.scratchpadLab.millerRabin.phases.witness'),
    decide: t('features.algorithms.runtime.scratchpadLab.millerRabin.phases.decide'),
    complete: t('features.algorithms.runtime.scratchpadLab.millerRabin.phases.complete'),
  },
  decisions: {
    decomposing: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.decisions.decomposing',
    ),
    seeding: t('features.algorithms.runtime.scratchpadLab.millerRabin.decisions.seeding'),
    squaring: t('features.algorithms.runtime.scratchpadLab.millerRabin.decisions.squaring'),
    witnessPassed: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.decisions.witnessPassed',
    ),
    witnessFailed: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.decisions.witnessFailed',
    ),
    probablyPrime: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.decisions.probablyPrime',
    ),
    composite: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.decisions.composite',
    ),
  },
  captions: {
    setup: t('features.algorithms.runtime.scratchpadLab.millerRabin.captions.setup'),
    witnessStart: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.captions.witnessStart',
    ),
    squareChain: t(
      'features.algorithms.runtime.scratchpadLab.millerRabin.captions.squareChain',
    ),
    verdict: t('features.algorithms.runtime.scratchpadLab.millerRabin.captions.verdict'),
    result: t('features.algorithms.runtime.scratchpadLab.millerRabin.captions.result'),
  },
} as const;

const SECTION_MARKERS = {
  setup: '①',
  witness: '②',
  decision: '⟹',
  result: '✓',
  composite: '✗',
} as const;

type LineBuilder = {
  readonly id: string;
  readonly kind: ScratchpadLine['kind'];
  readonly indent: number;
  readonly marker: string | null;
  readonly caption: ScratchpadLine['caption'];
  readonly captionPinned?: boolean;
  readonly content: ScratchpadLine['content'];
  readonly instruction: ScratchpadLine['instruction'];
  readonly annotation: ScratchpadLine['annotation'];
};

/** Decompose `n − 1 = 2^r · d` with `d` odd. Used both for the setup
 *  line and for driving the witness-chain length. */
function decompose(nMinusOne: number): { readonly r: number; readonly d: number } {
  let r = 0;
  let d = nMinusOne;
  while (d % 2 === 0) {
    d /= 2;
    r += 1;
  }
  return { r, d };
}

/** Modular exponentiation — `base^exp mod m`. Kept tiny and allocation-
 *  free; inputs in our scenarios are small enough that BigInt is
 *  overkill. */
function modPow(base: number, exp: number, m: number): number {
  let result = 1;
  let b = base % m;
  let e = exp;
  while (e > 0) {
    if ((e & 1) === 1) result = (result * b) % m;
    e >>= 1;
    b = (b * b) % m;
  }
  return result;
}

interface WitnessOutcome {
  readonly witness: number;
  readonly seed: number;
  readonly squares: readonly number[];
  readonly verdict: 'immediate' | 'minus-one-seed' | 'minus-one-square' | 'composite';
  /** For `minus-one-square`: the index in `squares` at which `x = n-1`
   *  was hit (0-based). Null otherwise. */
  readonly minusOneAt: number | null;
}

/** Run one full Miller-Rabin witness check and describe the outcome
 *  as a record. Pure data — the generator turns it into scratchpad
 *  lines separately. */
function runWitness(a: number, d: number, r: number, n: number): WitnessOutcome {
  const seed = modPow(a, d, n);
  if (seed === 1) {
    return { witness: a, seed, squares: [], verdict: 'immediate', minusOneAt: null };
  }
  if (seed === n - 1) {
    return { witness: a, seed, squares: [], verdict: 'minus-one-seed', minusOneAt: null };
  }
  const squares: number[] = [];
  let x = seed;
  for (let i = 0; i < r - 1; i++) {
    x = (x * x) % n;
    squares.push(x);
    if (x === n - 1) {
      return { witness: a, seed, squares, verdict: 'minus-one-square', minusOneAt: i };
    }
    if (x === 1) {
      // Non-trivial square root of 1 — `n` is composite. We stop the
      // chain here (further squaring would stay at 1 and add noise).
      return { witness: a, seed, squares, verdict: 'composite', minusOneAt: null };
    }
  }
  return { witness: a, seed, squares, verdict: 'composite', minusOneAt: null };
}

export function* millerRabinGenerator(scenario: MillerRabinScenario): Generator<SortStep> {
  const n = scenario.n;
  const presetLabel = scenario.presetLabel;
  const { r, d } = decompose(n - 1);

  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      captionPinned: true,
      content: i18nText(I18N.goal, { n }),
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
      mode: 'miller-rabin',
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

  // ---------- Step 0: decompose n - 1 ----------
  lineBuilders.push({
    id: 'setup',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.setup,
    caption: I18N.captions.setup,
    captionPinned: true,
    content: i18nText(I18N.setup.decompose, { n: n - 1, r, d }),
    instruction: i18nText(I18N.setup.decomposeInstruction, { n }),
    annotation: i18nText(I18N.setup.decomposeAnnotation, { r, d }),
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.setup.decomposeInstruction, { n }),
    state: snapshot({
      phase: I18N.phases.setup,
      decision: I18N.decisions.decomposing,
      tone: 'setup',
      currentLineId: 'setup',
      transientMargin: null,
      resultLabel: null,
    }),
  });

  // ---------- Witness loop ----------
  let compositeProof: WitnessOutcome | null = null;

  for (let wi = 0; wi < scenario.witnesses.length; wi++) {
    const a = scenario.witnesses[wi];
    const outcome = runWitness(a, d, r, n);

    // Witness header line — announces `a = …` before the chain unfolds.
    const headerId = `witness-${wi}-header`;
    lineBuilders.push({
      id: headerId,
      kind: 'note',
      indent: 0,
      marker: SECTION_MARKERS.witness,
      caption: I18N.captions.witnessStart,
      captionPinned: true,
      content: i18nText(I18N.witness.header, { a, index: wi + 1 }),
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 2,
      description: i18nText(I18N.witness.header, { a, index: wi + 1 }),
      state: snapshot({
        phase: I18N.phases.witness,
        decision: I18N.decisions.seeding,
        tone: 'compute',
        currentLineId: headerId,
        transientMargin: null,
        resultLabel: null,
      }),
    });

    // Seed line — x = a^d mod n.
    const seedId = `witness-${wi}-seed`;
    lineBuilders.push({
      id: seedId,
      kind: 'equation',
      indent: 1,
      marker: null,
      caption: I18N.captions.squareChain,
      captionPinned: false,
      content: i18nText(I18N.witness.seed, { a, d, n, seed: outcome.seed }),
      instruction: i18nText(I18N.witness.seedInstruction, { a, d, n }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.witness.seed, { a, d, n, seed: outcome.seed }),
      state: snapshot({
        phase: I18N.phases.witness,
        decision: I18N.decisions.seeding,
        tone: 'compute',
        currentLineId: seedId,
        transientMargin: null,
        resultLabel: null,
      }),
    });

    // Immediate pass — seed = 1 or seed = n-1.
    if (outcome.verdict === 'immediate' || outcome.verdict === 'minus-one-seed') {
      const passId = `witness-${wi}-pass`;
      const passContent =
        outcome.verdict === 'immediate'
          ? i18nText(I18N.witness.passImmediate, { a })
          : i18nText(I18N.witness.passMinusOne, { a, n: n - 1 });
      lineBuilders.push({
        id: passId,
        kind: 'decision',
        indent: 1,
        marker: SECTION_MARKERS.decision,
        caption: I18N.captions.verdict,
        captionPinned: true,
        content: passContent,
        instruction: null,
        annotation: null,
      });
      stepIndex += 1;
      yield createScratchpadLabStep({
        activeCodeLine: 4,
        description: passContent,
        state: snapshot({
          phase: I18N.phases.witness,
          decision: I18N.decisions.witnessPassed,
          tone: 'decide',
          currentLineId: passId,
          transientMargin: null,
          resultLabel: null,
        }),
      });
      continue;
    }

    // Square chain — emit one line per x ← x² mod n up to r-1 steps.
    for (let si = 0; si < outcome.squares.length; si++) {
      const x = outcome.squares[si];
      const prev = si === 0 ? outcome.seed : outcome.squares[si - 1];
      const sqId = `witness-${wi}-sq-${si}`;
      lineBuilders.push({
        id: sqId,
        kind: 'substitute',
        indent: 1,
        marker: null,
        caption: I18N.captions.squareChain,
        captionPinned: false,
        content: i18nText(I18N.witness.squareStep, {
          prev,
          n,
          x,
          step: si + 1,
        }),
        instruction: i18nText(I18N.witness.squareStepInstruction, { prev, n }),
        annotation: null,
      });
      stepIndex += 1;
      yield createScratchpadLabStep({
        activeCodeLine: 5,
        description: i18nText(I18N.witness.squareStep, {
          prev,
          n,
          x,
          step: si + 1,
        }),
        state: snapshot({
          phase: I18N.phases.witness,
          decision: I18N.decisions.squaring,
          tone: 'substitute',
          currentLineId: sqId,
          transientMargin: null,
          resultLabel: null,
        }),
      });
    }

    // Verdict for this witness.
    const verdictId = `witness-${wi}-verdict`;
    if (outcome.verdict === 'minus-one-square') {
      lineBuilders.push({
        id: verdictId,
        kind: 'decision',
        indent: 1,
        marker: SECTION_MARKERS.decision,
        caption: I18N.captions.verdict,
        captionPinned: true,
        content: i18nText(I18N.witness.passMinusOne, { a, n: n - 1 }),
        instruction: null,
        annotation: null,
      });
      stepIndex += 1;
      yield createScratchpadLabStep({
        activeCodeLine: 4,
        description: i18nText(I18N.witness.passMinusOne, { a, n: n - 1 }),
        state: snapshot({
          phase: I18N.phases.witness,
          decision: I18N.decisions.witnessPassed,
          tone: 'decide',
          currentLineId: verdictId,
          transientMargin: null,
          resultLabel: null,
        }),
      });
      continue;
    }

    // `composite` — compositeness witness found; we still show the line,
    // then break out of the witness loop.
    lineBuilders.push({
      id: verdictId,
      kind: 'decision',
      indent: 1,
      marker: SECTION_MARKERS.composite,
      caption: I18N.captions.verdict,
      captionPinned: true,
      content: i18nText(I18N.witness.witnessFound, { a, n }),
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 6,
      description: i18nText(I18N.witness.witnessFound, { a, n }),
      state: snapshot({
        phase: I18N.phases.decide,
        decision: I18N.decisions.witnessFailed,
        tone: 'decide',
        currentLineId: verdictId,
        transientMargin: null,
        resultLabel: null,
      }),
    });
    compositeProof = outcome;
    break;
  }

  // ---------- Final verdict ----------
  const resultId = 'result';
  if (compositeProof !== null) {
    lineBuilders.push({
      id: resultId,
      kind: 'result',
      indent: 0,
      marker: SECTION_MARKERS.composite,
      caption: I18N.captions.result,
      captionPinned: true,
      content: i18nText(I18N.result.composite, { n, a: compositeProof.witness }),
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 7,
      description: i18nText(I18N.result.composite, { n, a: compositeProof.witness }),
      state: snapshot({
        phase: I18N.phases.complete,
        decision: I18N.decisions.composite,
        tone: 'complete',
        currentLineId: resultId,
        transientMargin: null,
        resultLabel: i18nText(I18N.result.signoffComposite, {
          n,
          a: compositeProof.witness,
        }),
      }),
    });
    return;
  }

  lineBuilders.push({
    id: resultId,
    kind: 'result',
    indent: 0,
    marker: SECTION_MARKERS.result,
    caption: I18N.captions.result,
    captionPinned: true,
    content: i18nText(I18N.result.probablyPrime, {
      n,
      count: scenario.witnesses.length,
    }),
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 8,
    description: i18nText(I18N.result.probablyPrime, {
      n,
      count: scenario.witnesses.length,
    }),
    state: snapshot({
      phase: I18N.phases.complete,
      decision: I18N.decisions.probablyPrime,
      tone: 'complete',
      currentLineId: resultId,
      transientMargin: null,
      resultLabel: i18nText(I18N.result.signoffPrime, { n }),
    }),
  });
}
