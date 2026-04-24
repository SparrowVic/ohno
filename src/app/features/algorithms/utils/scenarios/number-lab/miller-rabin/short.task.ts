import { MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA, MillerRabinTask } from './miller-rabin-task';

export const MILLER_RABIN_SHORT_TASK: MillerRabinTask = {
  id: 'short',
  name: 'Podstawowy test dla liczby pierwszej',
  summary: '37 przechodzi test Millera-Rabina dla bazy 2.',
  instruction: 'Sprawdź rozkład n - 1 i kolejne kwadraty modularne dla jednej bazy.',
  hints: [
    'Najpierw zapisz n - 1 = 2^s * d z nieparzystym d.',
    'Baza przechodzi, gdy x0 = 1 albo któryś kwadrat daje n - 1.',
  ],
  difficulty: 'easy',
  defaultValues: { n: 37, base: 2 },
  inputSchema: MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'prime-pass' },
};
