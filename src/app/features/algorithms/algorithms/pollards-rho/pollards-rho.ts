import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { PollardsRhoScenario } from '../../utils/scenarios/number-lab/pollards-rho-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.pollardsRho.modeLabel'),
} as const;

const CALCULATION_INDENT = 1;
const RESULT_MARKER = '✓';
const NO_RESULT_MARKER = '×';

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

interface FloydRow {
  readonly index: number;
  readonly previousX: number;
  readonly previousY: number;
  readonly x: number;
  readonly yMid: number;
  readonly y: number;
  readonly diff: number;
  readonly gcd: number;
}

type FloydOutcome =
  | {
      readonly kind: 'factor';
      readonly rows: readonly FloydRow[];
      readonly factor: number;
    }
  | {
      readonly kind: 'cycle';
      readonly rows: readonly FloydRow[];
    }
  | {
      readonly kind: 'exhausted';
      readonly rows: readonly FloydRow[];
    };

interface BrentBatchRow {
  readonly y: number;
  readonly diff: number;
  readonly q: number;
}

interface BrentBatch {
  readonly r: number;
  readonly x: number;
  readonly rows: readonly BrentBatchRow[];
  readonly gcd: number;
}

type BrentOutcome =
  | {
      readonly kind: 'factor';
      readonly batches: readonly BrentBatch[];
      readonly factor: number;
    }
  | {
      readonly kind: 'cycle' | 'exhausted';
      readonly batches: readonly BrentBatch[];
    };

export function* pollardsRhoGenerator(scenario: PollardsRhoScenario): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
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
      mode: 'pollards-rho',
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

  function noResultSection(content = 'Nieudany przebieg'): LineBuilder {
    return paperLine({
      id: 'section-no-result',
      kind: 'result',
      marker: NO_RESULT_MARKER,
      content,
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

  function* emitFloydParameters(opts: {
    readonly idPrefix: string;
    readonly n: number;
    readonly c: number;
    readonly x0: number;
    readonly functionName?: string;
  }): Generator<SortStep> {
    const functionName = opts.functionName ?? 'f';
    yield* emit(math(`${opts.idPrefix}-n`, `n = ${opts.n}`));
    yield* emit(math(`${opts.idPrefix}-x0`, `x_0 = ${opts.x0}`));
    yield* emit(
      math(
        `${opts.idPrefix}-function`,
        `${functionName}(x) = x^2 + ${opts.c} \\;\\mathrm{mod}\\; ${opts.n}`,
      ),
    );
  }

  function* emitFloydIterations(opts: {
    readonly idPrefix: string;
    readonly n: number;
    readonly functionName: string;
    readonly rows: readonly FloydRow[];
  }): Generator<SortStep> {
    yield* emit(section(`${opts.idPrefix}-iterations`, 'Iteracje'));
    for (const row of opts.rows) {
      yield* emit(note(`${opts.idPrefix}-iter-${row.index}-label`, `i = ${row.index}`));
      yield* emit(
        math(
          `${opts.idPrefix}-iter-${row.index}-x`,
          `x = ${opts.functionName}(${row.previousX}) = ${row.x}`,
        ),
      );
      yield* emit(
        math(
          `${opts.idPrefix}-iter-${row.index}-y`,
          `y = ${opts.functionName}(${opts.functionName}(${row.previousY})) = ${opts.functionName}(${row.yMid}) = ${row.y}`,
        ),
      );
      yield* emit(
        math(
          `${opts.idPrefix}-iter-${row.index}-diff`,
          `\\lvert x - y \\rvert = \\lvert ${row.x} - ${row.y} \\rvert = ${row.diff}`,
        ),
      );
      yield* emit(
        math(
          `${opts.idPrefix}-iter-${row.index}-gcd`,
          `d = \\gcd(${row.diff}, ${opts.n}) = ${row.gcd}`,
        ),
      );
    }
  }

  function* emitFloydRun(opts: {
    readonly idPrefix: string;
    readonly title: string;
    readonly n: number;
    readonly c: number;
    readonly x0: number;
    readonly functionName?: string;
  }): Generator<SortStep, FloydOutcome, unknown> {
    const functionName = opts.functionName ?? 'f';
    const outcome = runFloyd(opts.n, opts.c, opts.x0, scenario.maxIterations);
    yield* emit(section(`${opts.idPrefix}-section`, opts.title));
    yield* emitFloydParameters({ ...opts, functionName });
    yield* emitFloydIterations({
      idPrefix: opts.idPrefix,
      n: opts.n,
      functionName,
      rows: outcome.rows,
    });
    return outcome;
  }

  function* emitSplit(opts: {
    readonly idPrefix: string;
    readonly n: number;
    readonly factor: number;
    readonly includeNonTrivialCheck?: boolean;
  }): Generator<SortStep> {
    const quotient = opts.n / opts.factor;
    yield* emit(section(`${opts.idPrefix}-split`, 'Rozbicie'));
    if (opts.includeNonTrivialCheck) {
      yield* emit(math(`${opts.idPrefix}-nontrivial`, `1 < ${opts.factor} < ${opts.n}`));
      yield* emit(note(`${opts.idPrefix}-factor-label`, 'Znaleziono nietrywialny dzielnik:'));
      yield* emit(math(`${opts.idPrefix}-factor`, `d = ${opts.factor}`));
      yield* emit(note(`${opts.idPrefix}-quotient-label`, 'Drugi czynnik:'));
    } else {
      yield* emit(math(`${opts.idPrefix}-factor`, `d = ${opts.factor}`));
    }
    yield* emit(math(`${opts.idPrefix}-quotient`, `${opts.n} / ${opts.factor} = ${quotient}`));
  }

  function* emitBasicFloyd(): Generator<SortStep> {
    yield* emit(section('section-parameters', 'Parametry'));
    yield* emitFloydParameters({
      idPrefix: 'basic-params',
      n: scenario.n,
      c: scenario.c,
      x0: scenario.x0,
    });
    const outcome = runFloyd(scenario.n, scenario.c, scenario.x0, scenario.maxIterations);
    yield* emitFloydIterations({
      idPrefix: 'basic',
      n: scenario.n,
      functionName: 'f',
      rows: outcome.rows,
    });

    if (outcome.kind !== 'factor') {
      yield* emit(noResultSection());
      return;
    }

    yield* emitSplit({
      idPrefix: 'basic',
      n: scenario.n,
      factor: outcome.factor,
      includeNonTrivialCheck: true,
    });
    yield* emit(resultSection());
    yield* emit(
      math('basic-result', `${scenario.n} = ${outcome.factor} * ${scenario.n / outcome.factor}`),
    );
  }

  function* emitRetryAfterCycle(): Generator<SortStep> {
    const firstOutcome = yield* emitFloydRun({
      idPrefix: 'retry-first',
      title: 'Próba 1',
      n: scenario.n,
      c: scenario.cFail,
      x0: scenario.x0,
      functionName: 'f',
    });

    const lastFirstRow = firstOutcome.rows.at(-1);
    yield* emit(section('retry-first-conclusion-section', 'Wniosek po próbie 1'));
    yield* emit(math('retry-first-cycle', `d = ${lastFirstRow?.gcd ?? scenario.n} = n`));
    yield* emit(
      note(
        'retry-first-cycle-note',
        'To nie jest nietrywialny dzielnik. Trafiliśmy w cykl w taki sposób, że x = y modulo n, więc gcd(0, n) oddaje całe n. Algorytm nie znalazł faktora.',
      ),
    );

    const retryOutcome = yield* emitFloydRun({
      idPrefix: 'retry-second',
      title: 'Próba 2',
      n: scenario.n,
      c: scenario.cRetry,
      x0: scenario.x0,
      functionName: 'g',
    });

    if (retryOutcome.kind !== 'factor') {
      yield* emit(noResultSection());
      return;
    }

    yield* emitSplit({ idPrefix: 'retry-second', n: scenario.n, factor: retryOutcome.factor });
    yield* emit(resultSection());
    yield* emit(
      math(
        'retry-result',
        `${scenario.n} = ${retryOutcome.factor} * ${scenario.n / retryOutcome.factor}`,
      ),
    );
  }

  function* emitBrentBatchGcd(): Generator<SortStep> {
    const outcome = runBrent(
      scenario.n,
      scenario.c,
      scenario.x0,
      scenario.batchSize,
      scenario.maxIterations,
    );

    yield* emit(section('brent-parameters', 'Parametry'));
    yield* emitFloydParameters({
      idPrefix: 'brent-params',
      n: scenario.n,
      c: scenario.c,
      x0: scenario.x0,
    });
    yield* emit(math('brent-m', `m = ${scenario.batchSize}`));

    const batchesByR = groupBatchesByR(outcome.batches);
    for (const batch of outcome.batches) {
      const sameR = batchesByR.get(batch.r) ?? [];
      const batchIndex = sameR.indexOf(batch);
      const label =
        sameR.length > 1
          ? `Blok r = ${batch.r}, ${batchIndex === 0 ? 'pierwsza' : 'druga'} paczka`
          : `Blok r = ${batch.r}`;
      yield* emit(section(`brent-r-${batch.r}-${batchIndex}`, label));
      yield* emit(math(`brent-r-${batch.r}-${batchIndex}-x`, `x = ${batch.x}`));
      for (let i = 0; i < batch.rows.length; i++) {
        const row = batch.rows[i];
        yield* emit(
          math(
            `brent-r-${batch.r}-${batchIndex}-row-${i}`,
            `y = ${row.y},\\; \\lvert x - y \\rvert = ${row.diff},\\; q = ${row.q} \\;(\\mathrm{mod}\\; ${scenario.n})`,
          ),
        );
      }
      const q = batch.rows.at(-1)?.q ?? 0;
      yield* emit(
        math(`brent-r-${batch.r}-${batchIndex}-gcd`, `\\gcd(${q}, ${scenario.n}) = ${batch.gcd}`),
      );
    }

    if (outcome.kind !== 'factor') {
      yield* emit(noResultSection());
      return;
    }

    yield* emitSplit({ idPrefix: 'brent', n: scenario.n, factor: outcome.factor });
    yield* emit(resultSection());
    yield* emit(
      math('brent-result', `${scenario.n} = ${outcome.factor} * ${scenario.n / outcome.factor}`),
    );
  }

  function* emitRecursiveFactorization(): Generator<SortStep> {
    const factors: number[] = [];
    const queue: number[] = [scenario.n];
    let callIndex = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (isPrime(current)) {
        factors.push(current);
        continue;
      }
      callIndex += 1;
      const outcome = yield* emitFloydRun({
        idPrefix: `recursive-call-${callIndex}`,
        title: `${ordinalCall(callIndex)} wywołanie`,
        n: current,
        c: scenario.c,
        x0: scenario.x0,
      });
      if (outcome.kind !== 'factor') {
        factors.push(current);
        continue;
      }
      const quotient = current / outcome.factor;
      yield* emit(
        math(
          `recursive-call-${callIndex}-quotient`,
          `${current} / ${outcome.factor} = ${quotient}`,
        ),
      );
      yield* emit(
        note(`recursive-call-${callIndex}-split-label`, `${ordinalSplit(callIndex)} rozbicie:`),
      );
      yield* emit(
        math(`recursive-call-${callIndex}-split`, `${current} = ${outcome.factor} * ${quotient}`),
      );

      if (isPrime(outcome.factor)) factors.push(outcome.factor);
      else queue.push(outcome.factor);
      if (isPrime(quotient)) factors.push(quotient);
      else queue.push(quotient);
    }

    yield* emit(resultSection());
    yield* emit(math('recursive-result-discovery', `${scenario.n} = ${factors.join(' * ')}`));
    yield* emit(note('recursive-result-sorted-label', 'Po uporządkowaniu:'));
    yield* emit(
      math(
        'recursive-result-sorted',
        `${scenario.n} = ${[...factors].sort((a, b) => a - b).join(' * ')}`,
      ),
    );
  }

  function* emitCompositeFactorSplit(): Generator<SortStep> {
    const firstOutcome = yield* emitFloydRun({
      idPrefix: 'composite-first-call',
      title: 'Pierwsze wywołanie',
      n: scenario.n,
      c: scenario.c,
      x0: scenario.x0,
    });

    if (firstOutcome.kind !== 'factor') {
      yield* emit(noResultSection());
      return;
    }

    const firstFactor = firstOutcome.factor;
    const quotient = scenario.n / firstFactor;
    yield* emit(section('composite-first-split-section', 'Pierwsze rozbicie'));
    yield* emit(math('composite-first-factor', `d = ${firstFactor}`));
    yield* emit(math('composite-first-quotient', `${scenario.n} / ${firstFactor} = ${quotient}`));
    yield* emit(math('composite-first-product', `${scenario.n} = ${firstFactor} * ${quotient}`));

    const factors: number[] = [];
    if (isPrime(firstFactor)) {
      factors.push(firstFactor);
    } else {
      yield* emit(
        note(
          'composite-factor-not-prime',
          `Dzielnik ${firstFactor} nie jest pierwszy, więc nie wolno kończyć. No chyba że celem jest oddanie rozwiązania, które wygląda jak niedokończona kanapka.`,
        ),
      );
      const splitFactorOutcome = yield* emitFloydRun({
        idPrefix: 'composite-factor-call',
        title: `Rozbicie dzielnika ${firstFactor}`,
        n: firstFactor,
        c: scenario.cForCompositeFactor,
        x0: scenario.x0,
        functionName: 'g',
      });
      if (splitFactorOutcome.kind === 'factor') {
        const subQuotient = firstFactor / splitFactorOutcome.factor;
        yield* emit(
          math(
            'composite-factor-quotient',
            `${firstFactor} / ${splitFactorOutcome.factor} = ${subQuotient}`,
          ),
        );
        yield* emit(
          math(
            'composite-factor-product',
            `${firstFactor} = ${splitFactorOutcome.factor} * ${subQuotient}`,
          ),
        );
        factors.push(splitFactorOutcome.factor, subQuotient);
      } else {
        factors.push(firstFactor);
      }
    }

    if (isPrime(quotient)) {
      factors.push(quotient);
    } else {
      const splitQuotientOutcome = yield* emitFloydRun({
        idPrefix: 'composite-quotient-call',
        title: `Rozbicie ilorazu ${quotient}`,
        n: quotient,
        c: scenario.c,
        x0: scenario.x0,
      });
      if (splitQuotientOutcome.kind === 'factor') {
        const subQuotient = quotient / splitQuotientOutcome.factor;
        yield* emit(
          math(
            'composite-quotient-quotient',
            `${quotient} / ${splitQuotientOutcome.factor} = ${subQuotient}`,
          ),
        );
        yield* emit(
          math(
            'composite-quotient-product',
            `${quotient} = ${splitQuotientOutcome.factor} * ${subQuotient}`,
          ),
        );
        factors.push(splitQuotientOutcome.factor, subQuotient);
      } else {
        factors.push(quotient);
      }
    }

    yield* emit(resultSection());
    yield* emit(math('composite-result-discovery', `${scenario.n} = ${factors.join(' * ')}`));
    yield* emit(note('composite-result-sorted-label', 'Po uporządkowaniu:'));
    yield* emit(
      math(
        'composite-result-sorted',
        `${scenario.n} = ${[...factors].sort((a, b) => a - b).join(' * ')}`,
      ),
    );
  }

  switch (scenario.notebookFlow.kind) {
    case 'floyd-basic':
      yield* emitBasicFloyd();
      return;
    case 'retry-after-cycle':
      yield* emitRetryAfterCycle();
      return;
    case 'brent-batch-gcd':
      yield* emitBrentBatchGcd();
      return;
    case 'recursive-factorization':
      yield* emitRecursiveFactorization();
      return;
    case 'composite-factor-split':
      yield* emitCompositeFactorSplit();
      return;
  }
}

function runFloyd(n: number, c: number, x0: number, maxIterations: number): FloydOutcome {
  const f = (value: number) => (value * value + c) % n;
  let x = x0;
  let y = x0;
  const rows: FloydRow[] = [];

  for (let index = 1; index <= maxIterations; index++) {
    const previousX = x;
    const previousY = y;
    x = f(x);
    const yMid = f(y);
    y = f(yMid);
    const diff = Math.abs(x - y);
    const rowGcd = gcd(diff, n);
    rows.push({ index, previousX, previousY, x, yMid, y, diff, gcd: rowGcd });
    if (rowGcd > 1 && rowGcd < n) {
      return { kind: 'factor', rows, factor: rowGcd };
    }
    if (rowGcd === n) {
      return { kind: 'cycle', rows };
    }
  }

  return { kind: 'exhausted', rows };
}

function runBrent(
  n: number,
  c: number,
  x0: number,
  batchSize: number,
  maxIterations: number,
): BrentOutcome {
  const f = (value: number) => (value * value + c) % n;
  let y = x0;
  let r = 1;
  let g = 1;
  let iterations = 0;
  const batches: BrentBatch[] = [];

  while (g === 1 && iterations < maxIterations) {
    const x = y;
    for (let i = 0; i < r; i++) {
      y = f(y);
    }

    let k = 0;
    while (k < r && g === 1 && iterations < maxIterations) {
      let q = 1;
      const rows: BrentBatchRow[] = [];
      const limit = Math.min(batchSize, r - k);

      for (let i = 0; i < limit; i++) {
        y = f(y);
        const diff = Math.abs(x - y);
        q = (q * diff) % n;
        rows.push({ y, diff, q });
        iterations += 1;
      }

      g = gcd(q, n);
      batches.push({ r, x, rows, gcd: g });
      k += batchSize;
    }

    r *= 2;
  }

  if (g > 1 && g < n) return { kind: 'factor', batches, factor: g };
  if (g === n) return { kind: 'cycle', batches };
  return { kind: 'exhausted', batches };
}

function groupBatchesByR(batches: readonly BrentBatch[]): Map<number, BrentBatch[]> {
  const result = new Map<number, BrentBatch[]>();
  for (const batch of batches) {
    const group = result.get(batch.r) ?? [];
    group.push(batch);
    result.set(batch.r, group);
  }
  return result;
}

function phaseFor(builder: LineBuilder): string {
  if (builder.id.includes('result')) return 'Wynik';
  if (builder.id.includes('split') || builder.id.includes('quotient')) return 'Rozbicie';
  if (builder.id.includes('iter') || builder.id.includes('brent-r')) return 'Iteracje';
  if (builder.id.includes('params') || builder.id.includes('parameters')) return 'Parametry';
  return 'Obliczenia';
}

function decisionFor(builder: LineBuilder): string {
  if (builder.id === 'section-no-result') return 'Przebieg nie znalazł faktora.';
  if (builder.kind === 'result') return 'Zapisujemy wynik.';
  if (builder.kind === 'note') return 'Zapisujemy kolejny fragment rozwiązania.';
  return 'Liczymy kolejny wiersz.';
}

function toneFor(builder: LineBuilder): ScratchpadLabTraceState['tone'] {
  if (builder.kind === 'result')
    return builder.id === 'section-no-result' ? 'conclude' : 'complete';
  if (builder.kind === 'note') return 'setup';
  return 'compute';
}

function ordinalCall(index: number): string {
  switch (index) {
    case 1:
      return 'Pierwsze';
    case 2:
      return 'Drugie';
    case 3:
      return 'Trzecie';
    default:
      return `${index}.`;
  }
}

function ordinalSplit(index: number): string {
  switch (index) {
    case 1:
      return 'Pierwsze';
    case 2:
      return 'Drugie';
    case 3:
      return 'Trzecie';
    default:
      return `${index}.`;
  }
}

function isPrime(value: number): boolean {
  if (value < 2) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
    if (value % divisor === 0) return false;
  }
  return true;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}
