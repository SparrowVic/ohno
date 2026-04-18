import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { LpsScenario } from '../../utils/dp-scenarios/dp-scenarios';

export function* longestPalindromicSubsequenceGenerator(scenario: LpsScenario): Generator<SortStep> {
  const chars = scenario.source.split('');
  const size = chars.length;
  const table = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => (row === col ? 1 : col < row ? null : null as number | null)),
  );
  const backtrackCells = new Set<string>();
  const leftPart: string[] = [];
  const rightPart: string[] = [];

  yield createStep({
    scenario,
    chars,
    table,
    backtrackCells,
    leftPart,
    rightPart,
    description: 'Seed every single-character interval on the diagonal with length 1.',
    activeCodeLine: 2,
    phaseLabel: 'Initialize diagonal intervals',
    phase: 'init',
  });

  for (let span = 2; span <= size; span++) {
    for (let start = 0; start <= size - span; start++) {
      const end = start + span - 1;
      const leftChar = chars[start]!;
      const rightChar = chars[end]!;
      const charsMatch = leftChar === rightChar;
      const inner = span <= 2 ? 0 : (table[start + 1]![end - 1] ?? 0);
      const down = table[start + 1]?.[end] ?? 0;
      const left = table[start]![end - 1] ?? 0;

      yield createStep({
        scenario,
        chars,
        table,
        backtrackCells,
        leftPart,
        rightPart,
        activeCell: [start, end],
        candidateCells: charsMatch
          ? span <= 2
            ? []
            : [[start + 1, end - 1]]
          : [[start + 1, end], [start, end - 1]],
        secondaryItems: charsMatch
          ? [`pair ${leftChar} = ${rightChar}`, `inner = ${inner}`]
          : [`drop left = ${down}`, `drop right = ${left}`],
        description: charsMatch
          ? `Outer characters ${leftChar} and ${rightChar} match, so the interval can wrap the inner palindrome.`
          : `${leftChar} and ${rightChar} do not match, so keep the stronger shorter interval.`,
        activeCodeLine: 5,
        phaseLabel: 'Inspect interval transition',
        phase: 'compare',
        computation: {
          label: `${leftChar}..${rightChar}`,
          expression: charsMatch
            ? `${inner} + 2`
            : `max(dp[${start + 2}][${end + 1}] = ${down}, dp[${start + 1}][${end}] = ${left})`,
          result: String(charsMatch ? inner + 2 : Math.max(down, left)),
          decision: charsMatch ? 'wrap inner subsequence with a mirrored pair' : down >= left ? 'drop left boundary' : 'drop right boundary',
        },
      });

      table[start]![end] = charsMatch ? inner + 2 : Math.max(down, left);

      yield createStep({
        scenario,
        chars,
        table,
        backtrackCells,
        leftPart,
        rightPart,
        activeCell: [start, end],
        candidateCells: charsMatch
          ? span <= 2
            ? []
            : [[start + 1, end - 1]]
          : [[start + 1, end], [start, end - 1]],
        activeCellStatus: charsMatch ? 'match' : 'improved',
        description: `Store best palindrome length for interval ${leftChar}..${rightChar}.`,
        activeCodeLine: charsMatch ? 6 : 8,
        phaseLabel: 'Commit interval answer',
        phase: 'settle-node',
        computation: {
          label: `dp[${start + 1}][${end + 1}]`,
          expression: charsMatch ? `${inner} + 2` : `${down} vs ${left}`,
          result: String(table[start]![end]!),
          decision: charsMatch ? 'matching outer pair stored' : down >= left ? 'bottom interval kept' : 'left interval kept',
        },
      });
    }
  }

  let start = 0;
  let end = size - 1;
  while (start <= end) {
    backtrackCells.add(dpCellId(start, end));

    if (start === end) {
      leftPart.push(chars[start]!);
      yield createStep({
        scenario,
        chars,
        table,
        backtrackCells,
        leftPart,
        rightPart,
        activeCell: [start, end],
        activeCellStatus: 'backtrack',
        description: `${chars[start]} becomes the center of the palindrome.`,
        activeCodeLine: 11,
        phaseLabel: 'Trace palindrome center',
        phase: 'relax',
        computation: {
          label: `Center ${chars[start]}`,
          expression: 'single character',
          result: previewPalindrome(leftPart, rightPart),
          decision: 'center character locked in',
        },
      });
      break;
    }

    const inner = start + 1 <= end - 1 ? (table[start + 1]![end - 1] ?? 0) : 0;
    if (chars[start] === chars[end] && table[start]![end] === inner + 2) {
      leftPart.push(chars[start]!);
      rightPart.unshift(chars[end]!);
      yield createStep({
        scenario,
        chars,
        table,
        backtrackCells,
        leftPart,
        rightPart,
        activeCell: [start, end],
        candidateCells: start + 1 <= end - 1 ? [[start + 1, end - 1]] : [],
        activeCellStatus: 'backtrack',
        description: `Take mirrored pair ${chars[start]}...${chars[end]} and continue inside the interval.`,
        activeCodeLine: 11,
        phaseLabel: 'Take mirrored pair',
        phase: 'relax',
        computation: {
          label: `Take ${chars[start]}..${chars[end]}`,
          expression: `${inner} + 2 = ${table[start]![end]!}`,
          result: previewPalindrome(leftPart, rightPart),
          decision: 'move inward on both sides',
        },
      });
      start += 1;
      end -= 1;
      continue;
    }

    const dropLeft = table[start + 1]?.[end] ?? 0;
    const dropRight = table[start]![end - 1] ?? 0;
    if (dropLeft >= dropRight) {
      yield createStep({
        scenario,
        chars,
        table,
        backtrackCells,
        leftPart,
        rightPart,
        activeCell: [start, end],
        activeCellStatus: 'backtrack',
        description: `Skipping ${chars[start]} preserves the longer palindrome, so move the left boundary inward.`,
        activeCodeLine: 12,
        phaseLabel: 'Skip left boundary',
        phase: 'skip-relax',
        computation: {
          label: `Skip ${chars[start]}`,
          expression: `${dropLeft} >= ${dropRight}`,
          result: `interval ${start + 2}..${end + 1}`,
          decision: 'follow lower interval',
        },
      });
      start += 1;
    } else {
      yield createStep({
        scenario,
        chars,
        table,
        backtrackCells,
        leftPart,
        rightPart,
        activeCell: [start, end],
        activeCellStatus: 'backtrack',
        description: `Skipping ${chars[end]} preserves the longer palindrome, so move the right boundary inward.`,
        activeCodeLine: 13,
        phaseLabel: 'Skip right boundary',
        phase: 'skip-relax',
        computation: {
          label: `Skip ${chars[end]}`,
          expression: `${dropRight} > ${dropLeft}`,
          result: `interval ${start + 1}..${end}`,
          decision: 'follow left interval',
        },
      });
      end -= 1;
    }
  }

  yield createStep({
    scenario,
    chars,
    table,
    backtrackCells,
    leftPart,
    rightPart,
    description: `Recovered longest palindromic subsequence "${previewPalindrome(leftPart, rightPart)}".`,
    activeCodeLine: 14,
    phaseLabel: 'Palindrome ready',
    phase: 'complete',
  });
}

function createStep(args: {
  readonly scenario: LpsScenario;
  readonly chars: readonly string[];
  readonly table: readonly (readonly (number | null)[])[];
  readonly backtrackCells: ReadonlySet<string>;
  readonly leftPart: readonly string[];
  readonly rightPart: readonly string[];
  readonly description: string;
  readonly activeCodeLine: number;
  readonly phaseLabel: string;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'match' | 'improved' | 'backtrack';
  readonly secondaryItems?: readonly string[];
  readonly computation?: DpComputation | null;
}): SortStep {
  const activeCellId = args.activeCell ? dpCellId(args.activeCell[0], args.activeCell[1]) : null;
  const candidateIds = new Set((args.candidateCells ?? []).map(([row, col]) => dpCellId(row, col)));

  const headers: DpHeaderConfig[] = args.chars.map((char, index) => ({
    id: `h-${index}`,
    label: char,
    status: (args.activeCell && (args.activeCell[0] === index || args.activeCell[1] === index) ? 'active' : 'accent') as DpHeaderConfig['status'],
    metaLabel: `i${index + 1}`,
  }));

  const cells: DpCellConfig[] = [];
  for (let row = 0; row < args.table.length; row++) {
    for (let col = 0; col < args.table[row]!.length; col++) {
      const id = dpCellId(row, col);
      const blocked = col < row;
      const diagonal = row === col;
      const isBacktrack = args.backtrackCells.has(id);
      const mirrorMatch = !blocked && row < col && args.chars[row] === args.chars[col];
      const tags: DpTraceTag[] = [];
      if (blocked) tags.push('blocked');
      if (diagonal) tags.push('base');
      if (mirrorMatch) tags.push('match');
      if (candidateIds.has(id)) tags.push('best');
      if (isBacktrack) tags.push('path');
      if (id === activeCellId) tags.push('active');

      cells.push({
        row,
        col,
        rowLabel: args.chars[row] ?? '∅',
        colLabel: args.chars[col] ?? '∅',
        valueLabel: blocked ? '—' : args.table[row]![col] === null ? '·' : String(args.table[row]![col]!),
        metaLabel: blocked ? null : isBacktrack ? 'path' : diagonal ? 'solo' : mirrorMatch ? 'pair' : null,
        status: blocked
          ? 'blocked'
          : isBacktrack
            ? 'backtrack'
            : id === activeCellId
              ? (args.activeCellStatus ?? 'active')
              : candidateIds.has(id)
                ? 'candidate'
                : diagonal
                  ? 'base'
                  : mirrorMatch
                    ? 'match'
                    : args.table[row]![col] === null
                      ? 'idle'
                      : 'chosen',
        tags,
      });
    }
  }

  const best = sizeLabel(args.table[0]?.[args.chars.length - 1] ?? null);
  const palindrome = previewPalindrome(args.leftPart, args.rightPart);
  const insights: DpInsight[] = [
    { label: 'Chars', value: String(args.chars.length), tone: 'accent' },
    { label: 'Best length', value: best, tone: 'success' },
    { label: 'Recovered', value: palindrome, tone: 'warning' },
    { label: 'Mirror pairs', value: String(args.leftPart.length + args.rightPart.length), tone: 'info' },
    { label: 'Shape', value: 'upper triangle', tone: 'info' },
  ];

  return createDpStep({
    mode: 'longest-palindromic-subsequence',
    modeLabel: 'Longest Palindromic Subsequence',
    phaseLabel: args.phaseLabel,
    resultLabel: `len = ${best}`,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.chars.length} × ${args.chars.length}`,
    activeLabel: args.activeCell ? `${args.chars[args.activeCell[0]]}..${args.chars[args.activeCell[1]]}` : null,
    pathLabel: `LPS: ${palindrome}`,
    primaryItemsLabel: 'Source string',
    primaryItems: args.chars.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: 'Interval lens',
    secondaryItems: args.secondaryItems ?? [`source = ${args.scenario.source}`, `mirrored = ${palindrome}`],
    insights,
    rowHeaders: headers,
    colHeaders: headers,
    cells,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    tableShape: 'upper-triangle',
    computation: args.computation ?? null,
  });
}

function previewPalindrome(leftPart: readonly string[], rightPart: readonly string[]): string {
  const value = `${leftPart.join('')}${rightPart.join('')}`;
  return value || 'pending';
}

function sizeLabel(value: number | null | undefined): string {
  return value === null || value === undefined ? 'pending' : String(value);
}
