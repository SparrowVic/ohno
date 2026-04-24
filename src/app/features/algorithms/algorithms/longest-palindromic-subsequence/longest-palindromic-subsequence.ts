import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { LpsScenario } from '../../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.modeLabel'),
  phases: {
    initializeDiagonal: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.initializeDiagonal',
    ),
    inspectTransition: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.inspectTransition',
    ),
    commitInterval: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.commitInterval',
    ),
    traceCenter: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.traceCenter',
    ),
    takePair: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.takePair'),
    skipLeft: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.skipLeft'),
    skipRight: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.skipRight'),
    complete: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.complete'),
  },
  descriptions: {
    initialize: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.initialize',
    ),
    matchOuter: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.matchOuter',
    ),
    mismatchOuter: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.mismatchOuter',
    ),
    commitInterval: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.commitInterval',
    ),
    traceCenter: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.traceCenter',
    ),
    takePair: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.takePair'),
    skipLeft: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.skipLeft'),
    skipRight: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.skipRight',
    ),
    complete: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.descriptions.complete'),
  },
  insights: {
    charsLabel: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.insights.charsLabel'),
    bestLengthLabel: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.insights.bestLengthLabel',
    ),
    recoveredLabel: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.insights.recoveredLabel',
    ),
    mirrorPairsLabel: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.insights.mirrorPairsLabel',
    ),
    shapeLabel: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.insights.shapeLabel'),
  },
  labels: {
    pairItem: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.pairItem'),
    innerValue: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.innerValue'),
    dropLeftValue: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.dropLeftValue',
    ),
    dropRightValue: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.dropRightValue',
    ),
    intervalPair: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.intervalPair',
    ),
    cellLabel: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.cellLabel'),
    centerLabel: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.centerLabel'),
    takeLabel: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.takeLabel'),
    skipLeftLabel: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.skipLeftLabel',
    ),
    skipRightLabel: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.skipRightLabel',
    ),
    resultLength: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.resultLength',
    ),
    activeInterval: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.activeInterval',
    ),
    pathValue: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.pathValue'),
    pathPending: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.pathPending',
    ),
    sourceStringLabel: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.sourceStringLabel',
    ),
    intervalLensLabel: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.intervalLensLabel',
    ),
    sourceValue: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.sourceValue'),
    mirroredValue: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.mirroredValue',
    ),
    upperTriangle: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.upperTriangle',
    ),
    pendingValue: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.pendingValue',
    ),
  },
  decisions: {
    wrapMirroredPair: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.wrapMirroredPair',
    ),
    dropLeftBoundary: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.dropLeftBoundary',
    ),
    dropRightBoundary: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.dropRightBoundary',
    ),
    matchingOuterStored: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.matchingOuterStored',
    ),
    bottomIntervalKept: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.bottomIntervalKept',
    ),
    leftIntervalKept: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.leftIntervalKept',
    ),
    centerLocked: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.centerLocked',
    ),
    moveInward: t(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.moveInward',
    ),
    followLower: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.followLower'),
    followLeft: t('features.algorithms.runtime.dp.longestPalindromicSubsequence.decisions.followLeft'),
  },
} as const;

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
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeDiagonal,
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
          ? [
              i18nText(I18N.labels.pairItem, { leftChar, rightChar }),
              i18nText(I18N.labels.innerValue, { value: inner }),
            ]
          : [
              i18nText(I18N.labels.dropLeftValue, { value: down }),
              i18nText(I18N.labels.dropRightValue, { value: left }),
            ],
        description: charsMatch
          ? i18nText(I18N.descriptions.matchOuter, { leftChar, rightChar })
          : i18nText(I18N.descriptions.mismatchOuter, { leftChar, rightChar }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.inspectTransition,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.intervalPair, { leftChar, rightChar }),
          expression: charsMatch
            ? `${inner} + 2`
            : `max(dp[${start + 2}][${end + 1}] = ${down}, dp[${start + 1}][${end}] = ${left})`,
          result: String(charsMatch ? inner + 2 : Math.max(down, left)),
          decision: charsMatch
            ? I18N.decisions.wrapMirroredPair
            : down >= left
              ? I18N.decisions.dropLeftBoundary
              : I18N.decisions.dropRightBoundary,
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
        description: i18nText(I18N.descriptions.commitInterval, {
          leftChar,
          rightChar,
        }),
        activeCodeLine: charsMatch ? 6 : 8,
        phaseLabel: I18N.phases.commitInterval,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.cellLabel, { row: start + 1, col: end + 1 }),
          expression: charsMatch ? `${inner} + 2` : `${down} vs ${left}`,
          result: String(table[start]![end]!),
          decision: charsMatch
            ? I18N.decisions.matchingOuterStored
            : down >= left
              ? I18N.decisions.bottomIntervalKept
              : I18N.decisions.leftIntervalKept,
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
        description: i18nText(I18N.descriptions.traceCenter, { char: chars[start] }),
        activeCodeLine: 11,
        phaseLabel: I18N.phases.traceCenter,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.centerLabel, { char: chars[start] }),
          expression: 'single character',
          result: previewLabel(leftPart, rightPart),
          decision: I18N.decisions.centerLocked,
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
        description: i18nText(I18N.descriptions.takePair, {
          leftChar: chars[start],
          rightChar: chars[end],
        }),
        activeCodeLine: 11,
        phaseLabel: I18N.phases.takePair,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.takeLabel, {
            leftChar: chars[start],
            rightChar: chars[end],
          }),
          expression: `${inner} + 2 = ${table[start]![end]!}`,
          result: previewLabel(leftPart, rightPart),
          decision: I18N.decisions.moveInward,
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
        description: i18nText(I18N.descriptions.skipLeft, { char: chars[start] }),
        activeCodeLine: 12,
        phaseLabel: I18N.phases.skipLeft,
        phase: 'skip-relax',
        computation: {
          label: i18nText(I18N.labels.skipLeftLabel, { char: chars[start] }),
          expression: `${dropLeft} >= ${dropRight}`,
          result: i18nText(I18N.labels.activeInterval, { left: start + 2, right: end + 1 }),
          decision: I18N.decisions.followLower,
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
        description: i18nText(I18N.descriptions.skipRight, { char: chars[end] }),
        activeCodeLine: 13,
        phaseLabel: I18N.phases.skipRight,
        phase: 'skip-relax',
        computation: {
          label: i18nText(I18N.labels.skipRightLabel, { char: chars[end] }),
          expression: `${dropRight} > ${dropLeft}`,
          result: i18nText(I18N.labels.activeInterval, { left: start + 1, right: end }),
          decision: I18N.decisions.followLeft,
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
    description: i18nText(I18N.descriptions.complete, {
      palindrome: previewPalindrome(leftPart, rightPart),
    }),
    activeCodeLine: 14,
    phaseLabel: I18N.phases.complete,
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
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'match' | 'improved' | 'backtrack';
  readonly secondaryItems?: readonly TranslatableText[];
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

  const best = args.table[0]?.[args.chars.length - 1] ?? null;
  const palindrome = previewPalindrome(args.leftPart, args.rightPart);
  const insights: DpInsight[] = [
    { label: I18N.insights.charsLabel, value: String(args.chars.length), tone: 'accent' },
    {
      label: I18N.insights.bestLengthLabel,
      value: best === null ? I18N.labels.pendingValue : String(best),
      tone: 'success',
    },
    { label: I18N.insights.recoveredLabel, value: palindrome || I18N.labels.pendingValue, tone: 'warning' },
    {
      label: I18N.insights.mirrorPairsLabel,
      value: String(args.leftPart.length + args.rightPart.length),
      tone: 'info',
    },
    { label: I18N.insights.shapeLabel, value: I18N.labels.upperTriangle, tone: 'info' },
  ];

  return createDpStep({
    mode: 'longest-palindromic-subsequence',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultLength, {
      value: best === null ? 0 : best,
    }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.chars.length} × ${args.chars.length}`,
    activeLabel:
      args.activeCell
        ? i18nText(I18N.labels.activeInterval, {
            left: args.activeCell[0] + 1,
            right: args.activeCell[1] + 1,
          })
        : null,
    pathLabel: previewLabel(args.leftPart, args.rightPart),
    primaryItemsLabel: I18N.labels.sourceStringLabel,
    primaryItems: args.chars.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: I18N.labels.intervalLensLabel,
    secondaryItems:
      args.secondaryItems ??
      [
        i18nText(I18N.labels.sourceValue, { value: args.scenario.source }),
        i18nText(I18N.labels.mirroredValue, { value: palindrome }),
      ],
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
  return `${leftPart.join('')}${rightPart.join('')}`;
}

function previewLabel(leftPart: readonly string[], rightPart: readonly string[]): TranslatableText {
  const value = previewPalindrome(leftPart, rightPart);
  return value ? i18nText(I18N.labels.pathValue, { value }) : I18N.labels.pathPending;
}
