import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  GaussianEliminationTask,
} from './gaussian-elimination-task';

/** Canonical 2×2 linear system with a clean integer solution:
 *  `x + y = 5, x − y = 1` → `x = 3, y = 2`. Every row operation
 *  stays in integers, so the scratchpad narrative reads
 *  naturally without fraction clutter. */
export const GAUSSIAN_ELIMINATION_BASIC_2X2_TASK: GaussianEliminationTask = {
  id: 'basic-2x2',
  name: t('features.algorithms.tasks.gaussianElimination.basic2x2.title'),
  summary: t('features.algorithms.tasks.gaussianElimination.basic2x2.summary'),
  instruction: t(
    'features.algorithms.tasks.gaussianElimination.basic2x2.instruction',
  ),
  hints: [
    t('features.algorithms.tasks.gaussianElimination.basic2x2.hints.0'),
    t('features.algorithms.tasks.gaussianElimination.basic2x2.hints.1'),
  ],
  difficulty: 'easy',
  defaultValues: { system: '1 1 | 5; 1 -1 | 1' },
  inputSchema: GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
