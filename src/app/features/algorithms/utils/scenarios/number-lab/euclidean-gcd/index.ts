import { GCD_ABUNDANCE_TASK } from './abundance.task';
import { GCD_COPRIME_TASK } from './coprime.task';
import { GCD_FIBONACCI_WORST_TASK } from './fibonacci-worst.task';
import { GCD_IDENTICAL_TASK } from './identical.task';
import { GCD_LARGE_TASK } from './large.task';
import { GCD_POWERS_OF_TWO_TASK } from './powers-of-two.task';
import { GCD_SHARED_TASK } from './shared.task';
import { GCD_TWIN_PRIMES_TASK } from './twin-primes.task';
import { GcdTask } from './euclidean-gcd-task';

export { GCD_CODE_SNIPPET_ID, GCD_TASK_INPUT_SCHEMA } from './euclidean-gcd-task';
export type { GcdTask, GcdTaskValues } from './euclidean-gcd-task';

/** Full task roster for the Euclidean GCD, in pedagogical order: the
 *  three original hand-picked chains first (easy → medium), then the
 *  new additions arranged roughly from trivial to worst-case. Each
 *  task lives in its own file so adding one means dropping a single
 *  `<slug>.task.ts` next to these and appending the import here. */
export const EUCLIDEAN_GCD_TASKS: readonly GcdTask[] = [
  GCD_COPRIME_TASK,
  GCD_SHARED_TASK,
  GCD_LARGE_TASK,
  GCD_POWERS_OF_TWO_TASK,
  GCD_IDENTICAL_TASK,
  GCD_TWIN_PRIMES_TASK,
  GCD_ABUNDANCE_TASK,
  GCD_FIBONACCI_WORST_TASK,
];

export const DEFAULT_EUCLIDEAN_GCD_TASK_ID = 'shared';
