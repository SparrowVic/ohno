import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  GCD_CODE_SNIPPET_ID,
  GCD_TASK_INPUT_SCHEMA,
  GcdTask,
} from './euclidean-gcd-task';

export const GCD_COPRIME_TASK: GcdTask = {
  id: 'coprime',
  name: t('features.algorithms.tasks.gcd.coprime.title'),
  summary: t('features.algorithms.tasks.gcd.coprime.summary'),
  instruction: t('features.algorithms.tasks.gcd.coprime.instruction'),
  hints: [
    t('features.algorithms.tasks.gcd.coprime.hints.0'),
    t('features.algorithms.tasks.gcd.coprime.hints.1'),
  ],
  difficulty: 'easy',
  defaultValues: { a: 35, b: 17 },
  inputSchema: GCD_TASK_INPUT_SCHEMA,
  codeSnippetId: GCD_CODE_SNIPPET_ID,
};
