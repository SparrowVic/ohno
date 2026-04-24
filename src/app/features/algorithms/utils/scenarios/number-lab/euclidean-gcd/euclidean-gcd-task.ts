import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** Input pair for the Euclidean GCD. Both values are required positive
 *  integers; validation against zero is handled by the runtime before
 *  invoking the generator. */
export interface GcdTaskValues {
  readonly a: number;
  readonly b: number;
}

export type GcdTask = NotebookTask<GcdTaskValues>;

/** Shared schema reused by every GCD task — the customize-values
 *  popover always exposes the same two integer fields, so there is no
 *  reason to re-declare them per task. */
export const GCD_TASK_INPUT_SCHEMA: TaskInputSchema<GcdTaskValues> = {
  a: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.a'), min: 1 },
  b: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.b'), min: 1 },
};

/** Snippet id shared by GCD tasks whose code walkthrough is already
 *  authored. New-but-code-less tasks use `null` instead. */
export const GCD_CODE_SNIPPET_ID = 'euclidean-gcd';
