import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  GCD_CODE_SNIPPET_ID,
  GCD_TASK_INPUT_SCHEMA,
  GcdTask,
} from './euclidean-gcd-task';

export const GCD_SHARED_TASK: GcdTask = {
  id: 'shared',
  name: t('features.algorithms.tasks.gcd.shared.title'),
  summary: t('features.algorithms.tasks.gcd.shared.summary'),
  instruction: t('features.algorithms.tasks.gcd.shared.instruction'),
  hints: [
    t('features.algorithms.tasks.gcd.shared.hints.0'),
    t('features.algorithms.tasks.gcd.shared.hints.1'),
  ],
  difficulty: 'easy',
  defaultValues: { a: 48, b: 36 },
  inputSchema: GCD_TASK_INPUT_SCHEMA,
  codeSnippetId: GCD_CODE_SNIPPET_ID,
};
