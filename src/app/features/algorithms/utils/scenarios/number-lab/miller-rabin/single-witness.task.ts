import { MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA, MillerRabinTask } from './miller-rabin-task';

export const MILLER_RABIN_SINGLE_WITNESS_TASK: MillerRabinTask = {
  id: 'single-witness',
  name: 'Świadek złożoności w jednej bazie',
  summary: 'Baza 137 wykrywa złożoność liczby 221.',
  instruction: 'Sprawdź, czy wybrana baza jest świadkiem złożoności liczby n.',
  hints: ['Jeśli ciąg nie trafia w 1 na początku ani w n - 1 później, baza jest świadkiem.'],
  difficulty: 'medium',
  defaultValues: { n: 221, base: 137 },
  inputSchema: MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'single-witness' },
};
