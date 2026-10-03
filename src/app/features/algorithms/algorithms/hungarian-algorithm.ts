import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../core/i18n/translatable-text';
import { MatrixCellStatus, MatrixComputation, MatrixTraceTag } from '../models/matrix';
import { SortStep } from '../models/sort-step';
import { HungarianScenario } from '../utils/scenarios/matrix/matrix-scenarios';
import { cellId, createMatrixStep } from './matrix-step';

const I18N = {
  phases: {
    initialize: t('features.algorithms.runtime.matrix.hungarian.phases.initialize'),
    rowReduction: t('features.algorithms.runtime.matrix.hungarian.phases.rowReduction'),
    columnReduction: t('features.algorithms.runtime.matrix.hungarian.phases.columnReduction'),
    zeroMatching: t('features.algorithms.runtime.matrix.hungarian.phases.zeroMatching'),
    complete: t('features.algorithms.runtime.matrix.hungarian.phases.complete'),
    coverZeros: t('features.algorithms.runtime.matrix.hungarian.phases.coverZeros'),
    adjustMatrix: t('features.algorithms.runtime.matrix.hungarian.phases.adjustMatrix'),
  },
  statuses: {
    initialize: t('features.algorithms.runtime.matrix.hungarian.statuses.initialize'),
    rowMinimum: t('features.algorithms.runtime.matrix.hungarian.statuses.rowMinimum'),
    rowDone: t('features.algorithms.runtime.matrix.hungarian.statuses.rowDone'),
    columnMinimum: t('features.algorithms.runtime.matrix.hungarian.statuses.columnMinimum'),
    columnDone: t('features.algorithms.runtime.matrix.hungarian.statuses.columnDone'),
    matching: t('features.algorithms.runtime.matrix.hungarian.statuses.matching'),
    perfect: t('features.algorithms.runtime.matrix.hungarian.statuses.perfect'),
    cover: t('features.algorithms.runtime.matrix.hungarian.statuses.cover'),
    smallest: t('features.algorithms.runtime.matrix.hungarian.statuses.smallest'),
    adjusted: t('features.algorithms.runtime.matrix.hungarian.statuses.adjusted'),
  },
  results: {
    matched: t('features.algorithms.runtime.matrix.hungarian.results.matched'),
    totalCost: t('features.algorithms.runtime.matrix.hungarian.results.totalCost'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.matrix.hungarian.descriptions.initialize'),
    rowMinimum: t('features.algorithms.runtime.matrix.hungarian.descriptions.rowMinimum'),
    rowDone: t('features.algorithms.runtime.matrix.hungarian.descriptions.rowDone'),
    columnMinimum: t('features.algorithms.runtime.matrix.hungarian.descriptions.columnMinimum'),
    columnDone: t('features.algorithms.runtime.matrix.hungarian.descriptions.columnDone'),
    matching: t('features.algorithms.runtime.matrix.hungarian.descriptions.matching'),
    complete: t('features.algorithms.runtime.matrix.hungarian.descriptions.complete'),
    cover: t('features.algorithms.runtime.matrix.hungarian.descriptions.cover'),
    smallest: t('features.algorithms.runtime.matrix.hungarian.descriptions.smallest'),
    adjusted: t('features.algorithms.runtime.matrix.hungarian.descriptions.adjusted'),
  },
} as const;

export function* hungarianAlgorithmGenerator(scenario: HungarianScenario): Generator<SortStep> {
  const working = scenario.costs.map((row) => [...row]);
  let iteration = 0;

  yield createStep({
    scenario,
    working,
    phaseLabel: i18nText(I18N.phases.initialize),
    statusLabel: i18nText(I18N.statuses.initialize),
    resultLabel: i18nText(I18N.results.matched, { count: 0 }),
    focusItemsLabel: 'Workers',
    focusItems: scenario.rowLabels,
    secondaryItemsLabel: 'Jobs',
    secondaryItems: scenario.colLabels,
    description: i18nText(I18N.descriptions.initialize),
    activeCodeLine: 2,
    phase: 'init',
  });

  for (let row = 0; row < working.length; row++) {
    const minValue = Math.min(...working[row]!);
    yield createStep({
      scenario,
      working,
      phaseLabel: i18nText(I18N.phases.rowReduction),
      statusLabel: i18nText(I18N.statuses.rowMinimum, { row: scenario.rowLabels[row] }),
      resultLabel: i18nText(I18N.results.matched, { count: 0 }),
      focusItemsLabel: 'Active row',
      focusItems: [scenario.rowLabels[row]!],
      secondaryItemsLabel: 'Reduced rows',
      secondaryItems: scenario.rowLabels.slice(0, row),
      description: i18nText(I18N.descriptions.rowMinimum, { row: scenario.rowLabels[row] }),
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
      phaseLabel: i18nText(I18N.phases.rowReduction),
      statusLabel: i18nText(I18N.statuses.rowDone, { row: scenario.rowLabels[row] }),
      resultLabel: i18nText(I18N.results.matched, { count: 0 }),
      focusItemsLabel: 'Active row',
      focusItems: [scenario.rowLabels[row]!],
      secondaryItemsLabel: 'Reduced rows',
      secondaryItems: scenario.rowLabels.slice(0, row + 1),
      description: i18nText(I18N.descriptions.rowDone, { row: scenario.rowLabels[row] }),
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
      phaseLabel: i18nText(I18N.phases.columnReduction),
      statusLabel: i18nText(I18N.statuses.columnMinimum, { column: scenario.colLabels[col] }),
      resultLabel: i18nText(I18N.results.matched, { count: 0 }),
      focusItemsLabel: 'Active column',
      focusItems: [scenario.colLabels[col]!],
      secondaryItemsLabel: 'Reduced columns',
      secondaryItems: scenario.colLabels.slice(0, col),
      description: i18nText(I18N.descriptions.columnMinimum, { column: scenario.colLabels[col] }),
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
      phaseLabel: i18nText(I18N.phases.columnReduction),
      statusLabel: i18nText(I18N.statuses.columnDone, { column: scenario.colLabels[col] }),
      resultLabel: i18nText(I18N.results.matched, { count: 0 }),
      focusItemsLabel: 'Active column',
      focusItems: [scenario.colLabels[col]!],
      secondaryItemsLabel: 'Reduced columns',
      secondaryItems: scenario.colLabels.slice(0, col + 1),
      description: i18nText(I18N.descriptions.columnDone, { column: scenario.colLabels[col] }),
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
      phaseLabel: i18nText(I18N.phases.zeroMatching, { round: iteration }),
      statusLabel: i18nText(I18N.statuses.matching, { size: matchedCount }),
      resultLabel: i18nText(I18N.results.matched, { count: matchedCount }),
      focusItemsLabel: 'Current matches',
      focusItems: pairLabels(scenario, matching),
      secondaryItemsLabel: 'Zeros',
      secondaryItems: zeroLocations(scenario, zeroMap).slice(0, 8),
      description: i18nText(I18N.descriptions.matching),
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
        phaseLabel: i18nText(I18N.phases.complete),
        statusLabel: i18nText(I18N.statuses.perfect, { size: matchedCount }),
        resultLabel: i18nText(I18N.results.totalCost, { cost: totalCost }),
        focusItemsLabel: 'Optimal pairs',
        focusItems: pairLabels(scenario, matching),
        secondaryItemsLabel: 'Why it works',
        secondaryItems: ['Perfect zero matching on the reduced matrix corresponds to the minimum original cost'],
        description: i18nText(I18N.descriptions.complete),
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
      phaseLabel: i18nText(I18N.phases.coverZeros, { round: iteration }),
      statusLabel: i18nText(I18N.statuses.cover, { lines: cover.coveredRows.size + cover.coveredCols.size }),
      resultLabel: i18nText(I18N.results.matched, { count: matchedCount }),
      focusItemsLabel: 'Covered rows',
      focusItems: [...cover.coveredRows].map((row) => scenario.rowLabels[row]!),
      secondaryItemsLabel: 'Covered columns',
      secondaryItems: [...cover.coveredCols].map((col) => scenario.colLabels[col]!),
      description: i18nText(I18N.descriptions.cover),
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
      phaseLabel: i18nText(I18N.phases.adjustMatrix, { round: iteration }),
      statusLabel: i18nText(I18N.statuses.smallest, { value: minUncovered }),
      resultLabel: i18nText(I18N.results.matched, { count: matchedCount }),
      focusItemsLabel: 'Covered rows',
      focusItems: [...cover.coveredRows].map((row) => scenario.rowLabels[row]!),
      secondaryItemsLabel: 'Covered columns',
      secondaryItems: [...cover.coveredCols].map((col) => scenario.colLabels[col]!),
      description: i18nText(I18N.descriptions.smallest),
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
      phaseLabel: i18nText(I18N.phases.adjustMatrix, { round: iteration }),
      statusLabel: i18nText(I18N.statuses.adjusted),
      resultLabel: i18nText(I18N.results.matched, { count: matchedCount }),
      focusItemsLabel: 'Current matches',
      focusItems: pairLabels(scenario, matching),
      secondaryItemsLabel: 'Next step',
      secondaryItems: ['Rebuild zero matching on the adjusted matrix'],
      description: i18nText(I18N.descriptions.adjusted),
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
  readonly phaseLabel: TranslatableText;
  readonly statusLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly focusItemsLabel: string;
  readonly focusItems: readonly string[];
  readonly secondaryItemsLabel: string;
  readonly secondaryItems: readonly string[];
  readonly description: TranslatableText;
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
