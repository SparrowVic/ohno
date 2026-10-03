import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  NumberLabHistoryEntry,
  NumberLabRegister,
  NumberLabTone,
  NumberLabTraceState,
} from '../../models/number-lab';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { MillerRabinScenario } from '../../utils/scenarios/number-lab/miller-rabin-scenarios';
import { createNumberLabStep } from '../number-lab-step';
import { NOTEBOOK_TEXT } from '../notebook-text';
import { withScratchpad } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.millerRabin.modeLabel'),
  numberLabModeLabel: t('features.algorithms.runtime.numberLab.millerRabin.modeLabel'),
  notes: {
    since: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.since'),
    noSquares: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.noSquares'),
    nextSquare: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.nextSquare'),
    basePasses: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.basePasses'),
    isPrime: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.isPrime'),
    onlySquare: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.onlySquare'),
    missed: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.missed'),
    witness: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.witness'),
    additionally: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.additionally'),
    commonDivisor: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.commonDivisor'),
    square: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.square'),
    but: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.but'),
    nontrivialMeaning: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.nontrivialMeaning'),
    sorted: t('features.algorithms.runtime.scratchpadLab.millerRabin.notes.sorted'),
  },
  lines: {
    probablePrime: t('features.algorithms.runtime.scratchpadLab.millerRabin.lines.probablePrime'),
    witnessOf: t('features.algorithms.runtime.scratchpadLab.millerRabin.lines.witnessOf'),
    composite: t('features.algorithms.runtime.scratchpadLab.millerRabin.lines.composite'),
    basePasses: t('features.algorithms.runtime.scratchpadLab.millerRabin.lines.basePasses'),
    baseFails: t('features.algorithms.runtime.scratchpadLab.millerRabin.lines.baseFails'),
  },
  sections: {
    baseCheck: t('features.algorithms.runtime.scratchpadLab.millerRabin.sections.baseCheck'),
    nontrivialRoot: t('features.algorithms.runtime.scratchpadLab.millerRabin.sections.nontrivialRoot'),
    recoverFactors: t('features.algorithms.runtime.scratchpadLab.millerRabin.sections.recoverFactors'),
  },
  phases: {
    baseTest: t('features.algorithms.runtime.scratchpadLab.millerRabin.phases.baseTest'),
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

interface LiveState {
  base: number | null;
  /** Current x_i value. null until first emission of seed. */
  currentX: number | null;
  /** Index into the squaring chain (0 = seed, 1+ = squares). */
  currentXIndex: number | null;
  /** History of x_i values witnessed during the active base test. */
  squaringChain: { readonly index: number; readonly value: number }[];
  /** Final verdict text shown in the result slot once we conclude. */
  verdictText: TranslatableText | null;
}

export function* millerRabinGenerator(scenario: MillerRabinScenario): Generator<SortStep> {
  const n = scenario.n;
  const presetLabel = scenario.presetLabel;
  const decomposition = decompose(n - 1);
  const lineBuilders: LineBuilder[] = [];
  let stepIndex = 0;
  const live: LiveState = {
    base: null,
    currentX: null,
    currentXIndex: null,
    squaringChain: [],
    verdictText: null,
  };

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
    syncLiveFromBuilder(builder);
    lineBuilders.push(builder);
    stepIndex += 1;
    return withScratchpad(
      createNumberLabStep({
        activeCodeLine: opts.activeCodeLine,
        description: builder.content,
        state: numberLabState(builder),
      }),
      snapshot({ ...opts, currentLineId: builder.id }),
    );
  }

  /** Pulls register-relevant facts off the line we're about to emit so
   *  the dashboard variant tracks the same beat-by-beat state as the
   *  chalkboard. Pattern-matches on the line id since each generator
   *  flow uses a stable namespacing scheme. */
  function syncLiveFromBuilder(builder: LineBuilder): void {
    const id = builder.id;
    const baseSection = id.match(/-section$/) && id.includes('base');
    if (baseSection) {
      const match = id.match(/^(.+?)-section$/);
      const prefix = match?.[1] ?? '';
      const base = baseRegistry.get(prefix);
      if (base !== undefined) {
        live.base = base;
        live.currentX = null;
        live.currentXIndex = null;
        live.squaringChain = [];
      }
    }

    const contentText = typeof builder.content === 'string' ? builder.content : '';

    const seedMatch = id.match(/-x0-value$/);
    if (seedMatch) {
      const numericMatch = contentText.match(/x_0 = (-?\d+)/);
      if (numericMatch) {
        const value = Number(numericMatch[1]);
        live.currentX = value;
        live.currentXIndex = 0;
        live.squaringChain = [{ index: 0, value }];
      }
    }

    const squareMatch = id.match(/-x(\d+)-value$/);
    if (squareMatch) {
      const index = Number(squareMatch[1]);
      const numericMatch = contentText.match(/= (-?\d+)/);
      if (numericMatch) {
        const value = Number(numericMatch[1]);
        live.currentX = value;
        live.currentXIndex = index;
        if (live.squaringChain.find((entry) => entry.index === index) === undefined) {
          live.squaringChain.push({ index, value });
        }
      }
    }

    if (builder.kind === 'result' && builder.id !== 'section-no-result') {
      // resultSection itself — don't set verdict yet, we wait for the
      // math line that follows it.
    }
    if (id.endsWith('-result') && builder.kind === 'equation') {
      // The math line under the result section captures the verdict.
      const content = builder.content;
      live.verdictText =
        typeof content === 'string' ? content.replace(/\[\[\/?math\]\]/g, '').replace(/\\;/g, ' ').trim() : content;
    }
  }

  /** Resolve `idPrefix → base value` for every base test the flow runs.
   *  Populated lazily as we enter each base section. */
  const baseRegistry = new Map<string, number>([
    ['short-base', scenario.bases[0]],
    ['single-base', scenario.bases[0]],
    ['liar-base-one', scenario.bases[0]],
    ['liar-base-two', scenario.bases[1] ?? scenario.bases[0]],
    ['sqrt-base', scenario.bases[0]],
  ]);

  function buildRegisters(): readonly NumberLabRegister[] {
    const registers: NumberLabRegister[] = [
      { id: 'n', label: 'n', value: String(n), hint: null, tone: 'muted' },
      {
        id: 's',
        label: 's',
        value: String(decomposition.s),
        hint: null,
        tone: 'settled',
      },
      {
        id: 'd',
        label: 'd',
        value: String(decomposition.d),
        hint: null,
        tone: 'settled',
      },
    ];
    if (live.base !== null) {
      registers.push({
        id: 'base',
        label: 'a',
        value: String(live.base),
        hint: null,
        tone: 'active',
      });
    }
    if (live.currentX !== null && live.currentXIndex !== null) {
      registers.push({
        id: 'x',
        label: `x_${live.currentXIndex}`,
        value: String(live.currentX),
        hint: null,
        tone: 'active',
      });
    }
    return registers;
  }

  function buildHistory(currentBuilderId: string): readonly NumberLabHistoryEntry[] {
    return live.squaringChain.map((entry) => {
      const matchesCurrent =
        entry.index === live.currentXIndex && currentBuilderId.includes(`-x${entry.index}-value`);
      return {
        id: `square-${entry.index}-base-${live.base ?? 'na'}`,
        label: `x_${entry.index}`,
        value: String(entry.value),
        isCurrent: matchesCurrent,
      };
    });
  }

  function numberLabState(builder: LineBuilder): NumberLabTraceState {
    return {
      modeLabel: I18N.numberLabModeLabel,
      phaseLabel: phaseFor(builder),
      decisionLabel: decisionFor(builder),
      tone: numberLabToneFor(builder),
      registers: buildRegisters(),
      history: buildHistory(builder.id),
      formula: null,
      presetLabel,
      resultLabel: live.verdictText,
      iteration: stepIndex,
    };
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

  function* emitDecomposition(): Generator<SortStep> {
    yield* emit(section('section-decomposition', i18nText(NOTEBOOK_TEXT.sections.decomposition)));
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
      readonly squareLabel?: TranslatableText;
      readonly includeNoSquaresNote?: boolean;
    },
  ): Generator<SortStep, BaseTest, unknown> {
    const test = runBaseTest(base, decomposition, n);
    yield* emit(section(`${idPrefix}-section`, i18nText(NOTEBOOK_TEXT.sections.baseTest, { a: base })));
    yield* emit(
      math(`${idPrefix}-x0-formula`, `x_0 = ${base}^${decomposition.d} \\;\\mathrm{mod}\\; ${n}`),
    );
    const exactPower = exactPowerString(base, decomposition.d);
    if (exactPower !== null) {
      yield* emit(math(`${idPrefix}-x0-expanded`, `x_0 = ${exactPower} \\;\\mathrm{mod}\\; ${n}`));
    }
    yield* emit(math(`${idPrefix}-x0-value`, `x_0 = ${test.seed}`));

    if (test.seed === 1) {
      yield* emit(note(`${idPrefix}-since-label`, i18nText(I18N.notes.since)));
      yield* emit(math(`${idPrefix}-seed-one`, `x_0 = 1`));
      return test;
    }

    yield* emit(math(`${idPrefix}-seed-not-one`, `${test.seed} != 1`));
    yield* emit(math(`${idPrefix}-seed-not-minus-one`, `${test.seed} != ${n - 1}`));

    if (opts?.includeNoSquaresNote && decomposition.s === 1) {
      yield* emit(
        note(
          `${idPrefix}-no-squares`,
          i18nText(I18N.notes.noSquares),
        ),
      );
      return test;
    }

    if (test.squares.length > 0) {
      yield* emit(
        note(`${idPrefix}-square-label`, opts?.squareLabel ?? i18nText(I18N.notes.nextSquare)),
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

    yield* emit(section('short-conclusion-section', i18nText(NOTEBOOK_TEXT.sections.conclusion)));
    if (test.verdict === 'pass-square-minus-one') {
      const square = test.squares.find((candidate) => candidate.value === n - 1);
      yield* emit(math('short-conclusion-hit', `x_${square?.index ?? 1} = n - 1`));
    } else {
      yield* emit(math('short-conclusion-hit', `x_0 = ${test.seed}`));
    }
    yield* emit(note('short-base-passes', i18nText(I18N.notes.basePasses, { base })));

    yield* emit(resultSection());
    yield* emit(mathText('short-result', i18nText(I18N.lines.probablePrime, { n, base })));
    yield* emit(
      note('short-prime-note', i18nText(I18N.notes.isPrime, { n })),
    );
  }

  function* emitSingleWitness(): Generator<SortStep> {
    const base = scenario.bases[0];
    yield* emitDecomposition();
    const test = yield* emitBaseTest('single-base', base, {
      squareLabel: i18nText(I18N.notes.onlySquare),
    });

    yield* emit(section('single-conclusion-section', i18nText(NOTEBOOK_TEXT.sections.conclusion)));
    if (test.verdict === 'witness') {
      yield* emit(
        note(
          'single-conclusion-note',
          i18nText(I18N.notes.missed),
        ),
      );
      yield* emit(mathText('single-witness-line', i18nText(I18N.lines.witnessOf, { base, n })));
    }
    yield* emit(resultSection());
    yield* emit(mathText('single-result', i18nText(I18N.lines.composite, { n })));
  }

  function* emitStrongLiarMultibase(): Generator<SortStep> {
    const [base1, base2] = scenario.bases;
    yield* emitDecomposition();

    const first = yield* emitBaseTest('liar-base-one', base1);
    yield* emit(note('liar-base-one-pass', i18nText(I18N.notes.basePasses, { base: base1 })));

    const second = yield* emitBaseTest('liar-base-two', base2, {
      includeNoSquaresNote: true,
    });

    yield* emit(section('liar-conclusion-section', i18nText(NOTEBOOK_TEXT.sections.conclusion)));
    yield* emit(mathText('liar-summary', baseSummary(base1, first)));
    yield* emit(mathText('liar-summary-2', baseSummary(base2, second)));
    yield* emit(note('liar-witness-note', i18nText(I18N.notes.witness, { base: base2 })));

    yield* emit(resultSection());
    yield* emit(mathText('liar-result', i18nText(I18N.lines.composite, { n })));
    const factor = findSmallFactor(n);
    if (factor !== null) {
      yield* emit(note('liar-factor-label', i18nText(I18N.notes.additionally)));
      yield* emit(math('liar-factorization', `${n} = ${factor} * ${n / factor}`));
    }
  }

  function* emitGcdPrecheck(): Generator<SortStep> {
    const base = scenario.bases[0];
    const divisor = gcd(base, n);
    yield* emit(section('gcd-precheck-section', i18nText(I18N.sections.baseCheck)));
    yield* emit(math('gcd-precheck-n', `n = ${n}`));
    yield* emit(math('gcd-precheck-base', `a = ${base}`));
    yield* emit(math('gcd-precheck-gcd', `\\gcd(${base}, ${n}) = ${divisor}`));

    yield* emit(section('gcd-precheck-conclusion-section', i18nText(NOTEBOOK_TEXT.sections.conclusion)));
    yield* emit(math('gcd-precheck-condition', `1 < \\gcd(a, n) < n`));
    yield* emit(
      note('gcd-precheck-note', i18nText(I18N.notes.commonDivisor, { base })),
    );

    yield* emit(section('gcd-precheck-split-section', i18nText(NOTEBOOK_TEXT.sections.factorisation)));
    yield* emit(math('gcd-precheck-quotient', `${n} / ${divisor} = ${n / divisor}`));

    yield* emit(resultSection());
    yield* emit(math('gcd-precheck-result', `${n} = ${divisor} * ${n / divisor}`));
  }

  function* emitSqrtFactorLeak(): Generator<SortStep> {
    const base = scenario.bases[0];
    yield* emitDecomposition();
    const test = yield* emitBaseTest('sqrt-base', base, {
      squareLabel: i18nText(I18N.notes.square),
    });
    const root = test.leakRoot ?? test.seed;
    const leftFactor = gcd(root - 1, n);
    const rightFactor = gcd(root + 1, n);

    yield* emit(section('sqrt-root-section', i18nText(I18N.sections.nontrivialRoot)));
    yield* emit(math('sqrt-root-square', `${root}^2 = 1\\;(\\mathrm{mod}\\; ${n})`));
    yield* emit(note('sqrt-root-but-label', i18nText(I18N.notes.but)));
    yield* emit(math('sqrt-root-not-one', `${root} != 1`));
    yield* emit(math('sqrt-root-not-minus-one', `${root} != -1\\;(\\mathrm{mod}\\; ${n})`));
    yield* emit(
      note('sqrt-root-note', i18nText(I18N.notes.nontrivialMeaning)),
    );

    yield* emit(section('sqrt-recover-section', i18nText(I18N.sections.recoverFactors)));
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
    yield* emit(note('sqrt-result-sorted-label', i18nText(I18N.notes.sorted)));
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

function baseSummary(base: number, test: BaseTest): TranslatableText {
  return i18nText(isPassing(test) ? I18N.lines.basePasses : I18N.lines.baseFails, { base });
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

function phaseFor(builder: LineBuilder): TranslatableText {
  if (builder.id.includes('result')) return i18nText(NOTEBOOK_TEXT.sections.result);
  if (builder.id.includes('conclusion')) return i18nText(NOTEBOOK_TEXT.sections.conclusion);
  if (builder.id.includes('recover') || builder.id.includes('split')) return i18nText(NOTEBOOK_TEXT.sections.factorisation);
  if (builder.id.includes('decomposition')) return i18nText(NOTEBOOK_TEXT.sections.decomposition);
  if (builder.id.includes('base')) return i18nText(I18N.phases.baseTest);
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
  if (builder.id.includes('conclusion')) return 'decide';
  return 'compute';
}

function numberLabToneFor(builder: LineBuilder): NumberLabTone {
  if (builder.kind === 'result') return 'complete';
  if (builder.kind === 'note') return 'idle';
  if (builder.id.includes('conclusion')) return 'settle';
  return 'update';
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}
