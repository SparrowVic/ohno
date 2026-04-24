import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { CRT_TASK_INPUT_SCHEMA, CrtTask } from './crt-task';

/** Classical textbook CRT — three coprime moduli, well-trodden answer
 *  `x ≡ 23 (mod 105)`. A gentle first encounter with the construction
 *  and the go-to exam preset. */
export const CRT_CLASSIC_TASK: CrtTask = {
  id: 'classic',
  name: t('features.algorithms.tasks.crt.classic.title'),
  summary: t('features.algorithms.tasks.crt.classic.summary'),
  instruction: t('features.algorithms.tasks.crt.classic.instruction'),
  hints: [
    t('features.algorithms.tasks.crt.classic.hints.0'),
    t('features.algorithms.tasks.crt.classic.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { congruences: '2:3, 3:5, 2:7' },
  inputSchema: CRT_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
