import { CRT_THREE_CONGRUENCE_INPUT_SCHEMA, CrtTask, validatePairwiseCoprime } from './crt-task';

export const CRT_SHORT_TASK: CrtTask = {
  id: 'short',
  name: 'Podstawowe dzialanie algorytmu',
  summary: 'Klasyczna konstrukcja CRT dla trzech malych modulow.',
  instruction:
    'Znajdz najmniejsza nieujemna liczbe x spelniajaca uklad kongruencji i uzyj bezposredniej konstrukcji CRT.',
  hints: [
    'Najpierw sprawdz, ze moduly sa parami wzglednie pierwsze.',
    'Dla kazdego warunku policz M_i = M / m_i oraz odwrotnosc y_i.',
  ],
  difficulty: 'easy',
  defaultValues: { a1: 2, m1: 3, a2: 3, m2: 5, a3: 2, m3: 7 },
  inputSchema: CRT_THREE_CONGRUENCE_INPUT_SCHEMA,
  validate: validatePairwiseCoprime,
  codeSnippetId: null,
  notebookFlow: { kind: 'direct' },
};
