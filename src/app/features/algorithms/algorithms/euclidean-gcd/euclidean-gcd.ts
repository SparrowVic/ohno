import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { NumberLabRegister, NumberLabTone, NumberLabTraceState } from '../../models/number-lab';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { EuclideanGcdScenario } from '../../utils/scenarios/number-lab/number-lab-scenarios';
import { createNumberLabStep } from '../number-lab-step';
import { NOTEBOOK_TEXT } from '../notebook-text';
import { withScratchpad } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.numberLab.gcd.modeLabel'),
  scratchpadModeLabel: t('features.algorithms.runtime.scratchpadLab.gcd.modeLabel'),
  notes: {
    check: t('features.algorithms.runtime.scratchpadLab.gcd.notes.check'),
    slowDecrease: t('features.algorithms.runtime.scratchpadLab.gcd.notes.slowDecrease'),
    blockSize: t('features.algorithms.runtime.scratchpadLab.gcd.notes.blockSize'),
    blockCount: t('features.algorithms.runtime.scratchpadLab.gcd.notes.blockCount'),
    firstSubtractions: t('features.algorithms.runtime.scratchpadLab.gcd.notes.firstSubtractions'),
    nextSubtractions: t('features.algorithms.runtime.scratchpadLab.gcd.notes.nextSubtractions'),
    tileSide: t('features.algorithms.runtime.scratchpadLab.gcd.notes.tileSide'),
    tileCount: t('features.algorithms.runtime.scratchpadLab.gcd.notes.tileCount'),
  },
  sections: {
    lengthConclusion: t('features.algorithms.runtime.scratchpadLab.gcd.sections.lengthConclusion'),
    foldStep: t('features.algorithms.runtime.scratchpadLab.gcd.sections.foldStep'),
    gcdComputation: t('features.algorithms.runtime.scratchpadLab.gcd.sections.gcdComputation'),
    gcd: t('features.algorithms.runtime.scratchpadLab.gcd.sections.gcd'),
    fractionReduction: t('features.algorithms.runtime.scratchpadLab.gcd.sections.fractionReduction'),
    subtractive: t('features.algorithms.runtime.scratchpadLab.gcd.sections.subtractive'),
    lastPositive: t('features.algorithms.runtime.scratchpadLab.gcd.sections.lastPositive'),
    division: t('features.algorithms.runtime.scratchpadLab.gcd.sections.division'),
    gcdResult: t('features.algorithms.runtime.scratchpadLab.gcd.sections.gcdResult'),
    geometry: t('features.algorithms.runtime.scratchpadLab.gcd.sections.geometry'),
    finalResult: t('features.algorithms.runtime.scratchpadLab.gcd.sections.finalResult'),
  },
  lines: {
    mostQuotients: t('features.algorithms.runtime.scratchpadLab.gcd.lines.mostQuotients'),
    tileSide: t('features.algorithms.runtime.scratchpadLab.gcd.lines.tileSide'),
    tileCount: t('features.algorithms.runtime.scratchpadLab.gcd.lines.tileCount'),
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

  function resultSection(id = 'section-result', content: TranslatableText = i18nText(NOTEBOOK_TEXT.sections.result)): LineBuilder {
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

    yield* emit(section('section-calculations', i18nText(NOTEBOOK_TEXT.sections.computation)));
    yield* emitDivisionChain('calculation', steps);

    yield* emit(section('section-last-remainder', i18nText(NOTEBOOK_TEXT.sections.lastRemainder)));
    yield* emit(math('last-remainder', String(result)));

    currentResult = result;
    yield* emit(resultSection());
    yield* emit(math('result-gcd', `gcd(${values.a}, ${values.b}) = ${result}`));

    yield* emit(section('section-check', i18nText(NOTEBOOK_TEXT.sections.check)));
    yield* emit(math('check-a', `${values.a} / ${result} = ${values.a / result}`));
    yield* emit(math('check-b', `${values.b} / ${result} = ${values.b / result}`));
    yield* emit(
      note(
        'check-note',
        i18nText(I18N.notes.check, { result }),
      ),
    );
  }

  function* emitFibonacciWorstCase(): Generator<SortStep> {
    const steps = euclideanSteps(values.a, values.b);
    const result = gcd(values.a, values.b);

    yield* emit(section('section-calculations', i18nText(NOTEBOOK_TEXT.sections.computation)));
    yield* emitDivisionChain('calculation', steps);

    yield* emit(section('section-last-remainder', i18nText(NOTEBOOK_TEXT.sections.lastRemainder)));
    yield* emit(math('last-remainder', String(result)));

    currentResult = result;
    yield* emit(resultSection());
    yield* emit(math('result-gcd', `gcd(${values.a}, ${values.b}) = ${result}`));

    yield* emit(section('section-length-conclusion', i18nText(I18N.sections.lengthConclusion)));
    yield* emit(paperLine({ id: 'length-quotients', kind: 'equation', content: i18nText(I18N.lines.mostQuotients) }));
    yield* emit(note('length-note', i18nText(I18N.notes.slowDecrease)));
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
        section(`section-fold-${stepNumber}`, i18nText(I18N.sections.foldStep, { step: stepNumber, a: previous, b: next })),
      );
      const steps = euclideanSteps(previous, next);
      yield* emitDivisionChain(`fold-${stepNumber}`, steps);
      accumulator = gcd(previous, next);
      yield* emit(math(`fold-${stepNumber}-result`, `gcd(${previous}, ${next}) = ${accumulator}`));
    }

    currentResult = accumulator;
    yield* emit(resultSection());
    yield* emit(math('result-gcd', `gcd(${list.join(', ')}) = ${accumulator}`));

    yield* emit(section('section-interpretation', i18nText(NOTEBOOK_TEXT.sections.interpretation)));
    yield* emit(
      note(
        'interpretation-note',
        i18nText(I18N.notes.blockSize),
      ),
    );
    yield* emit(math('interpretation-block', String(accumulator)));
    yield* emit(note('interpretation-count-label', i18nText(I18N.notes.blockCount)));
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

    yield* emit(section('section-calculations', i18nText(I18N.sections.gcdComputation)));
    yield* emitDivisionChain('calculation', steps);

    yield* emit(section('section-last-remainder', i18nText(NOTEBOOK_TEXT.sections.lastRemainder)));
    yield* emit(math('last-remainder', String(result)));

    yield* emit(section('section-gcd', i18nText(I18N.sections.gcd)));
    currentResult = result;
    yield* emit(math('gcd-result', `gcd(${numerator}, ${denominator}) = ${result}`));

    yield* emit(section('section-reduction', i18nText(I18N.sections.fractionReduction)));
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

    yield* emit(section('section-subtractive', i18nText(I18N.sections.subtractive)));
    for (let index = 0; index < steps.length; index++) {
      const step = steps[index];
      yield* emit(math(`subtract-${index}`, `${step.left} - ${step.right} = ${step.result}`));
    }

    yield* emit(section('section-last-positive', i18nText(I18N.sections.lastPositive)));
    yield* emit(math('last-positive', String(result)));

    yield* emit(section('section-division', i18nText(I18N.sections.division)));
    if (divisionSteps[0]) {
      yield* emit(
        note(
          'division-note-1',
          i18nText(I18N.notes.firstSubtractions, { divisor: divisionSteps[0].divisor, dividend: divisionSteps[0].dividend }),
        ),
      );
      yield* emit(math('division-1', formatDivisionStep(divisionSteps[0])));
    }
    if (divisionSteps[1]) {
      yield* emit(
        note(
          'division-note-2',
          i18nText(I18N.notes.nextSubtractions, { divisor: divisionSteps[1].divisor, dividend: divisionSteps[1].dividend }),
        ),
      );
      yield* emit(math('division-2', formatDivisionStep(divisionSteps[1])));
    }

    yield* emit(section('section-gcd-result', i18nText(I18N.sections.gcdResult)));
    currentResult = result;
    yield* emit(math('gcd-result', `gcd(${values.a}, ${values.b}) = ${result}`));

    yield* emit(section('section-geometry', i18nText(I18N.sections.geometry)));
    yield* emit(note('geometry-side-label', i18nText(I18N.notes.tileSide)));
    yield* emit(math('geometry-side', String(result)));
    yield* emit(note('geometry-count-label', i18nText(I18N.notes.tileCount)));
    yield* emit(math('geometry-a', `${values.a} / ${result} = ${values.a / result}`));
    yield* emit(math('geometry-b', `${values.b} / ${result} = ${values.b / result}`));
    yield* emit(
      math(
        'geometry-product',
        `${values.a / result} * ${values.b / result} = ${(values.a / result) * (values.b / result)}`,
      ),
    );

    yield* emit(resultSection('section-final-result', i18nText(I18N.sections.finalResult)));
    yield* emit(paperLine({ id: 'final-side', kind: 'equation', indent: CALCULATION_INDENT, content: i18nText(I18N.lines.tileSide, { side: result }) }));
    yield* emit(
      paperLine({
        id: 'final-count',
        kind: 'equation',
        indent: CALCULATION_INDENT,
        content: i18nText(I18N.lines.tileCount, { count: (values.a / result) * (values.b / result) }),
      }),
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

function phaseFor(builder: LineBuilder): TranslatableText {
  if (builder.id.includes('result')) return i18nText(NOTEBOOK_TEXT.sections.result);
  if (builder.id.includes('check') || builder.id.includes('interpretation')) return i18nText(NOTEBOOK_TEXT.sections.check);
  if (builder.id.includes('last')) return i18nText(NOTEBOOK_TEXT.sections.lastRemainder);
  return i18nText(NOTEBOOK_TEXT.sections.computation);
}

function decisionFor(builder: LineBuilder): TranslatableText {
  if (builder.kind === 'result') return i18nText(NOTEBOOK_TEXT.decisions.result);
  if (builder.kind === 'note') return i18nText(NOTEBOOK_TEXT.decisions.note);
  return i18nText(NOTEBOOK_TEXT.decisions.compute);
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
