import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { LcsScenario } from '../../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.longestCommonSubsequence.modeLabel'),
  phases: {
    initializeBorders: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.phases.initializeBorders',
    ),
    compareCharacters: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.phases.compareCharacters',
    ),
    commitCell: t('features.algorithms.runtime.dp.longestCommonSubsequence.phases.commitCell'),
    backtrackMatch: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.phases.backtrackMatch',
    ),
    backtrackUpward: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.phases.backtrackUpward',
    ),
    backtrackLeft: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.phases.backtrackLeft',
    ),
    complete: t('features.algorithms.runtime.dp.longestCommonSubsequence.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.longestCommonSubsequence.descriptions.initialize'),
    compareCharacters: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.descriptions.compareCharacters',
    ),
    commitCell: t('features.algorithms.runtime.dp.longestCommonSubsequence.descriptions.commitCell'),
    backtrackMatch: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.descriptions.backtrackMatch',
    ),
    backtrackUpward: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.descriptions.backtrackUpward',
    ),
    backtrackLeft: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.descriptions.backtrackLeft',
    ),
    complete: t('features.algorithms.runtime.dp.longestCommonSubsequence.descriptions.complete'),
  },
  insights: {
    sourceLabel: t('features.algorithms.runtime.dp.longestCommonSubsequence.insights.sourceLabel'),
    targetLabel: t('features.algorithms.runtime.dp.longestCommonSubsequence.insights.targetLabel'),
    lcsLengthLabel: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.insights.lcsLengthLabel',
    ),
    pathCharsLabel: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.insights.pathCharsLabel',
    ),
    gridLabel: t('features.algorithms.runtime.dp.longestCommonSubsequence.insights.gridLabel'),
  },
  labels: {
    matchItem: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.matchItem'),
    topValue: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.topValue'),
    leftValue: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.leftValue'),
    sourceStringLabel: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.labels.sourceStringLabel',
    ),
    targetStringLabel: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.labels.targetStringLabel',
    ),
    activeCell: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.activeCell'),
    resultLength: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.resultLength'),
    pathValue: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.pathPending'),
    charPair: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.charPair'),
    dpCell: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.dpCell'),
    backtrackChar: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.labels.backtrackChar',
    ),
    backtrackUp: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.backtrackUp'),
    backtrackLeft: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.labels.backtrackLeft',
    ),
    coords: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.coords'),
    ellipsis: t('features.algorithms.runtime.dp.longestCommonSubsequence.labels.ellipsis'),
  },
  decisions: {
    extendDiagonal: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.decisions.extendDiagonal',
    ),
    carryLargerNeighbor: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.decisions.carryLargerNeighbor',
    ),
    diagonalStored: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.decisions.diagonalStored',
    ),
    bestNeighborStored: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.decisions.bestNeighborStored',
    ),
    characterAdded: t(
      'features.algorithms.runtime.dp.longestCommonSubsequence.decisions.characterAdded',
    ),
    followTop: t('features.algorithms.runtime.dp.longestCommonSubsequence.decisions.followTop'),
    followLeft: t('features.algorithms.runtime.dp.longestCommonSubsequence.decisions.followLeft'),
  },
} as const;

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
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeBorders,
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
        secondaryItems: charsMatch
          ? [i18nText(I18N.labels.matchItem, { char: leftChar })]
          : [
              i18nText(I18N.labels.topValue, { value: table[row - 1]![col]! }),
              i18nText(I18N.labels.leftValue, { value: table[row]![col - 1]! }),
            ],
        description: i18nText(I18N.descriptions.compareCharacters, {
          leftChar,
          topChar,
        }),
        activeCodeLine: 5,
        phaseLabel: I18N.phases.compareCharacters,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.charPair, { leftChar, topChar }),
          expression: charsMatch
            ? `dp[${row - 1}][${col - 1}] + 1`
            : `max(dp[${row - 1}][${col}], dp[${row}][${col - 1}])`,
          result: charsMatch
            ? String(table[row - 1]![col - 1]! + 1)
            : String(Math.max(table[row - 1]![col]!, table[row]![col - 1]!)),
          decision: charsMatch ? I18N.decisions.extendDiagonal : I18N.decisions.carryLargerNeighbor,
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
        description: i18nText(I18N.descriptions.commitCell, {
          row,
          col,
          value: table[row]![col]!,
        }),
        activeCodeLine: charsMatch ? 6 : 8,
        phaseLabel: I18N.phases.commitCell,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.dpCell, { row, col }),
          expression: charsMatch
            ? `${table[row - 1]![col - 1]!} + 1`
            : `${table[row - 1]![col]!} vs ${table[row]![col - 1]!}`,
          result: String(table[row]![col]!),
          decision: charsMatch ? I18N.decisions.diagonalStored : I18N.decisions.bestNeighborStored,
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
        pathLabel: lcsPathLabel(sequence),
        description: i18nText(I18N.descriptions.backtrackMatch, {
          sourceChar: source[row - 1],
          targetChar: target[col - 1],
        }),
        activeCodeLine: 11,
        phaseLabel: I18N.phases.backtrackMatch,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.backtrackChar, { char: source[row - 1] }),
          expression: '↖',
          result: i18nText(I18N.labels.coords, { row: row - 1, col: col - 1 }),
          decision: I18N.decisions.characterAdded,
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
        pathLabel: lcsPathLabel(sequence, true),
        description: I18N.descriptions.backtrackUpward,
        activeCodeLine: 13,
        phaseLabel: I18N.phases.backtrackUpward,
        phase: 'skip-relax',
        computation: {
          label: I18N.labels.backtrackUp,
          expression: `${table[row - 1]![col]!} >= ${table[row]![col - 1]!}`,
          result: i18nText(I18N.labels.coords, { row: row - 1, col }),
          decision: I18N.decisions.followTop,
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
        pathLabel: lcsPathLabel(sequence, true),
        description: I18N.descriptions.backtrackLeft,
        activeCodeLine: 14,
        phaseLabel: I18N.phases.backtrackLeft,
        phase: 'skip-relax',
        computation: {
          label: I18N.labels.backtrackLeft,
          expression: `${table[row]![col - 1]!} > ${table[row - 1]![col]!}`,
          result: i18nText(I18N.labels.coords, { row, col: col - 1 }),
          decision: I18N.decisions.followLeft,
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
    pathLabel: lcsPathLabel(sequence),
    description: i18nText(I18N.descriptions.complete, {
      sequence: sequence.join('') || '∅',
    }),
    activeCodeLine: 16,
    phaseLabel: I18N.phases.complete,
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
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly activeCell?: readonly [number, number];
  readonly candidateCells?: readonly (readonly [number, number])[];
  readonly activeCellStatus?: 'active' | 'chosen' | 'match' | 'backtrack';
  readonly secondaryItems?: readonly TranslatableText[];
  readonly pathLabel?: TranslatableText;
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
    { label: I18N.insights.sourceLabel, value: String(args.source.length), tone: 'accent' },
    { label: I18N.insights.targetLabel, value: String(args.target.length), tone: 'info' },
    {
      label: I18N.insights.lcsLengthLabel,
      value: String(args.table[args.source.length]![args.target.length]!),
      tone: 'success',
    },
    { label: I18N.insights.pathCharsLabel, value: String(args.sequence.length), tone: 'warning' },
    { label: I18N.insights.gridLabel, value: `${args.table.length} × ${args.table[0]!.length}`, tone: 'info' },
  ];

  return createDpStep({
    mode: 'longest-common-subsequence',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultLength, {
      value: args.table[args.source.length]![args.target.length]!,
    }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? i18nText(I18N.labels.activeCell, {
      cell: cellsLabel(args, args.activeCell[0], args.activeCell[1]),
    }) : null,
    pathLabel: args.pathLabel ?? lcsPathLabel(args.sequence, true),
    primaryItemsLabel: I18N.labels.sourceStringLabel,
    primaryItems: args.source.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: I18N.labels.targetStringLabel,
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

function lcsPathLabel(
  sequence: readonly string[],
  pending = false,
): TranslatableText {
  return sequence.length > 0
    ? i18nText(I18N.labels.pathValue, { value: sequence.join('') })
    : pending
      ? i18nText(I18N.labels.pathValue, { value: '...' })
      : i18nText(I18N.labels.pathValue, { value: '∅' });
}
