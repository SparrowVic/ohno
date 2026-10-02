import { LedColor } from '../../../../shared/instrument/led/led.types';
import { SortPhase, SortStep } from '../../models/sort-step';
import { KmpTraceState, StringTraceState } from '../../models/string';
import { TapeEventOverride } from './tape-rows.utils';

export type FamilyTapePhase =
  | 'pickNode'
  | 'inspectEdge'
  | 'relax'
  | 'skipRelax'
  | 'settleNode'
  | 'complete'
  | 'focusDigit'
  | 'distribute'
  | 'gather'
  | 'compare'
  | 'match'
  | 'fallback'
  | 'shift'
  | 'hit'
  | 'lps';

export type FamilyTapeLabels = Readonly<Record<FamilyTapePhase, string>>;

interface TapeEvent {
  readonly phase: FamilyTapePhase;
  readonly tone: LedColor;
}

const PHASE_EVENTS: Readonly<Partial<Record<SortPhase, TapeEvent>>> = {
  'pick-node': { phase: 'pickNode', tone: 'cyan' },
  'inspect-edge': { phase: 'inspectEdge', tone: 'cyan' },
  relax: { phase: 'relax', tone: 'pink' },
  'skip-relax': { phase: 'skipRelax', tone: 'slate' },
  'settle-node': { phase: 'settleNode', tone: 'lime' },
  'graph-complete': { phase: 'complete', tone: 'lime' },
  'search-complete': { phase: 'complete', tone: 'lime' },
  'focus-digit': { phase: 'focusDigit', tone: 'cyan' },
  distribute: { phase: 'distribute', tone: 'pink' },
  gather: { phase: 'gather', tone: 'lime' },
};

const COMPARE: TapeEvent = { phase: 'compare', tone: 'cyan' };
const MATCH: TapeEvent = { phase: 'match', tone: 'lime' };
const FALLBACK: TapeEvent = { phase: 'fallback', tone: 'pink' };
const SHIFT: TapeEvent = { phase: 'shift', tone: 'slate' };
const HIT: TapeEvent = { phase: 'hit', tone: 'lime' };
const LPS: TapeEvent = { phase: 'lps', tone: 'amber' };

const HIT_MODES: ReadonlySet<StringTraceState['mode']> = new Set(['rabin-karp', 'z-algorithm', 'aho-corasick']);

function kmpCharsMatch(state: KmpTraceState): boolean {
  return (
    state.compareTextIndex !== null &&
    state.comparePatternIndex !== null &&
    state.text[state.compareTextIndex] === state.pattern[state.comparePatternIndex]
  );
}

function kmpTapeEvent(step: SortStep, state: KmpTraceState, previous: SortStep | null): TapeEvent | null {
  if (state.stage === 'done') return null;
  if (state.stage === 'failure') return state.fallbackFrom !== null ? FALLBACK : LPS;
  if (step.phase === 'complete') return HIT;
  if (state.fallbackFrom !== null) return FALLBACK;
  if (step.phase === 'compare') return COMPARE;
  if (step.phase === 'pass-complete') {
    const before = previous?.string;
    return before && before.mode === 'kmp' && kmpCharsMatch(before) ? MATCH : SHIFT;
  }
  return null;
}

function stringTapeEvent(step: SortStep, state: StringTraceState, previous: SortStep | null): TapeEvent | null {
  if (state.mode === 'kmp') return kmpTapeEvent(step, state, previous);
  if (step.phase === 'compare') return COMPARE;
  if (step.phase === 'pass-complete') return SHIFT;
  if (step.phase === 'complete' && HIT_MODES.has(state.mode)) return HIT;
  return null;
}

export function familyTapeOverride(step: SortStep, labels: FamilyTapeLabels, previous: SortStep | null = null): TapeEventOverride | null {
  const event = step.string ? stringTapeEvent(step, step.string, previous) : step.phase ? PHASE_EVENTS[step.phase] : undefined;
  return event ? { event: labels[event.phase], tone: event.tone } : null;
}

export function familyTapeOverrides(
  history: readonly SortStep[],
  labels: FamilyTapeLabels,
): readonly (TapeEventOverride | null)[] {
  return history.map((step, index) => (index === 0 ? null : familyTapeOverride(step, labels, history[index - 1] ?? null)));
}
