import { FFT_NTT_BASIC_4_POINT_TASK } from './basic-4-point.task';
import { FftNttTask } from './fft-ntt-task';

export {
  FFT_NTT_TASK_INPUT_SCHEMA,
  isPowerOfTwo,
  parseRealSignal,
} from './fft-ntt-task';
export type { FftNttTask, FftNttTaskValues } from './fft-ntt-task';

/** Roster of FFT tasks. Starting with one 4-point DFT of a real
 *  signal; convolution, inverse DFT, and the number-theoretic
 *  variant (NTT) arrive as their own `<slug>.task.ts` files. */
export const FFT_NTT_TASKS: readonly FftNttTask[] = [FFT_NTT_BASIC_4_POINT_TASK];

export const DEFAULT_FFT_NTT_TASK_ID = 'basic-4-point';
