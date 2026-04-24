import { GAUSSIAN_ELIMINATION_FRACTION_PIVOTS_TASK } from './fraction-pivots.task';
import type { GaussianEliminationTask } from './gaussian-elimination-task';
import { GAUSSIAN_ELIMINATION_INCONSISTENT_SYSTEM_TASK } from './inconsistent-system.task';
import { GAUSSIAN_ELIMINATION_INFINITE_SOLUTIONS_TASK } from './infinite-solutions.task';
import { GAUSSIAN_ELIMINATION_ROW_SWAP_TASK } from './row-swap.task';
import { GAUSSIAN_ELIMINATION_SHORT_TASK } from './short.task';

export {
  GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  parseGaussianSystem,
} from './gaussian-elimination-task';
export type {
  AugmentedRow,
  GaussianEliminationNotebookFlow,
  GaussianEliminationTask,
  GaussianEliminationTaskValues,
  ParsedSystem,
} from './gaussian-elimination-task';

export const GAUSSIAN_ELIMINATION_TASKS: readonly GaussianEliminationTask[] = [
  GAUSSIAN_ELIMINATION_SHORT_TASK,
  GAUSSIAN_ELIMINATION_ROW_SWAP_TASK,
  GAUSSIAN_ELIMINATION_FRACTION_PIVOTS_TASK,
  GAUSSIAN_ELIMINATION_INFINITE_SOLUTIONS_TASK,
  GAUSSIAN_ELIMINATION_INCONSISTENT_SYSTEM_TASK,
];

export const DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID = 'short';
