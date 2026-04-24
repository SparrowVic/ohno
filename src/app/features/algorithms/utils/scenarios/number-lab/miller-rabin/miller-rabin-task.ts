import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** Input values for a Miller-Rabin primality test. `n` is the odd
 *  integer being tested; `witnesses` is a comma-separated list of
 *  witness bases (e.g. "2, 3, 7") — each base triggers one full
 *  witness check in the generator. */
export interface MillerRabinTaskValues {
  readonly n: number;
  readonly witnesses: string;
}

export type MillerRabinTask = NotebookTask<MillerRabinTaskValues>;

export const MILLER_RABIN_TASK_INPUT_SCHEMA: TaskInputSchema<MillerRabinTaskValues> = {
  n: {
    kind: 'int',
    label: t('features.algorithms.tasks.millerRabin.values.n'),
    min: 3,
  },
  witnesses: {
    kind: 'string',
    label: t('features.algorithms.tasks.millerRabin.values.witnesses'),
    placeholder: t('features.algorithms.tasks.millerRabin.values.witnessesPlaceholder'),
    pattern: /^\s*\d+(\s*,\s*\d+)*\s*$/,
    minLength: 1,
    maxLength: 64,
  },
};

/** Parse the comma-separated witness string into bounded integer
 *  witnesses — the generator consumes the normalized array. Any
 *  witness ≥ n or < 2 is silently dropped so malformed user input
 *  can't push the algorithm into an invalid state. */
export function parseWitnesses(input: string, n: number): readonly number[] {
  if (!input) return [];
  return input
    .split(',')
    .map((tok) => Number.parseInt(tok.trim(), 10))
    .filter((v) => Number.isInteger(v) && v >= 2 && v < n);
}
