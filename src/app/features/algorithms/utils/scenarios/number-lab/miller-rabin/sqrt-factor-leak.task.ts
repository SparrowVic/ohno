import { MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA, MillerRabinTask } from './miller-rabin-task';

export const MILLER_RABIN_SQRT_FACTOR_LEAK_TASK: MillerRabinTask = {
  id: 'sqrt-factor-leak',
  name: 'Nietrywialny pierwiastek z 1 i wyciek czynników',
  summary: 'Dla 341 baza 2 prowadzi do pierwiastka 32^2 = 1 mod 341.',
  instruction:
    'Po wykryciu nietrywialnego pierwiastka z 1 odzyskaj czynniki przez dwa obliczenia gcd.',
  hints: [
    'Jeśli x^2 = 1 mod n, ale x nie jest ±1, to n jest złożone.',
    'Czynniki można wydobyć przez gcd(x - 1, n) i gcd(x + 1, n).',
  ],
  difficulty: 'hard',
  defaultValues: { n: 341, base: 2 },
  inputSchema: MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'sqrt-factor-leak' },
};
