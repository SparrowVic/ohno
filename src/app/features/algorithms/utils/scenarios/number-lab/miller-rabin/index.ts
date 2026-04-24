import { MILLER_RABIN_GCD_PRECHECK_TASK } from './gcd-precheck.task';
import { MILLER_RABIN_SHORT_TASK } from './short.task';
import { MILLER_RABIN_SINGLE_WITNESS_TASK } from './single-witness.task';
import { MILLER_RABIN_SQRT_FACTOR_LEAK_TASK } from './sqrt-factor-leak.task';
import { MILLER_RABIN_STRONG_LIAR_MULTIBASE_TASK } from './strong-liar-multibase.task';
import type { MillerRabinTask } from './miller-rabin-task';

export {
  MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA,
  MILLER_RABIN_TWO_BASE_INPUT_SCHEMA,
} from './miller-rabin-task';
export type {
  MillerRabinNotebookFlow,
  MillerRabinTask,
  MillerRabinTaskValues,
} from './miller-rabin-task';

export const MILLER_RABIN_TASKS: readonly MillerRabinTask[] = [
  MILLER_RABIN_SHORT_TASK,
  MILLER_RABIN_SINGLE_WITNESS_TASK,
  MILLER_RABIN_STRONG_LIAR_MULTIBASE_TASK,
  MILLER_RABIN_GCD_PRECHECK_TASK,
  MILLER_RABIN_SQRT_FACTOR_LEAK_TASK,
];

export const DEFAULT_MILLER_RABIN_TASK_ID = 'short';
