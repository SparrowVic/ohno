import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  GCD_CODE_SNIPPET_ID,
  GCD_TASK_INPUT_SCHEMA,
  GcdTask,
} from './euclidean-gcd-task';

export const GCD_LARGE_TASK: GcdTask = {
  id: 'large',
  name: t('features.algorithms.tasks.gcd.large.title'),
  summary: t('features.algorithms.tasks.gcd.large.summary'),
  instruction: t('features.algorithms.tasks.gcd.large.instruction'),
  hints: [
    t('features.algorithms.tasks.gcd.large.hints.0'),
    t('features.algorithms.tasks.gcd.large.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { a: 1071, b: 462 },
  inputSchema: GCD_TASK_INPUT_SCHEMA,
  codeSnippetId: GCD_CODE_SNIPPET_ID,
};
