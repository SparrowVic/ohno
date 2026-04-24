import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  POLLARDS_RHO_TASK_INPUT_SCHEMA,
  PollardsRhoTask,
} from './pollards-rho-task';

/** Fast first contact with rho — `n = 91 = 7 · 13`, `f(x) = x² + 1`,
 *  `x₀ = 2`. A single tortoise-hare step already yields `gcd = 7`,
 *  so the entire narrative fits on one page. */
export const POLLARDS_RHO_QUICK_FACTOR_TASK: PollardsRhoTask = {
  id: 'quick-factor',
  name: t('features.algorithms.tasks.pollardsRho.quickFactor.title'),
  summary: t('features.algorithms.tasks.pollardsRho.quickFactor.summary'),
  instruction: t('features.algorithms.tasks.pollardsRho.quickFactor.instruction'),
  hints: [t('features.algorithms.tasks.pollardsRho.quickFactor.hints.0')],
  difficulty: 'easy',
  defaultValues: { n: 91, c: 1, x0: 2 },
  inputSchema: POLLARDS_RHO_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
