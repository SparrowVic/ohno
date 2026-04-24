import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { CRT_TASK_INPUT_SCHEMA, CrtTask } from './crt-task';

/** Minimal CRT — two congruences, `mod 35`. Fits on a single
 *  back-substitution line and gives students a clean first contact
 *  before the three-modulus classical example. Answer: `x ≡ 16`. */
export const CRT_TWO_CONGRUENCES_TASK: CrtTask = {
  id: 'two-congruences',
  name: t('features.algorithms.tasks.crt.twoCongruences.title'),
  summary: t('features.algorithms.tasks.crt.twoCongruences.summary'),
  instruction: t('features.algorithms.tasks.crt.twoCongruences.instruction'),
  hints: [t('features.algorithms.tasks.crt.twoCongruences.hints.0')],
  difficulty: 'easy',
  defaultValues: { congruences: '1:5, 2:7' },
  inputSchema: CRT_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
