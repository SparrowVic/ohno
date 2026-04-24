import { MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA, MillerRabinTask } from './miller-rabin-task';

export const MILLER_RABIN_GCD_PRECHECK_TASK: MillerRabinTask = {
  id: 'gcd-precheck',
  name: 'Wczesny test gcd(base, n)',
  summary: 'Baza 7 od razu ujawnia czynnik liczby 91.',
  instruction: 'Przed potęgowaniem modularnym sprawdź, czy baza jest względnie pierwsza z n.',
  hints: [
    'Gdy 1 < gcd(a, n) < n, nie trzeba liczyć a^d mod n.',
    'Wspólny dzielnik bazy i n jest już dowodem złożoności.',
  ],
  difficulty: 'medium',
  defaultValues: { n: 91, base: 7 },
  inputSchema: MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'gcd-precheck' },
};
