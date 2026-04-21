import { SortPhase, SortStep } from '../models/sort-step';
import { TreeTraversalTraceState } from '../models/tree';
import { TranslatableText } from '../../../core/i18n/translatable-text';

export function createTreeStep(args: {
  readonly activeCodeLine: number;
  readonly description: TranslatableText;
  readonly tree: TreeTraversalTraceState;
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
    tree: args.tree,
  };
}
