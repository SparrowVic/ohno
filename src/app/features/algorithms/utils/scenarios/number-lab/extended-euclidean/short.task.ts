import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID,
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

export const EXTENDED_EUCLIDEAN_SHORT_TASK: ExtendedEuclideanTask = {
  id: 'short',
  name: t('features.algorithms.tasks.extendedEuclidean.short.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.short.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.short.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.short.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.short.hints.1'),
  ],
  difficulty: 'easy',
  defaultValues: { a: 60, b: 48 },
  inputSchema: EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  codeSnippetId: EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID,
};
