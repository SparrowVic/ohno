import { describe, expect, it } from 'vitest';

import { MatrixGridCellState, MatrixGridTone, MatrixGridTraceState } from '../../models/matrix-grid';
import {
  buildMatrixGridFacts,
  buildMatrixGridTable,
  buildOperationHistory,
  buildSolutionRows,
  cellGlyph,
  latexToPlain,
  matrixGridColumnLabel,
  operationTagText,
  parametricValue,
  parseCellNumber,
  simplexBasis,
  simplexEnteringColumn,
} from './matrix-grid-display.utils';

type StateMap = Readonly<Record<string, MatrixGridCellState>>;

function grid(
  values: readonly (readonly string[])[],
  options: {
    readonly mode?: MatrixGridTraceState['mode'];
    readonly tone?: MatrixGridTone;
    readonly states?: StateMap;
    readonly rowStates?: Readonly<Record<number, MatrixGridCellState>>;
    readonly operationLabel?: string | null;
    readonly iteration?: number;
  } = {},
): MatrixGridTraceState {
  const cols = values[0].length;
  return {
    mode: options.mode ?? 'gaussian-elimination',
    modeLabel: 'mode',
    phaseLabel: 'phase',
    decisionLabel: null,
    tone: options.tone ?? 'idle',
    rows: values.length,
    cols,
    dividerCol: cols - 1,
    cells: values.flatMap((row, rowIndex) =>
      row.map((value, col) => ({
        id: `r${rowIndex}c${col}`,
        row: rowIndex,
        col,
        value,
        state: options.states?.[`${rowIndex}:${col}`] ?? options.rowStates?.[rowIndex] ?? 'idle',
      })),
    ),
    operationLabel: options.operationLabel ?? null,
    resultLabel: null,
    iteration: options.iteration ?? 0,
  };
}

describe('matrix grid value helpers', () => {
  it('parses integers, fractions and decimals', () => {
    expect(parseCellNumber('-3')).toBe(-3);
    expect(parseCellNumber('1/2')).toBe(0.5);
    expect(parseCellNumber('-7/4')).toBe(-1.75);
    expect(parseCellNumber('0.333')).toBeCloseTo(0.333);
    expect(parseCellNumber('')).toBeNull();
    expect(parseCellNumber('1/0')).toBeNull();
  });

  it('keeps short integers in Doto and moves fractions and long values to mono', () => {
    expect(cellGlyph('12')).toBe('dot');
    expect(cellGlyph('-120')).toBe('dot');
    expect(cellGlyph('12345')).toBe('mono');
    expect(cellGlyph('1/2')).toBe('mono');
    expect(cellGlyph('-0.333')).toBe('mono-long');
  });

  it('turns row-operation LaTeX into plain text', () => {
    expect(latexToPlain('[[math]]R_2 \\leftarrow R_2 - 3R_1[[/math]]')).toBe('R₂ ← R₂ − 3·R₁');
    expect(latexToPlain('R_1 \\leftrightarrow R_3')).toBe('R₁ ↔ R₃');
    expect(latexToPlain('R_2 \\leftarrow R_2 / (-1/2)')).toBe('R₂ ← R₂ / (−1/2)');
    expect(operationTagText('[[math]]R_3 \\leftarrow R_3 + 2R_1[[/math]]')).toBe('R₃ + 2·R₁');
  });

  it('names gaussian and simplex columns', () => {
    const gaussian = grid([
      ['1', '2', '3'],
      ['4', '5', '6'],
    ]);
    expect(matrixGridColumnLabel(gaussian, 0)).toBe('x');
    expect(matrixGridColumnLabel(gaussian, 1)).toBe('y');
    expect(matrixGridColumnLabel(gaussian, 2)).toBe('b');
    const simplex = grid(
      [
        ['1', '1', '1', '0', '4'],
        ['2', '1', '0', '1', '6'],
        ['-3', '-2', '0', '0', '0'],
      ],
      { mode: 'simplex' },
    );
    expect(matrixGridColumnLabel(simplex, 1)).toBe('y');
    expect(matrixGridColumnLabel(simplex, 2)).toBe('s₁');
    expect(matrixGridColumnLabel(simplex, 3)).toBe('s₂');
  });
});

describe('buildMatrixGridTable — gaussian', () => {
  it('marks the pivot violet, the source row cyan, the target row pink and the eliminated zero lime', () => {
    const state = grid(
      [
        ['1', '1', '5'],
        ['0', '-2', '-4'],
      ],
      { tone: 'eliminate', rowStates: { 0: 'pivot-row', 1: 'eliminating' }, operationLabel: '[[math]]R_2 \\leftarrow R_2 - R_1[[/math]]' },
    );
    const table = buildMatrixGridTable(state);
    expect(table.pivot).toEqual({ row: 0, col: 0 });
    expect(table.rows[0].cells[0]).toMatchObject({ tone: 'violet', pivot: true, strong: true });
    expect(table.rows[0].cells[1].tone).toBe('cyan');
    expect(table.rows[0].tone).toBe('cyan');
    expect(table.rows[1].tone).toBe('pink');
    expect(table.rows[1].cells[0].tone).toBe('zero');
    expect(table.rows[1].cells[1]).toMatchObject({ tone: 'pink', strong: false });
    expect(table.rows[1].tag).toEqual({ kind: 'operation', text: 'R₂ − R₁', tone: 'pink' });
    expect(table.columns[0].active).toBe(true);
    expect(table.columns[2].rhs).toBe(true);
    expect(table.symbol).toBe('[A|b]');
    expect(table.size).toBe('2 × 3');
  });

  it('treats a lone pivot row as a scaled row being modified', () => {
    const state = grid(
      [
        ['1', '1/2', '2'],
        ['3', '4', '5'],
      ],
      { tone: 'pivot', rowStates: { 0: 'pivot-row' } },
    );
    const table = buildMatrixGridTable(state);
    expect(table.pivot).toEqual({ row: 0, col: 0 });
    expect(table.rows[0].tone).toBe('pink');
    expect(table.rows[0].cells[1].tone).toBe('pink');
  });

  it('paints both swapped rows pink without a pivot', () => {
    const state = grid(
      [
        ['2', '1', '3'],
        ['0', '1', '1'],
      ],
      { tone: 'pivot', rowStates: { 0: 'pivot-row', 1: 'pivot-row' } },
    );
    const table = buildMatrixGridTable(state);
    expect(table.pivot).toBeNull();
    expect(table.rows.map((row) => row.tone)).toEqual(['pink', 'pink']);
  });

  it('lights the solution column lime when complete and the contradiction row red on failure', () => {
    const solved = buildMatrixGridTable(
      grid(
        [
          ['1', '0', '2'],
          ['0', '1', '3'],
        ],
        { tone: 'complete' },
      ),
    );
    expect(solved.rows.map((row) => row.cells[2].tone)).toEqual(['lime', 'lime']);
    expect(solved.rows[0].cells[1].tone).toBe('zero');

    const failed = buildMatrixGridTable(
      grid(
        [
          ['1', '1', '2'],
          ['0', '0', '1'],
        ],
        { tone: 'fail' },
      ),
    );
    expect(failed.rows[1].tone).toBe('red');
    expect(failed.rows[1].cells.map((cell) => cell.tone)).toEqual(['red', 'red', 'red']);
    expect(failed.rows[1].cells[2].strong).toBe(true);
    expect(failed.rows[1].cells[0].strong).toBe(false);
  });
});

describe('buildMatrixGridTable — simplex', () => {
  const values = [
    ['1', '1', '1', '0', '12'],
    ['2', '1', '0', '1', '16'],
    ['-40', '-30', '0', '0', '0'],
  ];

  it('derives the entering column and the ratio tag while the generator has not marked it yet', () => {
    const state = grid(values, { mode: 'simplex', tone: 'eliminate', rowStates: { 1: 'eliminating' } });
    expect(simplexEnteringColumn(state)).toBe(0);
    const table = buildMatrixGridTable(state);
    expect(table.columns[0].active).toBe(true);
    expect(table.rows[1].cells[0]).toMatchObject({ tone: 'cyan', strong: true });
    expect(table.rows[1].cells[4].tone).toBe('cyan');
    expect(table.rows[1].tag).toEqual({ kind: 'ratio', text: '16 / 2 = 8', tone: 'cyan' });
    expect(table.rows[0].cells[0].band).toBe(true);
    expect(table.rows[2].objective).toBe(true);
    expect(table.rows[2].label).toBe('z');
    expect(table.rows[0].sub).toBe('s₁');
  });

  it('marks the objective candidate cyan during column selection', () => {
    const state = grid(values, { mode: 'simplex', tone: 'compute', rowStates: { 2: 'pivot-row' } });
    const table = buildMatrixGridTable(state);
    expect(table.rows[2].cells[0].tone).toBe('cyan');
    expect(table.rows[2].tone).toBe('cyan');
  });

  it('rings the real pivot and bands its row and column', () => {
    const state = grid(values, {
      mode: 'simplex',
      tone: 'pivot',
      states: { '1:0': 'pivot', '0:0': 'pivot-col', '2:0': 'pivot-col' },
      rowStates: { 1: 'pivot-row' },
    });
    const table = buildMatrixGridTable(state);
    expect(table.pivot).toEqual({ row: 1, col: 0 });
    expect(table.rows[1].cells[0].tone).toBe('violet');
    expect(table.rows[1].cells[2].band).toBe(true);
    expect(table.rows[0].cells[0].band).toBe(true);
    expect(table.rows[1].tone).toBe('violet');
  });

  it('flags a skipped ratio when the coefficient is not positive', () => {
    const state = grid(
      [
        ['-1', '1', '1', '0', '2'],
        ['0', '1', '0', '1', '3'],
        ['-1', '-1', '0', '0', '0'],
      ],
      { mode: 'simplex', tone: 'eliminate', rowStates: { 0: 'eliminating' } },
    );
    expect(buildMatrixGridTable(state).rows[0].tag).toEqual({ kind: 'skip', text: '-1 ≤ 0', tone: 'cyan' });
  });

  it('marks the unbounded column red on failure', () => {
    const state = grid(
      [
        ['-1', '1', '1', '0', '2'],
        ['0', '1', '0', '1', '3'],
        ['-2', '-1', '0', '0', '0'],
      ],
      { mode: 'simplex', tone: 'fail' },
    );
    const table = buildMatrixGridTable(state);
    expect(table.rows[0].cells[0].tone).toBe('red');
    expect(table.rows[2].cells[0].tone).toBe('idle');
  });
});

describe('buildOperationHistory', () => {
  it('lists gaussian row operations newest first and skips the matrix snapshots', () => {
    const base = [
      ['1', '1', '5'],
      ['1', '-1', '1'],
    ];
    const trail = [
      grid(base, { operationLabel: null }),
      grid(base, { tone: 'eliminate', operationLabel: '[[math]]R_2 \\leftarrow R_2 - R_1[[/math]]' }),
      grid(base, { tone: 'eliminate', operationLabel: '[[math]]\\left[\\begin{array}{cc|c} 1 \\end{array}\\right][[/math]]' }),
      grid(base, { tone: 'pivot', operationLabel: '[[math]]R_2 \\leftarrow R_2 / (-2)[[/math]]' }),
    ];
    const history = buildOperationHistory(trail);
    expect(history.map((entry) => entry.text)).toEqual(['R₂ ← R₂ / (−2)', 'R₂ ← R₂ − R₁']);
    expect(history.map((entry) => entry.tone)).toEqual(['head', 'default']);
    expect(history[0].order).toBe('02');
  });

  it('drops the head when the step is no longer an operation', () => {
    const base = [['1', '2']];
    const history = buildOperationHistory([
      grid(base, { tone: 'eliminate', operationLabel: 'R_1 \\leftarrow R_1 / 2' }),
      grid(base, { tone: 'complete' }),
    ]);
    expect(history[0].tone).toBe('default');
  });

  it('records simplex pivots with entering and leaving variables and a pending selection', () => {
    const values = [
      ['1', '1', '1', '0', '12'],
      ['2', '1', '0', '1', '16'],
      ['-40', '-30', '0', '0', '0'],
    ];
    const selecting = grid(values, { mode: 'simplex', tone: 'compute', rowStates: { 2: 'pivot-row' } });
    expect(buildOperationHistory([selecting])).toEqual([
      expect.objectContaining({ kind: 'pending', entering: 'x', tone: 'head' }),
    ]);
    const leaving = grid(values, {
      mode: 'simplex',
      tone: 'pivot',
      states: { '1:0': 'pivot', '0:0': 'pivot-col', '2:0': 'pivot-col' },
      rowStates: { 1: 'pivot-row' },
    });
    const history = buildOperationHistory([selecting, leaving]);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ kind: 'pivot', entering: 'x', leaving: 's₂', value: '2', tone: 'head' });
  });
});

describe('buildSolutionRows', () => {
  it('reads unique gaussian solutions only once complete', () => {
    const values = [
      ['1', '0', '2'],
      ['0', '1', '3'],
    ];
    expect(buildSolutionRows(grid(values, { tone: 'eliminate' }))).toEqual([]);
    const rows = buildSolutionRows(grid(values, { tone: 'complete' }));
    expect(rows.map((row) => [row.label, row.value, row.tone])).toEqual([
      ['x', '2', 'done'],
      ['y', '3', 'done'],
    ]);
  });

  it('expresses dependent variables through free ones', () => {
    const state = grid(
      [
        ['1', '0', '1/2', '3'],
        ['0', '1', '-1', '0'],
        ['0', '0', '0', '0'],
      ],
      { tone: 'complete' },
    );
    expect(parametricValue(state, 0, 0)).toBe('3 − 1/2·z');
    expect(parametricValue(state, 1, 1)).toBe('z');
    const rows = buildSolutionRows(state);
    expect(rows[2]).toMatchObject({ kind: 'free', label: 'z' });
  });

  it('reports an inconsistent system', () => {
    const rows = buildSolutionRows(grid([['0', '0', '1']], { tone: 'fail' }));
    expect(rows).toEqual([expect.objectContaining({ kind: 'none' })]);
  });

  it('reads the simplex basis and objective', () => {
    const state = grid(
      [
        ['0', '1', '2', '-1', '8'],
        ['1', '0', '-1', '1', '4'],
        ['0', '0', '20', '10', '400'],
      ],
      { mode: 'simplex', tone: 'complete' },
    );
    expect(simplexBasis(state)).toEqual([1, 0]);
    expect(buildSolutionRows(state).map((row) => [row.label, row.value, row.tone])).toEqual([
      ['y', '8', 'done'],
      ['x', '4', 'done'],
      ['z', '400', 'done'],
    ]);
  });
});

describe('buildMatrixGridFacts', () => {
  it('summarises pivot, operation and rows', () => {
    const state = grid(
      [
        ['1', '1', '5'],
        ['0', '-2', '-4'],
      ],
      { tone: 'eliminate', rowStates: { 0: 'pivot-row', 1: 'eliminating' }, operationLabel: 'R_2 \\leftarrow R_2 - R_1' },
    );
    const facts = buildMatrixGridFacts(state, buildMatrixGridTable(state));
    expect(facts).toEqual({
      pivot: 'R₁ · x',
      pivotValue: '1',
      operation: 'R₂ ← R₂ − R₁',
      sources: 'R₁',
      targets: 'R₂',
      entering: null,
    });
  });
});
