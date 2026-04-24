import { FFT_NTT_CONVOLUTION_INPUT_SCHEMA, FftNttTask } from './fft-ntt-task';

export const FFT_NTT_SHORT_TASK: FftNttTask = {
  id: 'short',
  name: 'Podstawowa konwolucja przez NTT',
  summary: 'Konwolucja dwóch małych wielomianów przez NTT długości 4 modulo 17.',
  instruction:
    'Pomnóż dwa wielomiany przez NTT: transformata, mnożenie punktowe i transformata odwrotna.',
  hints: [
    'Sprawdź najpierw, czy omega jest pierwiastkiem odpowiedniego stopnia.',
    'Po odwrotnej transformacie wynik jest zapisany modulo mod.',
  ],
  difficulty: 'medium',
  defaultValues: { mod: 17, n: 4, omega: 4, A: '[1, 2, 3, 0]', B: '[4, 5, 0, 0]' },
  inputSchema: FFT_NTT_CONVOLUTION_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'ntt-convolution' },
};
