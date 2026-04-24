import { GAUSSIAN_ELIMINATION_BASIC_2X2_TASK } from './basic-2x2.task';
import { GaussianEliminationTask } from './gaussian-elimination-task';

export {
  GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  parseGaussianSystem,
} from './gaussian-elimination-task';
export type {
  AugmentedRow,
  GaussianEliminationTask,
  GaussianEliminationTaskValues,
  ParsedSystem,
} from './gaussian-elimination-task';

/** Roster of Gaussian elimination tasks. Starting with one canonical
 *  2×2 exam-style task; larger systems and edge cases (singular,
 *  infinite solutions, 3×3) land as their own `<slug>.task.ts` file
 *  and get appended below. */
export const GAUSSIAN_ELIMINATION_TASKS: readonly GaussianEliminationTask[] = [
  GAUSSIAN_ELIMINATION_BASIC_2X2_TASK,
];

export const DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID = 'basic-2x2';
