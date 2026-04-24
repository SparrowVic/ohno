import type { NotebookTask } from '../../../../models/notebook-task';
import type { TaskInputSchema } from '../../../../models/task';

export interface PollardsRhoTaskValues {
  readonly n: number;
  readonly x0: number;
  readonly c?: number;
  readonly c_fail?: number;
  readonly c_retry?: number;
  readonly m?: number;
  readonly c_for_21?: number;
}

export type PollardsRhoNotebookFlow =
  | { readonly kind: 'floyd-basic' }
  | { readonly kind: 'retry-after-cycle' }
  | { readonly kind: 'brent-batch-gcd' }
  | { readonly kind: 'recursive-factorization' }
  | { readonly kind: 'composite-factor-split' };

export interface PollardsRhoTask extends NotebookTask<PollardsRhoTaskValues> {
  readonly notebookFlow: PollardsRhoNotebookFlow;
}

const N_FIELD = {
  kind: 'int' as const,
  label: 'n',
  min: 4,
};

const X0_FIELD = {
  kind: 'int' as const,
  label: 'x0',
  min: 1,
};

const C_FIELD = {
  kind: 'int' as const,
  label: 'c',
  min: 1,
};

export const POLLARDS_RHO_FLOYD_INPUT_SCHEMA: TaskInputSchema<PollardsRhoTaskValues> = {
  n: N_FIELD,
  x0: X0_FIELD,
  c: C_FIELD,
};

export const POLLARDS_RHO_RETRY_INPUT_SCHEMA: TaskInputSchema<PollardsRhoTaskValues> = {
  n: N_FIELD,
  x0: X0_FIELD,
  c_fail: {
    kind: 'int',
    label: 'c_fail',
    min: 1,
  },
  c_retry: {
    kind: 'int',
    label: 'c_retry',
    min: 1,
  },
};

export const POLLARDS_RHO_BRENT_INPUT_SCHEMA: TaskInputSchema<PollardsRhoTaskValues> = {
  n: N_FIELD,
  x0: X0_FIELD,
  c: C_FIELD,
  m: {
    kind: 'int',
    label: 'm',
    min: 1,
  },
};

export const POLLARDS_RHO_COMPOSITE_SPLIT_INPUT_SCHEMA: TaskInputSchema<PollardsRhoTaskValues> = {
  n: N_FIELD,
  x0: X0_FIELD,
  c: C_FIELD,
  c_for_21: {
    kind: 'int',
    label: 'c_for_21',
    min: 1,
  },
};

export const POLLARDS_RHO_MAX_ITERATIONS = 50;
