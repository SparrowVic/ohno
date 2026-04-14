import { createStringStep } from './string-step';
import { SortStep } from '../models/sort-step';
import { ManacherTraceState } from '../models/string';
import { ManacherScenario } from '../utils/string-scenarios';

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
  readonly phaseLabel: string;
  readonly activeLabel: string;
  readonly resultLabel: string;
  readonly decisionLabel: string;
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
    modeLabel: 'Mirror expansion',
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      { label: 'Source', value: `${args.scenario.source.length} chars`, tone: 'info' },
      {
        label: 'Window',
        value:
          args.leftBoundary === null || args.rightBoundary === null
            ? 'empty'
            : `[${args.leftBoundary}, ${args.rightBoundary}]`,
        tone: 'warning',
      },
      { label: 'Center', value: args.currentCenter === null ? '—' : String(args.currentCenter), tone: 'accent' },
      { label: 'Longest', value: longestPalindrome || '—', tone: longestPalindrome ? 'success' : 'info' },
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
    description: `Transform "${scenario.source}" into "${transformed}" so odd and even palindromes share one unified expansion rule.`,
    phase: 'init',
    string: makeState({
      scenario,
      transformed,
      phaseLabel: 'Setup',
      activeLabel: 'center = 0',
      resultLabel: 'No palindrome measured yet',
      decisionLabel: 'Insert # separators so every palindrome behaves like an odd-length radius around one center.',
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
        label: 'Transformed string',
        expression: `#${scenario.source.split('').join('#')}#`,
        result: transformed,
        note: 'This removes the need to separately handle odd and even palindrome centers.',
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
        description: `Inside the current right boundary, copy min(right - i, P[mirror]) = ${reused} from mirror ${mirror}.`,
        phase: 'compare',
        string: makeState({
          scenario,
          transformed,
          phaseLabel: 'Mirror reuse',
          activeLabel: `i = ${index}`,
          resultLabel: extractPalindrome(scenario.source, longestCenter, longestRadius) || '—',
          decisionLabel: 'Reuse the mirrored radius first; only extra growth needs fresh comparisons.',
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
            label: 'Mirror seed',
            expression: `P[${index}] = min(${right - index}, P[${mirror}])`,
            result: String(reused),
            note: 'Manacher borrows the guaranteed safe part from the mirrored center before expanding.',
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
        description: `Expand around center ${index}: compare "${transformed[leftIndex]}" and "${transformed[rightIndex]}".`,
        phase: 'compare',
        string: makeState({
          scenario,
          transformed,
          phaseLabel: 'Expand palindrome',
          activeLabel: `center ${index}`,
          resultLabel: extractPalindrome(scenario.source, longestCenter, longestRadius) || '—',
          decisionLabel: 'Matching mirrored characters let the palindrome rainbow grow outward.',
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
            label: 'Expansion compare',
            expression: `T[${leftIndex}] = T[${rightIndex}]`,
            result: `"${transformed[leftIndex]}" = "${transformed[rightIndex]}"`,
            note: 'Each successful compare increases the palindrome radius by one transformed step.',
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
        description: `Update the active palindrome window to center ${center} with right boundary ${right}.`,
        phase: 'pass-complete',
        string: makeState({
          scenario,
          transformed,
          phaseLabel: 'Shift window',
          activeLabel: `center ${center}, right ${right}`,
          resultLabel: extractPalindrome(scenario.source, longestCenter, longestRadius) || '—',
          decisionLabel: 'The current palindrome now defines the mirror window for future centers.',
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
            label: 'Boundary update',
            expression: `center = ${center}, right = ${right}`,
            result: `[${center - radii[center]}, ${right}]`,
            note: 'Anything inside this boundary gets a free mirrored lower bound.',
          },
        }),
      });
    }
  }

  yield createStringStep({
    activeCodeLine: 11,
    description: `Manacher finished. The longest palindrome is "${extractPalindrome(scenario.source, longestCenter, longestRadius)}".`,
    phase: 'complete',
    string: makeState({
      scenario,
      transformed,
      phaseLabel: 'Complete',
      activeLabel: `best center ${longestCenter}`,
      resultLabel: extractPalindrome(scenario.source, longestCenter, longestRadius) || '—',
      decisionLabel: 'All palindrome radii are now known, so the final rainbow shows every center at once.',
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
        label: 'Longest palindrome',
        expression: `P[${longestCenter}] = ${longestRadius}`,
        result: extractPalindrome(scenario.source, longestCenter, longestRadius) || '—',
        note: 'The longest original palindrome length is exactly the transformed radius.',
      },
    }),
  });
}
