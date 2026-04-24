import { GCD_PAIR_INPUT_SCHEMA, type GcdTask } from './euclidean-gcd-task';

export const GCD_FIBONACCI_WORST_CASE_TASK: GcdTask = {
  id: 'fibonacci-worst-case',
  name: 'Długi łańcuch Fibonacciego',
  summary: 'Kolejne liczby Fibonacciego dają długi przebieg z ilorazami 1.',
  instruction:
    'Oblicz gcd(144, 89) i pokaż pełny łańcuch dzielenia dla kolejnych liczb Fibonacciego.',
  hints: [
    'Kolejne reszty są poprzednimi liczbami Fibonacciego.',
    'Ilorazy przez większość przebiegu są równe 1.',
  ],
  difficulty: 'hard',
  defaultValues: { a: 144, b: 89 },
  inputSchema: GCD_PAIR_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'fibonacci-worst-case' },
};
