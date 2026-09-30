---
name: ohno-design-tokens
description: Use whenever you touch color, radius, spacing, motion timing, elevation, focus, or typography in this app. Catalogs every CSS custom property defined in src/styles/_instrument-tokens.scss so you pick an existing token rather than inventing a value. Trigger on any SCSS edit and on any inline style referring to visual constants.
---

# Ohno — design tokens (Instrument)

Single source of truth: [src/styles/_instrument-tokens.scss](../../../src/styles/_instrument-tokens.scss) `:root { … }`. Design spec: [docs/superpowers/specs/2026-09-30-instrument-redesign-design.md](../../../docs/superpowers/specs/2026-09-30-instrument-redesign-design.md). **If a shade/size you need doesn't exist, add a token there first — never hand-roll a hex or px in a component.**

Dark-only. `color-scheme: dark` on `:root`. The page is a graphite **desk** holding **plates** (units) with **screens** (displays) and **keys** (controls).

## Two rules that the reviewer greps for

1. Components use only `var(--x)` or `rgb(var(--x-rgb) / a)`. The comma form `rgba(var(--x-rgb), a)` is **forbidden** — browsers drop it silently.
2. Doto (`--font-dot`) is for numbers, complexity notation and the one-word category marquee — never for sentences, never below 14px.

## Materials

| Token | Value | Use |
|---|---|---|
| `--desk` (+`-rgb`) | `#0b0c0e` | page background (`app-root`), slot channel |
| `--desk-halo-warm` / `--desk-halo-cool` | `#212328` / `#17181c` | the two radial highlights on the desk |
| `--plate-hi` / `--plate-lo` (+`-rgb`) | `#25272c` / `#1a1c20` | plate gradient ends |
| `--key-hi` / `--key-lo` (+`-rgb`) | `#2e3137` / `#202227` | key gradient ends, knob cap |
| `--screen` (+`-rgb`) | `#060708` | every inset display, search field, kbd chips |
| `--paper` / `--paper-ink` (+`-rgb`) | `#ebe6d9` / `#2a2620` | tape paper and its ink |
| `--led-off` (+`-rgb`) | `#292b30` | unlit LED |

Gradients (prebuilt): `--gradient-plate`, `--gradient-plate-hover`, `--gradient-key`, `--gradient-key-in` (pressed), `--gradient-key-signal` (orange action key), `--gradient-paper`, `--gradient-sheen` (diagonal screen sheen).

## Ink ramp

`--ink` `#f0efea` (primary) · `--ink-2` `#b9b8b2` · `--ink-3` `#82827d` (engravings — informational only, fails 4.5:1 below 12px) · `--ink-4` `#56575b` (dimmed). Each has an `-rgb` twin. `--white-rgb` / `--black-rgb` exist for shadow and hairline alphas only.

## Signal and state colours

| Token | Value | Role |
|---|---|---|
| `--signal` | `#ff5a1f` | the one action colour: play key, active LEDs, main counter, slot fill, knob pointer, focus ring |
| `--signal-deep` | `#a83a10` | dark end of the slot fill gradient |
| `--cyan` = `--viz-state-compare` | `#4ce3ff` | attending: current node/cell/line, read head, comparison |
| `--pink` = `--viz-state-swap` | `#ff5fa8` | acting: swap, relaxation, decision, rejection |
| `--lime` = `--viz-state-sorted` | `#c7e56a` | done: settled, matched, result, "na żywo" LED |
| `--slate` = `--viz-state-default` | `#7d8696` | idle data |
| `--amber` | `#ffb224` | queued/frontier, warnings, pause LED |
| `--red` | `#ff6257` | errors, "Ekstremalne" |
| `--violet` | `#a992ff` | source/pivot/invariant |
| `--easy` | `#7fe08a` | "Łatwe" difficulty LED |

Every colour has an `-rgb` twin. The semantic viz vocabulary is unchanged: cyan attends, pink acts, lime is done. `LedColor` in `src/app/shared/instrument/led/led.types.ts` mirrors this list.

## Difficulty

`--difficulty-easy` (easy green) · `--difficulty-medium` (amber) · `--difficulty-hard` (signal) · `--difficulty-ultra-hard` (red), each with `-rgb`.

## Typography

| Token | Face | Use |
|---|---|---|
| `--font-ui` | Instrument Sans Variable | all UI text |
| `--font-dot` + `--dot-settings` (`'ROND' 100`) | Doto Variable, weight 900 | numeric readouts only |
| `--font-mono` | Geist Mono Variable | engravings, code, registers, tape |

Sizes in use: UI 14.5 / 13 / 12.5, headings 28 / 19 / 18, code 11.5, engravings 9.5; Doto 58 (marquee) / 50 (main counter) / 30 (meters) / 22 (registers) / 15 (cell values). Fonts are self-hosted through `@fontsource-variable` (see `angular.json` `styles`).

## Radii

`--radius-kbd` 5 · `--radius-sm` 7 · `--radius-md` 10 (window) · `--radius-key` 12 · `--radius-led-chip` 13 · `--radius-screen` 14 · `--radius-key-lg` 15 (transport keys) · `--radius-card` 18 · `--radius-key-xl` 18 (play key) · `--radius-plate` 20. Nothing is rounder than 20px except LEDs and knobs.

## Motion

Easings `--ease-out-quart`, `--ease-out-expo`, `--ease-soft`. Durations `--duration-instant` 90ms (key press) · `--duration-fast` 150ms (LED, cross-fades) · `--duration-base` 220ms (knob pointer, tape feed) · `--duration-slow` 360ms · `--duration-pulse` 2400ms (live LEDs). Keyframes in `_base.scss`: `ohno-fade-up`, `ohno-fade-scale`, `ohno-led-pulse`, `ohno-tape-feed`. `_base.scss` holds the global `prefers-reduced-motion: reduce` kill switch (all animations/transitions → 0.01ms); JS-driven motion still goes through `prefersReducedMotion()`.

## Depth (shadows are tokens — never hand-roll)

`--shadow-plate` / `--shadow-plate-hover` · `--shadow-screen` (inset) · `--shadow-key` / `--shadow-key-in` (pressed) / `--shadow-key-signal` · `--shadow-window` · `--shadow-cap` (slot cap) · `--shadow-knob` · `--shadow-paper`. Nothing lifts on hover; hover is a slightly brighter gradient, press is the inset recipe.

## Screen texture, grooves, focus, layers

- `--screen-dots` + `--screen-dot-size` (6px) — the dot grid on screens.
- `--groove`, `--groove-highlight`, `--hairline`, `--engraving-shadow`.
- `--focus-ring` — `0 0 0 2px var(--signal), 0 0 0 6px rgb(var(--signal-rgb) / 0.22)`; global `:focus-visible { box-shadow: var(--focus-ring) }`. On keys it is appended after `--shadow-key`.
- `--z-menu` 40 · `--z-popover` 60 · `--z-toast` 80.

## Primitives that already encode the tokens

`src/app/shared/instrument/` — `ohno-plate`, `ohno-screen`, `ohno-engraving`, `ohno-led`, `ohno-kbd`, `ohno-readout`, `ohno-meter`, `ohno-key`, `ohno-latch`, `ohno-knob`, `ohno-window-stepper`, `ohno-slot`, `ohno-gauge`, `ohno-opline`, `ohno-rack`, `ohno-rack-row`, `ohno-tape`, `ohno-floating-plate`, `ohno-menu`, `ohno-search-field`, `ohno-lang-toggle`. Reach for one before styling a `div`. All of them are on the dev-only specimen route `/dev/instrument`. `ohno-key` also takes `prefix` (mono index) and reads `--key-width`, `--key-height`, `--key-radius`, `--key-justify`, `--key-font`, `--key-flex-direction`, `--key-gap` from its host; `ohno-plate` takes `screwCorners="top"` for cards; `ohno-search-field` reads `--search-height`/`--search-radius`.

## Compatibility aliases (deprecated)

Every name in [src/styles/_compat-tokens.scss](../../../src/styles/_compat-tokens.scss) (`--surface-*`, `--text-*`, `--accent*`, `--chrome-*`, `--viz-accent` … `--viz-ember`, `--easy-bg`/`--medium`/`--hard`/`--ultra-hard`, `--elevation-*`, `--ring-focus`, `--panel-shell-*`, `--control-*`, `--font-sans`/`--font-notebook`, `--radius-lg`/`-xl`/`-2xl`/`-3xl`, `--ease-spring`, `--duration-entrance`, `--app-grid-*`) only keeps untouched pre-redesign components rendering. **Do not use them in new or migrated code.** They are deleted in Phase 5 of the redesign.

## When to add a new token

1. Grep this catalog first (`grep -n "\-\-" src/styles/_instrument-tokens.scss`).
2. If nothing fits, add the token next to its group with a `-rgb` twin when it is a colour.
3. Use it. Never leave a literal in a component.
