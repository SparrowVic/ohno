import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { GCD_TASK_INPUT_SCHEMA, GcdTask } from './euclidean-gcd-task';

/** Trivial case — one of the values is already a divisor of the other.
 *  The algorithm terminates on the first division and returns the
 *  smaller input. A good way to internalise the "remainder == 0" exit
 *  before tackling harder chains. */
export const GCD_POWERS_OF_TWO_TASK: GcdTask = {
  id: 'powers-of-two',
  name: t('features.algorithms.tasks.gcd.powersOfTwo.title'),
  summary: t('features.algorithms.tasks.gcd.powersOfTwo.summary'),
  instruction: t('features.algorithms.tasks.gcd.powersOfTwo.instruction'),
  hints: [t('features.algorithms.tasks.gcd.powersOfTwo.hints.0')],
  difficulty: 'easy',
  defaultValues: { a: 64, b: 16 },
  inputSchema: GCD_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
