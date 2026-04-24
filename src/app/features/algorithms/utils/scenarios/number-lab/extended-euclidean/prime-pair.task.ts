import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

/** Two primes, 251 and 199 — trivially coprime, but the division
 *  chain is surprisingly long (six forward steps). A solid stress
 *  test for keeping track of back-substitution coefficients without
 *  getting lost in arithmetic. */
export const EXTENDED_EUCLIDEAN_PRIME_PAIR_TASK: ExtendedEuclideanTask = {
  id: 'prime-pair',
  name: t('features.algorithms.tasks.extendedEuclidean.primePair.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.primePair.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.primePair.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.primePair.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.primePair.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { a: 251, b: 199 },
  inputSchema: EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
