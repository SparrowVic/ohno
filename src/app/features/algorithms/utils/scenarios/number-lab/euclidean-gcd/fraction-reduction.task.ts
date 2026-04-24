import { GCD_FRACTION_INPUT_SCHEMA, type GcdTask } from './euclidean-gcd-task';

export const GCD_FRACTION_REDUCTION_TASK: GcdTask = {
  id: 'fraction-reduction',
  name: 'Skracanie ułamka przez NWD',
  summary: 'Najpierw gcd licznika i mianownika, potem normalizacja ułamka.',
  instruction: 'Skróć ułamek 4620 / 1078 przez obliczenie gcd(4620, 1078).',
  hints: [
    'NWD jest tutaj narzędziem do skrócenia ułamka.',
    'Podziel licznik i mianownik przez otrzymany gcd.',
  ],
  difficulty: 'medium',
  defaultValues: { numerator: 4620, denominator: 1078 },
  inputSchema: GCD_FRACTION_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'fraction-reduction' },
};
