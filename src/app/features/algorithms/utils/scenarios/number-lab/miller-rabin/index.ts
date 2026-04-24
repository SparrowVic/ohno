import { MILLER_RABIN_CARMICHAEL_TASK } from './carmichael.task';
import { MILLER_RABIN_COMPOSITE_WITNESS_TASK } from './composite-witness.task';
import { MILLER_RABIN_SMALL_PRIME_TASK } from './small-prime.task';
import { MillerRabinTask } from './miller-rabin-task';

export { MILLER_RABIN_TASK_INPUT_SCHEMA, parseWitnesses } from './miller-rabin-task';
export type { MillerRabinTask, MillerRabinTaskValues } from './miller-rabin-task';

/** Roster of Miller-Rabin tasks, ordered pedagogically: a friendly
 *  small-prime sanity run, then a small composite with one witness,
 *  then the Carmichael trap where Fermat alone can't see the
 *  compositeness but Miller-Rabin can. More tasks drop next to these
 *  as `<slug>.task.ts` files and get an entry below. */
export const MILLER_RABIN_TASKS: readonly MillerRabinTask[] = [
  MILLER_RABIN_SMALL_PRIME_TASK,
  MILLER_RABIN_COMPOSITE_WITNESS_TASK,
  MILLER_RABIN_CARMICHAEL_TASK,
];

export const DEFAULT_MILLER_RABIN_TASK_ID = 'small-prime';
