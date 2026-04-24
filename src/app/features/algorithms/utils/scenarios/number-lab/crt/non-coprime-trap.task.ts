import { CRT_THREE_CONGRUENCE_INPUT_SCHEMA, CrtTask } from './crt-task';

export const CRT_NON_COPRIME_TRAP_TASK: CrtTask = {
  id: 'non-coprime-trap',
  name: 'Uogolniony CRT: przypadek pulapka',
  summary: 'Pierwsze dwa warunki sa sprzeczne, wiec system nie ma rozwiazan.',
  instruction:
    'Sprawdz, czy system ma rozwiazanie. Nie licz konstrukcji CRT, jesli warunki sa sprzeczne.',
  hints: [
    'Najpierw sprawdz gcd(m1, m2) | (a2 - a1).',
    'Jesli test nie przejdzie, trzecia kongruencja nie moze naprawic sprzecznosci.',
  ],
  difficulty: 'hard',
  defaultValues: { a1: 5, m1: 12, a2: 14, m2: 18, a3: 19, m3: 25 },
  inputSchema: CRT_THREE_CONGRUENCE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'non-coprime-trap' },
};
