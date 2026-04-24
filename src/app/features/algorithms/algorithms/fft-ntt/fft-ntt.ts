import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { FftNttScenario } from '../../utils/scenarios/number-lab/fft-ntt-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.fftNtt.modeLabel'),
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

  function section(id: string, content: string): LineBuilder {
    return paperLine({ id, kind: 'note', content });
  }

  function note(id: string, content: string, indent = CALCULATION_INDENT): LineBuilder {
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

  function resultSection(): LineBuilder {
    return paperLine({
      id: 'section-result',
      kind: 'result',
      marker: RESULT_MARKER,
      content: 'Wynik',
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

    yield* emit(section('section-parameters', 'Parametry'));
    yield* emit(math('parameters-mod', `mod = ${values.mod}`));
    yield* emit(math('parameters-n', `n = ${values.n}`));
    yield* emit(math('parameters-omega', `\\omega = ${values.omega}`));
    yield* emit(math('parameters-a', `A = ${formatVector(a)}`));
    yield* emit(math('parameters-b', `B = ${formatVector(b)}`));

    yield* emit(section('section-root', 'Sprawdzenie pierwiastka'));
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
        `Zatem ${values.omega} jest pierwiastkiem ${values.n}. stopnia modulo ${values.mod}.`,
      ),
    );

    yield* emit(section('section-transform-a', 'Transformata A'));
    yield* emit(math('transform-a', `NTT(A) = ${formatVector(transformedA)}`));

    yield* emit(section('section-transform-b', 'Transformata B'));
    yield* emit(math('transform-b', `NTT(B) = ${formatVector(transformedB)}`));

    yield* emit(section('section-pointwise', 'Mnożenie punktowe'));
    for (let i = 0; i < values.n; i++) {
      yield* emit(
        math(
          `pointwise-${i}`,
          `C_hat[${i}] = ${transformedA[i]} * ${transformedB[i]} \\;\\mathrm{mod}\\; ${values.mod} = ${multiplied[i]}`,
        ),
      );
    }
    yield* emit(math('pointwise-vector', `C_hat = ${formatVector(multiplied)}`));

    yield* emit(section('section-inverse', 'Transformata odwrotna'));
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
    yield* emit(note('result-before-reduction', 'W liczbach całkowitych przed redukcją:'));
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

    yield* emit(section('section-split', 'Podział wejścia'));
    yield* emit(math('split-even', `A_even = ${formatVector(even)}`));
    yield* emit(math('split-odd', `A_odd = ${formatVector(odd)}`));

    yield* emit(section('section-even-fft', 'FFT części parzystej'));
    yield* emit(note('even-root', 'Dla długości 2 pierwiastkiem jest -1:'));
    yield* emit(
      math(
        'even-formula',
        `FFT(${formatVector(even)}) = [${even[0]} + ${even[1]}, ${even[0]} - ${even[1]}]`,
      ),
    );
    yield* emit(math('even-result', `FFT(${formatVector(even)}) = ${formatVector(evenFft)}`));

    yield* emit(section('section-odd-fft', 'FFT części nieparzystej'));
    yield* emit(
      math(
        'odd-formula',
        `FFT(${formatVector(odd)}) = [${odd[0]} + ${odd[1]}, ${odd[0]} - ${odd[1]}]`,
      ),
    );
    yield* emit(math('odd-result', `FFT(${formatVector(odd)}) = ${formatVector(oddFft)}`));

    yield* emit(section('section-butterflies', 'Składanie motylkami'));
    yield* emit(math('butterflies-e', `E = ${formatVector(evenFft)}`));
    yield* emit(math('butterflies-o', `O = ${formatVector(oddFft)}`));
    yield* emit(math('butterflies-omega', `\\omega = ${values.omegaLabel}`));
    yield* emit(note('butterflies-k0', 'Dla k = 0:'));
    yield* emit(
      math('butterflies-x0', `X_0 = E_0 + \\omega^0 * O_0 = ${evenFft[0]} + ${oddFft[0]} = ${x0}`),
    );
    yield* emit(
      math('butterflies-x2', `X_2 = E_0 - \\omega^0 * O_0 = ${evenFft[0]} - ${oddFft[0]} = ${x2}`),
    );
    yield* emit(note('butterflies-k1', 'Dla k = 1:'));
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

    yield* emit(section('section-bad-settings', `Błędne ustawienie: n = ${values.badN}`));
    yield* emit(math('bad-a', `A = ${formatVector(badA)}`));
    yield* emit(math('bad-b', `B = ${formatVector(badB)}`));
    yield* emit(math('bad-mod', `mod = ${values.mod}`));
    yield* emit(math('bad-omega', `\\omega_4 = ${values.omega4}`));

    yield* emit(section('section-bad-transform', `NTT długości ${values.badN}`));
    yield* emit(math('bad-transform-a', `NTT(A) = ${formatVector(badTransformA)}`));
    yield* emit(math('bad-transform-b', `NTT(B) = ${formatVector(badTransformB)}`));

    yield* emit(section('section-bad-pointwise', 'Mnożenie punktowe'));
    yield* emit(
      math(
        'bad-pointwise-formula',
        `C_hat = [${badTransformA.map((value, index) => `${value}*${badTransformB[index]}`).join(', ')}] \\;\\mathrm{mod}\\; ${values.mod}`,
      ),
    );
    yield* emit(math('bad-pointwise-vector', `C_hat = ${formatVector(badPointwise)}`));

    yield* emit(section('section-bad-inverse', 'Transformata odwrotna'));
    yield* emit(math('bad-inverse-vector', `INTT(C_hat) = ${formatVector(badInverse)}`));
    yield* emit(
      note(
        'bad-cyclic-note',
        'To jest konwolucja cykliczna, czyli współczynniki z końca zawinęły się na początek.',
      ),
    );

    yield* emit(section('section-good-settings', `Poprawne ustawienie: n = ${values.goodN}`));
    yield* emit(
      math(
        'good-required-length',
        `len(A) + len(B) - 1 = ${values.A.length} + ${values.B.length} - 1 = ${requiredLength}`,
      ),
    );
    yield* emit(math('good-a', `A = ${formatVector(goodA)}`));
    yield* emit(math('good-b', `B = ${formatVector(goodB)}`));
    yield* emit(math('good-omega', `\\omega_8 = ${values.omega8}`));

    yield* emit(section('section-good-ntt', `Poprawny wynik przez NTT długości ${values.goodN}`));
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

    yield* emit(section('section-digits', 'Zamiana liczb na wektory cyfr'));
    yield* emit(note('digits-note', 'Cyfry zapisujemy od najmniej znaczącej:'));
    yield* emit(math('digits-left', `${values.left} \\to ${formatVector(leftDigits)}`));
    yield* emit(math('digits-right', `${values.right} \\to ${formatVector(rightDigits)}`));

    yield* emit(section('section-transform', 'Transformata'));
    yield* emit(
      math('transform-left', `NTT(${formatVector(leftDigits)}) = ${formatVector(transformedLeft)}`),
    );
    yield* emit(
      math(
        'transform-right',
        `NTT(${formatVector(rightDigits)}) = ${formatVector(transformedRight)}`,
      ),
    );

    yield* emit(section('section-pointwise', 'Mnożenie punktowe'));
    for (let i = 0; i < values.n; i++) {
      yield* emit(
        math(
          `pointwise-${i}`,
          `C_hat[${i}] = ${transformedLeft[i]} * ${transformedRight[i]} \\;\\mathrm{mod}\\; ${values.mod} = ${multiplied[i]}`,
        ),
      );
    }
    yield* emit(math('pointwise-vector', `C_hat = ${formatVector(multiplied)}`));

    yield* emit(section('section-inverse', 'Transformata odwrotna'));
    yield* emit(math('inverse-vector', `INTT(C_hat) = ${formatVector(inverse)}`));

    yield* emit(section('section-carry', `Przeniesienia w bazie ${values.base}`));
    for (const row of carryRows) {
      yield* emit(
        math(
          `carry-${row.index}`,
          `c_${row.index} = ${row.value} \\to digit ${row.digit}, carry ${row.carry}`,
        ),
      );
    }
    yield* emit(note('carry-digits-note', 'Cyfry od najmniej znaczącej:'));
    yield* emit(math('carry-digits', formatVector(finalDigits)));
    yield* emit(note('carry-reverse-note', 'Po odwróceniu:'));
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

    yield* emit(section('section-bad-root', `Próba z omega = ${values.omegaBad}`));
    yield* emit(math('bad-mod', `mod = ${values.mod}`));
    yield* emit(math('bad-n', `n = ${values.n}`));
    yield* emit(math('bad-omega', `\\omega = ${values.omegaBad}`));
    yield* emit(note('bad-powers-note', 'Sprawdzamy potęgi:'));
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
    yield* emit(note('bad-requirement-note', 'Dla pierwiastka pierwotnego stopnia n powinno być:'));
    yield* emit(math('bad-requirement-full', `\\omega^${values.n} = 1`));
    yield* emit(math('bad-requirement-half', `\\omega^${Math.floor(values.n / 2)} != 1`));
    yield* emit(
      note(
        'bad-order-note',
        `Tutaj ${values.omegaBad}^${Math.floor(values.n / 2)} = 1, więc ${values.omegaBad} ma rząd ${Math.floor(values.n / 2)}, a nie ${values.n}.`,
      ),
    );

    yield* emit(section('section-collision', 'Kolizja transformaty'));
    yield* emit(note('collision-vectors-note', 'Weźmy dwa różne wektory:'));
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
        'Dwa różne wejścia mają tę samą transformatę, więc transformata nie jest odwracalna.',
      ),
    );

    yield* emit(section('section-repair', `Naprawa: omega = ${values.omegaGood}`));
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
        `Zatem ${values.omegaGood} jest poprawnym pierwiastkiem pierwotnym stopnia ${values.n} modulo ${values.mod}.`,
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
      math(
        'result-bad-root',
        `\\omega = ${values.omegaBad} \\to niepoprawny pierwiastek dla n = ${values.n}`,
      ),
    );
    yield* emit(
      math(
        'result-good-root',
        `\\omega = ${values.omegaGood} \\to poprawny pierwiastek dla n = ${values.n}`,
      ),
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

function phaseFor(builder: LineBuilder): string {
  if (builder.id.includes('result')) return 'Wynik';
  if (builder.id.includes('parameter')) return 'Parametry';
  if (builder.id.includes('root') || builder.id.includes('repair')) return 'Pierwiastek';
  if (builder.id.includes('transform') || builder.id.includes('split')) return 'Transformata';
  if (builder.id.includes('pointwise')) return 'Mnożenie punktowe';
  if (builder.id.includes('inverse')) return 'Transformata odwrotna';
  if (builder.id.includes('carry')) return 'Przeniesienia';
  return 'Obliczenia';
}

function decisionFor(builder: LineBuilder): string {
  if (builder.kind === 'result') return 'Zapisujemy wynik.';
  if (builder.kind === 'note') return 'Zapisujemy kolejny fragment rozwiązania.';
  return 'Liczymy kolejny wiersz.';
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
