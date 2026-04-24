import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { PollardsRhoScenario } from '../../utils/scenarios/number-lab/pollards-rho-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

/**
 * Pollard's rho factorization — chalkboard narration.
 *
 * Given composite `n`, iterate `f(x) = x² + c mod n` with tortoise-
 * hare pointers: `x ← f(x)`, `y ← f(f(y))`. Compute `gcd(|x - y|, n)`
 * at each step. When the gcd lands in `(1, n)`, we've found a
 * non-trivial factor; when it equals `n`, the tortoise has caught the
 * hare without a gap — restart with a different `c` in practice. For
 * the in-browser run we just report the failure gracefully.
 */

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.pollardsRho.modeLabel'),
  goal: t('features.algorithms.runtime.scratchpadLab.pollardsRho.goal'),
  rule: t('features.algorithms.runtime.scratchpadLab.pollardsRho.rule'),
  invariant: t('features.algorithms.runtime.scratchpadLab.pollardsRho.invariant'),
  setup: {
    formula: t('features.algorithms.runtime.scratchpadLab.pollardsRho.setup.formula'),
    formulaInstruction: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.setup.formulaInstruction',
    ),
    seeds: t('features.algorithms.runtime.scratchpadLab.pollardsRho.setup.seeds'),
    seedsAnnotation: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.setup.seedsAnnotation',
    ),
  },
  step: {
    line: t('features.algorithms.runtime.scratchpadLab.pollardsRho.step.line'),
    instruction: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.step.instruction',
    ),
    annotation: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.step.annotation',
    ),
  },
  result: {
    success: t('features.algorithms.runtime.scratchpadLab.pollardsRho.result.success'),
    failure: t('features.algorithms.runtime.scratchpadLab.pollardsRho.result.failure'),
    exhausted: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.result.exhausted',
    ),
    signoffSuccess: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.result.signoffSuccess',
    ),
    signoffFailure: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.result.signoffFailure',
    ),
  },
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.pollardsRho.phases.setup'),
    iterate: t('features.algorithms.runtime.scratchpadLab.pollardsRho.phases.iterate'),
    complete: t('features.algorithms.runtime.scratchpadLab.pollardsRho.phases.complete'),
  },
  decisions: {
    seeding: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.decisions.seeding',
    ),
    iterating: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.decisions.iterating',
    ),
    factorFound: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.decisions.factorFound',
    ),
    cycleTrap: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.decisions.cycleTrap',
    ),
    exhausted: t(
      'features.algorithms.runtime.scratchpadLab.pollardsRho.decisions.exhausted',
    ),
  },
  captions: {
    setup: t('features.algorithms.runtime.scratchpadLab.pollardsRho.captions.setup'),
    step: t('features.algorithms.runtime.scratchpadLab.pollardsRho.captions.step'),
    result: t('features.algorithms.runtime.scratchpadLab.pollardsRho.captions.result'),
  },
} as const;

const SECTION_MARKERS = {
  setup: '①',
  step: '②',
  result: '✓',
  failure: '✗',
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

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

interface IterationRow {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly diff: number;
  readonly g: number;
}

type Outcome =
  | { readonly kind: 'factor'; readonly rows: readonly IterationRow[]; readonly factor: number }
  | { readonly kind: 'cycle'; readonly rows: readonly IterationRow[] }
  | { readonly kind: 'exhausted'; readonly rows: readonly IterationRow[] };

/** Drive the tortoise-hare iteration up to `maxIterations`. Returns a
 *  record describing how the run ended plus every intermediate row so
 *  the generator can replay them as scratchpad lines. */
function runTortoiseHare(
  n: number,
  c: number,
  x0: number,
  maxIterations: number,
): Outcome {
  const f = (x: number) => (x * x + c) % n;
  let x = x0;
  let y = x0;
  const rows: IterationRow[] = [];
  for (let i = 1; i <= maxIterations; i++) {
    x = f(x);
    y = f(f(y));
    const diff = Math.abs(x - y);
    const g = gcd(diff, n);
    rows.push({ index: i, x, y, diff, g });
    if (g > 1 && g < n) {
      return { kind: 'factor', rows, factor: g };
    }
    if (g === n) {
      return { kind: 'cycle', rows };
    }
  }
  return { kind: 'exhausted', rows };
}

export function* pollardsRhoGenerator(
  scenario: PollardsRhoScenario,
): Generator<SortStep> {
  const { n, c, x0, maxIterations } = scenario;
  const presetLabel = scenario.presetLabel;
  const outcome = runTortoiseHare(n, c, x0, maxIterations);

  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      captionPinned: true,
      content: i18nText(I18N.goal, { n }),
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
    readonly transientMargin: ScratchpadMargin | null;
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
    const margins: ScratchpadMargin[] = [globalInvariant];
    if (opts.transientMargin) margins.push(opts.transientMargin);
    return {
      mode: 'pollards-rho',
      modeLabel: I18N.modeLabel,
      phaseLabel: opts.phase,
      decisionLabel: opts.decision,
      presetLabel,
      taskPrompt: scenario.taskPrompt ?? null,
      tone: opts.tone,
      lines,
      margins,
      resultLabel: opts.resultLabel,
      iteration: stepIndex,
    };
  }

  // ---------- Setup: formula + seeds ----------
  lineBuilders.push({
    id: 'setup-formula',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.setup,
    caption: I18N.captions.setup,
    captionPinned: true,
    content: i18nText(I18N.setup.formula, { c, n }),
    instruction: i18nText(I18N.setup.formulaInstruction, { c, n }),
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.setup.formulaInstruction, { c, n }),
    state: snapshot({
      phase: I18N.phases.setup,
      decision: I18N.decisions.seeding,
      tone: 'setup',
      currentLineId: 'setup-formula',
      transientMargin: null,
      resultLabel: null,
    }),
  });

  lineBuilders.push({
    id: 'setup-seeds',
    kind: 'equation',
    indent: 0,
    marker: null,
    caption: null,
    content: i18nText(I18N.setup.seeds, { x0 }),
    instruction: null,
    annotation: i18nText(I18N.setup.seedsAnnotation, { x0 }),
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 2,
    description: i18nText(I18N.setup.seeds, { x0 }),
    state: snapshot({
      phase: I18N.phases.setup,
      decision: I18N.decisions.seeding,
      tone: 'setup',
      currentLineId: 'setup-seeds',
      transientMargin: null,
      resultLabel: null,
    }),
  });

  // ---------- Iteration table ----------
  for (let i = 0; i < outcome.rows.length; i++) {
    const row = outcome.rows[i];
    const rowId = `iter-${row.index}`;
    const isLastRow = i === outcome.rows.length - 1;
    lineBuilders.push({
      id: rowId,
      kind: 'substitute',
      indent: 1,
      marker: SECTION_MARKERS.step,
      caption: I18N.captions.step,
      captionPinned: isLastRow,
      content: i18nText(I18N.step.line, {
        i: row.index,
        x: row.x,
        y: row.y,
        diff: row.diff,
        g: row.g,
      }),
      instruction: i18nText(I18N.step.instruction, { i: row.index }),
      annotation: i18nText(I18N.step.annotation, { diff: row.diff, n, g: row.g }),
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.step.line, {
        i: row.index,
        x: row.x,
        y: row.y,
        diff: row.diff,
        g: row.g,
      }),
      state: snapshot({
        phase: I18N.phases.iterate,
        decision: I18N.decisions.iterating,
        tone: 'compute',
        currentLineId: rowId,
        transientMargin: null,
        resultLabel: null,
      }),
    });
  }

  // ---------- Result ----------
  if (outcome.kind === 'factor') {
    lineBuilders.push({
      id: 'result',
      kind: 'result',
      indent: 0,
      marker: SECTION_MARKERS.result,
      caption: I18N.captions.result,
      captionPinned: true,
      content: i18nText(I18N.result.success, {
        n,
        factor: outcome.factor,
        quotient: Math.floor(n / outcome.factor),
      }),
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.result.success, {
        n,
        factor: outcome.factor,
        quotient: Math.floor(n / outcome.factor),
      }),
      state: snapshot({
        phase: I18N.phases.complete,
        decision: I18N.decisions.factorFound,
        tone: 'complete',
        currentLineId: 'result',
        transientMargin: null,
        resultLabel: i18nText(I18N.result.signoffSuccess, {
          n,
          factor: outcome.factor,
          quotient: Math.floor(n / outcome.factor),
        }),
      }),
    });
    return;
  }

  const failureContent =
    outcome.kind === 'cycle'
      ? i18nText(I18N.result.failure, { n, c })
      : i18nText(I18N.result.exhausted, { n, c, max: maxIterations });
  const decision =
    outcome.kind === 'cycle' ? I18N.decisions.cycleTrap : I18N.decisions.exhausted;

  lineBuilders.push({
    id: 'result',
    kind: 'result',
    indent: 0,
    marker: SECTION_MARKERS.failure,
    caption: I18N.captions.result,
    captionPinned: true,
    content: failureContent,
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 5,
    description: failureContent,
    state: snapshot({
      phase: I18N.phases.complete,
      decision,
      tone: 'complete',
      currentLineId: 'result',
      transientMargin: null,
      resultLabel: i18nText(I18N.result.signoffFailure, { n, c }),
    }),
  });
}
