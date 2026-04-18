import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import { KmpTraceState } from '../../models/string';
import { KmpScenario } from '../../utils/string-scenarios/string-scenarios';

function makeState(args: {
  readonly scenario: KmpScenario;
  readonly phaseLabel: string;
  readonly activeLabel: string;
  readonly resultLabel: string;
  readonly decisionLabel: string;
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
    modeLabel: 'Failure jumps',
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      { label: 'Text', value: `${args.scenario.text.length} chars`, tone: 'info' },
      { label: 'Pattern', value: `${args.scenario.pattern.length} chars`, tone: 'accent' },
      { label: 'Failure ready', value: `${Math.max(args.failureReadyIndex + 1, 0)} / ${args.scenario.pattern.length}`, tone: 'warning' },
      { label: 'Hits', value: matchedCount === 0 ? 'none' : args.matches.join(', '), tone: matchedCount === 0 ? 'info' : 'success' },
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
    description: `Prepare KMP search for pattern "${pattern}" inside text "${text}".`,
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: 'Setup',
      activeLabel: 'failure[0] = 0',
      resultLabel: 'No matches yet',
      decisionLabel: 'Build the failure table before scanning the text.',
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
        label: 'Failure seed',
        expression: 'fail[0] = 0',
        result: '0',
        note: 'The first character has no shorter proper prefix to fall back to.',
      },
    }),
  });

  let prefix = 0;
  for (let index = 1; index < pattern.length; index++) {
    yield createStringStep({
      activeCodeLine: 2,
      description: `Compare pattern[${index}] = "${pattern[index]}" with prefix character pattern[${prefix}] = "${pattern[prefix] ?? '∅'}".`,
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: 'Build failure',
        activeLabel: `fail[${index}]`,
        resultLabel: failure.slice(0, Math.max(index, 1)).join(' · ') || '0',
        decisionLabel: 'Try to extend the current proper prefix / suffix overlap.',
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
          label: 'Prefix compare',
          expression: `pattern[${index}] ?= pattern[${prefix}]`,
          result: `${pattern[index] ?? '∅'} vs ${pattern[prefix] ?? '∅'}`,
          note: 'Failure links store the longest reusable prefix when a mismatch happens later.',
        },
      }),
    });

    while (prefix > 0 && pattern[index] !== pattern[prefix]) {
      const nextPrefix = failure[prefix - 1] ?? 0;
      yield createStringStep({
        activeCodeLine: 2,
        description: `Failure build mismatch: reuse fail[${prefix - 1}] = ${nextPrefix} instead of restarting from zero.`,
        phase: 'pass-complete',
        string: makeState({
          scenario,
          phaseLabel: 'Failure fallback',
          activeLabel: `prefix ${prefix} → ${nextPrefix}`,
          resultLabel: failure.slice(0, Math.max(index, 1)).join(' · ') || '0',
          decisionLabel: 'Slide inside the pattern and keep the work you already paid for.',
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
            label: 'Failure fallback',
            expression: `prefix = fail[${prefix - 1}]`,
            result: String(nextPrefix),
            note: 'KMP reuses the best smaller border instead of rechecking from the start.',
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
      description: `Set fail[${index}] = ${prefix}. That overlap is ready for future jumps.`,
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: 'Failure commit',
        activeLabel: `fail[${index}] = ${prefix}`,
        resultLabel: failure.slice(0, index + 1).join(' · '),
        decisionLabel: prefix === 0 ? 'No border yet.' : `Keep border length ${prefix}.`,
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
          label: 'Failure value',
          expression: `fail[${index}] = ${prefix}`,
          result: String(prefix),
          note: prefix === 0 ? 'Mismatch collapsed all reusable overlap.' : 'This border becomes the next jump target.',
        },
      }),
    });
  }

  yield createStringStep({
    activeCodeLine: 3,
    description: `Failure table ready: [${failure.join(', ')}]. Start scanning the text without rewinding it.`,
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: 'Search ready',
      activeLabel: 'i = 0, j = 0',
      resultLabel: `[${failure.join(', ')}]`,
      decisionLabel: 'The pattern can now jump by failure links instead of resetting after mismatches.',
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
        label: 'Ready to scan',
        expression: `alignment = i - j = 0`,
        result: '0',
        note: 'Pattern starts under the first text character.',
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
      description: `Compare text[${textIndex}] = "${text[textIndex]}" with pattern[${patternIndex}] = "${pattern[patternIndex]}".`,
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: match ? 'Character match' : 'Mismatch check',
        activeLabel: `i=${textIndex}, j=${patternIndex}`,
        resultLabel: matches.length === 0 ? 'No full hits yet' : matches.join(', '),
        decisionLabel: match ? 'Advance both pointers.' : 'Either jump by failure or move the text cursor.',
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
          label: 'Current compare',
          expression: `text[${textIndex}] ${match ? '=' : '≠'} pattern[${patternIndex}]`,
          result: `"${text[textIndex]}" ${match ? '=' : '≠'} "${pattern[patternIndex]}"`,
          note: match ? 'No backtracking needed.' : 'This is where KMP saves time with fail[j - 1].',
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
          description: `Full match found at text index ${hitStart}. KMP keeps scanning by jumping j to fail[${patternIndex - 1}] = ${fallback}.`,
          phase: 'complete',
          string: makeState({
            scenario,
            phaseLabel: 'Match reported',
            activeLabel: `hit @ ${hitStart}`,
            resultLabel: matches.join(', '),
            decisionLabel: fallback === 0 ? 'Restart pattern from the beginning.' : `Reuse overlap of length ${fallback}.`,
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
              label: 'Post-match jump',
              expression: `j = fail[${patternIndex - 1}]`,
              result: String(fallback),
              note: 'Overlapping matches stay visible because the text cursor never moves backward.',
            },
          }),
        });

        patternIndex = fallback;
      } else {
        yield createStringStep({
          activeCodeLine: 6,
          description: 'Characters matched, so both pointers move forward together.',
          phase: 'pass-complete',
          string: makeState({
            scenario,
            phaseLabel: 'Advance',
            activeLabel: `i=${textIndex}, j=${patternIndex}`,
            resultLabel: matches.length === 0 ? 'No full hits yet' : matches.join(', '),
            decisionLabel: 'Keep extending the aligned window.',
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
              label: 'Pointer update',
              expression: 'i++, j++',
              result: `i=${textIndex}, j=${patternIndex}`,
              note: 'KMP only jumps on mismatches or after reporting a full hit.',
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
        description: `Mismatch. Jump pattern index from ${patternIndex} to fail[${patternIndex - 1}] = ${nextPatternIndex} without moving the text cursor.`,
        phase: 'pass-complete',
        string: makeState({
          scenario,
          phaseLabel: 'Failure jump',
          activeLabel: `j: ${patternIndex} → ${nextPatternIndex}`,
          resultLabel: matches.length === 0 ? 'No full hits yet' : matches.join(', '),
          decisionLabel: 'Pattern slides under the same text character; the text pointer stays put.',
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
            label: 'Failure jump',
            expression: `j = fail[${patternIndex - 1}]`,
            result: String(nextPatternIndex),
            note: 'This is the KMP aha moment: reuse the longest safe prefix immediately.',
          },
        }),
      });
      patternIndex = nextPatternIndex;
      continue;
    }

    textIndex++;
    yield createStringStep({
      activeCodeLine: 11,
      description: 'Mismatch at j = 0, so only the text cursor moves to the next position.',
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: 'Shift text',
        activeLabel: `i=${textIndex}, j=0`,
        resultLabel: matches.length === 0 ? 'No full hits yet' : matches.join(', '),
        decisionLabel: 'No reusable prefix exists yet, so the window shifts by one.',
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
          label: 'Text shift',
          expression: 'i++',
          result: `i=${textIndex}`,
          note: 'Only the text moves when no failure link can help.',
        },
      }),
    });
  }

  yield createStringStep({
    activeCodeLine: 8,
    description:
      matches.length === 0
        ? 'KMP finished scanning the text. No full pattern match was found.'
        : `KMP finished. Matches found at indices ${matches.join(', ')}.`,
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: 'Complete',
      activeLabel: matches.length === 0 ? 'No hit' : `${matches.length} hit(s)`,
      resultLabel: matches.length === 0 ? 'No match' : matches.join(', '),
      decisionLabel:
        matches.length === 0
          ? 'Failure jumps still prevented wasteful backtracking.'
          : 'All matches were found without rewinding the text pointer.',
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
        label: 'Final outcome',
        expression: 'matches',
        result: matches.length === 0 ? '∅' : matches.join(', '),
        note: 'KMP runs in O(n + m) because every fallback reuses the failure table instead of rescanning text.',
      },
    }),
  });
}
