import { marker as t } from '@jsverse/transloco-keys-manager/marker';

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
import type { SortStep } from '../../models/sort-step';
import type { GaussianEliminationScenario } from '../../utils/scenarios/number-lab/gaussian-elimination-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.gaussianElimination.modeLabel'),
  matrixGridModeLabel: t(
    'features.algorithms.runtime.matrixGrid.gaussianElimination.modeLabel',
  ),
  matrixGridPhases: {
    setup: t('features.algorithms.runtime.matrixGrid.gaussianElimination.phases.setup'),
    forward: t('features.algorithms.runtime.matrixGrid.gaussianElimination.phases.forward'),
    backward: t('features.algorithms.runtime.matrixGrid.gaussianElimination.phases.backward'),
    contradiction: t(
      'features.algorithms.runtime.matrixGrid.gaussianElimination.phases.contradiction',
    ),
    complete: t('features.algorithms.runtime.matrixGrid.gaussianElimination.phases.complete'),
  },
} as const;

const EPSILON = 1e-9;
const CALCULATION_INDENT = 1;
const RESULT_MARKER = '✓';
const NO_RESULT_MARKER = '×';
const VARIABLE_NAMES = ['x', 'y', 'z', 'w', 'v', 'u'] as const;
const PARAMETER_NAMES = ['t', 'u', 'v', 'p', 'q', 'r'] as const;

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

interface PivotPosition {
  readonly row: number;
  readonly col: number;
}

interface Contradiction {
  readonly row: number;
  readonly rhs: number;
}

interface FreeVariable {
  readonly col: number;
  readonly parameter: string;
}

export function* gaussianEliminationGenerator(
  scenario: GaussianEliminationScenario,
): Generator<SortStep> {
  const presetLabel = scenario.presetLabel;
  const variableCount = scenario.variableCount;
  const matrix: number[][] = scenario.matrix.map((row) => [...row]);
  const initialMatrix: number[][] = scenario.matrix.map((row) => [...row]);
  const rowCount = matrix.length;
  const lineBuilders: LineBuilder[] = [];
  const pivots: PivotPosition[] = [];
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
      mode: 'gaussian-elimination',
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

  /** Plain-text result string we accumulate as the chalkboard reaches
   *  the result section — used to drive the matrix-grid footer. */
  let currentResult: string | null = null;

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
      matrixGrid: buildMatrixGridState(builder, opts),
    };
  }

  function captureResultFromBuilder(builder: LineBuilder): void {
    if (builder.id === 'no-solution') {
      currentResult = 'układ sprzeczny';
      return;
    }
    if (!builder.id.startsWith('result-')) return;
    const text = typeof builder.content === 'string' ? builder.content : '';
    const stripped = text.replace(/\[\[\/?math\]\]/g, '').trim();
    if (!stripped) return;
    currentResult = currentResult ? `${currentResult};  ${stripped}` : stripped;
  }

  function buildMatrixGridState(
    builder: LineBuilder,
    opts: {
      readonly phase: ScratchpadLabTraceState['phaseLabel'];
      readonly decision: ScratchpadLabTraceState['decisionLabel'];
    },
  ): MatrixGridTraceState {
    const op = parseOperation(builder);
    const cells: MatrixGridCell[] = [];
    for (let row = 0; row < rowCount; row++) {
      const colCount = matrix[row].length;
      for (let col = 0; col < colCount; col++) {
        cells.push({
          id: `r${row}c${col}-step${stepIndex}`,
          row,
          col,
          value: formatCell(matrix[row][col]),
          state: cellStateFor(row, col, op),
        });
      }
    }
    return {
      mode: 'gaussian-elimination',
      modeLabel: I18N.matrixGridModeLabel,
      phaseLabel: matrixPhaseLabel(builder),
      decisionLabel: opts.decision,
      tone: matrixGridTone(builder, op),
      rows: rowCount,
      cols: variableCount + 1,
      dividerCol: variableCount,
      cells,
      operationLabel: op.label,
      resultLabel: currentResult,
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

  function resultSection(): LineBuilder {
    return paperLine({
      id: 'section-result',
      kind: 'result',
      marker: RESULT_MARKER,
      content: 'Wynik',
    });
  }

  function noResultSection(): LineBuilder {
    return paperLine({
      id: 'section-no-result',
      kind: 'result',
      marker: NO_RESULT_MARKER,
      content: 'Brak rozwiązania',
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

  function* emitRowOperation(
    id: string,
    operation: string,
    activeCodeLine = 3,
  ): Generator<SortStep> {
    yield* emit(math(`${id}-operation`, operation), activeCodeLine);
    yield* emit(math(`${id}-matrix`, matrixLatex(matrix, variableCount)), activeCodeLine);
  }

  yield* emit(section('section-system', 'Układ równań'));
  for (let row = 0; row < rowCount; row++) {
    yield* emit(math(`system-row-${row + 1}`, equationLatex(initialMatrix[row], variableCount)));
  }

  yield* emit(section('section-augmented-matrix', 'Macierz rozszerzona'));
  yield* emit(math('matrix-initial', matrixLatex(matrix, variableCount)));

  yield* emit(section('section-forward', 'Eliminacja w przód'));
  let pivotRow = 0;
  for (let col = 0; col < variableCount && pivotRow < rowCount; col++) {
    const swapRow = findPivotRow(matrix, pivotRow, col);
    if (swapRow === -1) continue;

    if (swapRow !== pivotRow) {
      [matrix[pivotRow], matrix[swapRow]] = [matrix[swapRow], matrix[pivotRow]];
      yield* emitRowOperation(
        `forward-swap-${pivotRow}-${swapRow}`,
        `R_${pivotRow + 1} \\leftrightarrow R_${swapRow + 1}`,
      );
    }

    const pivotValue = matrix[pivotRow][col];
    if (!isSame(pivotValue, 1)) {
      for (let j = 0; j < matrix[pivotRow].length; j++) {
        matrix[pivotRow][j] = matrix[pivotRow][j] / pivotValue;
      }
      yield* emitRowOperation(
        `forward-scale-${pivotRow}`,
        `R_${pivotRow + 1} \\leftarrow R_${pivotRow + 1} / ${formatDivisionScalar(pivotValue)}`,
      );
    }

    for (let row = pivotRow + 1; row < rowCount; row++) {
      const factor = matrix[row][col];
      if (isZero(factor)) continue;
      for (let j = 0; j < matrix[row].length; j++) {
        matrix[row][j] = matrix[row][j] - factor * matrix[pivotRow][j];
      }
      yield* emitRowOperation(
        `forward-eliminate-${pivotRow}-${row}`,
        rowEliminationLatex(row + 1, pivotRow + 1, factor),
      );
    }

    pivots.push({ row: pivotRow, col });
    pivotRow += 1;
  }

  const forwardContradiction = findContradiction(matrix, variableCount);
  if (forwardContradiction) {
    yield* emit(section('section-contradiction', 'Sprzeczność'));
    yield* emit(math('contradiction-row', `0 = ${formatCell(forwardContradiction.rhs)}`));
    yield* emit(noResultSection());
    yield* emit(note('no-solution', 'układ jest sprzeczny'));
    return;
  }

  if (pivots.length > 0) {
    yield* emit(section('section-backward', 'Eliminacja wstecz'));
    for (let index = pivots.length - 1; index >= 0; index--) {
      const pivot = pivots[index];
      for (let row = 0; row < pivot.row; row++) {
        const factor = matrix[row][pivot.col];
        if (isZero(factor)) continue;
        for (let j = 0; j < matrix[row].length; j++) {
          matrix[row][j] = matrix[row][j] - factor * matrix[pivot.row][j];
        }
        yield* emitRowOperation(
          `backward-eliminate-${pivot.row}-${row}`,
          rowEliminationLatex(row + 1, pivot.row + 1, factor),
          4,
        );
      }
    }
  }

  const backwardContradiction = findContradiction(matrix, variableCount);
  if (backwardContradiction) {
    yield* emit(section('section-contradiction', 'Sprzeczność'));
    yield* emit(math('contradiction-row', `0 = ${formatCell(backwardContradiction.rhs)}`));
    yield* emit(noResultSection());
    yield* emit(note('no-solution', 'układ jest sprzeczny'));
    return;
  }

  if (pivots.length < variableCount) {
    const freeVariables = buildFreeVariables(pivots, variableCount);
    yield* emit(section('section-free-variables', 'Zmienne wolne'));
    for (const free of freeVariables) {
      yield* emit(math(`free-${free.col}`, `${variableName(free.col)} = ${free.parameter}`));
    }
    for (const pivot of pivots) {
      const row = matrix[pivot.row];
      const lhs = freeEquationLeft(pivot.col, row, freeVariables);
      yield* emit(math(`free-equation-${pivot.row}`, `${lhs} = ${formatCell(row[variableCount])}`));
    }

    yield* emit(resultSection());
    const expressions = parameterizedSolution(matrix, pivots, freeVariables, variableCount);
    for (const expression of expressions) {
      yield* emit(
        math(`result-${expression.variable}`, `${expression.variable} = ${expression.value}`),
      );
    }
    yield* emit(
      math(
        'result-parameters',
        `${freeVariables.map((free) => free.parameter).join(', ')} \\in \\mathbb{R}`,
      ),
    );
    return;
  }

  const solution = readUniqueSolution(matrix, variableCount);
  yield* emit(section('section-check', 'Sprawdzenie'));
  for (let row = 0; row < initialMatrix.length; row++) {
    yield* emit(
      math(
        `check-${row + 1}`,
        `${substitutedEquationLeft(initialMatrix[row], solution, variableCount)} = ${formatCell(initialMatrix[row][variableCount])}`,
      ),
    );
  }

  yield* emit(resultSection());
  for (let index = 0; index < solution.length; index++) {
    yield* emit(math(`result-${index}`, `${variableName(index)} = ${formatCell(solution[index])}`));
  }
}

function findPivotRow(
  matrix: readonly (readonly number[])[],
  startRow: number,
  col: number,
): number {
  for (let row = startRow; row < matrix.length; row++) {
    if (!isZero(matrix[row][col])) return row;
  }
  return -1;
}

function findContradiction(
  matrix: readonly (readonly number[])[],
  variableCount: number,
): Contradiction | null {
  for (let row = 0; row < matrix.length; row++) {
    const allZero = matrix[row].slice(0, variableCount).every(isZero);
    const rhs = matrix[row][variableCount];
    if (allZero && !isZero(rhs)) return { row, rhs };
  }
  return null;
}

function readUniqueSolution(
  matrix: readonly (readonly number[])[],
  variableCount: number,
): readonly number[] {
  const solution = new Array<number>(variableCount).fill(0);
  for (let row = 0; row < matrix.length; row++) {
    const pivotCol = matrix[row].slice(0, variableCount).findIndex((cell) => isSame(cell, 1));
    if (pivotCol >= 0 && pivotCol < variableCount) {
      solution[pivotCol] = matrix[row][variableCount];
    }
  }
  return solution;
}

function buildFreeVariables(
  pivots: readonly PivotPosition[],
  variableCount: number,
): readonly FreeVariable[] {
  const pivotColumns = new Set(pivots.map((pivot) => pivot.col));
  const freeVariables: FreeVariable[] = [];
  for (let col = 0; col < variableCount; col++) {
    if (pivotColumns.has(col)) continue;
    freeVariables.push({
      col,
      parameter: PARAMETER_NAMES[freeVariables.length] ?? `t_${freeVariables.length + 1}`,
    });
  }
  return freeVariables;
}

function parameterizedSolution(
  matrix: readonly (readonly number[])[],
  pivots: readonly PivotPosition[],
  freeVariables: readonly FreeVariable[],
  variableCount: number,
): readonly { readonly variable: string; readonly value: string }[] {
  const pivotByCol = new Map<number, PivotPosition>();
  for (const pivot of pivots) pivotByCol.set(pivot.col, pivot);

  return Array.from({ length: variableCount }, (_, col) => {
    const variable = variableName(col);
    const free = freeVariables.find((candidate) => candidate.col === col);
    if (free) return { variable, value: free.parameter };

    const pivot = pivotByCol.get(col);
    if (!pivot) return { variable, value: '0' };
    const row = matrix[pivot.row];
    const terms = freeVariables
      .map((candidate) => ({
        coefficient: -row[candidate.col],
        parameter: candidate.parameter,
      }))
      .filter((term) => !isZero(term.coefficient));
    return {
      variable,
      value: affineExpression(row[variableCount], terms),
    };
  });
}

function matrixLatex(matrix: readonly (readonly number[])[], variableCount: number): string {
  const coeffCols = 'c'.repeat(variableCount);
  const header = `${coeffCols}|c`;
  const rows = matrix.map((row) => row.map((cell) => formatCell(cell)).join(' & ')).join(' \\\\ ');
  return `\\left[\\begin{array}{${header}} ${rows} \\end{array}\\right]`;
}

function equationLatex(row: readonly number[], variableCount: number): string {
  return `${linearCombination(row.slice(0, variableCount))} = ${formatCell(row[variableCount])}`;
}

function linearCombination(coefficients: readonly number[]): string {
  const parts: string[] = [];
  for (let col = 0; col < coefficients.length; col++) {
    const coeff = coefficients[col];
    if (isZero(coeff)) continue;
    const absCoeff = Math.abs(coeff);
    const sign = coeff < 0 ? '-' : parts.length === 0 ? '' : '+';
    const coeffStr = isSame(absCoeff, 1) ? '' : formatCell(absCoeff);
    parts.push(`${sign} ${coeffStr}${variableName(col)}`.trim());
  }
  return parts.join(' ') || '0';
}

function substitutedEquationLeft(
  row: readonly number[],
  solution: readonly number[],
  variableCount: number,
): string {
  const parts: string[] = [];
  for (let col = 0; col < variableCount; col++) {
    const coeff = row[col];
    if (isZero(coeff)) continue;
    const value = solution[col];
    const absCoeff = Math.abs(coeff);
    const sign = coeff < 0 ? '-' : parts.length === 0 ? '' : '+';
    const term = isSame(absCoeff, 1)
      ? formatSignedFactor(value)
      : `${formatCell(absCoeff)} \\cdot ${formatSignedFactor(value)}`;
    parts.push(`${sign} ${term}`.trim());
  }
  return parts.join(' ') || '0';
}

function freeEquationLeft(
  pivotCol: number,
  row: readonly number[],
  freeVariables: readonly FreeVariable[],
): string {
  const parts = [variableName(pivotCol)];
  for (const free of freeVariables) {
    const coefficient = row[free.col];
    if (isZero(coefficient)) continue;
    const sign = coefficient < 0 ? '-' : '+';
    const absCoeff = Math.abs(coefficient);
    const coeff = isSame(absCoeff, 1) ? '' : formatCoefficientForTerm(absCoeff);
    parts.push(`${sign} ${coeff}${variableName(free.col)}`.trim());
  }
  return parts.join(' ');
}

function affineExpression(
  constant: number,
  terms: readonly { readonly coefficient: number; readonly parameter: string }[],
): string {
  const parts: string[] = [];
  if (!isZero(constant) || terms.length === 0) parts.push(formatCell(constant));
  for (const term of terms) {
    const sign = term.coefficient < 0 ? '-' : parts.length === 0 ? '' : '+';
    const absCoeff = Math.abs(term.coefficient);
    const coeff = isSame(absCoeff, 1) ? '' : formatCoefficientForTerm(absCoeff);
    parts.push(`${sign} ${coeff}${term.parameter}`.trim());
  }
  return parts.join(' ');
}

function rowEliminationLatex(targetRow: number, pivotRow: number, factor: number): string {
  const operation = factor < 0 ? '+' : '-';
  const absFactor = Math.abs(factor);
  const coefficient = isSame(absFactor, 1) ? '' : formatCell(absFactor);
  return `R_${targetRow} \\leftarrow R_${targetRow} ${operation} ${coefficient}R_${pivotRow}`;
}

function formatDivisionScalar(value: number): string {
  const formatted = formatCell(value);
  return value < 0 || formatted.includes('/') ? `(${formatted})` : formatted;
}

function formatCoefficientForTerm(value: number): string {
  const formatted = formatCell(value);
  return formatted.includes('/') ? `(${formatted})` : formatted;
}

function formatSignedFactor(value: number): string {
  return value < 0 ? `(${formatCell(value)})` : formatCell(value);
}

function variableName(index: number): string {
  return VARIABLE_NAMES[index] ?? `x_{${index + 1}}`;
}

function phaseFor(builder: LineBuilder): string {
  if (builder.id.includes('no-solution') || builder.id.includes('no-result')) {
    return 'Brak rozwiązania';
  }
  if (builder.id.includes('result')) return 'Wynik';
  if (builder.id.includes('check')) return 'Sprawdzenie';
  if (builder.id.includes('free')) return 'Zmienne wolne';
  if (builder.id.includes('contradiction')) return 'Sprzeczność';
  if (builder.id.includes('backward')) return 'Eliminacja wstecz';
  if (builder.id.includes('forward')) return 'Eliminacja w przód';
  if (builder.id.includes('matrix')) return 'Macierz rozszerzona';
  return 'Układ równań';
}

function decisionFor(builder: LineBuilder): string {
  if (builder.kind === 'result') return 'Zapisujemy końcowy wniosek.';
  if (builder.kind === 'note') return 'Zapisujemy kolejną sekcję rozwiązania.';
  return 'Dopisujemy kolejny rachunek.';
}

function toneFor(builder: LineBuilder): ScratchpadLabTraceState['tone'] {
  if (builder.kind === 'result') return 'complete';
  if (builder.id.includes('no-solution') || builder.id.includes('contradiction')) {
    return 'conclude';
  }
  if (builder.kind === 'note') return 'setup';
  return 'compute';
}

/* ========================================================================
   MATRIX-GRID OP PARSING — the chalkboard generator emits stable line
   ids (e.g. `forward-eliminate-1-2-operation` / `…-matrix`) that
   encode the row-operation context. We pattern-match on those ids to
   tint the corresponding cells in the grid view rather than
   re-running the algorithm.
   ======================================================================== */

interface MatrixOp {
  /** Pivot row index (0-based) for this operation, or null. */
  readonly pivotRow: number | null;
  /** Pivot column index (0-based) for this operation, or null. */
  readonly pivotCol: number | null;
  /** Row currently being eliminated/scaled, or null. */
  readonly affectedRow: number | null;
  /** Whether the matrix snapshot has just been written (true on
   *  `…-matrix` lines, false on `…-operation` lines). */
  readonly isCommitted: boolean;
  /** Phase classification for the tone. */
  readonly kind: 'idle' | 'pivot' | 'eliminate' | 'swap' | 'scale' | 'complete' | 'fail';
  readonly label: string | null;
}

function parseOperation(builder: LineBuilder): MatrixOp {
  const id = builder.id;
  const text = typeof builder.content === 'string' ? builder.content : '';
  const isCommitted = id.endsWith('-matrix');

  if (id === 'matrix-initial') {
    return base('idle');
  }
  if (id === 'no-solution' || id.includes('contradiction')) {
    return base('fail');
  }
  if (id.startsWith('result-') || id === 'section-result') {
    return base('complete');
  }

  const swapMatch = id.match(/^(?:forward|backward)-swap-(\d+)-(\d+)-(operation|matrix)$/);
  if (swapMatch) {
    return {
      pivotRow: Number(swapMatch[1]),
      pivotCol: null,
      affectedRow: Number(swapMatch[2]),
      isCommitted,
      kind: 'swap',
      label: text || null,
    };
  }

  const scaleMatch = id.match(/^(?:forward|backward)-scale-(\d+)-(operation|matrix)$/);
  if (scaleMatch) {
    return {
      pivotRow: Number(scaleMatch[1]),
      pivotCol: null,
      affectedRow: Number(scaleMatch[1]),
      isCommitted,
      kind: 'scale',
      label: text || null,
    };
  }

  const elimMatch = id.match(/^(?:forward|backward)-eliminate-(\d+)-(\d+)-(operation|matrix)$/);
  if (elimMatch) {
    return {
      pivotRow: Number(elimMatch[1]),
      pivotCol: null,
      affectedRow: Number(elimMatch[2]),
      isCommitted,
      kind: 'eliminate',
      label: text || null,
    };
  }

  return base('idle');

  function base(kind: MatrixOp['kind']): MatrixOp {
    return {
      pivotRow: null,
      pivotCol: null,
      affectedRow: null,
      isCommitted,
      kind,
      label: null,
    };
  }
}

function cellStateFor(row: number, _col: number, op: MatrixOp): MatrixGridCellState {
  if (op.kind === 'fail' && op.affectedRow !== null && row === op.affectedRow) {
    return 'eliminating';
  }
  if (op.kind === 'pivot' || op.kind === 'scale') {
    if (row === op.pivotRow) {
      return op.isCommitted ? 'updated' : 'pivot-row';
    }
  }
  if (op.kind === 'swap') {
    if (row === op.pivotRow || row === op.affectedRow) {
      return op.isCommitted ? 'updated' : 'pivot-row';
    }
  }
  if (op.kind === 'eliminate') {
    if (row === op.pivotRow) return 'pivot-row';
    if (row === op.affectedRow) {
      return op.isCommitted ? 'updated' : 'eliminating';
    }
  }
  if (op.kind === 'complete') {
    /* Visual settle on result step — RHS column reads brighter than
     *  the rest. */
    return 'idle';
  }
  return 'idle';
}

function matrixPhaseLabel(builder: LineBuilder): string {
  if (builder.id.includes('contradiction') || builder.id === 'no-solution') {
    return 'Sprzeczność';
  }
  if (builder.id.startsWith('result-') || builder.id === 'section-result') {
    return 'Wynik';
  }
  if (builder.id.includes('forward')) return 'Eliminacja w przód';
  if (builder.id.includes('backward')) return 'Eliminacja wstecz';
  if (builder.id === 'matrix-initial' || builder.id.includes('augmented')) {
    return 'Macierz rozszerzona';
  }
  if (builder.id.includes('check')) return 'Sprawdzenie';
  if (builder.id.includes('free')) return 'Zmienne wolne';
  return 'Układ równań';
}

function matrixGridTone(builder: LineBuilder, op: MatrixOp): MatrixGridTone {
  if (op.kind === 'fail') return 'fail';
  if (op.kind === 'complete') return 'complete';
  if (op.kind === 'eliminate') return 'eliminate';
  if (op.kind === 'pivot' || op.kind === 'scale' || op.kind === 'swap') return 'pivot';
  if (builder.kind === 'result') return 'complete';
  return 'idle';
}

function formatCell(value: number): string {
  if (isZero(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  for (let denominator = 2; denominator <= 24; denominator++) {
    const numerator = Math.round(value * denominator);
    if (Math.abs(value - numerator / denominator) < EPSILON) {
      return `${numerator}/${denominator}`;
    }
  }
  return value.toFixed(4).replace(/\.?0+$/, '');
}

function isZero(value: number): boolean {
  return Math.abs(value) < EPSILON;
}

function isSame(left: number, right: number): boolean {
  return Math.abs(left - right) < EPSILON;
}
