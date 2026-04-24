import {
  GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  type GaussianEliminationTask,
} from './gaussian-elimination-task';

export const GAUSSIAN_ELIMINATION_INFINITE_SOLUTIONS_TASK: GaussianEliminationTask = {
  id: 'infinite-solutions',
  name: 'Nieskończenie wiele rozwiązań',
  summary: 'Układ zależny, w którym jedna zmienna zostaje wolna.',
  instruction:
    'Zredukuj układ i pokaż, dlaczego nie ma jednego rozwiązania, tylko rodzina rozwiązań z parametrem.',
  hints: [
    'Wiersz zerowy nie oznacza sprzeczności, jeśli prawa strona też jest równa 0.',
    'Kolumna bez pivota odpowiada zmiennej wolnej.',
  ],
  difficulty: 'hard',
  defaultValues: { system: '1 1 1 | 6; 2 2 2 | 12; 1 -1 0 | 0' },
  inputSchema: GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'infinite-solutions' },
};
