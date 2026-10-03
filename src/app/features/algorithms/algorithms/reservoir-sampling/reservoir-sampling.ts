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
import type { ReservoirSamplingScenario } from '../../utils/scenarios/number-lab/reservoir-sampling-scenarios';
import { createNumberLabStep } from '../number-lab-step';
import { NOTEBOOK_TEXT } from '../notebook-text';
import { withScratchpad } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.modeLabel'),
  numberLabModeLabel: t('features.algorithms.runtime.numberLab.reservoirSampling.modeLabel'),
  registers: {
    decision: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.registers.decision'),
  },
  sections: {
    init: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.sections.init'),
    keys: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.sections.keys'),
    ranking: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.sections.ranking'),
    merge: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.sections.merge'),
    shard: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.sections.shard'),
  },
  phases: {
    stream: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.phases.stream'),
    draws: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.phases.draws'),
    reservoirState: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.phases.reservoirState'),
  },
  notes: {
    firstElement: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.notes.firstElement'),
    elementE: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.notes.elementE'),
    predicateCounter: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.notes.predicateCounter'),
    keepLargest: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.notes.keepLargest'),
    largestKeys: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.notes.largestKeys'),
    smallerPriority: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.notes.smallerPriority'),
    smallestPriorities: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.notes.smallestPriorities'),
  },
  lines: {
    reservoir: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.reservoir'),
    stream: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.stream'),
    predicate: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicate'),
    keyFormula: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.keyFormula'),
    kOneStart: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.kOneStart'),
    kOneCompare: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.kOneCompare'),
    kOneAccept: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.kOneAccept'),
    kOneKeep: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.kOneKeep'),
    checkAProduct: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.checkAProduct'),
    checkAResult: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.checkAResult'),
    checkESelected: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.checkESelected'),
    checkESurvives: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.checkESurvives'),
    checkEResult: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.checkEResult'),
    fixedDraw: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.fixedDraw'),
    fixedReplace: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.fixedReplace'),
    fixedSkip: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.fixedSkip'),
    predicateIgnore: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicateIgnore'),
    predicateAdd: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicateAdd'),
    predicateReplace: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicateReplace'),
    predicateSkip: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.predicateSkip'),
    weightedKey: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.lines.weightedKey'),
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

interface LiveState {
  i: number | null;
  draw: number | null;
  decision: string | null;
  reservoir: readonly string[];
  resultReservoir: string | null;
  realCounter: number | null;
  history: { id: string; label: string; value: string }[];
}

const NO_CHANGE = '—';

export function* reservoirSamplingGenerator(
  scenario: ReservoirSamplingScenario,
): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const values = scenario.values;
  const lineBuilders: LineBuilder[] = [];
  let stepIndex = 0;
  const live: LiveState = {
    i: null,
    draw: null,
    decision: null,
    reservoir: [],
    resultReservoir: null,
    realCounter: null,
    history: [],
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
    recordHistory(builder);
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

  function track(patch: Partial<Omit<LiveState, 'history'>>): void {
    Object.assign(live, patch);
  }

  function recordHistory(builder: LineBuilder): void {
    if (!/^run-\d+$|^run-\d+-/.test(builder.id) || builder.kind !== 'equation') return;
    const slot = `run-${live.i ?? 'n/a'}`;
    const exists = live.history.find((entry) => entry.id === slot);
    const decisionLabel = live.decision ?? '…';
    if (!exists) {
      live.history.push({
        id: slot,
        label: `i=${live.i ?? '?'}`,
        value: decisionLabel,
      });
    } else if (decisionLabel !== '…') {
      exists.value = decisionLabel;
    }
  }

  function buildRegisters(): readonly NumberLabRegister[] {
    const registers: NumberLabRegister[] = [
      { id: 'k', label: 'k', value: String(values.k), hint: null, tone: 'settled' },
    ];
    if (live.i !== null) {
      registers.push({
        id: 'i',
        label: 'i',
        value: String(live.i),
        hint: null,
        tone: 'active',
      });
    }
    if (live.realCounter !== null) {
      registers.push({
        id: 'r',
        label: 'r',
        value: String(live.realCounter),
        hint: null,
        tone: 'active',
      });
    }
    if (live.draw !== null) {
      registers.push({
        id: 'j',
        label: 'j',
        value: String(live.draw),
        hint: null,
        tone: 'default',
      });
    }
    if (live.decision !== null) {
      registers.push({
        id: 'decision',
        label: i18nText(I18N.registers.decision),
        value: live.decision,
        hint: null,
        tone: 'active',
      });
    }
    if (live.reservoir.length > 0) {
      registers.push({
        id: 'reservoir',
        label: 'R',
        value: `[${live.reservoir.join(', ')}]`,
        hint: null,
        tone: 'settled',
      });
    }
    return registers;
  }

  function buildHistory(): readonly NumberLabHistoryEntry[] {
    return live.history.map((entry, index) => ({
      id: entry.id,
      label: entry.label,
      value: entry.value,
      isCurrent: index === live.history.length - 1,
    }));
  }

  function numberLabState(builder: LineBuilder): NumberLabTraceState {
    return {
      modeLabel: I18N.numberLabModeLabel,
      phaseLabel: phaseFor(builder),
      decisionLabel: decisionFor(builder),
      tone: numberLabToneFor(builder),
      registers: buildRegisters(),
      history: buildHistory(),
      formula: null,
      presetLabel,
      resultLabel: live.resultReservoir,
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

  function* emitResult(reservoir: string): Generator<SortStep> {
    track({ reservoir: listItems(reservoir), resultReservoir: reservoir });
    yield* emit(mathText('result-reservoir', i18nText(I18N.lines.reservoir, { reservoir })));
  }

  function* emitKOne(): Generator<SortStep> {
    const stream = values.stream;
    const reservoir: string[] = [];

    yield* emit(section('section-parameters', i18nText(NOTEBOOK_TEXT.sections.parameters)));
    yield* emit(math('parameters-k', `k = ${values.k}`));
    yield* emit(mathText('parameters-stream', i18nText(I18N.lines.stream, { stream: formatList(stream) })));

    yield* emit(section('section-run', i18nText(NOTEBOOK_TEXT.sections.run)));
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
        track({ i, decision: replaceToken(1, item), reservoir: [...runningReservoir] });
        yield* emit(
          mathText(
            `run-${i}`,
            i18nText(I18N.lines.kOneStart, { i, item, reservoir: formatList(runningReservoir) }),
          ),
        );
        continue;
      }

      const draw = values.random[i] ?? 1;
      const threshold = 1 / i;
      const accepted = draw < threshold;
      track({ i, draw });
      yield* emit(
        mathText(
          `run-${i}-compare`,
          i18nText(I18N.lines.kOneCompare, {
            i,
            item,
            draw: formatDraw(draw),
            threshold: formatThreshold(threshold, i),
          }),
        ),
      );
      if (accepted) runningReservoir[0] = item;
      track({ decision: accepted ? replaceToken(1, item) : NO_CHANGE, reservoir: [...runningReservoir] });
      yield* emit(
        mathText(
          `run-${i}-decision`,
          i18nText(accepted ? I18N.lines.kOneAccept : I18N.lines.kOneKeep, {
            draw: formatDraw(draw),
            threshold: formatThreshold(threshold, i),
            reservoir: formatList(runningReservoir),
          }),
        ),
      );
    }

    yield* emit(section('section-check', i18nText(NOTEBOOK_TEXT.sections.probabilityCheck)));
    yield* emit(note('check-a-label', i18nText(I18N.notes.firstElement)));
    yield* emit(mathText('check-a-product', i18nText(I18N.lines.checkAProduct)));
    yield* emit(mathText('check-a-result', i18nText(I18N.lines.checkAResult)));
    yield* emit(note('check-e-label', i18nText(I18N.notes.elementE)));
    yield* emit(mathText('check-e-selected', i18nText(I18N.lines.checkESelected)));
    yield* emit(mathText('check-e-survives', i18nText(I18N.lines.checkESurvives)));
    yield* emit(mathText('check-e-result', i18nText(I18N.lines.checkEResult)));

    yield* emit(resultSection());
    yield* emitResult(formatList(reservoir));
  }

  function* emitFixedKUpdates(): Generator<SortStep> {
    const stream = values.stream;
    const k = values.k;
    const reservoir = stream.slice(0, k);

    yield* emit(section('section-parameters', i18nText(NOTEBOOK_TEXT.sections.parameters)));
    yield* emit(math('parameters-k', `k = ${k}`));
    yield* emit(mathText('parameters-stream', i18nText(I18N.lines.stream, { stream: formatList(stream) })));

    yield* emit(section('section-init', i18nText(I18N.sections.init)));
    track({ reservoir: [...reservoir] });
    yield* emit(mathText('init-reservoir', i18nText(I18N.lines.reservoir, { reservoir: formatList(reservoir) })));

    yield* emit(section('section-run', i18nText(NOTEBOOK_TEXT.sections.run)));
    for (let index = k; index < stream.length; index++) {
      const i = index + 1;
      const item = stream[index];
      const draw = values.draws[i] ?? i;
      track({ i, draw });
      yield* emit(mathText(`run-${i}-draw`, i18nText(I18N.lines.fixedDraw, { i, item, draw })));
      if (draw <= k) {
        reservoir[draw - 1] = item;
        track({ decision: replaceToken(draw, item), reservoir: [...reservoir] });
        yield* emit(
          mathText(
            `run-${i}-replace`,
            i18nText(I18N.lines.fixedReplace, { draw, k, reservoir: formatList(reservoir) }),
          ),
        );
      } else {
        track({ decision: NO_CHANGE, reservoir: [...reservoir] });
        yield* emit(
          mathText(`run-${i}-skip`, i18nText(I18N.lines.fixedSkip, { draw, k, reservoir: formatList(reservoir) })),
        );
      }
    }

    yield* emit(resultSection());
    yield* emitResult(formatList(reservoir));
  }

  function* emitPredicateReservoir(): Generator<SortStep> {
    const k = values.k;
    const reservoir: string[] = [];
    let realCounter = 0;

    yield* emit(section('section-parameters', i18nText(NOTEBOOK_TEXT.sections.parameters)));
    yield* emit(math('parameters-k', `k = ${k}`));
    yield* emit(mathText('parameters-predicate', i18nText(I18N.lines.predicate, { predicate: values.predicate })));

    yield* emit(section('section-run', i18nText(NOTEBOOK_TEXT.sections.run)));
    for (let index = 0; index < values.predicateStream.length; index++) {
      const streamIndex = index + 1;
      const item = values.predicateStream[index];
      const passes = matchesPredicate(item.status, values.predicate);
      if (!passes) {
        track({ i: streamIndex, realCounter, decision: NO_CHANGE, reservoir: [...reservoir] });
        yield* emit(
          mathText(
            `run-${streamIndex}`,
            i18nText(I18N.lines.predicateIgnore, {
              index: streamIndex,
              item: item.label,
              r: realCounter,
              reservoir: formatList(reservoir),
            }),
          ),
        );
        continue;
      }

      realCounter += 1;
      if (realCounter <= k) {
        reservoir.push(item.label);
        track({ i: streamIndex, realCounter, decision: replaceToken(realCounter, item.label), reservoir: [...reservoir] });
        yield* emit(
          mathText(
            `run-${streamIndex}`,
            i18nText(I18N.lines.predicateAdd, {
              index: streamIndex,
              item: item.label,
              r: realCounter,
              reservoir: formatList(reservoir),
            }),
          ),
        );
        continue;
      }

      const draw = values.drawsForRealItems[realCounter] ?? realCounter;
      if (draw <= k) {
        reservoir[draw - 1] = item.label;
        track({ i: streamIndex, realCounter, draw, decision: replaceToken(draw, item.label), reservoir: [...reservoir] });
        yield* emit(
          mathText(
            `run-${streamIndex}`,
            i18nText(I18N.lines.predicateReplace, {
              index: streamIndex,
              item: item.label,
              r: realCounter,
              draw,
              k,
              reservoir: formatList(reservoir),
            }),
          ),
        );
      } else {
        track({ i: streamIndex, realCounter, draw, decision: NO_CHANGE, reservoir: [...reservoir] });
        yield* emit(
          mathText(
            `run-${streamIndex}`,
            i18nText(I18N.lines.predicateSkip, {
              index: streamIndex,
              item: item.label,
              r: realCounter,
              draw,
              k,
              reservoir: formatList(reservoir),
            }),
          ),
        );
      }
    }

    yield* emit(resultSection());
    yield* emitResult(formatList(reservoir));

    yield* emit(section('section-conclusion', i18nText(NOTEBOOK_TEXT.sections.conclusion)));
    yield* emit(note('conclusion-counter', i18nText(I18N.notes.predicateCounter)));
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

    yield* emit(section('section-parameters', i18nText(NOTEBOOK_TEXT.sections.parameters)));
    yield* emit(math('parameters-k', `k = ${k}`));
    yield* emit(mathText('parameters-key', i18nText(I18N.lines.keyFormula, { formula: values.keyFormula })));
    yield* emit(note('parameters-keep', i18nText(I18N.notes.keepLargest)));

    yield* emit(section('section-keys', i18nText(I18N.sections.keys)));
    for (const item of keyed) {
      yield* emit(
        mathText(
          `key-${item.label}`,
          i18nText(I18N.lines.weightedKey, {
            label: item.label,
            weight: formatNumber(item.weight),
            u: formatNumber(item.u),
            key: formatKey(item.key),
          }),
        ),
      );
    }

    yield* emit(section('section-ranking', i18nText(I18N.sections.ranking)));
    for (const item of ranking) {
      yield* emit(math(`ranking-${item.label}`, `${item.label}: ${formatKey(item.key)}`));
    }

    yield* emit(resultSection());
    yield* emit(note('result-label', i18nText(I18N.notes.largestKeys)));
    yield* emitResult(formatList(selected));
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

    yield* emit(section('section-parameters', i18nText(NOTEBOOK_TEXT.sections.parameters)));
    yield* emit(math('parameters-k', `k = ${k}`));
    yield* emit(note('parameters-priority', i18nText(I18N.notes.smallerPriority)));

    yield* emitShard('A', values.shardA, shardA);
    yield* emitShard('B', values.shardB, shardB);
    yield* emitShard('C', values.shardC, shardC);

    yield* emit(section('section-merge', i18nText(I18N.sections.merge)));
    for (const item of candidates) {
      yield* emit(math(`merge-${item.label}`, `${item.label}: ${formatPriority(item.priority)}`));
    }

    yield* emit(resultSection());
    yield* emit(note('result-global-label', i18nText(I18N.notes.smallestPriorities)));
    yield* emitResult(formatPriorityList(selected));
  }

  function* emitShard(
    label: string,
    items: readonly { readonly label: string; readonly priority: number }[],
    local: readonly { readonly label: string; readonly priority: number }[],
  ): Generator<SortStep> {
    yield* emit(section(`section-shard-${label}`, i18nText(I18N.sections.shard, { label })));
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

function replaceToken(slot: number, item: string): string {
  return `R[${slot}] ← ${item}`;
}

function listItems(list: string): readonly string[] {
  return list
    .replace(/^\[|\]$/g, '')
    .split(/,(?![^()]*\))/)
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0);
}

function phaseFor(builder: LineBuilder): TranslatableText {
  if (builder.id.includes('result')) return i18nText(NOTEBOOK_TEXT.sections.result);
  if (builder.id.includes('parameter')) return i18nText(NOTEBOOK_TEXT.sections.parameters);
  if (builder.id.includes('run') || builder.id.includes('stream')) return i18nText(I18N.phases.stream);
  if (builder.id.includes('key') || builder.id.includes('ranking')) return i18nText(I18N.phases.draws);
  if (builder.id.includes('shard') || builder.id.includes('merge')) return i18nText(I18N.phases.reservoirState);
  if (builder.id.includes('check') || builder.id.includes('conclusion')) return i18nText(NOTEBOOK_TEXT.sections.check);
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

function numberLabToneFor(builder: LineBuilder): NumberLabTone {
  if (builder.kind === 'result') return 'complete';
  if (builder.kind === 'note') return 'idle';
  if (builder.id.includes('section') || builder.id.includes('parameters')) return 'settle';
  return 'update';
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
