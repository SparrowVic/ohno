import {
  SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  type SimplexAlgorithmTask,
} from './simplex-algorithm-task';

export const SIMPLEX_ALGORITHM_ALTERNATIVE_OPTIMUM_TASK: SimplexAlgorithmTask = {
  id: 'alternative-optimum',
  name: 'Alternatywne optimum',
  summary: 'Końcowe tableau ma zerowy koszt zredukowany dla zmiennej niebazowej.',
  instruction:
    'Rozwiąż LP i sprawdź, czy optimum jest jednoznaczne, czy istnieje cała krawędź rozwiązań optymalnych.',
  hints: [
    'Zerowy koszt zredukowany zmiennej niebazowej oznacza alternatywne optimum.',
    'Wartość funkcji celu może być taka sama dla więcej niż jednego punktu.',
  ],
  difficulty: 'hard',
  defaultValues: {
    objective: '1 1',
    constraints: '1 1 | 4; 1 0 | 3; 0 1 | 3',
  },
  inputSchema: SIMPLEX_ALGORITHM_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'alternative-optimum' },
};
