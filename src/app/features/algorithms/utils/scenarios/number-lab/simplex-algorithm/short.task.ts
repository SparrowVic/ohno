import {
  SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  type SimplexAlgorithmTask,
} from './simplex-algorithm-task';

export const SIMPLEX_ALGORITHM_SHORT_TASK: SimplexAlgorithmTask = {
  id: 'short',
  name: 'Klasyczny maksymalny zysk',
  summary: 'Podstawowy przykład simplex z dwoma pivotami i jednoznacznym optimum.',
  instruction: 'Rozwiąż klasyczny problem maksymalizacji zysku metodą simplex.',
  hints: [
    'Zmienna wchodząca ma najbardziej ujemny koszt zredukowany.',
    'Zmienna wychodząca wynika z testu najmniejszego dodatniego ilorazu.',
  ],
  difficulty: 'medium',
  defaultValues: {
    objective: '40 30',
    constraints: '1 1 | 12; 2 1 | 16',
  },
  inputSchema: SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'basic-max-profit' },
};
