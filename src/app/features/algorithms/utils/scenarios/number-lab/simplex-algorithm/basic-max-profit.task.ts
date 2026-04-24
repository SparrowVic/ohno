import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  SimplexAlgorithmTask,
} from './simplex-algorithm-task';

/** Canonical textbook max-profit LP:
 *
 *     max  z = 40x + 30y
 *     s.t. x + y  ≤ 12
 *          2x + y ≤ 16
 *          x, y ≥ 0
 *
 *  Optimum at the intersection of both binding constraints: `x = 4,
 *  y = 8, z = 400`. Two pivots suffice, the whole tableau chain stays
 *  in integer-friendly fractions, and every pedagogical beat (entering
 *  variable via most-negative reduced cost, leaving variable via
 *  min-ratio test) shows up exactly once. */
export const SIMPLEX_ALGORITHM_BASIC_MAX_PROFIT_TASK: SimplexAlgorithmTask = {
  id: 'basic-max-profit',
  name: t('features.algorithms.tasks.simplexAlgorithm.basicMaxProfit.title'),
  summary: t('features.algorithms.tasks.simplexAlgorithm.basicMaxProfit.summary'),
  instruction: t(
    'features.algorithms.tasks.simplexAlgorithm.basicMaxProfit.instruction',
  ),
  hints: [
    t('features.algorithms.tasks.simplexAlgorithm.basicMaxProfit.hints.0'),
    t('features.algorithms.tasks.simplexAlgorithm.basicMaxProfit.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: {
    objective: '40 30',
    constraints: '1 1 | 12; 2 1 | 16',
  },
  inputSchema: SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
