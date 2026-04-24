import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { notebookInstructionText } from '../../../models/notebook-task';
import {
  DEFAULT_RESERVOIR_SAMPLING_TASK_ID,
  RESERVOIR_SAMPLING_TASKS,
  ReservoirSamplingTask,
  parseStream,
} from './reservoir-sampling';

export interface ReservoirSamplingPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface ReservoirSamplingScenario extends BaseScenario {
  readonly kind: 'reservoir-sampling';
  readonly stream: readonly number[];
  readonly reservoirSize: number;
  readonly seed: number;
  readonly taskPrompt: TranslatableText | null;
}

export const RESERVOIR_SAMPLING_PRESETS: readonly ReservoirSamplingPresetOption[] =
  RESERVOIR_SAMPLING_TASKS.map((task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }));

export const DEFAULT_RESERVOIR_SAMPLING_PRESET_ID = DEFAULT_RESERVOIR_SAMPLING_TASK_ID;
export { RESERVOIR_SAMPLING_TASKS, DEFAULT_RESERVOIR_SAMPLING_TASK_ID };
export type ReservoirSamplingValues = ReservoirSamplingTask['defaultValues'];

export function createReservoirSamplingScenario(
  _size: number,
  presetId: string | null,
  customValues?: ReservoirSamplingValues,
): ReservoirSamplingScenario {
  const id = presetId ?? DEFAULT_RESERVOIR_SAMPLING_TASK_ID;
  const task =
    RESERVOIR_SAMPLING_TASKS.find((candidate) => candidate.id === id) ??
    RESERVOIR_SAMPLING_TASKS.find(
      (candidate) => candidate.id === DEFAULT_RESERVOIR_SAMPLING_TASK_ID,
    ) ??
    RESERVOIR_SAMPLING_TASKS[0];
  const values = customValues ?? task.defaultValues;
  const stream = parseStream(values.stream);
  const reservoirSize = Math.max(1, Math.floor(values.reservoirSize));
  const seed = Math.max(1, Math.floor(values.seed));
  return {
    kind: 'reservoir-sampling',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: notebookInstructionText(task, {
      stream: stream.join(', '),
      k: reservoirSize,
      n: stream.length,
      seed,
    }),
    stream,
    reservoirSize,
    seed,
  };
}
