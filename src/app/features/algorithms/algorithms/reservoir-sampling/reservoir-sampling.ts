import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { ReservoirSamplingScenario } from '../../utils/scenarios/number-lab/reservoir-sampling-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.modeLabel'),
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

export function* reservoirSamplingGenerator(
  scenario: ReservoirSamplingScenario,
): Generator<SortStep> {
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
      mode: 'reservoir-sampling',
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

  function* emitKOne(): Generator<SortStep> {
    const stream = values.stream;
    const reservoir: string[] = [];

    yield* emit(section('section-parameters', 'Parametry'));
    yield* emit(math('parameters-k', `k = ${values.k}`));
    yield* emit(math('parameters-stream', `stream = ${formatList(stream)}`));

    yield* emit(section('section-run', 'Przebieg'));
    stream.forEach((item, index) => {
      const i = index + 1;
      if (i === 1) {
        reservoir[0] = item;
        return;
      }
      const draw = values.random[i] ?? 1;
      const threshold = 1 / i;
      if (draw < threshold) reservoir[0] = item;
    });

    const runningReservoir: string[] = [];
    for (let index = 0; index < stream.length; index++) {
      const i = index + 1;
      const item = stream[index];
      if (i === 1) {
        runningReservoir[0] = item;
        yield* emit(
          math(
            `run-${i}`,
            `i = ${i}, element = ${item}, decyzja = start, reservoir = ${formatList(runningReservoir)}`,
          ),
        );
        continue;
      }

      const draw = values.random[i] ?? 1;
      const threshold = 1 / i;
      const accepted = draw < threshold;
      if (accepted) runningReservoir[0] = item;
      yield* emit(
        math(
          `run-${i}-compare`,
          `i = ${i}, element = ${item}, random[${i}] = ${formatDraw(draw)}, próg = 1 / ${i} = ${formatThreshold(threshold, i)}`,
        ),
      );
      yield* emit(
        math(
          `run-${i}-decision`,
          `${formatDraw(draw)} ${accepted ? '<' : '>='} ${formatThreshold(threshold, i)} \\to ${accepted ? 'zastąp' : 'nie\\ zastępuj'}, reservoir = ${formatList(runningReservoir)}`,
        ),
      );
    }

    yield* emit(section('section-check', 'Sprawdzenie idei prawdopodobieństwa'));
    yield* emit(note('check-a-label', 'Dla pierwszego elementu:'));
    yield* emit(
      math(
        'check-a-product',
        'P(A\\ zostaje\\ do\\ końca) = (1 - 1/2)(1 - 1/3)(1 - 1/4)(1 - 1/5)(1 - 1/6)',
      ),
    );
    yield* emit(
      math('check-a-result', 'P(A\\ zostaje\\ do\\ końca) = (1/2)(2/3)(3/4)(4/5)(5/6) = 1/6'),
    );
    yield* emit(note('check-e-label', 'Dla elementu E:'));
    yield* emit(math('check-e-selected', 'P(E\\ jest\\ wybrane\\ na\\ i = 5) = 1/5'));
    yield* emit(math('check-e-survives', 'P(E\\ przetrwa\\ i = 6) = 1 - 1/6 = 5/6'));
    yield* emit(math('check-e-result', 'P(E\\ w\\ końcowej\\ próbce) = (1/5)(5/6) = 1/6'));

    yield* emit(resultSection());
    yield* emit(math('result-reservoir', `reservoir = ${formatList(reservoir)}`));
  }

  function* emitFixedKUpdates(): Generator<SortStep> {
    const stream = values.stream;
    const k = values.k;
    const reservoir = stream.slice(0, k);

    yield* emit(section('section-parameters', 'Parametry'));
    yield* emit(math('parameters-k', `k = ${k}`));
    yield* emit(math('parameters-stream', `stream = ${formatList(stream)}`));

    yield* emit(section('section-init', 'Inicjalizacja'));
    yield* emit(math('init-reservoir', `reservoir = ${formatList(reservoir)}`));

    yield* emit(section('section-run', 'Przebieg'));
    for (let index = k; index < stream.length; index++) {
      const i = index + 1;
      const item = stream[index];
      const draw = values.draws[i] ?? i;
      yield* emit(math(`run-${i}-draw`, `i = ${i}, element = ${item}, j = ${draw}`));
      if (draw <= k) {
        reservoir[draw - 1] = item;
        yield* emit(
          math(
            `run-${i}-replace`,
            `${draw} <= ${k} \\to zastąp\\ pozycję\\ ${draw}, reservoir = ${formatList(reservoir)}`,
          ),
        );
      } else {
        yield* emit(
          math(`run-${i}-skip`, `${draw} > ${k} \\to pomiń, reservoir = ${formatList(reservoir)}`),
        );
      }
    }

    yield* emit(resultSection());
    yield* emit(math('result-reservoir', `reservoir = ${formatList(reservoir)}`));
  }

  function* emitPredicateReservoir(): Generator<SortStep> {
    const k = values.k;
    const reservoir: string[] = [];
    let realCounter = 0;

    yield* emit(section('section-parameters', 'Parametry'));
    yield* emit(math('parameters-k', `k = ${k}`));
    yield* emit(math('parameters-predicate', `predicate = ${values.predicate}`));

    yield* emit(section('section-run', 'Przebieg'));
    for (let index = 0; index < values.predicateStream.length; index++) {
      const streamIndex = index + 1;
      const item = values.predicateStream[index];
      const passes = matchesPredicate(item.status, values.predicate);
      if (!passes) {
        yield* emit(
          math(
            `run-${streamIndex}`,
            `indeks = ${streamIndex}, element = ${item.label}, predykat = nie, r = ${realCounter}, decyzja = ignoruj, reservoir = ${formatList(reservoir)}`,
          ),
        );
        continue;
      }

      realCounter += 1;
      if (realCounter <= k) {
        reservoir.push(item.label);
        yield* emit(
          math(
            `run-${streamIndex}`,
            `indeks = ${streamIndex}, element = ${item.label}, predykat = tak, r = ${realCounter}, decyzja = dodaj, reservoir = ${formatList(reservoir)}`,
          ),
        );
        continue;
      }

      const draw = values.drawsForRealItems[realCounter] ?? realCounter;
      if (draw <= k) {
        reservoir[draw - 1] = item.label;
        yield* emit(
          math(
            `run-${streamIndex}`,
            `indeks = ${streamIndex}, element = ${item.label}, predykat = tak, r = ${realCounter}, j = ${draw}, ${draw} <= ${k} \\to zastąp\\ pozycję\\ ${draw}, reservoir = ${formatList(reservoir)}`,
          ),
        );
      } else {
        yield* emit(
          math(
            `run-${streamIndex}`,
            `indeks = ${streamIndex}, element = ${item.label}, predykat = tak, r = ${realCounter}, j = ${draw}, ${draw} > ${k} \\to pomiń, reservoir = ${formatList(reservoir)}`,
          ),
        );
      }
    }

    yield* emit(resultSection());
    yield* emit(math('result-reservoir', `reservoir = ${formatList(reservoir)}`));

    yield* emit(section('section-conclusion', 'Wniosek'));
    yield* emit(
      note(
        'conclusion-counter',
        'Losowania są liczone względem liczby elementów spełniających predykat, nie względem całej długości strumienia.',
      ),
    );
  }

  function* emitWeightedReservoir(): Generator<SortStep> {
    const k = values.k;
    const keyed = values.weightedItems.map((item, index) => ({
      ...item,
      index,
      key: item.u ** (1 / item.weight),
    }));
    const ranking = [...keyed].sort((left, right) => {
      const diff = right.key - left.key;
      return diff === 0 ? left.index - right.index : diff;
    });
    const selected = ranking.slice(0, k).map((item) => item.label);

    yield* emit(section('section-parameters', 'Parametry'));
    yield* emit(math('parameters-k', `k = ${k}`));
    yield* emit(math('parameters-key', `key = ${values.keyFormula}`));
    yield* emit(note('parameters-keep', 'wybieramy największe klucze'));

    yield* emit(section('section-keys', 'Obliczenia kluczy'));
    for (const item of keyed) {
      yield* emit(
        math(
          `key-${item.label}`,
          `${item.label}: weight = ${formatNumber(item.weight)}, u = ${formatNumber(item.u)}, key = ${formatNumber(item.u)}^{1 / ${formatNumber(item.weight)}} = ${formatKey(item.key)}`,
        ),
      );
    }

    yield* emit(section('section-ranking', 'Ranking'));
    for (const item of ranking) {
      yield* emit(math(`ranking-${item.label}`, `${item.label}: ${formatKey(item.key)}`));
    }

    yield* emit(resultSection());
    yield* emit(note('result-label', 'Wybieramy dwa największe klucze:'));
    yield* emit(math('result-reservoir', `reservoir = ${formatList(selected)}`));
  }

  function* emitDistributedMerge(): Generator<SortStep> {
    const k = values.k;
    const shardA = localTop(values.shardA, k);
    const shardB = localTop(values.shardB, k);
    const shardC = localTop(values.shardC, k);
    const candidates = [...shardA, ...shardB, ...shardC].sort(
      (left, right) => left.priority - right.priority,
    );
    const selected = candidates.slice(0, k);

    yield* emit(section('section-parameters', 'Parametry'));
    yield* emit(math('parameters-k', `k = ${k}`));
    yield* emit(note('parameters-priority', 'mniejszy priority = lepszy'));

    yield* emitShard('A', values.shardA, shardA);
    yield* emitShard('B', values.shardB, shardB);
    yield* emitShard('C', values.shardC, shardC);

    yield* emit(section('section-merge', 'Scalanie kandydatów'));
    for (const item of candidates) {
      yield* emit(math(`merge-${item.label}`, `${item.label}: ${formatPriority(item.priority)}`));
    }

    yield* emit(resultSection());
    yield* emit(note('result-global-label', 'Wybieramy dwa najmniejsze priorytety:'));
    yield* emit(math('result-reservoir', `reservoir = ${formatPriorityList(selected)}`));
  }

  function* emitShard(
    label: string,
    items: readonly { readonly label: string; readonly priority: number }[],
    local: readonly { readonly label: string; readonly priority: number }[],
  ): Generator<SortStep> {
    yield* emit(section(`section-shard-${label}`, `Shard ${label}`));
    for (const item of items) {
      yield* emit(
        math(`shard-${label}-${item.label}`, `${item.label}: ${formatPriority(item.priority)}`),
      );
    }
    yield* emit(math(`shard-${label}-local`, `${label}_local = ${formatPriorityList(local)}`));
  }

  switch (scenario.notebookFlow.kind) {
    case 'k-one':
      yield* emitKOne();
      break;
    case 'fixed-k-updates':
      yield* emitFixedKUpdates();
      break;
    case 'predicate-reservoir':
      yield* emitPredicateReservoir();
      break;
    case 'weighted-reservoir':
      yield* emitWeightedReservoir();
      break;
    case 'distributed-merge':
      yield* emitDistributedMerge();
      break;
  }
}

function phaseFor(builder: LineBuilder): string {
  if (builder.id.includes('result')) return 'Wynik';
  if (builder.id.includes('parameter')) return 'Parametry';
  if (builder.id.includes('run') || builder.id.includes('stream')) return 'Strumień';
  if (builder.id.includes('key') || builder.id.includes('ranking')) return 'Losowania';
  if (builder.id.includes('shard') || builder.id.includes('merge')) return 'Stan rezerwuaru';
  if (builder.id.includes('check') || builder.id.includes('conclusion')) return 'Sprawdzenie';
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

function matchesPredicate(status: string, predicate: string): boolean {
  const match = predicate.match(/==\s*([A-Za-z0-9_-]+)/);
  const expected = match?.[1] ?? 'ERROR';
  return status.trim() === expected;
}

function localTop<T extends { readonly priority: number }>(
  items: readonly T[],
  k: number,
): readonly T[] {
  return [...items].sort((left, right) => left.priority - right.priority).slice(0, k);
}

function formatList(values: readonly string[]): string {
  return `[${values.join(', ')}]`;
}

function formatPriorityList(
  values: readonly { readonly label: string; readonly priority: number }[],
): string {
  return `[${values.map((item) => `(${item.label}, ${formatPriority(item.priority)})`).join(', ')}]`;
}

function formatPriority(value: number): string {
  return value.toFixed(2);
}

function formatDraw(value: number): string {
  return value.toFixed(2);
}

function formatThreshold(value: number, denominator?: number): string {
  if (denominator === 3) return '0.333...';
  if (denominator === 6) return '0.166...';
  return value.toFixed(2);
}

function formatKey(value: number): string {
  return value.toFixed(4);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}
