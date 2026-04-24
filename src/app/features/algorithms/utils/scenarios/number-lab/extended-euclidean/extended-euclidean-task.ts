import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** Input pair for Extended Euclidean. Same shape as the plain GCD —
 *  the algorithm reuses the division chain, then folds coefficients
 *  backwards to produce (s, t) such that `s·a + t·b = gcd(a, b)`. */
export interface ExtendedEuclideanTaskValues {
  readonly a: number;
  readonly b: number;
}

export type ExtendedEuclideanTask = NotebookTask<ExtendedEuclideanTaskValues>;

/** Shared schema for every Extended Euclidean task — same two-integer
 *  editable popover regardless of which pair the task highlights. */
export const EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA: TaskInputSchema<ExtendedEuclideanTaskValues> = {
  a: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.a'), min: 1 },
  b: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.b'), min: 1 },
};

/** Snippet id shared by Extended Euclidean tasks whose code walkthrough
 *  is already authored. Variant tasks without a written walkthrough
 *  (new entries in this migration) use `null` instead, and the Code
 *  tab renders an editorial "coming soon" placeholder. */
export const EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID = 'extended-euclidean';
