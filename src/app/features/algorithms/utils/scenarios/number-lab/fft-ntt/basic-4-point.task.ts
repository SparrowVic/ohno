import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { FFT_NTT_TASK_INPUT_SCHEMA, FftNttTask } from './fft-ntt-task';

/** Canonical 4-point DFT: real input `[1, 2, 3, 4]` yields
 *  `[10, -2 + 2i, -2, -2 - 2i]`. Two butterfly stages, every twiddle
 *  is a power of `-i`, and the symmetry of the output (`X_3 = X_1*`
 *  for real input) surfaces naturally. Short enough that students
 *  can hand-verify every line. */
export const FFT_NTT_BASIC_4_POINT_TASK: FftNttTask = {
  id: 'basic-4-point',
  name: t('features.algorithms.tasks.fftNtt.basic4Point.title'),
  summary: t('features.algorithms.tasks.fftNtt.basic4Point.summary'),
  instruction: t('features.algorithms.tasks.fftNtt.basic4Point.instruction'),
  hints: [
    t('features.algorithms.tasks.fftNtt.basic4Point.hints.0'),
    t('features.algorithms.tasks.fftNtt.basic4Point.hints.1'),
  ],
  difficulty: 'hard',
  defaultValues: { input: '1 2 3 4' },
  inputSchema: FFT_NTT_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
