import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { DpCellConfig, DpHeaderConfig, createDpStep, dpCellId } from '../dp-step';
import { DpComputation, DpInsight, DpTraceTag } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { WildcardMatchingScenario } from '../../utils/scenarios/dp/dp-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.dp.wildcardMatching.modeLabel'),
  phases: {
    initializeBorder: t('features.algorithms.runtime.dp.wildcardMatching.phases.initializeBorder'),
    propagateLeadingStar: t(
      'features.algorithms.runtime.dp.wildcardMatching.phases.propagateLeadingStar',
    ),
    inspectStar: t('features.algorithms.runtime.dp.wildcardMatching.phases.inspectStar'),
    commitStar: t('features.algorithms.runtime.dp.wildcardMatching.phases.commitStar'),
    inspectToken: t('features.algorithms.runtime.dp.wildcardMatching.phases.inspectToken'),
    commitToken: t('features.algorithms.runtime.dp.wildcardMatching.phases.commitToken'),
    noMatch: t('features.algorithms.runtime.dp.wildcardMatching.phases.noMatch'),
    traceStarConsume: t(
      'features.algorithms.runtime.dp.wildcardMatching.phases.traceStarConsume',
    ),
    traceStarEmpty: t('features.algorithms.runtime.dp.wildcardMatching.phases.traceStarEmpty'),
    traceDiagonal: t('features.algorithms.runtime.dp.wildcardMatching.phases.traceDiagonal'),
    complete: t('features.algorithms.runtime.dp.wildcardMatching.phases.complete'),
  },
  descriptions: {
    initialize: t('features.algorithms.runtime.dp.wildcardMatching.descriptions.initialize'),
    propagateLeadingStar: t(
      'features.algorithms.runtime.dp.wildcardMatching.descriptions.propagateLeadingStar',
    ),
    inspectStar: t('features.algorithms.runtime.dp.wildcardMatching.descriptions.inspectStar'),
    commitStar: t('features.algorithms.runtime.dp.wildcardMatching.descriptions.commitStar'),
    inspectQuestion: t(
      'features.algorithms.runtime.dp.wildcardMatching.descriptions.inspectQuestion',
    ),
    inspectLiteral: t(
      'features.algorithms.runtime.dp.wildcardMatching.descriptions.inspectLiteral',
    ),
    commitToken: t('features.algorithms.runtime.dp.wildcardMatching.descriptions.commitToken'),
    noMatch: t('features.algorithms.runtime.dp.wildcardMatching.descriptions.noMatch'),
    traceStarConsume: t(
      'features.algorithms.runtime.dp.wildcardMatching.descriptions.traceStarConsume',
    ),
    traceStarEmpty: t(
      'features.algorithms.runtime.dp.wildcardMatching.descriptions.traceStarEmpty',
    ),
    traceDiagonal: t('features.algorithms.runtime.dp.wildcardMatching.descriptions.traceDiagonal'),
    complete: t('features.algorithms.runtime.dp.wildcardMatching.descriptions.complete'),
  },
  insights: {
    textLabel: t('features.algorithms.runtime.dp.wildcardMatching.insights.textLabel'),
    patternLabel: t('features.algorithms.runtime.dp.wildcardMatching.insights.patternLabel'),
    starsLabel: t('features.algorithms.runtime.dp.wildcardMatching.insights.starsLabel'),
    matchLabel: t('features.algorithms.runtime.dp.wildcardMatching.insights.matchLabel'),
    gridLabel: t('features.algorithms.runtime.dp.wildcardMatching.insights.gridLabel'),
  },
  labels: {
    leadingStarEmpty: t('features.algorithms.runtime.dp.wildcardMatching.labels.leadingStarEmpty'),
    emptyValue: t('features.algorithms.runtime.dp.wildcardMatching.labels.emptyValue'),
    consumeValue: t('features.algorithms.runtime.dp.wildcardMatching.labels.consumeValue'),
    questionWildcard: t('features.algorithms.runtime.dp.wildcardMatching.labels.questionWildcard'),
    charVsToken: t('features.algorithms.runtime.dp.wildcardMatching.labels.charVsToken'),
    starVsChar: t('features.algorithms.runtime.dp.wildcardMatching.labels.starVsChar'),
    dpCell: t('features.algorithms.runtime.dp.wildcardMatching.labels.dpCell'),
    pathValue: t('features.algorithms.runtime.dp.wildcardMatching.labels.pathValue'),
    pathPending: t('features.algorithms.runtime.dp.wildcardMatching.labels.pathPending'),
    activeCell: t('features.algorithms.runtime.dp.wildcardMatching.labels.activeCell'),
    textItemsLabel: t('features.algorithms.runtime.dp.wildcardMatching.labels.textItemsLabel'),
    patternItemsLabel: t(
      'features.algorithms.runtime.dp.wildcardMatching.labels.patternItemsLabel',
    ),
    resultMatch: t('features.algorithms.runtime.dp.wildcardMatching.labels.resultMatch'),
    starConsumes: t('features.algorithms.runtime.dp.wildcardMatching.labels.starConsumes'),
    starEmpty: t('features.algorithms.runtime.dp.wildcardMatching.labels.starEmpty'),
    tokenMatches: t('features.algorithms.runtime.dp.wildcardMatching.labels.tokenMatches'),
  },
  decisions: {
    starSpansEmptyPrefix: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.starSpansEmptyPrefix',
    ),
    prefixStopsMatching: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.prefixStopsMatching',
    ),
    starMustConsume: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.starMustConsume',
    ),
    starCanStayEmpty: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.starCanStayEmpty',
    ),
    stateRemainsFalse: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.stateRemainsFalse',
    ),
    starTransitionReachable: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.starTransitionReachable',
    ),
    bothStarBranchesFailed: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.bothStarBranchesFailed',
    ),
    diagonalMatchSurvives: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.diagonalMatchSurvives',
    ),
    directTransitionFails: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.directTransitionFails',
    ),
    diagonalMatchStored: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.diagonalMatchStored',
    ),
    stateBlocked: t('features.algorithms.runtime.dp.wildcardMatching.decisions.stateBlocked'),
    moveUpKeepStar: t('features.algorithms.runtime.dp.wildcardMatching.decisions.moveUpKeepStar'),
    moveLeftPastStar: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.moveLeftPastStar',
    ),
    consumeTextAndPattern: t(
      'features.algorithms.runtime.dp.wildcardMatching.decisions.consumeTextAndPattern',
    ),
  },
} as const;

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
    description: I18N.descriptions.initialize,
    activeCodeLine: 2,
    phaseLabel: I18N.phases.initializeBorder,
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
      secondaryItems: [I18N.labels.leadingStarEmpty],
      description: i18nText(I18N.descriptions.propagateLeadingStar, { col }),
      activeCodeLine: 2,
      phaseLabel: I18N.phases.propagateLeadingStar,
      phase: 'settle-node',
      computation: {
        label: i18nText(I18N.labels.dpCell, { row: 0, col }),
        expression: `dp[0][${col - 1}]`,
        result: boolLabel(table[0]![col]!),
        decision: table[0]![col]! ? I18N.decisions.starSpansEmptyPrefix : I18N.decisions.prefixStopsMatching,
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
          secondaryItems: [
            i18nText(I18N.labels.emptyValue, { value: boolLabel(emptyMatch) }),
            i18nText(I18N.labels.consumeValue, { value: boolLabel(consumeMatch) }),
          ],
          description: i18nText(I18N.descriptions.inspectStar, { col, char }),
          activeCodeLine: 5,
          phaseLabel: I18N.phases.inspectStar,
          phase: 'compare',
          computation: {
            label: i18nText(I18N.labels.starVsChar, { char }),
            expression: `dp[${row}][${col - 1}] OR dp[${row - 1}][${col}]`,
            result: boolLabel(emptyMatch || consumeMatch),
            decision:
              consumeMatch && !emptyMatch
                ? I18N.decisions.starMustConsume
                : emptyMatch
                  ? I18N.decisions.starCanStayEmpty
                  : I18N.decisions.stateRemainsFalse,
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
          description: i18nText(I18N.descriptions.commitStar, { row, col }),
          activeCodeLine: 6,
          phaseLabel: I18N.phases.commitStar,
          phase: 'settle-node',
          computation: {
            label: i18nText(I18N.labels.dpCell, { row, col }),
            expression: `${boolLabel(emptyMatch)} | ${boolLabel(consumeMatch)}`,
            result: boolLabel(table[row]![col]!),
            decision: table[row]![col]! ? I18N.decisions.starTransitionReachable : I18N.decisions.bothStarBranchesFailed,
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
        secondaryItems: [
          token === '?'
            ? I18N.labels.questionWildcard
            : i18nText(I18N.labels.charVsToken, { char, token }),
        ],
        description:
          token === '?'
            ? I18N.descriptions.inspectQuestion
            : i18nText(I18N.descriptions.inspectLiteral, { token, char }),
        activeCodeLine: 7,
        phaseLabel: I18N.phases.inspectToken,
        phase: 'compare',
        computation: {
          label: i18nText(I18N.labels.charVsToken, { char, token }),
          expression: `dp[${row - 1}][${col - 1}] AND match`,
          result: boolLabel(diagonal),
          decision: diagonal ? I18N.decisions.diagonalMatchSurvives : I18N.decisions.directTransitionFails,
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
        description: i18nText(I18N.descriptions.commitToken, { token, row }),
        activeCodeLine: 8,
        phaseLabel: I18N.phases.commitToken,
        phase: 'settle-node',
        computation: {
          label: i18nText(I18N.labels.dpCell, { row, col }),
          expression: `${boolLabel(table[row - 1]![col - 1]!)} & ${boolLabel(directMatch)}`,
          result: boolLabel(table[row]![col]!),
          decision: table[row]![col]! ? I18N.decisions.diagonalMatchStored : I18N.decisions.stateBlocked,
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
          description: i18nText(I18N.descriptions.traceStarConsume, { char }),
          activeCodeLine: 9,
          phaseLabel: I18N.phases.traceStarConsume,
          phase: 'relax',
          computation: {
            label: i18nText(I18N.labels.starConsumes, { char }),
            expression: `dp[${row - 1}][${col}]`,
            result: routeLabel(routeTokens),
            decision: I18N.decisions.moveUpKeepStar,
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
          description: I18N.descriptions.traceStarEmpty,
          activeCodeLine: 9,
          phaseLabel: I18N.phases.traceStarEmpty,
          phase: 'skip-relax',
          computation: {
            label: I18N.labels.starEmpty,
            expression: `dp[${row}][${col - 1}]`,
            result: routeLabel(routeTokens),
            decision: I18N.decisions.moveLeftPastStar,
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
          description: i18nText(I18N.descriptions.traceDiagonal, { token, char }),
          activeCodeLine: 9,
          phaseLabel: I18N.phases.traceDiagonal,
          phase: 'relax',
          computation: {
            label: i18nText(I18N.labels.tokenMatches, { token, char }),
            expression: `dp[${row - 1}][${col - 1}]`,
            result: routeLabel(routeTokens),
            decision: I18N.decisions.consumeTextAndPattern,
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
  readonly scenario: WildcardMatchingScenario;
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
  readonly secondaryItems?: readonly TranslatableText[];
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
    { label: I18N.insights.textLabel, value: String(args.text.length), tone: 'accent' },
    { label: I18N.insights.patternLabel, value: String(args.pattern.length), tone: 'info' },
    {
      label: I18N.insights.starsLabel,
      value: String(args.pattern.filter((char) => char === '*').length),
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
    mode: 'wildcard-matching',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    resultLabel: i18nText(I18N.labels.resultMatch, { value: boolLabel(matched) }),
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    dimensionsLabel: `${args.table.length} × ${args.table[0]!.length}`,
    activeLabel: args.activeCell ? activeCellLabel(args.text, args.pattern, args.activeCell[0], args.activeCell[1]) : null,
    pathLabel: routeLabel(args.routeTokens),
    primaryItemsLabel: I18N.labels.textItemsLabel,
    primaryItems: args.text.map((char, index) => `${index + 1}:${char}`),
    secondaryItemsLabel: I18N.labels.patternItemsLabel,
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

function routeLabel(tokens: readonly string[]): TranslatableText {
  return tokens.length > 0
    ? i18nText(I18N.labels.pathValue, { route: tokens.join(' · ') })
    : I18N.labels.pathPending;
}

function activeCellLabel(
  text: readonly string[],
  pattern: readonly string[],
  row: number,
  col: number,
): TranslatableText {
  const left = row === 0 ? '∅' : text[row - 1]!;
  const right = col === 0 ? '∅' : pattern[col - 1]!;
  return i18nText(I18N.labels.activeCell, { left, right });
}
