import { createStringStep } from './string-step';
import { SortStep } from '../models/sort-step';
import { ZAlgorithmTraceState } from '../models/string';
import { ZAlgorithmScenario } from '../utils/string-scenarios/string-scenarios';

function makeState(args: {
  readonly scenario: ZAlgorithmScenario;
  readonly combined: string;
  readonly phaseLabel: string;
  readonly activeLabel: string;
  readonly resultLabel: string;
  readonly decisionLabel: string;
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
    modeLabel: 'Z-box skyline',
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      { label: 'Pattern', value: `${args.scenario.pattern.length} chars`, tone: 'accent' },
      { label: 'Combined', value: `${args.combined.length} chars`, tone: 'info' },
      {
        label: 'Z-box',
        value:
          args.boxLeft === null || args.boxRight === null
            ? 'empty'
            : `[${args.boxLeft}, ${args.boxRight}]`,
        tone: 'warning',
      },
      { label: 'Hits', value: args.matches.length === 0 ? 'none' : args.matches.join(', '), tone: args.matches.length === 0 ? 'info' : 'success' },
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
    description: `Build the Z-array for "${scenario.pattern}$${scenario.text}" to reuse prefix matches across the whole string.`,
    phase: 'init',
    string: makeState({
      scenario,
      combined,
      phaseLabel: 'Setup',
      activeLabel: 'Z[0] = |S|',
      resultLabel: 'No full-pattern bar yet',
      decisionLabel: 'The skyline starts flat; each bar will store a prefix length.',
      zValues,
      activeIndex: 0,
      boxLeft: 0,
      boxRight: 0,
      comparePrefixIndex: null,
      compareMatchIndex: null,
      matches,
      computation: {
        label: 'Combined string',
        expression: `${scenario.pattern} + "$" + ${scenario.text}`,
        result: combined,
        note: 'Any bar reaching the pattern length on the text side marks a full occurrence.',
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
        description: `Inside the active Z-box, seed Z[${index}] with min(${right - index + 1}, Z[${index - left}]) = ${reused}.`,
        phase: 'compare',
        string: makeState({
          scenario,
          combined,
          phaseLabel: 'Reuse box',
          activeLabel: `i = ${index}`,
          resultLabel: matches.length === 0 ? 'No hit yet' : matches.join(', '),
          decisionLabel: 'Copy as much as the current box safely guarantees before expanding.',
          zValues,
          activeIndex: index,
          boxLeft: left,
          boxRight: right,
          comparePrefixIndex: index - left,
          compareMatchIndex: index,
          matches,
          computation: {
            label: 'Box reuse',
            expression: `Z[${index}] = min(${right - index + 1}, Z[${index - left}])`,
            result: String(reused),
            note: 'The current [L, R] box already proves this much prefix match for free.',
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
        description: `Expand Z[${index}] by comparing prefix char "${combined[prefixIndex]}" with "${combined[matchIndex]}".`,
        phase: 'compare',
        string: makeState({
          scenario,
          combined,
          phaseLabel: 'Expand bar',
          activeLabel: `Z[${index}] = ${zValues[index]}`,
          resultLabel: matches.length === 0 ? 'No hit yet' : matches.join(', '),
          decisionLabel: 'As long as both sides match, the skyline bar grows taller.',
          zValues,
          activeIndex: index,
          boxLeft: left,
          boxRight: right,
          comparePrefixIndex: prefixIndex,
          compareMatchIndex: matchIndex,
          matches,
          computation: {
            label: 'Expansion compare',
            expression: `S[${prefixIndex}] = S[${matchIndex}]`,
            result: `"${combined[prefixIndex]}" = "${combined[matchIndex]}"`,
            note: 'This extends the current prefix match by one more character.',
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
        description: `Update the Z-box to [${left}, ${right}] because the new bar extends farther right.`,
        phase: 'pass-complete',
        string: makeState({
          scenario,
          combined,
          phaseLabel: 'Shift box',
          activeLabel: `[L, R] = [${left}, ${right}]`,
          resultLabel: matches.length === 0 ? 'No hit yet' : matches.join(', '),
          decisionLabel: 'Future positions inside this box can reuse work instead of starting from zero.',
          zValues,
          activeIndex: index,
          boxLeft: left,
          boxRight: right,
          comparePrefixIndex: null,
          compareMatchIndex: null,
          matches,
          computation: {
            label: 'Box update',
            expression: `[L, R] = [${index}, ${index + zValues[index] - 1}]`,
            result: `[${left}, ${right}]`,
            note: 'The current match becomes the new best reusable prefix window.',
          },
        }),
      });
    }

    const textOffset = index - scenario.pattern.length - 1;
    if (textOffset >= 0 && (zValues[index] ?? 0) >= scenario.pattern.length) {
      matches.push(textOffset);

      yield createStringStep({
        activeCodeLine: 9,
        description: `Bar Z[${index}] reached the full pattern length, so the pattern occurs in the text at index ${textOffset}.`,
        phase: 'complete',
        string: makeState({
          scenario,
          combined,
          phaseLabel: 'Pattern hit',
          activeLabel: `match @ ${textOffset}`,
          resultLabel: matches.join(', '),
          decisionLabel: 'A full-height bar on the text side means the prefix pattern matched completely.',
          zValues,
          activeIndex: index,
          boxLeft: left,
          boxRight: right,
          comparePrefixIndex: null,
          compareMatchIndex: null,
          matches,
          computation: {
            label: 'Full bar',
            expression: `Z[${index}] ≥ |pattern|`,
            result: `${zValues[index]} ≥ ${scenario.pattern.length}`,
            note: 'This is why the Z skyline is so readable: full hits become obvious tall bars.',
          },
        }),
      });
    }
  }

  yield createStringStep({
    activeCodeLine: 9,
    description:
      matches.length === 0
        ? 'Z-array complete. No full pattern-height bar appeared on the text side.'
        : `Z-array complete. Full-pattern bars mark matches at indices ${matches.join(', ')}.`,
    phase: 'complete',
    string: makeState({
      scenario,
      combined,
      phaseLabel: 'Complete',
      activeLabel: matches.length === 0 ? 'No hit' : `${matches.length} hit(s)`,
      resultLabel: matches.length === 0 ? 'No match' : matches.join(', '),
      decisionLabel:
        matches.length === 0
          ? 'The skyline shows partial prefix reuse but never reaches the full pattern height.'
          : 'The skyline now reveals every full occurrence at a glance.',
      zValues,
      activeIndex: null,
      boxLeft: left,
      boxRight: right,
      comparePrefixIndex: null,
      compareMatchIndex: null,
      matches,
      computation: {
        label: 'Final skyline',
        expression: 'Z values',
        result: `[${zValues.join(', ')}]`,
        note: 'Linear time comes from reusing the current [L, R] box instead of re-expanding every suffix from scratch.',
      },
    }),
  });
}
