import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import { RabinKarpTraceState } from '../../models/string';
import { RabinKarpScenario } from '../../utils/string-scenarios/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.rabinKarp.modeLabel'),
  phases: {
    setup: t('features.algorithms.runtime.string.rabinKarp.phases.setup'),
    hashCompare: t('features.algorithms.runtime.string.rabinKarp.phases.hashCompare'),
    verifyHit: t('features.algorithms.runtime.string.rabinKarp.phases.verifyHit'),
    verifyCollision: t('features.algorithms.runtime.string.rabinKarp.phases.verifyCollision'),
    falseAlarm: t('features.algorithms.runtime.string.rabinKarp.phases.falseAlarm'),
    verifiedMatch: t('features.algorithms.runtime.string.rabinKarp.phases.verifiedMatch'),
    rollHash: t('features.algorithms.runtime.string.rabinKarp.phases.rollHash'),
    complete: t('features.algorithms.runtime.string.rabinKarp.phases.complete'),
  },
  insights: {
    baseLabel: t('features.algorithms.runtime.string.rabinKarp.insights.baseLabel'),
    modLabel: t('features.algorithms.runtime.string.rabinKarp.insights.modLabel'),
    windowLabel: t('features.algorithms.runtime.string.rabinKarp.insights.windowLabel'),
    hitsLabel: t('features.algorithms.runtime.string.rabinKarp.insights.hitsLabel'),
    windowValue: t('features.algorithms.runtime.string.rabinKarp.insights.windowValue'),
    noneValue: t('features.algorithms.runtime.string.rabinKarp.insights.noneValue'),
  },
  descriptions: {
    prepare: t('features.algorithms.runtime.string.rabinKarp.descriptions.prepare'),
    compareHashes: t('features.algorithms.runtime.string.rabinKarp.descriptions.compareHashes'),
    verifyChars: t('features.algorithms.runtime.string.rabinKarp.descriptions.verifyChars'),
    falseAlarm: t('features.algorithms.runtime.string.rabinKarp.descriptions.falseAlarm'),
    verifiedMatch: t('features.algorithms.runtime.string.rabinKarp.descriptions.verifiedMatch'),
    rollHash: t('features.algorithms.runtime.string.rabinKarp.descriptions.rollHash'),
    completeNoMatch: t('features.algorithms.runtime.string.rabinKarp.descriptions.completeNoMatch'),
    completeMatches: t('features.algorithms.runtime.string.rabinKarp.descriptions.completeMatches'),
  },
  decisions: {
    seedHashes: t('features.algorithms.runtime.string.rabinKarp.decisions.seedHashes'),
    verifyOnEqualHash: t(
      'features.algorithms.runtime.string.rabinKarp.decisions.verifyOnEqualHash',
    ),
    slideOnDifferentHash: t(
      'features.algorithms.runtime.string.rabinKarp.decisions.slideOnDifferentHash',
    ),
    charsAgree: t('features.algorithms.runtime.string.rabinKarp.decisions.charsAgree'),
    collision: t('features.algorithms.runtime.string.rabinKarp.decisions.collision'),
    keepSliding: t('features.algorithms.runtime.string.rabinKarp.decisions.keepSliding'),
    survivedVerification: t(
      'features.algorithms.runtime.string.rabinKarp.decisions.survivedVerification',
    ),
    constantTimeRoll: t(
      'features.algorithms.runtime.string.rabinKarp.decisions.constantTimeRoll',
    ),
    noMatchFound: t('features.algorithms.runtime.string.rabinKarp.decisions.noMatchFound'),
    rollingHashNarrowed: t(
      'features.algorithms.runtime.string.rabinKarp.decisions.rollingHashNarrowed',
    ),
  },
  computation: {
    labels: {
      initialHashes: t(
        'features.algorithms.runtime.string.rabinKarp.computation.labels.initialHashes',
      ),
      hashGate: t('features.algorithms.runtime.string.rabinKarp.computation.labels.hashGate'),
      characterVerify: t(
        'features.algorithms.runtime.string.rabinKarp.computation.labels.characterVerify',
      ),
      collision: t('features.algorithms.runtime.string.rabinKarp.computation.labels.collision'),
      verifiedHit: t(
        'features.algorithms.runtime.string.rabinKarp.computation.labels.verifiedHit',
      ),
      rollingHash: t('features.algorithms.runtime.string.rabinKarp.computation.labels.rollingHash'),
      finalOutcome: t('features.algorithms.runtime.string.rabinKarp.computation.labels.finalOutcome'),
    },
    notes: {
      initialHashes: t(
        'features.algorithms.runtime.string.rabinKarp.computation.notes.initialHashes',
      ),
      hashGateMatch: t(
        'features.algorithms.runtime.string.rabinKarp.computation.notes.hashGateMatch',
      ),
      hashGateSkip: t(
        'features.algorithms.runtime.string.rabinKarp.computation.notes.hashGateSkip',
      ),
      verifyMatch: t(
        'features.algorithms.runtime.string.rabinKarp.computation.notes.verifyMatch',
      ),
      verifyCollision: t(
        'features.algorithms.runtime.string.rabinKarp.computation.notes.verifyCollision',
      ),
      collision: t('features.algorithms.runtime.string.rabinKarp.computation.notes.collision'),
      verifiedHit: t('features.algorithms.runtime.string.rabinKarp.computation.notes.verifiedHit'),
      rollingHash: t('features.algorithms.runtime.string.rabinKarp.computation.notes.rollingHash'),
      finalOutcome: t('features.algorithms.runtime.string.rabinKarp.computation.notes.finalOutcome'),
    },
  },
  labels: {
    noMatchesYet: t('features.algorithms.runtime.string.rabinKarp.labels.noMatchesYet'),
    noVerifiedHitYet: t('features.algorithms.runtime.string.rabinKarp.labels.noVerifiedHitYet'),
    noMatch: t('features.algorithms.runtime.string.rabinKarp.labels.noMatch'),
    noHit: t('features.algorithms.runtime.string.rabinKarp.labels.noHit'),
    hitCount: t('features.algorithms.runtime.string.rabinKarp.labels.hitCount'),
  },
} as const;

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
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
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
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      { label: I18N.insights.baseLabel, value: String(args.scenario.base), tone: 'accent' },
      { label: I18N.insights.modLabel, value: String(args.scenario.mod), tone: 'warning' },
      {
        label: I18N.insights.windowLabel,
        value: i18nText(I18N.insights.windowValue, {
          start: args.windowStart,
          end: args.windowStart + args.scenario.pattern.length - 1,
        }),
        tone: 'info',
      },
      {
        label: I18N.insights.hitsLabel,
        value: args.matches.length === 0 ? I18N.insights.noneValue : args.matches.join(', '),
        tone: args.matches.length === 0 ? 'info' : 'success',
      },
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
    description: i18nText(I18N.descriptions.prepare, { pattern, base, mod }),
    phase: 'init',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.setup,
      activeLabel: `window 0..${m - 1}`,
      resultLabel: I18N.labels.noMatchesYet,
      decisionLabel: I18N.decisions.seedHashes,
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
        label: I18N.computation.labels.initialHashes,
        expression: `hash(pattern) = ${patternHash}, hash(text[0..${m})) = ${windowHash}`,
        result: `${patternHash} vs ${windowHash}`,
        note: I18N.computation.notes.initialHashes,
      },
    }),
  });

  for (let start = 0; start <= text.length - m; start++) {
    const hashesMatch = windowHash === patternHash;

    yield createStringStep({
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.compareHashes, {
        windowHash,
        patternHash,
        start,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.hashCompare,
        activeLabel: `window @ ${start}`,
        resultLabel: matches.length === 0 ? I18N.labels.noVerifiedHitYet : matches.join(', '),
        decisionLabel:
          hashesMatch ? I18N.decisions.verifyOnEqualHash : I18N.decisions.slideOnDifferentHash,
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
          label: I18N.computation.labels.hashGate,
          expression: `${windowHash} ${hashesMatch ? '=' : '≠'} ${patternHash}`,
          result: hashesMatch ? 'possible match' : 'skip window',
          note:
            hashesMatch
              ? I18N.computation.notes.hashGateMatch
              : I18N.computation.notes.hashGateSkip,
        },
      }),
    });

    if (hashesMatch) {
      let verified = true;
      for (let offset = 0; offset < m; offset++) {
        const same = text[start + offset] === pattern[offset];
        yield createStringStep({
          activeCodeLine: 6,
          description: i18nText(I18N.descriptions.verifyChars, {
            textIndex: start + offset,
            textChar: text[start + offset] ?? '∅',
            patternIndex: offset,
            patternChar: pattern[offset] ?? '∅',
          }),
          phase: 'compare',
          string: makeState({
            scenario,
            phaseLabel: same ? I18N.phases.verifyHit : I18N.phases.verifyCollision,
            activeLabel: `check ${offset + 1} / ${m}`,
            resultLabel: matches.length === 0 ? I18N.labels.noVerifiedHitYet : matches.join(', '),
            decisionLabel: same ? I18N.decisions.charsAgree : I18N.decisions.collision,
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
              label: I18N.computation.labels.characterVerify,
              expression: `text[${start + offset}] ${same ? '=' : '≠'} pattern[${offset}]`,
              result: `"${text[start + offset]}" ${same ? '=' : '≠'} "${pattern[offset]}"`,
              note:
                same
                  ? I18N.computation.notes.verifyMatch
                  : I18N.computation.notes.verifyCollision,
            },
          }),
        });

        if (!same) {
          verified = false;
          yield createStringStep({
            activeCodeLine: 6,
            description: i18nText(I18N.descriptions.falseAlarm, { start }),
            phase: 'pass-complete',
            string: makeState({
              scenario,
              phaseLabel: I18N.phases.falseAlarm,
              activeLabel: `collision @ ${start}`,
              resultLabel: matches.length === 0 ? I18N.labels.noVerifiedHitYet : matches.join(', '),
              decisionLabel: I18N.decisions.keepSliding,
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
                label: I18N.computation.labels.collision,
                expression: `${windowHash} = ${patternHash}, but text[${start + offset}] ≠ pattern[${offset}]`,
                result: 'reject',
                note: I18N.computation.notes.collision,
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
          description: i18nText(I18N.descriptions.verifiedMatch, { start }),
          phase: 'complete',
          string: makeState({
            scenario,
            phaseLabel: I18N.phases.verifiedMatch,
            activeLabel: `hit @ ${start}`,
            resultLabel: matches.join(', '),
            decisionLabel: I18N.decisions.survivedVerification,
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
              label: I18N.computation.labels.verifiedHit,
              expression: `text[${start}..${start + m}) = pattern`,
              result: 'match',
              note: I18N.computation.notes.verifiedHit,
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
      description: i18nText(I18N.descriptions.rollHash, {
        outgoingChar: outgoingChar ?? '∅',
        incomingChar: incomingChar ?? '∅',
      }),
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.rollHash,
        activeLabel: `window ${start + 1}..${start + m}`,
        resultLabel: matches.length === 0 ? I18N.labels.noVerifiedHitYet : matches.join(', '),
        decisionLabel: I18N.decisions.constantTimeRoll,
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
          label: I18N.computation.labels.rollingHash,
          expression: `(((${windowHash} - ${outgoingValue}·${highestPower}) mod ${mod})·${base} + ${incomingValue}) mod ${mod}`,
          result: String(nextHash),
          note: I18N.computation.notes.rollingHash,
        },
      }),
    });

    windowHash = nextHash;
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
      phaseLabel: I18N.phases.complete,
      activeLabel:
        matches.length === 0
          ? I18N.labels.noHit
          : i18nText(I18N.labels.hitCount, { count: matches.length }),
      resultLabel: matches.length === 0 ? I18N.labels.noMatch : matches.join(', '),
      decisionLabel:
        matches.length === 0
          ? I18N.decisions.noMatchFound
          : I18N.decisions.rollingHashNarrowed,
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
        label: I18N.computation.labels.finalOutcome,
        expression: 'verified matches',
        result: matches.length === 0 ? '∅' : matches.join(', '),
        note: I18N.computation.notes.finalOutcome,
      },
    }),
  });
}
