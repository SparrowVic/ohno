---
name: ohno-viz-polish-checklist
description: Use when a visualization has its functional first pass done and you're about to claim it polished, or when the user asks "can we make this viz nicer / tighter / more consistent". Runs a concrete checklist drawn from the flat-redesign pass and ongoing polish TODOs. Trigger on tasks like "polish the bar chart", "improve the viz", or before committing a major visualization change.
---

# Ohno — visualization polish checklist

This skill exists because "nice-to-haves" keep getting lost. Run it on any viz that you or the user consider "done enough" — a 10-minute pass that catches 80% of the regressions.

Based on the flat-redesign pass (2026-04-21) and open items tracked in user memory.

## The checklist

Go top-to-bottom. Each item is a specific change or a deliberate "we decided not to".

### 1. Hairline, not heavy

- Stroke widths: **0.5px** (house hairline). Not 1px. Not 2px.
- Bar/block shapes: solid fill + hairline stroke, alpha ~0.92 fill / ~0.95 stroke.
- No gradient fills, no inner glow, no sheen, no caps unless the element is a partition line.

### 2. Labels don't fight their fill

- Current labels use a **2px dark stroke outline** (`rgba(8,10,16,0.82)`) as a fallback for readability on gradient fills. On flat solids, that stroke reads heavy.
- Options: drop the stroke and trust contrast; OR move the label into a small chip/pill with a subtle bg; OR soften stroke to 1px.
- Font: `var(--font-mono)`, `font-weight: 600`, `font-variant-numeric: tabular-nums` — mandatory for numeric labels.

### 3. Text color stays neutral on stateful fills

- Don't tint label text with the state color when the label sits ON a same-colored fill. Lime text on lime bar = low contrast.
- Keep labels at `var(--text-primary)` (near-white). The bar's color carries the state.

### 4. Drop per-item shadows

- Ellipse-under-bar drop shadows were a remnant of the "floating" aesthetic. Flat drops them.
- Alternative: one **unified baseline shadow** for the whole row, not per-item. Usually `--elevation-1` or `--elevation-2` on the scene container.

### 5. Default state, not muted into disappearance

- `--viz-state-default` at 0.85 opacity can feel too quiet next to cyan/pink/lime.
- Try: 0.9 opacity; OR a ghost treatment (no fill, stroke only) for a stronger "in-progress vs idle" contrast.

### 6. Radii unification

- Dynamic bar radii (`clamp(minDim * 0.28, 3, 18)`) are fine for sorting.
- Fixed block radius at 14 is fine for block-swap.
- But: consider aligning to `--radius-md` (10) or `--control-radius` (12) for a more uniform UI voice across the scene and toolbar.

### 7. Boundary / partition markers

- Dashed lime line + circle end-caps is the convention. Caps can **breathe** (scale 1 → 1.1) to reinforce "this is the live partition" — same language as the log-panel's latest-entry pulse.
- If you add a new partition visual, use the same dashed treatment.

### 8. Completion animation

- Current: per-bar cascade of pulses.
- Alternative: a single **left-to-right lime sweep** across the row — same language as the code-panel active-line shimmer. One signature motion per scene > many small flourishes.

### 9. Reduced-motion gate

- **Every** pulse, glow, cascade, sweep, arc must early-return on `prefersReducedMotion()`.
- Check: `animateCompare`, `animateSorted`, `animateCompletion`, any custom choreography.
- Grep your viz for `animate(` / `.animate(` / `pulseSvgElement(` and confirm each is gated.

### 10. Font-variant-numeric

- Every text element rendering a number that updates live: `font-variant-numeric: tabular-nums;`.
- Without it, a swap visibly jitters horizontally as digit widths change.

### 11. Tokens, not hex

- Grep your SCSS for `#` and any hex. Every one should be a token (`var(--...)`).
- Alpha variants use `rgb(var(--X-rgb) / α)`.

### 12. prefers-reduced-motion at the SCSS level too

- For pure-CSS hovers/transitions in the viz wrapper or legend, wrap with `@media (prefers-reduced-motion: reduce) { transition: none; animation: none; }`.

### 13. Keyboard + focus

- Toolbar controls (play/pause, step, speed, randomize, preset) all tabbable, all show the global `:focus-visible` ring.
- No `outline: none` without a replacement. If you added a custom treatment, it matches or references `--ring-focus`.

### 14. ARIA fallback

- The log-panel exists as the textual narration for each step — confirm it receives every step's `description`.
- Ideal: a `aria-live="polite"` region on the viz that repeats the current step description. Not blocking but worth adding if you're already in the file.

### 15. Consistency with legend-bar

- The legend for this viz uses the same `--viz-state-*` tokens the shapes do — not a second colorway. If you introduced a new state, the legend gains a chip, not a separate palette.

## Quick commands

```bash
# Smoke: do tests still pass?
npm run test:algorithms

# Build: no budget warnings introduced?
npm run build

# Token lint (grep for hex in component SCSS):
grep -r --include='*.scss' --exclude-dir=node_modules -nE "#[0-9a-fA-F]{3,8}\b" src/app/features/algorithms/components/<your-viz>/
# (expect zero hits outside of documented exceptions)
```

## When NOT to apply this checklist verbatim

- On a chalkboard/scratchpad viz — items 1–8 are for **sorting-family flat** aesthetic. The chalkboard has its own language (see `ohno-scratchpad-narrative`): Caveat font, notebook rules, margin annotations.
- On a graph/tree viz with edge-weight labels — the label treatment discussion shifts (outline stroke is often correct there because edges overlap labels).

Adapt in that case; don't skip the motion/a11y items (they're universal).

## Known open polish items (user-tracked)

See the stored memory "Sorting viz polish TODOs" (`~/.claude/projects/-Users-witek-repos-ohno/memory/project_sorting_viz_polish_todos.md`) for the user's ranked backlog. Prioritize #1–#4 when the user says "wróćmy do wizualizacji sortujących" or similar.
