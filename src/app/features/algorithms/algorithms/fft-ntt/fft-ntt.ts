import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { FftNttScenario } from '../../utils/scenarios/number-lab/fft-ntt-scenarios';
import { NOTEBOOK_TEXT } from '../notebook-text';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.fftNtt.modeLabel'),
  notes: {
    rootConclusion: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.rootConclusion'),
    beforeReduction: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.beforeReduction'),
    lengthTwoRoot: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.lengthTwoRoot'),
    forK: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.forK'),
    cyclic: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.cyclic'),
    digitsOrder: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.digitsOrder'),
    digitsLowFirst: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.digitsLowFirst'),
    reversed: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.reversed'),
    checkPowers: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.checkPowers'),
    primitiveRequirement: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.primitiveRequirement'),
    badOrder: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.badOrder'),
    twoVectors: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.twoVectors'),
    collision: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.collision'),
    repairConclusion: t('features.algorithms.runtime.scratchpadLab.fftNtt.notes.repairConclusion'),
  },
  sections: {
    split: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.split'),
    evenFft: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.evenFft'),
    oddFft: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.oddFft'),
    butterflies: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.butterflies'),
    badSettings: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.badSettings'),
    nttLength: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.nttLength'),
    goodSettings: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.goodSettings'),
    goodNtt: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.goodNtt'),
    digits: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.digits'),
    transform: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.transform'),
    carry: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.carry'),
    badRoot: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.badRoot'),
    collision: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.collision'),
    repair: t('features.algorithms.runtime.scratchpadLab.fftNtt.sections.repair'),
  },
  lines: {
    carryRow: t('features.algorithms.runtime.scratchpadLab.fftNtt.lines.carryRow'),
    badRoot: t('features.algorithms.runtime.scratchpadLab.fftNtt.lines.badRoot'),
    goodRoot: t('features.algorithms.runtime.scratchpadLab.fftNtt.lines.goodRoot'),
  },
  phases: {
    root: t('features.algorithms.runtime.scratchpadLab.fftNtt.phases.root'),
    carries: t('features.algorithms.runtime.scratchpadLab.fftNtt.phases.carries'),
  },
} as const;

const CALCULATION_INDENT = 1;
const RESULT_MARKER = '✓';

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
  readonly re: number;
  readonly im: number;
}

export function* fftNttGenerator(scenario: FftNttScenario): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const values = scenario.values;
  const lineBuilders: LineBuilder[] = [];
  let stepIndex = 0;

  function snapshot(opts: {
    readonly phase: ScratchpadLabTraceState['phaseLabel'];
    readonly decision: ScratchpadLabTraceState['decisionLabel'];
    readonly tone: ScratchpadLabTraceState['tone'];
    readonly currentLineId: string;
  }): ScratchpadLabTraceState {
    const currentIdx = lineBuilders.findIndex((line) => line.id === opts.currentLineId);
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
      margins: [],
      resultLabel: null,
      iteration: stepIndex,
    };
  }

  function appendStep(
    builder: LineBuilder,
    opts: {
      readonly activeCodeLine: number;
      readonly phase: ScratchpadLabTraceState['phaseLabel'];
      readonly decision: ScratchpadLabTraceState['decisionLabel'];
      readonly tone: ScratchpadLabTraceState['tone'];
    },
  ): SortStep {
    lineBuilders.push(builder);
    stepIndex += 1;
    return createScratchpadLabStep({
      activeCodeLine: opts.activeCodeLine,
      description: builder.content,
      state: snapshot({ ...opts, currentLineId: builder.id }),
    });
  }

  function paperLine(opts: {
    readonly id: string;
    readonly kind: ScratchpadLine['kind'];
    readonly content: ScratchpadLine['content'];
    readonly indent?: number;
    readonly marker?: string | null;
  }): LineBuilder {
    const defaultIndent =
      opts.kind === 'equation' || opts.kind === 'substitute' || opts.kind === 'decision'
        ? CALCULATION_INDENT
        : 0;
    return {
      id: opts.id,
      kind: opts.kind,
      indent: opts.indent ?? defaultIndent,
      marker: opts.marker ?? null,
      caption: null,
      captionPinned: false,
      content: opts.content,
      instruction: null,
      annotation: null,
    };
  }

  function section(id: string, content: TranslatableText): LineBuilder {
    return paperLine({ id, kind: 'note', content });
  }

  function note(id: string, content: TranslatableText, indent = CALCULATION_INDENT): LineBuilder {
    return paperLine({ id, kind: 'note', content, indent });
  }

  function math(id: string, expression: string, indent = CALCULATION_INDENT): LineBuilder {
    return paperLine({
      id,
      kind: 'equation',
      indent,
      content: `[[math]]${expression}[[/math]]`,
    });
  }

  function mathText(id: string, content: TranslatableText, indent = CALCULATION_INDENT): LineBuilder {
    return paperLine({ id, kind: 'equation', indent, content });
  }

  function resultSection(): LineBuilder {
    return paperLine({
      id: 'section-result',
      kind: 'result',
      marker: RESULT_MARKER,
      content: i18nText(NOTEBOOK_TEXT.sections.result),
    });
  }

  function* emit(builder: LineBuilder, activeCodeLine = 1): Generator<SortStep> {
    yield appendStep(builder, {
      activeCodeLine,
      phase: phaseFor(builder),
      decision: decisionFor(builder),
      tone: toneFor(builder),
    });
  }

  function* emitNttConvolution(): Generator<SortStep> {
    const a = pad(values.A, values.n);
    const b = pad(values.B, values.n);
    const transformedA = ntt(a, values.n, values.omega, values.mod);
    const transformedB = ntt(b, values.n, values.omega, values.mod);
    const multiplied = pointwise(transformedA, transformedB, values.mod);
    const inverse = intt(multiplied, values.n, values.omega, values.mod);
    const rawConvolution = linearConvolution(a, b).slice(0, values.n);
    const rawReduced = rawConvolution.map((value) => normalizeModulo(value, values.mod));
    const omegaHalf = modPow(values.omega, Math.floor(values.n / 2), values.mod);
    const omegaFull = modPow(values.omega, values.n, values.mod);

    yield* emit(section('section-parameters', i18nText(NOTEBOOK_TEXT.sections.parameters)));
    yield* emit(math('parameters-mod', `mod = ${values.mod}`));
    yield* emit(math('parameters-n', `n = ${values.n}`));
    yield* emit(math('parameters-omega', `\\omega = ${values.omega}`));
    yield* emit(math('parameters-a', `A = ${formatVector(a)}`));
    yield* emit(math('parameters-b', `B = ${formatVector(b)}`));

    yield* emit(section('section-root', i18nText(NOTEBOOK_TEXT.sections.rootCheck)));
    yield* emit(
      math(
        'root-half',
        `${values.omega}^${Math.floor(values.n / 2)} \\;\\mathrm{mod}\\; ${values.mod} = ${omegaHalf}${omegaHalf === values.mod - 1 ? ` = -1 \\;\\mathrm{mod}\\; ${values.mod}` : ''}`,
      ),
    );
    yield* emit(
      math(
        'root-full',
        `${values.omega}^${values.n} \\;\\mathrm{mod}\\; ${values.mod} = ${omegaFull}`,
      ),
    );
    yield* emit(
      note(
        'root-conclusion',
        i18nText(I18N.notes.rootConclusion, { omega: values.omega, n: values.n, mod: values.mod }),
      ),
    );

    yield* emit(section('section-transform-a', i18nText(NOTEBOOK_TEXT.sections.transformA)));
    yield* emit(math('transform-a', `NTT(A) = ${formatVector(transformedA)}`));

    yield* emit(section('section-transform-b', i18nText(NOTEBOOK_TEXT.sections.transformB)));
    yield* emit(math('transform-b', `NTT(B) = ${formatVector(transformedB)}`));

    yield* emit(section('section-pointwise', i18nText(NOTEBOOK_TEXT.sections.pointwise)));
    for (let i = 0; i < values.n; i++) {
      yield* emit(
        math(
          `pointwise-${i}`,
          `C_hat[${i}] = ${transformedA[i]} * ${transformedB[i]} \\;\\mathrm{mod}\\; ${values.mod} = ${multiplied[i]}`,
        ),
      );
    }
    yield* emit(math('pointwise-vector', `C_hat = ${formatVector(multiplied)}`));

    yield* emit(section('section-inverse', i18nText(NOTEBOOK_TEXT.sections.inverse)));
    yield* emit(
      math(
        'inverse-omega',
        `\\omega^{-1} \\;\\mathrm{mod}\\; ${values.mod} = ${modInverse(values.omega, values.mod)}`,
      ),
    );
    yield* emit(
      math(
        'inverse-n',
        `n^{-1} = ${values.n}^{-1} \\;\\mathrm{mod}\\; ${values.mod} = ${modInverse(values.n, values.mod)}`,
      ),
    );
    yield* emit(math('inverse-vector', `INTT(C_hat) = ${formatVector(inverse)}`));

    yield* emit(resultSection());
    yield* emit(math('result-polynomial', `C(x) = ${formatPolynomial(inverse)}`));
    yield* emit(note('result-before-reduction', i18nText(I18N.notes.beforeReduction)));
    yield* emit(
      math(
        'result-reduction',
        `${formatVector(rawConvolution)} \\;\\mathrm{mod}\\; ${values.mod} = ${formatVector(rawReduced)}`,
      ),
    );
  }

  function* emitRecursiveFftSplit(): Generator<SortStep> {
    const input = pad(values.A, values.n).slice(0, values.n);
    const even = input.filter((_, index) => index % 2 === 0);
    const odd = input.filter((_, index) => index % 2 === 1);
    const evenFft = [even[0] + even[1], even[0] - even[1]];
    const oddFft = [odd[0] + odd[1], odd[0] - odd[1]];
    const x0 = evenFft[0] + oddFft[0];
    const x2 = evenFft[0] - oddFft[0];
    const x1 = { re: evenFft[1], im: oddFft[1] };
    const x3 = { re: evenFft[1], im: -oddFft[1] };

    yield* emit(section('section-split', i18nText(I18N.sections.split)));
    yield* emit(math('split-even', `A_even = ${formatVector(even)}`));
    yield* emit(math('split-odd', `A_odd = ${formatVector(odd)}`));

    yield* emit(section('section-even-fft', i18nText(I18N.sections.evenFft)));
    yield* emit(note('even-root', i18nText(I18N.notes.lengthTwoRoot)));
    yield* emit(
      math(
        'even-formula',
        `FFT(${formatVector(even)}) = [${even[0]} + ${even[1]}, ${even[0]} - ${even[1]}]`,
      ),
    );
    yield* emit(math('even-result', `FFT(${formatVector(even)}) = ${formatVector(evenFft)}`));

    yield* emit(section('section-odd-fft', i18nText(I18N.sections.oddFft)));
    yield* emit(
      math(
        'odd-formula',
        `FFT(${formatVector(odd)}) = [${odd[0]} + ${odd[1]}, ${odd[0]} - ${odd[1]}]`,
      ),
    );
    yield* emit(math('odd-result', `FFT(${formatVector(odd)}) = ${formatVector(oddFft)}`));

    yield* emit(section('section-butterflies', i18nText(I18N.sections.butterflies)));
    yield* emit(math('butterflies-e', `E = ${formatVector(evenFft)}`));
    yield* emit(math('butterflies-o', `O = ${formatVector(oddFft)}`));
    yield* emit(math('butterflies-omega', `\\omega = ${values.omegaLabel}`));
    yield* emit(note('butterflies-k0', i18nText(I18N.notes.forK, { k: 0 })));
    yield* emit(
      math('butterflies-x0', `X_0 = E_0 + \\omega^0 * O_0 = ${evenFft[0]} + ${oddFft[0]} = ${x0}`),
    );
    yield* emit(
      math('butterflies-x2', `X_2 = E_0 - \\omega^0 * O_0 = ${evenFft[0]} - ${oddFft[0]} = ${x2}`),
    );
    yield* emit(note('butterflies-k1', i18nText(I18N.notes.forK, { k: 1 })));
    yield* emit(
      math(
        'butterflies-x1',
        `X_1 = E_1 + \\omega^1 * O_1 = ${evenFft[1]} + i * (${oddFft[1]}) = ${formatComplex(x1)}`,
      ),
    );
    yield* emit(
      math(
        'butterflies-x3',
        `X_3 = E_1 - \\omega^1 * O_1 = ${evenFft[1]} - i * (${oddFft[1]}) = ${formatComplex(x3)}`,
      ),
    );

    yield* emit(resultSection());
    yield* emit(
      math(
        'result-recursive',
        `FFT(${formatVector(input)}) = [${[String(x0), formatComplex(x1), String(x2), formatComplex(x3)].join(', ')}]`,
      ),
    );
  }

  function* emitCyclicVsLinearTrap(): Generator<SortStep> {
    const badA = pad(values.A, values.badN);
    const badB = pad(values.B, values.badN);
    const badTransformA = ntt(badA, values.badN, values.omega4, values.mod);
    const badTransformB = ntt(badB, values.badN, values.omega4, values.mod);
    const badPointwise = pointwise(badTransformA, badTransformB, values.mod);
    const badInverse = intt(badPointwise, values.badN, values.omega4, values.mod);
    const requiredLength = values.A.length + values.B.length - 1;
    const goodA = pad(values.A, values.goodN);
    const goodB = pad(values.B, values.goodN);
    const goodInverse = intt(
      pointwise(
        ntt(goodA, values.goodN, values.omega8, values.mod),
        ntt(goodB, values.goodN, values.omega8, values.mod),
        values.mod,
      ),
      values.goodN,
      values.omega8,
      values.mod,
    );
    const linearResult = goodInverse.slice(0, requiredLength);

    yield* emit(section('section-bad-settings', i18nText(I18N.sections.badSettings, { n: values.badN })));
    yield* emit(math('bad-a', `A = ${formatVector(badA)}`));
    yield* emit(math('bad-b', `B = ${formatVector(badB)}`));
    yield* emit(math('bad-mod', `mod = ${values.mod}`));
    yield* emit(math('bad-omega', `\\omega_4 = ${values.omega4}`));

    yield* emit(section('section-bad-transform', i18nText(I18N.sections.nttLength, { n: values.badN })));
    yield* emit(math('bad-transform-a', `NTT(A) = ${formatVector(badTransformA)}`));
    yield* emit(math('bad-transform-b', `NTT(B) = ${formatVector(badTransformB)}`));

    yield* emit(section('section-bad-pointwise', i18nText(NOTEBOOK_TEXT.sections.pointwise)));
    yield* emit(
      math(
        'bad-pointwise-formula',
        `C_hat = [${badTransformA.map((value, index) => `${value}*${badTransformB[index]}`).join(', ')}] \\;\\mathrm{mod}\\; ${values.mod}`,
      ),
    );
    yield* emit(math('bad-pointwise-vector', `C_hat = ${formatVector(badPointwise)}`));

    yield* emit(section('section-bad-inverse', i18nText(NOTEBOOK_TEXT.sections.inverse)));
    yield* emit(math('bad-inverse-vector', `INTT(C_hat) = ${formatVector(badInverse)}`));
    yield* emit(
      note(
        'bad-cyclic-note',
        i18nText(I18N.notes.cyclic),
      ),
    );

    yield* emit(section('section-good-settings', i18nText(I18N.sections.goodSettings, { n: values.goodN })));
    yield* emit(
      math(
        'good-required-length',
        `len(A) + len(B) - 1 = ${values.A.length} + ${values.B.length} - 1 = ${requiredLength}`,
      ),
    );
    yield* emit(math('good-a', `A = ${formatVector(goodA)}`));
    yield* emit(math('good-b', `B = ${formatVector(goodB)}`));
    yield* emit(math('good-omega', `\\omega_8 = ${values.omega8}`));

    yield* emit(section('section-good-ntt', i18nText(I18N.sections.goodNtt, { n: values.goodN })));
    yield* emit(
      math('good-inverse-vector', `INTT(NTT(A) * NTT(B)) = ${formatVector(goodInverse)}`),
    );

    yield* emit(resultSection());
    yield* emit(math('result-linear', `A * B = ${formatVector(linearResult)}`));
  }

  function* emitBigIntegerConvolution(): Generator<SortStep> {
    const leftDigits = pad(toDigits(values.left, values.base), values.n);
    const rightDigits = pad(toDigits(values.right, values.base), values.n);
    const transformedLeft = ntt(leftDigits, values.n, values.omega, values.mod);
    const transformedRight = ntt(rightDigits, values.n, values.omega, values.mod);
    const multiplied = pointwise(transformedLeft, transformedRight, values.mod);
    const inverse = intt(multiplied, values.n, values.omega, values.mod);
    const carryRows = computeCarryRows(inverse, values.base);
    const finalDigits = carryRows.map((row) => row.digit);
    const product = fromDigits(finalDigits, values.base);

    yield* emit(section('section-digits', i18nText(I18N.sections.digits)));
    yield* emit(note('digits-note', i18nText(I18N.notes.digitsOrder)));
    yield* emit(math('digits-left', `${values.left} \\to ${formatVector(leftDigits)}`));
    yield* emit(math('digits-right', `${values.right} \\to ${formatVector(rightDigits)}`));

    yield* emit(section('section-transform', i18nText(I18N.sections.transform)));
    yield* emit(
      math('transform-left', `NTT(${formatVector(leftDigits)}) = ${formatVector(transformedLeft)}`),
    );
    yield* emit(
      math(
        'transform-right',
        `NTT(${formatVector(rightDigits)}) = ${formatVector(transformedRight)}`,
      ),
    );

    yield* emit(section('section-pointwise', i18nText(NOTEBOOK_TEXT.sections.pointwise)));
    for (let i = 0; i < values.n; i++) {
      yield* emit(
        math(
          `pointwise-${i}`,
          `C_hat[${i}] = ${transformedLeft[i]} * ${transformedRight[i]} \\;\\mathrm{mod}\\; ${values.mod} = ${multiplied[i]}`,
        ),
      );
    }
    yield* emit(math('pointwise-vector', `C_hat = ${formatVector(multiplied)}`));

    yield* emit(section('section-inverse', i18nText(NOTEBOOK_TEXT.sections.inverse)));
    yield* emit(math('inverse-vector', `INTT(C_hat) = ${formatVector(inverse)}`));

    yield* emit(section('section-carry', i18nText(I18N.sections.carry, { base: values.base })));
    for (const row of carryRows) {
      yield* emit(
        mathText(
          `carry-${row.index}`,
          i18nText(I18N.lines.carryRow, { index: row.index, value: row.value, digit: row.digit, carry: row.carry }),
        ),
      );
    }
    yield* emit(note('carry-digits-note', i18nText(I18N.notes.digitsLowFirst)));
    yield* emit(math('carry-digits', formatVector(finalDigits)));
    yield* emit(note('carry-reverse-note', i18nText(I18N.notes.reversed)));
    yield* emit(math('carry-reversed', String(product)));

    yield* emit(resultSection());
    yield* emit(math('result-product', `${values.left} * ${values.right} = ${product}`));
  }

  function* emitPrimitiveRootCheck(): Generator<SortStep> {
    const badFull = modPow(values.omegaBad, values.n, values.mod);
    const badHalf = modPow(values.omegaBad, Math.floor(values.n / 2), values.mod);
    const goodFull = modPow(values.omegaGood, values.n, values.mod);
    const goodHalf = modPow(values.omegaGood, Math.floor(values.n / 2), values.mod);
    const collisionA = [1, ...Array.from({ length: values.n - 1 }, () => 0)];
    const collisionB = Array.from({ length: values.n }, (_, index) =>
      index === Math.floor(values.n / 2) ? 1 : 0,
    );
    const badTransform = Array.from({ length: values.n }, () => 1);
    const goodTransformB = Array.from({ length: values.n }, (_, index) =>
      modPow(values.omegaGood, Math.floor(values.n / 2) * index, values.mod),
    );

    yield* emit(section('section-bad-root', i18nText(I18N.sections.badRoot, { omega: values.omegaBad })));
    yield* emit(math('bad-mod', `mod = ${values.mod}`));
    yield* emit(math('bad-n', `n = ${values.n}`));
    yield* emit(math('bad-omega', `\\omega = ${values.omegaBad}`));
    yield* emit(note('bad-powers-note', i18nText(I18N.notes.checkPowers)));
    yield* emit(
      math(
        'bad-full',
        `${values.omegaBad}^${values.n} \\;\\mathrm{mod}\\; ${values.mod} = ${badFull}`,
      ),
    );
    yield* emit(
      math(
        'bad-half',
        `${values.omegaBad}^${Math.floor(values.n / 2)} \\;\\mathrm{mod}\\; ${values.mod} = ${badHalf}`,
      ),
    );
    yield* emit(note('bad-requirement-note', i18nText(I18N.notes.primitiveRequirement)));
    yield* emit(math('bad-requirement-full', `\\omega^${values.n} = 1`));
    yield* emit(math('bad-requirement-half', `\\omega^${Math.floor(values.n / 2)} != 1`));
    yield* emit(
      note(
        'bad-order-note',
        i18nText(I18N.notes.badOrder, { omega: values.omegaBad, half: Math.floor(values.n / 2), n: values.n }),
      ),
    );

    yield* emit(section('section-collision', i18nText(I18N.sections.collision)));
    yield* emit(note('collision-vectors-note', i18nText(I18N.notes.twoVectors)));
    yield* emit(math('collision-a', `A = ${formatVector(collisionA)}`));
    yield* emit(math('collision-b', `B = ${formatVector(collisionB)}`));
    yield* emit(math('collision-bad-a-formula', `NTT_bad(A)[k] = 1`));
    yield* emit(
      math(
        'collision-bad-b-formula',
        `NTT_bad(B)[k] = ${values.omegaBad}^{${Math.floor(values.n / 2)}k}`,
      ),
    );
    yield* emit(math('collision-half-power', `${values.omegaBad}^${Math.floor(values.n / 2)} = 1`));
    yield* emit(math('collision-b-value', `${values.omegaBad}^{${Math.floor(values.n / 2)}k} = 1`));
    yield* emit(math('collision-bad-a', `NTT_bad(A) = ${formatVector(badTransform)}`));
    yield* emit(math('collision-bad-b', `NTT_bad(B) = ${formatVector(badTransform)}`));
    yield* emit(
      note(
        'collision-conclusion',
        i18nText(I18N.notes.collision),
      ),
    );

    yield* emit(section('section-repair', i18nText(I18N.sections.repair, { omega: values.omegaGood })));
    yield* emit(
      math(
        'repair-full',
        `${values.omegaGood}^${values.n} \\;\\mathrm{mod}\\; ${values.mod} = ${goodFull}`,
      ),
    );
    yield* emit(
      math(
        'repair-half',
        `${values.omegaGood}^${Math.floor(values.n / 2)} \\;\\mathrm{mod}\\; ${values.mod} = ${goodHalf}${goodHalf === values.mod - 1 ? ` = -1 \\;\\mathrm{mod}\\; ${values.mod}` : ''}`,
      ),
    );
    yield* emit(
      note(
        'repair-conclusion',
        i18nText(I18N.notes.repairConclusion, { omega: values.omegaGood, n: values.n, mod: values.mod }),
      ),
    );
    yield* emit(
      math(
        'repair-good-b-formula',
        `NTT_good(B)[k] = ${values.omegaGood}^{${Math.floor(values.n / 2)}k} = (-1)^k`,
      ),
    );
    yield* emit(math('repair-good-b', `NTT_good(B) = ${formatVector(goodTransformB)}`));
    yield* emit(math('repair-good-a', `NTT_good(A) = ${formatVector(badTransform)}`));

    yield* emit(resultSection());
    yield* emit(
      mathText('result-bad-root', i18nText(I18N.lines.badRoot, { omega: values.omegaBad, n: values.n })),
    );
    yield* emit(
      mathText('result-good-root', i18nText(I18N.lines.goodRoot, { omega: values.omegaGood, n: values.n })),
    );
  }

  switch (scenario.notebookFlow.kind) {
    case 'ntt-convolution':
      yield* emitNttConvolution();
      break;
    case 'recursive-fft-split':
      yield* emitRecursiveFftSplit();
      break;
    case 'cyclic-vs-linear-trap':
      yield* emitCyclicVsLinearTrap();
      break;
    case 'big-integer-convolution':
      yield* emitBigIntegerConvolution();
      break;
    case 'primitive-root-check':
      yield* emitPrimitiveRootCheck();
      break;
  }
}

function phaseFor(builder: LineBuilder): TranslatableText {
  if (builder.id.includes('result')) return i18nText(NOTEBOOK_TEXT.sections.result);
  if (builder.id.includes('parameter')) return i18nText(NOTEBOOK_TEXT.sections.parameters);
  if (builder.id.includes('root') || builder.id.includes('repair')) return i18nText(I18N.phases.root);
  if (builder.id.includes('transform') || builder.id.includes('split')) return i18nText(I18N.sections.transform);
  if (builder.id.includes('pointwise')) return i18nText(NOTEBOOK_TEXT.sections.pointwise);
  if (builder.id.includes('inverse')) return i18nText(NOTEBOOK_TEXT.sections.inverse);
  if (builder.id.includes('carry')) return i18nText(I18N.phases.carries);
  return i18nText(NOTEBOOK_TEXT.sections.computation);
}

function decisionFor(builder: LineBuilder): TranslatableText {
  if (builder.kind === 'result') return i18nText(NOTEBOOK_TEXT.decisions.result);
  if (builder.kind === 'note') return i18nText(NOTEBOOK_TEXT.decisions.note);
  return i18nText(NOTEBOOK_TEXT.decisions.compute);
}

function toneFor(builder: LineBuilder): ScratchpadLabTraceState['tone'] {
  if (builder.kind === 'result') return 'complete';
  if (builder.kind === 'note') return 'setup';
  return 'compute';
}

function ntt(
  values: readonly number[],
  n: number,
  omega: number,
  modulus: number,
): readonly number[] {
  const input = pad(values, n);
  return Array.from({ length: n }, (_, k) => {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += input[j] * modPow(omega, j * k, modulus);
    }
    return normalizeModulo(sum, modulus);
  });
}

function intt(
  values: readonly number[],
  n: number,
  omega: number,
  modulus: number,
): readonly number[] {
  const omegaInverse = modInverse(omega, modulus);
  const nInverse = modInverse(n, modulus);
  return ntt(values, n, omegaInverse, modulus).map((value) =>
    normalizeModulo(value * nInverse, modulus),
  );
}

function pointwise(
  left: readonly number[],
  right: readonly number[],
  modulus: number,
): readonly number[] {
  return left.map((value, index) => normalizeModulo(value * right[index], modulus));
}

function linearConvolution(left: readonly number[], right: readonly number[]): readonly number[] {
  const result = Array.from({ length: left.length + right.length - 1 }, () => 0);
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      result[i + j] += left[i] * right[j];
    }
  }
  return result;
}

function modPow(base: number, exponent: number, modulus: number): number {
  let result = 1;
  let value = normalizeModulo(base, modulus);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) {
      result = normalizeModulo(result * value, modulus);
    }
    value = normalizeModulo(value * value, modulus);
    power = Math.floor(power / 2);
  }
  return result;
}

function modInverse(value: number, modulus: number): number {
  let oldR = value;
  let r = modulus;
  let oldS = 1;
  let s = 0;
  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }
  return normalizeModulo(oldS, modulus);
}

function normalizeModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function pad(values: readonly number[], length: number): readonly number[] {
  return Array.from({ length }, (_, index) => values[index] ?? 0);
}

function toDigits(value: number, base: number): readonly number[] {
  if (value === 0) return [0];
  const digits: number[] = [];
  let remaining = Math.abs(value);
  while (remaining > 0) {
    digits.push(remaining % base);
    remaining = Math.floor(remaining / base);
  }
  return digits;
}

function fromDigits(digits: readonly number[], base: number): number {
  return digits.reduce((sum, digit, index) => sum + digit * base ** index, 0);
}

function computeCarryRows(
  coefficients: readonly number[],
  base: number,
): readonly {
  readonly index: number;
  readonly value: number;
  readonly digit: number;
  readonly carry: number;
}[] {
  let carry = 0;
  const rows: {
    readonly index: number;
    readonly value: number;
    readonly digit: number;
    readonly carry: number;
  }[] = [];
  coefficients.forEach((coefficient, index) => {
    const total = coefficient + carry;
    const digit = normalizeModulo(total, base);
    carry = Math.floor(total / base);
    rows.push({ index, value: coefficient, digit, carry });
  });
  while (carry > 0) {
    const total = carry;
    const digit = normalizeModulo(total, base);
    carry = Math.floor(total / base);
    rows.push({ index: rows.length, value: total, digit, carry });
  }
  return rows;
}

function formatVector(values: readonly number[]): string {
  return `[${values.join(', ')}]`;
}

function formatPolynomial(coefficients: readonly number[]): string {
  const terms = coefficients
    .map((coefficient, index) => ({ coefficient, index }))
    .filter((term) => term.coefficient !== 0)
    .map(({ coefficient, index }) => {
      if (index === 0) return String(coefficient);
      if (index === 1) return coefficient === 1 ? 'x' : `${coefficient}x`;
      return coefficient === 1 ? `x^${index}` : `${coefficient}x^${index}`;
    });
  return terms.length > 0 ? terms.join(' + ') : '0';
}

function formatComplex(value: Complex): string {
  if (value.im === 0) return String(value.re);
  if (value.re === 0) return `${value.im}i`;
  const sign = value.im < 0 ? '-' : '+';
  return `${value.re} ${sign} ${Math.abs(value.im)}i`;
}
