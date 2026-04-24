import { POLLARDS_RHO_BRENT_INPUT_SCHEMA, PollardsRhoTask } from './pollards-rho-task';

export const POLLARDS_RHO_BRENT_BATCH_GCD_TASK: PollardsRhoTask = {
  id: 'brent-batch-gcd',
  name: 'Wariant Brenta i batchowanie NWD',
  summary: 'Brent grupuje różnice w q i liczy gcd rzadziej niż Floyd.',
  instruction: 'Rozłóż n wariantem Brenta: grupuj różnice w iloczyn q, a gcd licz po paczce.',
  hints: [
    'Blok r rośnie, a q zbiera kolejne |x - y| modulo n.',
    'Gdy gcd(q, n) jest nietrywialny, paczka ujawniła dzielnik.',
  ],
  difficulty: 'hard',
  defaultValues: { n: 10403, x0: 2, c: 1, m: 3 },
  inputSchema: POLLARDS_RHO_BRENT_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'brent-batch-gcd' },
};
