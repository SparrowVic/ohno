import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

/** Large numbers, short chain. `gcd(735, 210) = 105` in two forward
 *  steps — the back-substitution reads off one equation. A useful
 *  counter-example to "big numbers need many steps": the number of
 *  iterations is driven by the ratio between values, not their scale. */
export const EXTENDED_EUCLIDEAN_KNOWN_GCD_TASK: ExtendedEuclideanTask = {
  id: 'known-gcd',
  name: t('features.algorithms.tasks.extendedEuclidean.knownGcd.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.knownGcd.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.knownGcd.instruction'),
  hints: [t('features.algorithms.tasks.extendedEuclidean.knownGcd.hints.0')],
  difficulty: 'medium',
  defaultValues: { a: 735, b: 210 },
  inputSchema: EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
