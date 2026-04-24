import { POLLARDS_RHO_BRENT_BATCH_GCD_TASK } from './brent-batch-gcd.task';
import { POLLARDS_RHO_COMPOSITE_FACTOR_SPLIT_TASK } from './composite-factor-split.task';
import { POLLARDS_RHO_RECURSIVE_FACTORIZATION_TASK } from './recursive-factorization.task';
import { POLLARDS_RHO_RETRY_AFTER_CYCLE_TASK } from './retry-after-cycle.task';
import { POLLARDS_RHO_SHORT_TASK } from './short.task';
import type { PollardsRhoTask } from './pollards-rho-task';

export {
  POLLARDS_RHO_BRENT_INPUT_SCHEMA,
  POLLARDS_RHO_COMPOSITE_SPLIT_INPUT_SCHEMA,
  POLLARDS_RHO_FLOYD_INPUT_SCHEMA,
  POLLARDS_RHO_MAX_ITERATIONS,
  POLLARDS_RHO_RETRY_INPUT_SCHEMA,
} from './pollards-rho-task';
export type {
  PollardsRhoNotebookFlow,
  PollardsRhoTask,
  PollardsRhoTaskValues,
} from './pollards-rho-task';

export const POLLARDS_RHO_TASKS: readonly PollardsRhoTask[] = [
  POLLARDS_RHO_SHORT_TASK,
  POLLARDS_RHO_RETRY_AFTER_CYCLE_TASK,
  POLLARDS_RHO_BRENT_BATCH_GCD_TASK,
  POLLARDS_RHO_RECURSIVE_FACTORIZATION_TASK,
  POLLARDS_RHO_COMPOSITE_FACTOR_SPLIT_TASK,
];

export const DEFAULT_POLLARDS_RHO_TASK_ID = 'short';
