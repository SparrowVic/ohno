import { CRT_THREE_CONGRUENCE_INPUT_SCHEMA, CrtTask, validatePairwiseCoprime } from './crt-task';

export const CRT_PROGRESSIVE_MERGE_TASK: CrtTask = {
  id: 'progressive-merge',
  name: 'Laczenie kongruencji krok po kroku',
  summary: 'Najpierw laczymy dwa warunki, potem dolaczamy trzeci.',
  instruction: 'Polacz pierwsze dwie kongruencje w jedna, a dopiero potem dolacz trzeci warunek.',
  hints: [
    'Nie zaczynaj od sumy a_i * M_i * y_i.',
    'Po pierwszym scaleniu powinien powstac jeden warunek modulo m1 * m2.',
  ],
  difficulty: 'medium',
  defaultValues: { a1: 4, m1: 9, a2: 2, m2: 11, a3: 7, m3: 13 },
  inputSchema: CRT_THREE_CONGRUENCE_INPUT_SCHEMA,
  validate: validatePairwiseCoprime,
  codeSnippetId: null,
  notebookFlow: { kind: 'progressive-merge' },
};
