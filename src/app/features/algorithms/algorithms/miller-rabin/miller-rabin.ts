import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { MillerRabinScenario } from '../../utils/scenarios/number-lab/miller-rabin-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.millerRabin.modeLabel'),
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

interface Decomposition {
  readonly s: number;
  readonly d: number;
}

interface BaseTest {
  readonly base: number;
  readonly seed: number;
  readonly squares: readonly {
    readonly index: number;
    readonly previous: number;
    readonly value: number;
  }[];
  readonly verdict: 'pass-seed-one' | 'pass-seed-minus-one' | 'pass-square-minus-one' | 'witness';
  readonly leakRoot: number | null;
}

export function* millerRabinGenerator(scenario: MillerRabinScenario): Generator<SortStep> {
  const n = scenario.n;
  const presetLabel = scenario.presetLabel;
  const decomposition = decompose(n - 1);
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
      mode: 'miller-rabin',
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

  function* emitDecomposition(): Generator<SortStep> {
    yield* emit(section('section-decomposition', 'Rozkład n - 1'));
    yield* emit(math('decomposition-n', `n = ${n}`));
    yield* emit(math('decomposition-n-minus-one', `n - 1 = ${n - 1}`));
    yield* emit(
      math('decomposition-formula', `${n - 1} = 2^${decomposition.s} * ${decomposition.d}`),
    );
    yield* emit(math('decomposition-s', `s = ${decomposition.s}`));
    yield* emit(math('decomposition-d', `d = ${decomposition.d}`));
  }

  function* emitBaseTest(
    idPrefix: string,
    base: number,
    opts?: {
      readonly squareLabel?: string;
      readonly includeNoSquaresNote?: boolean;
    },
  ): Generator<SortStep, BaseTest, unknown> {
    const test = runBaseTest(base, decomposition, n);
    yield* emit(section(`${idPrefix}-section`, `Test bazy a = ${base}`));
    yield* emit(
      math(`${idPrefix}-x0-formula`, `x_0 = ${base}^${decomposition.d} \\;\\mathrm{mod}\\; ${n}`),
    );
    const exactPower = exactPowerString(base, decomposition.d);
    if (exactPower !== null) {
      yield* emit(math(`${idPrefix}-x0-expanded`, `x_0 = ${exactPower} \\;\\mathrm{mod}\\; ${n}`));
    }
    yield* emit(math(`${idPrefix}-x0-value`, `x_0 = ${test.seed}`));

    if (test.seed === 1) {
      yield* emit(note(`${idPrefix}-since-label`, 'Skoro:'));
      yield* emit(math(`${idPrefix}-seed-one`, `x_0 = 1`));
      return test;
    }

    yield* emit(math(`${idPrefix}-seed-not-one`, `${test.seed} != 1`));
    yield* emit(math(`${idPrefix}-seed-not-minus-one`, `${test.seed} != ${n - 1}`));

    if (opts?.includeNoSquaresNote && decomposition.s === 1) {
      yield* emit(
        note(
          `${idPrefix}-no-squares`,
          'Ponieważ s = 1, nie ma kolejnych kwadratów do sprawdzenia.',
        ),
      );
      return test;
    }

    if (test.squares.length > 0) {
      yield* emit(
        note(`${idPrefix}-square-label`, opts?.squareLabel ?? 'Liczymy kolejny kwadrat:'),
      );
    }

    for (const square of test.squares) {
      yield* emit(
        math(
          `${idPrefix}-x${square.index}-formula`,
          `x_${square.index} = ${square.previous}^2 \\;\\mathrm{mod}\\; ${n}`,
        ),
      );
      yield* emit(
        math(
          `${idPrefix}-x${square.index}-expanded`,
          `x_${square.index} = ${square.previous * square.previous} \\;\\mathrm{mod}\\; ${n}`,
        ),
      );
      yield* emit(
        math(`${idPrefix}-x${square.index}-value`, `x_${square.index} = ${square.value}`),
      );
      if (
        test.verdict === 'witness' &&
        square.index === test.squares[test.squares.length - 1]?.index
      ) {
        yield* emit(
          math(`${idPrefix}-x${square.index}-not-minus-one`, `${square.value} != ${n - 1}`),
        );
      }
    }

    return test;
  }

  function* emitPrimePass(): Generator<SortStep> {
    const base = scenario.bases[0];
    yield* emitDecomposition();
    const test = yield* emitBaseTest('short-base', base);

    yield* emit(section('short-conclusion-section', 'Wniosek'));
    if (test.verdict === 'pass-square-minus-one') {
      const square = test.squares.find((candidate) => candidate.value === n - 1);
      yield* emit(math('short-conclusion-hit', `x_${square?.index ?? 1} = n - 1`));
    } else {
      yield* emit(math('short-conclusion-hit', `x_0 = ${test.seed}`));
    }
    yield* emit(note('short-base-passes', `Baza ${base} przechodzi test.`));

    yield* emit(resultSection());
    yield* emit(
      math('short-result', `${n}\\;\\text{jest strong probable prime dla bazy}\\;${base}`),
    );
    yield* emit(
      note('short-prime-note', `W tym konkretnym przykładzie ${n} jest liczbą pierwszą.`),
    );
  }

  function* emitSingleWitness(): Generator<SortStep> {
    const base = scenario.bases[0];
    yield* emitDecomposition();
    const test = yield* emitBaseTest('single-base', base, {
      squareLabel: 'Liczymy jedyny wymagany kwadrat:',
    });

    yield* emit(section('single-conclusion-section', 'Wniosek'));
    if (test.verdict === 'witness') {
      yield* emit(
        note(
          'single-conclusion-note',
          'Ciąg nie trafił ani w 1 na początku, ani w n - 1 w żadnym dozwolonym kroku.',
        ),
      );
      yield* emit(
        math('single-witness-line', `${base}\\;\\text{jest świadkiem złożoności liczby}\\;${n}`),
      );
    }
    yield* emit(resultSection());
    yield* emit(math('single-result', `${n}\\;\\text{jest liczbą złożoną}`));
  }

  function* emitStrongLiarMultibase(): Generator<SortStep> {
    const [base1, base2] = scenario.bases;
    yield* emitDecomposition();

    const first = yield* emitBaseTest('liar-base-one', base1);
    yield* emit(note('liar-base-one-pass', `baza ${base1} przechodzi test.`));

    const second = yield* emitBaseTest('liar-base-two', base2, {
      includeNoSquaresNote: true,
    });

    yield* emit(section('liar-conclusion-section', 'Wniosek'));
    yield* emit(
      math(
        'liar-summary',
        `\\mathrm{base}\\;${base1}:\\;${isPassing(first) ? 'przechodzi' : 'nie\\;przechodzi'}`,
      ),
    );
    yield* emit(
      math(
        'liar-summary-2',
        `\\mathrm{base}\\;${base2}:\\;${isPassing(second) ? 'przechodzi' : 'nie\\;przechodzi'}`,
      ),
    );
    yield* emit(note('liar-witness-note', `Baza ${base2} jest świadkiem złożoności.`));

    yield* emit(resultSection());
    yield* emit(math('liar-result', `${n}\\;\\text{jest liczbą złożoną}`));
    const factor = findSmallFactor(n);
    if (factor !== null) {
      yield* emit(note('liar-factor-label', 'Dodatkowo:'));
      yield* emit(math('liar-factorization', `${n} = ${factor} * ${n / factor}`));
    }
  }

  function* emitGcdPrecheck(): Generator<SortStep> {
    const base = scenario.bases[0];
    const divisor = gcd(base, n);
    yield* emit(section('gcd-precheck-section', 'Sprawdzenie bazy'));
    yield* emit(math('gcd-precheck-n', `n = ${n}`));
    yield* emit(math('gcd-precheck-base', `a = ${base}`));
    yield* emit(math('gcd-precheck-gcd', `\\gcd(${base}, ${n}) = ${divisor}`));

    yield* emit(section('gcd-precheck-conclusion-section', 'Wniosek'));
    yield* emit(math('gcd-precheck-condition', `1 < \\gcd(a, n) < n`));
    yield* emit(
      note('gcd-precheck-note', `Baza ${base} ma wspólny dzielnik z n, więc n jest złożone.`),
    );

    yield* emit(section('gcd-precheck-split-section', 'Rozbicie'));
    yield* emit(math('gcd-precheck-quotient', `${n} / ${divisor} = ${n / divisor}`));

    yield* emit(resultSection());
    yield* emit(math('gcd-precheck-result', `${n} = ${divisor} * ${n / divisor}`));
  }

  function* emitSqrtFactorLeak(): Generator<SortStep> {
    const base = scenario.bases[0];
    yield* emitDecomposition();
    const test = yield* emitBaseTest('sqrt-base', base, {
      squareLabel: 'Liczymy kwadrat:',
    });
    const root = test.leakRoot ?? test.seed;
    const leftFactor = gcd(root - 1, n);
    const rightFactor = gcd(root + 1, n);

    yield* emit(section('sqrt-root-section', 'Nietrywialny pierwiastek'));
    yield* emit(math('sqrt-root-square', `${root}^2 = 1\\;(\\mathrm{mod}\\; ${n})`));
    yield* emit(note('sqrt-root-but-label', 'ale:'));
    yield* emit(math('sqrt-root-not-one', `${root} != 1`));
    yield* emit(math('sqrt-root-not-minus-one', `${root} != -1\\;(\\mathrm{mod}\\; ${n})`));
    yield* emit(
      note('sqrt-root-note', 'To oznacza nietrywialny pierwiastek z 1 modulo liczby złożonej.'),
    );

    yield* emit(section('sqrt-recover-section', 'Odzyskanie czynników'));
    yield* emit(
      math(
        'sqrt-recover-left',
        `\\gcd(${root} - 1, ${n}) = \\gcd(${root - 1}, ${n}) = ${leftFactor}`,
      ),
    );
    yield* emit(
      math(
        'sqrt-recover-right',
        `\\gcd(${root} + 1, ${n}) = \\gcd(${root + 1}, ${n}) = ${rightFactor}`,
      ),
    );

    yield* emit(resultSection());
    yield* emit(math('sqrt-result', `${n} = ${leftFactor} * ${rightFactor}`));
    yield* emit(note('sqrt-result-sorted-label', 'Po uporządkowaniu:'));
    yield* emit(
      math(
        'sqrt-result-sorted',
        `${n} = ${[leftFactor, rightFactor].sort((a, b) => a - b).join(' * ')}`,
      ),
    );
  }

  switch (scenario.notebookFlow.kind) {
    case 'prime-pass':
      yield* emitPrimePass();
      return;
    case 'single-witness':
      yield* emitSingleWitness();
      return;
    case 'strong-liar-multibase':
      yield* emitStrongLiarMultibase();
      return;
    case 'gcd-precheck':
      yield* emitGcdPrecheck();
      return;
    case 'sqrt-factor-leak':
      yield* emitSqrtFactorLeak();
      return;
  }
}

function runBaseTest(base: number, decomposition: Decomposition, n: number): BaseTest {
  const seed = modPow(base, decomposition.d, n);
  if (seed === 1) {
    return {
      base,
      seed,
      squares: [],
      verdict: 'pass-seed-one',
      leakRoot: null,
    };
  }
  if (seed === n - 1) {
    return {
      base,
      seed,
      squares: [],
      verdict: 'pass-seed-minus-one',
      leakRoot: null,
    };
  }

  const squares: BaseTest['squares'][number][] = [];
  let previous = seed;
  for (let index = 1; index <= decomposition.s - 1; index++) {
    const value = (previous * previous) % n;
    squares.push({ index, previous, value });
    if (value === n - 1) {
      return {
        base,
        seed,
        squares,
        verdict: 'pass-square-minus-one',
        leakRoot: null,
      };
    }
    if (value === 1) {
      return {
        base,
        seed,
        squares,
        verdict: 'witness',
        leakRoot: previous,
      };
    }
    previous = value;
  }

  return {
    base,
    seed,
    squares,
    verdict: 'witness',
    leakRoot: null,
  };
}

function isPassing(test: BaseTest): boolean {
  return test.verdict !== 'witness';
}

function decompose(nMinusOne: number): Decomposition {
  let s = 0;
  let d = nMinusOne;
  while (d % 2 === 0) {
    d /= 2;
    s += 1;
  }
  return { s, d };
}

function modPow(base: number, exp: number, modulus: number): number {
  let result = 1n;
  let current = BigInt(base % modulus);
  let exponent = BigInt(exp);
  const mod = BigInt(modulus);
  while (exponent > 0n) {
    if ((exponent & 1n) === 1n) result = (result * current) % mod;
    current = (current * current) % mod;
    exponent >>= 1n;
  }
  return Number(result);
}

function exactPowerString(base: number, exp: number): string | null {
  let result = 1n;
  const factor = BigInt(base);
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  for (let i = 0; i < exp; i++) {
    result *= factor;
    if (result > max) return null;
  }
  return result.toString();
}

function findSmallFactor(value: number): number | null {
  if (value % 2 === 0) return 2;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
    if (value % divisor === 0) return divisor;
  }
  return null;
}

function phaseFor(builder: LineBuilder): string {
  if (builder.id.includes('result')) return 'Wynik';
  if (builder.id.includes('conclusion')) return 'Wniosek';
  if (builder.id.includes('recover') || builder.id.includes('split')) return 'Rozbicie';
  if (builder.id.includes('decomposition')) return 'Rozkład n - 1';
  if (builder.id.includes('base')) return 'Test bazy';
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
  if (builder.id.includes('conclusion')) return 'decide';
  return 'compute';
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}
