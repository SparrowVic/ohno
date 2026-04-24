import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { GCD_TASK_INPUT_SCHEMA, GcdTask } from './euclidean-gcd-task';

/** Edge case — identical inputs. `a mod a = 0` closes the loop on the
 *  first iteration and the algorithm returns the shared value.
 *  Worth showing precisely because it tests whether students truly
 *  grasp the `gcd(a, b) = gcd(b, a mod b)` invariant or just pattern-
 *  match on "keep shrinking". */
export const GCD_IDENTICAL_TASK: GcdTask = {
  id: 'identical',
  name: t('features.algorithms.tasks.gcd.identical.title'),
  summary: t('features.algorithms.tasks.gcd.identical.summary'),
  instruction: t('features.algorithms.tasks.gcd.identical.instruction'),
  hints: [t('features.algorithms.tasks.gcd.identical.hints.0')],
  difficulty: 'easy',
  defaultValues: { a: 42, b: 42 },
  inputSchema: GCD_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
