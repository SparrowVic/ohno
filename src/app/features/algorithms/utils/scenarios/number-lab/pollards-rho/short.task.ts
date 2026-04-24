import { POLLARDS_RHO_FLOYD_INPUT_SCHEMA, PollardsRhoTask } from './pollards-rho-task';

export const POLLARDS_RHO_SHORT_TASK: PollardsRhoTask = {
  id: 'short',
  name: "Podstawowe działanie Pollard's Rho",
  summary: 'Klasyczny wariant Floyda dla 8051 = 97 * 83.',
  instruction:
    "Rozłóż liczbę n metodą Pollard's Rho, używając wariantu Floyda z jednym wolnym i jednym szybkim wskaźnikiem.",
  hints: [
    'Licz x = f(x), y = f(f(y)), a potem d = gcd(|x - y|, n).',
    'Gdy 1 < d < n, znaleziono nietrywialny dzielnik.',
  ],
  difficulty: 'easy',
  defaultValues: { n: 8051, x0: 2, c: 1 },
  inputSchema: POLLARDS_RHO_FLOYD_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'floyd-basic' },
};
