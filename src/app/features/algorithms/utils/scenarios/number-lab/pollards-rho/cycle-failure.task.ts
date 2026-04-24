import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  POLLARDS_RHO_TASK_INPUT_SCHEMA,
  PollardsRhoTask,
} from './pollards-rho-task';

/** Failure mode — the tortoise catches the hare without yielding a
 *  non-trivial factor, so `gcd = n` and the algorithm gives up.
 *  `n = 53` is prime, so no non-trivial factor exists; rho has no
 *  choice but to report failure. The cure in practice: pick a fresh
 *  `c` and restart — this task demonstrates the trigger. */
export const POLLARDS_RHO_CYCLE_FAILURE_TASK: PollardsRhoTask = {
  id: 'cycle-failure',
  name: t('features.algorithms.tasks.pollardsRho.cycleFailure.title'),
  summary: t('features.algorithms.tasks.pollardsRho.cycleFailure.summary'),
  instruction: t('features.algorithms.tasks.pollardsRho.cycleFailure.instruction'),
  hints: [
    t('features.algorithms.tasks.pollardsRho.cycleFailure.hints.0'),
    t('features.algorithms.tasks.pollardsRho.cycleFailure.hints.1'),
  ],
  difficulty: 'hard',
  defaultValues: { n: 53, c: 1, x0: 2 },
  inputSchema: POLLARDS_RHO_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
