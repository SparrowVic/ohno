import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import { KmpTraceState } from '../../models/string';
import { KmpScenario } from '../../utils/scenarios/string/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.kmp.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.string.kmp.phases.setup'),
    buildFailure: t('features.algorithms.runtime.string.kmp.phases.buildFailure'),
    failureFallback: t('features.algorithms.runtime.string.kmp.phases.failureFallback'),
    failureCommit: t('features.algorithms.runtime.string.kmp.phases.failureCommit'),
    searchReady: t('features.algorithms.runtime.string.kmp.phases.searchReady'),
    characterMatch: t('features.algorithms.runtime.string.kmp.phases.characterMatch'),
    mismatchCheck: t('features.algorithms.runtime.string.kmp.phases.mismatchCheck'),
    matchReported: t('features.algorithms.runtime.string.kmp.phases.matchReported'),
    advance: t('features.algorithms.runtime.string.kmp.phases.advance'),
    failureJump: t('features.algorithms.runtime.string.kmp.phases.failureJump'),
    shiftText: t('features.algorithms.runtime.string.kmp.phases.shiftText'),
    complete: t('features.algorithms.runtime.string.kmp.phases.complete'),
  },
  insights: {
    textLabel: t('features.algorithms.runtime.string.kmp.insights.textLabel'),
    patternLabel: t('features.algorithms.runtime.string.kmp.insights.patternLabel'),
    failureReadyLabel: t('features.algorithms.runtime.string.kmp.insights.failureReadyLabel'),
    hitsLabel: t('features.algorithms.runtime.string.kmp.insights.hitsLabel'),
    charsValue: t('features.algorithms.runtime.string.kmp.insights.charsValue'),
    failureReadyValue: t('features.algorithms.runtime.string.kmp.insights.failureReadyValue'),
    noneValue: t('features.algorithms.runtime.string.kmp.insights.noneValue'),
  },
  descriptions: {
    prepare: t('features.algorithms.runtime.string.kmp.descriptions.prepare'),
    compareFailureChars: t('features.algorithms.runtime.string.kmp.descriptions.compareFailureChars'),
    failureBuildMismatch: t(
      'features.algorithms.runtime.string.kmp.descriptions.failureBuildMismatch',
    ),
    failureCommit: t('features.algorithms.runtime.string.kmp.descriptions.failureCommit'),
    failureTableReady: t('features.algorithms.runtime.string.kmp.descriptions.failureTableReady'),
    compareTextPattern: t('features.algorithms.runtime.string.kmp.descriptions.compareTextPattern'),
    fullMatchFound: t('features.algorithms.runtime.string.kmp.descriptions.fullMatchFound'),
    advance: t('features.algorithms.runtime.string.kmp.descriptions.advance'),
    failureJump: t('features.algorithms.runtime.string.kmp.descriptions.failureJump'),
    shiftText: t('features.algorithms.runtime.string.kmp.descriptions.shiftText'),
    completeNoMatch: t('features.algorithms.runtime.string.kmp.descriptions.completeNoMatch'),
    completeMatches: t('features.algorithms.runtime.string.kmp.descriptions.completeMatches'),
  },
  decisions: {
    buildFailureTable: t('features.algorithms.runtime.string.kmp.decisions.buildFailureTable'),
    extendOverlap: t('features.algorithms.runtime.string.kmp.decisions.extendOverlap'),
    keepPaidWork: t('features.algorithms.runtime.string.kmp.decisions.keepPaidWork'),
    noBorderYet: t('features.algorithms.runtime.string.kmp.decisions.noBorderYet'),
    keepBorderLength: t('features.algorithms.runtime.string.kmp.decisions.keepBorderLength'),
    jumpByFailureLinks: t('features.algorithms.runtime.string.kmp.decisions.jumpByFailureLinks'),
    advanceBothPointers: t('features.algorithms.runtime.string.kmp.decisions.advanceBothPointers'),
    eitherJumpOrMove: t('features.algorithms.runtime.string.kmp.decisions.eitherJumpOrMove'),
    restartPattern: t('features.algorithms.runtime.string.kmp.decisions.restartPattern'),
    reuseOverlapOfLength: t('features.algorithms.runtime.string.kmp.decisions.reuseOverlapOfLength'),
    keepExtendingWindow: t('features.algorithms.runtime.string.kmp.decisions.keepExtendingWindow'),
    sameTextChar: t('features.algorithms.runtime.string.kmp.decisions.sameTextChar'),
    noReusablePrefix: t('features.algorithms.runtime.string.kmp.decisions.noReusablePrefix'),
    noMatchFound: t('features.algorithms.runtime.string.kmp.decisions.noMatchFound'),
    allMatchesFound: t('features.algorithms.runtime.string.kmp.decisions.allMatchesFound'),
    preventedBacktracking: t(
      'features.algorithms.runtime.string.kmp.decisions.preventedBacktracking',
    ),
  },
  computation: {
    labels: {
      failureSeed: t('features.algorithms.runtime.string.kmp.computation.labels.failureSeed'),
      prefixCompare: t('features.algorithms.runtime.string.kmp.computation.labels.prefixCompare'),
      failureFallback: t(
        'features.algorithms.runtime.string.kmp.computation.labels.failureFallback',
      ),
      failureValue: t('features.algorithms.runtime.string.kmp.computation.labels.failureValue'),
      readyToScan: t('features.algorithms.runtime.string.kmp.computation.labels.readyToScan'),
      currentCompare: t('features.algorithms.runtime.string.kmp.computation.labels.currentCompare'),
      postMatchJump: t('features.algorithms.runtime.string.kmp.computation.labels.postMatchJump'),
      pointerUpdate: t('features.algorithms.runtime.string.kmp.computation.labels.pointerUpdate'),
      failureJump: t('features.algorithms.runtime.string.kmp.computation.labels.failureJump'),
      textShift: t('features.algorithms.runtime.string.kmp.computation.labels.textShift'),
      finalOutcome: t('features.algorithms.runtime.string.kmp.computation.labels.finalOutcome'),
    },
    notes: {
      failureSeed: t('features.algorithms.runtime.string.kmp.computation.notes.failureSeed'),
      prefixCompare: t('features.algorithms.runtime.string.kmp.computation.notes.prefixCompare'),
      failureFallback: t(
        'features.algorithms.runtime.string.kmp.computation.notes.failureFallback',
      ),
      failureValueEmpty: t(
        'features.algorithms.runtime.string.kmp.computation.notes.failureValueEmpty',
      ),
      failureValueBorder: t(
        'features.algorithms.runtime.string.kmp.computation.notes.failureValueBorder',
      ),
      readyToScan: t('features.algorithms.runtime.string.kmp.computation.notes.readyToScan'),
      currentCompareMatch: t(
        'features.algorithms.runtime.string.kmp.computation.notes.currentCompareMatch',
      ),
      currentCompareMismatch: t(
        'features.algorithms.runtime.string.kmp.computation.notes.currentCompareMismatch',
      ),
      postMatchJump: t('features.algorithms.runtime.string.kmp.computation.notes.postMatchJump'),
      pointerUpdate: t('features.algorithms.runtime.string.kmp.computation.notes.pointerUpdate'),
      failureJump: t('features.algorithms.runtime.string.kmp.computation.notes.failureJump'),
      textShift: t('features.algorithms.runtime.string.kmp.computation.notes.textShift'),
      finalOutcome: t('features.algorithms.runtime.string.kmp.computation.notes.finalOutcome'),
    },
  },
  labels: {
    noMatchesYet: t('features.algorithms.runtime.string.kmp.labels.noMatchesYet'),
    noFullHitsYet: t('features.algorithms.runtime.string.kmp.labels.noFullHitsYet'),
    noMatch: t('features.algorithms.runtime.string.kmp.labels.noMatch'),
    noHit: t('features.algorithms.runtime.string.kmp.labels.noHit'),
    hitCount: t('features.algorithms.runtime.string.kmp.labels.hitCount'),
  },
} as const;

function makeState(args: {
  readonly scenario: KmpScenario;
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly failure: readonly number[];
  readonly failureReadyIndex: number;
  readonly alignment: number;
  readonly textIndex: number | null;
  readonly patternIndex: number | null;
  readonly compareTextIndex: number | null;
  readonly comparePatternIndex: number | null;
  readonly fallbackFrom: number | null;
  readonly fallbackTo: number | null;
  readonly matches: readonly number[];
  readonly stage: KmpTraceState['stage'];
  readonly computation: KmpTraceState['computation'];
}): KmpTraceState {
  const matchedCount = args.matches.length;

  return {
    mode: 'kmp',
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
        label: I18N.insights.textLabel,
        value: i18nText(I18N.insights.charsValue, { count: args.scenario.text.length }),
        tone: 'info',
      },
      {
        label: I18N.insights.patternLabel,
        value: i18nText(I18N.insights.charsValue, { count: args.scenario.pattern.length }),
        tone: 'accent',
      },
      {
        label: I18N.insights.failureReadyLabel,
        value: i18nText(I18N.insights.failureReadyValue, {
          current: Math.max(args.failureReadyIndex + 1, 0),
          total: args.scenario.pattern.length,
        }),
        tone: 'warning',
      },
      {
        label: I18N.insights.hitsLabel,
        value: matchedCount === 0 ? I18N.insights.noneValue : args.matches.join(', '),
        tone: matchedCount === 0 ? 'info' : 'success',
      },
    ],
    stage: args.stage,
    text: args.scenario.text,
    pattern: args.scenario.pattern,
    failure: args.failure,
    failureReadyIndex: args.failureReadyIndex,
    alignment: args.alignment,
    textIndex: args.textIndex,
    patternIndex: args.patternIndex,
    compareTextIndex: args.compareTextIndex,
    comparePatternIndex: args.comparePatternIndex,
    fallbackFrom: args.fallbackFrom,
    fallbackTo: args.fallbackTo,
    matches: args.matches,
  };
}

export function* kmpPatternMatchingGenerator(
  scenario: KmpScenario,
): Generator<SortStep> {
  const text = scenario.text;
  const pattern = scenario.pattern;
  const failure = Array.from({ length: pattern.length }, () => 0);
  const matches: number[] = [];

  yield createStringStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.prepare, { pattern, text }),
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.setup,
      activeLabel: 'failure[0] = 0',
      resultLabel: I18N.labels.noMatchesYet,
      decisionLabel: I18N.decisions.buildFailureTable,
      failure,
      failureReadyIndex: 0,
      alignment: 0,
      textIndex: null,
      patternIndex: 0,
      compareTextIndex: null,
      comparePatternIndex: null,
      fallbackFrom: null,
      fallbackTo: null,
      matches,
      stage: 'failure',
      computation: {
        label: I18N.computation.labels.failureSeed,
        expression: 'fail[0] = 0',
        result: '0',
        note: I18N.computation.notes.failureSeed,
      },
    }),
  });

  let prefix = 0;
  for (let index = 1; index < pattern.length; index++) {
    yield createStringStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.compareFailureChars, {
        index,
        current: pattern[index] ?? '∅',
        prefix,
        prefixChar: pattern[prefix] ?? '∅',
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.buildFailure,
        activeLabel: `fail[${index}]`,
        resultLabel: failure.slice(0, Math.max(index, 1)).join(' · ') || '0',
        decisionLabel: I18N.decisions.extendOverlap,
        failure,
        failureReadyIndex: index - 1,
        alignment: 0,
        textIndex: null,
        patternIndex: prefix,
        compareTextIndex: null,
        comparePatternIndex: index,
        fallbackFrom: null,
        fallbackTo: null,
        matches,
        stage: 'failure',
        computation: {
          label: I18N.computation.labels.prefixCompare,
          expression: `pattern[${index}] ?= pattern[${prefix}]`,
          result: `${pattern[index] ?? '∅'} vs ${pattern[prefix] ?? '∅'}`,
          note: I18N.computation.notes.prefixCompare,
        },
      }),
    });

    while (prefix > 0 && pattern[index] !== pattern[prefix]) {
      const nextPrefix = failure[prefix - 1] ?? 0;
      yield createStringStep({
        activeCodeLine: 2,
        description: i18nText(I18N.descriptions.failureBuildMismatch, {
          from: prefix - 1,
          next: nextPrefix,
        }),
        phase: 'pass-complete',
        string: makeState({
          scenario,
          phaseLabel: I18N.phases.failureFallback,
          activeLabel: `prefix ${prefix} → ${nextPrefix}`,
          resultLabel: failure.slice(0, Math.max(index, 1)).join(' · ') || '0',
          decisionLabel: I18N.decisions.keepPaidWork,
          failure,
          failureReadyIndex: index - 1,
          alignment: 0,
          textIndex: null,
          patternIndex: prefix,
          compareTextIndex: null,
          comparePatternIndex: index,
          fallbackFrom: prefix,
          fallbackTo: nextPrefix,
          matches,
          stage: 'failure',
          computation: {
            label: I18N.computation.labels.failureFallback,
            expression: `prefix = fail[${prefix - 1}]`,
            result: String(nextPrefix),
            note: I18N.computation.notes.failureFallback,
          },
        }),
      });
      prefix = nextPrefix;
    }

    if (pattern[index] === pattern[prefix]) {
      prefix++;
    }
    failure[index] = prefix;

    yield createStringStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.failureCommit, { index, prefix }),
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.failureCommit,
        activeLabel: `fail[${index}] = ${prefix}`,
        resultLabel: failure.slice(0, index + 1).join(' · '),
        decisionLabel:
          prefix === 0
            ? I18N.decisions.noBorderYet
            : i18nText(I18N.decisions.keepBorderLength, { prefix }),
        failure,
        failureReadyIndex: index,
        alignment: 0,
        textIndex: null,
        patternIndex: prefix,
        compareTextIndex: null,
        comparePatternIndex: index,
        fallbackFrom: null,
        fallbackTo: null,
        matches,
        stage: 'failure',
        computation: {
          label: I18N.computation.labels.failureValue,
          expression: `fail[${index}] = ${prefix}`,
          result: String(prefix),
          note:
            prefix === 0
              ? I18N.computation.notes.failureValueEmpty
              : I18N.computation.notes.failureValueBorder,
        },
      }),
    });
  }

  yield createStringStep({
    activeCodeLine: 3,
    description: i18nText(I18N.descriptions.failureTableReady, {
      failure: failure.join(', '),
    }),
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.searchReady,
      activeLabel: 'i = 0, j = 0',
      resultLabel: `[${failure.join(', ')}]`,
      decisionLabel: I18N.decisions.jumpByFailureLinks,
      failure,
      failureReadyIndex: pattern.length - 1,
      alignment: 0,
      textIndex: 0,
      patternIndex: 0,
      compareTextIndex: null,
      comparePatternIndex: null,
      fallbackFrom: null,
      fallbackTo: null,
      matches,
      stage: 'scan',
      computation: {
        label: I18N.computation.labels.readyToScan,
        expression: `alignment = i - j = 0`,
        result: '0',
        note: I18N.computation.notes.readyToScan,
      },
    }),
  });

  let textIndex = 0;
  let patternIndex = 0;

  while (textIndex < text.length) {
    const alignment = textIndex - patternIndex;
    const match = text[textIndex] === pattern[patternIndex];

    yield createStringStep({
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.compareTextPattern, {
        textIndex,
        textChar: text[textIndex] ?? '∅',
        patternIndex,
        patternChar: pattern[patternIndex] ?? '∅',
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: match ? I18N.phases.characterMatch : I18N.phases.mismatchCheck,
        activeLabel: `i=${textIndex}, j=${patternIndex}`,
        resultLabel: matches.length === 0 ? I18N.labels.noFullHitsYet : matches.join(', '),
        decisionLabel: match ? I18N.decisions.advanceBothPointers : I18N.decisions.eitherJumpOrMove,
        failure,
        failureReadyIndex: pattern.length - 1,
        alignment,
        textIndex,
        patternIndex,
        compareTextIndex: textIndex,
        comparePatternIndex: patternIndex,
        fallbackFrom: null,
        fallbackTo: null,
        matches,
        stage: 'scan',
        computation: {
          label: I18N.computation.labels.currentCompare,
          expression: `text[${textIndex}] ${match ? '=' : '≠'} pattern[${patternIndex}]`,
          result: `"${text[textIndex]}" ${match ? '=' : '≠'} "${pattern[patternIndex]}"`,
          note:
            match
              ? I18N.computation.notes.currentCompareMatch
              : I18N.computation.notes.currentCompareMismatch,
        },
      }),
    });

    if (match) {
      textIndex++;
      patternIndex++;

      if (patternIndex === pattern.length) {
        const hitStart = textIndex - patternIndex;
        matches.push(hitStart);
        const fallback = failure[patternIndex - 1] ?? 0;

        yield createStringStep({
          activeCodeLine: 8,
          description: i18nText(I18N.descriptions.fullMatchFound, {
            hitStart,
            failureIndex: patternIndex - 1,
            fallback,
          }),
          phase: 'complete',
          string: makeState({
            scenario,
            phaseLabel: I18N.phases.matchReported,
            activeLabel: `hit @ ${hitStart}`,
            resultLabel: matches.join(', '),
            decisionLabel:
              fallback === 0
                ? I18N.decisions.restartPattern
                : i18nText(I18N.decisions.reuseOverlapOfLength, { fallback }),
            failure,
            failureReadyIndex: pattern.length - 1,
            alignment: textIndex - patternIndex,
            textIndex: textIndex - 1,
            patternIndex: pattern.length - 1,
            compareTextIndex: textIndex - 1,
            comparePatternIndex: pattern.length - 1,
            fallbackFrom: patternIndex,
            fallbackTo: fallback,
            matches,
            stage: 'scan',
            computation: {
              label: I18N.computation.labels.postMatchJump,
              expression: `j = fail[${patternIndex - 1}]`,
              result: String(fallback),
              note: I18N.computation.notes.postMatchJump,
            },
          }),
        });

        patternIndex = fallback;
      } else {
        yield createStringStep({
          activeCodeLine: 6,
          description: I18N.descriptions.advance,
          phase: 'pass-complete',
          string: makeState({
            scenario,
            phaseLabel: I18N.phases.advance,
            activeLabel: `i=${textIndex}, j=${patternIndex}`,
            resultLabel: matches.length === 0 ? I18N.labels.noFullHitsYet : matches.join(', '),
            decisionLabel: I18N.decisions.keepExtendingWindow,
            failure,
            failureReadyIndex: pattern.length - 1,
            alignment: textIndex - patternIndex,
            textIndex,
            patternIndex,
            compareTextIndex: null,
            comparePatternIndex: null,
            fallbackFrom: null,
            fallbackTo: null,
            matches,
            stage: 'scan',
            computation: {
              label: I18N.computation.labels.pointerUpdate,
              expression: 'i++, j++',
              result: `i=${textIndex}, j=${patternIndex}`,
              note: I18N.computation.notes.pointerUpdate,
            },
          }),
        });
      }
      continue;
    }

    if (patternIndex > 0) {
      const nextPatternIndex = failure[patternIndex - 1] ?? 0;
      yield createStringStep({
        activeCodeLine: 10,
        description: i18nText(I18N.descriptions.failureJump, {
          patternIndex,
          failureIndex: patternIndex - 1,
          nextPatternIndex,
        }),
        phase: 'pass-complete',
        string: makeState({
          scenario,
          phaseLabel: I18N.phases.failureJump,
          activeLabel: `j: ${patternIndex} → ${nextPatternIndex}`,
          resultLabel: matches.length === 0 ? I18N.labels.noFullHitsYet : matches.join(', '),
          decisionLabel: I18N.decisions.sameTextChar,
          failure,
          failureReadyIndex: pattern.length - 1,
          alignment: textIndex - nextPatternIndex,
          textIndex,
          patternIndex: nextPatternIndex,
          compareTextIndex: textIndex,
          comparePatternIndex: nextPatternIndex,
          fallbackFrom: patternIndex,
          fallbackTo: nextPatternIndex,
          matches,
          stage: 'scan',
          computation: {
            label: I18N.computation.labels.failureJump,
            expression: `j = fail[${patternIndex - 1}]`,
            result: String(nextPatternIndex),
            note: I18N.computation.notes.failureJump,
          },
        }),
      });
      patternIndex = nextPatternIndex;
      continue;
    }

    textIndex++;
    yield createStringStep({
      activeCodeLine: 11,
      description: I18N.descriptions.shiftText,
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.shiftText,
        activeLabel: `i=${textIndex}, j=0`,
        resultLabel: matches.length === 0 ? I18N.labels.noFullHitsYet : matches.join(', '),
        decisionLabel: I18N.decisions.noReusablePrefix,
        failure,
        failureReadyIndex: pattern.length - 1,
        alignment: textIndex,
        textIndex,
        patternIndex: 0,
        compareTextIndex: null,
        comparePatternIndex: null,
        fallbackFrom: null,
        fallbackTo: null,
        matches,
        stage: 'scan',
        computation: {
          label: I18N.computation.labels.textShift,
          expression: 'i++',
          result: `i=${textIndex}`,
          note: I18N.computation.notes.textShift,
        },
      }),
    });
  }

  yield createStringStep({
    activeCodeLine: 8,
    description:
      matches.length === 0
        ? I18N.descriptions.completeNoMatch
        : i18nText(I18N.descriptions.completeMatches, { matches: matches.join(', ') }),
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.complete,
      activeLabel:
        matches.length === 0
          ? I18N.labels.noHit
          : i18nText(I18N.labels.hitCount, { count: matches.length }),
      resultLabel: matches.length === 0 ? I18N.labels.noMatch : matches.join(', '),
      decisionLabel:
        matches.length === 0
          ? I18N.decisions.preventedBacktracking
          : I18N.decisions.allMatchesFound,
      failure,
      failureReadyIndex: pattern.length - 1,
      alignment: text.length,
      textIndex: null,
      patternIndex: null,
      compareTextIndex: null,
      comparePatternIndex: null,
      fallbackFrom: null,
      fallbackTo: null,
      matches,
      stage: 'done',
      computation: {
        label: I18N.computation.labels.finalOutcome,
        expression: 'matches',
        result: matches.length === 0 ? '∅' : matches.join(', '),
        note: I18N.computation.notes.finalOutcome,
      },
    }),
  });
}
