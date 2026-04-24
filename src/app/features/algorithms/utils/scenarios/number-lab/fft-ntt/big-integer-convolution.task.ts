import { FFT_NTT_BIG_INTEGER_INPUT_SCHEMA, type FftNttTask } from './fft-ntt-task';

export const FFT_NTT_BIG_INTEGER_CONVOLUTION_TASK: FftNttTask = {
  id: 'big-integer-convolution',
  name: 'Mnożenie liczb przez konwolucję cyfr',
  summary: 'NTT jako narzędzie do mnożenia cyfr i odtworzenia liczby z przeniesieniami.',
  instruction:
    'Zamień liczby na cyfry od najmniej znaczącej, pomnóż przez NTT i wykonaj przeniesienia.',
  hints: [
    'Cyfry traktujemy jak współczynniki wielomianów w zadanej bazie.',
    'Po odwrotnej transformacie trzeba wykonać etap carry.',
  ],
  difficulty: 'hard',
  defaultValues: { left: 123, right: 12, base: 10, mod: 17, n: 4, omega: 4 },
  inputSchema: FFT_NTT_BIG_INTEGER_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'big-integer-convolution' },
};
