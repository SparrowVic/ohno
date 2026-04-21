import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import { ZAlgorithmTraceState } from '../../models/string';
import { ZAlgorithmScenario } from '../../utils/string-scenarios/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.zAlgorithm.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.string.zAlgorithm.phases.setup'),
    reuseBox: t('features.algorithms.runtime.string.zAlgorithm.phases.reuseBox'),
    expandBar: t('features.algorithms.runtime.string.zAlgorithm.phases.expandBar'),
    shiftBox: t('features.algorithms.runtime.string.zAlgorithm.phases.shiftBox'),
    patternHit: t('features.algorithms.runtime.string.zAlgorithm.phases.patternHit'),
    complete: t('features.algorithms.runtime.string.zAlgorithm.phases.complete'),
  },
  insights: {
    patternLabel: t('features.algorithms.runtime.string.zAlgorithm.insights.patternLabel'),
    combinedLabel: t('features.algorithms.runtime.string.zAlgorithm.insights.combinedLabel'),
    boxLabel: t('features.algorithms.runtime.string.zAlgorithm.insights.boxLabel'),
    hitsLabel: t('features.algorithms.runtime.string.zAlgorithm.insights.hitsLabel'),
    charsValue: t('features.algorithms.runtime.string.zAlgorithm.insights.charsValue'),
    boxValue: t('features.algorithms.runtime.string.zAlgorithm.insights.boxValue'),
    emptyValue: t('features.algorithms.runtime.string.zAlgorithm.insights.emptyValue'),
    noneValue: t('features.algorithms.runtime.string.zAlgorithm.insights.noneValue'),
  },
  descriptions: {
    buildArray: t('features.algorithms.runtime.string.zAlgorithm.descriptions.buildArray'),
    reuseBox: t('features.algorithms.runtime.string.zAlgorithm.descriptions.reuseBox'),
    expandBar: t('features.algorithms.runtime.string.zAlgorithm.descriptions.expandBar'),
    shiftBox: t('features.algorithms.runtime.string.zAlgorithm.descriptions.shiftBox'),
    patternHit: t('features.algorithms.runtime.string.zAlgorithm.descriptions.patternHit'),
    completeNoMatch: t(
      'features.algorithms.runtime.string.zAlgorithm.descriptions.completeNoMatch',
    ),
    completeMatches: t(
      'features.algorithms.runtime.string.zAlgorithm.descriptions.completeMatches',
    ),
  },
  decisions: {
    skylineStartsFlat: t(
      'features.algorithms.runtime.string.zAlgorithm.decisions.skylineStartsFlat',
    ),
    copyGuaranteedPart: t(
      'features.algorithms.runtime.string.zAlgorithm.decisions.copyGuaranteedPart',
    ),
    growTaller: t('features.algorithms.runtime.string.zAlgorithm.decisions.growTaller'),
    reuseFutureWork: t('features.algorithms.runtime.string.zAlgorithm.decisions.reuseFutureWork'),
    fullHeightBar: t('features.algorithms.runtime.string.zAlgorithm.decisions.fullHeightBar'),
    noFullHeightBar: t('features.algorithms.runtime.string.zAlgorithm.decisions.noFullHeightBar'),
    revealAllMatches: t('features.algorithms.runtime.string.zAlgorithm.decisions.revealAllMatches'),
  },
  computation: {
    labels: {
      combinedString: t(
        'features.algorithms.runtime.string.zAlgorithm.computation.labels.combinedString',
      ),
      boxReuse: t('features.algorithms.runtime.string.zAlgorithm.computation.labels.boxReuse'),
      expansionCompare: t(
        'features.algorithms.runtime.string.zAlgorithm.computation.labels.expansionCompare',
      ),
      boxUpdate: t('features.algorithms.runtime.string.zAlgorithm.computation.labels.boxUpdate'),
      fullBar: t('features.algorithms.runtime.string.zAlgorithm.computation.labels.fullBar'),
      finalSkyline: t(
        'features.algorithms.runtime.string.zAlgorithm.computation.labels.finalSkyline',
      ),
    },
    notes: {
      combinedString: t(
        'features.algorithms.runtime.string.zAlgorithm.computation.notes.combinedString',
      ),
      boxReuse: t('features.algorithms.runtime.string.zAlgorithm.computation.notes.boxReuse'),
      expansionCompare: t(
        'features.algorithms.runtime.string.zAlgorithm.computation.notes.expansionCompare',
      ),
      boxUpdate: t('features.algorithms.runtime.string.zAlgorithm.computation.notes.boxUpdate'),
      fullBar: t('features.algorithms.runtime.string.zAlgorithm.computation.notes.fullBar'),
      finalSkyline: t(
        'features.algorithms.runtime.string.zAlgorithm.computation.notes.finalSkyline',
      ),
    },
  },
  labels: {
    noFullPatternBar: t('features.algorithms.runtime.string.zAlgorithm.labels.noFullPatternBar'),
    noHitYet: t('features.algorithms.runtime.string.zAlgorithm.labels.noHitYet'),
    noMatch: t('features.algorithms.runtime.string.zAlgorithm.labels.noMatch'),
    noHit: t('features.algorithms.runtime.string.zAlgorithm.labels.noHit'),
    hitCount: t('features.algorithms.runtime.string.zAlgorithm.labels.hitCount'),
  },
} as const;

function makeState(args: {
  readonly scenario: ZAlgorithmScenario;
  readonly combined: string;
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly zValues: readonly number[];
  readonly activeIndex: number | null;
  readonly boxLeft: number | null;
  readonly boxRight: number | null;
  readonly comparePrefixIndex: number | null;
  readonly compareMatchIndex: number | null;
  readonly matches: readonly number[];
  readonly computation: ZAlgorithmTraceState['computation'];
}): ZAlgorithmTraceState {
  return {
    mode: 'z-algorithm',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      {
        label: I18N.insights.patternLabel,
        value: i18nText(I18N.insights.charsValue, { count: args.scenario.pattern.length }),
        tone: 'accent',
      },
      {
        label: I18N.insights.combinedLabel,
        value: i18nText(I18N.insights.charsValue, { count: args.combined.length }),
        tone: 'info',
      },
      {
        label: I18N.insights.boxLabel,
        value:
          args.boxLeft === null || args.boxRight === null
            ? I18N.insights.emptyValue
            : i18nText(I18N.insights.boxValue, { left: args.boxLeft, right: args.boxRight }),
        tone: 'warning',
      },
      {
        label: I18N.insights.hitsLabel,
        value: args.matches.length === 0 ? I18N.insights.noneValue : args.matches.join(', '),
        tone: args.matches.length === 0 ? 'info' : 'success',
      },
    ],
    combined: args.combined,
    patternLength: args.scenario.pattern.length,
    zValues: args.zValues,
    activeIndex: args.activeIndex,
    boxLeft: args.boxLeft,
    boxRight: args.boxRight,
    comparePrefixIndex: args.comparePrefixIndex,
    compareMatchIndex: args.compareMatchIndex,
    matches: args.matches,
  };
}

export function* zAlgorithmGenerator(
  scenario: ZAlgorithmScenario,
): Generator<SortStep> {
  const combined = `${scenario.pattern}$${scenario.text}`;
  const zValues = Array.from({ length: combined.length }, (_, index) =>
    index === 0 ? combined.length : 0,
  );
  const matches: number[] = [];

  yield createStringStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.buildArray, {
      combined: `${scenario.pattern}$${scenario.text}`,
    }),
    phase: 'init',
    string: makeState({
      scenario,
      combined,
      phaseLabel: I18N.phases.setup,
      activeLabel: 'Z[0] = |S|',
      resultLabel: I18N.labels.noFullPatternBar,
      decisionLabel: I18N.decisions.skylineStartsFlat,
      zValues,
      activeIndex: 0,
      boxLeft: 0,
      boxRight: 0,
      comparePrefixIndex: null,
      compareMatchIndex: null,
      matches,
      computation: {
        label: I18N.computation.labels.combinedString,
        expression: `${scenario.pattern} + "$" + ${scenario.text}`,
        result: combined,
        note: I18N.computation.notes.combinedString,
      },
    }),
  });

  let left = 0;
  let right = 0;

  for (let index = 1; index < combined.length; index++) {
    if (index <= right) {
      const reused = Math.min(right - index + 1, zValues[index - left] ?? 0);
      zValues[index] = reused;

      yield createStringStep({
        activeCodeLine: 5,
        description: i18nText(I18N.descriptions.reuseBox, {
          index,
          remaining: right - index + 1,
          sourceIndex: index - left,
          reused,
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          combined,
          phaseLabel: I18N.phases.reuseBox,
          activeLabel: `i = ${index}`,
          resultLabel: matches.length === 0 ? I18N.labels.noHitYet : matches.join(', '),
          decisionLabel: I18N.decisions.copyGuaranteedPart,
          zValues,
          activeIndex: index,
          boxLeft: left,
          boxRight: right,
          comparePrefixIndex: index - left,
          compareMatchIndex: index,
          matches,
          computation: {
            label: I18N.computation.labels.boxReuse,
            expression: `Z[${index}] = min(${right - index + 1}, Z[${index - left}])`,
            result: String(reused),
            note: I18N.computation.notes.boxReuse,
          },
        }),
      });
    }

    while (
      index + zValues[index] < combined.length &&
      combined[zValues[index] ?? 0] === combined[index + (zValues[index] ?? 0)]
    ) {
      const prefixIndex = zValues[index] ?? 0;
      const matchIndex = index + prefixIndex;

      yield createStringStep({
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.expandBar, {
          index,
          prefixChar: combined[prefixIndex] ?? '∅',
          matchChar: combined[matchIndex] ?? '∅',
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          combined,
          phaseLabel: I18N.phases.expandBar,
          activeLabel: `Z[${index}] = ${zValues[index]}`,
          resultLabel: matches.length === 0 ? I18N.labels.noHitYet : matches.join(', '),
          decisionLabel: I18N.decisions.growTaller,
          zValues,
          activeIndex: index,
          boxLeft: left,
          boxRight: right,
          comparePrefixIndex: prefixIndex,
          compareMatchIndex: matchIndex,
          matches,
          computation: {
            label: I18N.computation.labels.expansionCompare,
            expression: `S[${prefixIndex}] = S[${matchIndex}]`,
            result: `"${combined[prefixIndex]}" = "${combined[matchIndex]}"`,
            note: I18N.computation.notes.expansionCompare,
          },
        }),
      });

      zValues[index]++;
    }

    if (index + zValues[index] - 1 > right) {
      left = index;
      right = index + zValues[index] - 1;

      yield createStringStep({
        activeCodeLine: 9,
        description: i18nText(I18N.descriptions.shiftBox, { left, right }),
        phase: 'pass-complete',
        string: makeState({
          scenario,
          combined,
          phaseLabel: I18N.phases.shiftBox,
          activeLabel: `[L, R] = [${left}, ${right}]`,
          resultLabel: matches.length === 0 ? I18N.labels.noHitYet : matches.join(', '),
          decisionLabel: I18N.decisions.reuseFutureWork,
          zValues,
          activeIndex: index,
          boxLeft: left,
          boxRight: right,
          comparePrefixIndex: null,
          compareMatchIndex: null,
          matches,
          computation: {
            label: I18N.computation.labels.boxUpdate,
            expression: `[L, R] = [${index}, ${index + zValues[index] - 1}]`,
            result: `[${left}, ${right}]`,
            note: I18N.computation.notes.boxUpdate,
          },
        }),
      });
    }

    const textOffset = index - scenario.pattern.length - 1;
    if (textOffset >= 0 && (zValues[index] ?? 0) >= scenario.pattern.length) {
      matches.push(textOffset);

      yield createStringStep({
        activeCodeLine: 9,
        description: i18nText(I18N.descriptions.patternHit, { index, textOffset }),
        phase: 'complete',
        string: makeState({
          scenario,
          combined,
          phaseLabel: I18N.phases.patternHit,
          activeLabel: `match @ ${textOffset}`,
          resultLabel: matches.join(', '),
          decisionLabel: I18N.decisions.fullHeightBar,
          zValues,
          activeIndex: index,
          boxLeft: left,
          boxRight: right,
          comparePrefixIndex: null,
          compareMatchIndex: null,
          matches,
          computation: {
            label: I18N.computation.labels.fullBar,
            expression: `Z[${index}] ≥ |pattern|`,
            result: `${zValues[index]} ≥ ${scenario.pattern.length}`,
            note: I18N.computation.notes.fullBar,
          },
        }),
      });
    }
  }

  yield createStringStep({
    activeCodeLine: 9,
    description:
      matches.length === 0
        ? I18N.descriptions.completeNoMatch
        : i18nText(I18N.descriptions.completeMatches, { matches: matches.join(', ') }),
    phase: 'complete',
    string: makeState({
      scenario,
      combined,
      phaseLabel: I18N.phases.complete,
      activeLabel:
        matches.length === 0
          ? I18N.labels.noHit
          : i18nText(I18N.labels.hitCount, { count: matches.length }),
      resultLabel: matches.length === 0 ? I18N.labels.noMatch : matches.join(', '),
      decisionLabel:
        matches.length === 0
          ? I18N.decisions.noFullHeightBar
          : I18N.decisions.revealAllMatches,
      zValues,
      activeIndex: null,
      boxLeft: left,
      boxRight: right,
      comparePrefixIndex: null,
      compareMatchIndex: null,
      matches,
      computation: {
        label: I18N.computation.labels.finalSkyline,
        expression: 'Z values',
        result: `[${zValues.join(', ')}]`,
        note: I18N.computation.notes.finalSkyline,
      },
    }),
  });
}
