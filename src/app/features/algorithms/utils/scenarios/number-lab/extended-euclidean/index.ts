import { EXTENDED_EUCLIDEAN_CLASSIC_TASK } from './classic.task';
import { EXTENDED_EUCLIDEAN_FIBONACCI_CHAIN_TASK } from './fibonacci-chain.task';
import { EXTENDED_EUCLIDEAN_KNOWN_GCD_TASK } from './known-gcd.task';
import { EXTENDED_EUCLIDEAN_LARGE_TASK } from './large.task';
import { EXTENDED_EUCLIDEAN_MODULAR_INVERSE_TASK } from './modular-inverse.task';
import { EXTENDED_EUCLIDEAN_PRIME_PAIR_TASK } from './prime-pair.task';
import { EXTENDED_EUCLIDEAN_SHORT_TASK } from './short.task';
import { EXTENDED_EUCLIDEAN_SMALL_BEZOUT_TASK } from './small-bezout.task';
import { ExtendedEuclideanTask } from './extended-euclidean-task';

export {
  EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID,
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
} from './extended-euclidean-task';
export type {
  ExtendedEuclideanTask,
  ExtendedEuclideanTaskValues,
} from './extended-euclidean-task';

/** Full task roster for Extended Euclidean, ordered roughly from the
 *  shortest sensible Bézout (two forward steps) up to the worst-case
 *  Fibonacci chain. Each task lives in its own file — the cost of
 *  adding another variant is one new `.task.ts` file and one entry
 *  in the array below. */
export const EXTENDED_EUCLIDEAN_TASKS: readonly ExtendedEuclideanTask[] = [
  EXTENDED_EUCLIDEAN_SHORT_TASK,
  EXTENDED_EUCLIDEAN_CLASSIC_TASK,
  EXTENDED_EUCLIDEAN_LARGE_TASK,
  EXTENDED_EUCLIDEAN_SMALL_BEZOUT_TASK,
  EXTENDED_EUCLIDEAN_MODULAR_INVERSE_TASK,
  EXTENDED_EUCLIDEAN_KNOWN_GCD_TASK,
  EXTENDED_EUCLIDEAN_PRIME_PAIR_TASK,
  EXTENDED_EUCLIDEAN_FIBONACCI_CHAIN_TASK,
];

export const DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID = 'classic';
