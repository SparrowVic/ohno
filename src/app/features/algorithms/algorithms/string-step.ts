import { SortPhase, SortStep } from '../models/sort-step';
import { StringTraceState } from '../models/string';
import { TranslatableText } from '../../../core/i18n/translatable-text';

export function createStringStep(args: {
  readonly activeCodeLine: number;
  readonly description: TranslatableText;
  readonly string: StringTraceState;
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
    string: args.string,
  };
}
