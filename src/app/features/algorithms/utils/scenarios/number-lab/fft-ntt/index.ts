import { FFT_NTT_BIG_INTEGER_CONVOLUTION_TASK } from './big-integer-convolution.task';
import { FFT_NTT_CYCLIC_VS_LINEAR_TRAP_TASK } from './cyclic-vs-linear-trap.task';
import type { FftNttTask } from './fft-ntt-task';
import { FFT_NTT_PRIMITIVE_ROOT_CHECK_TASK } from './primitive-root-check.task';
import { FFT_NTT_RECURSIVE_FFT_SPLIT_TASK } from './recursive-fft-split.task';
import { FFT_NTT_SHORT_TASK } from './short.task';

export {
  FFT_NTT_BIG_INTEGER_INPUT_SCHEMA,
  FFT_NTT_CONVOLUTION_INPUT_SCHEMA,
  FFT_NTT_CYCLIC_TRAP_INPUT_SCHEMA,
  FFT_NTT_PRIMITIVE_ROOT_INPUT_SCHEMA,
  FFT_NTT_RECURSIVE_INPUT_SCHEMA,
  formatVector,
  parseVector,
} from './fft-ntt-task';
export type { FftNttNotebookFlow, FftNttTask, FftNttTaskValues } from './fft-ntt-task';

export const FFT_NTT_TASKS: readonly FftNttTask[] = [
  FFT_NTT_SHORT_TASK,
  FFT_NTT_RECURSIVE_FFT_SPLIT_TASK,
  FFT_NTT_CYCLIC_VS_LINEAR_TRAP_TASK,
  FFT_NTT_BIG_INTEGER_CONVOLUTION_TASK,
  FFT_NTT_PRIMITIVE_ROOT_CHECK_TASK,
];

export const DEFAULT_FFT_NTT_TASK_ID = 'short';
