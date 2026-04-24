import {
  GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  type GaussianEliminationTask,
} from './gaussian-elimination-task';

export const GAUSSIAN_ELIMINATION_ROW_SWAP_TASK: GaussianEliminationTask = {
  id: 'row-swap',
  name: 'Zerowy pivot i zamiana wierszy',
  summary: 'Układ 3x3, w którym pierwszy wiersz nie może zostać pivotem.',
  instruction:
    'Rozwiąż układ metodą eliminacji Gaussa. Najpierw napraw zerowy pivot przez zamianę wierszy.',
  hints: [
    'W kolumnie x pierwszy wiersz ma 0, więc pivot trzeba przenieść z niższego wiersza.',
    'Po zamianie wierszy prowadź zwykłą eliminację w przód i potem eliminację wstecz.',
  ],
  difficulty: 'medium',
  defaultValues: { system: '0 1 1 | 5; 1 1 1 | 6; 2 -1 1 | 3' },
  inputSchema: GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'row-swap' },
};
