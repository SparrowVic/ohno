import type { NotebookTask } from '../../../../models/notebook-task';
import type { TaskInputSchema } from '../../../../models/task';

export interface MillerRabinTaskValues {
  readonly n: number;
  readonly base?: number;
  readonly base1?: number;
  readonly base2?: number;
}

export type MillerRabinNotebookFlow =
  | { readonly kind: 'prime-pass' }
  | { readonly kind: 'single-witness' }
  | { readonly kind: 'strong-liar-multibase' }
  | { readonly kind: 'gcd-precheck' }
  | { readonly kind: 'sqrt-factor-leak' };

export interface MillerRabinTask extends NotebookTask<MillerRabinTaskValues> {
  readonly notebookFlow: MillerRabinNotebookFlow;
}

const N_FIELD = {
  kind: 'int' as const,
  label: 'n',
  min: 3,
};

const BASE_FIELD = {
  kind: 'int' as const,
  label: 'base',
  min: 2,
};

export const MILLER_RABIN_SINGLE_BASE_INPUT_SCHEMA: TaskInputSchema<MillerRabinTaskValues> = {
  n: N_FIELD,
  base: BASE_FIELD,
};

export const MILLER_RABIN_TWO_BASE_INPUT_SCHEMA: TaskInputSchema<MillerRabinTaskValues> = {
  n: N_FIELD,
  base1: {
    kind: 'int',
    label: 'base1',
    min: 2,
  },
  base2: {
    kind: 'int',
    label: 'base2',
    min: 2,
  },
};
