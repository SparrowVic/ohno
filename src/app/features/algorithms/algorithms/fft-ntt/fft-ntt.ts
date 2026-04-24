import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { FftNttScenario } from '../../utils/scenarios/number-lab/fft-ntt-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

/**
 * Iterative radix-2 Cooley-Tukey FFT — chalkboard narration.
 *
 * Bit-reverses the input in place, then sweeps [[math]]\log_2 N[[/math]]
 * stages of butterflies. At stage `s` every block of `2^s` consecutive
 * values gets combined using twiddle factors
 * [[math]]\omega_m^j = e^{-2\pi i j / m}[[/math]] with `m = 2^s`. We
 * render one scratchpad equation per butterfly so the student sees
 * each `(u, t) → (u + t, u - t)` pair as its own line.
 *
 * v1 only supports real-valued inputs of power-of-two length. That
 * covers the canonical "first FFT example" (`[1, 2, 3, 4]` → `[10,
 * -2+2i, -2, -2-2i]`). Complex inputs and the NTT (modular) variant
 * land as future tasks.
 */

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.fftNtt.modeLabel'),
  goal: t('features.algorithms.runtime.scratchpadLab.fftNtt.goal'),
  rule: t('features.algorithms.runtime.scratchpadLab.fftNtt.rule'),
  invariant: t('features.algorithms.runtime.scratchpadLab.fftNtt.invariant'),
  setup: {
    input: t('features.algorithms.runtime.scratchpadLab.fftNtt.setup.input'),
    bitReverse: t('features.algorithms.runtime.scratchpadLab.fftNtt.setup.bitReverse'),
    bitReverseInstruction: t(
      'features.algorithms.runtime.scratchpadLab.fftNtt.setup.bitReverseInstruction',
    ),
  },
  stage: {
    header: t('features.algorithms.runtime.scratchpadLab.fftNtt.stage.header'),
    headerInstruction: t(
      'features.algorithms.runtime.scratchpadLab.fftNtt.stage.headerInstruction',
    ),
    butterfly: t('features.algorithms.runtime.scratchpadLab.fftNtt.stage.butterfly'),
    butterflyInstruction: t(
      'features.algorithms.runtime.scratchpadLab.fftNtt.stage.butterflyInstruction',
    ),
    twiddle: t('features.algorithms.runtime.scratchpadLab.fftNtt.stage.twiddle'),
  },
  result: {
    spectrum: t('features.algorithms.runtime.scratchpadLab.fftNtt.result.spectrum'),
    signoff: t('features.algorithms.runtime.scratchpadLab.fftNtt.result.signoff'),
    invalid: t('features.algorithms.runtime.scratchpadLab.fftNtt.result.invalid'),
  },
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.fftNtt.phases.setup'),
    butterflies: t(
      'features.algorithms.runtime.scratchpadLab.fftNtt.phases.butterflies',
    ),
    complete: t('features.algorithms.runtime.scratchpadLab.fftNtt.phases.complete'),
  },
  decisions: {
    permuting: t(
      'features.algorithms.runtime.scratchpadLab.fftNtt.decisions.permuting',
    ),
    stageStart: t(
      'features.algorithms.runtime.scratchpadLab.fftNtt.decisions.stageStart',
    ),
    butterfly: t('features.algorithms.runtime.scratchpadLab.fftNtt.decisions.butterfly'),
    done: t('features.algorithms.runtime.scratchpadLab.fftNtt.decisions.done'),
    invalid: t('features.algorithms.runtime.scratchpadLab.fftNtt.decisions.invalid'),
  },
  captions: {
    setup: t('features.algorithms.runtime.scratchpadLab.fftNtt.captions.setup'),
    stage: t('features.algorithms.runtime.scratchpadLab.fftNtt.captions.stage'),
    result: t('features.algorithms.runtime.scratchpadLab.fftNtt.captions.result'),
  },
} as const;

const SECTION_MARKERS = {
  setup: '①',
  stage: '②',
  decision: '⟹',
  result: '✓',
  failure: '✗',
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

interface Complex {
  re: number;
  im: number;
}

function cpx(re: number, im = 0): Complex {
  return { re, im };
}

function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

/** Tight formatter — integer parts show without decimals, irrationals
 *  round to three places and trim trailing zeros. Values close to 0
 *  or clean integer coordinates get collapsed so the KaTeX output
 *  stays readable. */
function fmt(x: number): string {
  if (Math.abs(x) < 1e-9) return '0';
  const rounded = Math.round(x * 1e6) / 1e6;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(3).replace(/\.?0+$/, '');
}

function fmtComplex(c: Complex): string {
  const reIsZero = Math.abs(c.re) < 1e-9;
  const imIsZero = Math.abs(c.im) < 1e-9;
  if (reIsZero && imIsZero) return '0';
  if (imIsZero) return fmt(c.re);
  if (reIsZero) return `${fmt(c.im)}i`;
  const sign = c.im < 0 ? '-' : '+';
  return `${fmt(c.re)} ${sign} ${fmt(Math.abs(c.im))}i`;
}

function fmtArray(values: readonly Complex[]): string {
  return values.map((v) => fmtComplex(v)).join(', \\, ');
}

/** Reverse the low `bits` bits of `value` — used for the bit-reversal
 *  permutation step of iterative Cooley-Tukey. */
function reverseBits(value: number, bits: number): number {
  let result = 0;
  let v = value;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (v & 1);
    v >>= 1;
  }
  return result;
}

/** Format a twiddle factor `ω_m^j = e^{-2πi j/m}` as KaTeX. For
 *  small j the canonical roots (1, -i, -1, i for m = 4) appear
 *  literally, so the generic exponential only shows up for larger
 *  transforms. */
function twiddleLatex(j: number, m: number, value: Complex): string {
  if (j === 0) return '1';
  // Round-tripping for m = 4 gives exact integer/zero coordinates.
  if (m === 2 && j === 1) return '-1';
  if (m === 4) {
    if (j === 1) return '-i';
    if (j === 2) return '-1';
    if (j === 3) return 'i';
  }
  return fmtComplex(value);
}

export function* fftNttGenerator(scenario: FftNttScenario): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const N = scenario.input.length;

  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      captionPinned: true,
      content: i18nText(I18N.goal, { N }),
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
    return {
      mode: 'fft-ntt',
      modeLabel: I18N.modeLabel,
      phaseLabel: opts.phase,
      decisionLabel: opts.decision,
      presetLabel,
      taskPrompt: scenario.taskPrompt ?? null,
      tone: opts.tone,
      lines,
      margins: [globalInvariant],
      resultLabel: opts.resultLabel,
      iteration: stepIndex,
    };
  }

  // Guard — input length must be a power of two. The scenario
  // factory falls back to task defaults when the user's input fails
  // that check, so this branch rarely fires in practice.
  if (N === 0 || (N & (N - 1)) !== 0) {
    lineBuilders.push({
      id: 'result-invalid',
      kind: 'result',
      indent: 0,
      marker: SECTION_MARKERS.failure,
      caption: I18N.captions.result,
      captionPinned: true,
      content: i18nText(I18N.result.invalid, { N }),
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 1,
      description: i18nText(I18N.result.invalid, { N }),
      state: snapshot({
        phase: I18N.phases.complete,
        decision: I18N.decisions.invalid,
        tone: 'complete',
        currentLineId: 'result-invalid',
        resultLabel: null,
      }),
    });
    return;
  }

  const bits = Math.log2(N);

  // ---------- Step 0: show input ----------
  lineBuilders.push({
    id: 'setup-input',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.setup,
    caption: I18N.captions.setup,
    captionPinned: true,
    content: i18nText(I18N.setup.input, {
      input: scenario.input.join(', '),
      N,
    }),
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.setup.input, {
      input: scenario.input.join(', '),
      N,
    }),
    state: snapshot({
      phase: I18N.phases.setup,
      decision: I18N.decisions.permuting,
      tone: 'setup',
      currentLineId: 'setup-input',
      resultLabel: null,
    }),
  });

  // ---------- Bit-reversal permutation ----------
  const data: Complex[] = scenario.input.map((v) => cpx(v));
  const permuted: Complex[] = new Array(N);
  for (let i = 0; i < N; i++) {
    permuted[reverseBits(i, bits)] = data[i];
  }
  for (let i = 0; i < N; i++) {
    data[i] = permuted[i];
  }

  lineBuilders.push({
    id: 'setup-bit-reverse',
    kind: 'substitute',
    indent: 1,
    marker: null,
    caption: null,
    content: i18nText(I18N.setup.bitReverse, {
      result: `[${fmtArray(data)}]`,
    }),
    instruction: I18N.setup.bitReverseInstruction,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 2,
    description: i18nText(I18N.setup.bitReverse, {
      result: `[${fmtArray(data)}]`,
    }),
    state: snapshot({
      phase: I18N.phases.setup,
      decision: I18N.decisions.permuting,
      tone: 'substitute',
      currentLineId: 'setup-bit-reverse',
      resultLabel: null,
    }),
  });

  // ---------- Stage sweep ----------
  for (let s = 1; s <= bits; s++) {
    const m = 1 << s;
    const half = m >> 1;
    const theta = (-2 * Math.PI) / m;
    const wRoot: Complex = { re: Math.cos(theta), im: Math.sin(theta) };

    const stageHeaderId = `stage-${s}-header`;
    lineBuilders.push({
      id: stageHeaderId,
      kind: 'note',
      indent: 0,
      marker: SECTION_MARKERS.stage,
      caption: I18N.captions.stage,
      captionPinned: true,
      content: i18nText(I18N.stage.header, { stage: s, m }),
      instruction: i18nText(I18N.stage.headerInstruction, { m }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.stage.header, { stage: s, m }),
      state: snapshot({
        phase: I18N.phases.butterflies,
        decision: I18N.decisions.stageStart,
        tone: 'compute',
        currentLineId: stageHeaderId,
        resultLabel: null,
      }),
    });

    // Walk every block of width m, applying m/2 butterflies each.
    for (let k = 0; k < N; k += m) {
      let w: Complex = cpx(1);
      for (let j = 0; j < half; j++) {
        const upperIdx = k + j;
        const lowerIdx = k + j + half;
        const u = data[upperIdx];
        const t = mul(w, data[lowerIdx]);
        const uPlus = add(u, t);
        const uMinus = sub(u, t);

        const bfId = `stage-${s}-block-${k}-j-${j}`;
        lineBuilders.push({
          id: bfId,
          kind: 'substitute',
          indent: 1,
          marker: null,
          caption: null,
          content: i18nText(I18N.stage.butterfly, {
            upperIdx,
            lowerIdx,
            u: fmtComplex(u),
            t: fmtComplex(t),
            uPlus: fmtComplex(uPlus),
            uMinus: fmtComplex(uMinus),
          }),
          instruction: i18nText(I18N.stage.butterflyInstruction, {
            upperIdx,
            lowerIdx,
          }),
          annotation: i18nText(I18N.stage.twiddle, {
            j,
            m,
            value: twiddleLatex(j, m, w),
          }),
        });
        stepIndex += 1;
        yield createScratchpadLabStep({
          activeCodeLine: 4,
          description: i18nText(I18N.stage.butterfly, {
            upperIdx,
            lowerIdx,
            u: fmtComplex(u),
            t: fmtComplex(t),
            uPlus: fmtComplex(uPlus),
            uMinus: fmtComplex(uMinus),
          }),
          state: snapshot({
            phase: I18N.phases.butterflies,
            decision: I18N.decisions.butterfly,
            tone: 'substitute',
            currentLineId: bfId,
            resultLabel: null,
          }),
        });

        data[upperIdx] = uPlus;
        data[lowerIdx] = uMinus;
        w = mul(w, wRoot);
      }
    }
  }

  // ---------- Result ----------
  const spectrum = `[${fmtArray(data)}]`;
  lineBuilders.push({
    id: 'result',
    kind: 'result',
    indent: 0,
    marker: SECTION_MARKERS.result,
    caption: I18N.captions.result,
    captionPinned: true,
    content: i18nText(I18N.result.spectrum, { spectrum }),
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 5,
    description: i18nText(I18N.result.spectrum, { spectrum }),
    state: snapshot({
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      currentLineId: 'result',
      resultLabel: i18nText(I18N.result.signoff, { spectrum }),
    }),
  });
}
