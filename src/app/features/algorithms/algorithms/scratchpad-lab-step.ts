import { ScratchpadLabTraceState } from '../models/scratchpad-lab';
import { SortPhase, SortStep } from '../models/sort-step';
import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * Build a SortStep whose primary trace channel is scratchpad-lab.
 * Algorithms that have both a dashboard (NumberLab / PointerLab / …)
 * and a chalkboard view pass the two states separately and the runtime
 * merges them — see `combineWithScratchpad` below. This factory is for
 * algorithms that only use the scratchpad variant.
 */
export function createScratchpadLabStep(args: {
  readonly activeCodeLine: number;
  readonly description: TranslatableText;
  readonly state: ScratchpadLabTraceState;
  readonly phase?: SortPhase;
}): SortStep {
  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: 0,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    scratchpadLab: args.state,
  };
}

/**
 * Attach a scratchpad-lab state to an existing step that already has
 * another primary trace (e.g. a NumberLab register dashboard). Used by
 * math-heavy algorithms that expose a variant toggle so users can swap
 * between "dashboard" and "tablica" views mid-playback.
 */
export function withScratchpad(step: SortStep, state: ScratchpadLabTraceState): SortStep {
  return { ...step, scratchpadLab: state };
}
