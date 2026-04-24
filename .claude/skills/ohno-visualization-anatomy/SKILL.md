---
name: ohno-visualization-anatomy
description: Use when adding or modifying a visualization component in Ohno (D3 + Anime.js + SortStep-driven renderer). Covers component shape, VisualizationRenderer contract, state-style record pattern, motion profile wiring, resize handling, and the flat-aesthetic rules the sorting family already follows. Trigger on files under src/app/features/algorithms/components/*-visualization/.
---

# Ohno — visualization anatomy

Every visualization in this app is a standalone Angular 21 component that:

1. Declares signal inputs `array`, `step`, `speed`.
2. Implements the [`VisualizationRenderer`](../../../src/app/features/algorithms/models/visualization-renderer.ts) contract — `initialize(array)`, `render(step)`, `destroy()`.
3. Owns an SVG via D3 `d3-selection` and drives choreography via `animejs` `animate()` or `target.animate(...)` (Web Animations).
4. Maps per-element state → color via a `Record<State, { fill; stroke }>` lookup using CSS custom properties.
5. Wraps a `ResizeObserver` for responsive layout.
6. Gates pulses/sweeps behind `prefersReducedMotion()`.

## Canonical references (read before scaffolding)

- Flat bar pattern: [src/app/features/algorithms/components/bar-chart-visualization/bar-chart-visualization.ts](../../../src/app/features/algorithms/components/bar-chart-visualization/bar-chart-visualization.ts)
- Swap-heavy block pattern: [src/app/features/algorithms/components/block-swap-visualization/block-swap-visualization.ts](../../../src/app/features/algorithms/components/block-swap-visualization/block-swap-visualization.ts)
- Motion helpers: [src/app/features/algorithms/utils/visualization-motion/visualization-motion.ts](../../../src/app/features/algorithms/utils/visualization-motion/visualization-motion.ts)

## Component shape

```ts
@Component({
  selector: 'app-foo-visualization',
  imports: [],
  templateUrl: './foo-visualization.html',
  styleUrl: './foo-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  constructor() {
    effect(() => {
      const arr = this.array();
      if (!this.initialized) return;
      this.initialize(arr);
      untracked(() => {
        const s = this.step();
        if (s) this.render(s);
      });
    });

    effect(() => {
      const s = this.step();
      if (this.initialized && s) this.render(s);
    });
  }

  ngAfterViewInit(): void { /* create svg, set up resize, initialize */ }
  ngOnDestroy(): void { this.destroy(); }

  initialize(array: readonly number[]): void { /* clear + (re)build DOM */ }
  render(step: SortStep): void { /* diff previous → apply states + animations */ }
  destroy(): void { /* disconnect observer, remove svg */ }
}
```

Template is trivially `<div #container class="viz"></div>`.

## State → color pattern

Always use semantic viz-state tokens. Copy this shape; don't inline hex:

```ts
type BarState = 'default' | 'comparing' | 'swapping' | 'sorted';
interface StateStyle { readonly fill: string; readonly stroke: string; }

const BAR_STATE_STYLES: Record<BarState, StateStyle> = {
  default:   { fill: 'rgb(var(--viz-state-default-rgb) / 0.85)', stroke: 'rgb(var(--viz-state-default-rgb) / 0.95)' },
  comparing: { fill: 'rgb(var(--viz-state-compare-rgb) / 0.92)', stroke: 'var(--viz-state-compare)' },
  swapping:  { fill: 'rgb(var(--viz-state-swap-rgb)    / 0.92)', stroke: 'var(--viz-state-swap)' },
  sorted:    { fill: 'rgb(var(--viz-state-sorted-rgb)  / 0.92)', stroke: 'var(--viz-state-sorted)' },
};
```

Rules of thumb:
- Stroke + fill share a hue; fill slightly lower alpha than stroke.
- Text on top of a stateful fill stays `var(--text-primary)` — don't tint it with the state color (dual-tone = low contrast).
- Stroke-width `0.5px` is the house hairline.

## Motion wiring

```ts
import { createMotionProfile, pulseSvgElement } from '../../utils/visualization-motion/visualization-motion';

const motion = createMotionProfile(this.speed());
// motion.frameMs / compareMs / swapMs / settleMs / completeStepMs / swapLiftPx
```

- `createMotionProfile(speed)` scales all sub-durations from one user-facing slider (1..10). Don't hardcode ms; derive from the profile.
- `pulseSvgElement(target, { duration, scale, filter, easing })` for one-off emphasis.
- Anime.js `animate(target, { translateX, duration, ease })` for choreographed tweens (e.g., arc swaps).
- For swaps, prefer a quadratic Bézier `translate` path (one item over, one under) — see `block-swap-visualization` for the exact pattern.

Every animated path must early-return when `prefersReducedMotion()`:

```ts
private animateCompare(...) {
  if (prefersReducedMotion()) return;
  // ...
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

(The helper is currently inlined in each viz that needs it — that's fine, keep it local.)

## Rendering diff — don't rebuild when you can swap

`render(step)` should:

1. If `step.array.length !== bars.length` → full `snapRebuild`.
2. Else if values already match positions → just re-apply states + run step effects.
3. Else if `step.swapping` is set and a 2-item swap explains the diff → animate swap in place.
4. Else → `snapRebuild` (safe fallback).

This keeps the animation language honest: swaps animate, non-swap state changes just re-color.

## Layout

- Measure via `getBoundingClientRect()` in a `measure()` method.
- Re-run `layoutAll()` on resize.
- SVG uses `viewBox` + `preserveAspectRatio="none"` so it fills the container.
- Horizontal padding: `clamp(width * 0.03, 10, 24)`.
- Top padding 44px (for labels), bottom 30px (baseline). Adjust per-family but keep proportions consistent.

## Flat aesthetic — rules for sorting family

- Solid fill, hairline stroke, no vertical gradient, no sheen, no per-item ellipse shadow.
- Number labels: `font-family: var(--font-mono)`, `font-weight: 600`, `font-variant-numeric: tabular-nums`. The current dark stroke outline on labels (2px `rgba(8,10,16,0.82)`) was a holdover from the gradient era — on solid flat, a chip/pill background is a cleaner alternative if you touch the label treatment.
- Border-radius: bars use dynamic radius `clamp(minDim * 0.28, 3, 18)`; blocks fixed at 14. Either is fine; don't invent a third scale.
- One unified baseline shadow on the whole row beats per-item shadows.

## When NOT to write a new visualization

- If the algorithm is pure-math/derivational (GCD, modular arithmetic, CRT, Bézout, Miller-Rabin, …) → use [scratchpad-lab-visualization](../../../src/app/features/algorithms/components/scratchpad-lab-visualization/) instead. See `ohno-scratchpad-narrative` skill.
- If the family already has a viz (graph, dp, grid, tree, string, geometry) → add a new trace-state variant to the existing viz rather than forking.
