import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** Input values for a Pollard's rho task.
 *  - `n` is the integer being factored.
 *  - `c` is the constant in the iteration `f(x) = x² + c mod n`.
 *  - `x0` is the starting value (also used as `y0`).
 *  The generator caps iterations internally so a failed run (no
 *  factor found, or cycle without a non-trivial gcd) still
 *  terminates gracefully. */
export interface PollardsRhoTaskValues {
  readonly n: number;
  readonly c: number;
  readonly x0: number;
}

export type PollardsRhoTask = NotebookTask<PollardsRhoTaskValues>;

export const POLLARDS_RHO_TASK_INPUT_SCHEMA: TaskInputSchema<PollardsRhoTaskValues> = {
  n: {
    kind: 'int',
    label: t('features.algorithms.tasks.pollardsRho.values.n'),
    min: 4,
  },
  c: {
    kind: 'int',
    label: t('features.algorithms.tasks.pollardsRho.values.c'),
    min: 1,
  },
  x0: {
    kind: 'int',
    label: t('features.algorithms.tasks.pollardsRho.values.x0'),
    min: 1,
  },
};

/** Maximum tortoise-hare iterations per task. Beyond this the scratchpad
 *  bails out with a "no factor / restart" message so the narrative
 *  never runs indefinitely. */
export const POLLARDS_RHO_MAX_ITERATIONS = 50;
