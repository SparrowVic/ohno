import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_MODULAR_EQUATION_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

export const EXTENDED_EUCLIDEAN_MODULAR_EQUATION_TRAP_TASK: ExtendedEuclideanTask = {
  id: 'modular-equation-trap',
  name: t('features.algorithms.tasks.extendedEuclidean.modularEquationTrap.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.modularEquationTrap.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.modularEquationTrap.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.modularEquationTrap.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.modularEquationTrap.hints.1'),
  ],
  difficulty: 'hard',
  defaultValues: { a: 221, b: 143, rhs: 55 },
  inputSchema: EXTENDED_EUCLIDEAN_MODULAR_EQUATION_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'modular-equation', rhs: 55 },
};
