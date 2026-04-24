import { CRT_FOUR_CONGRUENCE_INPUT_SCHEMA, CrtTask, validatePairwiseCoprime } from './crt-task';

export const CRT_GARNER_MIXED_RADIX_TASK: CrtTask = {
  id: 'garner-mixed-radix',
  name: 'Rekonstrukcja metoda Garnera',
  summary: 'Zaawansowana rekonstrukcja przez reprezentacje mieszana.',
  instruction:
    'Odtworz liczbe x bez klasycznej sumy CRT, liczac kolejne wspolczynniki c0, c1, c2, c3.',
  hints: [
    'Szukamy postaci x = c0 + c1*m1 + c2*m1*m2 + c3*m1*m2*m3.',
    'Kazdy kolejny wspolczynnik wynika z nastepnej kongruencji.',
  ],
  difficulty: 'hard',
  defaultValues: { a1: 4, m1: 5, a2: 3, m2: 7, a3: 8, m3: 9, a4: 6, m4: 11 },
  inputSchema: CRT_FOUR_CONGRUENCE_INPUT_SCHEMA,
  validate: validatePairwiseCoprime,
  codeSnippetId: null,
  notebookFlow: { kind: 'garner-mixed-radix' },
};
