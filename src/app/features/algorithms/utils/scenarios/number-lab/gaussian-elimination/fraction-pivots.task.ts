import {
  GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  type GaussianEliminationTask,
} from './gaussian-elimination-task';

export const GAUSSIAN_ELIMINATION_FRACTION_PIVOTS_TASK: GaussianEliminationTask = {
  id: 'fraction-pivots',
  name: 'Układ 3x3 z ułamkami po pivotach',
  summary: 'Klasyczny układ 3x3, w którym normalizacja pivotów tworzy ułamki.',
  instruction:
    'Rozwiąż układ 3x3 metodą Gaussa-Jordana. Zapisz normalizacje pivotów i eliminację nad pivotami.',
  hints: [
    'Po podzieleniu pierwszego wiersza przez 2 w macierzy pojawią się ułamki.',
    'Nie zaokrąglaj pośrednich wartości. Ułamki są częścią sensu tego zadania.',
  ],
  difficulty: 'medium',
  defaultValues: { system: '2 1 -1 | 8; -3 -1 2 | -11; -2 1 2 | -3' },
  inputSchema: GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'fraction-pivots' },
};
