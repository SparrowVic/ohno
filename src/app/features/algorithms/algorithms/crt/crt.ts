import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { CrtScenario } from '../../utils/scenarios/number-lab/crt-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

/**
 * Chinese Remainder Theorem — chalkboard narration.
 *
 * Given a system `{x ≡ rᵢ (mod mᵢ)}` with pairwise coprime moduli,
 * reconstruct the unique solution `x mod M` where `M = Πmᵢ`. The
 * classical construction: for each i, build
 *   Mᵢ = M / mᵢ,
 *   yᵢ = Mᵢ⁻¹ (mod mᵢ),
 *   partial = rᵢ · Mᵢ · yᵢ,
 * then sum the partials and reduce modulo M.
 */

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.crt.modeLabel'),
  goal: t('features.algorithms.runtime.scratchpadLab.crt.goal'),
  rule: t('features.algorithms.runtime.scratchpadLab.crt.rule'),
  invariant: t('features.algorithms.runtime.scratchpadLab.crt.invariant'),
  systemLine: t('features.algorithms.runtime.scratchpadLab.crt.systemLine'),
  setup: {
    productLine: t('features.algorithms.runtime.scratchpadLab.crt.setup.productLine'),
    productInstruction: t(
      'features.algorithms.runtime.scratchpadLab.crt.setup.productInstruction',
    ),
    productAnnotation: t(
      'features.algorithms.runtime.scratchpadLab.crt.setup.productAnnotation',
    ),
  },
  term: {
    header: t('features.algorithms.runtime.scratchpadLab.crt.term.header'),
    bigM: t('features.algorithms.runtime.scratchpadLab.crt.term.bigM'),
    bigMInstruction: t(
      'features.algorithms.runtime.scratchpadLab.crt.term.bigMInstruction',
    ),
    reducedM: t('features.algorithms.runtime.scratchpadLab.crt.term.reducedM'),
    reducedMInstruction: t(
      'features.algorithms.runtime.scratchpadLab.crt.term.reducedMInstruction',
    ),
    inverse: t('features.algorithms.runtime.scratchpadLab.crt.term.inverse'),
    inverseInstruction: t(
      'features.algorithms.runtime.scratchpadLab.crt.term.inverseInstruction',
    ),
    partial: t('features.algorithms.runtime.scratchpadLab.crt.term.partial'),
    partialInstruction: t(
      'features.algorithms.runtime.scratchpadLab.crt.term.partialInstruction',
    ),
  },
  sum: {
    line: t('features.algorithms.runtime.scratchpadLab.crt.sum.line'),
    instruction: t('features.algorithms.runtime.scratchpadLab.crt.sum.instruction'),
    reduce: t('features.algorithms.runtime.scratchpadLab.crt.sum.reduce'),
    reduceInstruction: t(
      'features.algorithms.runtime.scratchpadLab.crt.sum.reduceInstruction',
    ),
  },
  result: {
    line: t('features.algorithms.runtime.scratchpadLab.crt.result.line'),
    signoff: t('features.algorithms.runtime.scratchpadLab.crt.result.signoff'),
  },
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.crt.phases.setup'),
    terms: t('features.algorithms.runtime.scratchpadLab.crt.phases.terms'),
    combine: t('features.algorithms.runtime.scratchpadLab.crt.phases.combine'),
    complete: t('features.algorithms.runtime.scratchpadLab.crt.phases.complete'),
  },
  decisions: {
    product: t('features.algorithms.runtime.scratchpadLab.crt.decisions.product'),
    buildingTerm: t(
      'features.algorithms.runtime.scratchpadLab.crt.decisions.buildingTerm',
    ),
    summing: t('features.algorithms.runtime.scratchpadLab.crt.decisions.summing'),
    reducing: t('features.algorithms.runtime.scratchpadLab.crt.decisions.reducing'),
    done: t('features.algorithms.runtime.scratchpadLab.crt.decisions.done'),
  },
  captions: {
    system: t('features.algorithms.runtime.scratchpadLab.crt.captions.system'),
    setup: t('features.algorithms.runtime.scratchpadLab.crt.captions.setup'),
    termStart: t('features.algorithms.runtime.scratchpadLab.crt.captions.termStart'),
    sum: t('features.algorithms.runtime.scratchpadLab.crt.captions.sum'),
    reduce: t('features.algorithms.runtime.scratchpadLab.crt.captions.reduce'),
    result: t('features.algorithms.runtime.scratchpadLab.crt.captions.result'),
  },
} as const;

const SECTION_MARKERS = {
  system: '◆',
  setup: '①',
  term: '②',
  sum: '⟹',
  result: '✓',
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

/** Modular inverse of `a` mod `m` via extended Euclidean. Returns NaN
 *  when no inverse exists (gcd(a, m) ≠ 1). Callers in this module run
 *  only over pre-validated coprime inputs, so NaN shouldn't surface in
 *  practice — but we guard against it to keep the generator honest. */
function modInverse(a: number, m: number): number {
  let [old_r, r] = [((a % m) + m) % m, m];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1) return Number.NaN;
  return ((old_s % m) + m) % m;
}

function product(values: readonly number[]): number {
  return values.reduce((acc, v) => acc * v, 1);
}

export function* crtGenerator(scenario: CrtScenario): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const system = scenario.congruences;
  const moduli = system.map((c) => c.modulus);
  const M = product(moduli);

  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      captionPinned: true,
      content: i18nText(I18N.goal, { count: system.length, M }),
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
  ];

  // The system itself, one line per congruence — written up front so
  // the student can glance back at the input without scrolling.
  for (let i = 0; i < system.length; i++) {
    const { residue, modulus } = system[i];
    lineBuilders.push({
      id: `system-${i}`,
      kind: 'equation',
      indent: 1,
      marker: i === 0 ? SECTION_MARKERS.system : null,
      caption: i === 0 ? I18N.captions.system : null,
      captionPinned: i === 0,
      content: i18nText(I18N.systemLine, { r: residue, m: modulus, index: i + 1 }),
      instruction: null,
      annotation: null,
    });
  }
  lineBuilders.push({
    id: 'divider-post',
    kind: 'divider',
    indent: 0,
    marker: null,
    caption: null,
    content: '',
    instruction: null,
    annotation: null,
  });

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
      mode: 'crt',
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

  // ---------- Setup: M = m1 · m2 · ... ----------
  lineBuilders.push({
    id: 'setup-product',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.setup,
    caption: I18N.captions.setup,
    captionPinned: true,
    content: i18nText(I18N.setup.productLine, {
      product: moduli.join(' \\cdot '),
      M,
    }),
    instruction: I18N.setup.productInstruction,
    annotation: i18nText(I18N.setup.productAnnotation, { M }),
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.setup.productInstruction, {}),
    state: snapshot({
      phase: I18N.phases.setup,
      decision: I18N.decisions.product,
      tone: 'setup',
      currentLineId: 'setup-product',
      transientMargin: null,
      resultLabel: null,
    }),
  });

  // ---------- Per-term construction ----------
  const partials: number[] = [];
  for (let i = 0; i < system.length; i++) {
    const { residue, modulus } = system[i];
    const Mi = M / modulus;
    const Mi_mod = ((Mi % modulus) + modulus) % modulus;
    const yi = modInverse(Mi_mod, modulus);
    const partial = residue * Mi * yi;
    partials.push(partial);

    const headerId = `term-${i}-header`;
    lineBuilders.push({
      id: headerId,
      kind: 'note',
      indent: 0,
      marker: SECTION_MARKERS.term,
      caption: I18N.captions.termStart,
      captionPinned: true,
      content: i18nText(I18N.term.header, { index: i + 1, r: residue, m: modulus }),
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 2,
      description: i18nText(I18N.term.header, { index: i + 1, r: residue, m: modulus }),
      state: snapshot({
        phase: I18N.phases.terms,
        decision: I18N.decisions.buildingTerm,
        tone: 'compute',
        currentLineId: headerId,
        transientMargin: null,
        resultLabel: null,
      }),
    });

    const bigMId = `term-${i}-bigM`;
    lineBuilders.push({
      id: bigMId,
      kind: 'substitute',
      indent: 1,
      marker: null,
      caption: null,
      content: i18nText(I18N.term.bigM, { M, m: modulus, Mi, index: i + 1 }),
      instruction: i18nText(I18N.term.bigMInstruction, { M, m: modulus }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.term.bigM, { M, m: modulus, Mi, index: i + 1 }),
      state: snapshot({
        phase: I18N.phases.terms,
        decision: I18N.decisions.buildingTerm,
        tone: 'compute',
        currentLineId: bigMId,
        transientMargin: null,
        resultLabel: null,
      }),
    });

    const reducedId = `term-${i}-reduced`;
    lineBuilders.push({
      id: reducedId,
      kind: 'substitute',
      indent: 1,
      marker: null,
      caption: null,
      content: i18nText(I18N.term.reducedM, { Mi, m: modulus, r: Mi_mod, index: i + 1 }),
      instruction: i18nText(I18N.term.reducedMInstruction, { Mi, m: modulus }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.term.reducedM, { Mi, m: modulus, r: Mi_mod, index: i + 1 }),
      state: snapshot({
        phase: I18N.phases.terms,
        decision: I18N.decisions.buildingTerm,
        tone: 'substitute',
        currentLineId: reducedId,
        transientMargin: null,
        resultLabel: null,
      }),
    });

    const invId = `term-${i}-inv`;
    lineBuilders.push({
      id: invId,
      kind: 'substitute',
      indent: 1,
      marker: null,
      caption: null,
      content: i18nText(I18N.term.inverse, { Mi_mod, m: modulus, y: yi, index: i + 1 }),
      instruction: i18nText(I18N.term.inverseInstruction, { Mi_mod, m: modulus }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 5,
      description: i18nText(I18N.term.inverse, { Mi_mod, m: modulus, y: yi, index: i + 1 }),
      state: snapshot({
        phase: I18N.phases.terms,
        decision: I18N.decisions.buildingTerm,
        tone: 'substitute',
        currentLineId: invId,
        transientMargin: null,
        resultLabel: null,
      }),
    });

    const partialId = `term-${i}-partial`;
    lineBuilders.push({
      id: partialId,
      kind: 'decision',
      indent: 1,
      marker: null,
      caption: null,
      content: i18nText(I18N.term.partial, {
        r: residue,
        Mi,
        y: yi,
        partial,
        index: i + 1,
      }),
      instruction: i18nText(I18N.term.partialInstruction, { r: residue, Mi, y: yi }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 6,
      description: i18nText(I18N.term.partial, {
        r: residue,
        Mi,
        y: yi,
        partial,
        index: i + 1,
      }),
      state: snapshot({
        phase: I18N.phases.terms,
        decision: I18N.decisions.buildingTerm,
        tone: 'decide',
        currentLineId: partialId,
        transientMargin: null,
        resultLabel: null,
      }),
    });
  }

  // ---------- Sum + reduce ----------
  const sum = partials.reduce((a, b) => a + b, 0);
  const x = ((sum % M) + M) % M;

  lineBuilders.push({
    id: 'sum',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.sum,
    caption: I18N.captions.sum,
    captionPinned: true,
    content: i18nText(I18N.sum.line, {
      terms: partials.join(' + '),
      sum,
    }),
    instruction: I18N.sum.instruction,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 7,
    description: i18nText(I18N.sum.instruction, {}),
    state: snapshot({
      phase: I18N.phases.combine,
      decision: I18N.decisions.summing,
      tone: 'compute',
      currentLineId: 'sum',
      transientMargin: null,
      resultLabel: null,
    }),
  });

  lineBuilders.push({
    id: 'reduce',
    kind: 'substitute',
    indent: 0,
    marker: null,
    caption: I18N.captions.reduce,
    captionPinned: true,
    content: i18nText(I18N.sum.reduce, { sum, M, x }),
    instruction: i18nText(I18N.sum.reduceInstruction, { sum, M }),
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 8,
    description: i18nText(I18N.sum.reduce, { sum, M, x }),
    state: snapshot({
      phase: I18N.phases.combine,
      decision: I18N.decisions.reducing,
      tone: 'substitute',
      currentLineId: 'reduce',
      transientMargin: null,
      resultLabel: null,
    }),
  });

  lineBuilders.push({
    id: 'result',
    kind: 'result',
    indent: 0,
    marker: SECTION_MARKERS.result,
    caption: I18N.captions.result,
    captionPinned: true,
    content: i18nText(I18N.result.line, { x, M }),
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 9,
    description: i18nText(I18N.result.line, { x, M }),
    state: snapshot({
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      currentLineId: 'result',
      transientMargin: null,
      resultLabel: i18nText(I18N.result.signoff, { x, M }),
    }),
  });
}
