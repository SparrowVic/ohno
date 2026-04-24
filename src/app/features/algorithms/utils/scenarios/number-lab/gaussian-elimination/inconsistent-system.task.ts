import {
  GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  type GaussianEliminationTask,
} from './gaussian-elimination-task';

export const GAUSSIAN_ELIMINATION_INCONSISTENT_SYSTEM_TASK: GaussianEliminationTask = {
  id: 'inconsistent-system',
  name: 'Układ sprzeczny',
  summary: 'Krótki przykład, w którym eliminacja prowadzi do równania 0 = 1.',
  instruction:
    'Sprawdź układ eliminacją Gaussa i zakończ obliczenia w chwili wykrycia sprzeczności.',
  hints: [
    'Jeżeli po lewej stronie zostają same zera, a po prawej liczba niezerowa, układ nie ma rozwiązań.',
    'Dalsza eliminacja nie ma sensu po wykryciu wiersza sprzecznego.',
  ],
  difficulty: 'medium',
  defaultValues: { system: '1 1 | 2; 2 2 | 5' },
  inputSchema: GAUSSIAN_ELIMINATION_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'inconsistent-system' },
};
