import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

/** Classic modular-inverse setup. `gcd(7, 5) = 1`, so there exist
 *  integers `s, t` with `7s + 5t = 1`; the coefficient `s` taken mod
 *  5 is the multiplicative inverse of 7 modulo 5. This is the shape
 *  RSA uses to compute `d = e⁻¹ mod φ(n)`. */
export const EXTENDED_EUCLIDEAN_MODULAR_INVERSE_TASK: ExtendedEuclideanTask = {
  id: 'modular-inverse',
  name: t('features.algorithms.tasks.extendedEuclidean.modularInverse.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.modularInverse.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.modularInverse.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.modularInverse.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.modularInverse.hints.1'),
  ],
  difficulty: 'easy',
  defaultValues: { a: 7, b: 5 },
  inputSchema: EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
