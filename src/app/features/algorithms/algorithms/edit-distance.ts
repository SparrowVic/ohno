import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { EditDistanceScenario } from '../utils/dp-scenarios';

export function* editDistanceGenerator(scenario: EditDistanceScenario): Generator<SortStep> {
  const source = scenario.source.split('');
  const target = scenario.target.split('');
  const rows = source.length + 1;
  const cols = target.length + 1;
  const table = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
  const backtrackCells = new Set<string>();
  const operations: string[] = [];

  for (let row = 0; row < rows; row++) {
    table[row]![0] = row;
  }
  for (let col = 0; col < cols; col++) {
    table[0]![col] = col;
  }

  yield createStep({
    scenario,
    source,
    target,
    table,
    backtrackCells,
    operations,
    description: 'Seed the top row and left column with insert/delete counts.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize borders',
    phase: 'init',
  });

  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      const leftChar = source[row - 1]!;
      const rightChar = target[col - 1]!;
      const replaceCost = table[row - 1]![col - 1]! + (leftChar === rightChar ? 0 : 1);
      const deleteCost = table[row - 1]![col]! + 1;
      const insertCost = table[row]![col - 1]! + 1;

      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        operations,
        activeCell: [row, col],
        candidateCells: [[row - 1, col - 1], [row - 1, col], [row, col - 1]],
        secondaryItems: [`replace = ${replaceCost}`, `delete = ${deleteCost}`, `insert = ${insertCost}`],
        description: `Compare replace, delete and insert costs for ${leftChar} → ${rightChar}.`,
        activeCodeLine: 5,
        phaseLabel: 'Compare edit operations',
        phase: 'compare',
        computation: {
          label: `${leftChar} → ${rightChar}`,
          expression: `min(diag ${replaceCost}, up ${deleteCost}, left ${insertCost})`,
          result: String(Math.min(replaceCost, deleteCost, insertCost)),
          decision: leftChar === rightChar ? 'carry diagonal match when possible' : 'choose cheapest edit',
        },
      });

      table[row]![col] = Math.min(replaceCost, deleteCost, insertCost);
      const status = leftChar === rightChar ? 'match' : 'chosen';

      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        operations,
        activeCell: [row, col],
        candidateCells: [[row - 1, col - 1], [row - 1, col], [row, col - 1]],
        activeCellStatus: status,
        description: `Write dp[${row}][${col}] = ${table[row]![col]!}.`,
        activeCodeLine: 8,
        phaseLabel: 'Commit edit distance',
        phase: 'settle-node',
        computation: {
          label: `dp[${row}][${col}]`,
          expression: `${replaceCost}, ${deleteCost}, ${insertCost}`,
          result: String(table[row]![col]!),
          decision: leftChar === rightChar ? 'free diagonal carry' : 'minimum edit stored',
        },
      });
    }
  }

  let row = source.length;
  let col = target.length;
  while (row > 0 || col > 0) {
    backtrackCells.add(dpCellId(row, col));

    const canUseDiagonal = row > 0 && col > 0;
    const diagonalCost = canUseDiagonal ? table[row - 1]![col - 1]! + (source[row - 1] === target[col - 1] ? 0 : 1) : Number.POSITIVE_INFINITY;
    const deleteCost = row > 0 ? table[row - 1]![col]! + 1 : Number.POSITIVE_INFINITY;
    const insertCost = col > 0 ? table[row]![col - 1]! + 1 : Number.POSITIVE_INFINITY;
    const current = table[row]![col]!;

    if (canUseDiagonal && current === diagonalCost) {
      const leftChar = source[row - 1]!;
      const rightChar = target[col - 1]!;
      const operation = leftChar === rightChar ? `keep ${leftChar}` : `replace ${leftChar}→${rightChar}`;
      operations.unshift(operation);

      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        operations,
        activeCell: [row, col],
        activeCellStatus: 'backtrack',
        pathLabel: operations.join(' • '),
        description: leftChar === rightChar
          ? `${leftChar} already matches ${rightChar}, so move diagonally without cost.`
          : `Best path replaces ${leftChar} with ${rightChar}, then moves diagonally.`,
        activeCodeLine: 11,
        phaseLabel: leftChar === rightChar ? 'Backtrack carry' : 'Backtrack replace',
        phase: 'relax',
        computation: {
          label: operation,
          expression: `diag = ${diagonalCost}`,
          result: `(${row - 1}, ${col - 1})`,
          decision: leftChar === rightChar ? 'carry match' : 'replace and continue',
        },
      });
      row -= 1;
      col -= 1;
      continue;
    }

    if (row > 0 && current === deleteCost) {
      operations.unshift(`delete ${source[row - 1]!}`);
      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        operations,
        activeCell: [row, col],
        activeCellStatus: 'backtrack',
        pathLabel: operations.join(' • '),
        description: `Deleting ${source[row - 1]!} gives the optimal predecessor.`,
        activeCodeLine: 13,
        phaseLabel: 'Backtrack delete',
        phase: 'skip-relax',
        computation: {
          label: `delete ${source[row - 1]!}`,
          expression: `up = ${deleteCost}`,
          result: `(${row - 1}, ${col})`,
          decision: 'move upward',
        },
      });
      row -= 1;
      continue;
    }

    operations.unshift(`insert ${target[col - 1]!}`);
    yield createStep({
      scenario,
      source,
      target,
      table,
      backtrackCells,
      operations,
      activeCell: [row, col],
      activeCellStatus: 'backtrack',
      pathLabel: operations.join(' • '),
      description: `Inserting ${target[col - 1]!} gives the optimal predecessor from the left.`,
      activeCodeLine: 14,
      phaseLabel: 'Backtrack insert',
      phase: 'skip-relax',
      computation: {
        label: `insert ${target[col - 1]!}`,
        expression: `left = ${insertCost}`,
        result: `(${row}, ${col - 1})`,
        decision: 'move left',
      },
    });
    col -= 1;
  }

  yield createStep({
    scenario,
    source,
    target,
    table,
    backtrackCells,
    operations,
    pathLabel: operations.join(' • ') || 'no edits',
    description: `Edit distance is ${table[source.length]![target.length]!} with operations: ${operations.join(', ') || 'none'}.`,
    activeCodeLine: 16,
    phaseLabel: 'Edit script ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: EditDistanceScenario;
  readonly source: readonly string[];
  readonly target: readonly string[];
  readonly table: readonly (readonly number[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly operations: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'chosen' | 'match' | 'backtrack';
  readonly secondaryItems?: readonly string[];
  readonly pathLabel?: string;
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-0', label: '∅', status: 'source', metaLabel: 'del base' },
    ...args.source.map((char, index) => ({
      id: `row-${index + 1}`,
      label: char,
      status: (args.activeCell?.[0] === index + 1 ? 'active' : 'source') as DpHeaderConfig['status'],
      metaLabel: `i${index + 1}`,
    })),
  ];
  const colHeaders: DpHeaderConfig[] = [
    { id: 'col-0', label: '∅', status: 'target', metaLabel: 'ins base' },
    ...args.target.map((char, index) => ({
      id: `col-${index + 1}`,
      label: char,
      status: (args.activeCell?.[1] === index + 1 ? 'active' : 'target') as DpHeaderConfig['status'],
      metaLabel: `j${index + 1}`,
    })),
  ];

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let col = 0; col < args.table[row]!.length; col++) {
      const id = dpCellId(row, col);
      const isBase = row === 0 || col === 0;
      const isBacktrack = args.backtrackCells.has(id);
      const isMatch = row > 0 && col > 0 && args.source[row - 1] === args.target[col - 1];
      const tags: DpTraceTag[] = [];
      if (isBase) tags.push('base');
      if (candidateIds.has(id)) tags.push('best');
      if (id === activeCellId) tags.push('active');
      if (isBacktrack) tags.push('path');
      if (isMatch) tags.push('match');

      const opHint = isBacktrack
        ? 'script'
        : isMatch
          ? 'keep'
          : null;

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '∅' : args.source[row - 1]!,
        colLabel: col === 0 ? '∅' : args.target[col - 1]!,
        valueLabel: String(args.table[row]![col]!),
        metaLabel: opHint,
        status: isBacktrack
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeCellStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : isBase
                ? 'base'
                : isMatch
                  ? 'match'
                  : 'idle',
        tags,
      });
    }
  }

  const insights: DpInsight[] = [
    { label: 'Source', value: args.scenario.source, tone: 'accent' },
    { label: 'Target', value: args.scenario.target, tone: 'info' },
    { label: 'Distance', value: String(args.table[args.source.length]![args.target.length]!), tone: 'success' },
    { label: 'Ops', value: String(args.operations.length), tone: 'warning' },
    { label: 'Grid', value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'edit-distance',
    modeLabel: 'Edit Distance',
    phaseLabel: args.phaseLabel,
    resultLabel: `dist = ${args.table[args.source.length]![args.target.length]!}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? `${labelFor(args, args.activeCell[0], args.activeCell[1])}` : null,
    pathLabel: args.pathLabel ?? (args.operations.length > 0 ? args.operations.join(' • ') : 'edit script pending'),
    primaryItemsLabel: 'Source word',
    primaryItems: args.source.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: 'Target / ops',
    secondaryItems: args.secondaryItems ?? (args.operations.length > 0 ? args.operations : args.target.map((char, index) => `${index + 1}:${char}`)),
    insights,
    rowHeaders,
    colHeaders,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    tableShape: 'full',
    computation: args.computation ?? null,
  });
}

function labelFor(args: { source: readonly string[]; target: readonly string[] }, row: number, col: number): string {
  const left = row === 0 ? '∅' : args.source[row - 1]!;
  const right = col === 0 ? '∅' : args.target[col - 1]!;
  return `${left} → ${right}`;
}
