import { SIMPLEX_ALGORITHM_BASIC_MAX_PROFIT_TASK } from './basic-max-profit.task';
import { SimplexAlgorithmTask } from './simplex-algorithm-task';

export {
  SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  parseLinearProgram,
} from './simplex-algorithm-task';
export type {
  ParsedLinearProgram,
  SimplexAlgorithmTask,
  SimplexAlgorithmTaskValues,
} from './simplex-algorithm-task';

/** Roster of Simplex tasks. Starting with one textbook max-profit LP;
 *  degeneracy / auxiliary-variable / unbounded cases arrive later as
 *  their own `<slug>.task.ts` files. */
export const SIMPLEX_ALGORITHM_TASKS: readonly SimplexAlgorithmTask[] = [
  SIMPLEX_ALGORITHM_BASIC_MAX_PROFIT_TASK,
];

export const DEFAULT_SIMPLEX_ALGORITHM_TASK_ID = 'basic-max-profit';
