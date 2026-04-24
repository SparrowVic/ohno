import { MatrixCellStatus, MatrixComputation, MatrixTraceTag } from '../models/matrix';
import { SortStep } from '../models/sort-step';
import { HungarianScenario } from '../utils/scenarios/matrix/matrix-scenarios';
import { cellId, createMatrixStep } from './matrix-step';

export function* hungarianAlgorithmGenerator(scenario: HungarianScenario): Generator<SortStep> {
  const working = scenario.costs.map((row) => [...row]);
  let iteration = 0;

  yield createStep({
    scenario,
    working,
    phaseLabel: 'Initialize cost matrix',
    statusLabel: 'Original assignment costs loaded',
    resultLabel: 'matched 0',
    focusItemsLabel: 'Workers',
    focusItems: scenario.rowLabels,
    secondaryItemsLabel: 'Jobs',
    secondaryItems: scenario.colLabels,
    description: 'Start from the original cost matrix before any reductions.',
    activeCodeLine: 2,
    phase: 'init',
  });

  for (let row = 0; row < working.length; row++) {
    const minValue = Math.min(...working[row]!);
    yield createStep({
      scenario,
      working,
      phaseLabel: 'Row reduction',
      statusLabel: `Find the minimum in row ${scenario.rowLabels[row]}`,
      resultLabel: 'matched 0',
      focusItemsLabel: 'Active row',
      focusItems: [scenario.rowLabels[row]!],
      secondaryItemsLabel: 'Reduced rows',
      secondaryItems: scenario.rowLabels.slice(0, row),
      description: `Subtract the smallest value in row ${scenario.rowLabels[row]} from every cell in that row.`,
      activeCodeLine: 4,
      activeRow: row,
      computation: {
        label: 'Row minimum',
        expression: working[row]!.join(', '),
        result: String(minValue),
        decision: 'This keeps every assignment difference intact while creating at least one zero in the row.',
      },
    });

    for (let col = 0; col < working[row]!.length; col++) {
      working[row]![col] -= minValue;
    }

    yield createStep({
      scenario,
      working,
      phaseLabel: 'Row reduction',
      statusLabel: `Row ${scenario.rowLabels[row]} normalized`,
      resultLabel: 'matched 0',
      focusItemsLabel: 'Active row',
      focusItems: [scenario.rowLabels[row]!],
      secondaryItemsLabel: 'Reduced rows',
      secondaryItems: scenario.rowLabels.slice(0, row + 1),
      description: `Row ${scenario.rowLabels[row]} now contains a zero and preserves the same optimal assignment structure.`,
      activeCodeLine: 4,
      activeRow: row,
      phase: 'relax',
      cellStatuses: rowStatusMap(row, working[row]!.length, 'adjusted'),
      cellTags: rowTagMap(row, working[row]!.length, ['adjusted']),
      computation: {
        label: 'Subtract minimum',
        expression: `row - ${minValue}`,
        result: `0 created in ${scenario.rowLabels[row]}`,
        decision: 'The matrix is closer to a zero-based assignment search.',
      },
    });
  }

  for (let col = 0; col < working.length; col++) {
    const minValue = Math.min(...working.map((row) => row[col]!));
    yield createStep({
      scenario,
      working,
      phaseLabel: 'Column reduction',
      statusLabel: `Find the minimum in column ${scenario.colLabels[col]}`,
      resultLabel: 'matched 0',
      focusItemsLabel: 'Active column',
      focusItems: [scenario.colLabels[col]!],
      secondaryItemsLabel: 'Reduced columns',
      secondaryItems: scenario.colLabels.slice(0, col),
      description: `Subtract the smallest value in column ${scenario.colLabels[col]} from the entire column.`,
      activeCodeLine: 5,
      activeCol: col,
      computation: {
        label: 'Column minimum',
        expression: working.map((row) => row[col]!).join(', '),
        result: String(minValue),
        decision: 'Now every column also gains at least one zero.',
      },
    });

    for (let row = 0; row < working.length; row++) {
      working[row]![col] -= minValue;
    }

    yield createStep({
      scenario,
      working,
      phaseLabel: 'Column reduction',
      statusLabel: `Column ${scenario.colLabels[col]} normalized`,
      resultLabel: 'matched 0',
      focusItemsLabel: 'Active column',
      focusItems: [scenario.colLabels[col]!],
      secondaryItemsLabel: 'Reduced columns',
      secondaryItems: scenario.colLabels.slice(0, col + 1),
      description: `Column ${scenario.colLabels[col]} now contains a zero while preserving assignment optimality.`,
      activeCodeLine: 5,
      activeCol: col,
      phase: 'relax',
      cellStatuses: colStatusMap(working.length, col, 'adjusted'),
      cellTags: colTagMap(working.length, col, ['adjusted']),
      computation: {
        label: 'Subtract minimum',
        expression: `column - ${minValue}`,
        result: `0 created in ${scenario.colLabels[col]}`,
        decision: 'The zero graph is ready for matching analysis.',
      },
    });
  }

  while (true) {
    iteration += 1;
    const zeroMap = buildZeroMap(working);
    const matching = maximumZeroMatching(zeroMap, working.length);
    const matchedCount = [...matching.values()].filter((value) => value !== null).length;
    const assignmentSet = assignmentCells(matching);

    yield createStep({
      scenario,
      working,
      phaseLabel: `Zero matching ${iteration}`,
      statusLabel: `Maximum zero matching size ${matchedCount}`,
      resultLabel: `matched ${matchedCount}`,
      focusItemsLabel: 'Current matches',
      focusItems: pairLabels(scenario, matching),
      secondaryItemsLabel: 'Zeros',
      secondaryItems: zeroLocations(scenario, zeroMap).slice(0, 8),
      description: 'Build the bipartite zero graph and find the largest set of non-conflicting zero assignments.',
      activeCodeLine: 6,
      assignmentCells: assignmentSet,
      computation: {
        label: 'Zero matching',
        expression: `${matchedCount}/${working.length}`,
        result: matchedCount === working.length ? 'perfect assignment found' : 'need more independent zeros',
        decision: matchedCount === working.length
          ? 'A full zero assignment exists, so the optimal solution can now be read off.'
          : 'The matrix still lacks enough independent zeros.',
      },
    });

    if (matchedCount === working.length) {
      const totalCost = computeAssignmentCost(scenario, matching);
      yield createStep({
        scenario,
        working,
        phaseLabel: 'Optimal assignment ready',
        statusLabel: `Perfect zero matching size ${matchedCount}`,
        resultLabel: `total cost ${totalCost}`,
        focusItemsLabel: 'Optimal pairs',
        focusItems: pairLabels(scenario, matching),
        secondaryItemsLabel: 'Why it works',
        secondaryItems: ['Perfect zero matching on the reduced matrix corresponds to the minimum original cost'],
        description: 'The Hungarian algorithm is complete: every worker is matched to one job at minimum total cost.',
        activeCodeLine: 10,
        phase: 'graph-complete',
        assignmentCells: assignmentSet,
        computation: {
          label: 'Original total',
          expression: pairCostExpression(scenario, matching),
          result: String(totalCost),
          decision: 'Read the assignment from the zero matching, but evaluate it with the original costs.',
        },
      });
      return;
    }

    const cover = minimumVertexCoverFromMatching(zeroMap, matching, working.length);
    yield createStep({
      scenario,
      working,
      phaseLabel: `Cover zeros ${iteration}`,
      statusLabel: `${cover.coveredRows.size + cover.coveredCols.size} line(s) cover all zeros`,
      resultLabel: `matched ${matchedCount}`,
      focusItemsLabel: 'Covered rows',
      focusItems: [...cover.coveredRows].map((row) => scenario.rowLabels[row]!),
      secondaryItemsLabel: 'Covered columns',
      secondaryItems: [...cover.coveredCols].map((col) => scenario.colLabels[col]!),
      description: 'Use the maximum zero matching to derive the minimum set of covering lines via König’s theorem.',
      activeCodeLine: 7,
      coveredRows: cover.coveredRows,
      coveredCols: cover.coveredCols,
      assignmentCells: assignmentSet,
      computation: {
        label: 'Minimum cover',
        expression: `${cover.coveredRows.size} row(s) + ${cover.coveredCols.size} column(s)`,
        result: `${cover.coveredRows.size + cover.coveredCols.size}`,
        decision: 'If these lines are fewer than n, the matrix needs another adjustment.',
      },
    });

    const minUncovered = smallestUncoveredValue(working, cover.coveredRows, cover.coveredCols);
    yield createStep({
      scenario,
      working,
      phaseLabel: `Adjust matrix ${iteration}`,
      statusLabel: `Smallest uncovered value is ${minUncovered}`,
      resultLabel: `matched ${matchedCount}`,
      focusItemsLabel: 'Covered rows',
      focusItems: [...cover.coveredRows].map((row) => scenario.rowLabels[row]!),
      secondaryItemsLabel: 'Covered columns',
      secondaryItems: [...cover.coveredCols].map((col) => scenario.colLabels[col]!),
      description: 'Find the smallest uncovered value before shifting the matrix to create new zeros.',
      activeCodeLine: 8,
      coveredRows: cover.coveredRows,
      coveredCols: cover.coveredCols,
      assignmentCells: assignmentSet,
      computation: {
        label: 'Smallest uncovered',
        expression: 'min(uncovered cells)',
        result: String(minUncovered),
        decision: 'Subtract it from uncovered cells and add it on row-column intersections that are covered twice.',
      },
    });

    const adjustedStatuses = new Map<string, MatrixCellStatus>();
    const adjustedTags = new Map<string, readonly MatrixTraceTag[]>();

    for (let row = 0; row < working.length; row++) {
      for (let col = 0; col < working[row]!.length; col++) {
        const id = cellId(row, col);
        const coveredRow = cover.coveredRows.has(row);
        const coveredCol = cover.coveredCols.has(col);
        if (!coveredRow && !coveredCol) {
          working[row]![col] -= minUncovered;
          adjustedStatuses.set(id, 'adjusted');
          adjustedTags.set(id, ['adjusted']);
        } else if (coveredRow && coveredCol) {
          working[row]![col] += minUncovered;
          adjustedStatuses.set(id, 'candidate');
          adjustedTags.set(id, ['covered', 'adjusted']);
        }
      }
    }

    yield createStep({
      scenario,
      working,
      phaseLabel: `Adjust matrix ${iteration}`,
      statusLabel: 'Matrix shifted to create fresh zeros',
      resultLabel: `matched ${matchedCount}`,
      focusItemsLabel: 'Current matches',
      focusItems: pairLabels(scenario, matching),
      secondaryItemsLabel: 'Next step',
      secondaryItems: ['Rebuild zero matching on the adjusted matrix'],
      description: 'The adjusted matrix preserves optimal assignments while exposing new independent zeros.',
      activeCodeLine: 9,
      phase: 'pass-complete',
      coveredRows: cover.coveredRows,
      coveredCols: cover.coveredCols,
      assignmentCells: assignmentSet,
      cellStatuses: adjustedStatuses,
      cellTags: adjustedTags,
      computation: {
        label: 'Adjustment',
        expression: `uncovered - ${minUncovered}, double-covered + ${minUncovered}`,
        result: 'new zero structure',
        decision: 'Repeat the matching test on the updated zero graph.',
      },
    });
  }
}

function createStep(args: {
  readonly scenario: HungarianScenario;
  readonly working: readonly (readonly number[])[];
  readonly phaseLabel: string;
  readonly statusLabel: string;
  readonly resultLabel: string;
  readonly focusItemsLabel: string;
  readonly focusItems: readonly string[];
  readonly secondaryItemsLabel: string;
  readonly secondaryItems: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phase?: SortStep['phase'];
  readonly activeRow?: number | null;
  readonly activeCol?: number | null;
  readonly coveredRows?: ReadonlySet<number>;
  readonly coveredCols?: ReadonlySet<number>;
  readonly assignmentCells?: ReadonlySet<string>;
  readonly cellStatuses?: ReadonlyMap<string, MatrixCellStatus>;
  readonly cellTags?: ReadonlyMap<string, readonly MatrixTraceTag[]>;
  readonly computation?: MatrixComputation | null;
}): SortStep {
  return createMatrixStep({
    mode: 'hungarian',
    rowLabels: args.scenario.rowLabels,
    colLabels: args.scenario.colLabels,
    values: args.working,
    phaseLabel: args.phaseLabel,
    statusLabel: args.statusLabel,
    resultLabel: args.resultLabel,
    focusItemsLabel: args.focusItemsLabel,
    focusItems: args.focusItems,
    secondaryItemsLabel: args.secondaryItemsLabel,
    secondaryItems: args.secondaryItems,
    description: args.description,
    activeCodeLine: args.activeCodeLine,
    phase: args.phase,
    activeRow: args.activeRow,
    activeCol: args.activeCol,
    coveredRows: args.coveredRows,
    coveredCols: args.coveredCols,
    assignmentCells: args.assignmentCells,
    cellStatuses: args.cellStatuses,
    cellTags: args.cellTags,
    computation: args.computation ?? null,
  });
}

function rowStatusMap(row: number, width: number, status: MatrixCellStatus): ReadonlyMap<string, MatrixCellStatus> {
  const map = new Map<string, MatrixCellStatus>();
  for (let col = 0; col < width; col++) {
    map.set(cellId(row, col), status);
  }
  return map;
}

function colStatusMap(height: number, col: number, status: MatrixCellStatus): ReadonlyMap<string, MatrixCellStatus> {
  const map = new Map<string, MatrixCellStatus>();
  for (let row = 0; row < height; row++) {
    map.set(cellId(row, col), status);
  }
  return map;
}

function rowTagMap(row: number, width: number, tags: readonly MatrixTraceTag[]): ReadonlyMap<string, readonly MatrixTraceTag[]> {
  const map = new Map<string, readonly MatrixTraceTag[]>();
  for (let col = 0; col < width; col++) {
    map.set(cellId(row, col), tags);
  }
  return map;
}

function colTagMap(height: number, col: number, tags: readonly MatrixTraceTag[]): ReadonlyMap<string, readonly MatrixTraceTag[]> {
  const map = new Map<string, readonly MatrixTraceTag[]>();
  for (let row = 0; row < height; row++) {
    map.set(cellId(row, col), tags);
  }
  return map;
}

function buildZeroMap(matrix: readonly (readonly number[])[]): readonly (readonly number[])[] {
  return matrix.map((row) => row.map((value) => (value === 0 ? 1 : 0)));
}

function maximumZeroMatching(zeroMap: readonly (readonly number[])[], size: number): readonly (number | null)[] {
  const matchToRow: (number | null)[] = Array.from({ length: size }, () => null);
  for (let row = 0; row < size; row++) {
    assignZero(row, zeroMap, matchToRow, new Set<number>());
  }
  const rowToCol: (number | null)[] = Array.from({ length: size }, () => null);
  for (let col = 0; col < matchToRow.length; col++) {
    const row = matchToRow[col];
    if (row !== null) {
      rowToCol[row] = col;
    }
  }
  return rowToCol;
}

function assignZero(
  row: number,
  zeroMap: readonly (readonly number[])[],
  matchToRow: (number | null)[],
  seenCols: Set<number>,
): boolean {
  for (let col = 0; col < zeroMap[row]!.length; col++) {
    if (zeroMap[row]![col] !== 1 || seenCols.has(col)) continue;
    seenCols.add(col);
    if (matchToRow[col] === null || assignZero(matchToRow[col]!, zeroMap, matchToRow, seenCols)) {
      matchToRow[col] = row;
      return true;
    }
  }
  return false;
}

function minimumVertexCoverFromMatching(
  zeroMap: readonly (readonly number[])[],
  matching: readonly (number | null)[],
  size: number,
): {
  readonly coveredRows: ReadonlySet<number>;
  readonly coveredCols: ReadonlySet<number>;
} {
  const matchedColsByRow = matching;
  const matchedRowByCol: (number | null)[] = Array.from({ length: size }, () => null);
  for (let row = 0; row < matching.length; row++) {
    const col = matching[row];
    if (col !== null) matchedRowByCol[col] = row;
  }

  const visitedRows = new Set<number>();
  const visitedCols = new Set<number>();
  const stack = matching
    .map((col, row) => ({ row, col }))
    .filter((entry) => entry.col === null)
    .map((entry) => entry.row);

  while (stack.length > 0) {
    const row = stack.pop()!;
    if (visitedRows.has(row)) continue;
    visitedRows.add(row);

    for (let col = 0; col < size; col++) {
      if (zeroMap[row]![col] !== 1 || visitedCols.has(col)) continue;
      if (matchedColsByRow[row] === col) continue;
      visitedCols.add(col);
      const matchedRow = matchedRowByCol[col];
      if (matchedRow !== null && !visitedRows.has(matchedRow)) {
        stack.push(matchedRow);
      }
    }
  }

  const coveredRows = new Set<number>();
  for (let row = 0; row < size; row++) {
    if (!visitedRows.has(row)) coveredRows.add(row);
  }
  return {
    coveredRows,
    coveredCols: visitedCols,
  };
}

function smallestUncoveredValue(
  matrix: readonly (readonly number[])[],
  coveredRows: ReadonlySet<number>,
  coveredCols: ReadonlySet<number>,
): number {
  let min = Number.POSITIVE_INFINITY;
  for (let row = 0; row < matrix.length; row++) {
    if (coveredRows.has(row)) continue;
    for (let col = 0; col < matrix[row]!.length; col++) {
      if (coveredCols.has(col)) continue;
      min = Math.min(min, matrix[row]![col]!);
    }
  }
  return Number.isFinite(min) ? min : 0;
}

function assignmentCells(matching: readonly (number | null)[]): ReadonlySet<string> {
  return new Set(
    matching.flatMap((col, row) => (col === null ? [] : [cellId(row, col)])),
  );
}

function pairLabels(scenario: HungarianScenario, matching: readonly (number | null)[]): readonly string[] {
  return matching.flatMap((col, row) =>
    col === null ? [] : [`${scenario.rowLabels[row]}→${scenario.colLabels[col]} (${scenario.costs[row]![col]})`],
  );
}

function zeroLocations(scenario: HungarianScenario, zeroMap: readonly (readonly number[])[]): readonly string[] {
  const result: string[] = [];
  for (let row = 0; row < zeroMap.length; row++) {
    for (let col = 0; col < zeroMap[row]!.length; col++) {
      if (zeroMap[row]![col] === 1) {
        result.push(`${scenario.rowLabels[row]}→${scenario.colLabels[col]}`);
      }
    }
  }
  return result;
}

function computeAssignmentCost(scenario: HungarianScenario, matching: readonly (number | null)[]): number {
  return matching.reduce<number>(
    (total, col, row) => total + (col === null ? 0 : scenario.costs[row]![col]!),
    0,
  );
}

function pairCostExpression(scenario: HungarianScenario, matching: readonly (number | null)[]): string {
  return matching
    .flatMap((col, row) => (col === null ? [] : [`${scenario.costs[row]![col]!}`]))
    .join(' + ');
}
