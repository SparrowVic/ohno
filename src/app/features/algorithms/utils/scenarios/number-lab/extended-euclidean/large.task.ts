import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID,
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

export const EXTENDED_EUCLIDEAN_LARGE_TASK: ExtendedEuclideanTask = {
  id: 'large',
  name: t('features.algorithms.tasks.extendedEuclidean.large.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.large.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.large.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.large.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.large.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { a: 1071, b: 462 },
  inputSchema: EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  codeSnippetId: EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID,
};
