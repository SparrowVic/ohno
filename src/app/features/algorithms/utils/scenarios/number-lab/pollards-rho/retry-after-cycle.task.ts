import { POLLARDS_RHO_RETRY_INPUT_SCHEMA, PollardsRhoTask } from './pollards-rho-task';

export const POLLARDS_RHO_RETRY_AFTER_CYCLE_TASK: PollardsRhoTask = {
  id: 'retry-after-cycle',
  name: 'Restart po nieudanym cyklu',
  summary: 'Pierwsza próba daje d = n, druga funkcja znajduje faktor.',
  instruction:
    'Pokaż, że d = n oznacza nieudaną próbę, a następnie powtórz algorytm z inną stałą c.',
  hints: [
    'Jeżeli x = y modulo n, to gcd(0, n) zwraca całe n.',
    'Po porażce zmień funkcję iteracyjną, ale zostaw tę samą metodę.',
  ],
  difficulty: 'medium',
  defaultValues: { n: 299, x0: 2, c_fail: 1, c_retry: 2 },
  inputSchema: POLLARDS_RHO_RETRY_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'retry-after-cycle' },
};
