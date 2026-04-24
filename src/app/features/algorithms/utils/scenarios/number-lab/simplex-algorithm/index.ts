import { SIMPLEX_ALGORITHM_ALTERNATIVE_OPTIMUM_TASK } from './alternative-optimum.task';
import { SIMPLEX_ALGORITHM_DEGENERATE_TIE_TASK } from './degenerate-tie.task';
import type { SimplexAlgorithmTask } from './simplex-algorithm-task';
import { SIMPLEX_ALGORITHM_SHORT_TASK } from './short.task';
import { SIMPLEX_ALGORITHM_SLACK_NON_BINDING_TASK } from './slack-non-binding.task';
import { SIMPLEX_ALGORITHM_UNBOUNDED_RAY_TASK } from './unbounded-ray.task';

export { SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA, parseLinearProgram } from './simplex-algorithm-task';
export type {
  ParsedLinearProgram,
  SimplexAlgorithmTask,
  SimplexAlgorithmTaskValues,
  SimplexNotebookFlow,
} from './simplex-algorithm-task';

export const SIMPLEX_ALGORITHM_TASKS: readonly SimplexAlgorithmTask[] = [
  SIMPLEX_ALGORITHM_SHORT_TASK,
  SIMPLEX_ALGORITHM_SLACK_NON_BINDING_TASK,
  SIMPLEX_ALGORITHM_DEGENERATE_TIE_TASK,
  SIMPLEX_ALGORITHM_ALTERNATIVE_OPTIMUM_TASK,
  SIMPLEX_ALGORITHM_UNBOUNDED_RAY_TASK,
];

export const DEFAULT_SIMPLEX_ALGORITHM_TASK_ID = 'short';
