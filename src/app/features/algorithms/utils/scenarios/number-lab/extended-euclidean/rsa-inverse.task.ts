import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_RSA_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

export const EXTENDED_EUCLIDEAN_RSA_INVERSE_TASK: ExtendedEuclideanTask = {
  id: 'rsa-inverse',
  name: t('features.algorithms.tasks.extendedEuclidean.rsaInverse.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.rsaInverse.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.rsaInverse.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.rsaInverse.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.rsaInverse.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: { n: 221, a: 192, b: 35 },
  inputSchema: EXTENDED_EUCLIDEAN_RSA_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'rsa-inverse', n: 221 },
};
