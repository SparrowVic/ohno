import { RESERVOIR_SAMPLING_DISTRIBUTED_MERGE_TASK } from './distributed-merge.task';
import { RESERVOIR_SAMPLING_FIXED_K_UPDATES_TASK } from './fixed-k-updates.task';
import { RESERVOIR_SAMPLING_PREDICATE_RESERVOIR_TASK } from './predicate-reservoir.task';
import type { ReservoirSamplingTask } from './reservoir-sampling-task';
import { RESERVOIR_SAMPLING_SHORT_TASK } from './short.task';
import { RESERVOIR_SAMPLING_WEIGHTED_RESERVOIR_TASK } from './weighted-reservoir.task';

export {
  RESERVOIR_SAMPLING_DISTRIBUTED_INPUT_SCHEMA,
  RESERVOIR_SAMPLING_FIXED_K_INPUT_SCHEMA,
  RESERVOIR_SAMPLING_K_ONE_INPUT_SCHEMA,
  RESERVOIR_SAMPLING_PREDICATE_INPUT_SCHEMA,
  RESERVOIR_SAMPLING_WEIGHTED_INPUT_SCHEMA,
  formatDecimal,
  formatLabelList,
  formatPredicateList,
  formatPriorityList,
  parseLabelStream,
  parseNumberMap,
  parsePredicateStream,
  parsePriorityItems,
  parseWeightedItems,
} from './reservoir-sampling-task';
export type {
  PredicateStreamItem,
  PriorityItem,
  ReservoirSamplingNotebookFlow,
  ReservoirSamplingTask,
  ReservoirSamplingTaskValues,
  WeightedReservoirItem,
} from './reservoir-sampling-task';

export const RESERVOIR_SAMPLING_TASKS: readonly ReservoirSamplingTask[] = [
  RESERVOIR_SAMPLING_SHORT_TASK,
  RESERVOIR_SAMPLING_FIXED_K_UPDATES_TASK,
  RESERVOIR_SAMPLING_PREDICATE_RESERVOIR_TASK,
  RESERVOIR_SAMPLING_WEIGHTED_RESERVOIR_TASK,
  RESERVOIR_SAMPLING_DISTRIBUTED_MERGE_TASK,
];

export const DEFAULT_RESERVOIR_SAMPLING_TASK_ID = 'short';
