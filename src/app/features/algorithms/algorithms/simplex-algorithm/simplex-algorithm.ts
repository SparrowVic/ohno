import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  MatrixGridCell,
  MatrixGridCellState,
  MatrixGridTone,
  MatrixGridTraceState,
} from '../../models/matrix-grid';
import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { SimplexAlgorithmScenario } from '../../utils/scenarios/number-lab/simplex-algorithm-scenarios';
import { NOTEBOOK_TEXT } from '../notebook-text';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.simplex.modeLabel'),
  matrixGridModeLabel: t('features.algorithms.runtime.matrixGrid.simplex.modeLabel'),
  sections: {
    noOptimum: t('features.algorithms.runtime.scratchpadLab.simplex.sections.noOptimum'),
    noLeavingRow: t('features.algorithms.runtime.scratchpadLab.simplex.sections.noLeavingRow'),
    slack: t('features.algorithms.runtime.scratchpadLab.simplex.sections.slack'),
    alternative: t('features.algorithms.runtime.scratchpadLab.simplex.sections.alternative'),
  },
  results: {
    unbounded: t('features.algorithms.runtime.scratchpadLab.simplex.results.unbounded'),
    exhausted: t('features.algorithms.runtime.scratchpadLab.simplex.results.exhausted'),
  },
  lines: {
    initialBasis: t('features.algorithms.runtime.scratchpadLab.simplex.lines.initialBasis'),
    columns: t('features.algorithms.runtime.scratchpadLab.simplex.lines.columns'),
    reducedCosts: t('features.algorithms.runtime.scratchpadLab.simplex.lines.reducedCosts'),
    entering: t('features.algorithms.runtime.scratchpadLab.simplex.lines.entering'),
    ratioSkip: t('features.algorithms.runtime.scratchpadLab.simplex.lines.ratioSkip'),
    column: t('features.algorithms.runtime.scratchpadLab.simplex.lines.column'),
    leaving: t('features.algorithms.runtime.scratchpadLab.simplex.lines.leaving'),
    newBasis: t('features.algorithms.runtime.scratchpadLab.simplex.lines.newBasis'),
    unbounded: t('features.algorithms.runtime.scratchpadLab.simplex.lines.unbounded'),
    exhausted: t('features.algorithms.runtime.scratchpadLab.simplex.lines.exhausted'),
    zeroReducedCost: t('features.algorithms.runtime.scratchpadLab.simplex.lines.zeroReducedCost'),
  },
  notes: {
    unbounded: t('features.algorithms.runtime.scratchpadLab.simplex.notes.unbounded'),
    tie: t('features.algorithms.runtime.scratchpadLab.simplex.notes.tie'),
    degenerate: t('features.algorithms.runtime.scratchpadLab.simplex.notes.degenerate'),
    optimal: t('features.algorithms.runtime.scratchpadLab.simplex.notes.optimal'),
    slackPositive: t('features.algorithms.runtime.scratchpadLab.simplex.notes.slackPositive'),
    alternative: t('features.algorithms.runtime.scratchpadLab.simplex.notes.alternative'),
    alternativeNone: t('features.algorithms.runtime.scratchpadLab.simplex.notes.alternativeNone'),
  },
  phases: {
    pivot: t('features.algorithms.runtime.scratchpadLab.simplex.phases.pivot'),
    slack: t('features.algorithms.runtime.scratchpadLab.simplex.phases.slack'),
    tableau: t('features.algorithms.runtime.scratchpadLab.simplex.phases.tableau'),
    noOptimum: t('features.algorithms.runtime.scratchpadLab.simplex.phases.noOptimum'),
    pivotLimit: t('features.algorithms.runtime.scratchpadLab.simplex.phases.pivotLimit'),
    optimum: t('features.algorithms.runtime.scratchpadLab.simplex.phases.optimum'),
  },
} as const;

const EPSILON = 1e-9;
const CALCULATION_INDENT = 1;
const RESULT_MARKER = '✓';
const NO_RESULT_MARKER = '×';
const MAX_ITERATIONS = 30;

const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;

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

interface RatioCandidate {
  readonly row: number;
  readonly basisColumn: number;
  readonly coefficient: number;
  readonly rhs: number;
  readonly ratio: number | null;
}

export function* simplexAlgorithmGenerator(
  scenario: SimplexAlgorithmScenario,
): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const n = scenario.objective.length;
  const m = scenario.constraintMatrix.length;
  const varColumns = n + m;
  const totalColumns = varColumns + 1;
  const tableau = buildInitialTableau(scenario);
  const basis = Array.from({ length: m }, (_, i) => n + i);
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
      mode: 'simplex',
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

  /** Per-iteration pivot tracking — populated by the loop before
   *  emitting `pivot-N-leaving` / `pivot-N-tableau` so the matrix-grid
   *  view can colour the pivot row/col/cell correctly. */
  const pivotsPerIteration = new Map<
    number,
    { readonly row: number | null; readonly col: number }
  >();
  let currentResultText: TranslatableText | null = null;

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
    captureResultFromBuilder(builder);
    return {
      ...createScratchpadLabStep({
        activeCodeLine: opts.activeCodeLine,
        description: builder.content,
        state: snapshot({ ...opts, currentLineId: builder.id }),
      }),
      matrixGrid: buildMatrixGridState(builder),
    };
  }

  function captureResultFromBuilder(builder: LineBuilder): void {
    if (builder.id === 'no-result-unbounded') {
      currentResultText = i18nText(I18N.results.unbounded);
      return;
    }
    if (builder.id === 'no-result-exhausted') {
      currentResultText = i18nText(I18N.results.exhausted);
      return;
    }
    if (!builder.id.startsWith('result-')) return;
    const text = typeof builder.content === 'string' ? builder.content : '';
    const stripped = text.replace(/\[\[\/?math\]\]/g, '').trim();
    if (!stripped) return;
    currentResultText = typeof currentResultText === 'string' ? `${currentResultText};  ${stripped}` : stripped;
  }

  function buildMatrixGridState(builder: LineBuilder): MatrixGridTraceState {
    const op = parseSimplexOperation(builder, pivotsPerIteration);
    const rows = m + 1;
    const cols = totalColumns;
    const cells: MatrixGridCell[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          id: `r${row}c${col}-step${stepIndex}`,
          row,
          col,
          value: formatCell(tableau[row][col]),
          state: simplexCellState(row, col, rows, varColumns, op),
        });
      }
    }
    return {
      mode: 'simplex',
      modeLabel: I18N.matrixGridModeLabel,
      phaseLabel: simplexPhaseLabel(builder),
      decisionLabel: null,
      tone: simplexMatrixTone(op),
      rows,
      cols,
      dividerCol: varColumns,
      cells,
      operationLabel: op.label,
      resultLabel: currentResultText,
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

  function noResultSection(): LineBuilder {
    return paperLine({
      id: 'section-no-result',
      kind: 'result',
      marker: NO_RESULT_MARKER,
      content: i18nText(I18N.sections.noOptimum),
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

  yield* emit(section('section-model', i18nText(NOTEBOOK_TEXT.sections.model)));
  yield* emit(math('model-objective', `max\\ z = ${formatLinearCombination(scenario.objective)}`));
  for (let i = 0; i < m; i++) {
    yield* emit(
      math(
        `model-constraint-${i}`,
        `${formatLinearCombination(scenario.constraintMatrix[i])} \\le ${formatCell(scenario.rhs[i])}`,
      ),
    );
  }
  yield* emit(math('model-nonnegative', `${decisionVariableNames(n).join(', ')} \\ge 0`));

  yield* emit(section('section-standard-form', i18nText(NOTEBOOK_TEXT.sections.standardForm)));
  for (let i = 0; i < m; i++) {
    yield* emit(
      math(
        `standard-${i}`,
        `${formatLinearCombination(scenario.constraintMatrix[i])} + s_${i + 1} = ${formatCell(scenario.rhs[i])}`,
      ),
    );
  }
  yield* emit(
    math(
      'standard-objective-row',
      `z ${formatSignedLinearCombination(scenario.objective, -1)} = 0`,
    ),
  );
  yield* emit(
    mathText(
      'standard-basis',
      i18nText(I18N.lines.initialBasis, { basis: `[${basis.map((col) => columnName(col, n)).join(', ')}]` }),
    ),
  );

  yield* emit(section('section-initial-tableau', i18nText(NOTEBOOK_TEXT.sections.initialTableau)));
  yield* emit(mathText('initial-columns', i18nText(I18N.lines.columns, { columns: columnNames(varColumns, n).join(', ') })));
  yield* emit(math('initial-tableau', tableauLatex(tableau, varColumns)));

  let outcome: 'optimal' | 'unbounded' | 'exhausted' = 'optimal';
  let iteration = 0;
  for (; iteration < MAX_ITERATIONS; iteration++) {
    const enteringCol = chooseEnteringColumn(tableau, m, varColumns);
    if (enteringCol === -1) {
      outcome = 'optimal';
      break;
    }

    const ratios = ratioCandidates(tableau, basis, enteringCol, totalColumns, m);
    const leaving = chooseLeavingRow(ratios);
    const enteringName = columnName(enteringCol, n);
    pivotsPerIteration.set(iteration + 1, { row: leaving?.row ?? null, col: enteringCol });

    yield* emit(section(`section-pivot-${iteration + 1}`, i18nText(NOTEBOOK_TEXT.sections.pivot, { n: iteration + 1 })));
    yield* emit(
      mathText(
        `pivot-${iteration + 1}-reduced-costs`,
        i18nText(I18N.lines.reducedCosts, { costs: `[${tableau[m].slice(0, varColumns).map(formatCell).join(', ')}]` }),
      ),
    );
    yield* emit(
      mathText(
        `pivot-${iteration + 1}-entering`,
        i18nText(I18N.lines.entering, { name: enteringName, value: formatCell(tableau[m][enteringCol]) }),
      ),
    );
    yield* emit(section(`section-ratio-${iteration + 1}`, i18nText(NOTEBOOK_TEXT.sections.ratioTest)));
    for (const candidate of ratios) {
      const basisName = columnName(candidate.basisColumn, n);
      if (candidate.ratio === null) {
        yield* emit(
          mathText(
            `ratio-${iteration + 1}-${candidate.row}`,
            i18nText(I18N.lines.ratioSkip, { basis: basisName, coefficient: formatCell(candidate.coefficient) }),
          ),
        );
      } else {
        yield* emit(
          math(
            `ratio-${iteration + 1}-${candidate.row}`,
            `${basisName}: ${formatCell(candidate.rhs)} / ${formatCell(candidate.coefficient)} = ${formatCell(candidate.ratio)}`,
          ),
        );
      }
    }

    if (leaving === null) {
      outcome = 'unbounded';
      yield* emit(section('section-unbounded', i18nText(I18N.sections.noLeavingRow)));
      yield* emit(
        mathText(
          'unbounded-column',
          i18nText(I18N.lines.column, {
            name: enteringName,
            values: `[${ratios.map((ratio) => formatCell(ratio.coefficient)).join(', ')}]`,
          }),
        ),
      );
      yield* emit(
        note(
          'unbounded-note',
          i18nText(I18N.notes.unbounded),
        ),
      );
      break;
    }

    const leavingRatio = leaving.ratio ?? 0;
    const tiedRows = ratios.filter(
      (candidate) => candidate.ratio !== null && isSame(candidate.ratio, leavingRatio),
    );
    if (tiedRows.length > 1) {
      yield* emit(
        note(
          `pivot-${iteration + 1}-tie`,
          i18nText(I18N.notes.tie, { rows: tiedRows.map((row) => columnName(row.basisColumn, n)).join(', '), ratio: formatCell(leavingRatio) }),
        ),
      );
    }
    if (isZero(leavingRatio)) {
      yield* emit(
        note(
          `pivot-${iteration + 1}-degenerate`,
          i18nText(I18N.notes.degenerate),
        ),
      );
    }

    const leavingName = columnName(leaving.basisColumn, n);
    yield* emit(
      mathText(
        `pivot-${iteration + 1}-leaving`,
        i18nText(I18N.lines.leaving, { name: leavingName, pivot: formatCell(leaving.coefficient) }),
      ),
    );

    pivot(tableau, leaving.row, enteringCol, totalColumns, m);
    basis[leaving.row] = enteringCol;
    yield* emit(
      mathText(
        `pivot-${iteration + 1}-basis`,
        i18nText(I18N.lines.newBasis, { basis: `[${basis.map((col) => columnName(col, n)).join(', ')}]` }),
      ),
    );
    yield* emit(math(`pivot-${iteration + 1}-tableau`, tableauLatex(tableau, varColumns)));
  }

  if (iteration >= MAX_ITERATIONS) outcome = 'exhausted';

  if (outcome === 'unbounded') {
    yield* emit(noResultSection());
    yield* emit(mathText('no-result-unbounded', i18nText(I18N.lines.unbounded)));
    return;
  }

  if (outcome === 'exhausted') {
    yield* emit(noResultSection());
    yield* emit(mathText('no-result-exhausted', i18nText(I18N.lines.exhausted, { limit: MAX_ITERATIONS })));
    return;
  }

  yield* emit(section('section-optimality', i18nText(NOTEBOOK_TEXT.sections.optimality)));
  yield* emit(
    mathText(
      'optimality-reduced-costs',
      i18nText(I18N.lines.reducedCosts, { costs: `[${tableau[m].slice(0, varColumns).map(formatCell).join(', ')}]` }),
    ),
  );
  yield* emit(
    note(
      'optimality-note',
      i18nText(I18N.notes.optimal),
    ),
  );

  const solution = readSolution(tableau, basis, n, totalColumns);
  const objectiveValue = tableau[m][totalColumns - 1];
  const slackValues = readSlacks(tableau, basis, n, m, totalColumns);
  const alternativeColumns = nonBasicZeroReducedCosts(tableau, basis, varColumns, n, m);

  if (scenario.notebookFlow.kind === 'slack-non-binding') {
    yield* emit(section('section-slack', i18nText(I18N.sections.slack)));
    for (let i = 0; i < slackValues.length; i++) {
      yield* emit(math(`slack-${i + 1}`, `s_${i + 1} = ${formatCell(slackValues[i])}`));
    }
    const positive = slackValues
      .map((value, index) => ({ value, index }))
      .filter((item) => item.value > EPSILON);
    if (positive.length > 0) {
      yield* emit(
        note(
          'slack-positive-note',
          i18nText(I18N.notes.slackPositive, { slacks: positive.map((item) => `s_${item.index + 1}`).join(', ') }),
        ),
      );
    }
  }

  if (scenario.notebookFlow.kind === 'alternative-optimum') {
    yield* emit(section('section-alternative', i18nText(I18N.sections.alternative)));
    if (alternativeColumns.length > 0) {
      for (const col of alternativeColumns) {
        yield* emit(mathText(`alternative-${col}`, i18nText(I18N.lines.zeroReducedCost, { name: columnName(col, n) })));
      }
      yield* emit(
        note(
          'alternative-note',
          i18nText(I18N.notes.alternative),
        ),
      );
    } else {
      yield* emit(
        note('alternative-none', i18nText(I18N.notes.alternativeNone)),
      );
    }
  }

  yield* emit(resultSection());
  yield* emit(math('result-solution', solutionLatex(solution)));
  yield* emit(math('result-objective', `z = ${formatCell(objectiveValue)}`));
}

function buildInitialTableau(scenario: SimplexAlgorithmScenario): number[][] {
  const n = scenario.objective.length;
  const m = scenario.constraintMatrix.length;
  const varColumns = n + m;
  const totalColumns = varColumns + 1;
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
  return tableau;
}

function chooseEnteringColumn(
  tableau: readonly (readonly number[])[],
  objectiveRow: number,
  varColumns: number,
): number {
  let enteringCol = -1;
  let mostNegative = -EPSILON;
  for (let j = 0; j < varColumns; j++) {
    if (tableau[objectiveRow][j] < mostNegative) {
      mostNegative = tableau[objectiveRow][j];
      enteringCol = j;
    }
  }
  return enteringCol;
}

function ratioCandidates(
  tableau: readonly (readonly number[])[],
  basis: readonly number[],
  enteringCol: number,
  totalColumns: number,
  constraintRows: number,
): readonly RatioCandidate[] {
  return Array.from({ length: constraintRows }, (_, row) => {
    const coefficient = tableau[row][enteringCol];
    const rhs = tableau[row][totalColumns - 1];
    return {
      row,
      basisColumn: basis[row],
      coefficient,
      rhs,
      ratio: coefficient > EPSILON ? rhs / coefficient : null,
    };
  });
}

function chooseLeavingRow(candidates: readonly RatioCandidate[]): RatioCandidate | null {
  let best: RatioCandidate | null = null;
  for (const candidate of candidates) {
    if (candidate.ratio === null) continue;
    if (best === null || candidate.ratio < best.ratio! - EPSILON) {
      best = candidate;
    }
  }
  return best;
}

function pivot(
  tableau: number[][],
  leavingRow: number,
  enteringCol: number,
  totalColumns: number,
  objectiveRow: number,
): void {
  const pivotValue = tableau[leavingRow][enteringCol];
  for (let j = 0; j < totalColumns; j++) {
    tableau[leavingRow][j] = tableau[leavingRow][j] / pivotValue;
  }
  for (let row = 0; row <= objectiveRow; row++) {
    if (row === leavingRow) continue;
    const factor = tableau[row][enteringCol];
    if (isZero(factor)) continue;
    for (let j = 0; j < totalColumns; j++) {
      tableau[row][j] = tableau[row][j] - factor * tableau[leavingRow][j];
    }
  }
}

function readSolution(
  tableau: readonly (readonly number[])[],
  basis: readonly number[],
  originalVariables: number,
  totalColumns: number,
): readonly number[] {
  const solution = new Array<number>(originalVariables).fill(0);
  for (let row = 0; row < basis.length; row++) {
    if (basis[row] < originalVariables) solution[basis[row]] = tableau[row][totalColumns - 1];
  }
  return solution;
}

function readSlacks(
  tableau: readonly (readonly number[])[],
  basis: readonly number[],
  originalVariables: number,
  slackCount: number,
  totalColumns: number,
): readonly number[] {
  const slacks = new Array<number>(slackCount).fill(0);
  for (let row = 0; row < basis.length; row++) {
    const slackIndex = basis[row] - originalVariables;
    if (slackIndex >= 0 && slackIndex < slackCount) {
      slacks[slackIndex] = tableau[row][totalColumns - 1];
    }
  }
  return slacks;
}

function nonBasicZeroReducedCosts(
  tableau: readonly (readonly number[])[],
  basis: readonly number[],
  varColumns: number,
  originalVariables: number,
  constraintRows: number,
): readonly number[] {
  const basisSet = new Set(basis);
  const objectiveRow = tableau[constraintRows];
  const result: number[] = [];
  for (let col = 0; col < varColumns; col++) {
    if (basisSet.has(col)) continue;
    if (isZero(objectiveRow[col])) result.push(col);
  }
  return result.filter((col) => col >= originalVariables);
}

function tableauLatex(tableau: readonly (readonly number[])[], varColumns: number): string {
  const coeffCols = 'c'.repeat(varColumns);
  const header = `${coeffCols}|c`;
  const rows = tableau.map((row) => row.map((cell) => formatCell(cell)).join(' & ')).join(' \\\\ ');
  return `\\left[\\begin{array}{${header}} ${rows} \\end{array}\\right]`;
}

function formatLinearCombination(coefficients: readonly number[]): string {
  const parts: string[] = [];
  for (let j = 0; j < coefficients.length; j++) {
    const coeff = coefficients[j];
    if (isZero(coeff)) continue;
    const absCoeff = Math.abs(coeff);
    const sign = coeff < 0 ? '-' : parts.length === 0 ? '' : '+';
    const coeffStr = isSame(absCoeff, 1) ? '' : formatCell(absCoeff);
    const name = VARIABLE_NAMES[j] ?? `x_{${j + 1}}`;
    parts.push(`${sign} ${coeffStr}${name}`.trim());
  }
  return parts.join(' ') || '0';
}

function formatSignedLinearCombination(
  coefficients: readonly number[],
  multiplier: 1 | -1,
): string {
  const parts: string[] = [];
  for (let j = 0; j < coefficients.length; j++) {
    const coeff = coefficients[j] * multiplier;
    if (isZero(coeff)) continue;
    const absCoeff = Math.abs(coeff);
    const sign = coeff < 0 ? '-' : '+';
    const coeffStr = isSame(absCoeff, 1) ? '' : formatCell(absCoeff);
    const name = VARIABLE_NAMES[j] ?? `x_{${j + 1}}`;
    parts.push(`${sign} ${coeffStr}${name}`.trim());
  }
  return parts.join(' ') || '+ 0';
}

function solutionLatex(solution: readonly number[]): string {
  return solution
    .map((value, index) => `${VARIABLE_NAMES[index] ?? `x_{${index + 1}}`} = ${formatCell(value)}`)
    .join(',\\; ');
}

function decisionVariableNames(count: number): readonly string[] {
  return Array.from({ length: count }, (_, index) => VARIABLE_NAMES[index] ?? `x_{${index + 1}}`);
}

function columnNames(count: number, originalVariables: number): readonly string[] {
  return Array.from({ length: count }, (_, index) => columnName(index, originalVariables));
}

function columnName(col: number, originalVariables: number): string {
  if (col < originalVariables) return VARIABLE_NAMES[col] ?? `x_{${col + 1}}`;
  return `s_${col - originalVariables + 1}`;
}

function phaseFor(builder: LineBuilder): TranslatableText {
  if (builder.id.includes('result') || builder.id.includes('no-result')) return i18nText(NOTEBOOK_TEXT.sections.result);
  if (builder.id.includes('pivot') || builder.id.includes('ratio')) return i18nText(I18N.phases.pivot);
  if (builder.id.includes('optimal') || builder.id.includes('alternative'))
    return i18nText(NOTEBOOK_TEXT.sections.optimality);
  if (builder.id.includes('slack')) return i18nText(I18N.phases.slack);
  return i18nText(I18N.phases.tableau);
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

/* ========================================================================
   MATRIX-GRID OP PARSING — Simplex emits stable line ids per pivot
   iteration (pivot-N-entering / -leaving / -tableau, ratio-N-row …).
   We pattern-match on those ids to colour the pivot cell, the
   entering column and the leaving row in the tableau view.
   ======================================================================== */

interface SimplexOp {
  readonly pivotRow: number | null;
  readonly pivotCol: number | null;
  readonly affectedRow: number | null;
  readonly kind:
    | 'idle'
    | 'select-column'
    | 'ratio-test'
    | 'pivot'
    | 'apply-pivot'
    | 'optimal'
    | 'fail';
  readonly label: string | null;
}

function parseSimplexOperation(
  builder: LineBuilder,
  pivots: ReadonlyMap<number, { readonly row: number | null; readonly col: number }>,
): SimplexOp {
  const id = builder.id;
  const text = typeof builder.content === 'string' ? builder.content : '';

  if (id === 'no-result-unbounded' || id === 'no-result-exhausted' || id === 'section-no-result') {
    return base('fail');
  }
  if (id === 'section-optimality' || id.startsWith('optimality-')) {
    return base('optimal');
  }
  if (id.startsWith('result-') || id === 'section-result') {
    return base('optimal');
  }
  if (id === 'initial-tableau' || id === 'initial-columns') {
    return base('idle');
  }

  const ratioMatch = id.match(/^ratio-(\d+)-(\d+)$/);
  if (ratioMatch) {
    const iter = Number(ratioMatch[1]);
    const row = Number(ratioMatch[2]);
    const pivot = pivots.get(iter);
    return {
      pivotRow: null,
      pivotCol: pivot?.col ?? null,
      affectedRow: row,
      kind: 'ratio-test',
      label: text || null,
    };
  }

  const enteringMatch = id.match(/^pivot-(\d+)-(entering|reduced-costs)$/);
  if (enteringMatch) {
    const iter = Number(enteringMatch[1]);
    const pivot = pivots.get(iter);
    return {
      pivotRow: null,
      pivotCol: pivot?.col ?? null,
      affectedRow: null,
      kind: 'select-column',
      label: text || null,
    };
  }

  const leavingMatch = id.match(/^pivot-(\d+)-leaving$/);
  if (leavingMatch) {
    const iter = Number(leavingMatch[1]);
    const pivot = pivots.get(iter);
    return {
      pivotRow: pivot?.row ?? null,
      pivotCol: pivot?.col ?? null,
      affectedRow: pivot?.row ?? null,
      kind: 'pivot',
      label: text || null,
    };
  }

  const tableauMatch = id.match(/^pivot-(\d+)-(tableau|basis)$/);
  if (tableauMatch) {
    const iter = Number(tableauMatch[1]);
    const pivot = pivots.get(iter);
    return {
      pivotRow: pivot?.row ?? null,
      pivotCol: pivot?.col ?? null,
      affectedRow: pivot?.row ?? null,
      kind: 'apply-pivot',
      label: text || null,
    };
  }

  return base('idle');

  function base(kind: SimplexOp['kind']): SimplexOp {
    return {
      pivotRow: null,
      pivotCol: null,
      affectedRow: null,
      kind,
      label: null,
    };
  }
}

function simplexCellState(
  row: number,
  col: number,
  rows: number,
  varColumns: number,
  op: SimplexOp,
): MatrixGridCellState {
  const isObjectiveRow = row === rows - 1;
  const isRhs = col === varColumns;

  if (op.kind === 'fail') {
    if (op.affectedRow !== null && row === op.affectedRow) return 'eliminating';
    return 'idle';
  }

  if (op.kind === 'optimal') {
    if (isObjectiveRow) return 'leading';
    if (isRhs) return 'rhs';
    return 'idle';
  }

  if (op.kind === 'select-column') {
    if (col === op.pivotCol) {
      return isObjectiveRow ? 'pivot' : 'pivot-col';
    }
    if (isObjectiveRow) return 'pivot-row';
  }

  if (op.kind === 'ratio-test') {
    if (col === op.pivotCol) return 'pivot-col';
    if (op.affectedRow !== null && row === op.affectedRow) return 'eliminating';
  }

  if (op.kind === 'pivot') {
    if (row === op.pivotRow && col === op.pivotCol) return 'pivot';
    if (row === op.pivotRow) return 'pivot-row';
    if (col === op.pivotCol) return 'pivot-col';
  }

  if (op.kind === 'apply-pivot') {
    if (row === op.pivotRow) return 'updated';
    if (col === op.pivotCol) return 'pivot-col';
  }

  if (isRhs) return 'rhs';
  return 'idle';
}

function simplexPhaseLabel(builder: LineBuilder): TranslatableText {
  if (builder.id === 'no-result-unbounded') return i18nText(I18N.phases.noOptimum);
  if (builder.id === 'no-result-exhausted') return i18nText(I18N.phases.pivotLimit);
  if (builder.id.startsWith('result-') || builder.id === 'section-result') return i18nText(I18N.phases.optimum);
  if (builder.id.startsWith('optimality-') || builder.id === 'section-optimality') {
    return i18nText(NOTEBOOK_TEXT.sections.optimality);
  }
  if (builder.id.startsWith('ratio-') || builder.id.startsWith('section-ratio-')) {
    return i18nText(NOTEBOOK_TEXT.sections.ratioTest);
  }
  if (builder.id.startsWith('pivot-') || builder.id.startsWith('section-pivot-')) {
    return i18nText(I18N.phases.pivot);
  }
  if (builder.id.startsWith('initial-')) return i18nText(NOTEBOOK_TEXT.sections.initialTableau);
  if (builder.id.startsWith('standard-')) return i18nText(NOTEBOOK_TEXT.sections.standardForm);
  return i18nText(NOTEBOOK_TEXT.sections.model);
}

function simplexMatrixTone(op: SimplexOp): MatrixGridTone {
  if (op.kind === 'fail') return 'fail';
  if (op.kind === 'optimal') return 'complete';
  if (op.kind === 'pivot' || op.kind === 'apply-pivot') return 'pivot';
  if (op.kind === 'ratio-test') return 'eliminate';
  if (op.kind === 'select-column') return 'compute';
  return 'idle';
}

function formatCell(value: number): string {
  if (isZero(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(3).replace(/\.?0+$/, '');
}

function isZero(value: number): boolean {
  return Math.abs(value) < EPSILON;
}

function isSame(left: number, right: number): boolean {
  return Math.abs(left - right) < EPSILON;
}
