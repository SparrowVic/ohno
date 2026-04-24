import { FFT_NTT_PRIMITIVE_ROOT_INPUT_SCHEMA, type FftNttTask } from './fft-ntt-task';

export const FFT_NTT_PRIMITIVE_ROOT_CHECK_TASK: FftNttTask = {
  id: 'primitive-root-check',
  name: 'Zły pierwiastek NTT',
  summary: 'Walidacja pierwiastka, kolizja transformaty i naprawa parametru.',
  instruction:
    'Sprawdź, dlaczego omega o złym rzędzie niszczy odwracalność NTT, a potem popraw parametr.',
  hints: [
    'Dla pierwiastka pierwotnego stopnia n musi być omega^n = 1 oraz omega^(n/2) != 1.',
    'Kolizja dwóch różnych wejść oznacza brak odwracalności transformaty.',
  ],
  difficulty: 'hard',
  defaultValues: { mod: 17, n: 8, omega_bad: 4, omega_good: 2 },
  inputSchema: FFT_NTT_PRIMITIVE_ROOT_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'primitive-root-check' },
};
