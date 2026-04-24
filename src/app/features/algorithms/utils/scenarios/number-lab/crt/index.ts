import { CRT_GARNER_MIXED_RADIX_TASK } from './garner-mixed-radix.task';
import { CRT_NON_COPRIME_COMPATIBLE_TASK } from './non-coprime-compatible.task';
import { CRT_NON_COPRIME_TRAP_TASK } from './non-coprime-trap.task';
import { CRT_PROGRESSIVE_MERGE_TASK } from './progressive-merge.task';
import { CRT_SHORT_TASK } from './short.task';
import { CrtTask } from './crt-task';

export {
  CRT_FOUR_CONGRUENCE_INPUT_SCHEMA,
  CRT_THREE_CONGRUENCE_INPUT_SCHEMA,
  parseCongruences,
  validatePairwiseCoprime,
} from './crt-task';
export type { CrtCongruence, CrtNotebookFlow, CrtTask, CrtTaskValues } from './crt-task';

/** Roster ordered exactly like `TASKS.md`: the basic direct CRT
 *  example is the initial view, followed by progressively less
 *  textbook flows. */
export const CRT_TASKS: readonly CrtTask[] = [
  CRT_SHORT_TASK,
  CRT_PROGRESSIVE_MERGE_TASK,
  CRT_NON_COPRIME_COMPATIBLE_TASK,
  CRT_NON_COPRIME_TRAP_TASK,
  CRT_GARNER_MIXED_RADIX_TASK,
];

export const DEFAULT_CRT_TASK_ID = 'short';
