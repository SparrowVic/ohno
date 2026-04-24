import { TranslatableText } from '../../../core/i18n/translatable-text';
import { Task } from './task';

/**
 * Notebook-style task (chalkboard / scratchpad-lab algorithms such as
 * Euclidean GCD and Extended Euclidean).
 *
 * Extends the generic `Task<TValues>` with editorial fields that a
 * "notebook" scene benefits from — a one-line summary, a paragraph-
 * length problem statement, graduated hints, and a difficulty tag.
 * These fields are optional on the base `Task`; `NotebookTask` makes
 * the shape explicit so per-file task definitions share one schema.
 *
 * `codeSnippetId: string | null` — `null` means "no snippet authored
 * yet". The side-panel Code tab renders a placeholder in that case.
 */
export interface NotebookTask<TValues> extends Task<TValues> {
  readonly summary?: TranslatableText;
  readonly instruction?: TranslatableText;
  readonly hints?: readonly TranslatableText[];
  readonly difficulty?: NotebookTaskDifficulty;
  readonly codeSnippetId: string | null;
}

export type NotebookTaskDifficulty = 'easy' | 'medium' | 'hard';

/** Sentinel returned by notebook tasks that don't yet ship a code
 *  snippet. The side-panel / code-panel branch on this to render a
 *  "no snippet yet" placeholder instead of the authored variant. */
export const NOTEBOOK_TASK_NO_SNIPPET: null = null;
