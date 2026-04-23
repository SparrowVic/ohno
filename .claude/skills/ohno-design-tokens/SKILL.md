---
name: ohno-design-tokens
description: Use whenever you touch color, radius, spacing, motion timing, elevation, focus, or typography in this app. Catalogs every CSS custom property defined in src/styles.scss so you pick an existing token rather than inventing a value. Trigger on any SCSS edit and on any inline style referring to visual constants.
---

# Ohno — design tokens

Single source of truth: [src/styles.scss](../../../src/styles.scss) `:root { … }` at the top of the file. **If a shade/size you need doesn't exist, add a token there first — never hand-roll a hex or px in a component.**

Dark-only. `color-scheme: dark` on `:root`.

## Surface ladder

```
--app-bg            #0a0c12        (page / outermost)
--surface-0         #0a0c12
--surface-1         rgba(20, 23, 31, 0.88)   (panels)
--surface-2         rgba(26, 30, 39, 0.92)   (cards / raised)
--surface-3         rgba(32, 37, 48, 0.96)   (hover / strong)
--surface-4         rgba(38, 44, 57, 0.98)   (floating / menus)
--surface-inset     rgba(6, 8, 12, 0.7)      (recessed — code, track)
```

Legacy aliases still live: `--surface`, `--surface-raised`, `--surface-hover`, `--surface-strong`, `--surface-soft`, `--panel-bg`, `--panel-bg-strong`, `--card-bg`. Prefer the numeric ladder in new code.

Chrome overlay layer: `--chrome-navbar-bg`, `--chrome-sidebar-bg`, `--chrome-veil`, `--chrome-veil-strong`, `--chrome-line`, `--chrome-line-strong`.

## Borders

```
--border          rgba(255, 255, 255, 0.07)
--border-hover    rgba(255, 255, 255, 0.16)
--border-strong   rgba(255, 255, 255, 0.22)
--border-brand    rgba(var(--chrome-accent-rgb), 0.34)
```

## Text ramp

```
--text-primary       #f5f6fb
--text-secondary     #bdbecb
--text-tertiary      #858793
--text-quaternary    #5a5c68
```

## Brand triad (+ pink accent)

Every brand color ships with both the hex var and an `-rgb` channel so you can do `rgb(var(--X-rgb) / α)` for parametric alphas:

| Token | Value | Role |
|---|---|---|
| `--accent` | `#c7e56a` lime | primary brand / "done" state |
| `--chrome-accent` | `#9a8cff` violet | chrome / hero |
| `--chrome-accent-alt` | `#4ce3ff` cyan | focus / "attending" |
| `--chrome-accent-warm` | `#ff88b8` pink | "acting" / rare accent |

Gradients:
- `--brand-gradient` (violet → cyan → lime, 135°)
- `--brand-gradient-soft` (same stops, 22% alpha)
- `--brand-gradient-faint` (10% alpha)
- `--brand-aurora` (radial triple-glow, used by the body backdrop)

## Visualization palette (non-sort scenes)

Each pair `X` / `X-ink` / `X-rgb` is hue-matched for a subtle dark-bg read:

- `--viz-accent` (neutral slate)
- `--viz-window` (violet-gray, "window/frame")
- `--viz-warning` (warm tan)
- `--viz-success` (muted green)
- `--viz-route` (teal)
- `--viz-danger` (dusty rose)
- `--viz-hit` (sand/gold)
- `--viz-ember` (burnt orange)

## Visualization STATE palette (sort family + any step-driven viz)

Semantic mapping used app-wide:

```
--viz-state-default   → --viz-accent          (idle / default bars)
--viz-state-compare   → --chrome-accent-alt   (cyan — "attending")
--viz-state-swap      → --chrome-accent-warm  (pink — "acting")
--viz-state-sorted    → --accent              (lime — "done")
```

Each has a matching `-rgb`. Legacy aliases kept: `--compare-color`, `--swap-color`, `--sorted-color`.

**Use the semantic name, not the underlying hue.** If the language changes ("attending → prospecting"), the semantic token gets repointed and all viz inherit.

## Difficulty palette

```
--easy         #7ce0a4   (bg: rgba(..., 0.13))
--medium       #dcbd73   (bg: rgba(..., 0.13))
--hard         #f09494   (bg: rgba(..., 0.13))
--ultra-hard   #ff8a42   (bg: rgba(..., 0.15))
```

Plus `-rgb` and `-bg` variants.

## Radii

```
--radius-sm   7px
--radius-md   10px
--radius-lg   14px
--radius-xl   18px
--radius-2xl  22px
--radius-3xl  28px
```

Control-specific: `--control-radius: 12`, `--control-radius-sm: 10`.
Panel shell: `--panel-shell-radius: 22`.

Don't introduce `6px` or `11px` — pick the nearest token. The scale is intentionally sparse.

## Motion language

Easings:
- `--ease-out-quart` `cubic-bezier(0.22, 1, 0.36, 1)` — default for enters/settles
- `--ease-out-expo` `cubic-bezier(0.16, 1, 0.3, 1)` — snappier outgoing
- `--ease-spring` `cubic-bezier(0.34, 1.56, 0.64, 1)` — playful overshoots (use sparingly)
- `--ease-soft` `cubic-bezier(0.4, 0.2, 0.2, 1)` — subtle, symmetrical

Durations:
```
--duration-instant   90ms    (press/release feedback)
--duration-fast      150ms   (hover, toggles)
--duration-base      220ms   (state swap, reveal)
--duration-slow      360ms   (enter/exit panels)
--duration-entrance  520ms   (first-load hero / algorithm header)
```

For step-driven viz animations (compare/swap/settle): use `createMotionProfile(speed)` — see `ohno-motion-and-a11y`.

## Elevation

```
--elevation-0    subtle 1px top-light hint
--elevation-1    panels
--elevation-2    raised cards / tooltips
--elevation-3    floating panels / popovers
--elevation-4    modal / max-depth
```

Each is a **composite** of a 1px top-light accent + a drop shadow. **Don't write `box-shadow: 0 4px 12px rgba(0,0,0,0.2)` by hand.**

## Focus

Global `:focus-visible` ring in `styles.scss`:

```css
:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
  border-radius: var(--radius-sm);
}
```

Tokens: `--ring-focus` (triple-layer cyan), `--ring-focus-soft` (quieter alternative for dense UIs). Don't override per component unless you genuinely need a different visual weight.

## Typography

```
--font-sans      'Sora', 'Inter', 'Segoe UI', sans-serif
--font-mono      'IBM Plex Mono', 'SF Mono', ui-monospace, monospace
--font-notebook  'Newsreader', 'Iowan Old Style', 'Hoefler Text', Georgia, serif   ← scratchpad narrative chrome; pair with `font-style: italic`
```

Numeric labels should use `font-variant-numeric: tabular-nums;` to prevent horizontal jitter during live updates.

## Control sizing

```
--control-height      40px
--control-height-sm   32px
--control-icon-size   40px
--control-padding-inline  12px
```

## Film grain & brand rail

`body::before` is a base64 SVG noise at `opacity: 0.042`, `mix-blend-mode: overlay`.
`body::after` is the 1px top aurora line animating via `@keyframes brand-text-flow`.
Both are identity — don't disable unless you're specifically iterating on the landing chrome.

## Global keyframes

Defined in `styles.scss` and available app-wide:
- `ohno-fade-in`
- `ohno-fade-up`
- `ohno-fade-scale`

Use these for entrance choreography instead of one-off keyframes.

## When to add a new token

Add one when:
- You need a shade that's used in ≥2 places.
- You want the value to survive a theme repoint (e.g., "warm swap → orange swap").
- You're building a new scene/family that introduces a distinct semantic (e.g., `--chalk-chalk-line`, `--chalk-board-bg`).

Don't add one when:
- It's a truly one-off transient (an inline `rgba(...)` is fine for a single z-1 glow).
- You're reusing an existing meaning under a new name — repoint, don't duplicate.

After adding, document the role in the block comment where it's declared (see existing sections for tone — terse, imperative).
