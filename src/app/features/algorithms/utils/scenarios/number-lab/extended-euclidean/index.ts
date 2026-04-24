import { EXTENDED_EUCLIDEAN_DIOPHANTINE_LOGISTICS_TASK } from './diophantine-logistics.task';
import { EXTENDED_EUCLIDEAN_FIBONACCI_CHAIN_TASK } from './fibonacci-chain.task';
import { EXTENDED_EUCLIDEAN_MODULAR_EQUATION_TRAP_TASK } from './modular-equation-trap.task';
import { EXTENDED_EUCLIDEAN_RSA_INVERSE_TASK } from './rsa-inverse.task';
import { EXTENDED_EUCLIDEAN_SHORT_TASK } from './short.task';
import { ExtendedEuclideanTask } from './extended-euclidean-task';

export {
  EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID,
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
} from './extended-euclidean-task';
export type {
  ExtendedEuclideanTask,
  ExtendedEuclideanTaskValues,
  ExtendedEuclideanNotebookFlow,
} from './extended-euclidean-task';

/** Full task roster for Extended Euclidean, ordered from the default
 *  basic Bézout run through applied inverse / Diophantine / modular
 *  equation tasks, up to a long pure back-substitution chain. */
export const EXTENDED_EUCLIDEAN_TASKS: readonly ExtendedEuclideanTask[] = [
  EXTENDED_EUCLIDEAN_SHORT_TASK,
  EXTENDED_EUCLIDEAN_RSA_INVERSE_TASK,
  EXTENDED_EUCLIDEAN_DIOPHANTINE_LOGISTICS_TASK,
  EXTENDED_EUCLIDEAN_MODULAR_EQUATION_TRAP_TASK,
  EXTENDED_EUCLIDEAN_FIBONACCI_CHAIN_TASK,
];

export const DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID = 'short';
