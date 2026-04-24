---
name: ohno-motion-and-a11y
description: Use whenever adding animation, interaction, focus state, or accessibility affordance to this app. Covers the createMotionProfile pattern, prefers-reduced-motion gate, the global focus ring, ARIA needs for step-driven visualizations, and keyboard-navigation baselines. Trigger on any CSS transition/animation or Anime.js call.
---

# Ohno — motion & accessibility

Ohno's motion and a11y posture is set: dark-first, cyan focus ring, reduced-motion respected in viz, semantic state colors. **Your job is to not regress it.**

## Motion — one profile, one slider

Every step-driven visualization derives its durations from a single `MotionProfile` built off the user's speed slider (1..10):

```ts
import { createMotionProfile } from '../../utils/visualization-motion/visualization-motion';

const motion = createMotionProfile(this.speed());
// motion.frameMs        — inter-step frame delay
// motion.compareMs      — highlight pulse on compare
// motion.swapMs         — full swap duration
// motion.settleMs       — bars returning to rest
// motion.completeStepMs — per-bar cascade in "sorted" sweep
// motion.swapLiftPx     — how high the swap arc lifts
```

Formula (in [visualization-motion.ts](../../../src/app/features/algorithms/utils/visualization-motion/visualization-motion.ts)):

- `frameMs = 500 - ((speed - 1) / 9) * 480` — 500ms at speed 1, ~20ms at speed 10.
- `compareMs = clamp(frameMs * 0.48, 90, 220)`
- `swapMs = clamp(frameMs * 0.82, 140, 360)`
- `settleMs = clamp(frameMs * 0.68, 150, 320)`
- `completeStepMs = clamp(frameMs * 0.20, 18, 72)`
- `swapLiftPx = clamp(frameMs * 0.09, 14, 34)`

**Rule:** never hardcode milliseconds in a viz. Derive from the profile. This is why "slower" and "faster" feels consistent across different algorithms.

## Standard easings

From the global tokens (see `ohno-design-tokens`):

- `--ease-out-quart` — default for enter/settle (`cubic-bezier(0.22, 1, 0.36, 1)`).
- `--ease-out-expo` — snappier exits.
- `--ease-spring` — playful overshoots (use in one spot per scene, max).
- `--ease-soft` — symmetrical subtle transitions.

For Anime.js calls, either reference the CSS-var indirectly via a JS constant (see `MOTION_EASING` in visualization-motion.ts) or use Anime's named easings — stay consistent within a component.

## Reduced-motion gate

Every animated function must early-return when the user prefers reduced motion:

```ts
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

private animateCompare(...) {
  if (prefersReducedMotion()) return;
  // …
}
```

The helper lives inlined in each viz that needs it (see [bar-chart-visualization.ts:493](../../../src/app/features/algorithms/components/bar-chart-visualization/bar-chart-visualization.ts#L493) and [block-swap-visualization.ts:657](../../../src/app/features/algorithms/components/block-swap-visualization/block-swap-visualization.ts#L657)). That's fine — small, self-contained.

For pure-CSS transitions on layout components, wrap with a media query:

```scss
@media (prefers-reduced-motion: reduce) {
  .panel { transition: none; animation: none; }
}
```

**Gate everything:** compare pulses, swap arcs, sorted cascades, chalkboard line-entry animations, brand-rail flow on `body::after` (already handled globally).

## Focus

A **single global ring** is defined at [src/styles.scss](../../../src/styles.scss):

```scss
:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
  border-radius: var(--radius-sm);
}
```

`--ring-focus` is a cyan triple-layer glow. `--ring-focus-soft` is a quieter alternative for dense UIs.

**Don't override per-component unless you have a specific reason** (e.g., a tight chip-dense row where the soft ring reads better). If you do override, use the soft variant — don't invent a new treatment.

Never use `outline: none` alone. Either honor the global `:focus-visible`, or replace it with a different visible treatment. Ring-less focus is a bug.

## Keyboard navigation

Baseline:
- All interactive chrome (buttons, segmented controls, language switcher, toolbar) uses **native HTML semantics** — `<button>`, `<input type="range">`, `<select>`, or real `<a>`. Prefer that over div-with-click.
- Icon-only buttons get `aria-label`.
- The visualization-toolbar supports `←` / `→` (step), `Space` (play/pause), `+` / `-` (speed) where implemented. When adding new controls, match this language.
- Modal/menu escapes close on `Esc`.

Gaps worth fixing opportunistically (flagged so you don't re-introduce them):
- No app-wide skip-to-content link.
- Viz container itself isn't a focusable element — keyboard users can't "inspect" a specific bar. Not regressing is fine; improving is a nice-to-have.

## ARIA for step-driven viz

The **log-panel** is the textual fallback for screen readers — it receives every step's `description`.

For step announcements, ideal pattern (aspirational — not yet uniformly applied):

```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {{ currentStepDescription }}
</div>
```

Put one such region per active visualization host. `polite` not `assertive` — we don't want to interrupt.

SVG viz canvases should have `role="img"` and an `aria-label` describing the algorithm + current state summary, **not** every step (that's the live region's job).

## Interaction micro-rules

- Hover shouldn't move the element (no `transform: translateY(-2px)` on hover). It should change fill/stroke/shadow. Movement belongs to active state or live events.
- Press state (`:active`) lowers elevation by one step, never inverts.
- Transitions: **150ms `--ease-out-quart`** for hover, **220ms** for state changes, **360ms** for reveals. Use `--duration-*` tokens.
- Don't animate properties that cause layout (`width`, `height`, `top`, `left`) — animate `transform` and `opacity`.

## When to skip an animation entirely

- Repeated state updates at high speed (speed=10): the user won't perceive the animation, and the cost is jank. Some viz explicitly skip pulses above a threshold.
- When two transient states would animate simultaneously — cancel one (`cancelElementAnimations(target)` from `visualization-motion.ts`).
- When the element is off-screen (IntersectionObserver gate — not yet widely used but worth considering for long lists).

## Checklist before claiming a viz is "polished"

1. Works at speed=1 and speed=10 without jank or visual artifacts.
2. Honors `prefers-reduced-motion` end-to-end.
3. Every interactive element shows the global focus ring on `:focus-visible`.
4. `aria-live` live region (or log-panel as the external fallback) narrates each step.
5. No hardcoded ms — durations pulled from `createMotionProfile`.
6. No hover-translate; state changes don't reposition.
