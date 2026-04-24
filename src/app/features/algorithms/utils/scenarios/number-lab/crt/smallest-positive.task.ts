import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { CRT_TASK_INPUT_SCHEMA, CrtTask } from './crt-task';

/** Three larger coprime moduli — `9 · 11 · 13 = 1287`. The answer
 *  `x ≡ 58 (mod 1287)` has non-trivial intermediate coefficients in
 *  each term, so the Bézout-style back-substitution becomes a real
 *  bookkeeping exercise. */
export const CRT_SMALLEST_POSITIVE_TASK: CrtTask = {
  id: 'smallest-positive',
  name: t('features.algorithms.tasks.crt.smallestPositive.title'),
  summary: t('features.algorithms.tasks.crt.smallestPositive.summary'),
  instruction: t('features.algorithms.tasks.crt.smallestPositive.instruction'),
  hints: [
    t('features.algorithms.tasks.crt.smallestPositive.hints.0'),
    t('features.algorithms.tasks.crt.smallestPositive.hints.1'),
  ],
  difficulty: 'hard',
  defaultValues: { congruences: '4:9, 3:11, 6:13' },
  inputSchema: CRT_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
