import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * Trace state for the "tablica" (chalkboard) viz primitive — a
 * narrative, derivational view of an algorithm that mimics writing
 * steps out on a board or in a notebook. Intended as a companion (or
 * default) view for math-heavy algorithms where the dashboard view
 * shows *state* but fails to show *why* — the derivation itself is the
 * pedagogical content.
 *
 * The model is a vertical stack of lines that grows as the algorithm
 * progresses. Each line is a typed record:
 *   - `goal`       → the problem statement at the top
 *   - `note`       → plain-text context (rule definitions, reminders)
 *   - `equation`   → a mathematical expression on its own line
 *   - `substitute` → an indented "= …" continuation of a derivation
 *   - `decision`   → a reasoned step ("b = 0 → return a")
 *   - `result`     → the final boxed answer
 *   - `divider`    → visual separator between logical blocks
 *
 * Line `state` drives visual treatment: newly-emitted lines enter with
 * an animation and get the "current" glow; previously-emitted lines
 * settle into a calmer style but stay readable. Margins are sticky
 * side-notes anchored to a specific line (or the view itself) — used
 * for invariants, hints, or warnings the student should keep in mind
 * throughout.
 */

export type ScratchpadLabMode =
  | 'euclidean-gcd'
  | 'fibonacci-iterative'
  | 'factorial'
  | 'extended-euclidean'
  | 'miller-rabin'
  | 'pollards-rho'
  | 'crt'
  | 'gaussian-elimination'
  | 'simplex';

export type ScratchpadLineKind =
  | 'goal'
  | 'note'
  | 'equation'
  | 'substitute'
  | 'decision'
  | 'result'
  | 'divider';

export type ScratchpadLineState = 'entering' | 'current' | 'settled';

export type ScratchpadMarginTone = 'invariant' | 'hint' | 'warning' | 'success';

export interface ScratchpadLine {
  readonly id: string;
  readonly kind: ScratchpadLineKind;
  /** Indent level — shifts the line right by step so students can
   *  read derivation chains as a ladder. Typically 0 for new pair,
   *  1 for "= gcd(…)" continuations, 2+ for nested reasoning. */
  readonly indent: number;
  /** Optional marginal marker — "①", "Krok 2", "✓", "⟹". */
  readonly marker: string | null;
  /** Step-title caption — a frozen snapshot of what the tutor said at
   *  the top bar when this line was written. Rendered in a muted
   *  italic line above the body so long derivations stay readable
   *  without scrolling back through the run. Can be hidden via the
   *  viz-options menu ("Show step titles"). */
  readonly caption: TranslatableText | null;
  /** When true, keep the caption visible on settled (past) lines too.
   *  Use for phase-entry captions that mark meaningful transitions —
   *  `goal`, the first forward row, the terminal forward row, the
   *  gcd-found announcement, back-seed, verify, result. Default
   *  (false / undefined) means the caption only renders while the
   *  line is `current` — fine for looping lines whose caption repeats
   *  ("Forward division, next pair") and would clutter if it stayed. */
  readonly captionPinned?: boolean;
  /** Main content — mixed text + math (usually with [[math]] markers
   *  so KaTeX lights up the formulas). */
  readonly content: TranslatableText;
  /** Imperative "do this" tag — "Policz 48 mod 36". Persists with the
   *  line so the student can always see the operation that produced
   *  it. Visually a pill chip distinct from the annotation (which
   *  carries the numeric result). Can be hidden via viz-options
   *  menu ("Show instructions"). */
  readonly instruction: TranslatableText | null;
  /** Optional explanatory note shown in the right-side margin of the
   *  line — the "a mod b = r" callout next to a substitution line. */
  readonly annotation: TranslatableText | null;
  readonly state: ScratchpadLineState;
}

export interface ScratchpadMargin {
  readonly id: string;
  /** Line the note is visually anchored to — null means the note
   *  floats at the top of the margins column (global invariants). */
  readonly anchorLineId: string | null;
  readonly text: TranslatableText;
  readonly tone: ScratchpadMarginTone;
}

export interface ScratchpadLabTraceState {
  readonly mode: ScratchpadLabMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly tone:
    | 'idle'
    | 'setup'
    | 'compute'
    | 'substitute'
    | 'decide'
    | 'conclude'
    | 'complete';
  readonly lines: readonly ScratchpadLine[];
  readonly margins: readonly ScratchpadMargin[];
  readonly resultLabel: TranslatableText | null;
  readonly iteration: number;
}
