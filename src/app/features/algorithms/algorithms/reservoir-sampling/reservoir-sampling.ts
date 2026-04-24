import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { ReservoirSamplingScenario } from '../../utils/scenarios/number-lab/reservoir-sampling-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

/**
 * Reservoir sampling (Algorithm R, Vitter 1985) — chalkboard
 * narration.
 *
 * Pulls a uniform random sample of size `k` from a stream whose
 * length isn't known in advance. Fill phase: the first `k` items
 * go straight into the reservoir. Sample phase: for item index `i`
 * (0-based, `i ≥ k`), draw a uniform integer `j ∈ [0, i]`. If
 * `j < k`, item `i` replaces reservoir slot `j`; otherwise the
 * reservoir is unchanged. Post-invariant: every seen item is
 * equally likely to be in the final sample.
 *
 * We use a deterministic LCG so the viz is repeatable — changing
 * the `seed` re-rolls every coin flip in the iteration table.
 */

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.modeLabel'),
  goal: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.goal'),
  rule: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.rule'),
  invariant: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.invariant'),
  setup: {
    streamLine: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.setup.streamLine',
    ),
    streamInstruction: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.setup.streamInstruction',
    ),
    reservoirInit: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.setup.reservoirInit',
    ),
  },
  fill: {
    line: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.fill.line'),
    instruction: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.fill.instruction',
    ),
  },
  sample: {
    header: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.sample.header',
    ),
    roll: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.sample.roll'),
    rollInstruction: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.sample.rollInstruction',
    ),
    accept: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.sample.accept'),
    reject: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.sample.reject'),
    newState: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.sample.newState',
    ),
  },
  result: {
    sample: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.result.sample'),
    signoff: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.result.signoff',
    ),
    emptySignoff: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.result.emptySignoff',
    ),
  },
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.phases.setup'),
    fill: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.phases.fill'),
    sample: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.phases.sample'),
    complete: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.phases.complete',
    ),
  },
  decisions: {
    preparing: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.decisions.preparing',
    ),
    filling: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.decisions.filling',
    ),
    rolling: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.decisions.rolling',
    ),
    accepting: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.decisions.accepting',
    ),
    rejecting: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.decisions.rejecting',
    ),
    done: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.decisions.done'),
  },
  captions: {
    setup: t('features.algorithms.runtime.scratchpadLab.reservoirSampling.captions.setup'),
    fillPhase: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.captions.fillPhase',
    ),
    samplePhase: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.captions.samplePhase',
    ),
    result: t(
      'features.algorithms.runtime.scratchpadLab.reservoirSampling.captions.result',
    ),
  },
} as const;

const SECTION_MARKERS = {
  setup: '①',
  fill: '②',
  sample: '③',
  decision: '⟹',
  result: '✓',
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

/** Deterministic LCG — same constants as Numerical Recipes (1986).
 *  State fits in 32-bit unsigned; `next()` returns a uniform float
 *  in `[0, 1)`. Not for cryptographic use — just for reproducible
 *  visualisations. */
function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4_294_967_296;
  };
}

function formatReservoir(reservoir: readonly number[], filled: number): string {
  const cells = reservoir.map((value, i) => {
    if (i >= filled) return '\\_';
    return String(value);
  });
  return `[${cells.join(', \\, ')}]`;
}

function formatProbability(k: number, iPlusOne: number): string {
  // Render as `k / (i+1) = decimal`, but trim decimals for clean
  // numerators like 3/3 = 1.
  const approx = k / iPlusOne;
  const approxStr = Number.isInteger(approx)
    ? String(approx)
    : approx.toFixed(3).replace(/\.?0+$/, '');
  return `\\frac{${k}}{${iPlusOne}} \\approx ${approxStr}`;
}

export function* reservoirSamplingGenerator(
  scenario: ReservoirSamplingScenario,
): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const stream = scenario.stream;
  const k = Math.min(scenario.reservoirSize, stream.length);
  const random = lcg(scenario.seed);

  const reservoir: number[] = new Array(k).fill(0);
  let filledCount = 0;

  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      captionPinned: true,
      content: i18nText(I18N.goal, { k, n: stream.length }),
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
      mode: 'reservoir-sampling',
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

  // ---------- Step 0: setup (stream + empty reservoir) ----------
  lineBuilders.push({
    id: 'setup-stream',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.setup,
    caption: I18N.captions.setup,
    captionPinned: true,
    content: i18nText(I18N.setup.streamLine, { stream: stream.join(', ') }),
    instruction: i18nText(I18N.setup.streamInstruction, { k, n: stream.length }),
    annotation: i18nText(I18N.setup.reservoirInit, {
      reservoir: formatReservoir(reservoir, filledCount),
    }),
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.setup.streamInstruction, { k, n: stream.length }),
    state: snapshot({
      phase: I18N.phases.setup,
      decision: I18N.decisions.preparing,
      tone: 'setup',
      currentLineId: 'setup-stream',
      resultLabel: null,
    }),
  });

  // ---------- Fill phase ----------
  for (let i = 0; i < k; i++) {
    reservoir[i] = stream[i];
    filledCount = i + 1;
    const fillId = `fill-${i}`;
    lineBuilders.push({
      id: fillId,
      kind: 'substitute',
      indent: 1,
      marker: i === 0 ? SECTION_MARKERS.fill : null,
      caption: i === 0 ? I18N.captions.fillPhase : null,
      captionPinned: i === 0,
      content: i18nText(I18N.fill.line, {
        index: i,
        item: stream[i],
        reservoir: formatReservoir(reservoir, filledCount),
      }),
      instruction: i18nText(I18N.fill.instruction, { slot: i, item: stream[i] }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 2,
      description: i18nText(I18N.fill.line, {
        index: i,
        item: stream[i],
        reservoir: formatReservoir(reservoir, filledCount),
      }),
      state: snapshot({
        phase: I18N.phases.fill,
        decision: I18N.decisions.filling,
        tone: 'compute',
        currentLineId: fillId,
        resultLabel: null,
      }),
    });
  }

  // ---------- Sample phase ----------
  for (let i = k; i < stream.length; i++) {
    const item = stream[i];
    const headerId = `sample-${i}-header`;
    lineBuilders.push({
      id: headerId,
      kind: 'note',
      indent: 0,
      marker: i === k ? SECTION_MARKERS.sample : null,
      caption: i === k ? I18N.captions.samplePhase : null,
      captionPinned: i === k,
      content: i18nText(I18N.sample.header, {
        index: i,
        item,
        probability: formatProbability(k, i + 1),
      }),
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.sample.header, {
        index: i,
        item,
        probability: formatProbability(k, i + 1),
      }),
      state: snapshot({
        phase: I18N.phases.sample,
        decision: I18N.decisions.rolling,
        tone: 'compute',
        currentLineId: headerId,
        resultLabel: null,
      }),
    });

    const roll = random();
    const j = Math.floor(roll * (i + 1));
    const rollId = `sample-${i}-roll`;
    lineBuilders.push({
      id: rollId,
      kind: 'substitute',
      indent: 1,
      marker: null,
      caption: null,
      content: i18nText(I18N.sample.roll, {
        roll: roll.toFixed(3),
        iPlusOne: i + 1,
        j,
      }),
      instruction: i18nText(I18N.sample.rollInstruction, { iPlusOne: i + 1 }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.sample.roll, {
        roll: roll.toFixed(3),
        iPlusOne: i + 1,
        j,
      }),
      state: snapshot({
        phase: I18N.phases.sample,
        decision: I18N.decisions.rolling,
        tone: 'compute',
        currentLineId: rollId,
        resultLabel: null,
      }),
    });

    const decisionId = `sample-${i}-decision`;
    if (j < k) {
      reservoir[j] = item;
      lineBuilders.push({
        id: decisionId,
        kind: 'decision',
        indent: 1,
        marker: SECTION_MARKERS.decision,
        caption: null,
        content: i18nText(I18N.sample.accept, {
          item,
          slot: j,
          reservoir: formatReservoir(reservoir, filledCount),
        }),
        instruction: null,
        annotation: i18nText(I18N.sample.newState, {
          reservoir: formatReservoir(reservoir, filledCount),
        }),
      });
      stepIndex += 1;
      yield createScratchpadLabStep({
        activeCodeLine: 5,
        description: i18nText(I18N.sample.accept, {
          item,
          slot: j,
          reservoir: formatReservoir(reservoir, filledCount),
        }),
        state: snapshot({
          phase: I18N.phases.sample,
          decision: I18N.decisions.accepting,
          tone: 'decide',
          currentLineId: decisionId,
          resultLabel: null,
        }),
      });
    } else {
      lineBuilders.push({
        id: decisionId,
        kind: 'decision',
        indent: 1,
        marker: SECTION_MARKERS.decision,
        caption: null,
        content: i18nText(I18N.sample.reject, { j, k, item }),
        instruction: null,
        annotation: null,
      });
      stepIndex += 1;
      yield createScratchpadLabStep({
        activeCodeLine: 5,
        description: i18nText(I18N.sample.reject, { j, k, item }),
        state: snapshot({
          phase: I18N.phases.sample,
          decision: I18N.decisions.rejecting,
          tone: 'decide',
          currentLineId: decisionId,
          resultLabel: null,
        }),
      });
    }
  }

  // ---------- Result ----------
  const reservoirDisplay = formatReservoir(reservoir, filledCount);
  const signoffText =
    filledCount === 0
      ? I18N.result.emptySignoff
      : i18nText(I18N.result.signoff, { reservoir: reservoirDisplay });

  lineBuilders.push({
    id: 'result',
    kind: 'result',
    indent: 0,
    marker: SECTION_MARKERS.result,
    caption: I18N.captions.result,
    captionPinned: true,
    content: i18nText(I18N.result.sample, { reservoir: reservoirDisplay }),
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 6,
    description: i18nText(I18N.result.sample, { reservoir: reservoirDisplay }),
    state: snapshot({
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      currentLineId: 'result',
      resultLabel: signoffText,
    }),
  });
}
