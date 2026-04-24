import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NumberLabRegister, NumberLabTone, NumberLabTraceState } from '../../models/number-lab';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { EuclideanGcdScenario } from '../../utils/scenarios/number-lab/number-lab-scenarios';
import { createNumberLabStep } from '../number-lab-step';
import { withScratchpad } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.numberLab.gcd.modeLabel'),
  scratchpadModeLabel: t('features.algorithms.runtime.scratchpadLab.gcd.modeLabel'),
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

interface DivisionStep {
  readonly dividend: number;
  readonly divisor: number;
  readonly quotient: number;
  readonly remainder: number;
}

export function* euclideanGcdGenerator(scenario: EuclideanGcdScenario): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const values = scenario.values;
  const lineBuilders: LineBuilder[] = [];
  let stepIndex = 0;
  let currentResult: number | null = null;

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
      mode: 'euclidean-gcd',
      modeLabel: I18N.scratchpadModeLabel,
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
    return withScratchpad(
      createNumberLabStep({
        activeCodeLine: opts.activeCodeLine,
        description: builder.content,
        state: numberLabState(builder),
      }),
      snapshot({ ...opts, currentLineId: builder.id }),
    );
  }

  function numberLabState(builder: LineBuilder): NumberLabTraceState {
    return {
      modeLabel: I18N.modeLabel,
      phaseLabel: phaseFor(builder),
      decisionLabel: decisionFor(builder),
      tone: numberLabToneFor(builder),
      registers: buildRegisters(scenario.a, scenario.b, currentResult),
      history:
        currentResult === null
          ? []
          : [
              {
                id: 'gcd-result',
                label: 'gcd',
                value: String(currentResult),
                isCurrent: builder.kind === 'result',
              },
            ],
      formula: null,
      presetLabel,
      resultLabel: currentResult === null ? null : `gcd = ${currentResult}`,
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

  function resultSection(id = 'section-result', content = 'Wynik'): LineBuilder {
    return paperLine({
      id,
      kind: 'result',
      marker: RESULT_MARKER,
      content,
    });
  }

  function* emit(builder: LineBuilder, activeCodeLine = 1): Generator<SortStep> {
    yield appendStep(builder, {
      activeCodeLine,
      phase: phaseFor(builder),
      decision: decisionFor(builder),
      tone: scratchpadToneFor(builder),
    });
  }

  function* emitDivisionChain(
    idPrefix: string,
    steps: readonly DivisionStep[],
  ): Generator<SortStep> {
    for (let index = 0; index < steps.length; index++) {
      yield* emit(math(`${idPrefix}-${index}`, formatDivisionStep(steps[index])));
    }
  }

  function* emitBasic(): Generator<SortStep> {
    const steps = euclideanSteps(values.a, values.b);
    const result = gcd(values.a, values.b);

    yield* emit(section('section-calculations', 'Obliczenia'));
    yield* emitDivisionChain('calculation', steps);

    yield* emit(section('section-last-remainder', 'Ostatnia niezerowa reszta'));
    yield* emit(math('last-remainder', String(result)));

    currentResult = result;
    yield* emit(resultSection());
    yield* emit(math('result-gcd', `gcd(${values.a}, ${values.b}) = ${result}`));

    yield* emit(section('section-check', 'Sprawdzenie'));
    yield* emit(math('check-a', `${values.a} / ${result} = ${values.a / result}`));
    yield* emit(math('check-b', `${values.b} / ${result} = ${values.b / result}`));
    yield* emit(
      note(
        'check-note',
        `${result} dzieli obie liczby, a następny krok algorytmu zakończył się resztą 0.`,
      ),
    );
  }

  function* emitFibonacciWorstCase(): Generator<SortStep> {
    const steps = euclideanSteps(values.a, values.b);
    const result = gcd(values.a, values.b);

    yield* emit(section('section-calculations', 'Obliczenia'));
    yield* emitDivisionChain('calculation', steps);

    yield* emit(section('section-last-remainder', 'Ostatnia niezerowa reszta'));
    yield* emit(math('last-remainder', String(result)));

    currentResult = result;
    yield* emit(resultSection());
    yield* emit(math('result-gcd', `gcd(${values.a}, ${values.b}) = ${result}`));

    yield* emit(section('section-length-conclusion', 'Wniosek o długości'));
    yield* emit(math('length-quotients', 'większość\\ ilorazów = 1'));
    yield* emit(note('length-note', 'To oznacza wolne zmniejszanie reszt:'));
    yield* emit(math('length-chain', valuesOfChain(steps).join(', ')));
  }

  function* emitMultiNumberFold(): Generator<SortStep> {
    const list = values.values;
    let accumulator = list[0];

    for (let index = 1; index < list.length; index++) {
      const next = list[index];
      const previous = accumulator;
      const stepNumber = index;
      yield* emit(
        section(`section-fold-${stepNumber}`, `Krok ${stepNumber}: gcd(${previous}, ${next})`),
      );
      const steps = euclideanSteps(previous, next);
      yield* emitDivisionChain(`fold-${stepNumber}`, steps);
      accumulator = gcd(previous, next);
      yield* emit(math(`fold-${stepNumber}-result`, `gcd(${previous}, ${next}) = ${accumulator}`));
    }

    currentResult = accumulator;
    yield* emit(resultSection());
    yield* emit(math('result-gcd', `gcd(${list.join(', ')}) = ${accumulator}`));

    yield* emit(section('section-interpretation', 'Interpretacja'));
    yield* emit(
      note(
        'interpretation-note',
        'Jeśli liczby oznaczają rozmiary partii danych, największy wspólny rozmiar bloku wynosi:',
      ),
    );
    yield* emit(math('interpretation-block', String(accumulator)));
    yield* emit(note('interpretation-count-label', 'Liczba bloków:'));
    for (const value of list) {
      yield* emit(
        math(`interpretation-count-${value}`, `${value} / ${accumulator} = ${value / accumulator}`),
      );
    }
  }

  function* emitFractionReduction(): Generator<SortStep> {
    const numerator = values.numerator;
    const denominator = values.denominator;
    const steps = euclideanSteps(numerator, denominator);
    const result = gcd(numerator, denominator);

    yield* emit(section('section-calculations', 'Obliczenia NWD'));
    yield* emitDivisionChain('calculation', steps);

    yield* emit(section('section-last-remainder', 'Ostatnia niezerowa reszta'));
    yield* emit(math('last-remainder', String(result)));

    yield* emit(section('section-gcd', 'NWD'));
    currentResult = result;
    yield* emit(math('gcd-result', `gcd(${numerator}, ${denominator}) = ${result}`));

    yield* emit(section('section-reduction', 'Skracanie ułamka'));
    yield* emit(math('reduce-numerator', `${numerator} / ${result} = ${numerator / result}`));
    yield* emit(math('reduce-denominator', `${denominator} / ${result} = ${denominator / result}`));

    yield* emit(resultSection());
    yield* emit(
      math(
        'result-fraction',
        `${numerator} / ${denominator} = ${numerator / result} / ${denominator / result}`,
      ),
    );
  }

  function* emitSubtractiveToDivision(): Generator<SortStep> {
    const steps = subtractiveSteps(values.a, values.b);
    const divisionSteps = euclideanSteps(values.a, values.b);
    const result = gcd(values.a, values.b);

    yield* emit(section('section-subtractive', 'Wersja przez odejmowanie'));
    for (let index = 0; index < steps.length; index++) {
      const step = steps[index];
      yield* emit(math(`subtract-${index}`, `${step.left} - ${step.right} = ${step.result}`));
    }

    yield* emit(section('section-last-positive', 'Ostatnia dodatnia wartość'));
    yield* emit(math('last-positive', String(result)));

    yield* emit(section('section-division', 'Ten sam proces przez dzielenie'));
    if (divisionSteps[0]) {
      yield* emit(
        note(
          'division-note-1',
          `Pierwsze odejmowania ${divisionSteps[0].divisor} od ${divisionSteps[0].dividend} można zapisać jako:`,
        ),
      );
      yield* emit(math('division-1', formatDivisionStep(divisionSteps[0])));
    }
    if (divisionSteps[1]) {
      yield* emit(
        note(
          'division-note-2',
          `Następne odejmowania ${divisionSteps[1].divisor} od ${divisionSteps[1].dividend} można zapisać jako:`,
        ),
      );
      yield* emit(math('division-2', formatDivisionStep(divisionSteps[1])));
    }

    yield* emit(section('section-gcd-result', 'Wynik NWD'));
    currentResult = result;
    yield* emit(math('gcd-result', `gcd(${values.a}, ${values.b}) = ${result}`));

    yield* emit(section('section-geometry', 'Interpretacja geometryczna'));
    yield* emit(note('geometry-side-label', 'Największy kwadratowy kafelek ma bok:'));
    yield* emit(math('geometry-side', String(result)));
    yield* emit(note('geometry-count-label', 'Liczba kafelków w prostokącie:'));
    yield* emit(math('geometry-a', `${values.a} / ${result} = ${values.a / result}`));
    yield* emit(math('geometry-b', `${values.b} / ${result} = ${values.b / result}`));
    yield* emit(
      math(
        'geometry-product',
        `${values.a / result} * ${values.b / result} = ${(values.a / result) * (values.b / result)}`,
      ),
    );

    yield* emit(resultSection('section-final-result', 'Wynik końcowy'));
    yield* emit(math('final-side', `bok\\ kafelka = ${result}`));
    yield* emit(
      math('final-count', `liczba\\ kafelków = ${(values.a / result) * (values.b / result)}`),
    );
  }

  switch (scenario.notebookFlow.kind) {
    case 'basic':
      yield* emitBasic();
      break;
    case 'fibonacci-worst-case':
      yield* emitFibonacciWorstCase();
      break;
    case 'multi-number-fold':
      yield* emitMultiNumberFold();
      break;
    case 'fraction-reduction':
      yield* emitFractionReduction();
      break;
    case 'subtractive-to-division':
      yield* emitSubtractiveToDivision();
      break;
  }
}

function buildRegisters(a: number, b: number, result: number | null): readonly NumberLabRegister[] {
  const registers: NumberLabRegister[] = [
    { id: 'a', label: 'a', value: String(a), hint: null, tone: 'default' },
    { id: 'b', label: 'b', value: String(b), hint: null, tone: 'default' },
  ];
  if (result !== null) {
    registers.push({
      id: 'gcd',
      label: 'gcd',
      value: String(result),
      hint: null,
      tone: 'settled',
    });
  }
  return registers;
}

function euclideanSteps(a: number, b: number): readonly DivisionStep[] {
  let dividend = Math.max(a, b);
  let divisor = Math.min(a, b);
  const steps: DivisionStep[] = [];
  while (divisor !== 0) {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    steps.push({ dividend, divisor, quotient, remainder });
    dividend = divisor;
    divisor = remainder;
  }
  return steps;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

function formatDivisionStep(step: DivisionStep): string {
  return `${step.dividend} = ${step.quotient} * ${step.divisor} + ${step.remainder}`;
}

function valuesOfChain(steps: readonly DivisionStep[]): readonly number[] {
  if (steps.length === 0) return [];
  const values = [steps[0].dividend, steps[0].divisor];
  for (const step of steps) {
    if (step.remainder !== 0) values.push(step.remainder);
  }
  return values;
}

function subtractiveSteps(
  a: number,
  b: number,
): readonly { readonly left: number; readonly right: number; readonly result: number }[] {
  let x = Math.max(a, b);
  let y = Math.min(a, b);
  const steps: { readonly left: number; readonly right: number; readonly result: number }[] = [];
  while (x !== y) {
    if (x > y) {
      steps.push({ left: x, right: y, result: x - y });
      x -= y;
    } else {
      steps.push({ left: y, right: x, result: y - x });
      y -= x;
    }
  }
  steps.push({ left: x, right: y, result: 0 });
  return steps;
}

function phaseFor(builder: LineBuilder): string {
  if (builder.id.includes('result')) return 'Wynik';
  if (builder.id.includes('check') || builder.id.includes('interpretation')) return 'Sprawdzenie';
  if (builder.id.includes('last')) return 'Ostatnia niezerowa reszta';
  return 'Obliczenia';
}

function decisionFor(builder: LineBuilder): string {
  if (builder.kind === 'result') return 'Zapisujemy wynik.';
  if (builder.kind === 'note') return 'Zapisujemy kolejny fragment rozwiązania.';
  return 'Liczymy kolejny wiersz.';
}

function scratchpadToneFor(builder: LineBuilder): ScratchpadLabTraceState['tone'] {
  if (builder.kind === 'result') return 'complete';
  if (builder.kind === 'note') return 'setup';
  return 'compute';
}

function numberLabToneFor(builder: LineBuilder): NumberLabTone {
  if (builder.kind === 'result') return 'complete';
  if (builder.kind === 'note') return 'idle';
  return 'update';
}
