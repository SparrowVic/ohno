import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import { SortStep } from '../../models/sort-step';
import { createSearchStep } from '../search-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.search.binarySearch.modeLabel'),
  statuses: {
    ready: t('features.algorithms.runtime.search.binarySearch.statuses.ready'),
    comparing: t('features.algorithms.runtime.search.binarySearch.statuses.comparing'),
    found: t('features.algorithms.runtime.search.binarySearch.statuses.found'),
    moveRight: t('features.algorithms.runtime.search.binarySearch.statuses.moveRight'),
    moveLeft: t('features.algorithms.runtime.search.binarySearch.statuses.moveLeft'),
    notFound: t('features.algorithms.runtime.search.binarySearch.statuses.notFound'),
  },
  descriptions: {
    start: t('features.algorithms.runtime.search.binarySearch.descriptions.start'),
    probe: t('features.algorithms.runtime.search.binarySearch.descriptions.probe'),
    found: t('features.algorithms.runtime.search.binarySearch.descriptions.found'),
    moveRight: t('features.algorithms.runtime.search.binarySearch.descriptions.moveRight'),
    moveLeft: t('features.algorithms.runtime.search.binarySearch.descriptions.moveLeft'),
    notFound: t('features.algorithms.runtime.search.binarySearch.descriptions.notFound'),
  },
  decisions: {
    compare: t('features.algorithms.runtime.search.binarySearch.decisions.compare'),
    collapsedWindow: t(
      'features.algorithms.runtime.search.binarySearch.decisions.collapsedWindow',
    ),
    newWindow: t('features.algorithms.runtime.search.binarySearch.decisions.newWindow'),
    candidateWindowEmpty: t(
      'features.algorithms.runtime.search.binarySearch.decisions.candidateWindowEmpty',
    ),
  },
} as const;

export function* binarySearchGenerator(args: {
  readonly array: readonly number[];
  readonly target: number;
}): Generator<SortStep> {
  const arr = [...args.array];
  const visited: number[] = [];
  const eliminated = new Set<number>();
  let low = 0;
  let high = arr.length - 1;

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { target: args.target }),
    modeLabel: I18N.modeLabel,
    statusLabel: I18N.statuses.ready,
    low: arr.length > 0 ? low : null,
    high: arr.length > 0 ? high : null,
    phase: 'init',
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 3,
      description: i18nText(I18N.descriptions.probe, {
        index: mid,
        value: arr[mid],
        target: args.target,
      }),
      modeLabel: I18N.modeLabel,
      statusLabel: I18N.statuses.comparing,
      decision: i18nText(I18N.decisions.compare, {
        value: arr[mid],
        relation: arr[mid] === args.target ? '=' : arr[mid] < args.target ? '<' : '>',
        target: args.target,
      }),
      probeIndex: mid,
      low,
      high,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'compare',
    });

    visited.push(mid);

    if (arr[mid] === args.target) {
      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 5,
        description: i18nText(I18N.descriptions.found, { target: args.target, index: mid }),
        modeLabel: I18N.modeLabel,
        statusLabel: I18N.statuses.found,
        decision: i18nText(I18N.decisions.collapsedWindow, { index: mid }),
        probeIndex: mid,
        low: mid,
        high: mid,
        resultIndices: [mid],
        visitedOrder: visited,
        phase: 'complete',
      });
      return;
    }

    if (arr[mid] < args.target) {
      for (let index = low; index <= mid; index++) {
        eliminated.add(index);
      }
      low = mid + 1;

      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 8,
        description: i18nText(I18N.descriptions.moveRight, {
          value: arr[mid],
          target: args.target,
        }),
        modeLabel: I18N.modeLabel,
        statusLabel: I18N.statuses.moveRight,
        decision: i18nText(I18N.decisions.newWindow, { low, high }),
        low: low <= high ? low : null,
        high: low <= high ? high : null,
        eliminated: [...eliminated],
        visitedOrder: visited,
        phase: 'pass-complete',
      });
      continue;
    }

    for (let index = mid; index <= high; index++) {
      eliminated.add(index);
    }
    high = mid - 1;

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 10,
      description: i18nText(I18N.descriptions.moveLeft, {
        value: arr[mid],
        target: args.target,
      }),
      modeLabel: I18N.modeLabel,
      statusLabel: I18N.statuses.moveLeft,
      decision: i18nText(I18N.decisions.newWindow, { low, high }),
      low: low <= high ? low : null,
      high: low <= high ? high : null,
      eliminated: [...eliminated],
      visitedOrder: visited,
      phase: 'pass-complete',
    });
  }

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 12,
    description: i18nText(I18N.descriptions.notFound, { target: args.target }),
    modeLabel: I18N.modeLabel,
    statusLabel: I18N.statuses.notFound,
    decision: I18N.decisions.candidateWindowEmpty,
    low: null,
    high: null,
    eliminated: [...eliminated],
    visitedOrder: visited,
    phase: 'complete',
  });
}
