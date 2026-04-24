import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  ScratchpadLabTraceState,
  ScratchpadLine,
  ScratchpadLineState,
} from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import type { SimplexAlgorithmScenario } from '../../utils/scenarios/number-lab/simplex-algorithm-scenarios';
import { createScratchpadLabStep } from '../scratchpad-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.scratchpadLab.simplex.modeLabel'),
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

  function noResultSection(): LineBuilder {
    return paperLine({
      id: 'section-no-result',
      kind: 'result',
      marker: NO_RESULT_MARKER,
      content: 'Brak skończonego optimum',
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

  yield* emit(section('section-model', 'Model'));
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

  yield* emit(section('section-standard-form', 'Postać standardowa'));
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
    math(
      'standard-basis',
      `baza\\ początkowa = [${basis.map((col) => columnName(col, n)).join(', ')}]`,
    ),
  );

  yield* emit(section('section-initial-tableau', 'Tableau początkowe'));
  yield* emit(math('initial-columns', `kolumny = [${columnNames(varColumns, n).join(', ')}, RHS]`));
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

    yield* emit(section(`section-pivot-${iteration + 1}`, `Pivot ${iteration + 1}`));
    yield* emit(
      math(
        `pivot-${iteration + 1}-reduced-costs`,
        `koszty\\ zredukowane = [${tableau[m].slice(0, varColumns).map(formatCell).join(', ')}]`,
      ),
    );
    yield* emit(
      math(
        `pivot-${iteration + 1}-entering`,
        `wchodzi\\ ${enteringName},\\ bo\\ ${formatCell(tableau[m][enteringCol])}\\ jest\\ najbardziej\\ ujemne`,
      ),
    );
    yield* emit(section(`section-ratio-${iteration + 1}`, 'Test ilorazów'));
    for (const candidate of ratios) {
      const basisName = columnName(candidate.basisColumn, n);
      if (candidate.ratio === null) {
        yield* emit(
          math(
            `ratio-${iteration + 1}-${candidate.row}`,
            `${basisName}: ${formatCell(candidate.coefficient)} \\le 0 \\to pomiń`,
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
      yield* emit(section('section-unbounded', 'Brak wiersza wychodzącego'));
      yield* emit(
        math(
          'unbounded-column',
          `kolumna\\ ${enteringName} = [${ratios.map((ratio) => formatCell(ratio.coefficient)).join(', ')}]`,
        ),
      );
      yield* emit(
        note(
          'unbounded-note',
          'W kolumnie wchodzącej nie ma dodatniego elementu, więc nie da się wykonać testu ilorazów.',
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
          `Remis w teście ilorazów: ${tiedRows.map((row) => columnName(row.basisColumn, n)).join(', ')} mają iloraz ${formatCell(leavingRatio)}.`,
        ),
      );
    }
    if (isZero(leavingRatio)) {
      yield* emit(
        note(
          `pivot-${iteration + 1}-degenerate`,
          'Iloraz 0 oznacza pivot zdegenerowany: baza się zmieni, ale wartość funkcji celu nie wzrośnie.',
        ),
      );
    }

    const leavingName = columnName(leaving.basisColumn, n);
    yield* emit(
      math(
        `pivot-${iteration + 1}-leaving`,
        `wychodzi\\ ${leavingName},\\ pivot = ${formatCell(leaving.coefficient)}`,
      ),
    );

    pivot(tableau, leaving.row, enteringCol, totalColumns, m);
    basis[leaving.row] = enteringCol;
    yield* emit(
      math(
        `pivot-${iteration + 1}-basis`,
        `nowa\\ baza = [${basis.map((col) => columnName(col, n)).join(', ')}]`,
      ),
    );
    yield* emit(math(`pivot-${iteration + 1}-tableau`, tableauLatex(tableau, varColumns)));
  }

  if (iteration >= MAX_ITERATIONS) outcome = 'exhausted';

  if (outcome === 'unbounded') {
    yield* emit(noResultSection());
    yield* emit(math('no-result-unbounded', 'funkcja\\ celu\\ jest\\ nieograniczona'));
    return;
  }

  if (outcome === 'exhausted') {
    yield* emit(noResultSection());
    yield* emit(math('no-result-exhausted', `przekroczono\\ limit\\ ${MAX_ITERATIONS}\\ pivotów`));
    return;
  }

  yield* emit(section('section-optimality', 'Test optymalności'));
  yield* emit(
    math(
      'optimality-reduced-costs',
      `koszty\\ zredukowane = [${tableau[m].slice(0, varColumns).map(formatCell).join(', ')}]`,
    ),
  );
  yield* emit(
    note(
      'optimality-note',
      'Wszystkie koszty zredukowane są nieujemne, więc bieżąca baza jest optymalna.',
    ),
  );

  const solution = readSolution(tableau, basis, n, totalColumns);
  const objectiveValue = tableau[m][totalColumns - 1];
  const slackValues = readSlacks(tableau, basis, n, m, totalColumns);
  const alternativeColumns = nonBasicZeroReducedCosts(tableau, basis, varColumns, n, m);

  if (scenario.notebookFlow.kind === 'slack-non-binding') {
    yield* emit(section('section-slack', 'Ograniczenie niewiążące'));
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
          `${positive.map((item) => `s_${item.index + 1}`).join(', ')} > 0, więc odpowiadające ograniczenie nie jest wiążące.`,
        ),
      );
    }
  }

  if (scenario.notebookFlow.kind === 'alternative-optimum') {
    yield* emit(section('section-alternative', 'Alternatywne optimum'));
    if (alternativeColumns.length > 0) {
      for (const col of alternativeColumns) {
        yield* emit(math(`alternative-${col}`, `koszt\\ zredukowany\\ ${columnName(col, n)} = 0`));
      }
      yield* emit(
        note(
          'alternative-note',
          'Zmienna niebazowa z kosztem zredukowanym 0 może wejść do bazy bez zmiany wartości z.',
        ),
      );
    } else {
      yield* emit(
        note('alternative-none', 'Brak niebazowej zmiennej z zerowym kosztem zredukowanym.'),
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

function phaseFor(builder: LineBuilder): string {
  if (builder.id.includes('result') || builder.id.includes('no-result')) return 'Wynik';
  if (builder.id.includes('pivot') || builder.id.includes('ratio')) return 'Pivot';
  if (builder.id.includes('optimal') || builder.id.includes('alternative'))
    return 'Test optymalności';
  if (builder.id.includes('slack')) return 'Slack';
  return 'Tableau';
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
