import { POLLARDS_RHO_CLASSIC_8051_TASK } from './classic-8051.task';
import { POLLARDS_RHO_CYCLE_FAILURE_TASK } from './cycle-failure.task';
import { POLLARDS_RHO_QUICK_FACTOR_TASK } from './quick-factor.task';
import { PollardsRhoTask } from './pollards-rho-task';

export {
  POLLARDS_RHO_TASK_INPUT_SCHEMA,
  POLLARDS_RHO_MAX_ITERATIONS,
} from './pollards-rho-task';
export type { PollardsRhoTask, PollardsRhoTaskValues } from './pollards-rho-task';

/** Roster of Pollard's rho tasks, ordered from the fastest success
 *  (one iteration) through a textbook mid-size example to the
 *  failure mode where rho cycles without yielding a factor. More
 *  tasks drop next to these as their own `<slug>.task.ts` file and
 *  get an entry below. */
export const POLLARDS_RHO_TASKS: readonly PollardsRhoTask[] = [
  POLLARDS_RHO_QUICK_FACTOR_TASK,
  POLLARDS_RHO_CLASSIC_8051_TASK,
  POLLARDS_RHO_CYCLE_FAILURE_TASK,
];

export const DEFAULT_POLLARDS_RHO_TASK_ID = 'quick-factor';
