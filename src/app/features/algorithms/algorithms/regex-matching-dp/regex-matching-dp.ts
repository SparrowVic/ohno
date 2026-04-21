import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { RegexMatchingScenario } from '../../utils/dp-scenarios/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.regexMatching.modeLabel'),
  phases: {
    initializeBorder: t('features.algorithms.runtime.dp.regexMatching.phases.initializeBorder'),
    propagateStarGroup: t(
      'features.algorithms.runtime.dp.regexMatching.phases.propagateStarGroup',
    ),
    inspectStarGroup: t(
      'features.algorithms.runtime.dp.regexMatching.phases.inspectStarGroup',
    ),
    commitStarState: t('features.algorithms.runtime.dp.regexMatching.phases.commitStarState'),
    inspectToken: t('features.algorithms.runtime.dp.regexMatching.phases.inspectToken'),
    commitToken: t('features.algorithms.runtime.dp.regexMatching.phases.commitToken'),
    noMatch: t('features.algorithms.runtime.dp.regexMatching.phases.noMatch'),
    traceStarConsume: t('features.algorithms.runtime.dp.regexMatching.phases.traceStarConsume'),
    traceStarEmpty: t('features.algorithms.runtime.dp.regexMatching.phases.traceStarEmpty'),
    traceDirect: t('features.algorithms.runtime.dp.regexMatching.phases.traceDirect'),
    complete: t('features.algorithms.runtime.dp.regexMatching.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.regexMatching.descriptions.initialize'),
    propagateStarGroup: t(
      'features.algorithms.runtime.dp.regexMatching.descriptions.propagateStarGroup',
    ),
    inspectStarGroup: t(
      'features.algorithms.runtime.dp.regexMatching.descriptions.inspectStarGroup',
    ),
    commitStarState: t(
      'features.algorithms.runtime.dp.regexMatching.descriptions.commitStarState',
    ),
    inspectDot: t('features.algorithms.runtime.dp.regexMatching.descriptions.inspectDot'),
    inspectLiteral: t('features.algorithms.runtime.dp.regexMatching.descriptions.inspectLiteral'),
    commitToken: t('features.algorithms.runtime.dp.regexMatching.descriptions.commitToken'),
    noMatch: t('features.algorithms.runtime.dp.regexMatching.descriptions.noMatch'),
    traceStarConsume: t(
      'features.algorithms.runtime.dp.regexMatching.descriptions.traceStarConsume',
    ),
    traceStarEmpty: t(
      'features.algorithms.runtime.dp.regexMatching.descriptions.traceStarEmpty',
    ),
    traceDirect: t('features.algorithms.runtime.dp.regexMatching.descriptions.traceDirect'),
    complete: t('features.algorithms.runtime.dp.regexMatching.descriptions.complete'),
  },
  insights: {
    textLabel: t('features.algorithms.runtime.dp.regexMatching.insights.textLabel'),
    patternLabel: t('features.algorithms.runtime.dp.regexMatching.insights.patternLabel'),
    starsLabel: t('features.algorithms.runtime.dp.regexMatching.insights.starsLabel'),
    matchLabel: t('features.algorithms.runtime.dp.regexMatching.insights.matchLabel'),
    gridLabel: t('features.algorithms.runtime.dp.regexMatching.insights.gridLabel'),
  },
  labels: {
    starGroupVsChar: t('features.algorithms.runtime.dp.regexMatching.labels.starGroupVsChar'),
    charVsToken: t('features.algorithms.runtime.dp.regexMatching.labels.charVsToken'),
    dpCell: t('features.algorithms.runtime.dp.regexMatching.labels.dpCell'),
    pathValue: t('features.algorithms.runtime.dp.regexMatching.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.regexMatching.labels.pathPending'),
    activeCell: t('features.algorithms.runtime.dp.regexMatching.labels.activeCell'),
    textItemsLabel: t('features.algorithms.runtime.dp.regexMatching.labels.textItemsLabel'),
    patternItemsLabel: t('features.algorithms.runtime.dp.regexMatching.labels.patternItemsLabel'),
    resultMatch: t('features.algorithms.runtime.dp.regexMatching.labels.resultMatch'),
    regexConsumes: t('features.algorithms.runtime.dp.regexMatching.labels.regexConsumes'),
    regexEmpty: t('features.algorithms.runtime.dp.regexMatching.labels.regexEmpty'),
    tokenMatches: t('features.algorithms.runtime.dp.regexMatching.labels.tokenMatches'),
  },
  decisions: {
    zeroOccurrencesAccepted: t(
      'features.algorithms.runtime.dp.regexMatching.decisions.zeroOccurrencesAccepted',
    ),
    emptyPrefixBlocked: t(
      'features.algorithms.runtime.dp.regexMatching.decisions.emptyPrefixBlocked',
    ),
    starMustConsume: t('features.algorithms.runtime.dp.regexMatching.decisions.starMustConsume'),
    groupCanStayEmpty: t(
      'features.algorithms.runtime.dp.regexMatching.decisions.groupCanStayEmpty',
    ),
    bothStarBranchesFail: t(
      'features.algorithms.runtime.dp.regexMatching.decisions.bothStarBranchesFail',
    ),
    regexPrefixValid: t('features.algorithms.runtime.dp.regexMatching.decisions.regexPrefixValid'),
    stateBlocked: t('features.algorithms.runtime.dp.regexMatching.decisions.stateBlocked'),
    diagonalRegexMatch: t(
      'features.algorithms.runtime.dp.regexMatching.decisions.diagonalRegexMatch',
    ),
    literalBranchFails: t(
      'features.algorithms.runtime.dp.regexMatching.decisions.literalBranchFails',
    ),
    tokenMatchedDiagonally: t(
      'features.algorithms.runtime.dp.regexMatching.decisions.tokenMatchedDiagonally',
    ),
    moveUpKeepStar: t('features.algorithms.runtime.dp.regexMatching.decisions.moveUpKeepStar'),
    jumpLeftTwo: t('features.algorithms.runtime.dp.regexMatching.decisions.jumpLeftTwo'),
    consumeTextAndRegex: t(
      'features.algorithms.runtime.dp.regexMatching.decisions.consumeTextAndRegex',
    ),
  },
} as const;

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
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeBorder,
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
      description: i18nText(I18N.descriptions.propagateStarGroup, {
        token: pattern[col - 2] ?? '',
      }),
      activeCodeLine: 2,
      phaseLabel: I18N.phases.propagateStarGroup,
      phase: 'settle-node',
      computation: {
        label: i18nText(I18N.labels.dpCell, { row: 0, col }),
        expression: `dp[0][${col - 2}]`,
        result: boolLabel(table[0]![col]!),
        decision: table[0]![col]! ? I18N.decisions.zeroOccurrencesAccepted : I18N.decisions.emptyPrefixBlocked,
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
          description: i18nText(I18N.descriptions.inspectStarGroup, {
            token: prevToken,
            char,
          }),
          activeCodeLine: 5,
          phaseLabel: I18N.phases.inspectStarGroup,
          phase: 'compare',
          computation: {
            label: i18nText(I18N.labels.starGroupVsChar, { token: prevToken, char }),
            expression: `${boolLabel(zeroOccurrences)} OR ${boolLabel(consumeOne)}`,
            result: boolLabel(zeroOccurrences || consumeOne),
            decision:
              consumeOne && !zeroOccurrences
                ? I18N.decisions.starMustConsume
                : zeroOccurrences
                  ? I18N.decisions.groupCanStayEmpty
                  : I18N.decisions.bothStarBranchesFail,
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
          description: I18N.descriptions.commitStarState,
          activeCodeLine: 6,
          phaseLabel: I18N.phases.commitStarState,
          phase: 'settle-node',
          computation: {
            label: i18nText(I18N.labels.dpCell, { row, col }),
            expression: `${boolLabel(zeroOccurrences)} | ${boolLabel(consumeOne)}`,
            result: boolLabel(table[row]![col]!),
            decision: table[row]![col]! ? I18N.decisions.regexPrefixValid : I18N.decisions.stateBlocked,
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
        description:
          token === '.'
            ? I18N.descriptions.inspectDot
            : i18nText(I18N.descriptions.inspectLiteral, { token, char }),
        activeCodeLine: 7,
        phaseLabel: I18N.phases.inspectToken,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.charVsToken, { token, char }),
          expression: `dp[${row - 1}][${col - 1}] AND match`,
          result: boolLabel(diagonal),
          decision: diagonal ? I18N.decisions.diagonalRegexMatch : I18N.decisions.literalBranchFails,
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
        description: i18nText(I18N.descriptions.commitToken, { token, char }),
        activeCodeLine: 8,
        phaseLabel: I18N.phases.commitToken,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.dpCell, { row, col }),
          expression: `${boolLabel(table[row - 1]![col - 1]!)} & ${boolLabel(matchesRegexToken(token, char))}`,
          result: boolLabel(table[row]![col]!),
          decision: table[row]![col]! ? I18N.decisions.tokenMatchedDiagonally : I18N.decisions.stateBlocked,
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
      description: I18N.descriptions.noMatch,
      activeCodeLine: 10,
      phaseLabel: I18N.phases.noMatch,
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
      const consumeOne =
        row > 0 && col >= 2 && matchesRegexToken(prevToken, char!) && table[row - 1]![col]!;

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
          description: i18nText(I18N.descriptions.traceStarConsume, {
            token: prevToken,
            char,
          }),
          activeCodeLine: 9,
          phaseLabel: I18N.phases.traceStarConsume,
          phase: 'relax',
          computation: {
            label: i18nText(I18N.labels.regexConsumes, { token: prevToken, char }),
            expression: `dp[${row - 1}][${col}]`,
            result: routeLabel(routeTokens),
            decision: I18N.decisions.moveUpKeepStar,
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
          description: i18nText(I18N.descriptions.traceStarEmpty, { token: prevToken }),
          activeCodeLine: 9,
          phaseLabel: I18N.phases.traceStarEmpty,
          phase: 'skip-relax',
          computation: {
            label: i18nText(I18N.labels.regexEmpty, { token: prevToken }),
            expression: 'zero occurrences',
            result: routeLabel(routeTokens),
            decision: I18N.decisions.jumpLeftTwo,
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
        description: i18nText(I18N.descriptions.traceDirect, { token, char }),
        activeCodeLine: 9,
        phaseLabel: I18N.phases.traceDirect,
        phase: 'relax',
        computation: {
          label: i18nText(I18N.labels.tokenMatches, { token, char }),
          expression: 'diagonal',
          result: routeLabel(routeTokens),
          decision: I18N.decisions.consumeTextAndRegex,
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
    description: i18nText(I18N.descriptions.complete, {
      source: scenario.source,
      pattern: scenario.target,
    }),
    activeCodeLine: 10,
    phaseLabel: I18N.phases.complete,
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
  readonly description: TranslatableText;
  readonly activeCodeLine: number;
  readonly phaseLabel: TranslatableText;
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
      const diagonalMatch =
        row > 0 &&
        col > 0 &&
        token !== '*' &&
        matchesRegexToken(token!, char!) &&
        args.table[row]![col]!;
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
    { label: I18N.insights.textLabel, value: String(args.text.length), tone: 'accent' },
    { label: I18N.insights.patternLabel, value: String(args.pattern.length), tone: 'info' },
    {
      label: I18N.insights.starsLabel,
      value: String(args.pattern.filter((token) => token === '*').length),
      tone: 'warning',
    },
    {
      label: I18N.insights.matchLabel,
      value: boolLabel(matched),
      tone: matched ? 'success' : 'warning',
    },
    {
      label: I18N.insights.gridLabel,
      value: `${args.table.length} × ${args.table[0]!.length}`,
      tone: 'info',
    },
  ];

  return createDpStep({
    mode: 'regex-matching-dp',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultMatch, { value: boolLabel(matched) }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? regexActiveLabel(args.text, args.pattern, args.activeCell[0], args.activeCell[1]) : null,
    pathLabel: routeLabel(args.routeTokens),
    primaryItemsLabel: I18N.labels.textItemsLabel,
    primaryItems: args.text.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: I18N.labels.patternItemsLabel,
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

function routeLabel(tokens: readonly string[]): TranslatableText {
  return tokens.length > 0
    ? i18nText(I18N.labels.pathValue, { route: tokens.join(' · ') })
    : I18N.labels.pathPending;
}

function regexActiveLabel(
  text: readonly string[],
  pattern: readonly string[],
  row: number,
  col: number,
): TranslatableText {
  const left = row === 0 ? '∅' : text[row - 1]!;
  const right = col === 0 ? '∅' : pattern[col - 1]!;
  return i18nText(I18N.labels.activeCell, { left, right });
}
