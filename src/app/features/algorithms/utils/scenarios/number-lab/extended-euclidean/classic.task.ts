import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID,
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

export const EXTENDED_EUCLIDEAN_CLASSIC_TASK: ExtendedEuclideanTask = {
  id: 'classic',
  name: t('features.algorithms.tasks.extendedEuclidean.classic.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.classic.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.classic.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.classic.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.classic.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { a: 240, b: 46 },
  inputSchema: EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  codeSnippetId: EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID,
};
