import { TranslatableText } from '../../../core/i18n/translatable-text';

/**
 * Generic trace state for small-math algorithms that evolve a handful
 * of numeric values over time — Fibonacci, Factorial, Euclidean GCD,
 * Extended Euclidean, Miller-Rabin, CRT, Pollard's Rho…
 *
 * The shape is deliberately minimal and schema-agnostic:
 *   - `registers` carries the "live" named scalars (e.g. a=21, b=13)
 *   - `history`   is the tape of outputs emitted so far (F(0)=0, F(1)=1, …)
 *   - `formula`   is an LaTeX-free plain string showing the rule fire
 *
 * The generator populates all three; the viz reads them directly.
 */

export type NumberLabTone =
  | 'idle'
  | 'compare'
  | 'update'
  | 'emit'
  | 'settle'
  | 'complete';

export interface NumberLabRegister {
  readonly id: string;
  /** Pretty name shown on the chip (e.g. "a", "b", "Fₙ"). Mono font. */
  readonly label: string;
  /** Current value. Rendered as a large numeric string. */
  readonly value: string;
  /** Optional caption under the value (e.g. "= F(n-1) + F(n-2)"). */
  readonly hint: TranslatableText | null;
  /** Tone tint applied to the chip. `active` glows warm, `settled`
   *  reads as locked-in, `muted` fades into the background. */
  readonly tone: 'default' | 'active' | 'settled' | 'muted';
}

export interface NumberLabHistoryEntry {
  /** Stable id so the tape tracks chips even if order shifts (rare). */
  readonly id: string;
  /** Small index / label, e.g. "F(5)", "n=3". */
  readonly label: string;
  /** The emitted value as a string. */
  readonly value: string;
  /** Whether this entry is the one currently being emitted — drives a
   *  subtle pulse so the user catches the newest value. */
  readonly isCurrent: boolean;
}

export interface NumberLabFormulaPart {
  /** Short literal like "F(n-1)", "+", "b", "mod". Rendered in mono. */
  readonly text: string;
  /** Semantic role — lets the view colour operands vs. operators
   *  without the generator committing to a colour palette. */
  readonly role: 'operand' | 'operator' | 'result' | 'active';
}

export interface NumberLabFormula {
  /** Left-hand side (e.g. "F(5)", "gcd(21, 13)"). */
  readonly lhs: readonly NumberLabFormulaPart[];
  /** Right-hand side (e.g. "F(4) + F(3)", "gcd(13, 8)"). */
  readonly rhs: readonly NumberLabFormulaPart[];
}

export interface NumberLabTraceState {
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly tone: NumberLabTone;
  readonly registers: readonly NumberLabRegister[];
  readonly history: readonly NumberLabHistoryEntry[];
  readonly formula: NumberLabFormula | null;
  /** Generator-chosen preset / scenario id so the header can badge it. */
  readonly presetLabel: TranslatableText;
  /** Terminal value, when the algorithm has produced one (e.g. GCD
   *  result, Fₙ when n is reached). Rendered in the result slot. */
  readonly resultLabel: TranslatableText | null;
  /** Iteration counter for the UI's step chip. */
  readonly iteration: number;
}
