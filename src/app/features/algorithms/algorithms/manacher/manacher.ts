import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import { ManacherTraceState } from '../../models/string';
import { ManacherScenario } from '../../utils/scenarios/string/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.manacher.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.string.manacher.phases.setup'),
    mirrorReuse: t('features.algorithms.runtime.string.manacher.phases.mirrorReuse'),
    expandPalindrome: t(
      'features.algorithms.runtime.string.manacher.phases.expandPalindrome',
    ),
    shiftWindow: t('features.algorithms.runtime.string.manacher.phases.shiftWindow'),
    complete: t('features.algorithms.runtime.string.manacher.phases.complete'),
  },
  insights: {
    sourceLabel: t('features.algorithms.runtime.string.manacher.insights.sourceLabel'),
    windowLabel: t('features.algorithms.runtime.string.manacher.insights.windowLabel'),
    centerLabel: t('features.algorithms.runtime.string.manacher.insights.centerLabel'),
    longestLabel: t('features.algorithms.runtime.string.manacher.insights.longestLabel'),
    charsValue: t('features.algorithms.runtime.string.manacher.insights.charsValue'),
    windowValue: t('features.algorithms.runtime.string.manacher.insights.windowValue'),
    emptyValue: t('features.algorithms.runtime.string.manacher.insights.emptyValue'),
  },
  descriptions: {
    transform: t('features.algorithms.runtime.string.manacher.descriptions.transform'),
    mirrorReuse: t('features.algorithms.runtime.string.manacher.descriptions.mirrorReuse'),
    expand: t('features.algorithms.runtime.string.manacher.descriptions.expand'),
    shiftWindow: t('features.algorithms.runtime.string.manacher.descriptions.shiftWindow'),
    complete: t('features.algorithms.runtime.string.manacher.descriptions.complete'),
  },
  decisions: {
    addSeparators: t('features.algorithms.runtime.string.manacher.decisions.addSeparators'),
    reuseMirror: t('features.algorithms.runtime.string.manacher.decisions.reuseMirror'),
    growOutward: t('features.algorithms.runtime.string.manacher.decisions.growOutward'),
    defineWindow: t('features.algorithms.runtime.string.manacher.decisions.defineWindow'),
    allRadiiKnown: t('features.algorithms.runtime.string.manacher.decisions.allRadiiKnown'),
  },
  computation: {
    labels: {
      transformedString: t(
        'features.algorithms.runtime.string.manacher.computation.labels.transformedString',
      ),
      mirrorSeed: t('features.algorithms.runtime.string.manacher.computation.labels.mirrorSeed'),
      expansionCompare: t(
        'features.algorithms.runtime.string.manacher.computation.labels.expansionCompare',
      ),
      boundaryUpdate: t(
        'features.algorithms.runtime.string.manacher.computation.labels.boundaryUpdate',
      ),
      longestPalindrome: t(
        'features.algorithms.runtime.string.manacher.computation.labels.longestPalindrome',
      ),
    },
    notes: {
      transformedString: t(
        'features.algorithms.runtime.string.manacher.computation.notes.transformedString',
      ),
      mirrorSeed: t('features.algorithms.runtime.string.manacher.computation.notes.mirrorSeed'),
      expansionCompare: t(
        'features.algorithms.runtime.string.manacher.computation.notes.expansionCompare',
      ),
      boundaryUpdate: t(
        'features.algorithms.runtime.string.manacher.computation.notes.boundaryUpdate',
      ),
      longestPalindrome: t(
        'features.algorithms.runtime.string.manacher.computation.notes.longestPalindrome',
      ),
    },
  },
  labels: {
    noPalindromeYet: t('features.algorithms.runtime.string.manacher.labels.noPalindromeYet'),
  },
} as const;

function transform(source: string): string {
  return `#${source.split('').join('#')}#`;
}

function extractPalindrome(source: string, center: number, radius: number): string {
  if (radius <= 0) return '';
  const start = Math.floor((center - radius) / 2);
  return source.slice(start, start + radius);
}

function makeState(args: {
  readonly scenario: ManacherScenario;
  readonly transformed: string;
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly radii: readonly number[];
  readonly currentCenter: number | null;
  readonly mirrorIndex: number | null;
  readonly leftBoundary: number | null;
  readonly rightBoundary: number | null;
  readonly activeRadius: number;
  readonly compareLeft: number | null;
  readonly compareRight: number | null;
  readonly longestCenter: number | null;
  readonly longestRadius: number;
  readonly computation: ManacherTraceState['computation'];
}): ManacherTraceState {
  const longestPalindrome =
    args.longestCenter === null
      ? ''
      : extractPalindrome(args.scenario.source, args.longestCenter, args.longestRadius);

  return {
    mode: 'manacher',
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
        label: I18N.insights.sourceLabel,
        value: i18nText(I18N.insights.charsValue, { count: args.scenario.source.length }),
        tone: 'info',
      },
      {
        label: I18N.insights.windowLabel,
        value:
          args.leftBoundary === null || args.rightBoundary === null
            ? I18N.insights.emptyValue
            : i18nText(I18N.insights.windowValue, {
                left: args.leftBoundary,
                right: args.rightBoundary,
              }),
        tone: 'warning',
      },
      {
        label: I18N.insights.centerLabel,
        value: args.currentCenter === null ? '—' : String(args.currentCenter),
        tone: 'accent',
      },
      {
        label: I18N.insights.longestLabel,
        value: longestPalindrome || '—',
        tone: longestPalindrome ? 'success' : 'info',
      },
    ],
    source: args.scenario.source,
    transformed: args.transformed,
    radii: args.radii,
    currentCenter: args.currentCenter,
    mirrorIndex: args.mirrorIndex,
    leftBoundary: args.leftBoundary,
    rightBoundary: args.rightBoundary,
    activeRadius: args.activeRadius,
    compareLeft: args.compareLeft,
    compareRight: args.compareRight,
    longestCenter: args.longestCenter,
    longestRadius: args.longestRadius,
    longestPalindrome,
  };
}

export function* manacherGenerator(
  scenario: ManacherScenario,
): Generator<SortStep> {
  const transformed = transform(scenario.source);
  const radii = Array.from({ length: transformed.length }, () => 0);

  let center = 0;
  let right = 0;
  let longestCenter = 0;
  let longestRadius = 0;

  yield createStringStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.transform, {
      source: scenario.source,
      transformed,
    }),
    phase: 'init',
    string: makeState({
      scenario,
      transformed,
      phaseLabel: I18N.phases.setup,
      activeLabel: 'center = 0',
      resultLabel: I18N.labels.noPalindromeYet,
      decisionLabel: I18N.decisions.addSeparators,
      radii,
      currentCenter: 0,
      mirrorIndex: null,
      leftBoundary: 0,
      rightBoundary: 0,
      activeRadius: 0,
      compareLeft: null,
      compareRight: null,
      longestCenter,
      longestRadius,
      computation: {
        label: I18N.computation.labels.transformedString,
        expression: `#${scenario.source.split('').join('#')}#`,
        result: transformed,
        note: I18N.computation.notes.transformedString,
      },
    }),
  });

  for (let index = 0; index < transformed.length; index++) {
    const mirror = 2 * center - index;

    if (index < right) {
      const reused = Math.min(right - index, radii[mirror] ?? 0);
      radii[index] = reused;

      yield createStringStep({
        activeCodeLine: 7,
        description: i18nText(I18N.descriptions.mirrorReuse, {
          reused,
          mirror,
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          transformed,
          phaseLabel: I18N.phases.mirrorReuse,
          activeLabel: `i = ${index}`,
          resultLabel:
            extractPalindrome(scenario.source, longestCenter, longestRadius) ||
            I18N.labels.noPalindromeYet,
          decisionLabel: I18N.decisions.reuseMirror,
          radii,
          currentCenter: index,
          mirrorIndex: mirror,
          leftBoundary: center - radii[center],
          rightBoundary: right,
          activeRadius: radii[index] ?? 0,
          compareLeft: null,
          compareRight: null,
          longestCenter,
          longestRadius,
          computation: {
            label: I18N.computation.labels.mirrorSeed,
            expression: `P[${index}] = min(${right - index}, P[${mirror}])`,
            result: String(reused),
            note: I18N.computation.notes.mirrorSeed,
          },
        }),
      });
    }

    while (
      index - (radii[index] ?? 0) - 1 >= 0 &&
      index + (radii[index] ?? 0) + 1 < transformed.length &&
      transformed[index - (radii[index] ?? 0) - 1] ===
        transformed[index + (radii[index] ?? 0) + 1]
    ) {
      const leftIndex = index - (radii[index] ?? 0) - 1;
      const rightIndex = index + (radii[index] ?? 0) + 1;

      yield createStringStep({
        activeCodeLine: 8,
        description: i18nText(I18N.descriptions.expand, {
          index,
          leftChar: transformed[leftIndex] ?? '∅',
          rightChar: transformed[rightIndex] ?? '∅',
        }),
        phase: 'compare',
        string: makeState({
          scenario,
          transformed,
          phaseLabel: I18N.phases.expandPalindrome,
          activeLabel: `center ${index}`,
          resultLabel:
            extractPalindrome(scenario.source, longestCenter, longestRadius) ||
            I18N.labels.noPalindromeYet,
          decisionLabel: I18N.decisions.growOutward,
          radii,
          currentCenter: index,
          mirrorIndex: mirror,
          leftBoundary: center - radii[center],
          rightBoundary: right,
          activeRadius: radii[index] ?? 0,
          compareLeft: leftIndex,
          compareRight: rightIndex,
          longestCenter,
          longestRadius,
          computation: {
            label: I18N.computation.labels.expansionCompare,
            expression: `T[${leftIndex}] = T[${rightIndex}]`,
            result: `"${transformed[leftIndex]}" = "${transformed[rightIndex]}"`,
            note: I18N.computation.notes.expansionCompare,
          },
        }),
      });

      radii[index]++;
    }

    if ((radii[index] ?? 0) > longestRadius) {
      longestCenter = index;
      longestRadius = radii[index] ?? 0;
    }

    if (index + (radii[index] ?? 0) > right) {
      center = index;
      right = index + (radii[index] ?? 0);

      yield createStringStep({
        activeCodeLine: 11,
        description: i18nText(I18N.descriptions.shiftWindow, { center, right }),
        phase: 'pass-complete',
        string: makeState({
          scenario,
          transformed,
          phaseLabel: I18N.phases.shiftWindow,
          activeLabel: `center ${center}, right ${right}`,
          resultLabel:
            extractPalindrome(scenario.source, longestCenter, longestRadius) ||
            I18N.labels.noPalindromeYet,
          decisionLabel: I18N.decisions.defineWindow,
          radii,
          currentCenter: center,
          mirrorIndex: mirror,
          leftBoundary: center - radii[center],
          rightBoundary: right,
          activeRadius: radii[index] ?? 0,
          compareLeft: null,
          compareRight: null,
          longestCenter,
          longestRadius,
          computation: {
            label: I18N.computation.labels.boundaryUpdate,
            expression: `center = ${center}, right = ${right}`,
            result: `[${center - radii[center]}, ${right}]`,
            note: I18N.computation.notes.boundaryUpdate,
          },
        }),
      });
    }
  }

  yield createStringStep({
    activeCodeLine: 11,
    description: i18nText(I18N.descriptions.complete, {
      palindrome: extractPalindrome(scenario.source, longestCenter, longestRadius) || '—',
    }),
    phase: 'complete',
    string: makeState({
      scenario,
      transformed,
      phaseLabel: I18N.phases.complete,
      activeLabel: `best center ${longestCenter}`,
      resultLabel:
        extractPalindrome(scenario.source, longestCenter, longestRadius) || I18N.labels.noPalindromeYet,
      decisionLabel: I18N.decisions.allRadiiKnown,
      radii,
      currentCenter: null,
      mirrorIndex: null,
      leftBoundary: center - radii[center],
      rightBoundary: right,
      activeRadius: 0,
      compareLeft: null,
      compareRight: null,
      longestCenter,
      longestRadius,
      computation: {
        label: I18N.computation.labels.longestPalindrome,
        expression: `P[${longestCenter}] = ${longestRadius}`,
        result: extractPalindrome(scenario.source, longestCenter, longestRadius) || '—',
        note: I18N.computation.notes.longestPalindrome,
      },
    }),
  });
}
