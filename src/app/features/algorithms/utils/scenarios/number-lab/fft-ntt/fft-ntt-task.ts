import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** Values for an FFT task.
 *
 *  - `input` — whitespace-separated real numbers representing the
 *    signal to transform. Length must be a power of two; non-powers
 *    are rejected upstream so the radix-2 narrative never has to
 *    deal with zero-padding.
 *
 *  Imaginary inputs aren't supported in v1 — every textbook first
 *  contact with FFT is a real sequence. The generator internally
 *  treats values as complex so the algorithm works unmodified when
 *  a complex-input field lands later. */
export interface FftNttTaskValues {
  readonly input: string;
}

export type FftNttTask = NotebookTask<FftNttTaskValues>;

export const FFT_NTT_TASK_INPUT_SCHEMA: TaskInputSchema<FftNttTaskValues> = {
  input: {
    kind: 'string',
    label: t('features.algorithms.tasks.fftNtt.values.input'),
    placeholder: t('features.algorithms.tasks.fftNtt.values.inputPlaceholder'),
    pattern: /^\s*-?\d+(\.\d+)?(\s+-?\d+(\.\d+)?)*\s*$/,
    minLength: 1,
    maxLength: 240,
  },
};

export function parseRealSignal(input: string): readonly number[] {
  if (!input.trim()) return [];
  const out: number[] = [];
  for (const tok of input.trim().split(/\s+/)) {
    const value = Number.parseFloat(tok);
    if (!Number.isFinite(value)) continue;
    out.push(value);
  }
  return out;
}

/** True for integers of the form 2^k with k ≥ 0. Radix-2 Cooley-
 *  Tukey only runs over power-of-two inputs; the scenario factory
 *  trims or zero-pads anything else in a future revision. */
export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}
