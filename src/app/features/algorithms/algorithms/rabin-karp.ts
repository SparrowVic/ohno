import { createStringStep } from './string-step';
import { SortStep } from '../models/sort-step';
import { RabinKarpTraceState } from '../models/string';
import { RabinKarpScenario } from '../utils/string-scenarios/string-scenarios';

function hashOf(source: string, base: number, mod: number): number {
  let value = 0;
  for (const char of source) {
    value = (value * base + charValue(char)) % mod;
  }
  return value;
}

function charValue(char: string): number {
  const code = char.codePointAt(0) ?? 0;
  if (code >= 65 && code <= 90) return code - 64;
  if (code >= 97 && code <= 122) return code - 96;
  return code % 97;
}

function powMod(base: number, exponent: number, mod: number): number {
  let result = 1;
  for (let index = 0; index < exponent; index++) {
    result = (result * base) % mod;
  }
  return result;
}

function makeState(args: {
  readonly scenario: RabinKarpScenario;
  readonly phaseLabel: string;
  readonly activeLabel: string;
  readonly resultLabel: string;
  readonly decisionLabel: string;
  readonly windowStart: number;
  readonly patternHash: number;
  readonly windowHash: number;
  readonly verifying: boolean;
  readonly verificationIndex: number | null;
  readonly collision: boolean;
  readonly matches: readonly number[];
  readonly outgoingChar: string | null;
  readonly incomingChar: string | null;
  readonly computation: RabinKarpTraceState['computation'];
}): RabinKarpTraceState {
  return {
    mode: 'rabin-karp',
    modeLabel: 'Rolling hash window',
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      { label: 'Base', value: String(args.scenario.base), tone: 'accent' },
      { label: 'Mod', value: String(args.scenario.mod), tone: 'warning' },
      { label: 'Window', value: `${args.windowStart}..${args.windowStart + args.scenario.pattern.length - 1}`, tone: 'info' },
      { label: 'Hits', value: args.matches.length === 0 ? 'none' : args.matches.join(', '), tone: args.matches.length === 0 ? 'info' : 'success' },
    ],
    text: args.scenario.text,
    pattern: args.scenario.pattern,
    windowStart: args.windowStart,
    windowLength: args.scenario.pattern.length,
    patternHash: args.patternHash,
    windowHash: args.windowHash,
    base: args.scenario.base,
    mod: args.scenario.mod,
    highestPower: powMod(args.scenario.base, Math.max(args.scenario.pattern.length - 1, 0), args.scenario.mod),
    verifying: args.verifying,
    verificationIndex: args.verificationIndex,
    collision: args.collision,
    matches: args.matches,
    outgoingChar: args.outgoingChar,
    incomingChar: args.incomingChar,
  };
}

export function* rabinKarpGenerator(
  scenario: RabinKarpScenario,
): Generator<SortStep> {
  const { text, pattern, base, mod } = scenario;
  const m = pattern.length;
  const matches: number[] = [];
  const highestPower = powMod(base, Math.max(m - 1, 0), mod);
  const patternHash = hashOf(pattern, base, mod);
  let windowHash = hashOf(text.slice(0, m), base, mod);

  yield createStringStep({
    activeCodeLine: 1,
    description: `Prepare Rabin-Karp for pattern "${pattern}" with base ${base} and mod ${mod}.`,
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: 'Setup',
      activeLabel: `window 0..${m - 1}`,
      resultLabel: 'No matches yet',
      decisionLabel: 'Hash the pattern and the first text window before sliding.',
      windowStart: 0,
      patternHash,
      windowHash,
      verifying: false,
      verificationIndex: null,
      collision: false,
      matches,
      outgoingChar: null,
      incomingChar: null,
      computation: {
        label: 'Initial hashes',
        expression: `hash(pattern) = ${patternHash}, hash(text[0..${m})) = ${windowHash}`,
        result: `${patternHash} vs ${windowHash}`,
        note: 'If hashes differ, the whole window can be rejected instantly.',
      },
    }),
  });

  for (let start = 0; start <= text.length - m; start++) {
    const hashesMatch = windowHash === patternHash;

    yield createStringStep({
      activeCodeLine: 5,
      description: `Compare window hash ${windowHash} with pattern hash ${patternHash} at start ${start}.`,
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: 'Hash compare',
        activeLabel: `window @ ${start}`,
        resultLabel: matches.length === 0 ? 'No verified hit yet' : matches.join(', '),
        decisionLabel: hashesMatch ? 'Equal hashes trigger a character verification.' : 'Different hashes let the window slide immediately.',
        windowStart: start,
        patternHash,
        windowHash,
        verifying: false,
        verificationIndex: null,
        collision: false,
        matches,
        outgoingChar: null,
        incomingChar: null,
        computation: {
          label: 'Hash gate',
          expression: `${windowHash} ${hashesMatch ? '=' : '≠'} ${patternHash}`,
          result: hashesMatch ? 'possible match' : 'skip window',
          note: hashesMatch ? 'Hashes agree, so Rabin-Karp must verify the characters.' : 'No expensive per-character compare is needed here.',
        },
      }),
    });

    if (hashesMatch) {
      let verified = true;
      for (let offset = 0; offset < m; offset++) {
        const same = text[start + offset] === pattern[offset];
        yield createStringStep({
          activeCodeLine: 6,
          description: `Verify text[${start + offset}] = "${text[start + offset]}" against pattern[${offset}] = "${pattern[offset]}".`,
          phase: 'compare',
          string: makeState({
            scenario,
            phaseLabel: same ? 'Verify hit' : 'Verify collision',
            activeLabel: `check ${offset + 1} / ${m}`,
            resultLabel: matches.length === 0 ? 'No verified hit yet' : matches.join(', '),
            decisionLabel: same ? 'Characters still agree.' : 'Equal hash, different text: this is a false alarm collision.',
            windowStart: start,
            patternHash,
            windowHash,
            verifying: true,
            verificationIndex: offset,
            collision: !same,
            matches,
            outgoingChar: null,
            incomingChar: null,
            computation: {
              label: 'Character verify',
              expression: `text[${start + offset}] ${same ? '=' : '≠'} pattern[${offset}]`,
              result: `"${text[start + offset]}" ${same ? '=' : '≠'} "${pattern[offset]}"`,
              note: same ? 'The hash candidate still looks legitimate.' : 'This is the cost of a collision: hashes matched, text did not.',
            },
          }),
        });

        if (!same) {
          verified = false;
          yield createStringStep({
            activeCodeLine: 6,
            description: `False alarm at window ${start}: the rolling hash collided, but the characters do not fully match.`,
            phase: 'pass-complete',
            string: makeState({
              scenario,
              phaseLabel: 'False alarm',
              activeLabel: `collision @ ${start}`,
              resultLabel: matches.length === 0 ? 'No verified hit yet' : matches.join(', '),
              decisionLabel: 'Keep sliding; the hash alone is not enough.',
              windowStart: start,
              patternHash,
              windowHash,
              verifying: true,
              verificationIndex: offset,
              collision: true,
              matches,
              outgoingChar: null,
              incomingChar: null,
              computation: {
                label: 'Collision',
                expression: `${windowHash} = ${patternHash}, but text[${start + offset}] ≠ pattern[${offset}]`,
                result: 'reject',
                note: 'Rabin-Karp wins on average because these red-alert verifications are rare.',
              },
            }),
          });
          break;
        }
      }

      if (verified) {
        matches.push(start);
        yield createStringStep({
          activeCodeLine: 6,
          description: `Verified full match at index ${start}.`,
          phase: 'complete',
          string: makeState({
            scenario,
            phaseLabel: 'Verified match',
            activeLabel: `hit @ ${start}`,
            resultLabel: matches.join(', '),
            decisionLabel: 'The hash candidate survived every character check.',
            windowStart: start,
            patternHash,
            windowHash,
            verifying: true,
            verificationIndex: m - 1,
            collision: false,
            matches,
            outgoingChar: null,
            incomingChar: null,
            computation: {
              label: 'Verified hit',
              expression: `text[${start}..${start + m}) = pattern`,
              result: 'match',
              note: 'A hash match plus successful verification is a real occurrence.',
            },
          }),
        });
      }
    }

    if (start === text.length - m) break;

    const outgoingChar = text[start] ?? null;
    const incomingChar = text[start + m] ?? null;
    const outgoingValue = charValue(outgoingChar ?? '');
    const incomingValue = charValue(incomingChar ?? '');
    const reduced = (windowHash - (outgoingValue * highestPower) % mod + mod) % mod;
    const nextHash = (reduced * base + incomingValue) % mod;

    yield createStringStep({
      activeCodeLine: 8,
      description: `Roll the hash forward: drop "${outgoingChar}" and add "${incomingChar}".`,
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: 'Roll hash',
        activeLabel: `window ${start + 1}..${start + m}`,
        resultLabel: matches.length === 0 ? 'No verified hit yet' : matches.join(', '),
        decisionLabel: 'Hash update costs O(1), so the window can glide without rehashing every character.',
        windowStart: start + 1,
        patternHash,
        windowHash: nextHash,
        verifying: false,
        verificationIndex: null,
        collision: false,
        matches,
        outgoingChar,
        incomingChar,
        computation: {
          label: 'Rolling hash',
          expression: `(((${windowHash} - ${outgoingValue}·${highestPower}) mod ${mod})·${base} + ${incomingValue}) mod ${mod}`,
          result: String(nextHash),
          note: 'Remove the old leading character, shift the base, and inject the new trailing one.',
        },
      }),
    });

    windowHash = nextHash;
  }

  yield createStringStep({
    activeCodeLine: 9,
    description:
      matches.length === 0
        ? 'Rabin-Karp finished. No verified pattern occurrence was found.'
        : `Rabin-Karp finished. Verified matches at indices ${matches.join(', ')}.`,
    phase: 'complete',
    string: makeState({
      scenario,
      phaseLabel: 'Complete',
      activeLabel: matches.length === 0 ? 'No hit' : `${matches.length} hit(s)`,
      resultLabel: matches.length === 0 ? 'No match' : matches.join(', '),
      decisionLabel:
        matches.length === 0
          ? 'Every promising hash window was either rejected or collided.'
          : 'Rolling hash narrowed the search to a few short verifications.',
      windowStart: Math.max(text.length - m, 0),
      patternHash,
      windowHash,
      verifying: false,
      verificationIndex: null,
      collision: false,
      matches,
      outgoingChar: null,
      incomingChar: null,
      computation: {
        label: 'Final outcome',
        expression: 'verified matches',
        result: matches.length === 0 ? '∅' : matches.join(', '),
        note: 'The rolling hash does the cheap filtering; character checks confirm the survivors.',
      },
    }),
  });
}
