import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { GCD_TASK_INPUT_SCHEMA, GcdTask } from './euclidean-gcd-task';

/** Twin primes (101, 103) — trivially coprime, but with `a < b` on the
 *  first iteration. Useful for seeing the implicit "swap" the algorithm
 *  performs without a special case: the first division produces the
 *  larger value as remainder, so the next step works on (103, 101). */
export const GCD_TWIN_PRIMES_TASK: GcdTask = {
  id: 'twin-primes',
  name: t('features.algorithms.tasks.gcd.twinPrimes.title'),
  summary: t('features.algorithms.tasks.gcd.twinPrimes.summary'),
  instruction: t('features.algorithms.tasks.gcd.twinPrimes.instruction'),
  hints: [
    t('features.algorithms.tasks.gcd.twinPrimes.hints.0'),
    t('features.algorithms.tasks.gcd.twinPrimes.hints.1'),
  ],
  difficulty: 'easy',
  defaultValues: { a: 101, b: 103 },
  inputSchema: GCD_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
