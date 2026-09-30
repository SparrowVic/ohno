# Instrument Redesign — Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Ohno's design-token catalog and fonts with the Instrument system, ship the shared display primitives under `src/app/shared/instrument/`, and expose them on a dev-only specimen route, while every existing screen keeps building and rendering through a compatibility alias layer.

**Architecture:** `src/styles.scss` becomes a thin entry that imports fonts and three partials: `_instrument-tokens.scss` (the new catalog), `_compat-tokens.scss` (every old token name aliased onto the new palette so untouched components keep working until Phase 5 removes them) and `_base.scss` (resets, desk background, focus ring, reduced-motion kill switch). Primitives are standalone OnPush Angular components with signal inputs; any non-trivial logic lives in colocated `*.utils.ts` files with Vitest specs, and the components themselves are verified visually on the `/dev/instrument` specimen route, which only matches in `isDevMode()`.

**Tech Stack:** Angular 21.2 (standalone, signals, `@if/@for`), TypeScript 5.9 strict, SCSS, `@fontsource-variable/{instrument-sans,doto,geist-mono}`, `@fortawesome/angular-fontawesome` for key icons, Vitest 4 + jsdom for utils, headless Google Chrome for screenshots.

**Spec:** `docs/superpowers/specs/2026-09-30-instrument-redesign-design.md` (sections 3 "Design language", 5.1 "Tokens", 5.2 "Primitives", 6 phase 1). Reference images: `docs/redesign-instrument/01-instrument-katalog.webp` and `02-instrument-ekran-algorytmu.webp`; mockup CSS with the exact values: `proj-info/redesign/instrument/instrument.css` and `detail.css` (git-ignored, on this machine).

## Global Constraints

- Angular 21.2.x: every component is standalone (default) with `changeDetection: ChangeDetectionStrategy.OnPush`, signal inputs (`input()`, `input.required()`), `output()`, `inject()` only, `@if / @for / @switch` only. Files: `name.ts` + `name.html` + `name.scss`, one folder per component.
- New primitives use the class prefix `Ohno` and selector prefix `ohno-` (e.g. `OhnoKey`, `ohno-key`); their SCSS uses only `var(--token)` or `rgb(var(--token-rgb) / α)`. No hex literals in component SCSS; the form `rgba(var(--x-rgb), α)` is forbidden everywhere.
- No comments in code except a WHY-comment for a non-obvious workaround.
- No user-visible literal strings in components: primitives receive labels through inputs. The dev-only specimen page is the one documented exception (it never ships).
- Doto is used only for numbers, complexity notation and one-word marquee text; never below 14px.
- `prefers-reduced-motion: reduce` disables pulses and transitions (global kill switch in `_base.scss`).
- After every task: `npm run test:algorithms` passes, `npm run build` succeeds (budget *warnings* are acceptable; errors are not), the specimen route renders, then commit. Commit titles are short imperatives without prefixes (repo style), and every commit message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Never commit `proj-info/` (git-ignored) and never touch `src/app/features/algorithms/algorithms/**` in this phase.

## Review Focus

1. **Knob keyboard use** — ArrowUp/ArrowRight/ArrowDown/ArrowLeft on the focused knob change the value by 1 and never leave `[min, max]`; a person expects the value to stop at 10, not wrap to 1. Pinned by `knob.utils.spec.ts` (`clampKnobValue`) in Task 6.
2. **Size stepper at the ends** — pressing `+` on the largest allowed size keeps the value; pressing `−` on the smallest keeps it; no wrap-around, no `undefined`. Pinned by `window-stepper.utils.spec.ts` in Task 7.
3. **Slot with zero steps** — an algorithm whose run has 0 or 1 steps must not produce `NaN%` or a cap outside the slot. Pinned by `slot.utils.spec.ts` (`slotPercent(0, 0)` → 0) in Task 7.
4. **Gauge with more lit than count** — `lit > count` (e.g. the settled counter over-reports) must render `count` LEDs, all lit, not throw. Pinned by `gauge.utils.spec.ts` in Task 7.
5. **Tape with no current row** — a log whose newest entry is a separator or an empty list must render the header without scrolling errors. Pinned by `tape.utils.spec.ts` (`currentTapeIndex`) in Task 9.

---

### Task 1: Self-hosted fonts

**Files:**
- Modify: `package.json` (dependencies), `package-lock.json` (via npm)
- Modify: `angular.json:32-34` (the build `styles` array)
- Modify: `src/styles.scss:1-2` (remove the katex and Google Fonts `@import`s)

**Interfaces:**
- Produces: CSS font families `'Instrument Sans Variable'`, `'Doto Variable'`, `'Geist Mono Variable'` available app-wide (Task 2 references them in `--font-ui`, `--font-dot`, `--font-mono`).

The plain CSS files go into the `angular.json` `styles` array rather than Sass `@import`s, because Sass requires `@use` (which Task 2 introduces) to precede every other rule, and CSS `@import`s emitted after the token rules would be ignored by browsers.

- [ ] **Step 1: Install the three packages**

```bash
cd /Users/witek/repos/ohno && npm install @fontsource-variable/instrument-sans@^5.3.0 @fontsource-variable/doto@^5.3.0 @fontsource-variable/geist-mono@^5.3.0
```

Expected: `package.json` gains the three dependencies; `npm ci` remains reproducible (`package-lock.json` updated).

- [ ] **Step 2: Check which CSS entry points the packages ship**

```bash
ls node_modules/@fontsource-variable/instrument-sans/*.css node_modules/@fontsource-variable/doto/*.css node_modules/@fontsource-variable/geist-mono/*.css
```

Expected: each package has `index.css` and `wght.css`; Doto also has `full.css` (both `ROND` and `wght` axes). If `full.css` is missing for Doto, use `index.css` and remove the `font-variation-settings: 'ROND' 100` declarations from Task 2's `_instrument-tokens.scss` (the dots render square instead of round — acceptable, note it in the commit).

- [ ] **Step 3: Move the CSS imports into `angular.json` and drop Google Fonts**

In `angular.json`, replace the build `styles` array (line 32) with:

```json
            "styles": [
              "node_modules/katex/dist/katex.min.css",
              "node_modules/@fontsource-variable/instrument-sans/wght.css",
              "node_modules/@fontsource-variable/doto/full.css",
              "node_modules/@fontsource-variable/geist-mono/wght.css",
              "src/styles.scss"
            ],
```

In `src/styles.scss`, delete lines 1–2 (the `@import 'katex/dist/katex.min.css';` line and the `@import url('https://fonts.googleapis.com/…')` line). The file now starts with `:root {`.

- [ ] **Step 4: Verify the fonts are bundled and KaTeX still renders**

```bash
npm run build 2>&1 | tail -20 && ls dist/ohno/browser/media | grep -i -E "instrument|doto|geist|katex" | head -8
```

Expected: build succeeds; the media folder contains `.woff2` files for the three families and the KaTeX fonts. Then start the dev server if it is not running (`npm start`), open `http://localhost:4200/algorithms/euclidean-gcd` (a scratchpad algorithm with KaTeX) and in DevTools > Network confirm the formulas render and no request goes to `fonts.googleapis.com`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json angular.json src/styles.scss
git commit -m "$(cat <<'EOF'
Self-host Instrument Sans, Doto and Geist Mono

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Instrument token catalog, compatibility aliases and base rules

**Files:**
- Create: `src/styles/_instrument-tokens.scss`
- Create: `src/styles/_compat-tokens.scss`
- Create: `src/styles/_base.scss`
- Modify: `src/styles.scss` (replace everything below the imports)

**Interfaces:**
- Produces: the CSS custom properties listed in Step 1 (used by every later task), the shadow recipes `--shadow-plate`, `--shadow-key`, `--shadow-key-in`, `--shadow-key-signal`, `--shadow-screen`, the focus ring `--focus-ring`, the fonts `--font-ui`, `--font-dot`, `--font-mono`.
- Consumes: fonts from Task 1.

- [ ] **Step 1: Write the new token catalog**

Create `src/styles/_instrument-tokens.scss`:

```scss
:root {
  color-scheme: dark;

  --white-rgb: 255 255 255;
  --black-rgb: 0 0 0;

  --desk: #0b0c0e;
  --desk-rgb: 11 12 14;
  --plate-hi: #25272c;
  --plate-hi-rgb: 37 39 44;
  --plate-lo: #1a1c20;
  --plate-lo-rgb: 26 28 32;
  --key-hi: #2e3137;
  --key-hi-rgb: 46 49 55;
  --key-lo: #202227;
  --key-lo-rgb: 32 34 39;
  --screen: #060708;
  --screen-rgb: 6 7 8;
  --paper: #ebe6d9;
  --paper-rgb: 235 230 217;
  --paper-ink: #2a2620;
  --paper-ink-rgb: 42 38 32;
  --led-off: #292b30;
  --led-off-rgb: 41 43 48;
  --desk-halo-warm: #212328;
  --desk-halo-cool: #17181c;

  --ink: #f0efea;
  --ink-rgb: 240 239 234;
  --ink-2: #b9b8b2;
  --ink-2-rgb: 185 184 178;
  --ink-3: #82827d;
  --ink-3-rgb: 130 130 125;
  --ink-4: #56575b;
  --ink-4-rgb: 86 87 91;

  --signal: #ff5a1f;
  --signal-rgb: 255 90 31;
  --signal-deep: #a83a10;
  --cyan: #4ce3ff;
  --cyan-rgb: 76 227 255;
  --pink: #ff5fa8;
  --pink-rgb: 255 95 168;
  --lime: #c7e56a;
  --lime-rgb: 199 229 106;
  --amber: #ffb224;
  --amber-rgb: 255 178 36;
  --red: #ff6257;
  --red-rgb: 255 98 87;
  --violet: #a992ff;
  --violet-rgb: 169 146 255;
  --slate: #7d8696;
  --slate-rgb: 125 134 150;
  --easy: #7fe08a;
  --easy-rgb: 127 224 138;

  --viz-state-default: var(--slate);
  --viz-state-default-rgb: var(--slate-rgb);
  --viz-state-compare: var(--cyan);
  --viz-state-compare-rgb: var(--cyan-rgb);
  --viz-state-swap: var(--pink);
  --viz-state-swap-rgb: var(--pink-rgb);
  --viz-state-sorted: var(--lime);
  --viz-state-sorted-rgb: var(--lime-rgb);

  --difficulty-easy: var(--easy);
  --difficulty-easy-rgb: var(--easy-rgb);
  --difficulty-medium: var(--amber);
  --difficulty-medium-rgb: var(--amber-rgb);
  --difficulty-hard: var(--signal);
  --difficulty-hard-rgb: var(--signal-rgb);
  --difficulty-ultra-hard: var(--red);
  --difficulty-ultra-hard-rgb: var(--red-rgb);

  --font-ui: 'Instrument Sans Variable', system-ui, sans-serif;
  --font-dot: 'Doto Variable', ui-monospace, monospace;
  --font-mono: 'Geist Mono Variable', ui-monospace, monospace;
  --dot-settings: 'ROND' 100;

  --radius-kbd: 5px;
  --radius-sm: 7px;
  --radius-md: 10px;
  --radius-key: 12px;
  --radius-led-chip: 13px;
  --radius-screen: 14px;
  --radius-key-lg: 15px;
  --radius-card: 18px;
  --radius-key-xl: 18px;
  --radius-plate: 20px;

  --ease-out-quart: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-soft: cubic-bezier(0.4, 0.2, 0.2, 1);
  --duration-instant: 90ms;
  --duration-fast: 150ms;
  --duration-base: 220ms;
  --duration-slow: 360ms;
  --duration-pulse: 2400ms;

  --gradient-plate: linear-gradient(150deg, var(--plate-hi), var(--plate-lo) 62%);
  --gradient-plate-hover: linear-gradient(150deg, #2b2d33, #1e2024 62%);
  --gradient-key: linear-gradient(150deg, var(--key-hi), var(--key-lo));
  --gradient-key-in: linear-gradient(150deg, #15161a, #1d1f23);
  --gradient-key-signal: linear-gradient(150deg, #ff8548, #ef470a);
  --gradient-paper: linear-gradient(180deg, #d6d1c3 0%, #ebe6d9 9%, #efeadf 72%, #ddd8ca 100%);
  --gradient-sheen: linear-gradient(118deg, rgb(var(--white-rgb) / 0.04) 0%, rgb(var(--white-rgb) / 0) 26%);

  --shadow-plate:
    -6px -6px 16px rgb(var(--white-rgb) / 0.028),
    10px 12px 26px rgb(var(--black-rgb) / 0.62),
    inset 1px 1px 0 rgb(var(--white-rgb) / 0.075),
    inset -1px -1px 0 rgb(var(--black-rgb) / 0.45);
  --shadow-plate-hover:
    -6px -6px 16px rgb(var(--white-rgb) / 0.035),
    12px 16px 30px rgb(var(--black-rgb) / 0.7),
    inset 1px 1px 0 rgb(var(--white-rgb) / 0.11),
    inset -1px -1px 0 rgb(var(--black-rgb) / 0.45),
    0 0 0 1px rgb(var(--signal-rgb) / 0.35);
  --shadow-screen:
    inset 0 0 0 1px rgb(var(--black-rgb) / 0.9),
    inset 4px 5px 12px rgb(var(--black-rgb) / 0.95),
    0 1px 0 rgb(var(--white-rgb) / 0.07),
    0 -1px 0 rgb(var(--black-rgb) / 0.55);
  --shadow-key:
    -3px -3px 8px rgb(var(--white-rgb) / 0.035),
    5px 6px 12px rgb(var(--black-rgb) / 0.6),
    inset 1px 1px 0 rgb(var(--white-rgb) / 0.1),
    inset -1px -1px 0 rgb(var(--black-rgb) / 0.4);
  --shadow-key-in:
    inset 3px 3px 8px rgb(var(--black-rgb) / 0.78),
    inset -1px -1px 0 rgb(var(--white-rgb) / 0.055);
  --shadow-key-signal:
    -3px -3px 8px rgb(var(--white-rgb) / 0.03),
    6px 8px 16px rgb(var(--black-rgb) / 0.6),
    0 0 30px rgb(var(--signal-rgb) / 0.24),
    inset 1px 1px 0 rgb(var(--white-rgb) / 0.42),
    inset -1px -2px 0 rgb(120 30 0 / 0.45);
  --shadow-window:
    inset 2px 2px 6px rgb(var(--black-rgb) / 0.8),
    inset -1px -1px 0 rgb(var(--white-rgb) / 0.05);
  --shadow-cap:
    4px 6px 10px rgb(var(--black-rgb) / 0.7),
    inset 1px 1px 0 rgb(var(--white-rgb) / 0.16);
  --shadow-knob:
    -4px -4px 10px rgb(var(--white-rgb) / 0.04),
    6px 8px 16px rgb(var(--black-rgb) / 0.72),
    inset 0 1px 0 rgb(var(--white-rgb) / 0.14);
  --shadow-paper: 0 8px 10px rgb(var(--black-rgb) / 0.5);

  --screen-dots: radial-gradient(rgb(var(--white-rgb) / 0.04) 1px, transparent 1.25px);
  --screen-dot-size: 6px;
  --groove: rgb(var(--black-rgb) / 0.55);
  --groove-highlight: rgb(var(--white-rgb) / 0.05);
  --hairline: rgb(var(--white-rgb) / 0.09);
  --engraving-shadow: 0 1px 0 rgb(var(--black-rgb) / 0.7);

  --focus-ring: 0 0 0 2px var(--signal), 0 0 0 6px rgb(var(--signal-rgb) / 0.22);

  --z-menu: 40;
  --z-popover: 60;
  --z-toast: 80;
}
```

- [ ] **Step 2: Write the compatibility aliases**

Create `src/styles/_compat-tokens.scss` (every name that existed in the old `:root`; removed in Phase 5):

```scss
:root {
  --app-bg: var(--desk);
  --app-bg-rgb: var(--desk-rgb);
  --surface-0: var(--desk);
  --surface-1: var(--plate-lo);
  --surface-2: var(--plate-hi);
  --surface-3: var(--key-lo);
  --surface-4: var(--key-hi);
  --surface-inset: var(--screen);
  --glass-base-rgb: var(--plate-lo-rgb);
  --surface: var(--plate-lo);
  --surface-raised: var(--plate-hi);
  --surface-hover: var(--key-hi);
  --surface-strong: var(--key-hi);
  --surface-soft: rgb(var(--lime-rgb) / 0.08);
  --panel-bg: var(--plate-lo);
  --panel-bg-strong: var(--plate-hi);
  --card-bg: var(--plate-hi);
  --chrome-navbar-bg: var(--plate-lo);
  --chrome-sidebar-bg: var(--desk);
  --chrome-veil: rgb(var(--white-rgb) / 0.032);
  --chrome-veil-strong: rgb(var(--white-rgb) / 0.06);
  --chrome-line: rgb(var(--white-rgb) / 0.09);
  --chrome-line-strong: rgb(var(--white-rgb) / 0.16);
  --border: rgb(var(--white-rgb) / 0.1);
  --border-hover: rgb(var(--white-rgb) / 0.18);
  --border-strong: rgb(var(--white-rgb) / 0.24);
  --border-brand: rgb(var(--signal-rgb) / 0.34);
  --text-primary: var(--ink);
  --text-secondary: var(--ink-2);
  --text-tertiary: var(--ink-3);
  --text-quaternary: var(--ink-4);
  --accent: var(--lime);
  --accent-rgb: var(--lime-rgb);
  --accent-strong: var(--lime);
  --accent-ink: var(--ink);
  --accent-dim: rgb(var(--lime-rgb) / 0.16);
  --accent-glow: rgb(var(--lime-rgb) / 0.28);
  --accent-soft: rgb(var(--lime-rgb) / 0.1);
  --chrome-accent: var(--violet);
  --chrome-accent-rgb: var(--violet-rgb);
  --chrome-accent-strong: var(--ink);
  --chrome-accent-ink: var(--ink);
  --chrome-accent-alt: var(--cyan);
  --chrome-accent-alt-rgb: var(--cyan-rgb);
  --chrome-accent-alt-strong: var(--ink);
  --chrome-accent-warm: var(--pink);
  --chrome-accent-warm-rgb: var(--pink-rgb);
  --brand-gradient: linear-gradient(135deg, var(--violet) 0%, var(--cyan) 55%, var(--lime) 100%);
  --brand-gradient-soft: linear-gradient(135deg, rgb(var(--violet-rgb) / 0.22) 0%, rgb(var(--cyan-rgb) / 0.2) 55%, rgb(var(--lime-rgb) / 0.22) 100%);
  --brand-gradient-faint: linear-gradient(135deg, rgb(var(--violet-rgb) / 0.1) 0%, rgb(var(--cyan-rgb) / 0.08) 55%, rgb(var(--lime-rgb) / 0.1) 100%);
  --brand-aurora: none;
  --viz-accent: var(--slate);
  --viz-accent-rgb: var(--slate-rgb);
  --viz-accent-ink: var(--ink-2);
  --viz-window: var(--violet);
  --viz-window-rgb: var(--violet-rgb);
  --viz-window-ink: var(--ink);
  --viz-warning: var(--amber);
  --viz-warning-rgb: var(--amber-rgb);
  --viz-warning-ink: var(--ink);
  --viz-success: var(--lime);
  --viz-success-rgb: var(--lime-rgb);
  --viz-success-ink: var(--ink);
  --viz-route: var(--cyan);
  --viz-route-rgb: var(--cyan-rgb);
  --viz-route-ink: var(--ink);
  --viz-danger: var(--red);
  --viz-danger-rgb: var(--red-rgb);
  --viz-danger-ink: var(--ink);
  --viz-hit: var(--amber);
  --viz-hit-rgb: var(--amber-rgb);
  --viz-hit-ink: var(--ink);
  --viz-ember: var(--signal);
  --viz-ember-rgb: var(--signal-rgb);
  --viz-ember-ink: var(--ink);
  --easy-bg: rgb(var(--easy-rgb) / 0.13);
  --medium: var(--amber);
  --medium-rgb: var(--amber-rgb);
  --medium-bg: rgb(var(--amber-rgb) / 0.13);
  --hard: var(--signal);
  --hard-rgb: var(--signal-rgb);
  --hard-bg: rgb(var(--signal-rgb) / 0.13);
  --ultra-hard: var(--red);
  --ultra-hard-rgb: var(--red-rgb);
  --ultra-hard-bg: rgb(var(--red-rgb) / 0.15);
  --code-bg: var(--screen);
  --line-highlight: rgb(var(--signal-rgb) / 0.12);
  --compare-color: var(--viz-state-compare);
  --swap-color: var(--viz-state-swap);
  --sorted-color: var(--viz-state-sorted);
  --elevation-0: none;
  --elevation-1: var(--shadow-plate);
  --elevation-2: var(--shadow-plate);
  --elevation-3: var(--shadow-plate);
  --elevation-4: var(--shadow-plate);
  --panel-shadow: var(--shadow-plate);
  --panel-shadow-soft: var(--shadow-plate);
  --ring-focus: var(--focus-ring);
  --ring-focus-soft: 0 0 0 1px rgb(var(--signal-rgb) / 0.4);
  --panel-shell-bg: var(--plate-lo);
  --panel-shell-border: rgb(var(--white-rgb) / 0.075);
  --panel-shell-shadow: var(--shadow-plate);
  --panel-shell-radius: var(--radius-plate);
  --panel-topbar-height: 56px;
  --panel-topbar-padding-inline: 10px;
  --panel-topbar-divider: var(--groove);
  --panel-topbar-bg: var(--plate-hi);
  --control-height: 40px;
  --control-height-sm: 32px;
  --control-icon-size: 40px;
  --control-radius: var(--radius-key);
  --control-radius-sm: var(--radius-md);
  --control-padding-inline: 12px;
  --font-sans: var(--font-ui);
  --font-notebook: var(--font-ui);
  --radius-lg: var(--radius-screen);
  --radius-xl: var(--radius-card);
  --radius-2xl: var(--radius-plate);
  --radius-3xl: var(--radius-plate);
  --ease-spring: var(--ease-out-quart);
  --duration-entrance: var(--duration-slow);
  --app-grid-line-alpha: 0;
  --app-grid-major-line-alpha: 0;
  --app-grid-accent-line-alpha: 0;
  --app-grid-dot-alpha: 0;
}
```

- [ ] **Step 3: Write the base rules**

Create `src/styles/_base.scss`:

```scss
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  background: var(--desk);
}

body {
  color: var(--ink);
  font-family: var(--font-ui);
  font-size: 14px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

app-root {
  position: relative;
  isolation: isolate;
  display: block;
  min-height: 100%;
  background:
    radial-gradient(1100px 620px at 16% -12%, var(--desk-halo-warm) 0%, transparent 70%),
    radial-gradient(900px 600px at 105% 110%, var(--desk-halo-cool) 0%, transparent 70%),
    var(--desk);
}

app-root::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .16 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>");
}

app-root > * {
  position: relative;
  z-index: 1;
}

button {
  font-family: inherit;
  color: inherit;
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

ohno-opline em {
  font-style: normal;
  color: var(--opline-color);
}

::selection {
  background: rgb(var(--signal-rgb) / 0.35);
  color: var(--ink);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgb(var(--white-rgb) / 0.12);
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--signal-rgb) / 0.5);
  background-clip: padding-box;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@keyframes ohno-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes ohno-fade-scale {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes ohno-led-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@keyframes ohno-tape-feed {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
```

- [ ] **Step 4: Rewrite `src/styles.scss`**

Replace the whole file with:

```scss
@use './styles/instrument-tokens';
@use './styles/compat-tokens';
@use './styles/base';
```

- [ ] **Step 5: Carry over the old keyframes, registered properties and token names that are still referenced**

```bash
for k in $(git show HEAD:src/styles.scss | grep -oE '@keyframes [A-Za-z0-9_-]+|@property --[a-z0-9-]+' | awk '{print $2}'); do n=$(grep -rl --include=*.scss --include=*.ts --include=*.html -- "$k" src/app | wc -l | tr -d ' '); echo "$k $n"; done
```

The old file declares `brand-angle-spin`, `brand-shimmer-slide`, `brand-text-flow`, `hero-float`, `hero-orbit`, `live-pulse`, `ohno-fade-in`, `ohno-fade-scale`, `ohno-fade-up`, `ohno-ring-pulse`, `ohno-shimmer`, `roadmap-seal-rotate` and the `@property` rules for `--brand-angle` and `--shimmer-pos`. For every name the loop prints with a count above 0 that `_base.scss` does not already define, copy its block verbatim from `git show HEAD:src/styles.scss` to the end of `_base.scss` (Phase 5 deletes them with the components that use them).

```bash
git show HEAD:src/styles.scss | grep -oE '^\s*--[a-z0-9-]+' | tr -d ' ' | sort -u > "$SCRATCH/old-tokens.txt"; cat src/styles/_instrument-tokens.scss src/styles/_compat-tokens.scss | grep -oE '^\s*--[a-z0-9-]+' | tr -d ' ' | sort -u > "$SCRATCH/new-tokens.txt"; comm -23 "$SCRATCH/old-tokens.txt" "$SCRATCH/new-tokens.txt"
```

(`SCRATCH` is any scratch directory, e.g. `SCRATCH=$(mktemp -d)`.) The old file declares 144 names. Expected: empty output. Every name printed is an old token without an alias: add `--<name>: <closest new token>;` to `_compat-tokens.scss` (surfaces → plate/key/screen tokens, text → ink ramp, colours → the semantic colour with the same role, sizes → the nearest new size) and re-run until the output is empty. Finally `grep -rn "viz-flow" src/app` must print nothing.

- [ ] **Step 6: Build and look**

```bash
npm run build 2>&1 | grep -E "ERROR|error|Application bundle generation complete" | head
```

Expected: `Application bundle generation complete`, no `ERROR`. Open `http://localhost:4200/algorithms` and `http://localhost:4200/algorithms/bubble-sort` in the browser: the app renders in the new palette (graphite surfaces, orange focus ring when tabbing) with the old layouts; nothing is invisible.

- [ ] **Step 7: Commit**

```bash
git add src/styles.scss src/styles/_instrument-tokens.scss src/styles/_compat-tokens.scss src/styles/_base.scss
git commit -m "$(cat <<'EOF'
Replace design tokens with the Instrument catalog

Old token names stay as aliases onto the new palette until Phase 5.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Display atoms and the specimen route

**Files:**
- Create: `src/app/shared/instrument/plate/plate.ts`, `plate.html`, `plate.scss`
- Create: `src/app/shared/instrument/screen/screen.ts`, `screen.html`, `screen.scss`
- Create: `src/app/shared/instrument/engraving/engraving.ts`, `engraving.html`, `engraving.scss`
- Create: `src/app/shared/instrument/led/led.ts`, `led.html`, `led.scss`, `led.types.ts`
- Create: `src/app/shared/instrument/kbd/kbd.ts`, `kbd.html`, `kbd.scss`
- Create: `src/app/dev/instrument-specimen/instrument-specimen.ts`, `.html`, `.scss`
- Create: `tools/screenshot.mjs`
- Modify: `src/app/app.routes.ts` (add the dev route)

**Interfaces:**
- Produces: `OhnoPlate` (`ohno-plate`, inputs `screws: boolean`, `padding: 'none' | 'sm' | 'md'`), `OhnoScreen` (`ohno-screen`, inputs `dots: boolean`, `padding: 'none' | 'sm' | 'md'`), `OhnoEngraving` (`ohno-engraving`, input `tone: EngravingTone`), `OhnoLed` (`ohno-led`, inputs `color: LedColor`, `on: boolean`, `pulse: boolean`, `size: 'sm' | 'md'`), `OhnoKbd` (`ohno-kbd`), the type `LedColor = 'signal' | 'cyan' | 'pink' | 'lime' | 'amber' | 'red' | 'violet' | 'slate' | 'easy'`, and the specimen page every later task extends.

- [ ] **Step 1: Create the LED types**

`src/app/shared/instrument/led/led.types.ts`:

```ts
export type LedColor =
  | 'signal'
  | 'cyan'
  | 'pink'
  | 'lime'
  | 'amber'
  | 'red'
  | 'violet'
  | 'slate'
  | 'easy';

export const LED_COLOR_TOKENS: Readonly<Record<LedColor, string>> = {
  signal: 'var(--signal)',
  cyan: 'var(--cyan)',
  pink: 'var(--pink)',
  lime: 'var(--lime)',
  amber: 'var(--amber)',
  red: 'var(--red)',
  violet: 'var(--violet)',
  slate: 'var(--slate)',
  easy: 'var(--easy)',
};

export const LED_COLOR_RGB_TOKENS: Readonly<Record<LedColor, string>> = {
  signal: 'var(--signal-rgb)',
  cyan: 'var(--cyan-rgb)',
  pink: 'var(--pink-rgb)',
  lime: 'var(--lime-rgb)',
  amber: 'var(--amber-rgb)',
  red: 'var(--red-rgb)',
  violet: 'var(--violet-rgb)',
  slate: 'var(--slate-rgb)',
  easy: 'var(--easy-rgb)',
};
```

- [ ] **Step 2: Create `OhnoLed`**

`led.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { LED_COLOR_RGB_TOKENS, LED_COLOR_TOKENS, LedColor } from './led.types';

@Component({
  selector: 'ohno-led',
  templateUrl: './led.html',
  styleUrl: './led.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ohno-led--on]': 'on()',
    '[class.ohno-led--pulse]': 'pulse()',
    '[class.ohno-led--sm]': "size() === 'sm'",
    '[style.--led-color]': 'colorToken()',
    '[style.--led-color-rgb]': 'colorRgbToken()',
    'aria-hidden': 'true',
  },
})
export class OhnoLed {
  readonly color = input<LedColor>('signal');
  readonly on = input(true);
  readonly pulse = input(false);
  readonly size = input<'sm' | 'md'>('md');

  protected readonly colorToken = computed(() => LED_COLOR_TOKENS[this.color()]);
  protected readonly colorRgbToken = computed(() => LED_COLOR_RGB_TOKENS[this.color()]);
}
```

`led.html`:

```html
<i class="ohno-led__dot"></i>
```

`led.scss`:

```scss
:host {
  display: inline-block;
  flex: none;
  width: 7px;
  height: 7px;
}

:host(.ohno-led--sm) {
  width: 5px;
  height: 5px;
}

.ohno-led__dot {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--led-off);
  box-shadow:
    inset 0 1px 1px rgb(var(--black-rgb) / 0.8),
    0 1px 0 rgb(var(--white-rgb) / 0.06);
  transition: background var(--duration-fast) var(--ease-soft), box-shadow var(--duration-fast) var(--ease-soft);
}

:host(.ohno-led--on) .ohno-led__dot {
  background: var(--led-color);
  box-shadow:
    0 0 0 1px rgb(var(--black-rgb) / 0.35),
    0 0 7px var(--led-color),
    0 0 16px rgb(var(--led-color-rgb) / 0.45);
}

:host(.ohno-led--on.ohno-led--pulse) .ohno-led__dot {
  animation: ohno-led-pulse var(--duration-pulse) ease-in-out infinite;
}
```

- [ ] **Step 3: Create `OhnoEngraving`**

`engraving.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type EngravingTone = 'default' | 'bright' | 'dim' | 'signal' | 'cyan' | 'pink' | 'lime' | 'amber';

@Component({
  selector: 'ohno-engraving',
  templateUrl: './engraving.html',
  styleUrl: './engraving.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
  },
})
export class OhnoEngraving {
  readonly tone = input<EngravingTone>('default');
}
```

`engraving.html`:

```html
<ng-content />
```

`engraving.scss`:

```scss
:host {
  display: inline-block;
  font: 500 9.5px/1 var(--font-mono);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-3);
  text-shadow: var(--engraving-shadow);
  white-space: nowrap;
}

:host([data-tone='bright']) { color: var(--ink-2); }
:host([data-tone='dim']) { color: var(--ink-4); }
:host([data-tone='signal']) { color: var(--signal); }
:host([data-tone='cyan']) { color: var(--cyan); }
:host([data-tone='pink']) { color: var(--pink); }
:host([data-tone='lime']) { color: var(--lime); }
:host([data-tone='amber']) { color: var(--amber); }
```

- [ ] **Step 4: Create `OhnoPlate` and `OhnoScreen`**

`plate.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PlatePadding = 'none' | 'sm' | 'md';

@Component({
  selector: 'ohno-plate',
  templateUrl: './plate.html',
  styleUrl: './plate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-padding]': 'padding()',
  },
})
export class OhnoPlate {
  readonly screws = input(false);
  readonly padding = input<PlatePadding>('md');
}
```

`plate.html`:

```html
@if (screws()) {
  <i class="ohno-plate__screw ohno-plate__screw--tl" aria-hidden="true"></i>
  <i class="ohno-plate__screw ohno-plate__screw--tr" aria-hidden="true"></i>
  <i class="ohno-plate__screw ohno-plate__screw--bl" aria-hidden="true"></i>
  <i class="ohno-plate__screw ohno-plate__screw--br" aria-hidden="true"></i>
}
<ng-content />
```

`plate.scss`:

```scss
:host {
  position: relative;
  display: block;
  border-radius: var(--radius-plate);
  background: var(--gradient-plate);
  box-shadow: var(--shadow-plate);
}

:host([data-padding='sm']) { padding: 12px 14px; }
:host([data-padding='md']) { padding: 16px 18px; }

.ohno-plate__screw {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--key-hi), var(--screen) 72%);
  box-shadow:
    inset 0 0 0 1px rgb(var(--black-rgb) / 0.6),
    0 1px 0 rgb(var(--white-rgb) / 0.06);
}

.ohno-plate__screw::after {
  content: '';
  position: absolute;
  left: 1.5px;
  right: 1.5px;
  top: 4px;
  height: 1px;
  background: rgb(var(--black-rgb) / 0.8);
  transform: rotate(var(--screw-angle, 35deg));
}

.ohno-plate__screw--tl { left: 9px; top: 9px; }
.ohno-plate__screw--tr { right: 9px; top: 9px; --screw-angle: -20deg; }
.ohno-plate__screw--bl { left: 9px; bottom: 9px; --screw-angle: 70deg; }
.ohno-plate__screw--br { right: 9px; bottom: 9px; --screw-angle: 10deg; }
```

`screen.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PlatePadding } from '../plate/plate';

@Component({
  selector: 'ohno-screen',
  templateUrl: './screen.html',
  styleUrl: './screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-padding]': 'padding()',
    '[class.ohno-screen--dots]': 'dots()',
  },
})
export class OhnoScreen {
  readonly dots = input(true);
  readonly padding = input<PlatePadding>('none');
}
```

`screen.html`:

```html
<ng-content />
```

`screen.scss`:

```scss
:host {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: var(--radius-screen);
  background: var(--screen);
  box-shadow: var(--shadow-screen);
}

:host([data-padding='sm']) { padding: 10px 12px; }
:host([data-padding='md']) { padding: 18px 26px; }

:host::before,
:host::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

:host(.ohno-screen--dots)::before {
  background-image: var(--screen-dots);
  background-size: var(--screen-dot-size) var(--screen-dot-size);
}

:host::after {
  background: var(--gradient-sheen);
}
```

- [ ] **Step 5: Create `OhnoKbd`**

`kbd.ts`:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ohno-kbd',
  templateUrl: './kbd.html',
  styleUrl: './kbd.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoKbd {}
```

`kbd.html`:

```html
<kbd class="ohno-kbd__cap"><ng-content /></kbd>
```

`kbd.scss`:

```scss
:host {
  display: inline-block;
}

.ohno-kbd__cap {
  display: inline-block;
  min-width: 17px;
  padding: 2px 5px 3px;
  border-radius: var(--radius-kbd);
  font: 500 9.5px/1 var(--font-mono);
  color: var(--ink-3);
  text-align: center;
  background: var(--screen);
  box-shadow:
    inset 0 0 0 1px rgb(var(--white-rgb) / 0.07),
    0 1px 0 rgb(var(--black-rgb) / 0.6);
}
```

- [ ] **Step 6: Create the specimen page**

`src/app/dev/instrument-specimen/instrument-specimen.ts`:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { OhnoEngraving } from '../../shared/instrument/engraving/engraving';
import { OhnoKbd } from '../../shared/instrument/kbd/kbd';
import { OhnoLed } from '../../shared/instrument/led/led';
import { LedColor } from '../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../shared/instrument/plate/plate';
import { OhnoScreen } from '../../shared/instrument/screen/screen';

// Dev-only specimen sheet: literal Polish labels are intentional, it never ships.
@Component({
  selector: 'app-instrument-specimen',
  imports: [OhnoPlate, OhnoScreen, OhnoEngraving, OhnoLed, OhnoKbd],
  templateUrl: './instrument-specimen.html',
  styleUrl: './instrument-specimen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentSpecimen {
  protected readonly ledColors: readonly LedColor[] = [
    'signal', 'cyan', 'pink', 'lime', 'amber', 'red', 'violet', 'slate', 'easy',
  ];
}
```

`instrument-specimen.html`:

```html
<div class="specimen">
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Atomy · płyta, ekran, grawer, LED, kbd</ohno-engraving>
    <div class="specimen__row">
      @for (color of ledColors; track color) {
        <span class="specimen__led">
          <ohno-led [color]="color" />
          <ohno-engraving tone="dim">{{ color }}</ohno-engraving>
        </span>
      }
      <span class="specimen__led"><ohno-led [on]="false" /><ohno-engraving tone="dim">off</ohno-engraving></span>
      <span class="specimen__led"><ohno-led color="lime" [pulse]="true" /><ohno-engraving tone="dim">pulse</ohno-engraving></span>
    </div>
    <div class="specimen__row">
      <ohno-engraving>default</ohno-engraving>
      <ohno-engraving tone="bright">bright</ohno-engraving>
      <ohno-engraving tone="dim">dim</ohno-engraving>
      <ohno-engraving tone="signal">signal</ohno-engraving>
      <ohno-engraving tone="cyan">cyan</ohno-engraving>
      <ohno-engraving tone="pink">pink</ohno-engraving>
      <ohno-engraving tone="lime">lime</ohno-engraving>
      <ohno-engraving tone="amber">amber</ohno-engraving>
      <ohno-kbd>Spacja</ohno-kbd><ohno-kbd>←</ohno-kbd><ohno-kbd>⌘K</ohno-kbd>
    </div>
    <ohno-screen class="specimen__screen" padding="md">
      <span class="specimen__dot-text">066<small>/196</small></span>
      <p class="specimen__copy">Ekran z kropkową teksturą, tekst UI w Instrument Sans, liczby w Doto.</p>
    </ohno-screen>
  </ohno-plate>
</div>
```

`instrument-specimen.scss`:

```scss
:host {
  display: block;
  min-height: 100dvh;
  padding: 24px;
}

.specimen {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.specimen__unit {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.specimen__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.specimen__led {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.specimen__screen {
  min-height: 140px;
}

.specimen__dot-text {
  font: 900 50px/0.8 var(--font-dot);
  font-variation-settings: var(--dot-settings);
  color: var(--signal);
  text-shadow: 0 0 18px rgb(var(--signal-rgb) / 0.45);
}

.specimen__dot-text small {
  font-size: 24px;
  color: rgb(var(--signal-rgb) / 0.45);
}

.specimen__copy {
  margin-top: 14px;
  color: var(--ink-2);
}
```

- [ ] **Step 7: Register the dev-only route**

In `src/app/app.routes.ts`, add `isDevMode` to the `@angular/core` import and insert this route object as the first element of `routes` (before `algorithms/:id`):

```ts
  {
    path: 'dev/instrument',
    canMatch: [() => isDevMode()],
    loadComponent: () =>
      import('./dev/instrument-specimen/instrument-specimen').then((m) => m.InstrumentSpecimen),
  },
```

- [ ] **Step 8: Create the screenshot helper**

`tools/screenshot.mjs`:

```js
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const [url, out, width = '1440', height = '900', scale = '1'] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node tools/screenshot.mjs <url> <out.png> [width] [height] [scale]');
  process.exit(1);
}
const chrome = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const result = spawnSync(chrome, [
  '--headless=new',
  '--hide-scrollbars',
  `--window-size=${width},${height}`,
  `--force-device-scale-factor=${scale}`,
  '--virtual-time-budget=6000',
  `--screenshot=${resolve(out)}`,
  url,
], { stdio: 'ignore' });
process.exit(result.status ?? 1);
```

Usage: `node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/specimen.png`.

- [ ] **Step 9: Build, run, screenshot**

```bash
npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && mkdir -p proj-info/shots && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task3-specimen.png
```

Expected: build completes; the screenshot shows a graphite plate with four screws, nine coloured LEDs plus an off and a pulsing one, engravings in eight tones, three kbd chips and a black dotted screen with an orange Doto counter. Then confirm the route is unreachable in production: `npx -y serve -s dist/ohno/browser -l 5050` and open `http://localhost:5050/dev/instrument` — `canMatch` fails because `isDevMode()` is false, the `**` route redirects to `/algorithms`. Stop the server afterwards.

- [ ] **Step 10: Commit**

```bash
git add src/app/shared/instrument src/app/dev src/app/app.routes.ts tools/screenshot.mjs
git commit -m "$(cat <<'EOF'
Add Instrument display atoms and a dev specimen route

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Readout and Meter

**Files:**
- Create: `src/app/shared/instrument/readout/readout.ts`, `readout.html`, `readout.scss`, `readout.utils.ts`, `readout.utils.spec.ts`
- Create: `src/app/shared/instrument/meter/meter.ts`, `meter.html`, `meter.scss`
- Modify: `src/app/dev/instrument-specimen/instrument-specimen.ts`, `.html`

**Interfaces:**
- Produces: `formatReadout(value: number | string, pad: number): string`, `OhnoReadout` (`ohno-readout`, inputs `value`, `total`, `pad`, `size: ReadoutSize = 'sm' | 'md' | 'lg' | 'xl' | 'marquee'` → 15 / 22 / 30 / 50 / 58 px, `tone: ReadoutTone`), `OhnoMeter` (`ohno-meter`, inputs `label`, `value`, `total`, `pad`, `main`).

- [ ] **Step 1: Write the failing utils spec**

`readout.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { formatReadout } from './readout.utils';

describe('formatReadout', () => {
  it('zero-pads numbers to the requested width', () => {
    expect(formatReadout(66, 3)).toBe('066');
    expect(formatReadout(3, 2)).toBe('03');
  });

  it('never truncates numbers wider than the pad', () => {
    expect(formatReadout(1234, 3)).toBe('1234');
  });

  it('leaves strings untouched', () => {
    expect(formatReadout('O(n log n)', 3)).toBe('O(n log n)');
    expect(formatReadout('∞', 2)).toBe('∞');
  });

  it('pads nothing when pad is 0', () => {
    expect(formatReadout(7, 0)).toBe('7');
  });
});
```

- [ ] **Step 2: Run the spec to see it fail**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/readout`
Expected: FAIL — cannot find module `./readout.utils`.

- [ ] **Step 3: Implement the util**

`readout.utils.ts`:

```ts
export function formatReadout(value: number | string, pad: number): string {
  if (typeof value === 'string') return value;
  const digits = String(Math.trunc(Math.abs(value)));
  const sign = value < 0 ? '-' : '';
  return sign + digits.padStart(pad, '0');
}
```

- [ ] **Step 4: Run the spec to see it pass**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/readout`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `OhnoReadout`**

`readout.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { formatReadout } from './readout.utils';

export type ReadoutSize = 'sm' | 'md' | 'lg' | 'xl' | 'marquee';
export type ReadoutTone = 'ink' | 'signal' | 'cyan' | 'lime' | 'pink' | 'amber' | 'dim';

@Component({
  selector: 'ohno-readout',
  templateUrl: './readout.html',
  styleUrl: './readout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
  },
})
export class OhnoReadout {
  readonly value = input.required<number | string>();
  readonly total = input<number | string | null>(null);
  readonly pad = input(0);
  readonly size = input<ReadoutSize>('md');
  readonly tone = input<ReadoutTone>('ink');

  protected readonly text = computed(() => formatReadout(this.value(), this.pad()));
  protected readonly totalText = computed(() => {
    const total = this.total();
    return total === null ? null : formatReadout(total, 0);
  });
}
```

`readout.html`:

```html
<span class="ohno-readout__value">{{ text() }}</span>
@if (totalText(); as total) {
  <small class="ohno-readout__total">/{{ total }}</small>
}
```

`readout.scss`:

```scss
:host {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  font-family: var(--font-dot);
  font-weight: 900;
  font-variation-settings: var(--dot-settings);
  letter-spacing: 0.02em;
  line-height: 0.8;
  color: var(--ink);
  white-space: nowrap;
}

:host([data-size='sm']) { font-size: 15px; }
:host([data-size='md']) { font-size: 22px; }
:host([data-size='lg']) { font-size: 30px; }
:host([data-size='xl']) { font-size: 50px; }
:host([data-size='marquee']) { font-size: 58px; }

.ohno-readout__total {
  font-size: 0.56em;
  font-weight: 800;
  color: var(--ink-4);
}

:host([data-tone='signal']) { color: var(--signal); text-shadow: 0 0 18px rgb(var(--signal-rgb) / 0.45); }
:host([data-tone='signal']) .ohno-readout__total { color: rgb(var(--signal-rgb) / 0.45); text-shadow: none; }
:host([data-tone='cyan']) { color: var(--cyan); text-shadow: 0 0 12px rgb(var(--cyan-rgb) / 0.55); }
:host([data-tone='lime']) { color: var(--lime); text-shadow: 0 0 10px rgb(var(--lime-rgb) / 0.4); }
:host([data-tone='pink']) { color: var(--pink); text-shadow: 0 0 12px rgb(var(--pink-rgb) / 0.5); }
:host([data-tone='amber']) { color: var(--amber); }
:host([data-tone='dim']) { color: var(--ink-3); }
```

- [ ] **Step 6: Create `OhnoMeter`**

`meter.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';
import { OhnoReadout } from '../readout/readout';

@Component({
  selector: 'ohno-meter',
  imports: [OhnoEngraving, OhnoReadout],
  templateUrl: './meter.html',
  styleUrl: './meter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ohno-meter--main]': 'main()',
  },
})
export class OhnoMeter {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly total = input<number | string | null>(null);
  readonly pad = input(0);
  readonly main = input(false);
}
```

`meter.html`:

```html
<ohno-engraving>{{ label() }}</ohno-engraving>
<ohno-readout
  [value]="value()"
  [total]="total()"
  [pad]="pad()"
  [size]="main() ? 'xl' : 'lg'"
  [tone]="main() ? 'signal' : 'ink'"
/>
```

`meter.scss`:

```scss
:host {
  display: inline-flex;
  flex-direction: column;
  gap: 9px;
  align-items: flex-start;
}
```

- [ ] **Step 7: Extend the specimen**

Add `OhnoReadout` and `OhnoMeter` to the specimen `imports` and append inside `.specimen` after the first plate:

```html
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Odczyty i mierniki</ohno-engraving>
    <ohno-screen padding="md">
      <div class="specimen__row specimen__row--meters">
        <ohno-meter label="Krok" [value]="66" [total]="196" [pad]="3" [main]="true" />
        <ohno-meter label="Przebieg" [value]="3" [total]="15" [pad]="2" />
        <ohno-meter label="Porównania" [value]="35" [pad]="3" />
        <ohno-meter label="Zamiany" [value]="28" [pad]="3" />
      </div>
      <div class="specimen__row">
        <ohno-readout [value]="'O(n log n)'" size="sm" />
        <ohno-readout [value]="13" size="md" tone="cyan" />
        <ohno-readout [value]="105" size="lg" tone="lime" />
        <ohno-readout [value]="'∞'" size="md" tone="dim" />
        <ohno-readout [value]="412" size="lg" tone="pink" />
      </div>
    </ohno-screen>
  </ohno-plate>
```

and to `instrument-specimen.scss`:

```scss
.specimen__row--meters {
  align-items: flex-end;
  gap: 34px;
  margin-bottom: 18px;
}
```

- [ ] **Step 8: Verify**

```bash
npm run test:algorithms 2>&1 | tail -5 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task4-specimen.png
```

Expected: tests pass; build completes; the screenshot shows the meters row exactly like the top of the stage in image 02 (orange `066/196`, three white counters).

- [ ] **Step 9: Commit**

```bash
git add src/app/shared/instrument/readout src/app/shared/instrument/meter src/app/dev
git commit -m "$(cat <<'EOF'
Add Doto readout and meter primitives

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Key and latch

**Files:**
- Create: `src/app/shared/instrument/key/key.ts`, `key.html`, `key.scss`
- Create: `src/app/shared/instrument/latch/latch.ts`, `latch.html`, `latch.scss`
- Modify: `src/app/dev/instrument-specimen/instrument-specimen.ts`, `.html`

**Interfaces:**
- Produces: `OhnoKey` (`ohno-key`) with inputs `label: string | null`, `ariaLabel: string | null`, `title: string | null`, `variant: KeyVariant = 'default' | 'in' | 'signal'`, `size: KeySize = 'sm' | 'md' | 'lg' | 'xl'` (34 / 40 / 56 / 70 px tall), `icon: IconDefinition | null`, `led: LedColor | null`, `ledOn: boolean`, `kbd: string | null` (shortcut chip at the right end), `pressed: boolean | null` (renders `aria-pressed`; `true` forces the `in` look), `disabled: boolean`, `menu: boolean` (adds `aria-haspopup="menu"`), `expanded: boolean | null`, `menuRole: 'menuitem' | 'menuitemradio' | null` and `checked: boolean | null` (for keys inside `OhnoMenu`), `type: 'button' | 'submit'`, `routerLink: string | unknown[] | null`, `queryParamsHandling`; output `keyClick: MouseEvent`. Parents size a key through the CSS custom properties `--key-width`, `--key-justify`, `--key-font` on the `ohno-key` element. Later phases replace every `app-button` with this.
- Produces: `OhnoLatch` (`ohno-latch`, inputs `label: string`, `led: LedColor = 'signal'`, `pressed: boolean` (required), `disabled`, `size: KeySize`; output `pressedChange: boolean`) — a key that toggles, used for the difficulty filters and every multi-select.

- [ ] **Step 1: Create `OhnoKey`**

`key.ts`:

```ts
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, type QueryParamsHandling } from '@angular/router';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { OhnoKbd } from '../kbd/kbd';
import { OhnoLed } from '../led/led';
import { LedColor } from '../led/led.types';

export type KeyVariant = 'default' | 'in' | 'signal';
export type KeySize = 'sm' | 'md' | 'lg' | 'xl';
export type KeyMenuRole = 'menuitem' | 'menuitemradio';

@Component({
  selector: 'ohno-key',
  imports: [FaIconComponent, NgTemplateOutlet, OhnoKbd, OhnoLed, RouterLink],
  templateUrl: './key.html',
  styleUrl: './key.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoKey {
  readonly label = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly title = input<string | null>(null);
  readonly variant = input<KeyVariant>('default');
  readonly size = input<KeySize>('md');
  readonly icon = input<IconDefinition | null>(null);
  readonly led = input<LedColor | null>(null);
  readonly ledOn = input(true);
  readonly kbd = input<string | null>(null);
  readonly pressed = input<boolean | null>(null);
  readonly disabled = input(false);
  readonly menu = input(false);
  readonly expanded = input<boolean | null>(null);
  readonly menuRole = input<KeyMenuRole | null>(null);
  readonly checked = input<boolean | null>(null);
  readonly type = input<'button' | 'submit'>('button');
  readonly routerLink = input<string | unknown[] | null>(null);
  readonly queryParamsHandling = input<QueryParamsHandling | null>(null);

  readonly keyClick = output<MouseEvent>();

  protected readonly effectiveVariant = computed<KeyVariant>(() =>
    this.pressed() === true && this.variant() === 'default' ? 'in' : this.variant(),
  );
  protected readonly iconOnly = computed(() => this.label() === null && this.icon() !== null);
  protected readonly titleText = computed(() => this.title() ?? this.ariaLabel() ?? this.label());

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.keyClick.emit(event);
  }
}
```

`key.html`:

```html
<ng-template #content>
  @if (led(); as ledColor) {
    <ohno-led class="ohno-key__led" [color]="ledColor" [on]="ledOn()" />
  }
  @if (icon(); as keyIcon) {
    <fa-icon class="ohno-key__icon" [icon]="keyIcon" />
  }
  @if (label(); as text) {
    <span class="ohno-key__label">{{ text }}</span>
  }
  @if (kbd(); as shortcut) {
    <ohno-kbd class="ohno-key__kbd">{{ shortcut }}</ohno-kbd>
  }
</ng-template>

@if (routerLink(); as link) {
  <a
    class="ohno-key"
    [class.ohno-key--icon-only]="iconOnly()"
    [attr.data-variant]="effectiveVariant()"
    [attr.data-size]="size()"
    [routerLink]="link"
    [queryParamsHandling]="queryParamsHandling()"
    [attr.aria-label]="ariaLabel()"
    [attr.title]="titleText()"
    [attr.aria-disabled]="disabled() ? 'true' : null"
    (click)="onClick($event)"
  >
    <ng-container [ngTemplateOutlet]="content" />
  </a>
} @else {
  <button
    class="ohno-key"
    [class.ohno-key--icon-only]="iconOnly()"
    [attr.data-variant]="effectiveVariant()"
    [attr.data-size]="size()"
    [type]="type()"
    [disabled]="disabled()"
    [attr.aria-label]="ariaLabel()"
    [attr.title]="titleText()"
    [attr.aria-pressed]="pressed()"
    [attr.aria-haspopup]="menu() ? 'menu' : null"
    [attr.aria-expanded]="expanded()"
    [attr.role]="menuRole()"
    [attr.aria-checked]="checked()"
    (click)="onClick($event)"
  >
    <ng-container [ngTemplateOutlet]="content" />
  </button>
}
```

`key.scss`:

```scss
:host {
  display: inline-block;
}

.ohno-key {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: var(--key-justify, center);
  gap: 8px;
  width: var(--key-width, auto);
  padding: 0 13px;
  border: 0;
  border-radius: var(--radius-key);
  color: var(--ink-2);
  font: var(--key-font, 600 12px/1 var(--font-ui));
  letter-spacing: 0.02em;
  white-space: nowrap;
  background: var(--gradient-key);
  box-shadow: var(--shadow-key);
  transition: box-shadow var(--duration-instant) var(--ease-soft), color var(--duration-fast) var(--ease-soft), filter var(--duration-fast) var(--ease-soft);
}

.ohno-key[data-size='sm'] { height: 34px; }
.ohno-key[data-size='md'] { height: 40px; }
.ohno-key[data-size='lg'] { height: 56px; border-radius: var(--radius-key-lg); }
.ohno-key[data-size='xl'] { height: 70px; padding: 0 20px; border-radius: var(--radius-key-xl); }

.ohno-key--icon-only { padding: 0; aspect-ratio: 1; }
.ohno-key--icon-only[data-size='xl'] { aspect-ratio: auto; width: 104px; }

.ohno-key:hover:not(:disabled) { color: var(--ink); filter: brightness(1.08); }
.ohno-key:active:not(:disabled),
.ohno-key[data-variant='in'] {
  color: var(--ink);
  background: var(--gradient-key-in);
  box-shadow: var(--shadow-key-in);
  filter: none;
}

.ohno-key[data-variant='signal'] {
  color: var(--paper-ink);
  background: var(--gradient-key-signal);
  box-shadow: var(--shadow-key-signal);
}

.ohno-key[data-variant='signal'] .ohno-key__icon { color: var(--paper-ink); }

.ohno-key:disabled,
.ohno-key[aria-disabled='true'] {
  color: var(--ink-4);
  cursor: not-allowed;
  filter: none;
}

.ohno-key:focus-visible {
  outline: none;
  box-shadow: var(--shadow-key), var(--focus-ring);
}

.ohno-key__icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  font-size: 16px;
}

.ohno-key[data-size='lg'] .ohno-key__icon { width: 20px; height: 20px; font-size: 18px; }
.ohno-key[data-size='xl'] .ohno-key__icon { width: 28px; height: 28px; font-size: 26px; }

.ohno-key__kbd { margin-left: 4px; }
```

- [ ] **Step 2: Create `OhnoLatch`**

`latch.ts`:

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { KeySize, OhnoKey } from '../key/key';
import { LedColor } from '../led/led.types';

@Component({
  selector: 'ohno-latch',
  imports: [OhnoKey],
  templateUrl: './latch.html',
  styleUrl: './latch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoLatch {
  readonly label = input.required<string>();
  readonly led = input<LedColor>('signal');
  readonly pressed = input.required<boolean>();
  readonly disabled = input(false);
  readonly size = input<KeySize>('md');

  readonly pressedChange = output<boolean>();
}
```

`latch.html`:

```html
<ohno-key
  [label]="label()"
  [led]="led()"
  [ledOn]="pressed()"
  [pressed]="pressed()"
  [disabled]="disabled()"
  [size]="size()"
  (keyClick)="pressedChange.emit(!pressed())"
/>
```

`latch.scss`:

```scss
:host {
  display: inline-block;
}
```

- [ ] **Step 3: Extend the specimen**

Add `OhnoKey`, `OhnoLatch` and the icons to the specimen (`import { faBackwardStep, faChevronLeft, faCopy, faForwardStep, faPlay, faRotateLeft } from '@fortawesome/pro-solid-svg-icons';` — the package the old toolbar uses) with the class fields

```ts
  protected readonly icons = {
    back: faChevronLeft,
    copy: faCopy,
    reset: faRotateLeft,
    previous: faBackwardStep,
    play: faPlay,
    next: faForwardStep,
  };
  protected readonly difficulties = signal<readonly { id: string; label: string; led: LedColor; on: boolean }[]>([
    { id: 'easy', label: 'Łatwe', led: 'easy', on: true },
    { id: 'medium', label: 'Średnie', led: 'amber', on: true },
    { id: 'hard', label: 'Trudne', led: 'signal', on: true },
    { id: 'ultra', label: 'Ekstremalne', led: 'red', on: false },
  ]);

  protected toggleDifficulty(id: string, on: boolean): void {
    this.difficulties.update((items) => items.map((item) => (item.id === id ? { ...item, on } : item)));
  }
```

(import `signal` from `@angular/core`) and append a plate:

```html
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Klawisze i zatrzaski</ohno-engraving>
    <div class="specimen__row">
      <ohno-key label="Katalog" [icon]="icons.back" size="sm" />
      <ohno-key label="Słupki" led="signal" [pressed]="true" />
      <ohno-key label="Bloki" led="signal" [ledOn]="false" [pressed]="false" />
      <ohno-key label="TS ▾" [menu]="true" [expanded]="false" />
      <ohno-key label="Log" kbd="L" />
      <ohno-key [icon]="icons.copy" ariaLabel="Kopiuj kod" size="sm" />
      <ohno-key label="Wyłączony" [disabled]="true" />
    </div>
    <div class="specimen__row">
      <ohno-key [icon]="icons.reset" ariaLabel="Reset" size="lg" />
      <ohno-key [icon]="icons.previous" ariaLabel="Poprzedni krok" size="lg" />
      <ohno-key [icon]="icons.play" ariaLabel="Uruchom" size="xl" variant="signal" />
      <ohno-key [icon]="icons.next" ariaLabel="Następny krok" size="lg" />
      <span class="specimen__hint"><ohno-kbd>Spacja</ohno-kbd><ohno-engraving>Start</ohno-engraving></span>
    </div>
    <div class="specimen__row">
      @for (difficulty of difficulties(); track difficulty.id) {
        <ohno-latch
          [label]="difficulty.label"
          [led]="difficulty.led"
          [pressed]="difficulty.on"
          size="sm"
          (pressedChange)="toggleDifficulty(difficulty.id, $event)"
        />
      }
    </div>
  </ohno-plate>
```

SCSS: `.specimen__hint { display: inline-flex; align-items: center; gap: 6px; }`.

- [ ] **Step 4: Verify**

```bash
npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task5-specimen.png
```

Expected: the key row matches the deck of image 02 (raised graphite keys, the pressed "Słupki" key inset with an orange LED, the orange play key 104×70 with glow) and the latch row matches the four difficulty latches of image 01 (three pressed with lit LEDs, "Ekstremalne" raised with a dark LED). In the browser: Tab through the keys — an orange ring appears; Space activates the focused key; clicking a latch toggles it and its `aria-pressed` attribute flips.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/instrument/key src/app/shared/instrument/latch src/app/dev
git commit -m "$(cat <<'EOF'
Add the Instrument key and latch primitives

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Knob

**Files:**
- Create: `src/app/shared/instrument/knob/knob.ts`, `knob.html`, `knob.scss`, `knob.utils.ts`, `knob.utils.spec.ts`
- Modify: specimen `.ts`, `.html`

**Interfaces:**
- Produces: `clampKnobValue(value, min, max): number`, `knobAngle(value, min, max): number` (−135…135), `knobTicks(min, max): readonly number[]`, `OhnoKnob` (`ohno-knob`, inputs `value: number` (required), `min = 1`, `max = 10`, `label: string` (required, used as `aria-label`), `readout: string | null`; output `valueChange: number`). Phase 3 binds it to the engine speed.

- [ ] **Step 1: Write the failing spec**

`knob.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { clampKnobValue, knobAngle, knobTicks, knobValueFromPointer } from './knob.utils';

describe('knob utils', () => {
  it('clamps to the range and rounds to integers', () => {
    expect(clampKnobValue(11, 1, 10)).toBe(10);
    expect(clampKnobValue(0, 1, 10)).toBe(1);
    expect(clampKnobValue(5.6, 1, 10)).toBe(6);
  });

  it('maps the range onto a 270-degree sweep', () => {
    expect(knobAngle(1, 1, 10)).toBe(-135);
    expect(knobAngle(10, 1, 10)).toBe(135);
    expect(knobAngle(5.5, 1, 10)).toBe(0);
  });

  it('lists one tick per integer value', () => {
    expect(knobTicks(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it('turns a vertical drag into a value change of one step per 24px', () => {
    expect(knobValueFromPointer(5, 24, 1, 10)).toBe(6);
    expect(knobValueFromPointer(5, -48, 1, 10)).toBe(3);
    expect(knobValueFromPointer(10, 240, 1, 10)).toBe(10);
  });
});
```

- [ ] **Step 2: Run the spec to see it fail**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/knob`
Expected: FAIL — cannot find module `./knob.utils`.

- [ ] **Step 3: Implement the utils**

`knob.utils.ts`:

```ts
const SWEEP_DEGREES = 270;
const PIXELS_PER_STEP = 24;

export function clampKnobValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function knobAngle(value: number, min: number, max: number): number {
  const ratio = max === min ? 0 : (value - min) / (max - min);
  return -SWEEP_DEGREES / 2 + ratio * SWEEP_DEGREES;
}

export function knobTicks(min: number, max: number): readonly number[] {
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

export function knobValueFromPointer(startValue: number, deltaY: number, min: number, max: number): number {
  return clampKnobValue(startValue + deltaY / PIXELS_PER_STEP, min, max);
}
```

- [ ] **Step 4: Run the spec to see it pass**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/knob`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `OhnoKnob`**

`knob.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { clampKnobValue, knobAngle, knobTicks, knobValueFromPointer } from './knob.utils';

@Component({
  selector: 'ohno-knob',
  templateUrl: './knob.html',
  styleUrl: './knob.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoKnob {
  readonly value = input.required<number>();
  readonly min = input(1);
  readonly max = input(10);
  readonly label = input.required<string>();
  readonly readout = input<string | null>(null);

  readonly valueChange = output<number>();

  protected readonly angle = computed(() => knobAngle(this.value(), this.min(), this.max()));
  protected readonly ticks = computed(() => knobTicks(this.min(), this.max()));
  protected readonly dragging = signal(false);

  private readonly rangeInput = viewChild.required<ElementRef<HTMLInputElement>>('rangeInput');
  private dragStartY = 0;
  private dragStartValue = 0;

  protected tickAngle(tick: number): string {
    return `${knobAngle(tick, this.min(), this.max())}deg`;
  }

  protected onInput(event: Event): void {
    const next = clampKnobValue(Number((event.target as HTMLInputElement).value), this.min(), this.max());
    this.valueChange.emit(next);
  }

  protected onPointerDown(event: PointerEvent): void {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.rangeInput().nativeElement.focus({ preventScroll: true });
    this.dragStartY = event.clientY;
    this.dragStartValue = this.value();
    this.dragging.set(true);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) return;
    const next = knobValueFromPointer(this.dragStartValue, this.dragStartY - event.clientY, this.min(), this.max());
    if (next !== this.value()) this.valueChange.emit(next);
  }

  protected onPointerUp(): void {
    this.dragging.set(false);
  }
}
```

`knob.html`:

```html
<div
  class="ohno-knob__dial"
  [class.ohno-knob__dial--dragging]="dragging()"
  (pointerdown)="onPointerDown($event)"
  (pointermove)="onPointerMove($event)"
  (pointerup)="onPointerUp()"
  (pointercancel)="onPointerUp()"
>
  @for (tick of ticks(); track tick; let index = $index) {
    <i
      class="ohno-knob__tick"
      [class.ohno-knob__tick--lit]="tick <= value()"
      [style.--tick-angle]="tickAngle(tick)"
      [style.--tick-index]="index"
      aria-hidden="true"
    ></i>
  }
  <div class="ohno-knob__cap" [style.--knob-angle]="angle() + 'deg'"></div>
  <input
    #rangeInput
    class="ohno-knob__input"
    type="range"
    [min]="min()"
    [max]="max()"
    [step]="1"
    [value]="value()"
    [attr.aria-label]="label()"
    [attr.aria-valuetext]="readout() ?? value()"
    (input)="onInput($event)"
  />
</div>
@if (readout(); as text) {
  <span class="ohno-knob__readout">{{ text }}</span>
}
```

`knob.scss`:

```scss
:host {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}

.ohno-knob__dial {
  position: relative;
  width: 84px;
  height: 84px;
  touch-action: none;
  cursor: grab;
}

.ohno-knob__dial--dragging { cursor: grabbing; }

.ohno-knob__tick {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2px;
  height: 6px;
  margin: -3px 0 0 -1px;
  border-radius: 1px;
  background: var(--ink-4);
  transform: rotate(var(--tick-angle)) translateY(-39px);
  transition: background var(--duration-fast) var(--ease-soft);
  transition-delay: calc(var(--tick-index) * 18ms);
}

.ohno-knob__tick--lit {
  background: var(--signal);
  box-shadow: 0 0 5px rgb(var(--signal-rgb) / 0.7);
}

.ohno-knob__cap {
  position: absolute;
  inset: 11px;
  border-radius: 50%;
  background: conic-gradient(from 20deg, var(--key-lo), var(--key-hi), var(--plate-lo), var(--key-hi), var(--key-lo));
  box-shadow: var(--shadow-knob);
}

.ohno-knob__cap::before {
  content: '';
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  background: var(--gradient-key);
  box-shadow: inset 1px 1px 0 rgb(var(--white-rgb) / 0.09);
}

.ohno-knob__cap::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 5px;
  width: 3px;
  height: 15px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: var(--signal);
  box-shadow: 0 0 6px rgb(var(--signal-rgb) / 0.7);
  transform-origin: 50% 26px;
  transform: rotate(var(--knob-angle));
  transition: transform var(--duration-base) var(--ease-out-quart);
}

.ohno-knob__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  pointer-events: none;
}

.ohno-knob__dial:has(.ohno-knob__input:focus-visible) .ohno-knob__cap {
  box-shadow: var(--shadow-knob), var(--focus-ring);
}

.ohno-knob__readout {
  font: 900 15px/1 var(--font-dot);
  font-variation-settings: var(--dot-settings);
  color: var(--ink);
}
```

- [ ] **Step 6: Extend the specimen**

Add a `speed = signal(5)` field to the specimen and this plate:

```html
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Tempo</ohno-engraving>
    <div class="specimen__row">
      <ohno-knob [value]="speed()" label="Tempo" [readout]="speed() + '×'" (valueChange)="speed.set($event)" />
      <ohno-engraving tone="dim">strzałki, przeciąganie w pionie, kółko nie</ohno-engraving>
    </div>
  </ohno-plate>
```

- [ ] **Step 7: Verify**

```bash
npm run test:algorithms 2>&1 | tail -5 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task6-specimen.png
```

Expected: tests pass; the knob renders like image 02 (ticks lit up to 5, orange pointer). In the browser: dragging the knob upward raises the readout to 10 and stops, and the ticks light one after another; a plain click on the dial does not change the value (the range input ignores pointer events, so no jump to the click position); Tab to the knob and press ArrowUp/ArrowDown — the pointer turns and the readout changes; at 10, ArrowUp does nothing.

- [ ] **Step 8: Commit**

```bash
git add src/app/shared/instrument/knob src/app/dev
git commit -m "$(cat <<'EOF'
Add the tempo knob primitive

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Window stepper, slot and gauge

**Files:**
- Create: `src/app/shared/instrument/window-stepper/window-stepper.ts`, `.html`, `.scss`, `window-stepper.utils.ts`, `window-stepper.utils.spec.ts`
- Create: `src/app/shared/instrument/slot/slot.ts`, `.html`, `.scss`, `slot.utils.ts`, `slot.utils.spec.ts`
- Create: `src/app/shared/instrument/gauge/gauge.ts`, `.html`, `.scss`, `gauge.utils.ts`, `gauge.utils.spec.ts`
- Modify: specimen `.ts`, `.html`

**Interfaces:**
- Produces: `stepOption(options, value, direction: -1 | 1): number`, `OhnoWindowStepper` (`ohno-window-stepper`, inputs `options: readonly number[]`, `value: number`, `label: string` (aria), `unitLabel: string | null`, `decreaseLabel: string`, `increaseLabel: string`; output `valueChange`); `slotPercent(step, total): number`, `slotMarks(total): readonly number[]`, `OhnoSlot` (`ohno-slot`, inputs `step`, `total`, `label`, `marks: readonly number[] | null`; output `stepChange`); `gaugeLeds(count, lit, done): readonly GaugeLed[]` with `GaugeLed = 'off' | 'lit' | 'done'`, `OhnoGauge` (`ohno-gauge`, inputs `label`, `count`, `lit`, `done`, `litColor: LedColor = 'signal'`, `doneColor: LedColor = 'lime'`).

- [ ] **Step 1: Write the three failing specs**

`window-stepper.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { stepOption } from './window-stepper.utils';

describe('stepOption', () => {
  const options = [16, 32, 64];

  it('moves to the neighbouring option', () => {
    expect(stepOption(options, 16, 1)).toBe(32);
    expect(stepOption(options, 64, -1)).toBe(32);
  });

  it('stays at the ends without wrapping', () => {
    expect(stepOption(options, 64, 1)).toBe(64);
    expect(stepOption(options, 16, -1)).toBe(16);
  });

  it('snaps an unknown value to the first option', () => {
    expect(stepOption(options, 20, 1)).toBe(16);
  });

  it('returns the value when there are no options', () => {
    expect(stepOption([], 7, 1)).toBe(7);
  });
});
```

`slot.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { slotMarks, slotPercent } from './slot.utils';

describe('slot utils', () => {
  it('maps the step onto a percentage', () => {
    expect(slotPercent(66, 196)).toBeCloseTo(33.67, 1);
    expect(slotPercent(196, 196)).toBe(100);
  });

  it('returns 0 for runs with no steps', () => {
    expect(slotPercent(0, 0)).toBe(0);
    expect(slotPercent(1, 0)).toBe(0);
  });

  it('never leaves the 0–100 range', () => {
    expect(slotPercent(300, 196)).toBe(100);
    expect(slotPercent(-3, 196)).toBe(0);
  });

  it('builds up to six evenly spaced marks ending at the total', () => {
    expect(slotMarks(196)).toEqual([0, 40, 80, 120, 160, 196]);
    expect(slotMarks(11)).toEqual([0, 2, 4, 6, 8, 11]);
    expect(slotMarks(0)).toEqual([0]);
  });
});
```

`gauge.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { gaugeLeds } from './gauge.utils';

describe('gaugeLeds', () => {
  it('lights the first lit LEDs and marks the done ones', () => {
    expect(gaugeLeds(5, 3, 2)).toEqual(['done', 'done', 'lit', 'off', 'off']);
  });

  it('clamps lit and done to the count', () => {
    expect(gaugeLeds(3, 9, 9)).toEqual(['done', 'done', 'done']);
  });

  it('handles a zero count', () => {
    expect(gaugeLeds(0, 2, 1)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the specs to see them fail**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument`
Expected: three FAIL groups — missing modules.

- [ ] **Step 3: Implement the utils**

`window-stepper.utils.ts`:

```ts
export function stepOption(options: readonly number[], value: number, direction: -1 | 1): number {
  if (options.length === 0) return value;
  const index = options.indexOf(value);
  if (index === -1) return options[0];
  const next = Math.min(options.length - 1, Math.max(0, index + direction));
  return options[next];
}
```

`slot.utils.ts`:

```ts
const MAX_MARKS = 5;

export function slotPercent(step: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (step / total) * 100));
}

export function slotMarks(total: number): readonly number[] {
  if (total <= 0) return [0];
  const stride = Math.max(1, Math.floor(total / MAX_MARKS));
  const marks: number[] = [];
  for (let mark = 0; mark < total; mark += stride) marks.push(mark);
  return [...marks.slice(0, MAX_MARKS), total];
}
```

`gauge.utils.ts`:

```ts
export type GaugeLed = 'off' | 'lit' | 'done';

export function gaugeLeds(count: number, lit: number, done: number): readonly GaugeLed[] {
  const safeCount = Math.max(0, count);
  const safeLit = Math.min(safeCount, Math.max(0, lit));
  const safeDone = Math.min(safeLit, Math.max(0, done));
  return Array.from({ length: safeCount }, (_, index) =>
    index < safeDone ? 'done' : index < safeLit ? 'lit' : 'off',
  );
}
```

- [ ] **Step 4: Run the specs to see them pass**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument`
Expected: PASS (all instrument specs, including Tasks 4 and 6).

- [ ] **Step 5: Create `OhnoWindowStepper`**

`window-stepper.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';
import { OhnoKey } from '../key/key';
import { OhnoReadout } from '../readout/readout';
import { OhnoScreen } from '../screen/screen';
import { stepOption } from './window-stepper.utils';

@Component({
  selector: 'ohno-window-stepper',
  imports: [OhnoEngraving, OhnoKey, OhnoReadout, OhnoScreen],
  templateUrl: './window-stepper.html',
  styleUrl: './window-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoWindowStepper {
  readonly options = input.required<readonly number[]>();
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly unitLabel = input<string | null>(null);
  readonly decreaseLabel = input.required<string>();
  readonly increaseLabel = input.required<string>();

  readonly valueChange = output<number>();

  protected readonly atStart = computed(() => stepOption(this.options(), this.value(), -1) === this.value());
  protected readonly atEnd = computed(() => stepOption(this.options(), this.value(), 1) === this.value());
  protected readonly minOption = computed(() => this.options()[0] ?? this.value());
  protected readonly maxOption = computed(() => this.options()[this.options().length - 1] ?? this.value());

  protected step(direction: -1 | 1, event?: Event): void {
    event?.preventDefault();
    const next = stepOption(this.options(), this.value(), direction);
    if (next !== this.value()) this.valueChange.emit(next);
  }
}
```

`window-stepper.html`:

```html
<ohno-screen
  class="ohno-window-stepper__window"
  role="spinbutton"
  tabindex="0"
  [attr.aria-label]="label()"
  [attr.aria-valuenow]="value()"
  [attr.aria-valuemin]="minOption()"
  [attr.aria-valuemax]="maxOption()"
  (keydown.arrowup)="step(1, $event)"
  (keydown.arrowright)="step(1, $event)"
  (keydown.arrowdown)="step(-1, $event)"
  (keydown.arrowleft)="step(-1, $event)"
>
  <ohno-readout [value]="value()" size="lg" />
</ohno-screen>
<div class="ohno-window-stepper__keys">
  <ohno-key label="−" [ariaLabel]="decreaseLabel()" size="sm" [disabled]="atStart()" (keyClick)="step(-1)" />
  <ohno-key label="+" [ariaLabel]="increaseLabel()" size="sm" [disabled]="atEnd()" (keyClick)="step(1)" />
</div>
@if (unitLabel(); as unit) {
  <ohno-engraving class="ohno-window-stepper__unit">{{ unit }}</ohno-engraving>
}
```

`window-stepper.scss`:

```scss
:host {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.ohno-window-stepper__window {
  width: 78px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
}

.ohno-window-stepper__window:focus-visible {
  box-shadow: var(--shadow-screen), var(--focus-ring);
}

.ohno-window-stepper__keys {
  display: flex;
  gap: 10px;
}

.ohno-window-stepper__keys ohno-key {
  --key-width: 34px;
  --key-font: 500 17px/1 var(--font-mono);
}
```

- [ ] **Step 6: Create `OhnoSlot`**

`slot.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { slotMarks, slotPercent } from './slot.utils';

@Component({
  selector: 'ohno-slot',
  templateUrl: './slot.html',
  styleUrl: './slot.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoSlot {
  readonly step = input.required<number>();
  readonly total = input.required<number>();
  readonly label = input.required<string>();
  readonly marks = input<readonly number[] | null>(null);

  readonly stepChange = output<number>();

  protected readonly percent = computed(() => `${slotPercent(this.step(), this.total())}%`);
  protected readonly markList = computed(() => this.marks() ?? slotMarks(this.total()));

  protected onInput(event: Event): void {
    this.stepChange.emit(Number((event.target as HTMLInputElement).value));
  }
}
```

`slot.html`:

```html
<div class="ohno-slot__ruler" aria-hidden="true"></div>
<div class="ohno-slot__marks" aria-hidden="true">
  @for (mark of markList(); track mark) {
    <span>{{ mark }}</span>
  }
</div>
<div class="ohno-slot__track" [style.--slot-percent]="percent()">
  <div class="ohno-slot__cap"></div>
  <input
    class="ohno-slot__input"
    type="range"
    [min]="0"
    [max]="total()"
    [step]="1"
    [value]="step()"
    [disabled]="total() === 0"
    [attr.aria-label]="label()"
    (input)="onInput($event)"
  />
</div>
```

`slot.scss`:

```scss
:host {
  display: block;
}

.ohno-slot__ruler {
  height: 11px;
  border-right: 1px solid var(--ink-4);
  background: repeating-linear-gradient(90deg, var(--ink-4) 0 1px, transparent 1px calc(100% / 49));
  opacity: 0.85;
}

.ohno-slot__marks {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font: 500 9px/1 var(--font-mono);
  color: var(--ink-4);
}

.ohno-slot__track {
  position: relative;
  margin-top: 12px;
  height: 14px;
  border-radius: 7px;
  background: var(--desk);
  box-shadow:
    inset 2px 2px 5px rgb(var(--black-rgb) / 0.9),
    inset -1px -1px 0 rgb(var(--white-rgb) / 0.06);
}

.ohno-slot__track::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  bottom: 3px;
  width: max(0px, calc(var(--slot-percent) - 3px));
  border-radius: 4px;
  background: linear-gradient(90deg, var(--signal-deep), var(--signal));
  box-shadow: 0 0 12px rgb(var(--signal-rgb) / 0.5);
  transition: width var(--duration-fast) var(--ease-soft);
}

.ohno-slot__cap {
  position: absolute;
  left: var(--slot-percent);
  top: -11px;
  width: 22px;
  height: 36px;
  margin-left: -11px;
  border-radius: 7px;
  background: var(--gradient-key);
  box-shadow: var(--shadow-cap);
  pointer-events: none;
  transition: left var(--duration-fast) var(--ease-soft);
}

.ohno-slot__cap::after {
  content: '';
  position: absolute;
  left: 10px;
  top: 7px;
  bottom: 7px;
  width: 2px;
  border-radius: 1px;
  background: var(--signal);
  box-shadow: 0 0 6px rgb(var(--signal-rgb) / 0.7);
}

.ohno-slot__input {
  position: absolute;
  inset: -11px 0;
  width: 100%;
  height: 36px;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.ohno-slot__track:has(.ohno-slot__input:focus-visible) .ohno-slot__cap {
  box-shadow: var(--shadow-cap), var(--focus-ring);
}
```

- [ ] **Step 7: Create `OhnoGauge`**

`gauge.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';
import { OhnoLed } from '../led/led';
import { LedColor } from '../led/led.types';
import { OhnoReadout } from '../readout/readout';
import { gaugeLeds } from './gauge.utils';

@Component({
  selector: 'ohno-gauge',
  imports: [OhnoEngraving, OhnoLed, OhnoReadout],
  templateUrl: './gauge.html',
  styleUrl: './gauge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoGauge {
  readonly label = input.required<string>();
  readonly count = input.required<number>();
  readonly lit = input.required<number>();
  readonly done = input(0);
  readonly litColor = input<LedColor>('signal');
  readonly doneColor = input<LedColor>('lime');

  protected readonly leds = computed(() => gaugeLeds(this.count(), this.lit(), this.done()));
}
```

`gauge.html`:

```html
<ohno-engraving>{{ label() }}</ohno-engraving>
<div class="ohno-gauge__leds" aria-hidden="true">
  @for (led of leds(); track $index) {
    <ohno-led [color]="led === 'done' ? doneColor() : litColor()" [on]="led !== 'off'" />
  }
</div>
<ohno-readout [value]="lit()" [total]="count()" [pad]="2" size="sm" />
```

`gauge.scss`:

```scss
:host {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ohno-gauge__leds {
  flex: 1;
  display: flex;
  justify-content: space-between;
  gap: 4px;
}
```

- [ ] **Step 8: Extend the specimen**

Add `size = signal(16)` and `step = signal(66)` to the specimen and this plate (import the three components):

```html
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Oś kroków, rozmiar, wskaźnik</ohno-engraving>
    <div class="specimen__row specimen__row--deck">
      <div class="specimen__axis">
        <ohno-slot [step]="step()" [total]="196" label="Krok" (stepChange)="step.set($event)" />
        <ohno-gauge label="Przebiegi" [count]="15" [lit]="3" [done]="2" />
      </div>
      <ohno-window-stepper
        [options]="[16, 32, 64]"
        [value]="size()"
        label="Rozmiar danych"
        unitLabel="elementów"
        decreaseLabel="Mniej elementów"
        increaseLabel="Więcej elementów"
        (valueChange)="size.set($event)"
      />
    </div>
  </ohno-plate>
```

SCSS: `.specimen__row--deck { align-items: flex-start; gap: 40px; } .specimen__axis { width: 340px; display: flex; flex-direction: column; gap: 22px; }`.

- [ ] **Step 9: Verify**

```bash
npm run test:algorithms 2>&1 | tail -5 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task7-specimen.png
```

Expected: tests pass; the axis, gauge and size window match the deck of image 02. In the browser: dragging the slot cap moves the step; `+` at 64 is disabled; Tab to the size window and press ArrowUp/ArrowDown — the value steps through 16 / 32 / 64 and stops at both ends; the gauge shows 2 lime, 1 orange, 12 off LEDs.

- [ ] **Step 10: Commit**

```bash
git add src/app/shared/instrument/window-stepper src/app/shared/instrument/slot src/app/shared/instrument/gauge src/app/dev
git commit -m "$(cat <<'EOF'
Add window stepper, step slot and LED gauge primitives

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Op-line, rack and rack row

**Files:**
- Create: `src/app/shared/instrument/opline/opline.ts`, `.html`, `.scss`, `opline.types.ts`
- Create: `src/app/shared/instrument/rack/rack.ts`, `.html`, `.scss`
- Create: `src/app/shared/instrument/rack/rack-row/rack-row.ts`, `.html`, `.scss`
- Modify: specimen `.ts`, `.html`

**Interfaces:**
- Produces: `OpLineRegister = { readonly label: string; readonly value: string }`, `OhnoOpLine` (`ohno-opline`, inputs `phase: string`, `tone: LedColor`, `registers: readonly OpLineRegister[]`; content projection for the sentence, where an `<em>` inside the projected sentence takes the tone colour through the global `ohno-opline em` rule from `_base.scss`), `OhnoRack` (`ohno-rack`, inputs `title: string`, `meta: string | null`), `OhnoRackRow` (`ohno-rack-row`, input `tone: RackRowTone = 'default' | 'head' | 'done' | 'now' | 'dim'`; slots `[rackLead]`, default, `[rackValue]`). Phase 3/4 feed these from the family readout adapters.

- [ ] **Step 1: Create `OhnoOpLine`**

`opline.types.ts`:

```ts
export interface OpLineRegister {
  readonly label: string;
  readonly value: string;
}
```

`opline.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';
import { OhnoLed } from '../led/led';
import { LedColor } from '../led/led.types';
import { OpLineRegister } from './opline.types';

@Component({
  selector: 'ohno-opline',
  imports: [OhnoEngraving, OhnoLed],
  templateUrl: './opline.html',
  styleUrl: './opline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
  },
})
export class OhnoOpLine {
  readonly phase = input.required<string>();
  readonly tone = input<LedColor>('cyan');
  readonly registers = input<readonly OpLineRegister[]>([]);
}
```

`opline.html`:

```html
<ohno-led [color]="tone()" />
<ohno-engraving class="ohno-opline__phase">{{ phase() }}</ohno-engraving>
<strong class="ohno-opline__sentence"><ng-content /></strong>
@if (registers().length > 0) {
  <div class="ohno-opline__registers">
    @for (register of registers(); track register.label) {
      <span>{{ register.label }}<b>{{ register.value }}</b></span>
    }
  </div>
}
```

`opline.scss`:

```scss
:host {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 9px;
  background: rgb(var(--white-rgb) / 0.035);
  box-shadow: inset 0 0 0 1px rgb(var(--white-rgb) / 0.05);
}

.ohno-opline__phase { color: var(--opline-color); }
:host([data-tone='cyan']) { --opline-color: var(--cyan); }
:host([data-tone='pink']) { --opline-color: var(--pink); }
:host([data-tone='lime']) { --opline-color: var(--lime); }
:host([data-tone='amber']) { --opline-color: var(--amber); }
:host([data-tone='signal']) { --opline-color: var(--signal); }
:host([data-tone='violet']) { --opline-color: var(--violet); }
:host([data-tone='red']) { --opline-color: var(--red); }
:host([data-tone='slate']) { --opline-color: var(--slate); }
:host([data-tone='easy']) { --opline-color: var(--easy); }

.ohno-opline__sentence {
  flex: 1;
  min-width: 0;
  font: 600 13.5px/1.3 var(--font-ui);
  color: var(--ink);
}

.ohno-opline__registers {
  display: flex;
  gap: 16px;
  font: 500 11px/1 var(--font-mono);
  color: var(--ink-3);
  white-space: nowrap;
}

.ohno-opline__registers b {
  margin-left: 5px;
  font-weight: 600;
  color: var(--ink);
}
```

- [ ] **Step 2: Create `OhnoRack` and `OhnoRackRow`**

`rack.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';

@Component({
  selector: 'ohno-rack',
  imports: [OhnoEngraving],
  templateUrl: './rack.html',
  styleUrl: './rack.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoRack {
  readonly title = input.required<string>();
  readonly meta = input<string | null>(null);
}
```

`rack.html`:

```html
<h3 class="ohno-rack__head">
  <ohno-engraving>{{ title() }}</ohno-engraving>
  @if (meta(); as text) {
    <ohno-engraving tone="dim">{{ text }}</ohno-engraving>
  }
</h3>
<div class="ohno-rack__rows">
  <ng-content />
</div>
```

`rack.scss`:

```scss
:host {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.ohno-rack__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  font: inherit;
}

.ohno-rack__rows {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
```

`rack-row/rack-row.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type RackRowTone = 'default' | 'head' | 'done' | 'now' | 'dim';

@Component({
  selector: 'ohno-rack-row',
  templateUrl: './rack-row.html',
  styleUrl: './rack-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
  },
})
export class OhnoRackRow {
  readonly tone = input<RackRowTone>('default');
}
```

`rack-row/rack-row.html`:

```html
<span class="ohno-rack-row__lead"><ng-content select="[rackLead]" /></span>
<span class="ohno-rack-row__body"><ng-content /></span>
<span class="ohno-rack-row__value"><ng-content select="[rackValue]" /></span>
```

`rack-row/rack-row.scss`:

```scss
:host {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  min-height: 26px;
  padding: 0 8px 0 6px;
  border-radius: 6px;
  background: rgb(var(--white-rgb) / 0.035);
  font: 500 11px/1 var(--font-mono);
  color: var(--ink-2);
}

.ohno-rack-row__lead { font: 600 13px/1 var(--font-ui); color: var(--ink); }
.ohno-rack-row__body { min-width: 0; }
.ohno-rack-row__value { color: var(--ink); }

:host([data-tone='head']) {
  background: rgb(var(--cyan-rgb) / 0.12);
  box-shadow: inset 0 0 0 1px rgb(var(--cyan-rgb) / 0.5);
}
:host([data-tone='head']) .ohno-rack-row__lead,
:host([data-tone='head']) .ohno-rack-row__value { color: var(--cyan); }

:host([data-tone='now']) {
  background: rgb(var(--cyan-rgb) / 0.12);
  box-shadow: inset 0 0 0 1px rgb(var(--cyan-rgb) / 0.5);
  color: var(--ink);
}

:host([data-tone='done']) { background: rgb(var(--lime-rgb) / 0.08); }
:host([data-tone='done']) .ohno-rack-row__lead,
:host([data-tone='done']) .ohno-rack-row__value { color: var(--lime); }

:host([data-tone='dim']) { opacity: 0.45; }
```

- [ ] **Step 3: Extend the specimen**

Import the three components and append:

```html
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Linia operacji i stojak</ohno-engraving>
    <ohno-screen padding="md">
      <div class="specimen__stage">
        <ohno-rack class="specimen__rack" title="Kolejka · min" meta="dist · skąd">
          <ohno-rack-row tone="head"><span rackLead>C</span>← F<ohno-readout rackValue [value]="4" size="sm" /></ohno-rack-row>
          <ohno-rack-row><span rackLead>G</span>← F<ohno-readout rackValue [value]="6" size="sm" /></ohno-rack-row>
          <ohno-rack-row tone="done"><span rackLead>A</span>źródło<ohno-readout rackValue [value]="0" size="sm" /></ohno-rack-row>
          <ohno-rack-row tone="dim"><span rackLead>D</span>—<ohno-readout rackValue [value]="'∞'" size="sm" /></ohno-rack-row>
        </ohno-rack>
      </div>
      <ohno-opline phase="Relaksacja" tone="pink" [registers]="[{ label: 'u', value: 'F' }, { label: 'v', value: 'C' }, { label: 'w', value: '2' }]">
        dist(C) = dist(F) + w(F,C) = 2 + 2 = <em>4</em> &lt; ∞ → zapisz 4, prev(C) = F.
      </ohno-opline>
    </ohno-screen>
  </ohno-plate>
```

SCSS: `.specimen__stage { display: flex; justify-content: flex-end; margin-bottom: 14px; } .specimen__rack { width: 214px; }`.

- [ ] **Step 4: Verify**

```bash
npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task8-specimen.png
```

Expected: the rack matches the queue block of image 08 (cyan head row, lime done row, dimmed ∞ row) and the op-line matches the bottom line of image 08 (pink LED, engraved phase, sentence with a pink `4`, mono registers).

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/instrument/opline src/app/shared/instrument/rack src/app/dev
git commit -m "$(cat <<'EOF'
Add op-line and rack primitives for the stage grammar

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Tape printer

**Files:**
- Create: `src/app/shared/instrument/tape/tape.ts`, `.html`, `.scss`, `tape.types.ts`, `tape.utils.ts`, `tape.utils.spec.ts`
- Modify: specimen `.ts`, `.html`

**Interfaces:**
- Produces: `TapeRow = { readonly step: number; readonly kind: 'event' | 'separator'; readonly tone: LedColor; readonly event: string; readonly detail: string }`, `currentTapeIndex(rows): number` (index of the last `event` row, −1 when none), `OhnoTape` (`ohno-tape`, inputs `rows: readonly TapeRow[]`, `stepHeader: string`, `eventHeader: string`, `emptyLabel: string`; the component scrolls the current row into view). The log printer in Phase 3 wraps this with its title, LED and side keys.

- [ ] **Step 1: Write the failing spec**

`tape.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { TapeRow } from './tape.types';
import { currentTapeIndex } from './tape.utils';

const event = (step: number): TapeRow => ({ step, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '' });
const separator = (step: number): TapeRow => ({ step, kind: 'separator', tone: 'slate', event: '── PRZEBIEG ──', detail: '' });

describe('currentTapeIndex', () => {
  it('points at the last event row', () => {
    expect(currentTapeIndex([event(1), event(2), event(3)])).toBe(2);
  });

  it('skips a trailing separator', () => {
    expect(currentTapeIndex([event(1), separator(2)])).toBe(0);
  });

  it('returns -1 for an empty tape or separators only', () => {
    expect(currentTapeIndex([])).toBe(-1);
    expect(currentTapeIndex([separator(1)])).toBe(-1);
  });
});
```

- [ ] **Step 2: Run the spec to see it fail**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/tape`
Expected: FAIL — missing modules.

- [ ] **Step 3: Implement types and util**

`tape.types.ts`:

```ts
import { LedColor } from '../led/led.types';

export interface TapeRow {
  readonly step: number;
  readonly kind: 'event' | 'separator';
  readonly tone: LedColor;
  readonly event: string;
  readonly detail: string;
}
```

`tape.utils.ts`:

```ts
import { TapeRow } from './tape.types';

export function currentTapeIndex(rows: readonly TapeRow[]): number {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (rows[index].kind === 'event') return index;
  }
  return -1;
}
```

- [ ] **Step 4: Run the spec to see it pass**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/tape`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `OhnoTape`**

`tape.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';

import { formatReadout } from '../readout/readout.utils';
import { TapeRow } from './tape.types';
import { currentTapeIndex } from './tape.utils';

@Component({
  selector: 'ohno-tape',
  templateUrl: './tape.html',
  styleUrl: './tape.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoTape {
  readonly rows = input.required<readonly TapeRow[]>();
  readonly stepHeader = input.required<string>();
  readonly eventHeader = input.required<string>();
  readonly emptyLabel = input.required<string>();

  protected readonly currentIndex = computed(() => currentTapeIndex(this.rows()));
  private readonly paper = viewChild.required<ElementRef<HTMLElement>>('paper');

  constructor() {
    effect(() => {
      const index = this.currentIndex();
      const rowElement = this.paper().nativeElement.querySelector<HTMLElement>(`[data-row="${index}"]`);
      rowElement?.scrollIntoView({ block: 'nearest' });
    });
  }

  protected stepText(row: TapeRow): string {
    return formatReadout(row.step, 3);
  }

  protected toneToken(row: TapeRow): string {
    return `var(--${row.tone})`;
  }
}
```

`tape.html`:

```html
<div #paper class="ohno-tape__paper">
  <div class="ohno-tape__row ohno-tape__row--head" aria-hidden="true">
    <span>{{ stepHeader() }}</span><i></i><span>{{ eventHeader() }}</span><span></span>
  </div>
  @if (rows().length === 0) {
    <p class="ohno-tape__empty">{{ emptyLabel() }}</p>
  }
  @for (row of rows(); track row.step; let index = $index) {
    @if (row.kind === 'separator') {
      <div class="ohno-tape__row ohno-tape__row--separator" [attr.data-row]="index">
        <span>{{ stepText(row) }}</span><i></i><span class="ohno-tape__wide">{{ row.event }}</span>
      </div>
    } @else {
      <div
        class="ohno-tape__row"
        [class.ohno-tape__row--current]="index === currentIndex()"
        [attr.data-row]="index"
        [style.--row-tone]="toneToken(row)"
      >
        <span>{{ stepText(row) }}</span><i></i><span>{{ row.event }}</span><span>{{ row.detail }}</span>
      </div>
    }
  }
</div>
<div class="ohno-tape__lip" aria-hidden="true"></div>
```

`tape.scss`:

```scss
:host {
  position: relative;
  display: block;
  min-height: 0;
}

.ohno-tape__paper {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 4px;
  bottom: 9px;
  overflow: hidden auto;
  padding: 18px 16px 10px;
  color: var(--paper-ink);
  font: 500 10.8px/17px var(--font-mono);
  background: var(--gradient-paper);
  -webkit-mask: conic-gradient(from 135deg at top, transparent, black 1deg 89deg, transparent 90deg) top / 9px 51% repeat-x, linear-gradient(black 0 0) bottom / 100% calc(100% - 5px) no-repeat;
  mask: conic-gradient(from 135deg at top, transparent, black 1deg 89deg, transparent 90deg) top / 9px 51% repeat-x, linear-gradient(black 0 0) bottom / 100% calc(100% - 5px) no-repeat;
  filter: drop-shadow(var(--shadow-paper));
}

.ohno-tape__row {
  display: grid;
  grid-template-columns: 30px 12px 70px 1fr;
  white-space: pre;
  animation: ohno-tape-feed var(--duration-base) var(--ease-out-quart);
}

.ohno-tape__row i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  align-self: center;
  background: var(--row-tone, transparent);
}

.ohno-tape__row--head {
  color: rgb(var(--paper-ink-rgb) / 0.55);
  border-bottom: 1px dashed rgb(var(--paper-ink-rgb) / 0.35);
  margin-bottom: 3px;
  padding-bottom: 2px;
  font-size: 9.5px;
  letter-spacing: 0.12em;
}

.ohno-tape__row--separator { color: rgb(var(--paper-ink-rgb) / 0.6); }
.ohno-tape__wide { grid-column: 3 / 5; }
.ohno-tape__row--current { font-weight: 700; color: var(--paper-ink); }
.ohno-tape__empty { padding: 8px 0; color: rgb(var(--paper-ink-rgb) / 0.6); white-space: normal; }

.ohno-tape__lip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 17px;
  border-radius: 9px;
  background: linear-gradient(180deg, var(--screen) 0 52%, var(--key-lo) 52% 100%);
  box-shadow:
    inset 0 3px 6px rgb(var(--black-rgb) / 0.95),
    0 1px 0 rgb(var(--white-rgb) / 0.06),
    0 -6px 12px rgb(var(--black-rgb) / 0.45);
}
```

(`transparent` and `black` inside the `mask` are alpha stops of the paper's zig-zag edge, not colours from the palette.) Every newly printed row feeds in with `ohno-tape-feed` (translateY + fade, 220ms); the reduced-motion kill switch in `_base.scss` turns it off.

- [ ] **Step 6: Extend the specimen**

Add to the specimen class:

```ts
  protected readonly tapeRows: readonly TapeRow[] = [
    { step: 56, kind: 'separator', tone: 'slate', event: '── PRZEBIEG 2 ZAKOŃCZONY ──', detail: '' },
    { step: 57, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '56[0] : 13[1]' },
    { step: 58, kind: 'event', tone: 'pink', event: 'ZAMIEŃ', detail: '56[0] ↔ 13[1]' },
    { step: 59, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '56[1] : 74[2]' },
    { step: 60, kind: 'event', tone: 'lime', event: 'USTAL', detail: '99[15]' },
  ];
```

and this plate:

```html
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Drukarka kroków</ohno-engraving>
    <ohno-tape class="specimen__tape" [rows]="tapeRows" stepHeader="KROK" eventHeader="ZDARZENIE" emptyLabel="Uruchom scenariusz, aby rozpocząć zapis." />
    <ohno-tape class="specimen__tape" [rows]="[]" stepHeader="KROK" eventHeader="ZDARZENIE" emptyLabel="Uruchom scenariusz, aby rozpocząć zapis." />
  </ohno-plate>
```

SCSS: `.specimen__tape { height: 200px; width: 340px; }`.

- [ ] **Step 7: Verify**

```bash
npm run test:algorithms 2>&1 | tail -5 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task9-specimen.png
```

Expected: tests pass; the tape matches unit C of image 02 (cream paper with a zig-zag top edge, dotted rows, bold current row, dark lip) and the empty tape shows only the header and the empty label.

- [ ] **Step 8: Commit**

```bash
git add src/app/shared/instrument/tape src/app/dev
git commit -m "$(cat <<'EOF'
Add the log tape primitive

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Floating plate, menu, search field and language toggle

**Files:**
- Create: `src/app/shared/instrument/floating-plate/floating-plate.ts`, `.html`, `.scss`
- Create: `src/app/shared/instrument/menu/menu.ts`, `.html`, `.scss`, `menu.types.ts`, `menu.utils.ts`, `menu.utils.spec.ts`
- Create: `src/app/shared/instrument/search-field/search-field.ts`, `.html`, `.scss`
- Create: `src/app/shared/instrument/lang-toggle/lang-toggle.ts`, `.html`, `.scss`
- Modify: specimen `.ts`, `.html`

**Interfaces:**
- Produces: `OhnoFloatingPlate` (`ohno-floating-plate`, inputs `open: boolean`, `label: string`; output `dismiss` on Escape or on a pointer-down outside the plate's parent element — so the trigger key and the plate share one wrapper element, and clicking the trigger never dismisses; positioned by the parent through `top`/`left`/`right` on the host), `MenuItem = { readonly id: string; readonly label: string; readonly disabled?: boolean }`, `nextMenuIndex(items, current, direction): number` (skips disabled items, wraps), `OhnoMenu` (`ohno-menu`, inputs `items`, `activeId: string | null`, `label`; outputs `select: string`, `dismiss`; takes focus when created, so consumers create it with `@if (open)` inside the plate and return focus to the trigger on dismiss), `OhnoSearchField` (`ohno-search-field`, inputs `placeholder`, `shortcut = '⌘K'`, `label`; output `open`), `OhnoLangToggle` (`ohno-lang-toggle`, inputs `value: string`, `options: readonly { readonly value: string; readonly label: string }[]`, `label`; output `valueChange: string`).

- [ ] **Step 1: Write the failing menu spec**

`menu.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { MenuItem } from './menu.types';
import { nextMenuIndex } from './menu.utils';

const items: readonly MenuItem[] = [
  { id: 'ts', label: 'TypeScript' },
  { id: 'py', label: 'Python' },
  { id: 'rs', label: 'Rust', disabled: true },
  { id: 'go', label: 'Go' },
];

describe('nextMenuIndex', () => {
  it('moves down and up', () => {
    expect(nextMenuIndex(items, 0, 1)).toBe(1);
    expect(nextMenuIndex(items, 1, -1)).toBe(0);
  });

  it('skips disabled items', () => {
    expect(nextMenuIndex(items, 1, 1)).toBe(3);
    expect(nextMenuIndex(items, 3, -1)).toBe(1);
  });

  it('wraps around both ends', () => {
    expect(nextMenuIndex(items, 3, 1)).toBe(0);
    expect(nextMenuIndex(items, 0, -1)).toBe(3);
  });

  it('starts from the first enabled item when nothing is active', () => {
    expect(nextMenuIndex(items, -1, 1)).toBe(0);
  });
});
```

- [ ] **Step 2: Run the spec to see it fail**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/menu`
Expected: FAIL — missing modules.

- [ ] **Step 3: Implement menu types and util**

`menu.types.ts`:

```ts
export interface MenuItem {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
}
```

`menu.utils.ts`:

```ts
import { MenuItem } from './menu.types';

export function nextMenuIndex(items: readonly MenuItem[], current: number, direction: -1 | 1): number {
  if (items.length === 0) return -1;
  let index = current;
  for (let attempt = 0; attempt < items.length; attempt += 1) {
    index = (index + direction + items.length) % items.length;
    if (!items[index].disabled) return index;
  }
  return -1;
}
```

- [ ] **Step 4: Run the spec to see it pass**

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/menu`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `OhnoFloatingPlate`**

`floating-plate.ts`:

```ts
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from '@angular/core';

@Component({
  selector: 'ohno-floating-plate',
  templateUrl: './floating-plate.html',
  styleUrl: './floating-plate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    '[attr.aria-label]': 'label()',
    '[class.ohno-floating-plate--open]': 'open()',
    '(document:keydown.escape)': 'onEscape()',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class OhnoFloatingPlate {
  readonly open = input.required<boolean>();
  readonly label = input.required<string>();

  readonly dismiss = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onEscape(): void {
    if (this.open()) this.dismiss.emit();
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!this.open()) return;
    const anchor = this.host.nativeElement.parentElement ?? this.host.nativeElement;
    if (anchor.contains(event.target as Node)) return;
    this.dismiss.emit();
  }
}
```

`floating-plate.html`:

```html
<ng-content />
```

`floating-plate.scss`:

```scss
:host {
  position: absolute;
  z-index: var(--z-popover);
  display: none;
  padding: 8px;
  border-radius: var(--radius-screen);
  background: var(--gradient-plate);
  box-shadow: var(--shadow-plate), 0 0 0 1px rgb(var(--black-rgb) / 0.6);
  animation: ohno-fade-scale var(--duration-fast) var(--ease-out-quart);
}

:host(.ohno-floating-plate--open) {
  display: block;
}
```

The parent decides where it sits (`top`/`left`/`right` on the host element), because menus hang under keys and the custom-values popover hangs under the deck. The trigger and the plate live inside one wrapper element (`position: relative`), which is also what the outside-click test uses.

- [ ] **Step 6: Create `OhnoMenu`**

`menu.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { OhnoKey } from '../key/key';
import { MenuItem } from './menu.types';
import { nextMenuIndex } from './menu.utils';

@Component({
  selector: 'ohno-menu',
  imports: [OhnoKey],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menu',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
    '(keydown.arrowdown)': 'move($event, 1)',
    '(keydown.arrowup)': 'move($event, -1)',
    '(keydown.enter)': 'choose($event)',
    '(keydown.space)': 'choose($event)',
    '(keydown.escape)': 'dismiss.emit()',
  },
})
export class OhnoMenu {
  readonly items = input.required<readonly MenuItem[]>();
  readonly activeId = input<string | null>(null);
  readonly label = input.required<string>();

  readonly select = output<string>();
  readonly dismiss = output<void>();

  protected readonly focusIndex = signal(-1);
  protected readonly activeIndex = computed(() => this.items().findIndex((item) => item.id === this.activeId()));

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.host.nativeElement.focus({ preventScroll: true }));
  }

  protected move(event: Event, direction: -1 | 1): void {
    event.preventDefault();
    const start = this.focusIndex() === -1 ? this.activeIndex() : this.focusIndex();
    this.focusIndex.set(nextMenuIndex(this.items(), start, direction));
  }

  protected choose(event: Event): void {
    event.preventDefault();
    const item = this.items()[this.focusIndex()];
    if (item && !item.disabled) this.select.emit(item.id);
  }

  protected pick(item: MenuItem): void {
    if (!item.disabled) this.select.emit(item.id);
  }
}
```

`menu.html`:

```html
@for (item of items(); track item.id; let index = $index) {
  <ohno-key
    class="ohno-menu__item"
    menuRole="menuitemradio"
    [checked]="item.id === activeId()"
    [label]="item.label"
    size="sm"
    led="signal"
    [ledOn]="item.id === activeId()"
    [pressed]="item.id === activeId() || index === focusIndex()"
    [disabled]="item.disabled === true"
    (keyClick)="pick(item)"
  />
}
```

`menu.scss`:

```scss
:host {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  outline: none;
}

:host(:focus-visible) {
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-md);
}

.ohno-menu__item {
  --key-width: 100%;
  --key-justify: flex-start;
}
```

- [ ] **Step 7: Create `OhnoSearchField` and `OhnoLangToggle`**

`search-field.ts`:

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { faMagnifyingGlass } from '@fortawesome/pro-regular-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { OhnoKbd } from '../kbd/kbd';

@Component({
  selector: 'ohno-search-field',
  imports: [FaIconComponent, OhnoKbd],
  templateUrl: './search-field.html',
  styleUrl: './search-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoSearchField {
  readonly placeholder = input.required<string>();
  readonly label = input.required<string>();
  readonly shortcut = input('⌘K');

  readonly open = output<void>();

  protected readonly icon = faMagnifyingGlass;
}
```

`search-field.html`:

```html
<button type="button" class="ohno-search-field" [attr.aria-label]="label()" (click)="open.emit()">
  <fa-icon class="ohno-search-field__icon" [icon]="icon" />
  <span class="ohno-search-field__placeholder">{{ placeholder() }}</span>
  <ohno-kbd>{{ shortcut() }}</ohno-kbd>
</button>
```

`search-field.scss`:

```scss
:host {
  display: block;
}

.ohno-search-field {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 38px;
  padding: 0 10px 0 13px;
  border: 0;
  border-radius: var(--radius-md);
  color: var(--ink-3);
  font: 400 13px/1 var(--font-ui);
  text-align: left;
  background: var(--screen);
  box-shadow: var(--shadow-screen);
}

.ohno-search-field__icon { font-size: 15px; }
.ohno-search-field__placeholder { flex: 1; }
.ohno-search-field:focus-visible { outline: none; box-shadow: var(--shadow-screen), var(--focus-ring); }
```

`lang-toggle.ts`:

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface LangToggleOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'ohno-lang-toggle',
  templateUrl: './lang-toggle.html',
  styleUrl: './lang-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'label()',
  },
})
export class OhnoLangToggle {
  readonly value = input.required<string>();
  readonly options = input.required<readonly LangToggleOption[]>();
  readonly label = input.required<string>();

  readonly valueChange = output<string>();
}
```

`lang-toggle.html`:

```html
@for (option of options(); track option.value) {
  <button
    type="button"
    class="ohno-lang-toggle__key"
    role="radio"
    [class.ohno-lang-toggle__key--on]="option.value === value()"
    [attr.aria-checked]="option.value === value()"
    (click)="valueChange.emit(option.value)"
  >
    {{ option.label }}
  </button>
}
```

`lang-toggle.scss`:

```scss
:host {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 3px;
  border-radius: var(--radius-key);
  background: var(--screen);
  box-shadow: var(--shadow-window);
}

.ohno-lang-toggle__key {
  width: 40px;
  height: 32px;
  border: 0;
  border-radius: 9px;
  font: 600 11px/1 var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--ink-4);
  background: transparent;
}

.ohno-lang-toggle__key--on {
  color: var(--ink);
  background: var(--gradient-key);
  box-shadow: 3px 4px 8px rgb(var(--black-rgb) / 0.6), inset 1px 1px 0 rgb(var(--white-rgb) / 0.1);
}

.ohno-lang-toggle__key:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

- [ ] **Step 8: Extend the specimen**

Add `menuOpen = signal(false)`, `language = signal('pl')`, `codeLanguage = signal('ts')` and the items `protected readonly languageItems: readonly MenuItem[] = [{ id: 'ts', label: 'TypeScript' }, { id: 'py', label: 'Python' }, { id: 'rs', label: 'Rust', disabled: true }];` to the specimen, import the four components, and append:

```html
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Wyszukiwanie, język, menu</ohno-engraving>
    <div class="specimen__row">
      <ohno-search-field class="specimen__search" placeholder="Szukaj algorytmu…" label="Otwórz wyszukiwarkę" (open)="menuOpen.set(false)" />
      <ohno-lang-toggle [value]="language()" [options]="[{ value: 'pl', label: 'PL' }, { value: 'en', label: 'EN' }]" label="Język interfejsu" (valueChange)="language.set($event)" />
      <span class="specimen__anchor">
        <ohno-key label="TS ▾" [menu]="true" [expanded]="menuOpen()" (keyClick)="menuOpen.set(!menuOpen())" />
        <ohno-floating-plate class="specimen__menu" [open]="menuOpen()" label="Język kodu" (dismiss)="menuOpen.set(false)">
          @if (menuOpen()) {
            <ohno-menu [items]="languageItems" [activeId]="codeLanguage()" label="Język kodu" (select)="codeLanguage.set($event); menuOpen.set(false)" (dismiss)="menuOpen.set(false)" />
          }
        </ohno-floating-plate>
      </span>
    </div>
  </ohno-plate>
```

SCSS: `.specimen__search { width: 300px; } .specimen__anchor { position: relative; display: inline-block; } .specimen__menu { top: calc(100% + 8px); left: 0; }`.

- [ ] **Step 9: Verify**

```bash
npm run test:algorithms 2>&1 | tail -5 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task10-specimen.png
```

Expected: tests pass; the search screen and PL/EN toggle match the topbar of image 02. In the browser: clicking `TS ▾` opens a floating plate with three keys and focus lands on the menu (the orange ring shows around it); ArrowDown/ArrowUp move the pressed look and skip Rust; Enter selects and closes; Escape and clicking outside close it; clicking `TS ▾` again closes it (no reopen flicker).

- [ ] **Step 10: Commit**

```bash
git add src/app/shared/instrument/floating-plate src/app/shared/instrument/menu src/app/shared/instrument/search-field src/app/shared/instrument/lang-toggle src/app/dev
git commit -m "$(cat <<'EOF'
Add floating plate, menu, search field and language toggle primitives

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Responsive and reduced-motion check of the specimen, phase wrap-up

**Files:**
- Modify: `src/app/dev/instrument-specimen/instrument-specimen.scss` (only if a primitive overflows at 360px)
- Modify: `CLAUDE.md` (design-system section), `.claude/skills/ohno-design-tokens/SKILL.md`
- Modify: `.claude/agents/ohno-design-reviewer.md` (token list)

**Interfaces:**
- Produces: documentation that later phases and the reviewer agent read; no code interfaces.

- [ ] **Step 1: Screenshot the specimen at three widths**

```bash
node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task11-1440.png 1440 900 && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task11-768.png 768 1400 && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/task11-360.png 360 2200
```

Expected: at 768 and 360 the rows wrap; no primitive is clipped or overflows the plate horizontally. If the `.specimen__axis` (340px) or `.specimen__search` (300px) overflow at 360px, change them to `width: min(340px, 100%)` / `min(300px, 100%)` in the specimen SCSS — the primitives themselves must not need changes.

- [ ] **Step 2: Reduced-motion pass**

In the browser DevTools Rendering tab set "Emulate CSS media feature prefers-reduced-motion: reduce", reload `/dev/instrument`: the pulsing LED holds steady, the knob pointer and slot cap jump instantly when changed, no transition is visible.

- [ ] **Step 3: Rewrite the `ohno-design-tokens` skill**

Replace the body of `.claude/skills/ohno-design-tokens/SKILL.md` (keep its frontmatter) with a catalog of the new tokens grouped as in `_instrument-tokens.scss` (materials, ink, signal and state colours with their `-rgb` twins, difficulty, fonts, radii, motion, gradients, shadows, screen texture, grooves, focus, z-index), the two rules ("only `var(--x)` or `rgb(var(--x-rgb) / a)`; `rgba(var(--x-rgb), a)` is forbidden" and "Doto only for numbers, complexity notation and the marquee, never below 14px"), and a section "Compatibility aliases" stating that every name in `src/styles/_compat-tokens.scss` is deprecated, must not be used in new code, and is deleted in Phase 5.

- [ ] **Step 4: Update `CLAUDE.md`**

In `CLAUDE.md` replace the "Design system — `src/styles.scss` token catalog" section with a short pointer: the token catalog is `src/styles/_instrument-tokens.scss` (Instrument redesign, spec `docs/superpowers/specs/2026-09-30-instrument-redesign-design.md`), the primitives live in `src/app/shared/instrument/` (list all 21 selectors: `ohno-plate`, `ohno-screen`, `ohno-engraving`, `ohno-led`, `ohno-kbd`, `ohno-readout`, `ohno-meter`, `ohno-key`, `ohno-latch`, `ohno-knob`, `ohno-window-stepper`, `ohno-slot`, `ohno-gauge`, `ohno-opline`, `ohno-rack`, `ohno-rack-row`, `ohno-tape`, `ohno-floating-plate`, `ohno-menu`, `ohno-search-field`, `ohno-lang-toggle`), the specimen route is `/dev/instrument` in dev builds, and the old tokens are compatibility aliases until Phase 5. Replace the sentence about film grain and the brand rail with "The desk texture is `app-root::before`; there is no brand rail, aurora, glass or grid canvas any more." Update the fonts line to Instrument Sans / Doto / Geist Mono.

- [ ] **Step 5: Update the reviewer agent**

In `.claude/agents/ohno-design-reviewer.md`, replace any list of token names with the new groups and add two checks: "flag `rgba(var(` anywhere" and "flag Doto (`--font-dot`) used for words or below 14px".

- [ ] **Step 6: Final verification of the phase**

```bash
npm run verify 2>&1 | tail -15 && grep -rn "rgba(var(" src/app/shared/instrument src/styles | wc -l && git status --short
```

Expected: `verify` passes (tests + production build); the grep prints `0`; the working tree is clean except the files of this task.

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md .claude/skills/ohno-design-tokens/SKILL.md .claude/agents/ohno-design-reviewer.md src/app/dev
git commit -m "$(cat <<'EOF'
Document the Instrument tokens and primitives

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

Then send the owner the four specimen screenshots (`task11-1440.png`, `task11-768.png`, `task11-360.png` and the last task screenshot) before Phase 2 starts.

---

## Phases 2–6

Each later phase gets its own plan file once the previous one has landed, because every task there consumes the primitive interfaces above and the screens from the spec:

- `2026-xx-xx-instrument-phase-2-shell-and-catalog.md` — spec sections 4.1, 5.3 (bank sidebar, PL/EN wiring to `AppLanguageService`, command palette, recent store, marquee, latches, path plate, module cards and previews, chrome deletions).
- `…-phase-3-workbench.md` — spec sections 4.2, 5.4 (decomposition of `AlgorithmDetail`, transport deck, stage grammar, inspector, log printer, keyboard map, aria-live, sorting displays per image 02).
- `…-phase-4-family-displays.md` — spec section 4.3 and images 08–12.
- `…-phase-5-cleanup.md` — spec sections 5.1 (delete compat aliases), 5.2 deletions, 5.5–5.8.
- `…-phase-6-responsive-and-polish.md` — spec section 4.4 and the polish checklist.
