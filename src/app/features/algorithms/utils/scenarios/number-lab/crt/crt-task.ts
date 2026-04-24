import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** One entry in a CRT system: `x ≡ residue (mod modulus)`. */
export interface CrtCongruence {
  readonly residue: number;
  readonly modulus: number;
}

/** Input values for a CRT task. The user writes the congruence system
 *  as a comma-separated list of `r:m` pairs — e.g. `"2:3, 3:5, 2:7"`
 *  for the classical exam setup `x ≡ 2 (3), x ≡ 3 (5), x ≡ 2 (7)`. */
export interface CrtTaskValues {
  readonly congruences: string;
}

export type CrtTask = NotebookTask<CrtTaskValues>;

export const CRT_TASK_INPUT_SCHEMA: TaskInputSchema<CrtTaskValues> = {
  congruences: {
    kind: 'string',
    label: t('features.algorithms.tasks.crt.values.congruences'),
    placeholder: t('features.algorithms.tasks.crt.values.congruencesPlaceholder'),
    pattern: /^\s*\d+\s*:\s*\d+(\s*,\s*\d+\s*:\s*\d+)*\s*$/,
    minLength: 3,
    maxLength: 120,
  },
};

/** Parse the `"r:m, r:m, ..."` form into CrtCongruence objects.
 *  Bad tokens are dropped; residues are normalized into `[0, m)`. */
export function parseCongruences(input: string): readonly CrtCongruence[] {
  if (!input) return [];
  const result: CrtCongruence[] = [];
  for (const token of input.split(',')) {
    const parts = token.split(':');
    if (parts.length !== 2) continue;
    const residue = Number.parseInt(parts[0].trim(), 10);
    const modulus = Number.parseInt(parts[1].trim(), 10);
    if (!Number.isInteger(residue) || !Number.isInteger(modulus)) continue;
    if (modulus < 2) continue;
    result.push({ residue: ((residue % modulus) + modulus) % modulus, modulus });
  }
  return result;
}
