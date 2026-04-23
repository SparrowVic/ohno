---
name: ohno-scratchpad-narrative
description: Use when adding or editing a chalkboard-style algorithm scene — pure-math / derivational algorithms like Euclidean GCD, Extended Euclidean, Miller-Rabin, Pollard's rho, CRT, Gaussian elimination, Simplex. Covers the ScratchpadLab line model (kinds, states, indent, markers, captions, instructions, annotations), margin tones, phase labels, and the two-phase narrative pattern used by Extended Euclidean.
---

# Ohno — scratchpad (chalkboard) narrative

The **ScratchpadLab** primitive is the default view for algorithms whose **pedagogical content is the derivation itself**, not a state dashboard. It mimics writing steps out on a board — a vertical stack of typed lines that grows as the algorithm progresses, with margin annotations for invariants and hints.

Reference implementation: [src/app/features/algorithms/components/scratchpad-lab-visualization/](../../../src/app/features/algorithms/components/scratchpad-lab-visualization/).
Model: [src/app/features/algorithms/models/scratchpad-lab.ts](../../../src/app/features/algorithms/models/scratchpad-lab.ts).
Canonical algorithm example: [src/app/features/algorithms/algorithms/euclidean-gcd/euclidean-gcd.ts](../../../src/app/features/algorithms/algorithms/euclidean-gcd/euclidean-gcd.ts).
Two-phase example: [src/app/features/algorithms/algorithms/extended-euclidean/extended-euclidean.ts](../../../src/app/features/algorithms/algorithms/extended-euclidean/extended-euclidean.ts).

## The line model

Every step emits a `ScratchpadLabTraceState` with:

```ts
{
  mode: ScratchpadLabMode;              // registered algorithm mode
  modeLabel: TranslatableText;           // header chip text
  phaseLabel: TranslatableText;          // what's happening this frame
  decisionLabel: TranslatableText;       // the reasoned outcome text
  presetLabel: TranslatableText;         // preset chip
  tone: 'idle' | 'setup' | 'compute' | 'substitute' | 'decide' | 'conclude' | 'complete';
  lines: readonly ScratchpadLine[];      // the derivation stack
  margins: readonly ScratchpadMargin[];  // side annotations
  resultLabel: TranslatableText | null;
  iteration: number;
}
```

### Line kinds (pick the right one — they render differently)

| Kind | Meaning | Typical content |
|---|---|---|
| `goal` | problem statement at the top | "Oblicz gcd(48, 36)" |
| `note` | rule / reminder / plain narrative | "Jeśli b = 0, to gcd(a,b) = a" |
| `equation` | math expression on its own line | "gcd(48, 36)" |
| `substitute` | indented "= …" continuation | "= gcd(36, 12)" |
| `decision` | reasoned step | "b = 0 ⟹ zwróć a" |
| `result` | final boxed answer | "gcd = 12" |
| `divider` | visual separator between logical blocks | (empty) |

### Line states (a visual lifecycle)

- `entering` — just written; animated in.
- `current` — active line, glow treatment.
- `settled` — part of history; calmer but readable.

Emit lines with `entering` when they first appear, then re-emit as `current` for one frame of focus, then drop to `settled` for the rest of the run.

### Line decorations

- `indent` — integer ladder depth. `0` for top-level statements, `1` for "= gcd(…)" continuations, `2+` for nested reasoning.
- `marker` — optional glyph in the left margin ("①", "Krok 2", "✓", "⟹").
- `caption` — italic step-title above the line body; toggleable via the gear menu. Use for preserving context on long runs.
- `instruction` — imperative pill chip ("Policz 48 mod 36"). Toggleable. Use when the student should **do** something.
- `annotation` — right-margin callout ("a mod b = 12"). Use to carry the numeric result of the operation.

## Margins

Side notes anchored to a line (or globally):

```ts
{ id, anchorLineId: 'line-3' | null, text, tone: 'invariant' | 'hint' | 'warning' | 'success' }
```

- `invariant` — something that holds across the entire run. Anchor to `null` so it floats at the top.
- `hint` — contextual, one-frame guidance ("Spójrz: r < b"). Anchor to the relevant line.
- `warning` / `success` — for edge cases and completions.

## Phases & tones

The `tone` field drives the header ring color:

- `idle` → neutral
- `setup` → problem framing (soft violet)
- `compute` → active math (cyan)
- `substitute` → rewrite/continuation (violet)
- `decide` → branch point (pink)
- `conclude` / `complete` → lime

Match `phaseLabel` to `tone` — the student reads both at once.

## Two-phase narrative (Extended Euclidean pattern)

Extended Euclidean runs **forward** (Euclidean chain) and then **back-substitutes** (Bézout). The scratchpad shows both phases in sequence:

1. Forward: `goal` → `rule` → pairs of `equation` + `substitute` → divider.
2. Back-sub: new `goal` ("znajdź s, t") → coefficient updates as `equation` + `substitute` pairs → `result` with `s·a + t·b = gcd`.

Use a `divider` line between phases and re-emit the tone transition (`substitute` → `conclude`).

## Building lines — helper pattern

```ts
import { withScratchpad } from '../scratchpad-lab-step';

function scratchpadSnapshot(args): ScratchpadLabTraceState {
  const lines: ScratchpadLine[] = [
    { id: 'goal',   kind: 'goal',     indent: 0, marker: null, caption: null,
      content: i18nText(I18N.scratchpad.goal, { a, b }),
      instruction: null, annotation: null, state: 'current' },
    { id: 'rule',   kind: 'note',     indent: 0, marker: null, caption: null,
      content: i18nText(I18N.scratchpad.rule),
      instruction: null, annotation: null, state: 'settled' },
    // … equations, substitutes, decisions, result …
  ];

  const margins: ScratchpadMargin[] = [
    { id: 'inv', anchorLineId: null, text: i18nText(I18N.scratchpad.invariant), tone: 'invariant' },
  ];

  return { mode: 'euclidean-gcd', modeLabel, phaseLabel, decisionLabel, presetLabel,
           tone: 'compute', lines, margins, resultLabel: null, iteration: 3 };
}

yield withScratchpad(createNumberLabStep({ … }), scratchpadSnapshot({ … }));
```

## Visual language rules

- **Newsreader italic** (via `var(--font-notebook)` + `font-style: italic`) for markers, captions, instructions, annotation marks, signoff — the editorial margin-note voice. Body text for equations stays mono / KaTeX. (Caveat was the earlier choice for the "chalk hand" feel; walked back because it read as Figma-mockup-cheap at larger sizes and on dense ultrawide layouts. The cursive stack is still defined — don't reach for it by default.)
- **Math in `content`** uses `[[math]] … [[/math]]` (or per the helpers in this file — check existing usage) so KaTeX lights up inline.
- **Indent** reads as a ladder — keep it monotonic within a logical block; reset to 0 across dividers.
- **Don't pile margins.** Max 1 invariant (top) + 1 current hint (per line) on screen at once.
- **Resist adding new line kinds.** The 7 existing kinds cover every algorithm we've mapped so far. If you think you need a new one, post it as a question first — likely a variant of `note` + a marker.

## View-options (gear menu)

`scratchpad-lab-visualization` exposes two user toggles (persisted to localStorage):
- `captions` — show italic step-titles above each line.
- `instructions` — show imperative pill chips.

New scenes don't need to re-implement the gear menu — it's driven by the host component.

## When to add a new `ScratchpadLabMode`

Update the `ScratchpadLabMode` union in `src/app/features/algorithms/models/scratchpad-lab.ts` when you wire a new algorithm. Currently registered:

```
'euclidean-gcd' | 'fibonacci-iterative' | 'factorial' | 'extended-euclidean' |
'miller-rabin' | 'pollards-rho' | 'crt' | 'gaussian-elimination' | 'simplex'
```

If your algorithm doesn't map cleanly (e.g., not math-narrative but diagrammatic), probably it wants a different visualization family — re-check against `ohno-visualization-anatomy`.
