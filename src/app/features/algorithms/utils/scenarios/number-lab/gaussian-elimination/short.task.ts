import {
  GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  type GaussianEliminationTask,
} from './gaussian-elimination-task';

export const GAUSSIAN_ELIMINATION_SHORT_TASK: GaussianEliminationTask = {
  id: 'short',
  name: 'Podstawowa eliminacja 2x2',
  summary: 'Najkrótszy przykład startowy: dwa równania, jeden krok eliminacji i odczyt wyniku.',
  instruction:
    'Rozwiąż układ równań metodą eliminacji Gaussa i pokaż kolejne macierze rozszerzone.',
  hints: [
    'Pierwszy pivot jest już równy 1, więc możesz od razu wyzerować element pod nim.',
    'Po wyznaczeniu y wróć do pierwszego równania i odczytaj x.',
  ],
  difficulty: 'easy',
  defaultValues: { system: '1 1 | 5; 1 -1 | 1' },
  inputSchema: GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'basic-2x2' },
};
