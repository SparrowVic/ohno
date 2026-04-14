import { SortPhase, SortStep } from '../models/sort-step';
import { StringTraceState } from '../models/string';

export function createStringStep(args: {
  readonly activeCodeLine: number;
  readonly description: string;
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
