import { FFT_NTT_RECURSIVE_INPUT_SCHEMA, type FftNttTask } from './fft-ntt-task';

export const FFT_NTT_RECURSIVE_FFT_SPLIT_TASK: FftNttTask = {
  id: 'recursive-fft-split',
  name: 'Rekurencyjne FFT przez even/odd',
  summary: 'Rozbicie Cooleya-Tukeya na część parzystą, nieparzystą i motylki.',
  instruction: 'Policz FFT wektora przez rekurencyjny podział na indeksy parzyste i nieparzyste.',
  hints: [
    'Najpierw policz FFT części parzystej i nieparzystej.',
    'Potem złóż wynik motylkami z kolejnymi potęgami omega.',
  ],
  difficulty: 'medium',
  defaultValues: { n: 4, omega: 'i', A: '[1, 2, 3, 4]' },
  inputSchema: FFT_NTT_RECURSIVE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'recursive-fft-split' },
};
