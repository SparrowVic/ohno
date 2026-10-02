import { LedColor } from '../../../../shared/instrument/led/led.types';
import { SortPhase, SortStep } from '../../models/sort-step';
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
  | 'gather';

export type FamilyTapeLabels = Readonly<Record<FamilyTapePhase, string>>;

const PHASE_EVENTS: Readonly<Partial<Record<SortPhase, { readonly phase: FamilyTapePhase; readonly tone: LedColor }>>> = {
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

export function familyTapeOverride(step: SortStep, labels: FamilyTapeLabels): TapeEventOverride | null {
  const event = step.phase ? PHASE_EVENTS[step.phase] : undefined;
  return event ? { event: labels[event.phase], tone: event.tone } : null;
}

export function familyTapeOverrides(
  history: readonly SortStep[],
  labels: FamilyTapeLabels,
): readonly (TapeEventOverride | null)[] {
  return history.map((step, index) => (index === 0 ? null : familyTapeOverride(step, labels)));
}
