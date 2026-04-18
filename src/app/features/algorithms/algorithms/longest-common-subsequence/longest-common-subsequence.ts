import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { LcsScenario } from '../../utils/dp-scenarios/dp-scenarios';

export function* longestCommonSubsequenceGenerator(scenario: LcsScenario): Generator<SortStep> {
  const source = scenario.source.split('');
  const target = scenario.target.split('');
  const rows = source.length + 1;
  const cols = target.length + 1;
  const table = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
  const backtrackCells = new Set<string>();
  const sequence: string[] = [];

  yield createStep({
    scenario,
    source,
    target,
    table,
    backtrackCells,
    sequence,
    description: 'Initialize the LCS table with zeroes on the top row and left column.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize DP borders',
    phase: 'init',
  });

  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      const leftChar = source[row - 1]!;
      const topChar = target[col - 1]!;
      const charsMatch = leftChar === topChar;

      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        sequence,
        activeCell: [row, col],
        candidateCells: charsMatch ? [[row - 1, col - 1]] : [[row - 1, col], [row, col - 1]],
        secondaryItems: charsMatch ? [`match ${leftChar}`] : [`top = ${table[row - 1]![col]!}`, `left = ${table[row]![col - 1]!}`],
        description: `Compare ${leftChar} against ${topChar}.`,
        activeCodeLine: 5,
        phaseLabel: 'Compare characters',
        phase: 'compare',
        computation: {
          label: `${leftChar} × ${topChar}`,
          expression: charsMatch
            ? `dp[${row - 1}][${col - 1}] + 1`
            : `max(dp[${row - 1}][${col}], dp[${row}][${col - 1}])`,
          result: charsMatch
            ? String(table[row - 1]![col - 1]! + 1)
            : String(Math.max(table[row - 1]![col]!, table[row]![col - 1]!)),
          decision: charsMatch ? 'extend common subsequence diagonally' : 'carry larger neighbor',
        },
      });

      table[row]![col] = charsMatch
        ? table[row - 1]![col - 1]! + 1
        : Math.max(table[row - 1]![col]!, table[row]![col - 1]!);

      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        sequence,
        activeCell: [row, col],
        candidateCells: charsMatch ? [[row - 1, col - 1]] : [[row - 1, col], [row, col - 1]],
        activeCellStatus: charsMatch ? 'match' : 'chosen',
        description: `Write dp[${row}][${col}] = ${table[row]![col]!}.`,
        activeCodeLine: charsMatch ? 6 : 8,
        phaseLabel: 'Commit LCS cell',
        phase: 'settle-node',
        computation: {
          label: `dp[${row}][${col}]`,
          expression: charsMatch
            ? `${table[row - 1]![col - 1]!} + 1`
            : `${table[row - 1]![col]!} vs ${table[row]![col - 1]!}`,
          result: String(table[row]![col]!),
          decision: charsMatch ? 'diagonal match stored' : 'best neighbor stored',
        },
      });
    }
  }

  let row = source.length;
  let col = target.length;
  while (row > 0 && col > 0) {
    backtrackCells.add(dpCellId(row, col));
    if (source[row - 1] === target[col - 1]) {
      sequence.unshift(source[row - 1]!);
      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        sequence,
        activeCell: [row, col],
        activeCellStatus: 'backtrack',
        pathLabel: `LCS: ${sequence.join('')}`,
        description: `${source[row - 1]} matches ${target[col - 1]}, so include it and move diagonally.`,
        activeCodeLine: 11,
        phaseLabel: 'Backtrack match',
        phase: 'relax',
        computation: {
          label: `Backtrack ${source[row - 1]}`,
          expression: 'diagonal move',
          result: `(${row - 1}, ${col - 1})`,
          decision: 'character added to LCS',
        },
      });
      row -= 1;
      col -= 1;
      continue;
    }

    if (table[row - 1]![col]! >= table[row]![col - 1]!) {
      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        sequence,
        activeCell: [row, col],
        activeCellStatus: 'backtrack',
        pathLabel: `LCS: ${sequence.join('') || '...'}`,
        description: `Top neighbor is at least as strong, so move upward.`,
        activeCodeLine: 13,
        phaseLabel: 'Backtrack upward',
        phase: 'skip-relax',
        computation: {
          label: 'Backtrack up',
          expression: `${table[row - 1]![col]!} >= ${table[row]![col - 1]!}`,
          result: `(${row - 1}, ${col})`,
          decision: 'follow top branch',
        },
      });
      row -= 1;
    } else {
      yield createStep({
        scenario,
        source,
        target,
        table,
        backtrackCells,
        sequence,
        activeCell: [row, col],
        activeCellStatus: 'backtrack',
        pathLabel: `LCS: ${sequence.join('') || '...'}`,
        description: `Left neighbor is larger, so move left.`,
        activeCodeLine: 14,
        phaseLabel: 'Backtrack left',
        phase: 'skip-relax',
        computation: {
          label: 'Backtrack left',
          expression: `${table[row]![col - 1]!} > ${table[row - 1]![col]!}`,
          result: `(${row}, ${col - 1})`,
          decision: 'follow left branch',
        },
      });
      col -= 1;
    }
  }

  yield createStep({
    scenario,
    source,
    target,
    table,
    backtrackCells,
    sequence,
    pathLabel: `LCS: ${sequence.join('') || '∅'}`,
    description: `Backtracking finishes with longest common subsequence "${sequence.join('') || '∅'}".`,
    activeCodeLine: 16,
    phaseLabel: 'LCS complete',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: LcsScenario;
  readonly source: readonly string[];
  readonly target: readonly string[];
  readonly table: readonly (readonly number[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly sequence: readonly string[];
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
    { id: 'row-0', label: '∅', status: 'source', metaLabel: 'base' },
    ...args.source.map((char, index) => ({
      id: `row-${index + 1}`,
      label: char,
      status: (args.activeCell?.[0] === index + 1 ? 'active' : 'source') as DpHeaderConfig['status'],
      metaLabel: `i${index + 1}`,
    })),
  ];
  const colHeaders: DpHeaderConfig[] = [
    { id: 'col-0', label: '∅', status: 'target', metaLabel: 'base' },
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

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '∅' : args.source[row - 1]!,
        colLabel: col === 0 ? '∅' : args.target[col - 1]!,
        valueLabel: String(args.table[row]![col]!),
        metaLabel: isBacktrack ? 'path' : isMatch ? 'diag' : null,
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
    { label: 'Source', value: String(args.source.length), tone: 'accent' },
    { label: 'Target', value: String(args.target.length), tone: 'info' },
    { label: 'LCS length', value: String(args.table[args.source.length]![args.target.length]!), tone: 'success' },
    { label: 'Path chars', value: String(args.sequence.length), tone: 'warning' },
    { label: 'Grid', value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'longest-common-subsequence',
    modeLabel: 'Longest Common Subsequence',
    phaseLabel: args.phaseLabel,
    resultLabel: `len = ${args.table[args.source.length]![args.target.length]!}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? `${cellsLabel(args, args.activeCell[0], args.activeCell[1])}` : null,
    pathLabel: args.pathLabel ?? `LCS: ${args.sequence.join('') || 'pending'}`,
    primaryItemsLabel: 'Source string',
    primaryItems: args.source.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: 'Target string',
    secondaryItems: args.secondaryItems ?? args.target.map((char, index) => `${index + 1}:${char}`),
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

function cellsLabel(args: { source: readonly string[]; target: readonly string[] }, row: number, col: number): string {
  const left = row === 0 ? '∅' : args.source[row - 1]!;
  const right = col === 0 ? '∅' : args.target[col - 1]!;
  return `${left} × ${right}`;
}
