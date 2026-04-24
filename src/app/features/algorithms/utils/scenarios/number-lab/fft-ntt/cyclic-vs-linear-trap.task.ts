import { FFT_NTT_CYCLIC_TRAP_INPUT_SCHEMA, type FftNttTask } from './fft-ntt-task';

export const FFT_NTT_CYCLIC_VS_LINEAR_TRAP_TASK: FftNttTask = {
  id: 'cyclic-vs-linear-trap',
  name: 'Pułapka konwolucji cyklicznej',
  summary: 'Najpierw błędne NTT bez paddingu, potem poprawna konwolucja liniowa.',
  instruction: 'Pokaż różnicę między konwolucją cykliczną bez paddingu i liniową z paddingiem.',
  hints: [
    'Długość NTT musi być co najmniej równa len(A) + len(B) - 1.',
    'Bez paddingu współczynniki z końca zawijają się na początek.',
  ],
  difficulty: 'hard',
  defaultValues: {
    mod: 17,
    A: '[1, 2, 3, 4]',
    B: '[1, 1, 1, 1]',
    bad_n: 4,
    good_n: 8,
    omega4: 4,
    omega8: 2,
  },
  inputSchema: FFT_NTT_CYCLIC_TRAP_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'cyclic-vs-linear-trap' },
};
