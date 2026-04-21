import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import { SortStep } from '../../models/sort-step';
import { createSearchStep } from '../search-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.search.linearSearch.modeLabel'),
  statuses: {
    ready: t('features.algorithms.runtime.search.linearSearch.statuses.ready'),
    comparing: t('features.algorithms.runtime.search.linearSearch.statuses.comparing'),
    found: t('features.algorithms.runtime.search.linearSearch.statuses.found'),
    advance: t('features.algorithms.runtime.search.linearSearch.statuses.advance'),
    notFound: t('features.algorithms.runtime.search.linearSearch.statuses.notFound'),
  },
  descriptions: {
    start: t('features.algorithms.runtime.search.linearSearch.descriptions.start'),
    inspect: t('features.algorithms.runtime.search.linearSearch.descriptions.inspect'),
    found: t('features.algorithms.runtime.search.linearSearch.descriptions.found'),
    advance: t('features.algorithms.runtime.search.linearSearch.descriptions.advance'),
    notFound: t('features.algorithms.runtime.search.linearSearch.descriptions.notFound'),
  },
  decisions: {
    compare: t('features.algorithms.runtime.search.linearSearch.decisions.compare'),
    stopAtIndex: t('features.algorithms.runtime.search.linearSearch.decisions.stopAtIndex'),
    discardIndex: t('features.algorithms.runtime.search.linearSearch.decisions.discardIndex'),
    allSlotsExhausted: t(
      'features.algorithms.runtime.search.linearSearch.decisions.allSlotsExhausted',
    ),
  },
} as const;

export function* linearSearchGenerator(args: {
  readonly array: readonly number[];
  readonly target: number;
}): Generator<SortStep> {
  const arr = [...args.array];
  const size = arr.length;
  const visited: number[] = [];
  const eliminated: number[] = [];

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.start, { target: args.target, size }),
    modeLabel: I18N.modeLabel,
    statusLabel: I18N.statuses.ready,
    low: size > 0 ? 0 : null,
    high: size > 0 ? size - 1 : null,
    phase: 'init',
  });

  for (let index = 0; index < size; index++) {
    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.inspect, {
        index,
        value: arr[index],
        target: args.target,
      }),
      modeLabel: I18N.modeLabel,
      statusLabel: I18N.statuses.comparing,
      decision: i18nText(I18N.decisions.compare, {
        value: arr[index],
        relation: arr[index] === args.target ? '=' : '≠',
        target: args.target,
      }),
      probeIndex: index,
      low: index,
      high: size - 1,
      eliminated,
      visitedOrder: visited,
      phase: 'compare',
    });

    visited.push(index);

    if (arr[index] === args.target) {
      yield createSearchStep({
        array: arr,
        target: args.target,
        activeCodeLine: 3,
        description: i18nText(I18N.descriptions.found, { target: args.target, index }),
        modeLabel: I18N.modeLabel,
        statusLabel: I18N.statuses.found,
        decision: i18nText(I18N.decisions.stopAtIndex, { index }),
        probeIndex: index,
        low: index,
        high: index,
        resultIndices: [index],
        visitedOrder: visited,
        phase: 'complete',
      });
      return;
    }

    eliminated.push(index);

    yield createSearchStep({
      array: arr,
      target: args.target,
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.advance, {
        value: arr[index],
        target: args.target,
      }),
      modeLabel: I18N.modeLabel,
      statusLabel: I18N.statuses.advance,
      decision: i18nText(I18N.decisions.discardIndex, { index }),
      low: index + 1 < size ? index + 1 : null,
      high: index + 1 < size ? size - 1 : null,
      eliminated,
      visitedOrder: visited,
      phase: 'pass-complete',
    });
  }

  yield createSearchStep({
    array: arr,
    target: args.target,
    activeCodeLine: 7,
    description: i18nText(I18N.descriptions.notFound, { target: args.target }),
    modeLabel: I18N.modeLabel,
    statusLabel: I18N.statuses.notFound,
    decision: I18N.decisions.allSlotsExhausted,
    low: null,
    high: null,
    eliminated,
    visitedOrder: visited,
    phase: 'complete',
  });
}
