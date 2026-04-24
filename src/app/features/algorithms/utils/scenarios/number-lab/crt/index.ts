import { CRT_CLASSIC_TASK } from './classic.task';
import { CRT_SMALLEST_POSITIVE_TASK } from './smallest-positive.task';
import { CRT_TWO_CONGRUENCES_TASK } from './two-congruences.task';
import { CrtTask } from './crt-task';

export { CRT_TASK_INPUT_SCHEMA, parseCongruences } from './crt-task';
export type { CrtCongruence, CrtTask, CrtTaskValues } from './crt-task';

/** Roster of CRT tasks, ordered from the minimal two-modulus setup
 *  through the classic three-modulus textbook example up to the
 *  harder `9·11·13` system. More tasks drop next to these as their
 *  own `<slug>.task.ts` file and get an entry below. */
export const CRT_TASKS: readonly CrtTask[] = [
  CRT_TWO_CONGRUENCES_TASK,
  CRT_CLASSIC_TASK,
  CRT_SMALLEST_POSITIVE_TASK,
];

export const DEFAULT_CRT_TASK_ID = 'classic';
