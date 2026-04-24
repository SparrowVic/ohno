import { MILLER_RABIN_TWO_BASE_INPUT_SCHEMA, MillerRabinTask } from './miller-rabin-task';

export const MILLER_RABIN_STRONG_LIAR_MULTIBASE_TASK: MillerRabinTask = {
  id: 'strong-liar-multibase',
  name: 'Silny pseudopierwszy przypadek dla jednej bazy',
  summary: '2047 przechodzi dla bazy 2, ale baza 3 wykrywa złożoność.',
  instruction: 'Pokaż dwa testy baz i wyjaśnij, dlaczego jedna baza to za mało.',
  hints: [
    'Baza 2 jest strong liar dla 2047.',
    'Druga baza może natychmiast zmienić wynik na composite.',
  ],
  difficulty: 'hard',
  defaultValues: { n: 2047, base1: 2, base2: 3 },
  inputSchema: MILLER_RABIN_TWO_BASE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'strong-liar-multibase' },
};
