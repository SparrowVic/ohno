import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { GaussianEliminationScenario } from '../../utils/scenarios/number-lab/gaussian-elimination-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

/**
 * Gaussian–Jordan elimination — chalkboard narration.
 *
 * Starts from the augmented matrix `[A | b]` and walks it to reduced
 * row-echelon form by three families of row operations: swap rows,
 * scale a row by a non-zero constant, add a multiple of one row to
 * another. Each matrix snapshot is emitted as a single KaTeX
 * `\left[\begin{array}{...|c}...\end{array}\right]` block so the
 * student sees the structural change as one atomic picture.
 *
 * We use Gauss-Jordan (not plain Gauss) so the final matrix already
 * shows the identity on the left — the solution reads straight off
 * the right-hand side. Matches what's usually taught first.
 */

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.modeLabel'),
  goal: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.goal'),
  rule: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.rule'),
  invariant: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.invariant'),
  setup: {
    initial: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.setup.initial'),
    initialAnnotation: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.setup.initialAnnotation',
    ),
  },
  op: {
    pivotHeader: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.op.pivotHeader',
    ),
    swap: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.op.swap'),
    swapInstruction: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.op.swapInstruction',
    ),
    scale: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.op.scale'),
    scaleInstruction: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.op.scaleInstruction',
    ),
    eliminate: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.op.eliminate'),
    eliminateInstruction: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.op.eliminateInstruction',
    ),
    skipAlready: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.op.skipAlready',
    ),
  },
  failure: {
    singular: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.failure.singular'),
  },
  result: {
    solution: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.result.solution',
    ),
    signoff: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.result.signoff',
    ),
    signoffSingular: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.result.signoffSingular',
    ),
  },
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.phases.setup'),
    forward: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.phases.forward'),
    complete: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.phases.complete'),
  },
  decisions: {
    starting: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.decisions.starting',
    ),
    swapping: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.decisions.swapping',
    ),
    scaling: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.decisions.scaling',
    ),
    eliminating: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.decisions.eliminating',
    ),
    done: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.decisions.done'),
    singular: t(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.decisions.singular',
    ),
  },
  captions: {
    setup: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.captions.setup'),
    pivot: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.captions.pivot'),
    result: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.captions.result'),
  },
} as const;

const SECTION_MARKERS = {
  setup: '①',
  pivot: '②',
  decision: '⟹',
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

/** Tolerance for treating a floating-point value as zero after a
 *  sequence of row operations. Rational inputs keep exact integers
 *  so this only matters when a task later feeds fractional coefficients. */
const EPSILON = 1e-9;

function isZero(value: number): boolean {
  return Math.abs(value) < EPSILON;
}

/** Render the current matrix as a KaTeX augmented-matrix block. */
function matrixLatex(matrix: readonly (readonly number[])[], variableCount: number): string {
  const coeffCols = 'c'.repeat(variableCount);
  const header = `${coeffCols}|c`;
  const rows = matrix
    .map((row) => row.map((cell) => formatCell(cell)).join(' & '))
    .join(' \\\\ ');
  return `[[math]]\\left[\\begin{array}{${header}} ${rows} \\end{array}\\right][[/math]]`;
}

function formatCell(value: number): string {
  if (Object.is(value, -0)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(3).replace(/\.?0+$/, '');
}

export function* gaussianEliminationGenerator(
  scenario: GaussianEliminationScenario,
): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const variableCount = scenario.variableCount;
  // Clone the matrix so our in-place row ops don't mutate the scenario.
  const matrix: number[][] = scenario.matrix.map((row) => [...row]);
  const rowCount = matrix.length;

  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      captionPinned: true,
      content: i18nText(I18N.goal, { count: variableCount }),
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
      mode: 'gaussian-elimination',
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

  // ---------- Step 0: initial matrix ----------
  lineBuilders.push({
    id: 'initial',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.setup,
    caption: I18N.captions.setup,
    captionPinned: true,
    content: matrixLatex(matrix, variableCount),
    instruction: null,
    annotation: I18N.setup.initialAnnotation,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 1,
    description: I18N.setup.initial,
    state: snapshot({
      phase: I18N.phases.setup,
      decision: I18N.decisions.starting,
      tone: 'setup',
      currentLineId: 'initial',
      resultLabel: null,
    }),
  });

  // ---------- Gauss-Jordan sweep ----------
  const pivotColumns = Math.min(variableCount, rowCount);
  let pivotRow = 0;
  let singular = false;

  for (let col = 0; col < variableCount && pivotRow < rowCount; col++) {
    // Find a row at or below `pivotRow` with a non-zero entry in `col`.
    let swapRow = -1;
    for (let r = pivotRow; r < rowCount; r++) {
      if (!isZero(matrix[r][col])) {
        swapRow = r;
        break;
      }
    }
    if (swapRow === -1) {
      // No pivot available in this column — system is rank-deficient.
      singular = true;
      break;
    }

    const headerId = `pivot-${col}-header`;
    lineBuilders.push({
      id: headerId,
      kind: 'note',
      indent: 0,
      marker: SECTION_MARKERS.pivot,
      caption: I18N.captions.pivot,
      captionPinned: true,
      content: i18nText(I18N.op.pivotHeader, { col: col + 1, row: pivotRow + 1 }),
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 2,
      description: i18nText(I18N.op.pivotHeader, { col: col + 1, row: pivotRow + 1 }),
      state: snapshot({
        phase: I18N.phases.forward,
        decision: I18N.decisions.starting,
        tone: 'compute',
        currentLineId: headerId,
        resultLabel: null,
      }),
    });

    // Swap if the non-zero pivot lives in a lower row.
    if (swapRow !== pivotRow) {
      [matrix[pivotRow], matrix[swapRow]] = [matrix[swapRow], matrix[pivotRow]];
      const swapId = `pivot-${col}-swap`;
      lineBuilders.push({
        id: swapId,
        kind: 'substitute',
        indent: 1,
        marker: null,
        caption: null,
        content: matrixLatex(matrix, variableCount),
        instruction: i18nText(I18N.op.swapInstruction, {
          r1: pivotRow + 1,
          r2: swapRow + 1,
        }),
        annotation: i18nText(I18N.op.swap, { r1: pivotRow + 1, r2: swapRow + 1 }),
      });
      stepIndex += 1;
      yield createScratchpadLabStep({
        activeCodeLine: 3,
        description: i18nText(I18N.op.swap, { r1: pivotRow + 1, r2: swapRow + 1 }),
        state: snapshot({
          phase: I18N.phases.forward,
          decision: I18N.decisions.swapping,
          tone: 'substitute',
          currentLineId: swapId,
          resultLabel: null,
        }),
      });
    }

    // Normalize the pivot row so the pivot becomes 1.
    const pivotValue = matrix[pivotRow][col];
    if (!isZero(pivotValue - 1)) {
      for (let j = 0; j < matrix[pivotRow].length; j++) {
        matrix[pivotRow][j] = matrix[pivotRow][j] / pivotValue;
      }
      const scaleId = `pivot-${col}-scale`;
      lineBuilders.push({
        id: scaleId,
        kind: 'substitute',
        indent: 1,
        marker: null,
        caption: null,
        content: matrixLatex(matrix, variableCount),
        instruction: i18nText(I18N.op.scaleInstruction, {
          row: pivotRow + 1,
          factor: formatCell(pivotValue),
        }),
        annotation: i18nText(I18N.op.scale, {
          row: pivotRow + 1,
          factor: formatCell(pivotValue),
        }),
      });
      stepIndex += 1;
      yield createScratchpadLabStep({
        activeCodeLine: 4,
        description: i18nText(I18N.op.scale, {
          row: pivotRow + 1,
          factor: formatCell(pivotValue),
        }),
        state: snapshot({
          phase: I18N.phases.forward,
          decision: I18N.decisions.scaling,
          tone: 'substitute',
          currentLineId: scaleId,
          resultLabel: null,
        }),
      });
    }

    // Eliminate every other row's entry in this column.
    for (let r = 0; r < rowCount; r++) {
      if (r === pivotRow) continue;
      const factor = matrix[r][col];
      if (isZero(factor)) continue;
      for (let j = 0; j < matrix[r].length; j++) {
        matrix[r][j] = matrix[r][j] - factor * matrix[pivotRow][j];
      }
      const elimId = `pivot-${col}-elim-${r}`;
      lineBuilders.push({
        id: elimId,
        kind: 'substitute',
        indent: 1,
        marker: null,
        caption: null,
        content: matrixLatex(matrix, variableCount),
        instruction: i18nText(I18N.op.eliminateInstruction, {
          target: r + 1,
          pivot: pivotRow + 1,
          factor: formatCell(factor),
        }),
        annotation: i18nText(I18N.op.eliminate, {
          target: r + 1,
          pivot: pivotRow + 1,
          factor: formatCell(factor),
        }),
      });
      stepIndex += 1;
      yield createScratchpadLabStep({
        activeCodeLine: 5,
        description: i18nText(I18N.op.eliminate, {
          target: r + 1,
          pivot: pivotRow + 1,
          factor: formatCell(factor),
        }),
        state: snapshot({
          phase: I18N.phases.forward,
          decision: I18N.decisions.eliminating,
          tone: 'substitute',
          currentLineId: elimId,
          resultLabel: null,
        }),
      });
    }

    pivotRow += 1;
  }

  // ---------- Result ----------
  if (singular || pivotRow < pivotColumns) {
    lineBuilders.push({
      id: 'result-singular',
      kind: 'result',
      indent: 0,
      marker: SECTION_MARKERS.failure,
      caption: I18N.captions.result,
      captionPinned: true,
      content: I18N.failure.singular,
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 6,
      description: I18N.failure.singular,
      state: snapshot({
        phase: I18N.phases.complete,
        decision: I18N.decisions.singular,
        tone: 'complete',
        currentLineId: 'result-singular',
        resultLabel: I18N.result.signoffSingular,
      }),
    });
    return;
  }

  const solution = matrix.map((row) => row[variableCount]);
  const solutionLatex = solution
    .map((value, index) => {
      const name = VARIABLE_NAMES[index] ?? `x_{${index + 1}}`;
      return `${name} = ${formatCell(value)}`;
    })
    .join(', \\; ');

  lineBuilders.push({
    id: 'result',
    kind: 'result',
    indent: 0,
    marker: SECTION_MARKERS.result,
    caption: I18N.captions.result,
    captionPinned: true,
    content: i18nText(I18N.result.solution, { solution: solutionLatex }),
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 7,
    description: i18nText(I18N.result.solution, { solution: solutionLatex }),
    state: snapshot({
      phase: I18N.phases.complete,
      decision: I18N.decisions.done,
      tone: 'complete',
      currentLineId: 'result',
      resultLabel: i18nText(I18N.result.signoff, { solution: solutionLatex }),
    }),
  });
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;
