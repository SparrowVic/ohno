import { isI18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  AhoCorasickTraceState,
  KmpTraceState,
  ManacherTraceState,
  RabinKarpTraceState,
  RleTraceState,
  StringTraceState,
  ZAlgorithmTraceState,
} from '../../models/string';

export function phaseIs(label: TranslatableText, leaf: string): boolean {
  const key = isI18nText(label) ? label.key : label;
  return key.endsWith(`.phases.${leaf}`);
}

export function kmpTruth(state: KmpTraceState): KmpTraceState {
  if (state.stage === 'done') return state;
  if (state.stage === 'failure') return state.matches.length === 0 ? state : { ...state, matches: [] };
  const m = state.pattern.length;
  const i = state.textIndex ?? state.text.length;
  const hit = state.fallbackFrom === m;
  const matches = state.matches.filter((start) => start + m - 1 < i || (hit && start + m - 1 === i));
  return matches.length === state.matches.length ? state : { ...state, matches };
}

export function rabinKarpTruth(state: RabinKarpTraceState): RabinKarpTraceState {
  if (phaseIs(state.phaseLabel, 'complete')) return state;
  const verified = phaseIs(state.phaseLabel, 'verifiedMatch');
  const matches = state.matches.filter((start) => start < state.windowStart || (verified && start === state.windowStart));
  return matches.length === state.matches.length ? state : { ...state, matches };
}

export function zAlgorithmTruth(state: ZAlgorithmTraceState): ZAlgorithmTraceState {
  const active = state.activeIndex;
  if (active === null) return state;
  const m = state.patternLength;
  const hit = phaseIs(state.phaseLabel, 'patternHit');
  const matches = state.matches.filter((offset) => offset + m + 1 < active || (hit && offset + m + 1 === active));
  const comparing = state.compareMatchIndex !== null;
  const zValues = state.zValues.map((value, index) => {
    if (index < active) return value;
    if (index === active) return comparing ? Math.max(0, (state.compareMatchIndex ?? active) - active) : value;
    return 0;
  });
  return { ...state, matches, zValues };
}

export function manacherTruth(state: ManacherTraceState): ManacherTraceState {
  const center = state.currentCenter;
  if (center === null) return state;
  const radii = state.radii.map((value, index) => (index < center ? value : index === center ? state.activeRadius : 0));
  return { ...state, radii };
}

export function rleTruth(state: RleTraceState): RleTraceState {
  if (state.phase === 'complete') return state;
  let written = 0;
  const runs = [];
  for (const run of state.completedRuns) {
    const token = `${run.count}${run.char}`;
    if (state.output.slice(written, written + token.length) !== token) break;
    written += token.length;
    runs.push(run);
  }
  return runs.length === state.completedRuns.length ? state : { ...state, completedRuns: runs };
}

export function ahoCorasickTruth(state: AhoCorasickTraceState): AhoCorasickTraceState {
  if (state.phase === 'complete') return state;
  if (state.phase !== 'scan') return state.matches.length === 0 ? state : { ...state, matches: [] };
  const current = state.currentTextIndex ?? -1;
  const reporting = phaseIs(state.phaseLabel, 'reportMatch');
  const matches = state.matches.filter((match) => match.endIndex < current || (reporting && match.endIndex === current));
  return matches.length === state.matches.length ? state : { ...state, matches };
}

export function stringTruth(state: StringTraceState): StringTraceState {
  switch (state.mode) {
    case 'kmp':
      return kmpTruth(state);
    case 'rabin-karp':
      return rabinKarpTruth(state);
    case 'z-algorithm':
      return zAlgorithmTruth(state);
    case 'manacher':
      return manacherTruth(state);
    case 'rle':
      return rleTruth(state);
    case 'aho-corasick':
      return ahoCorasickTruth(state);
    default:
      return state;
  }
}
