import { SieveGridTraceState } from '../models/sieve-grid';
import { SortPhase, SortStep } from '../models/sort-step';
import { TranslatableText } from '../../../core/i18n/translatable-text';

export function createSieveGridStep(args: {
  readonly activeCodeLine: number;
  readonly description: TranslatableText;
  readonly state: SieveGridTraceState;
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
    sieveGrid: args.state,
  };
}
