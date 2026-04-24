import {
  SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  type SimplexAlgorithmTask,
} from './simplex-algorithm-task';

export const SIMPLEX_ALGORITHM_DEGENERATE_TIE_TASK: SimplexAlgorithmTask = {
  id: 'degenerate-tie',
  name: 'Degeneracja i remis w teście ilorazów',
  summary: 'Tie w min-ratio oraz pivot o wartości RHS = 0.',
  instruction: 'Pokaż, jak simplex zachowuje się przy remisie w teście ilorazów i degeneracji.',
  hints: [
    'Remis w teście ilorazów może prowadzić do bazy z wartością zerową.',
    'Degeneracja oznacza pivot bez poprawy wartości funkcji celu.',
  ],
  difficulty: 'hard',
  defaultValues: {
    objective: '2 1',
    constraints: '1 0 | 2; 0 1 | 2; 1 1 | 2',
  },
  inputSchema: SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'degenerate-tie' },
};
