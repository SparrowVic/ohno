import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** Values for a Reservoir-sampling task:
 *
 *  - `stream` — whitespace-separated integers representing the items
 *    arriving one by one. The algorithm is length-agnostic but a
 *    visible stream keeps the pedagogy concrete.
 *  - `reservoirSize` — sample size `k`. Must be ≥ 1 and should not
 *    exceed the stream length (degrades to "keep everything" at
 *    equality, which is still a legal run).
 *  - `seed` — deterministic LCG seed for the coin flips. Changing
 *    the seed re-rolls every decision in the iteration table so
 *    students can see different outcomes from the same stream. */
export interface ReservoirSamplingTaskValues {
  readonly stream: string;
  readonly reservoirSize: number;
  readonly seed: number;
}

export type ReservoirSamplingTask = NotebookTask<ReservoirSamplingTaskValues>;

export const RESERVOIR_SAMPLING_TASK_INPUT_SCHEMA: TaskInputSchema<ReservoirSamplingTaskValues> =
  {
    stream: {
      kind: 'string',
      label: t('features.algorithms.tasks.reservoirSampling.values.stream'),
      placeholder: t(
        'features.algorithms.tasks.reservoirSampling.values.streamPlaceholder',
      ),
      pattern: /^\s*-?\d+(\s+-?\d+)*\s*$/,
      minLength: 1,
      maxLength: 240,
    },
    reservoirSize: {
      kind: 'int',
      label: t('features.algorithms.tasks.reservoirSampling.values.reservoirSize'),
      min: 1,
      max: 32,
    },
    seed: {
      kind: 'int',
      label: t('features.algorithms.tasks.reservoirSampling.values.seed'),
      min: 1,
      max: 1_000_000,
    },
  };

export function parseStream(input: string): readonly number[] {
  if (!input.trim()) return [];
  const out: number[] = [];
  for (const tok of input.trim().split(/\s+/)) {
    const value = Number.parseInt(tok, 10);
    if (!Number.isInteger(value)) continue;
    out.push(value);
  }
  return out;
}
