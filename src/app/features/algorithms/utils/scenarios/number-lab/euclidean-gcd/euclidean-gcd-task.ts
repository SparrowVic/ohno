import type { NotebookTask } from '../../../../models/notebook-task';
import type { TaskInputSchema } from '../../../../models/task';

export interface GcdTaskValues {
  readonly a?: number;
  readonly b?: number;
  readonly values?: string;
  readonly numerator?: number;
  readonly denominator?: number;
}

export type GcdNotebookFlow =
  | { readonly kind: 'basic' }
  | { readonly kind: 'fibonacci-worst-case' }
  | { readonly kind: 'multi-number-fold' }
  | { readonly kind: 'fraction-reduction' }
  | { readonly kind: 'subtractive-to-division' };

export interface GcdTask extends NotebookTask<GcdTaskValues> {
  readonly notebookFlow: GcdNotebookFlow;
}

const A_FIELD = { kind: 'int' as const, label: 'a', min: 1 };
const B_FIELD = { kind: 'int' as const, label: 'b', min: 1 };

export const GCD_PAIR_INPUT_SCHEMA: TaskInputSchema<GcdTaskValues> = {
  a: A_FIELD,
  b: B_FIELD,
};

export const GCD_MULTI_NUMBER_INPUT_SCHEMA: TaskInputSchema<GcdTaskValues> = {
  values: {
    kind: 'string',
    label: 'values',
    minLength: 1,
    maxLength: 240,
  },
};

export const GCD_FRACTION_INPUT_SCHEMA: TaskInputSchema<GcdTaskValues> = {
  numerator: {
    kind: 'int',
    label: 'numerator',
    min: 1,
  },
  denominator: {
    kind: 'int',
    label: 'denominator',
    min: 1,
  },
};

export const GCD_TASK_INPUT_SCHEMA = GCD_PAIR_INPUT_SCHEMA;

export const GCD_CODE_SNIPPET_ID = 'euclidean-gcd';

export function parseNumberList(input: string | undefined): readonly number[] {
  if (!input?.trim()) return [];
  return input
    .replace(/[\[\],]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((token) => Number.parseInt(token, 10))
    .filter((value) => Number.isFinite(value) && value > 0);
}

export function formatNumberList(values: readonly number[]): string {
  return `[${values.join(', ')}]`;
}
