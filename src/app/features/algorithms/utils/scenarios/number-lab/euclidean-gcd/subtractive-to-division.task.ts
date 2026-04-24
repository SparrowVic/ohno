import { GCD_PAIR_INPUT_SCHEMA, type GcdTask } from './euclidean-gcd-task';

export const GCD_SUBTRACTIVE_TO_DIVISION_TASK: GcdTask = {
  id: 'subtractive-to-division',
  name: 'Odejmowanie i dzielenie',
  summary: 'Pierwotna wersja przez odejmowanie oraz jej zapis przez dzielenie z resztą.',
  instruction: 'Oblicz gcd(168, 72), najpierw przez odejmowanie, potem jako dzielenie z resztą.',
  hints: [
    'Powtarzane odejmowanie można skompresować do jednego dzielenia z resztą.',
    'Wynik można zinterpretować jako bok największego kwadratowego kafelka.',
  ],
  difficulty: 'medium',
  defaultValues: { a: 168, b: 72 },
  inputSchema: GCD_PAIR_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'subtractive-to-division' },
};
