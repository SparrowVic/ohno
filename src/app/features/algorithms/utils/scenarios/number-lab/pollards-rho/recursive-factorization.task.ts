import { POLLARDS_RHO_FLOYD_INPUT_SCHEMA, PollardsRhoTask } from './pollards-rho-task';

export const POLLARDS_RHO_RECURSIVE_FACTORIZATION_TASK: PollardsRhoTask = {
  id: 'recursive-factorization',
  name: 'Pełny rozkład przez rekurencję',
  summary: 'Po znalezieniu jednego dzielnika rozbijamy dalej pozostały iloraz.',
  instruction:
    'Użyj Pollard’s Rho rekurencyjnie, aż wszystkie czynniki w rozkładzie będą pierwsze.',
  hints: [
    'Nietrywialny dzielnik kończy tylko jedno wywołanie, niekoniecznie całą faktoryzację.',
    'Każdy złożony iloraz trzeba rozbić kolejnym wywołaniem.',
  ],
  difficulty: 'hard',
  defaultValues: { n: 104663, x0: 2, c: 1 },
  inputSchema: POLLARDS_RHO_FLOYD_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'recursive-factorization' },
};
