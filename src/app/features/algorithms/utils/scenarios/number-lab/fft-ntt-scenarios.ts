import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  DEFAULT_FFT_NTT_TASK_ID,
  FFT_NTT_TASKS,
  FftNttTask,
  isPowerOfTwo,
  parseRealSignal,
} from './fft-ntt';

export interface FftNttPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface FftNttScenario extends BaseScenario {
  readonly kind: 'fft-ntt';
  /** Real signal, length already verified to be a power of two.
   *  The generator widens each entry into a complex number on the
   *  fly. */
  readonly input: readonly number[];
  readonly taskPrompt: TranslatableText | null;
}

export const FFT_NTT_PRESETS: readonly FftNttPresetOption[] = FFT_NTT_TASKS.map(
  (task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }),
);

export const DEFAULT_FFT_NTT_PRESET_ID = DEFAULT_FFT_NTT_TASK_ID;
export { FFT_NTT_TASKS, DEFAULT_FFT_NTT_TASK_ID };
export type FftNttValues = FftNttTask['defaultValues'];

export function createFftNttScenario(
  _size: number,
  presetId: string | null,
  customValues?: FftNttValues,
): FftNttScenario {
  const id = presetId ?? DEFAULT_FFT_NTT_TASK_ID;
  const task =
    FFT_NTT_TASKS.find((candidate) => candidate.id === id) ??
    FFT_NTT_TASKS.find((candidate) => candidate.id === DEFAULT_FFT_NTT_TASK_ID) ??
    FFT_NTT_TASKS[0];
  const values = customValues ?? task.defaultValues;
  const parsed = parseRealSignal(values.input);
  const input = isPowerOfTwo(parsed.length)
    ? parsed
    : parseRealSignal(task.defaultValues.input);
  return {
    kind: 'fft-ntt',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, {
      input: input.join(', '),
      N: input.length,
    }),
    input,
  };
}
