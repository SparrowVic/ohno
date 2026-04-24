import { POLLARDS_RHO_COMPOSITE_SPLIT_INPUT_SCHEMA, PollardsRhoTask } from './pollards-rho-task';

export const POLLARDS_RHO_COMPOSITE_FACTOR_SPLIT_TASK: PollardsRhoTask = {
  id: 'composite-factor-split',
  name: 'Pollard zwraca dzielnik złożony',
  summary: 'Pierwszy znaleziony dzielnik jest nietrywialny, ale nadal złożony.',
  instruction: 'Rozłóż n do końca i pokaż, że znaleziony dzielnik może wymagać dalszego rozbicia.',
  hints: [
    'Warunek 1 < d < n oznacza dzielnik, ale nie gwarantuje, że d jest pierwszy.',
    'Jeśli d jest złożone, uruchom faktoryzację jeszcze raz dla d.',
  ],
  difficulty: 'hard',
  defaultValues: { n: 169071, x0: 2, c: 1, c_for_21: 2 },
  inputSchema: POLLARDS_RHO_COMPOSITE_SPLIT_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'composite-factor-split' },
};
