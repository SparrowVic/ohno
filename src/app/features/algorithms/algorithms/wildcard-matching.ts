import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { WildcardMatchingScenario } from '../utils/dp-scenarios';

export function* wildcardMatchingGenerator(scenario: WildcardMatchingScenario): Generator<SortStep> {
  const text = scenario.source.split('');
  const pattern = scenario.target.split('');
  const rows = text.length + 1;
  const cols = pattern.length + 1;
  const table = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
  table[0]![0] = true;
  const backtrackCells = new Set<string>();
  const routeTokens: string[] = [];

  yield createStep({
    scenario,
    text,
    pattern,
    table,
    backtrackCells,
    routeTokens,
    description: 'Seed dp[0][0] = true and prepare the first row for leading wildcard stars.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize wildcard border',
    phase: 'init',
  });

  for (let col = 1; col < cols; col++) {
    if (pattern[col - 1] !== '*') break;
    table[0]![col] = table[0]![col - 1]!;
    yield createStep({
      scenario,
      text,
      pattern,
      table,
      backtrackCells,
      routeTokens,
      activeCell: [0, col],
      candidateCells: [[0, col - 1]],
      activeCellStatus: table[0]![col]! ? 'chosen' : 'blocked',
      secondaryItems: ['leading star can match empty prefix'],
      description: `Leading '*' keeps the empty text prefix matchable through pattern column ${col}.`,
      activeCodeLine: 2,
      phaseLabel: 'Propagate leading star',
      phase: 'settle-node',
      computation: {
        label: `dp[0][${col}]`,
        expression: `dp[0][${col - 1}]`,
        result: boolLabel(table[0]![col]!),
        decision: table[0]![col]! ? 'star spans empty prefix' : 'prefix stops matching',
      },
    });
  }

  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      const char = text[row - 1]!;
      const token = pattern[col - 1]!;

      if (token === '*') {
        const emptyMatch = table[row]![col - 1]!;
        const consumeMatch = table[row - 1]![col]!;

        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          candidateCells: [[row, col - 1], [row - 1, col]],
          secondaryItems: [`empty = ${boolLabel(emptyMatch)}`, `consume = ${boolLabel(consumeMatch)}`],
          description: `Star at pattern column ${col} can either absorb ${char} or stay empty.`,
          activeCodeLine: 5,
          phaseLabel: 'Inspect star transition',
          phase: 'compare',
          computation: {
            label: `* vs ${char}`,
            expression: `dp[${row}][${col - 1}] OR dp[${row - 1}][${col}]`,
            result: boolLabel(emptyMatch || consumeMatch),
            decision: consumeMatch && !emptyMatch ? 'star must consume one more character' : emptyMatch ? 'star can stay empty' : 'state remains false',
          },
        });

        table[row]![col] = emptyMatch || consumeMatch;

        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          candidateCells: [[row, col - 1], [row - 1, col]],
          activeCellStatus: table[row]![col]! ? (consumeMatch && !emptyMatch ? 'improved' : 'chosen') : 'blocked',
          description: `Commit whether star keeps the prefix match alive at dp[${row}][${col}].`,
          activeCodeLine: 6,
          phaseLabel: 'Commit star state',
          phase: 'settle-node',
          computation: {
            label: `dp[${row}][${col}]`,
            expression: `${boolLabel(emptyMatch)} | ${boolLabel(consumeMatch)}`,
            result: boolLabel(table[row]![col]!),
            decision: table[row]![col]! ? 'star transition stays reachable' : 'both star branches failed',
          },
        });
        continue;
      }

      const directMatch = token === '?' || token === char;
      const diagonal = table[row - 1]![col - 1]! && directMatch;

      yield createStep({
        scenario,
        text,
        pattern,
        table,
        backtrackCells,
        routeTokens,
        activeCell: [row, col],
        candidateCells: [[row - 1, col - 1]],
        secondaryItems: [token === '?' ? '? wildcard' : `${char} vs ${token}`],
        description: token === '?'
          ? `Question mark matches any single character, so it checks the diagonal predecessor.`
          : `Literal pattern token ${token} only works here if it equals ${char}.`,
        activeCodeLine: 7,
        phaseLabel: 'Inspect direct token',
        phase: 'compare',
        computation: {
          label: `${char} × ${token}`,
          expression: `dp[${row - 1}][${col - 1}] AND match`,
          result: boolLabel(diagonal),
          decision: diagonal ? 'diagonal match survives' : 'literal / ? transition fails',
        },
      });

      table[row]![col] = diagonal;

      yield createStep({
        scenario,
        text,
        pattern,
        table,
        backtrackCells,
        routeTokens,
        activeCell: [row, col],
        candidateCells: [[row - 1, col - 1]],
        activeCellStatus: diagonal ? (directMatch ? 'match' : 'chosen') : 'blocked',
        description: `Commit whether ${token} can cover text position ${row}.`,
        activeCodeLine: 8,
        phaseLabel: 'Commit token state',
        phase: 'settle-node',
        computation: {
          label: `dp[${row}][${col}]`,
          expression: `${boolLabel(table[row - 1]![col - 1]!)} & ${boolLabel(directMatch)}`,
          result: boolLabel(table[row]![col]!),
          decision: table[row]![col]! ? 'diagonal match stored' : 'state blocked',
        },
      });
    }
  }

  const matched = table[text.length]![pattern.length]!;
  if (!matched) {
    yield createStep({
      scenario,
      text,
      pattern,
      table,
      backtrackCells,
      routeTokens,
      description: 'Full text and pattern do not match under wildcard rules.',
      activeCodeLine: 10,
      phaseLabel: 'No full match',
      phase: 'complete',
    });
    return;
  }

  let row = text.length;
  let col = pattern.length;
  while (row > 0 || col > 0) {
    backtrackCells.add(dpCellId(row, col));
    const token = pattern[col - 1];
    const char = text[row - 1];

    if (col > 0 && token === '*') {
      const consume = row > 0 && table[row - 1]![col]!;
      const empty = table[row]![col - 1]!;

      if (consume) {
        routeTokens.unshift(`*→${char}`);
        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          activeCellStatus: 'backtrack',
          description: `Star absorbs character ${char} and stays in the same pattern column.`,
          activeCodeLine: 9,
          phaseLabel: 'Trace star consume',
          phase: 'relax',
          computation: {
            label: `* consumes ${char}`,
            expression: `dp[${row - 1}][${col}]`,
            result: routeLabel(routeTokens),
            decision: 'move upward and keep star active',
          },
        });
        row -= 1;
        continue;
      }

      if (empty) {
        routeTokens.unshift('*→∅');
        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          activeCellStatus: 'backtrack',
          description: 'Star also works as an empty span here, so move left in the pattern.',
          activeCodeLine: 9,
          phaseLabel: 'Trace star empty branch',
          phase: 'skip-relax',
          computation: {
            label: 'Star stays empty',
            expression: `dp[${row}][${col - 1}]`,
            result: routeLabel(routeTokens),
            decision: 'move left past star token',
          },
        });
        col -= 1;
        continue;
      }
    }

    if (row > 0 && col > 0) {
      const directMatch = token === '?' || token === char;
      if (directMatch && table[row - 1]![col - 1]!) {
        routeTokens.unshift(`${token === '?' ? '?' : token}=${char}`);
        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          activeCellStatus: 'backtrack',
          description: `Token ${token} matches ${char}, so move diagonally to the predecessor state.`,
          activeCodeLine: 9,
          phaseLabel: 'Trace diagonal match',
          phase: 'relax',
          computation: {
            label: `${token} matches ${char}`,
            expression: `dp[${row - 1}][${col - 1}]`,
            result: routeLabel(routeTokens),
            decision: 'consume one text char and one pattern token',
          },
        });
        row -= 1;
        col -= 1;
        continue;
      }
    }

    if (col > 0 && table[row]![col - 1]!) {
      col -= 1;
      continue;
    }
    if (row > 0 && col > 0 && table[row - 1]![col - 1]!) {
      row -= 1;
      col -= 1;
      continue;
    }
    break;
  }

  yield createStep({
    scenario,
    text,
    pattern,
    table,
    backtrackCells,
    routeTokens,
    description: `Recovered one valid wildcard route for "${scenario.source}" against "${scenario.target}".`,
    activeCodeLine: 10,
    phaseLabel: 'Wildcard route ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: WildcardMatchingScenario;
  readonly text: readonly string[];
  readonly pattern: readonly string[];
  readonly table: readonly (readonly boolean[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly routeTokens: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'match' | 'improved' | 'chosen' | 'blocked' | 'backtrack';
  readonly secondaryItems?: readonly string[];
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));
  const rowHeaders: DpHeaderConfig[] = [
    { id: 'row-0', label: '∅', status: 'source', metaLabel: 'text' },
    ...args.text.map((char, index) => ({
      id: `row-${index + 1}`,
      label: char,
      status: (args.activeCell?.[0] === index + 1 ? 'active' : 'source') as DpHeaderConfig['status'],
      metaLabel: `i${index + 1}`,
    })),
  ];
  const colHeaders: DpHeaderConfig[] = [
    { id: 'col-0', label: '∅', status: 'target', metaLabel: 'pattern' },
    ...args.pattern.map((char, index) => ({
      id: `col-${index + 1}`,
      label: char,
      status: (args.activeCell?.[1] === index + 1 ? 'active' : 'target') as DpHeaderConfig['status'],
      metaLabel: `p${index + 1}`,
    })),
  ];

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let col = 0; col < args.table[row]!.length; col++) {
      const id = dpCellId(row, col);
      const isBase = row === 0 || col === 0;
      const token = col === 0 ? null : args.pattern[col - 1]!;
      const char = row === 0 ? null : args.text[row - 1]!;
      const diagonalMatch = row > 0 && col > 0 && token !== '*' && (token === '?' || token === char) && args.table[row]![col]!;
      const tags: DpTraceTag[] = [];
      if (isBase) tags.push('base');
      if (diagonalMatch) tags.push('match');
      if (candidateIds.has(id)) tags.push('best');
      if (args.backtrackCells.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');
      if (!args.table[row]![col]! && !isBase && candidateIds.has(id)) tags.push('blocked');

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '∅' : args.text[row - 1]!,
        colLabel: col === 0 ? '∅' : args.pattern[col - 1]!,
        valueLabel: boolLabel(args.table[row]![col]!),
        metaLabel: args.backtrackCells.has(id)
          ? 'route'
          : token === '*'
            ? 'star'
            : token === '?'
              ? 'wild'
              : args.table[row]![col]!
                ? 'match'
                : null,
        status: args.backtrackCells.has(id)
          ? 'backtrack'
          : id === activeCellId
            ? (args.activeCellStatus ?? 'active')
            : candidateIds.has(id)
              ? 'candidate'
              : isBase
                ? 'base'
                : diagonalMatch
                  ? 'match'
                  : args.table[row]![col]!
                    ? 'chosen'
                    : 'blocked',
        tags,
      });
    }
  }

  const matched = args.table[args.text.length]![args.pattern.length]!;
  const insights: DpInsight[] = [
    { label: 'Text', value: String(args.text.length), tone: 'accent' },
    { label: 'Pattern', value: String(args.pattern.length), tone: 'info' },
    { label: 'Stars', value: String(args.pattern.filter((char) => char === '*').length), tone: 'warning' },
    { label: 'Match', value: boolLabel(matched), tone: matched ? 'success' : 'warning' },
    { label: 'Grid', value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'wildcard-matching',
    modeLabel: 'Wildcard Matching',
    phaseLabel: args.phaseLabel,
    resultLabel: `match = ${boolLabel(matched)}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? activeCellLabel(args.text, args.pattern, args.activeCell[0], args.activeCell[1]) : null,
    pathLabel: routeLabel(args.routeTokens),
    primaryItemsLabel: 'Text',
    primaryItems: args.text.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: 'Pattern',
    secondaryItems: args.secondaryItems ?? args.pattern.map((char, index) => `${index + 1}:${char}`),
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

function boolLabel(value: boolean): string {
  return value ? 'T' : 'F';
}

function routeLabel(tokens: readonly string[]): string {
  return tokens.length > 0 ? `Route: ${tokens.join(' · ')}` : 'Route: pending';
}

function activeCellLabel(
  text: readonly string[],
  pattern: readonly string[],
  row: number,
  col: number,
): string {
  const left = row === 0 ? '∅' : text[row - 1]!;
  const right = col === 0 ? '∅' : pattern[col - 1]!;
  return `${left} × ${right}`;
}
