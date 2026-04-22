import { PointerLabTraceState } from '../models/pointer-lab';
import { SortPhase, SortStep } from '../models/sort-step';
import { TranslatableText } from '../../../core/i18n/translatable-text';

export function createPointerLabStep(args: {
  readonly activeCodeLine: number;
  readonly description: TranslatableText;
  readonly state: PointerLabTraceState;
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
    pointerLab: args.state,
  };
}
