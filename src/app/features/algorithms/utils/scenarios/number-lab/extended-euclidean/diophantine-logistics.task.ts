import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_DIOPHANTINE_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

export const EXTENDED_EUCLIDEAN_DIOPHANTINE_LOGISTICS_TASK: ExtendedEuclideanTask = {
  id: 'diophantine-logistics',
  name: t('features.algorithms.tasks.extendedEuclidean.diophantineLogistics.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.diophantineLogistics.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.diophantineLogistics.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.diophantineLogistics.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.diophantineLogistics.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { a: 84, b: 36, target: 12 },
  inputSchema: EXTENDED_EUCLIDEAN_DIOPHANTINE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'linear-diophantine', target: 12, minimize: true },
};
