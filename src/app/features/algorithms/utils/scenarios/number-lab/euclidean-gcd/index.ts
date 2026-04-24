import { GCD_FIBONACCI_WORST_CASE_TASK } from './fibonacci-worst-case.task';
import { GCD_FRACTION_REDUCTION_TASK } from './fraction-reduction.task';
import type { GcdTask } from './euclidean-gcd-task';
import { GCD_MULTI_NUMBER_FOLD_TASK } from './multi-number-fold.task';
import { GCD_SHORT_TASK } from './short.task';
import { GCD_SUBTRACTIVE_TO_DIVISION_TASK } from './subtractive-to-division.task';

export {
  GCD_CODE_SNIPPET_ID,
  GCD_FRACTION_INPUT_SCHEMA,
  GCD_MULTI_NUMBER_INPUT_SCHEMA,
  GCD_PAIR_INPUT_SCHEMA,
  GCD_TASK_INPUT_SCHEMA,
  formatNumberList,
  parseNumberList,
} from './euclidean-gcd-task';
export type { GcdNotebookFlow, GcdTask, GcdTaskValues } from './euclidean-gcd-task';

export const EUCLIDEAN_GCD_TASKS: readonly GcdTask[] = [
  GCD_SHORT_TASK,
  GCD_FIBONACCI_WORST_CASE_TASK,
  GCD_MULTI_NUMBER_FOLD_TASK,
  GCD_FRACTION_REDUCTION_TASK,
  GCD_SUBTRACTIVE_TO_DIVISION_TASK,
];

export const DEFAULT_EUCLIDEAN_GCD_TASK_ID = 'short';
