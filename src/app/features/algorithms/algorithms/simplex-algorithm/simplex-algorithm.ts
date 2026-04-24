import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
  ScratchpadMargin,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { SimplexAlgorithmScenario } from '../../utils/scenarios/number-lab/simplex-algorithm-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

/**
 * Simplex algorithm — chalkboard narration.
 *
 * Input: standard-form LP
 *     max  cᵀx
 *     s.t. Ax ≤ b,   x ≥ 0
 *
 * We add slack variables to turn the inequalities into equalities,
 * form the initial tableau with the objective row written in reduced-
 * cost form (`-c` for original vars, zeros for slacks), and pivot
 * until no negative reduced cost remains.
 *
 * Each pivot emits a KaTeX tableau snapshot so the student watches
 * columns flip between basic and non-basic status. Pedagogical beats
 * shown explicitly: entering-variable pick (most negative reduced
 * cost), leaving-variable pick (min-ratio test), and the tableau
 * update after each pivot.
 *
 * Fallback branches: if min-ratio test finds no positive pivot entry
 * the problem is unbounded (emitted as a failure line); if an
 * iteration cap is hit we bail the same way. The basic-max-profit
 * task settles in two pivots, so neither branch fires on defaults.
 */

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.simplex.modeLabel'),
  goal: t('features.algorithms.runtime.scratchpadLab.simplex.goal'),
  rule: t('features.algorithms.runtime.scratchpadLab.simplex.rule'),
  invariant: t('features.algorithms.runtime.scratchpadLab.simplex.invariant'),
  setup: {
    initial: t('features.algorithms.runtime.scratchpadLab.simplex.setup.initial'),
    initialAnnotation: t(
      'features.algorithms.runtime.scratchpadLab.simplex.setup.initialAnnotation',
    ),
    basis: t('features.algorithms.runtime.scratchpadLab.simplex.setup.basis'),
  },
  op: {
    entering: t('features.algorithms.runtime.scratchpadLab.simplex.op.entering'),
    enteringInstruction: t(
      'features.algorithms.runtime.scratchpadLab.simplex.op.enteringInstruction',
    ),
    leaving: t('features.algorithms.runtime.scratchpadLab.simplex.op.leaving'),
    leavingInstruction: t(
      'features.algorithms.runtime.scratchpadLab.simplex.op.leavingInstruction',
    ),
    pivot: t('features.algorithms.runtime.scratchpadLab.simplex.op.pivot'),
    pivotInstruction: t(
      'features.algorithms.runtime.scratchpadLab.simplex.op.pivotInstruction',
    ),
    basisUpdated: t('features.algorithms.runtime.scratchpadLab.simplex.op.basisUpdated'),
  },
  failure: {
    unbounded: t('features.algorithms.runtime.scratchpadLab.simplex.failure.unbounded'),
    exhausted: t('features.algorithms.runtime.scratchpadLab.simplex.failure.exhausted'),
  },
  result: {
    optimal: t('features.algorithms.runtime.scratchpadLab.simplex.result.optimal'),
    signoff: t('features.algorithms.runtime.scratchpadLab.simplex.result.signoff'),
    signoffFailure: t(
      'features.algorithms.runtime.scratchpadLab.simplex.result.signoffFailure',
    ),
  },
  phases: {
    setup: t('features.algorithms.runtime.scratchpadLab.simplex.phases.setup'),
    iterate: t('features.algorithms.runtime.scratchpadLab.simplex.phases.iterate'),
    complete: t('features.algorithms.runtime.scratchpadLab.simplex.phases.complete'),
  },
  decisions: {
    starting: t('features.algorithms.runtime.scratchpadLab.simplex.decisions.starting'),
    picking: t('features.algorithms.runtime.scratchpadLab.simplex.decisions.picking'),
    pivoting: t('features.algorithms.runtime.scratchpadLab.simplex.decisions.pivoting'),
    optimal: t('features.algorithms.runtime.scratchpadLab.simplex.decisions.optimal'),
    unbounded: t('features.algorithms.runtime.scratchpadLab.simplex.decisions.unbounded'),
  },
  captions: {
    setup: t('features.algorithms.runtime.scratchpadLab.simplex.captions.setup'),
    iteration: t('features.algorithms.runtime.scratchpadLab.simplex.captions.iteration'),
    result: t('features.algorithms.runtime.scratchpadLab.simplex.captions.result'),
  },
} as const;

const SECTION_MARKERS = {
  setup: '①',
  iteration: '②',
  decision: '⟹',
  result: '✓',
  failure: '✗',
} as const;

/** Safety cap — beyond this we bail. Bland's rule would guarantee
 *  finite termination but the textbook LPs we visualise never
 *  approach this limit anyway. */
const MAX_ITERATIONS = 30;

const EPSILON = 1e-9;

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

function isZero(value: number): boolean {
  return Math.abs(value) < EPSILON;
}

function formatCell(value: number): string {
  if (isZero(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(3).replace(/\.?0+$/, '');
}

/** Render the tableau as a KaTeX augmented-matrix block — all
 *  variable columns (originals + slacks) to the left of the vertical
 *  bar, RHS to the right. Header row with column names stays as a
 *  separate annotation so students can tell which column is which. */
function tableauLatex(tableau: readonly (readonly number[])[], varColumns: number): string {
  const coeffCols = 'c'.repeat(varColumns);
  const header = `${coeffCols}|c`;
  const rows = tableau
    .map((row) => row.map((cell) => formatCell(cell)).join(' & '))
    .join(' \\\\ ');
  return `[[math]]\\left[\\begin{array}{${header}} ${rows} \\end{array}\\right][[/math]]`;
}

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;

/** Column-name label for var index `col` within the tableau.
 *  Original decision variables get `x, y, z, ...`; slack variables
 *  are `s_{1}, s_{2}, ...`. Column = number of original vars + m
 *  for the m slack columns. */
function columnName(col: number, originalVarCount: number): string {
  if (col < originalVarCount) return VARIABLE_NAMES[col] ?? `x_{${col + 1}}`;
  return `s_{${col - originalVarCount + 1}}`;
}

function formatBasis(basis: readonly number[], originalVarCount: number): string {
  return basis.map((col) => columnName(col, originalVarCount)).join(', ');
}

export function* simplexAlgorithmGenerator(
  scenario: SimplexAlgorithmScenario,
): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const n = scenario.objective.length;
  const m = scenario.constraintMatrix.length;
  const varColumns = n + m;
  const totalColumns = varColumns + 1;

  // Build the initial tableau. Row layout: constraint rows first
  // (with identity block for slacks), objective row last (`-c` for
  // originals, zeros elsewhere).
  const tableau: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row = new Array<number>(totalColumns).fill(0);
    for (let j = 0; j < n; j++) row[j] = scenario.constraintMatrix[i][j];
    row[n + i] = 1;
    row[totalColumns - 1] = scenario.rhs[i];
    tableau.push(row);
  }
  const objectiveRow = new Array<number>(totalColumns).fill(0);
  for (let j = 0; j < n; j++) objectiveRow[j] = -scenario.objective[j];
  tableau.push(objectiveRow);

  // basis[i] = column index of the basic variable in constraint row i
  // (slacks start as the basis). Objective row tracked separately.
  const basis: number[] = [];
  for (let i = 0; i < m; i++) basis.push(n + i);

  const lineBuilders: LineBuilder[] = [
    {
      id: 'goal',
      kind: 'goal',
      indent: 0,
      marker: null,
      caption: null,
      captionPinned: true,
      content: i18nText(I18N.goal, { count: n }),
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
      mode: 'simplex',
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

  // ---------- Step 0: initial tableau ----------
  lineBuilders.push({
    id: 'initial',
    kind: 'equation',
    indent: 0,
    marker: SECTION_MARKERS.setup,
    caption: I18N.captions.setup,
    captionPinned: true,
    content: tableauLatex(tableau, varColumns),
    instruction: I18N.setup.initial,
    annotation: i18nText(I18N.setup.basis, { basis: formatBasis(basis, n) }),
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

  // ---------- Pivot loop ----------
  let iter = 0;
  let outcome: 'optimal' | 'unbounded' | 'exhausted' = 'optimal';

  for (; iter < MAX_ITERATIONS; iter++) {
    // Find entering column — the most negative reduced cost in the
    // objective row across all variable columns.
    let enteringCol = -1;
    let mostNegative = -EPSILON;
    for (let j = 0; j < varColumns; j++) {
      if (tableau[m][j] < mostNegative) {
        mostNegative = tableau[m][j];
        enteringCol = j;
      }
    }
    if (enteringCol === -1) {
      // All reduced costs ≥ 0 — the current basis is optimal.
      outcome = 'optimal';
      break;
    }

    // Find leaving row via the min-ratio test.
    let leavingRow = -1;
    let bestRatio = Infinity;
    for (let i = 0; i < m; i++) {
      const a = tableau[i][enteringCol];
      if (a <= EPSILON) continue;
      const ratio = tableau[i][totalColumns - 1] / a;
      if (ratio < bestRatio - EPSILON) {
        bestRatio = ratio;
        leavingRow = i;
      }
    }
    if (leavingRow === -1) {
      outcome = 'unbounded';
      break;
    }

    const iterationNumber = iter + 1;
    const enteringName = columnName(enteringCol, n);
    const leavingName = columnName(basis[leavingRow], n);

    // Entering-variable note — why we picked this column.
    const enteringId = `iter-${iterationNumber}-entering`;
    lineBuilders.push({
      id: enteringId,
      kind: 'note',
      indent: 0,
      marker: SECTION_MARKERS.iteration,
      caption: I18N.captions.iteration,
      captionPinned: true,
      content: i18nText(I18N.op.entering, {
        iteration: iterationNumber,
        variable: enteringName,
        reducedCost: formatCell(tableau[m][enteringCol]),
      }),
      instruction: i18nText(I18N.op.enteringInstruction, { variable: enteringName }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 2,
      description: i18nText(I18N.op.entering, {
        iteration: iterationNumber,
        variable: enteringName,
        reducedCost: formatCell(tableau[m][enteringCol]),
      }),
      state: snapshot({
        phase: I18N.phases.iterate,
        decision: I18N.decisions.picking,
        tone: 'compute',
        currentLineId: enteringId,
        resultLabel: null,
      }),
    });

    // Leaving-variable note — min-ratio test result.
    const leavingId = `iter-${iterationNumber}-leaving`;
    lineBuilders.push({
      id: leavingId,
      kind: 'note',
      indent: 1,
      marker: null,
      caption: null,
      content: i18nText(I18N.op.leaving, {
        variable: leavingName,
        ratio: formatCell(bestRatio),
        row: leavingRow + 1,
      }),
      instruction: i18nText(I18N.op.leavingInstruction, { variable: leavingName }),
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 3,
      description: i18nText(I18N.op.leaving, {
        variable: leavingName,
        ratio: formatCell(bestRatio),
        row: leavingRow + 1,
      }),
      state: snapshot({
        phase: I18N.phases.iterate,
        decision: I18N.decisions.picking,
        tone: 'compute',
        currentLineId: leavingId,
        resultLabel: null,
      }),
    });

    // Pivot: normalize leaving row, then eliminate entering column
    // from every other row (including the objective row).
    const pivotValue = tableau[leavingRow][enteringCol];
    for (let j = 0; j < totalColumns; j++) {
      tableau[leavingRow][j] = tableau[leavingRow][j] / pivotValue;
    }
    for (let r = 0; r <= m; r++) {
      if (r === leavingRow) continue;
      const factor = tableau[r][enteringCol];
      if (isZero(factor)) continue;
      for (let j = 0; j < totalColumns; j++) {
        tableau[r][j] = tableau[r][j] - factor * tableau[leavingRow][j];
      }
    }
    basis[leavingRow] = enteringCol;

    const pivotId = `iter-${iterationNumber}-pivot`;
    lineBuilders.push({
      id: pivotId,
      kind: 'substitute',
      indent: 1,
      marker: null,
      caption: null,
      content: tableauLatex(tableau, varColumns),
      instruction: i18nText(I18N.op.pivotInstruction, {
        row: leavingRow + 1,
        variable: enteringName,
      }),
      annotation: i18nText(I18N.op.basisUpdated, {
        basis: formatBasis(basis, n),
      }),
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.op.pivot, {
        iteration: iterationNumber,
        entering: enteringName,
        leaving: leavingName,
      }),
      state: snapshot({
        phase: I18N.phases.iterate,
        decision: I18N.decisions.pivoting,
        tone: 'substitute',
        currentLineId: pivotId,
        resultLabel: null,
      }),
    });
  }

  if (iter >= MAX_ITERATIONS) {
    outcome = 'exhausted';
  }

  // ---------- Result ----------
  if (outcome === 'unbounded' || outcome === 'exhausted') {
    const content =
      outcome === 'unbounded'
        ? I18N.failure.unbounded
        : i18nText(I18N.failure.exhausted, { max: MAX_ITERATIONS });
    lineBuilders.push({
      id: 'result',
      kind: 'result',
      indent: 0,
      marker: SECTION_MARKERS.failure,
      caption: I18N.captions.result,
      captionPinned: true,
      content,
      instruction: null,
      annotation: null,
    });
    stepIndex += 1;
    yield createScratchpadLabStep({
      activeCodeLine: 5,
      description: content,
      state: snapshot({
        phase: I18N.phases.complete,
        decision: I18N.decisions.unbounded,
        tone: 'complete',
        currentLineId: 'result',
        resultLabel: I18N.result.signoffFailure,
      }),
    });
    return;
  }

  // Read the optimum: for each original variable, if it's basic in
  // some row, its value is that row's RHS. Otherwise it's zero.
  const solution = new Array<number>(n).fill(0);
  for (let i = 0; i < m; i++) {
    if (basis[i] < n) solution[basis[i]] = tableau[i][totalColumns - 1];
  }
  const objectiveValue = tableau[m][totalColumns - 1];
  const solutionLatex = solution
    .map((value, j) => {
      const name = VARIABLE_NAMES[j] ?? `x_{${j + 1}}`;
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
    content: i18nText(I18N.result.optimal, {
      solution: solutionLatex,
      objective: formatCell(objectiveValue),
    }),
    instruction: null,
    annotation: null,
  });
  stepIndex += 1;
  yield createScratchpadLabStep({
    activeCodeLine: 6,
    description: i18nText(I18N.result.optimal, {
      solution: solutionLatex,
      objective: formatCell(objectiveValue),
    }),
    state: snapshot({
      phase: I18N.phases.complete,
      decision: I18N.decisions.optimal,
      tone: 'complete',
      currentLineId: 'result',
      resultLabel: i18nText(I18N.result.signoff, {
        solution: solutionLatex,
        objective: formatCell(objectiveValue),
      }),
    }),
  });
}
