import { GCD_CODE_SNIPPET_ID, GCD_PAIR_INPUT_SCHEMA, type GcdTask } from './euclidean-gcd-task';

export const GCD_SHORT_TASK: GcdTask = {
  id: 'short',
  name: 'Podstawowe działanie algorytmu Euklidesa',
  summary: 'Najkrótszy sensowny przykład z dwoma dzieleniami.',
  instruction: 'Oblicz gcd(60, 48) używając klasycznego algorytmu Euklidesa z dzieleniem z resztą.',
  hints: [
    'W każdym kroku zapisujemy a = q * b + r.',
    'Ostatnia niezerowa reszta jest wynikiem gcd.',
  ],
  difficulty: 'easy',
  defaultValues: { a: 60, b: 48 },
  inputSchema: GCD_PAIR_INPUT_SCHEMA,
  codeSnippetId: GCD_CODE_SNIPPET_ID,
  notebookFlow: { kind: 'basic' },
};
