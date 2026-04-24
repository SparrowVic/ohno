import {
  SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  type SimplexAlgorithmTask,
} from './simplex-algorithm-task';

export const SIMPLEX_ALGORITHM_SLACK_NON_BINDING_TASK: SimplexAlgorithmTask = {
  id: 'slack-non-binding',
  name: 'Ograniczenie niewiążące',
  summary: 'Optimum z dodatnim slackiem w jednym z ograniczeń.',
  instruction: 'Znajdź optimum i wskaż, które ograniczenie zostaje luźne po zakończeniu simplex.',
  hints: [
    'Nie każde ograniczenie musi być aktywne w optimum.',
    'Dodatni slack oznacza niewykorzystany zasób.',
  ],
  difficulty: 'medium',
  defaultValues: {
    objective: '3 5',
    constraints: '1 0 | 4; 0 2 | 12; 3 2 | 18',
  },
  inputSchema: SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'slack-non-binding' },
};
