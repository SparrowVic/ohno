import {
  I18nTextParams,
  TranslatableText,
  i18nText,
  isI18nText,
} from '../../../core/i18n/translatable-text';
import { looksLikeI18nKey } from '../../../core/i18n/looks-like-i18n-key';
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

/**
 * Bind the current effective input values into the task's
 * `instruction` so the "Zadanie:" / "Task:" block in the scratchpad
 * reflects what the user actually sees on the board.
 *
 * Returns a `TranslatableText` with `params` set to `values`, so
 * `{{n}}`, `{{a}}`, `{{b}}`, `{{witnesses}}`, etc. placeholders in
 * the instruction string interpolate at render time. Null when the
 * task didn't declare an instruction.
 *
 * Accepts the instruction in any of the three shapes it can legally
 * take: a raw string (marker key from `t(...)`), an I18nText object
 * (pre-parameterised), or a plain sentence. The plain-sentence case
 * returns the string unchanged — there's nothing to interpolate.
 */
export function notebookInstructionText<TValues>(
  task: NotebookTask<TValues>,
  values: I18nTextParams,
): TranslatableText | null {
  const raw = task.instruction;
  if (raw == null) return null;
  if (isI18nText(raw)) {
    return i18nText(raw.key, { ...(raw.params ?? {}), ...values });
  }
  if (typeof raw === 'string' && looksLikeI18nKey(raw)) {
    return i18nText(raw, values);
  }
  return raw;
}
