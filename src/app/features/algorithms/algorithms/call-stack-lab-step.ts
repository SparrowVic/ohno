import { CallStackLabTraceState } from '../models/call-stack-lab';
import { SortPhase, SortStep } from '../models/sort-step';
import { TranslatableText } from '../../../core/i18n/translatable-text';

export function createCallStackLabStep(args: {
  readonly activeCodeLine: number;
  readonly description: TranslatableText;
  readonly state: CallStackLabTraceState;
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
    callStackLab: args.state,
  };
}
