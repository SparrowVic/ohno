import {
  SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  type SimplexAlgorithmTask,
} from './simplex-algorithm-task';

export const SIMPLEX_ALGORITHM_UNBOUNDED_RAY_TASK: SimplexAlgorithmTask = {
  id: 'unbounded-ray',
  name: 'Przypadek nieograniczony',
  summary: 'Kolumna wchodząca nie ma dodatniego elementu, więc brak zmiennej wychodzącej.',
  instruction:
    'Wykryj problem nieograniczony: funkcja celu może rosnąć bez końca wzdłuż promienia dopuszczalnego.',
  hints: [
    'Jeśli w kolumnie wchodzącej nie ma dodatniego elementu, test ilorazów nie ma kandydata.',
    'Brak zmiennej wychodzącej oznacza brak skończonego optimum.',
  ],
  difficulty: 'hard',
  defaultValues: {
    objective: '1 1',
    constraints: '-1 1 | 2; 0 1 | 3',
  },
  inputSchema: SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'unbounded-ray' },
};
