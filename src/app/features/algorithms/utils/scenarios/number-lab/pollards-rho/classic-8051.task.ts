import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  POLLARDS_RHO_TASK_INPUT_SCHEMA,
  PollardsRhoTask,
} from './pollards-rho-task';

/** Textbook example — `n = 8051 = 83 · 97`, `f(x) = x² + 1`,
 *  `x₀ = 2`. Floyd's tortoise-hare recovers `gcd = 97` by the second
 *  iteration. Values are big enough to demonstrate that rho scales
 *  with [[math]]\sqrt{p}[[/math]], not `n`. */
export const POLLARDS_RHO_CLASSIC_8051_TASK: PollardsRhoTask = {
  id: 'classic-8051',
  name: t('features.algorithms.tasks.pollardsRho.classic8051.title'),
  summary: t('features.algorithms.tasks.pollardsRho.classic8051.summary'),
  instruction: t('features.algorithms.tasks.pollardsRho.classic8051.instruction'),
  hints: [
    t('features.algorithms.tasks.pollardsRho.classic8051.hints.0'),
    t('features.algorithms.tasks.pollardsRho.classic8051.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { n: 8051, c: 1, x0: 2 },
  inputSchema: POLLARDS_RHO_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
