import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import { SortStep } from '../../models/sort-step';
import { createSearchStep } from '../search-step';

const I18N = {
  modeLabels: {
    lowerBound: t('features.algorithms.runtime.search.binarySearchVariants.modeLabels.lowerBound'),
    upperBound: t('features.algorithms.runtime.search.binarySearchVariants.modeLabels.upperBound'),
    boundsSearch: t('features.algorithms.runtime.search.binarySearchVariants.modeLabels.boundsSearch'),
  },
  statuses: {
    ready: t('features.algorithms.runtime.search.binarySearchVariants.statuses.ready'),
    comparing: t('features.algorithms.runtime.search.binarySearchVariants.statuses.comparing'),
    moveLeft: t('features.algorithms.runtime.search.binarySearchVariants.statuses.moveLeft'),
    firstMatchCandidate: t(
      'features.algorithms.runtime.search.binarySearchVariants.statuses.firstMatchCandidate',
    ),
    moveRight: t('features.algorithms.runtime.search.binarySearchVariants.statuses.moveRight'),
    notFound: t('features.algorithms.runtime.search.binarySearchVariants.statuses.notFound'),
    switchPhase: t(
      'features.algorithms.runtime.search.binarySearchVariants.statuses.switchPhase',
    ),
    lastMatchCandidate: t(
      'features.algorithms.runtime.search.binarySearchVariants.statuses.lastMatchCandidate',
    ),
    rangeFound: t('features.algorithms.runtime.search.binarySearchVariants.statuses.rangeFound'),
  },
  descriptions: {
    start: t('features.algorithms.runtime.search.binarySearchVariants.descriptions.start'),
    lowerProbe: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.lowerProbe',
    ),
    moveLeftForFirst: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.moveLeftForFirst',
    ),
    tooSmallForFirst: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.tooSmallForFirst',
    ),
    noRange: t('features.algorithms.runtime.search.binarySearchVariants.descriptions.noRange'),
    switchPhase: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.switchPhase',
    ),
    upperProbe: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.upperProbe',
    ),
    moveRightForLast: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.moveRightForLast',
    ),
    tooLargeForLast: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.tooLargeForLast',
    ),
    completeRange: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.completeRange',
    ),
    noFinalRange: t(
      'features.algorithms.runtime.search.binarySearchVariants.descriptions.noFinalRange',
    ),
  },
  decisions: {
    lowerCompare: t(
      'features.algorithms.runtime.search.binarySearchVariants.decisions.lowerCompare',
    ),
    trimRight: t('features.algorithms.runtime.search.binarySearchVariants.decisions.trimRight'),
    candidateFirst: t(
      'features.algorithms.runtime.search.binarySearchVariants.decisions.candidateFirst',
    ),
    advanceLow: t('features.algorithms.runtime.search.binarySearchVariants.decisions.advanceLow'),
    lowerBoundSearchFailed: t(
      'features.algorithms.runtime.search.binarySearchVariants.decisions.lowerBoundSearchFailed',
    ),
    firstMatchFixed: t(
      'features.algorithms.runtime.search.binarySearchVariants.decisions.firstMatchFixed',
    ),
    upperCompare: t(
      'features.algorithms.runtime.search.binarySearchVariants.decisions.upperCompare',
    ),
    candidateLast: t(
      'features.algorithms.runtime.search.binarySearchVariants.decisions.candidateLast',
    ),
    newHigh: t('features.algorithms.runtime.search.binarySearchVariants.decisions.newHigh'),
    rangeWidth: t('features.algorithms.runtime.search.binarySearchVariants.decisions.rangeWidth'),
    upperBoundSearchMiss: t(
      'features.algorithms.runtime.search.binarySearchVariants.decisions.upperBoundSearchMiss',
    ),
  },
} as const;

export function* binarySearchVariantsGenerator(args: {
  readonly array: readonly number[];
  readonly target: number;
}): Generator<SortStep> {
  const arr = [...args.array];
  const visited: number[] = [];
  const eliminated = new Set<number>();
  let leftBound: number | null = null;
  let rightBound: number | null = null;

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { target: args.target }),
    modeLabel: I18N.modeLabels.lowerBound,
    statusLabel: I18N.statuses.ready,
    low: arr.length > 0 ? 0 : null,
    high: arr.length > 0 ? arr.length - 1 : null,
    phase: 'init',
  });

  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.lowerProbe, {
        index: mid,
        value: arr[mid],
        target: args.target,
      }),
      modeLabel: I18N.modeLabels.lowerBound,
      statusLabel: I18N.statuses.comparing,
      decision: i18nText(I18N.decisions.lowerCompare, {
        value: arr[mid],
        relation: arr[mid] < args.target ? '<' : '>=',
        target: args.target,
      }),
      probeIndex: mid,
      low,
      high,
      leftBound,
      rightBound,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'compare',
    });

    visited.push(mid);

    if (arr[mid] >= args.target) {
      if (arr[mid] === args.target) {
        leftBound = mid;
      }

      for (let index = mid + 1; index <= high; index++) {
        eliminated.add(index);
      }
      high = mid - 1;

      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.moveLeftForFirst, { target: args.target }),
        modeLabel: I18N.modeLabels.lowerBound,
        statusLabel:
          leftBound === null ? I18N.statuses.moveLeft : I18N.statuses.firstMatchCandidate,
        decision:
          leftBound === null
            ? i18nText(I18N.decisions.trimRight, { high })
            : i18nText(I18N.decisions.candidateFirst, { index: leftBound }),
        low: low <= high ? low : null,
        high: low <= high ? high : null,
        leftBound,
        rightBound,
        eliminated: [...eliminated],
        visitedOrder: visited,
        phase: 'pass-complete',
      });
      continue;
    }

    for (let index = low; index <= mid; index++) {
      eliminated.add(index);
    }
    low = mid + 1;

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 8,
      description: i18nText(I18N.descriptions.tooSmallForFirst, {
        value: arr[mid],
        target: args.target,
      }),
      modeLabel: I18N.modeLabels.lowerBound,
      statusLabel: I18N.statuses.moveRight,
      decision: i18nText(I18N.decisions.advanceLow, { low }),
      low: low <= high ? low : null,
      high: low <= high ? high : null,
      leftBound,
      rightBound,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'pass-complete',
    });
  }

  if (leftBound === null) {
    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 10,
      description: i18nText(I18N.descriptions.noRange, { target: args.target }),
      modeLabel: I18N.modeLabels.boundsSearch,
      statusLabel: I18N.statuses.notFound,
      decision: I18N.decisions.lowerBoundSearchFailed,
      low: null,
      high: null,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'complete',
    });
    return;
  }

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 11,
    description: i18nText(I18N.descriptions.switchPhase, { index: leftBound }),
    modeLabel: I18N.modeLabels.upperBound,
    statusLabel: I18N.statuses.switchPhase,
    decision: i18nText(I18N.decisions.firstMatchFixed, { index: leftBound }),
    low: leftBound,
    high: arr.length - 1,
    leftBound,
    rightBound,
    eliminated: [...eliminated].filter((index) => index < leftBound),
    visitedOrder: visited,
    phase: 'compare',
  });

  low = leftBound;
  high = arr.length - 1;
  const upperEliminated = new Set<number>([...eliminated].filter((index) => index < leftBound));

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 13,
      description: i18nText(I18N.descriptions.upperProbe, {
        index: mid,
        value: arr[mid],
        target: args.target,
      }),
      modeLabel: I18N.modeLabels.upperBound,
      statusLabel: I18N.statuses.comparing,
      decision: i18nText(I18N.decisions.upperCompare, {
        value: arr[mid],
        relation: arr[mid] > args.target ? '>' : '<=',
        target: args.target,
      }),
      probeIndex: mid,
      low,
      high,
      leftBound,
      rightBound,
      eliminated: [...upperEliminated],
      visitedOrder: visited,
      phase: 'compare',
    });

    visited.push(mid);

    if (arr[mid] <= args.target) {
      if (arr[mid] === args.target) {
        rightBound = mid;
      }

      for (let index = low; index < mid; index++) {
        upperEliminated.add(index);
      }
      low = mid + 1;

      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 16,
        description: i18nText(I18N.descriptions.moveRightForLast, { target: args.target }),
        modeLabel: I18N.modeLabels.upperBound,
        statusLabel:
          rightBound === null ? I18N.statuses.moveRight : I18N.statuses.lastMatchCandidate,
        decision:
          rightBound === null
            ? i18nText(I18N.decisions.advanceLow, { low })
            : i18nText(I18N.decisions.candidateLast, { index: rightBound }),
        low: low <= high ? low : null,
        high: low <= high ? high : null,
        leftBound,
        rightBound,
        eliminated: [...upperEliminated],
        visitedOrder: visited,
        phase: 'pass-complete',
      });
      continue;
    }

    for (let index = mid; index <= high; index++) {
      upperEliminated.add(index);
    }
    high = mid - 1;

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 18,
      description: i18nText(I18N.descriptions.tooLargeForLast, {
        value: arr[mid],
        target: args.target,
      }),
      modeLabel: I18N.modeLabels.upperBound,
      statusLabel: I18N.statuses.moveLeft,
      decision: i18nText(I18N.decisions.newHigh, { high }),
      low: low <= high ? low : null,
      high: low <= high ? high : null,
      leftBound,
      rightBound,
      eliminated: [...upperEliminated],
      visitedOrder: visited,
      phase: 'pass-complete',
    });
  }

  const resultIndices =
    leftBound !== null && rightBound !== null
      ? Array.from({ length: rightBound - leftBound + 1 }, (_, index) => leftBound + index)
      : [];

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 20,
    description:
      resultIndices.length > 0
        ? i18nText(I18N.descriptions.completeRange, {
            target: args.target,
            left: leftBound,
            right: rightBound,
          })
        : i18nText(I18N.descriptions.noFinalRange, { target: args.target }),
    modeLabel: I18N.modeLabels.boundsSearch,
    statusLabel: resultIndices.length > 0 ? I18N.statuses.rangeFound : I18N.statuses.notFound,
    decision:
      resultIndices.length > 0
        ? i18nText(I18N.decisions.rangeWidth, { count: resultIndices.length })
        : I18N.decisions.upperBoundSearchMiss,
    low: leftBound,
    high: rightBound,
    leftBound,
    rightBound,
    resultIndices,
    eliminated: [...upperEliminated],
    visitedOrder: visited,
    phase: 'complete',
  });
}
