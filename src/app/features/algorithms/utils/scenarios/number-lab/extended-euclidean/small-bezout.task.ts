import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

/** Minimal sensible Bézout example — two forward steps (30 mod 12 = 6,
 *  12 mod 6 = 0) and a single back-substitution that reads `6 = 1·30
 *  + (−2)·12`. Great first encounter, because the relationship between
 *  forward and backward phases is visible at one glance. */
export const EXTENDED_EUCLIDEAN_SMALL_BEZOUT_TASK: ExtendedEuclideanTask = {
  id: 'small-bezout',
  name: t('features.algorithms.tasks.extendedEuclidean.smallBezout.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.smallBezout.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.smallBezout.instruction'),
  hints: [t('features.algorithms.tasks.extendedEuclidean.smallBezout.hints.0')],
  difficulty: 'easy',
  defaultValues: { a: 30, b: 12 },
  inputSchema: EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
