import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  RESERVOIR_SAMPLING_TASK_INPUT_SCHEMA,
  ReservoirSamplingTask,
} from './reservoir-sampling-task';

/** Canonical reservoir sampling run: eight integers streaming past,
 *  reservoir of size three, deterministic seed. The student watches
 *  the fill phase (first three items unconditionally written), then
 *  one decision per remaining item — probability `k/(i+1)`, coin
 *  roll, and the slot that gets overwritten when the coin lands
 *  "accept". */
export const RESERVOIR_SAMPLING_UNIFORM_TASK: ReservoirSamplingTask = {
  id: 'uniform-sample',
  name: t('features.algorithms.tasks.reservoirSampling.uniformSample.title'),
  summary: t('features.algorithms.tasks.reservoirSampling.uniformSample.summary'),
  instruction: t(
    'features.algorithms.tasks.reservoirSampling.uniformSample.instruction',
  ),
  hints: [
    t('features.algorithms.tasks.reservoirSampling.uniformSample.hints.0'),
    t('features.algorithms.tasks.reservoirSampling.uniformSample.hints.1'),
  ],
  difficulty: 'medium',
  defaultValues: {
    stream: '5 3 8 1 9 2 7 4',
    reservoirSize: 3,
    seed: 42,
  },
  inputSchema: RESERVOIR_SAMPLING_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
