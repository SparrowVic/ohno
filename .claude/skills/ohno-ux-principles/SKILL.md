---
name: ohno-ux-principles
description: Use before any creative UI/UX work in this app — new view, new component, redesign pass, a refresh of existing chrome. Captures the design direction, aesthetic rules, brand voice, and "what good looks like" for Ohno so proposals feel native to the project rather than generic. Trigger on any ask starting with "design", "redesign", "make it look better", or "propose a UI for".
---

# Ohno — UX principles

This document is the **"what we're going for"** brief. Read it before proposing a UI so the work is coherent with the existing visual voice, and the user can say "yes, that's it" instead of "hmm, not quite".

## The project in one line

> A dark, editorial, educational playground for algorithms — made beautiful enough that you want to stay and learn, precise enough that each step teaches something real.

Reference docs shipped with the repo: [proj-info/brief.md](../../../proj-info/brief.md), [proj-info/todo.md](../../../proj-info/todo.md), [proj-info/mockups/](../../../proj-info/mockups/), [proj-info/navbar-suggestion/](../../../proj-info/navbar-suggestion/), [proj-info/shader-card/](../../../proj-info/shader-card/). Read these when in doubt about direction.

## The three visual languages

The app runs **three distinct visual idioms** that coexist. Don't blur them.

### 1. Chrome (global UI)

Navbar, sidebar, card grid, toolbar, language switcher, modals. This is the **Linear / Vercel / Raycast** school — a bit more editorial:

- Solid dark-first surfaces with a subtle surface ladder (`--surface-0` → `--surface-4`).
- Hairline borders (`--border`) + elevated shadows (`--elevation-*`).
- A **brand aurora** (violet → cyan → lime) living in the backdrop, never yelling.
- A 1px **brand rail** across the top of the viewport (`body::after`) that slowly animates — the signature mark.
- Subtle **film grain** (`body::before`, 4% opacity) giving surfaces a photographic weight.
- Typography: Sora for UI, IBM Plex Mono for code/numbers.

### 2. Flat viz (sorting family)

Bar-chart, block-swap, radix. Post-redesign language:

- **Solid fills + hairline stroke.** No gradient, no sheen, no per-item shadow.
- State colors are semantic: cyan attends, pink acts, lime is done.
- Labels use mono + tabular-nums. Don't tint labels with the state color — white stays white.
- Motion is derived from `createMotionProfile(speed)` — one slider, consistent rhythm across algorithms.

See open polish backlog: `ohno-viz-polish-checklist` skill.

### 3. Chalkboard (scratchpad narrative)

Euclidean GCD, Extended Euclidean, Miller-Rabin, CRT, Gaussian elim. This is the **tutor-at-a-whiteboard** idiom:

- **Caveat font** for markers, captions, instructions, annotations — the printed-hand cursive.
- Lines grow as the algorithm progresses, each typed (goal / note / equation / substitute / decision / result / divider).
- Margins carry invariants and hints — the stuff the student needs to keep in mind.
- Math renders with KaTeX inline (`[[math]] … [[/math]]` markers).
- Tone is teaching, not performing. A line lands, the student reads it, then it settles.

See `ohno-scratchpad-narrative` skill.

## Brand voice

- **Precise, not playful.** No emoji, no exclamation points. Humor hides in copy length and rhythm, not in punctuation.
- **Polish is the reference.** EN follows PL, not the other way. When PL has a specific technical word (e.g. "reszta" for remainder), EN picks the equivalent that would appear in a textbook, not a marketing blog.
- **Names matter.** Algorithms get proper names (Euclidean, not "gcd algo"). Panels get functional names (Log, Code, Viz, Scratchpad — capitalized as labels, lowercase in prose).
- **Empty states teach.** If there's nothing yet, the empty state should hint at what comes next — not say "Nothing here."

## Aesthetic rules (non-obvious)

1. **Dark is the only mode.** Don't propose a light theme. Don't ask if there should be one. The color system is hand-tuned for dark; a light mode would require a parallel token set that doesn't exist.
2. **Reduce before adding.** If a scene feels cluttered, the answer is almost always fewer elements or lower contrast on background elements — not a new accent color or a stronger stroke.
3. **Avoid generic AI aesthetics.** Symptoms to avoid: rainbow gradients on everything, glassmorphism as the whole surface treatment, overly-rounded cards (24px+ radii), stock hero illustrations, dashboard-y "widget grid" with mixed card sizes. Ohno has **opinions** — everything is 22px or smaller radius, no glass-panel except under specific circumstances, algorithmic visuals are the hero content.
4. **One accent per region.** A card doesn't need all four brand colors. Pick the semantic one (difficulty color for the card chrome, state color for the viz, violet for chrome) and commit.
5. **Motion is quiet.** Animations exist to direct attention, not to impress. Default durations (`--duration-base: 220ms`). Long entrances (`--duration-entrance: 520ms`) are for the first-paint hero moment only.
6. **Type stays in the scale.** Don't introduce a 17px or 19px size. Use the existing ramp. If something looks wrong at the current size, the answer is weight / line-height / opacity — not a new size.
7. **Density is intentional.** Chrome is a bit tight; viz scenes breathe. Mixing the two (compact chrome inside a viz stage, loose rows inside a dense card) reads sloppy.

## Reference apps — what to borrow from

- **Linear** — the segmented controls, the command-palette polish, the way state is conveyed through chroma shifts not icons.
- **Vercel** — the flat, information-dense dashboard feel. The hairlines. The restraint.
- **Raycast** — the menu treatment, keyboard-first interactions.
- **Figma file-browser (the 2024 redesign)** — mixed-density grid, segmented filters, chip rows.
- **Apple Calculator "Programmer" mode** / **Grapher** — for the math-lab scenes, the way registers and formulas align.
- **An analogue of Tufte / E.R. Tufte's small-multiples** — for any "family of variants" card row (currently not done; worth considering for the catalog).

## Reference apps — what to NOT borrow from

- Stripe-style pastel gradients and decorative illustrations — too branded, too soft.
- ShadCN-default shadow-on-white card aesthetic — too ubiquitous, too light.
- Material 3 surface-tint / dynamic-color — wrong idiom entirely.
- "GitHub Copilot launch page" energy — too glossy, too marketing.

## Creative direction checklist — before proposing

1. Which visual language am I in? Chrome / flat-viz / chalkboard. Don't mix.
2. Is there an existing token / primitive that already does this? (Check `ohno-design-tokens` and the `src/app/shared/` primitives.)
3. What's the PL copy going to say? (Start from copy, not layout. Copy is the skeleton.)
4. Does it survive at 360px wide? 1280px wide? Long i18n strings (EN often +30% over PL)?
5. Is the motion language consistent with `--duration-*` and `createMotionProfile`?
6. Does any animated element honor `prefers-reduced-motion`?
7. Focus ring on every interactive element?
8. Is there an empty / loading / error state, not just the happy path?

## Generative moves that usually land

Things the user has validated or asked for repeatedly:

- **Semantic state colors everywhere** — same cyan/pink/lime language across all viz families, so students transfer the visual vocabulary.
- **Caveat for narrative chrome** — the chalkboard font unlocks a warmer tone without going cutesy.
- **Hairline strokes + subtle drop shadow** over heavy fills. Flat > textured.
- **One signature motion per scene** — a sweep, a pulse, a partition line — rather than many small flourishes.
- **Margin annotations** (small, cursive, anchored) instead of tooltips.
- **Preset chips** for canonical scenarios instead of free-form inputs.

## Generative moves that historically miss

- Proposing a navbar redesign that doesn't reference `proj-info/navbar-suggestion-*/`.
- Adding a new accent color instead of repurposing the existing four.
- Using `--ease-spring` for anything larger than a 40×40 chip — it overshoots and feels cartoony at scale.
- "Dashboard" layouts (widget grid) for algorithm detail pages — the algorithm **is** the page.
- Hover-move transforms on cards (lift-on-hover) — was explicitly walked back in the flat-redesign.

## When unsure

Don't invent — sketch the proposal in **prose first**, show me, then code. The cost of disagreement before code is near-zero; after is high.
