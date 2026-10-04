# Ohno — Claude Code guide

Ohno is an Angular 21 playground for algorithm & data-structure visualizations. Dark, editorial, educational. Custom UI — **no Tailwind, no Angular Material, no Storybook, no NgModules.**

## Context hygiene (MUST do in long sessions)

This file stays loaded across a session, but in long multi-day conversations, rules can drift out of top-of-mind even when the text is still in context. To stay consistent:

- **Re-read this file (Read tool, full) at the START of every new logical task** — a new feature, a new algorithm, a new UI component, a non-trivial refactor, a resumption after a long break in an unrelated area. Cost is ~300 tokens; benefit is a re-anchored rulebook. Do this even if you "remember" the rules — memory drifts, the file doesn't.
- **Re-read the relevant skill (`.claude/skills/ohno-*/SKILL.md`) when its trigger fires.** Don't rely on recall — the skill's detailed patterns are what keep new code shaped like the existing codebase.
- **If you catch yourself uncertain about a specific rule** (e.g., "signals or `@Input()`?", "where do tokens live?", "is there a reduced-motion helper?") — don't guess. Open this file or the relevant skill. The 2-second re-read beats shipping a regression.
- **Before emitting the design-reviewer reminder** (see "Proactive reminders" below), re-read that section to match the exact format.
- **When the user returns after a break** and the prior conversation is very long, treat the first new request as a new task and re-read this file upfront.

This is belt-and-suspenders on top of Claude Code's existing context handling. Overhead is small; consistency gain is big.

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
- Fonts (self-hosted via `@fontsource-variable`, listed in `angular.json` `styles`): **Instrument Sans** (`--font-ui`, all UI text), **Doto** ROND 100 / weight 900 (`--font-dot`, numbers, complexity notation and the marquee only — never sentences, never below 14px), **Geist Mono** (`--font-mono`, engravings, code, registers, tape). Sora, IBM Plex Mono, Newsreader and Caveat are gone; KaTeX keeps its own fonts.

Node `^20.19.0 || ^22.12.0`, npm `>=10`.

## Top-level layout

- [src/app/core/](src/app/core/) — shell (`core/layout/shell`), bank sidebar (`core/layout/bank-sidebar`), command palette (`core/layout/command-palette`, mounted once in `App` so ⌘K / `/` / `?` work on every route), routing, i18n, `NavigationService` (`core/services`, algorithms groups + `?category`/`?subcategory` sync), `RecentAlgorithmsStore` (`core/recent`, localStorage `ohno:recent:v1`).
- [src/app/shared/](src/app/shared/) — reusable primitives: `math-text/`, `code-highlight.service.ts`, `difficulty-theme.ts`, `category-theme.ts`, directives, pipes, generic controls.
- [src/app/features/algorithms/](src/app/features/algorithms/) — the heart:
  - `algorithms/` — pure algorithm generators (one file or folder per algorithm).
  - `models/` — `sort-step.ts` and per-family trace state types (graph, dp, scratchpad-lab, number-lab, …).
  - `components/` — visualization components, per-family trace panels and scene primitives (`code-panel`, `visualization-canvas`, `info-panel`, `scratchpad-lab-visualization`, `bar-chart-visualization`, `notebook-register-rack`, `geo-canvas`, …). Variant labels, randomize labels and legend labels in `algorithm-detail-config.ts` are `I18N_KEY` references (`features.algorithms.toolbar.variants|actions.*`, `workbench.legend.*`), never English strings.
  - `data/catalog/` — algorithm catalog metadata.
  - `registry/` — lookup service.
  - `workbench/` — the algorithm route (`app-workbench`): `PlaybackController` (per-workbench service over `VisualizationEngine`: history, cursor, step events, recent-store writes on pause/complete/leave), `workbench-topbar/`, `stage-head/`, `stage-screen/` (meters + canvas + op-line + aria-live), `legend-row/`, `transport-deck/` (+ `custom-values-form/`), `inspector/` (Kod / Info / Ślad tabs, code language menu, copy key), `trace-host/` (the family trace-panel switch), `log-printer/` (tape, export, filter), pure `utils/*.utils.ts` with Vitest specs (step events, tape rows, stage readouts, keyboard map, sentence markup, scenarios). `algorithm-detail/algorithm-detail-config/` keeps the per-algorithm view configs.
  - `algorithms-page/` (catalog: marquee, tools, starter path, groups, deferred grid), `module-card/` (card + 8 family previews), `algorithm-traits/` — UI shells.
- [src/styles.scss](src/styles.scss) — the global entry: loads `src/styles/_instrument-tokens.scss` (the token catalog, single source of truth for color, radius, motion, elevation, typography, focus), `_display.scss` (emits the global tone scope) and `_base.scss`.
- [public/i18n/](public/i18n/) — `pl.json`, `en.json`.
- [proj-info/](proj-info/) — brief, todos, navbar & shader-card explorations, logo archive, mockup HTMLs. Useful as design reference; not shipped.

## Hard rules (non-negotiable)

1. **No comments in code.** Well-named identifiers do the explaining. If you feel a comment is needed, rename the symbol instead. The only exception: a WHY-comment for a non-obvious invariant/workaround/browser quirk.
2. **No hex literals in component SCSS.** Always reference tokens from `src/styles/_instrument-tokens.scss` via `var(--token)` or `rgb(var(--token-rgb) / α)`. If a shade you need is missing, add a token first.
3. **Standalone + OnPush, always.** Every `@Component` declares `standalone: true` (Angular 21 default) and `changeDetection: ChangeDetectionStrategy.OnPush`. No NgModules.
4. **Signal inputs only.** Use `input()` / `input.required()` / `input<T>(default)`. Never `@Input()`. Outputs via `output<T>()`.
5. **`inject()` only.** No constructor-parameter injection. Inside components use field initializers: `private readonly foo = inject(FooService);`.
6. **New control flow only.** `@if / @for / @switch`. No `*ngIf`, `*ngFor`, `*ngSwitch`.
7. **Reactivity via signals, `computed()`, `effect()`.** RxJS is kept for Transloco interop and a few existing services; prefer signals for new code.
8. **i18n through `t()` marker + `TranslatableText`.** Never hardcode user-visible strings. See [src/app/core/i18n/translatable-text.ts](src/app/core/i18n/translatable-text.ts) and the `i18nText(key, params)` helper.
9. **File layout per component:** `name.ts` + `name.html` + `name.scss` (separate files, `templateUrl` / `styleUrl`). Colocated spec: `name.spec.ts` only for algorithm layer.
10. **`prefers-reduced-motion` must be honored in any animated viz.** Use `prefersReducedMotion()` from `utils/visualization-motion/`.

## Design system — Instrument (`src/styles/`)

The app is being rebuilt as **Instrument** — an analog test bench: graphite plates, inset black screens with a dot texture, raised keys, one orange action colour, Doto readouts. Spec: [docs/superpowers/specs/2026-09-30-instrument-redesign-design.md](docs/superpowers/specs/2026-09-30-instrument-redesign-design.md); reference images in [docs/redesign-instrument/](docs/redesign-instrument/) are a 1:1 contract.

**Token catalog:** [src/styles/_instrument-tokens.scss](src/styles/_instrument-tokens.scss) — the single source of truth (materials `--desk`/`--plate-*`/`--key-*`/`--screen`/`--paper`, ink ramp `--ink` … `--ink-4`, `--signal` orange, state colours `--cyan`/`--pink`/`--lime`/`--slate` aliased as `--viz-state-compare`/`-swap`/`-sorted`/`-default`, `--amber`/`--red`/`--violet`/`--easy`, difficulty, fonts, radii, motion, gradients, shadow recipes, screen texture, focus ring, z-index). Every colour has an `-rgb` twin; components use only `var(--x)` or `rgb(var(--x-rgb) / a)` — the comma form `rgba(var(--x-rgb), a)` is forbidden. Full catalog with roles: the `ohno-design-tokens` skill.

**Base rules:** [src/styles/_base.scss](src/styles/_base.scss) — reset, desk background with SVG noise (`app-root::before`), global `:focus-visible { box-shadow: var(--focus-ring) }` (orange), reduced-motion kill switch, keyframes. There is no brand rail, aurora, glass, film grain on content or grid canvas any more.

**Display language:** [src/styles/_display.scss](src/styles/_display.scss) holds the mixins every family display shares (`layout`, `cell`, `chip`, `note`, `node`, `edge`, `svg-chip`, `tape`, `tape-cell`, `graticule`, `point`, `bracket`, `cursor-label`, …). Tones go through `data-tone` (`cyan` attending, `pink` acting, `lime` settled, `violet` source, `amber` hint, `red` conflict, `slate` idle, `signal`): `styles.scss` emits `display.tone-scope` once, which maps each named `[data-tone]` onto the non-inheriting `--tone-pick`/`--tone-pick-rgb`, and `@include display.tone-vars` on an element turns that into `--tone`/`--tone-rgb` (falling back to `--ink-2` / white). Never re-emit per-tone selector blocks in a component.

The pre-redesign compatibility aliases (`--surface-*`, `--text-*`, `--accent*`, `--chrome-*`, `--viz-accent`/`--viz-warning`/…, `--elevation-*`, `--ring-focus`, …) are gone; only Instrument tokens exist.

**Primitives:** [src/app/shared/instrument/](src/app/shared/instrument/) — `ohno-plate`, `ohno-screen`, `ohno-engraving`, `ohno-led`, `ohno-kbd`, `ohno-readout`, `ohno-meter`, `ohno-key`, `ohno-latch`, `ohno-knob`, `ohno-window-stepper`, `ohno-slot`, `ohno-gauge`, `ohno-opline`, `ohno-rack`, `ohno-rack-row`, `ohno-tape`, `ohno-floating-plate`, `ohno-menu`, `ohno-search-field`, `ohno-lang-toggle`, `ohno-brand`, and for the Ślad tab the trace primitives in `shared/instrument/trace/` — `ohno-trace-facts` (rack of label/value rows), `ohno-trace-chips` (mono chips with tones) and `ohno-trace-table` (screen table) — which every family trace panel is built from. Reach for one before styling a `div`. They are all rendered on the dev-only specimen route `/dev/instrument` (`canMatch: isDevMode()`, absent from production builds) — extend that page whenever you add a primitive.

**Display readiness:** `data/catalog/display-readiness/display-readiness.ts` lists the visualization variants rebuilt in the Instrument dot language (`REBUILT_DISPLAY_VARIANTS`) and the module ids still waiting for a display (`PENDING_DISPLAY_IDS`, empty since Phase 4); `isDisplayReady(id)` greys pending modules out on the catalog and module cards, and the spec keeps both lists in step with each config's default variant. A new view joins the first list when its display is finished.

**Catalog data derived at runtime:** module ids (`data/catalog/module-id`, `SRT-01`… from catalog order), preview families (`data/catalog/preview-family`), starter paths (`data/catalog/paths/paths.ts`), difficulty latches (`data/catalog/difficulty-filter`); module descriptions live in `public/i18n/*.json` under `features.algorithms.catalog.modules.<id>.description` (PL source of truth: `docs/superpowers/plans/module-descriptions.pl.json`).

**Workbench keyboard map (spec 3.5):** `Space` play/pause/restart, `←`/`→` step, `R` reset, `[`/`]` tempo, `C`/`I`/`T` inspector tabs, `L` focus the log; resolved by `workbench/utils/workbench-keys.utils.ts` on `document:keydown`, silent while the palette is open, inside text fields, and (for Space/arrows) on a focused key or range. The op-line sentence is mirrored into an `aria-live="polite"` region throttled to one announcement per 400ms during playback. Code screens use the Shiki theme in `src/app/shared/instrument-code-theme.ts`, which maps scopes onto the `--code-*` tokens.

**Depth and motion:** shadows are tokens (`--shadow-plate`, `--shadow-key`, `--shadow-key-in`, `--shadow-screen`, …) — never hand-roll them; nothing lifts on hover. Durations `--duration-instant` 90ms (key press), `-fast` 150ms, `-base` 220ms, `-slow` 360ms, `--duration-pulse` 2.4s; easings `--ease-out-quart`, `--ease-out-expo`, `--ease-soft`.

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
- **Number-theory / pure-math (Euclidean GCD, Extended Euclidean, …):** notebook display via `scratchpad-lab-visualization` (register rack, numbered derivation lines, phase dividers, margins rack); UI font for narrative chrome, KaTeX / mono for math bodies. Line types `goal | rule | equations | substitute | decision | result`, phaseLabel tones `setup | compute | substitute | decide | complete`, margin annotations split into `invariant` (permanent) and `transient` (computation hints).
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

- `feature/*` / `feat/*` — in-progress work.
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

- any file under [src/app/features/algorithms/components/](src/app/features/algorithms/components/) — visualizations, code-panel, info-panel, trace panels, scene primitives.
- [src/styles.scss](src/styles.scss) or anything under `src/styles/` — token additions, repoints, display mixins, or structural changes.
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
