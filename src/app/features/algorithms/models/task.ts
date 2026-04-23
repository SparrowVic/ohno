import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * A Task bundles "what problem we're solving" with "how it's solved" —
 * the shape of the inputs, the pre-authored defaults, the code snippet
 * that implements it, and (optionally) a preferred view variant.
 *
 * One algorithm has many tasks. Tasks that share code (different values
 * but same implementation — e.g. GCD(1071, 462) and GCD(48, 18)) point
 * at the same `codeSnippetId`. Tasks with genuinely different code
 * (e.g. Extended Euclidean's "find Bézout" vs "find modular inverse"
 * vs "solve linear Diophantine") each reference their own snippet.
 *
 * User-provided custom input **modifies a selected task's values** but
 * does not create a new task — code stays tied to the task, not to
 * the values.
 */
export interface Task<TValues> {
  readonly id: string;
  readonly name: TranslatableText;

  /** Pre-authored input values for this task. Seed for the customize-
   *  values popover when the task is first selected. */
  readonly defaultValues: TValues;

  /** Schema describing editable fields exposed in the customize-values
   *  popover. Typed per-algorithm. */
  readonly inputSchema: TaskInputSchema<TValues>;

  /** Per-task invariant check. Returns a localized error message on
   *  failure, or `null` when the values are acceptable. Called before
   *  starting a run — "Apply" in the popover is disabled while this
   *  returns non-null. */
  readonly validate?: (values: TValues) => TranslatableText | null;

  /** Reference to a pre-authored code snippet in the algorithm's
   *  `codeVariants`. Multiple tasks may share a snippet. */
  readonly codeSnippetId: string;

  /** Optional view-variant preference — if the algorithm exposes
   *  multiple view variants (e.g. number-lab's numeric vs chalkboard),
   *  this task opens in the preferred one. User can still override via
   *  the toolbar's `View:` picker. */
  readonly preferredView?: string;
}

/** Schema describing which fields the customize-values popover should
 *  render and how to validate them. Parameterised by the task's values
 *  shape — each key of `TValues` maps to a field descriptor. */
export type TaskInputSchema<TValues> = {
  readonly [K in keyof TValues]: TaskInputField<TValues[K]>;
};

export type TaskInputField<TValue> =
  | TaskIntField
  | TaskFloatField
  | TaskStringField
  | TaskTextareaField
  | TaskListField<TValue>;

export interface TaskIntField {
  readonly kind: 'int';
  readonly label: TranslatableText;
  readonly placeholder?: TranslatableText;
  /** Inclusive lower bound. */
  readonly min?: number;
  /** Inclusive upper bound. */
  readonly max?: number;
  /** Reject zero when true (e.g. divisors). */
  readonly nonZero?: boolean;
}

export interface TaskFloatField {
  readonly kind: 'float';
  readonly label: TranslatableText;
  readonly placeholder?: TranslatableText;
  readonly min?: number;
  readonly max?: number;
  /** Number of fractional digits accepted on input. */
  readonly precision?: number;
}

export interface TaskStringField {
  readonly kind: 'string';
  readonly label: TranslatableText;
  readonly placeholder?: TranslatableText;
  /** Inclusive minimum character length. */
  readonly minLength?: number;
  /** Inclusive maximum character length. */
  readonly maxLength?: number;
  /** Optional regex the value must match. */
  readonly pattern?: RegExp;
}

export interface TaskTextareaField {
  readonly kind: 'textarea';
  readonly label: TranslatableText;
  readonly placeholder?: TranslatableText;
  readonly minLength?: number;
  readonly maxLength?: number;
  /** Rows hint for the textarea — purely presentational. */
  readonly rows?: number;
}

/** Dynamic list of sub-schemas — used for CRT's `(r, m)` pairs, for
 *  matrix rows, for variable-length constraint lists. The row shape is
 *  described by another `TaskInputSchema`. */
export interface TaskListField<TRow> {
  readonly kind: 'list';
  readonly label: TranslatableText;
  /** Schema for a single row. */
  readonly rowSchema: TaskInputSchema<TRow>;
  /** Minimum row count. Defaults to 1. */
  readonly minItems?: number;
  /** Maximum row count. Defaults to unbounded. */
  readonly maxItems?: number;
  /** Values seeded when the user adds a new row. */
  readonly rowDefault: TRow;
}

/** Helper for algorithm-detail to resolve a task by id. */
export function findTask<TValues>(
  tasks: readonly Task<TValues>[],
  id: string,
): Task<TValues> | null {
  return tasks.find((t) => t.id === id) ?? null;
}
