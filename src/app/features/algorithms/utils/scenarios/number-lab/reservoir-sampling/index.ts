import { RESERVOIR_SAMPLING_UNIFORM_TASK } from './uniform-sample.task';
import { ReservoirSamplingTask } from './reservoir-sampling-task';

export {
  RESERVOIR_SAMPLING_TASK_INPUT_SCHEMA,
  parseStream,
} from './reservoir-sampling-task';
export type {
  ReservoirSamplingTask,
  ReservoirSamplingTaskValues,
} from './reservoir-sampling-task';

/** Roster of reservoir sampling tasks. Starting with one canonical
 *  k=3 uniform sample from an 8-element stream; harder tasks
 *  (weighted, distributed, tuple) arrive as their own files. */
export const RESERVOIR_SAMPLING_TASKS: readonly ReservoirSamplingTask[] = [
  RESERVOIR_SAMPLING_UNIFORM_TASK,
];

export const DEFAULT_RESERVOIR_SAMPLING_TASK_ID = 'uniform-sample';
