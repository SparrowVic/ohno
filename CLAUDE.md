# Ohno — Claude Code guide

Ohno is an Angular 21 playground for algorithm & data-structure visualizations. Dark, editorial, educational. Custom UI — **no Tailwind, no Angular Material, no Storybook, no NgModules.**

## Stack (pinned)

- **Angular 21.2.x** — standalone components, signals, new control flow, strict templates.
- **TypeScript 5.9** — `strict: true`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, Angular `strictInjectionParameters` + `strictInputAccessModifiers` + `strictTemplates`.
- **Vitest 4** for the algorithm layer (colocated `*.spec.ts`, 70% coverage threshold on algo/utility).
- **D3 7** + **Anime.js 4** for visualization motion (D3 for data-binding, Anime.js for choreography).
- **Three.js** (present, used sparingly).
- **Transloco 8** (PL + EN) — all user-visible strings go through the i18n pipeline.
- **KaTeX 0.16** via [src/app/shared/components/math-text/](src/app/shared/components/math-text/).
- **Shiki 4** via [src/app/shared/code-highlight.service.ts](src/app/shared/code-highlight.service.ts), consumed by [src/app/features/algorithms/components/code-panel/](src/app/features/algorithms/components/code-panel/).
- **Font Awesome Pro 7** — requires `FONTAWESOME_PACKAGE_TOKEN` env var for `npm ci`.
- Fonts: Sora (sans), IBM Plex Mono (mono), **Caveat** (chalkboard/scratchpad narrative chrome).

Node `^20.19.0 || ^22.12.0`, npm `>=10`.

## Top-level layout

- [src/app/core/](src/app/core/) — shell, routing, i18n, language service, `TranslatableText` helper.
- [src/app/shared/](src/app/shared/) — reusable primitives: `math-text/`, `code-highlight.service.ts`, `difficulty-theme.ts`, `category-theme.ts`, directives, pipes, generic controls.
- [src/app/features/algorithms/](src/app/features/algorithms/) — the heart:
  - `algorithms/` — pure algorithm generators (one file or folder per algorithm).
  - `models/` — `sort-step.ts` and per-family trace state types (graph, dp, scratchpad-lab, number-lab, …).
  - `components/` — visualization components, scene primitives (`code-panel`, `log-panel`, `legend-bar`, `visualization-toolbar`, `viz-options-menu`, `scratchpad-lab-visualization`, `bar-chart-visualization`, …).
  - `data/catalog/` — algorithm catalog metadata.
  - `registry/` — lookup service.
  - `algorithm-detail/`, `algorithms-page/`, `algorithm-card/`, `algorithm-traits/` — UI shells.
- [src/styles.scss](src/styles.scss) — the canonical token catalog. **Single source of truth** for color, spacing, radius, motion, elevation, typography, focus.
- [public/i18n/](public/i18n/) — `pl.json`, `en.json`.
- [proj-info/](proj-info/) — brief, todos, navbar & shader-card explorations, logo archive, mockup HTMLs. Useful as design reference; not shipped.

## Hard rules (non-negotiable)

1. **No comments in code.** Well-named identifiers do the explaining. If you feel a comment is needed, rename the symbol instead. The only exception: a WHY-comment for a non-obvious invariant/workaround/browser quirk.
2. **No hex literals in component SCSS.** Always reference tokens from `src/styles.scss` via `var(--token)` or `rgb(var(--token-rgb) / α)`. If a shade you need is missing, add a token first.
3. **Standalone + OnPush, always.** Every `@Component` declares `standalone: true` (Angular 21 default) and `changeDetection: ChangeDetectionStrategy.OnPush`. No NgModules.
4. **Signal inputs only.** Use `input()` / `input.required()` / `input<T>(default)`. Never `@Input()`. Outputs via `output<T>()`.
5. **`inject()` only.** No constructor-parameter injection. Inside components use field initializers: `private readonly foo = inject(FooService);`.
6. **New control flow only.** `@if / @for / @switch`. No `*ngIf`, `*ngFor`, `*ngSwitch`.
7. **Reactivity via signals, `computed()`, `effect()`.** RxJS is kept for Transloco interop and a few existing services; prefer signals for new code.
8. **i18n through `t()` marker + `TranslatableText`.** Never hardcode user-visible strings. See [src/app/core/i18n/translatable-text.ts](src/app/core/i18n/translatable-text.ts) and the `i18nText(key, params)` helper.
9. **File layout per component:** `name.ts` + `name.html` + `name.scss` (separate files, `templateUrl` / `styleUrl`). Colocated spec: `name.spec.ts` only for algorithm layer.
10. **`prefers-reduced-motion` must be honored in any animated viz.** Use `prefersReducedMotion()` from `utils/visualization-motion/`.

## Design system — `src/styles.scss` token catalog

Dark-only (`color-scheme: dark`), app-bg `#0a0c12`.

**Surface ladder:** `--surface-0` … `--surface-4`, `--surface-inset`. Chrome overlays: `--chrome-navbar-bg`, `--chrome-sidebar-bg`, `--chrome-veil`, `--chrome-line`.

**Ink ramp:** `--text-primary` / `-secondary` / `-tertiary` / `-quaternary`.

**Brand triad** (each color has a matching `-rgb` channel for `rgb(var(...) / α)`):
- `--accent` lime `#c7e56a`
- `--chrome-accent` violet `#9a8cff`
- `--chrome-accent-alt` cyan `#4ce3ff`
- `--chrome-accent-warm` pink `#ff88b8` (sparingly)
- `--brand-gradient` / `--brand-gradient-soft` / `--brand-aurora`.

**Visualization state tokens (semantic — cyan=attending, pink=acting, lime=done):**
- `--viz-state-default` / `--viz-state-compare` / `--viz-state-swap` / `--viz-state-sorted` (+ each `-rgb`).
- Family accents for non-sort viz: `--viz-accent`, `--viz-window`, `--viz-warning`, `--viz-success`, `--viz-route`, `--viz-danger`, `--viz-hit`, `--viz-ember`.

**Difficulty:** `--easy` / `--medium` / `--hard` / `--ultra-hard` (+ `-rgb`, `-bg`).

**Radii:** `--radius-sm: 7` / `-md: 10` / `-lg: 14` / `-xl: 18` / `-2xl: 22` / `-3xl: 28`. Control chrome: `--control-radius: 12`, `--control-radius-sm: 10`. Panel shell: `--panel-shell-radius: 22`.

**Motion:** easings `--ease-out-quart`, `--ease-out-expo`, `--ease-spring`, `--ease-soft`. Durations `--duration-instant: 90ms`, `-fast: 150ms`, `-base: 220ms`, `-slow: 360ms`, `-entrance: 520ms`.

**Elevation:** `--elevation-0` … `--elevation-4`. Never hand-roll shadows.

**Focus ring:** global `:focus-visible { box-shadow: var(--ring-focus); }` — cyan triple-layer ring. Don't override per-component unless there's a real reason.

**Film grain + brand rail:** `body::before` SVG noise @ 0.042 opacity; `body::after` 1px top aurora line. Don't fight these — they're part of the identity.

## Visualization architecture

Every algorithm emits a `Generator<SortStep>` from [src/app/features/algorithms/models/sort-step.ts](src/app/features/algorithms/models/sort-step.ts). `SortStep` is a wide discriminated record: always carries `array`, `comparing`, `swapping`, `sorted`, `boundary`, `activeCodeLine`, `description: TranslatableText`, plus optional family-specific state slots (`graph?`, `dp?`, `scratchpadLab?`, `numberLab?`, `geometry?`, `tree?`, `string?`, `dsu?`, `grid?`, `matrix?`, `network?`, `search?`, `sieveGrid?`, `pointerLab?`, `callStackLab?`, `callTreeLab?`).

**Rendering contract:** a visualization component implements `VisualizationRenderer` (inputs `array`, `step`, `speed`) and wires its own D3 selection + Anime.js timeline. Reference implementations:
- [src/app/features/algorithms/components/bar-chart-visualization/bar-chart-visualization.ts](src/app/features/algorithms/components/bar-chart-visualization/bar-chart-visualization.ts) — flat-redesign canonical (solid fills, hairline stroke, no gradient, no per-item shadow).
- [src/app/features/algorithms/components/block-swap-visualization/block-swap-visualization.ts](src/app/features/algorithms/components/block-swap-visualization/block-swap-visualization.ts) — same language.
- [src/app/features/algorithms/components/scratchpad-lab-visualization/scratchpad-lab-visualization.ts](src/app/features/algorithms/components/scratchpad-lab-visualization/scratchpad-lab-visualization.ts) — chalkboard primitive for narrative math algorithms.

**State→color mapping pattern** (copy, don't reinvent):
```ts
const BAR_STATE_STYLES: Record<BarState, StateStyle> = {
  default:   { fill: 'rgb(var(--viz-state-default-rgb) / 0.85)', stroke: 'rgb(var(--viz-state-default-rgb) / 0.95)' },
  comparing: { fill: 'rgb(var(--viz-state-compare-rgb) / 0.92)', stroke: 'var(--viz-state-compare)' },
  swapping:  { fill: 'rgb(var(--viz-state-swap-rgb)    / 0.92)', stroke: 'var(--viz-state-swap)' },
  sorted:    { fill: 'rgb(var(--viz-state-sorted-rgb)  / 0.92)', stroke: 'var(--viz-state-sorted)' },
};
```

**Motion profile:** use `createMotionProfile(speed)` from [src/app/features/algorithms/utils/visualization-motion/](src/app/features/algorithms/utils/visualization-motion/). Gate any pulse/sweep behind `prefersReducedMotion()`.

## i18n discipline

- Keys follow feature paths: `features.algorithms.<family>.<slot>`, `features.algorithms.runtime.<...>`, `catalog.<...>`.
- Declare keys with the marker function `t('...')` so `npm run i18n:extract` picks them up.
- Runtime parameterization: `i18nText(key, params)` returns a `TranslatableText` (see [src/app/core/i18n/translatable-text.ts](src/app/core/i18n/translatable-text.ts)). Never build user-visible text by string concatenation.
- Tooling: `npm run i18n:extract` (updates `pl.json` / `en.json`), `npm run i18n:find` (lists usages).
- When adding a key: write it in `pl.json` in Polish first, then `en.json`. Keep PL the reference.

## Math + code rendering

- **KaTeX:** import the `MathText` component from [src/app/shared/components/math-text/math-text.ts](src/app/shared/components/math-text/math-text.ts). Inputs: `tex`, `content`, `mode`, `displayMode`, `variant`. Renders are memoized (512 LRU). Don't call `katex.renderToString` directly elsewhere.
- **Shiki:** go through `CodeHighlightService` + the `CodePanel` component. Don't spin up a second highlighter.

## Conventions by family

- **Sorting family (bar-chart, block-swap, radix-*):** flat aesthetic. Solid fill, hairline stroke, semantic state colors, `tabular-nums` on any numeric label rendered outside SVG. See the "flat-redesign" polish list in project notes.
- **Number-theory / pure-math (Euclidean GCD, Extended Euclidean, …):** chalkboard aesthetic via `scratchpad-lab-visualization`. Caveat font for narrative chrome, line types `goal | rule | equations | substitute | decision | result`, phaseLabel tones `setup | compute | substitute | decide | complete`, margin annotations split into `invariant` (permanent) and `transient` (computation hints).
- **Graph / DP / geometry / grid:** each has a dedicated trace state type and trace panel. Keep per-family visual language consistent across algorithms in that family.

## Commands

```bash
npm start                      # ng serve — http://localhost:4200
npm run build                  # production build
npm run build:dev              # dev build
npm run test:algorithms        # Vitest suite (algo layer)
npm run test:algorithms:watch  # watch mode
npm run verify                 # tests + prod build (use before claiming "done")
npm run i18n:extract           # sync PL/EN JSON from t(...) markers
npm run i18n:find              # locate key usages
```

CI: GitHub Actions, needs repo secret `FONTAWESOME_PACKAGE_TOKEN`.

## Branch & release flow

- `feature/*` — in-progress work. Current branch at time of writing: `feat/other-algorithms`.
- `main` — integration. Pushing to main does **not** deploy.
- `production` — Netlify deploys from here. Promote with `npm run deploy:production` (fast) or `npm run release:production` (verify-then-promote).
- Never force-push to `main` or `production`.

## Before claiming work is done

- `npm run verify` locally (tests + build) OR state explicitly that you skipped it and why.
- For any UI change: open the affected view in the dev server, check 360 / 768 / 1280 widths, keyboard focus path, `prefers-reduced-motion` (DevTools rendering tab).
- If you changed user-visible strings: `npm run i18n:extract` and update both `pl.json` and `en.json`.

## Proactive reminders (MUST emit when applicable)

The user has a standing preference: **you are responsible for remembering to flag the design-reviewer agent** at the right moments, because the user may forget. When any of the triggers below fires, emit the reminder in the final user-facing message of your turn, **in ALL CAPS, on its own line, between two horizontal rule separators so it's impossible to miss.**

Reminder text to use verbatim:

```
---
🔎 PRZYPOMNIENIE: TA ZMIANA DOTKNĘŁA UI/WIZUALIZACJI. ZANIM ZROBISZ COMMIT, ROZWAŻ WYWOŁANIE AGENTA **ohno-design-reviewer** ABY ZROBIŁ AUDYT ZMIAN PRZECIW REGUŁOM DESIGN SYSTEMU.
---
```

**Emit the reminder when your task changed ANY of:**

- any file under [src/app/features/algorithms/components/](src/app/features/algorithms/components/) — visualizations, code-panel, log-panel, legend-bar, visualization-toolbar, viz-options-menu, trace panels.
- [src/styles.scss](src/styles.scss) — token additions, repoints, or structural changes.
- any `.scss` file anywhere in `src/app/` (component styles, chrome, shell, navbar, sidebar).
- any `.html` template that added/moved interactive UI (buttons, inputs, controls, icon-buttons, menus).
- any new Angular `@Component` that renders UI (not pure services / pipes / utilities).
- [src/app/core/layout/](src/app/core/layout/) — shell, navbar, sidebar, language switcher.
- [src/app/shared/components/](src/app/shared/components/) — reusable UI primitives.

**Do NOT emit the reminder when** your task touched **only**:
- algorithm logic under [src/app/features/algorithms/algorithms/](src/app/features/algorithms/algorithms/) (pure `*.ts` generators + their `*.spec.ts`), with no component/SCSS changes.
- test files, config files, docs, `proj-info/`, `.github/`, build scripts.
- i18n JSON (`public/i18n/*.json`) without any template/component change.
- memory files, `.claude/**/*.md`, `CLAUDE.md` itself.

**When the reminder fires, place it AFTER your summary of what was done and BEFORE any follow-up suggestions.** Never silently skip it because "the change was small" — small changes are exactly where regressions hide.

If the user invokes the reviewer explicitly in the same turn, don't emit the reminder — it's redundant.

## Deep-dive skills (in `.claude/skills/`)

Invoke the matching skill via `Skill` when the task fits — each is scoped to one concern and pulls detailed patterns + code references on demand:

- **ohno-visualization-anatomy** — scaffolding a new viz (D3+Anime, `VisualizationRenderer`, state-style record).
- **ohno-algorithm-step-generator** — writing a `Generator<SortStep>`: phases, descriptions, code-line sync, `withScratchpad` pairing.
- **ohno-design-tokens** — token catalog + when to add a new one.
- **ohno-scratchpad-narrative** — chalkboard scenes for pure-math algorithms.
- **ohno-motion-and-a11y** — durations, easings, reduced-motion gate, focus, aria-live.
- **ohno-i18n-discipline** — `t()` / `TranslatableText` / `i18nText` / key structure.
- **ohno-ux-principles** — creative/aesthetic direction for this app.
- **ohno-viz-polish-checklist** — final pass before calling a viz "done".

And the review agent: **ohno-design-reviewer** (in `.claude/agents/`) — read-only audit of changed viz/UI code against the rules above.
