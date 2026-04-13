import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from './dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../models/dp';
import { SortStep } from '../models/sort-step';
import { RegexMatchingScenario } from '../utils/dp-scenarios';

export function* regexMatchingDpGenerator(scenario: RegexMatchingScenario): Generator<SortStep> {
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
    description: 'Seed dp[0][0] = true and prepare the top row for star groups that can match an empty prefix.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize regex border',
    phase: 'init',
  });

  for (let col = 2; col < cols; col++) {
    if (pattern[col - 1] !== '*') continue;
    table[0]![col] = table[0]![col - 2]!;

    yield createStep({
      scenario,
      text,
      pattern,
      table,
      backtrackCells,
      routeTokens,
      activeCell: [0, col],
      candidateCells: [[0, col - 2]],
      activeCellStatus: table[0]![col]! ? 'chosen' : 'blocked',
      description: `Regex star group ${pattern[col - 2]}* may skip itself and keep the empty prefix matched.`,
      activeCodeLine: 2,
      phaseLabel: 'Propagate empty star group',
      phase: 'settle-node',
      computation: {
        label: `dp[0][${col}]`,
        expression: `dp[0][${col - 2}]`,
        result: boolLabel(table[0]![col]!),
        decision: table[0]![col]! ? 'zero occurrences accepted' : 'empty prefix still blocked',
      },
    });
  }

  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      const token = pattern[col - 1]!;
      const char = text[row - 1]!;

      if (token === '*') {
        const prevToken = pattern[col - 2] ?? '';
        const zeroOccurrences = col >= 2 ? table[row]![col - 2]! : false;
        const consumeOne = col >= 2 && matchesRegexToken(prevToken, char) && table[row - 1]![col]!;

        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          candidateCells: [
            ...(col >= 2 ? ([[row, col - 2]] as const) : []),
            ...(col >= 2 ? ([[row - 1, col]] as const) : []),
          ],
          description: `Star after ${prevToken} can either vanish or absorb another ${char}.`,
          activeCodeLine: 5,
          phaseLabel: 'Inspect star group',
          phase: 'compare',
          computation: {
            label: `${prevToken}* vs ${char}`,
            expression: `${boolLabel(zeroOccurrences)} OR ${boolLabel(consumeOne)}`,
            result: boolLabel(zeroOccurrences || consumeOne),
            decision: consumeOne && !zeroOccurrences ? 'star must consume more text' : zeroOccurrences ? 'group can stay empty' : 'both star branches fail',
          },
        });

        table[row]![col] = zeroOccurrences || consumeOne;

        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          candidateCells: [
            ...(col >= 2 ? ([[row, col - 2]] as const) : []),
            ...(col >= 2 ? ([[row - 1, col]] as const) : []),
          ],
          activeCellStatus: table[row]![col]! ? (consumeOne && !zeroOccurrences ? 'improved' : 'chosen') : 'blocked',
          description: `Commit whether regex star group keeps the prefix match alive.`,
          activeCodeLine: 6,
          phaseLabel: 'Commit star state',
          phase: 'settle-node',
          computation: {
            label: `dp[${row}][${col}]`,
            expression: `${boolLabel(zeroOccurrences)} | ${boolLabel(consumeOne)}`,
            result: boolLabel(table[row]![col]!),
            decision: table[row]![col]! ? 'regex prefix stays valid' : 'state blocked',
          },
        });
        continue;
      }

      const diagonal = table[row - 1]![col - 1]! && matchesRegexToken(token, char);

      yield createStep({
        scenario,
        text,
        pattern,
        table,
        backtrackCells,
        routeTokens,
        activeCell: [row, col],
        candidateCells: [[row - 1, col - 1]],
        description: token === '.'
          ? `Dot wildcard matches any single character, so only the diagonal predecessor matters.`
          : `Literal token ${token} only works if it matches ${char}.`,
        activeCodeLine: 7,
        phaseLabel: 'Inspect direct token',
        phase: 'compare',
        computation: {
          label: `${token} vs ${char}`,
          expression: `dp[${row - 1}][${col - 1}] AND match`,
          result: boolLabel(diagonal),
          decision: diagonal ? 'diagonal regex match survives' : 'literal / dot branch fails',
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
        activeCellStatus: diagonal ? 'match' : 'blocked',
        description: `Commit whether token ${token} covers text character ${char}.`,
        activeCodeLine: 8,
        phaseLabel: 'Commit direct token',
        phase: 'settle-node',
        computation: {
          label: `dp[${row}][${col}]`,
          expression: `${boolLabel(table[row - 1]![col - 1]!)} & ${boolLabel(matchesRegexToken(token, char))}`,
          result: boolLabel(table[row]![col]!),
          decision: table[row]![col]! ? 'token matched diagonally' : 'state blocked',
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
      description: 'The full text does not satisfy the regex pattern.',
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
      const prevToken = pattern[col - 2] ?? '';
      const zeroOccurrences = col >= 2 && table[row]![col - 2]!;
      const consumeOne = row > 0 && col >= 2 && matchesRegexToken(prevToken, char!) && table[row - 1]![col]!;

      if (consumeOne) {
        routeTokens.unshift(`${prevToken}*→${char}`);
        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          activeCellStatus: 'backtrack',
          description: `Regex group ${prevToken}* consumes ${char} and stays active for more characters.`,
          activeCodeLine: 9,
          phaseLabel: 'Trace star consume',
          phase: 'relax',
          computation: {
            label: `${prevToken}*`,
            expression: `consume ${char}`,
            result: routeLabel(routeTokens),
            decision: 'move upward and keep star column',
          },
        });
        row -= 1;
        continue;
      }

      if (zeroOccurrences) {
        routeTokens.unshift(`${prevToken}*→∅`);
        yield createStep({
          scenario,
          text,
          pattern,
          table,
          backtrackCells,
          routeTokens,
          activeCell: [row, col],
          activeCellStatus: 'backtrack',
          description: `Regex group ${prevToken}* collapses to zero occurrences here.`,
          activeCodeLine: 9,
          phaseLabel: 'Trace empty star group',
          phase: 'skip-relax',
          computation: {
            label: `${prevToken}*`,
            expression: 'zero occurrences',
            result: routeLabel(routeTokens),
            decision: 'jump left by two pattern columns',
          },
        });
        col -= 2;
        continue;
      }
    }

    if (row > 0 && col > 0 && table[row - 1]![col - 1]! && matchesRegexToken(token!, char!)) {
      routeTokens.unshift(`${token === '.' ? '.' : token}=${char}`);
      yield createStep({
        scenario,
        text,
        pattern,
        table,
        backtrackCells,
        routeTokens,
        activeCell: [row, col],
        activeCellStatus: 'backtrack',
        description: `Token ${token} matches ${char}, so trace diagonally to the previous prefix state.`,
        activeCodeLine: 9,
        phaseLabel: 'Trace direct match',
        phase: 'relax',
        computation: {
          label: `${token} vs ${char}`,
          expression: 'diagonal',
          result: routeLabel(routeTokens),
          decision: 'consume one text char and one regex token',
        },
      });
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
    description: `Recovered one valid regex derivation for "${scenario.source}" against "${scenario.target}".`,
    activeCodeLine: 10,
    phaseLabel: 'Regex route ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: RegexMatchingScenario;
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
    { id: 'col-0', label: '∅', status: 'target', metaLabel: 'regex' },
    ...args.pattern.map((char, index) => ({
      id: `col-${index + 1}`,
      label: char,
      status: (args.activeCell?.[1] === index + 1 ? 'active' : 'target') as DpHeaderConfig['status'],
      metaLabel: char === '*' ? 'star' : char === '.' ? 'dot' : `p${index + 1}`,
    })),
  ];

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let col = 0; col < args.table[row]!.length; col++) {
      const id = dpCellId(row, col);
      const isBase = row === 0 || col === 0;
      const token = col === 0 ? null : args.pattern[col - 1]!;
      const char = row === 0 ? null : args.text[row - 1]!;
      const diagonalMatch = row > 0 && col > 0 && token !== '*' && matchesRegexToken(token!, char!) && args.table[row]![col]!;
      const tags: DpTraceTag[] = [];
      if (isBase) tags.push('base');
      if (diagonalMatch) tags.push('match');
      if (candidateIds.has(id)) tags.push('best');
      if (args.backtrackCells.has(id)) tags.push('path');
      if (id === activeCellId) tags.push('active');

      cells.push({
        row,
        col,
        rowLabel: row === 0 ? '∅' : args.text[row - 1]!,
        colLabel: col === 0 ? '∅' : args.pattern[col - 1]!,
        valueLabel: boolLabel(args.table[row]![col]!),
        metaLabel: args.backtrackCells.has(id)
          ? 'route'
          : token === '*'
            ? 'group'
            : token === '.'
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
    { label: 'Stars', value: String(args.pattern.filter((token) => token === '*').length), tone: 'warning' },
    { label: 'Match', value: boolLabel(matched), tone: matched ? 'success' : 'warning' },
    { label: 'Grid', value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'regex-matching-dp',
    modeLabel: 'Regex Matching DP',
    phaseLabel: args.phaseLabel,
    resultLabel: `match = ${boolLabel(matched)}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? regexActiveLabel(args.text, args.pattern, args.activeCell[0], args.activeCell[1]) : null,
    pathLabel: routeLabel(args.routeTokens),
    primaryItemsLabel: 'Text',
    primaryItems: args.text.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: 'Regex pattern',
    secondaryItems: args.pattern.map((char, index) => `${index + 1}:${char}`),
    insights,
    rowHeaders,
    colHeaders,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    computation: args.computation ?? null,
  });
}

function matchesRegexToken(token: string, char: string): boolean {
  return token === '.' || token === char;
}

function boolLabel(value: boolean): string {
  return value ? 'T' : 'F';
}

function routeLabel(tokens: readonly string[]): string {
  return tokens.length > 0 ? `Route: ${tokens.join(' · ')}` : 'Route: pending';
}

function regexActiveLabel(text: readonly string[], pattern: readonly string[], row: number, col: number): string {
  const left = row === 0 ? '∅' : text[row - 1]!;
  const right = col === 0 ? '∅' : pattern[col - 1]!;
  return `${left} × ${right}`;
}
