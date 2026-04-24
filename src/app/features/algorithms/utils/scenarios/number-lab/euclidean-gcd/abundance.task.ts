import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { GCD_TASK_INPUT_SCHEMA, GcdTask } from './euclidean-gcd-task';

/** Rich factor structure — `252 = 2² · 3² · 7`, `198 = 2 · 3² · 11`.
 *  A student who factors both by hand finds `gcd = 2 · 3² = 18`; the
 *  algorithm arrives at the same answer without ever factoring, which
 *  is the whole point of Euclid's trick. */
export const GCD_ABUNDANCE_TASK: GcdTask = {
  id: 'abundance',
  name: t('features.algorithms.tasks.gcd.abundance.title'),
  summary: t('features.algorithms.tasks.gcd.abundance.summary'),
  instruction: t('features.algorithms.tasks.gcd.abundance.instruction'),
  hints: [
    t('features.algorithms.tasks.gcd.abundance.hints.0'),
    t('features.algorithms.tasks.gcd.abundance.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { a: 252, b: 198 },
  inputSchema: GCD_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
