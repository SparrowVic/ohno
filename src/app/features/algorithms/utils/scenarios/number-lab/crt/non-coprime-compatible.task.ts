import { CRT_THREE_CONGRUENCE_INPUT_SCHEMA, CrtTask } from './crt-task';

export const CRT_NON_COPRIME_COMPATIBLE_TASK: CrtTask = {
  id: 'non-coprime-compatible',
  name: 'Uogolniony CRT: system zgodny',
  summary: 'Moduly nie sa parami wzglednie pierwsze, ale warunki sa zgodne.',
  instruction:
    'Najpierw sprawdz zgodnosc kongruencji, potem lacz warunki przez podstawianie i lcm.',
  hints: [
    'Dla modulow niewzglednie pierwszych sprawdz gcd(mi, mj) | (aj - ai).',
    'Modul po scaleniu to lcm, a nie prosty iloczyn modulow.',
  ],
  difficulty: 'hard',
  defaultValues: { a1: 14, m1: 18, a2: 38, m2: 60, a3: 2, m3: 7 },
  inputSchema: CRT_THREE_CONGRUENCE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'non-coprime-compatible' },
};
