import type { NotebookTask } from '../../../../models/notebook-task';
import type { TaskInputSchema } from '../../../../models/task';

export interface FftNttTaskValues {
  readonly mod?: number;
  readonly n?: number;
  readonly omega?: number | string;
  readonly A?: string;
  readonly B?: string;
  readonly bad_n?: number;
  readonly good_n?: number;
  readonly omega4?: number;
  readonly omega8?: number;
  readonly left?: number;
  readonly right?: number;
  readonly base?: number;
  readonly omega_bad?: number;
  readonly omega_good?: number;
}

export type FftNttNotebookFlow =
  | { readonly kind: 'ntt-convolution' }
  | { readonly kind: 'recursive-fft-split' }
  | { readonly kind: 'cyclic-vs-linear-trap' }
  | { readonly kind: 'big-integer-convolution' }
  | { readonly kind: 'primitive-root-check' };

export interface FftNttTask extends NotebookTask<FftNttTaskValues> {
  readonly notebookFlow: FftNttNotebookFlow;
}

const MOD_FIELD = { kind: 'int' as const, label: 'mod', min: 2 };
const N_FIELD = { kind: 'int' as const, label: 'n', min: 2 };
const OMEGA_FIELD = { kind: 'int' as const, label: 'omega', min: 1 };
const ARRAY_A_FIELD = { kind: 'string' as const, label: 'A', minLength: 1, maxLength: 160 };
const ARRAY_B_FIELD = { kind: 'string' as const, label: 'B', minLength: 1, maxLength: 160 };

export const FFT_NTT_CONVOLUTION_INPUT_SCHEMA: TaskInputSchema<FftNttTaskValues> = {
  mod: MOD_FIELD,
  n: N_FIELD,
  omega: OMEGA_FIELD,
  A: ARRAY_A_FIELD,
  B: ARRAY_B_FIELD,
};

export const FFT_NTT_RECURSIVE_INPUT_SCHEMA: TaskInputSchema<FftNttTaskValues> = {
  n: N_FIELD,
  omega: {
    kind: 'string',
    label: 'omega',
    minLength: 1,
    maxLength: 8,
  },
  A: ARRAY_A_FIELD,
};

export const FFT_NTT_CYCLIC_TRAP_INPUT_SCHEMA: TaskInputSchema<FftNttTaskValues> = {
  mod: MOD_FIELD,
  A: ARRAY_A_FIELD,
  B: ARRAY_B_FIELD,
  bad_n: {
    kind: 'int',
    label: 'bad_n',
    min: 2,
  },
  good_n: {
    kind: 'int',
    label: 'good_n',
    min: 2,
  },
  omega4: {
    kind: 'int',
    label: 'omega4',
    min: 1,
  },
  omega8: {
    kind: 'int',
    label: 'omega8',
    min: 1,
  },
};

export const FFT_NTT_BIG_INTEGER_INPUT_SCHEMA: TaskInputSchema<FftNttTaskValues> = {
  left: {
    kind: 'int',
    label: 'left',
    min: 0,
  },
  right: {
    kind: 'int',
    label: 'right',
    min: 0,
  },
  base: {
    kind: 'int',
    label: 'base',
    min: 2,
  },
  mod: MOD_FIELD,
  n: N_FIELD,
  omega: OMEGA_FIELD,
};

export const FFT_NTT_PRIMITIVE_ROOT_INPUT_SCHEMA: TaskInputSchema<FftNttTaskValues> = {
  mod: MOD_FIELD,
  n: N_FIELD,
  omega_bad: {
    kind: 'int',
    label: 'omega_bad',
    min: 1,
  },
  omega_good: {
    kind: 'int',
    label: 'omega_good',
    min: 1,
  },
};

export function parseVector(input: string | undefined): readonly number[] {
  if (!input) return [];
  return input
    .replace(/[\[\],]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((token) => Number.parseInt(token, 10))
    .filter((value) => Number.isFinite(value));
}

export function formatVector(values: readonly number[]): string {
  return `[${values.join(', ')}]`;
}
