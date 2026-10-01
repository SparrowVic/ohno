# Instrument Redesign — Phase 2: Shell and Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old navbar/sidebar shell and the algorithms catalog with the Instrument bank sidebar, marquee, tools, starter path, module cards and the ⌘K command palette exactly as in reference image 01, delete the chrome dead weight the spec lists, and keep the old workbench (`/algorithms/:id`) working until Phase 3.

**Architecture:** `Shell` becomes a two-column instrument (`BankSidebar` plate + `<main>`); `NavigationService` is slimmed to the algorithms group/item model with query-param sync; a signal `RecentAlgorithmsStore` (localStorage `ohno:recent:v1`) feeds the "recently opened" rows and the starter-path progress; `CommandPalette` lives in `App` so it works on every route; `AlgorithmsPage` is rebuilt from the Phase 1 primitives with `ModuleCard` + `ModulePreview` (8 family drawings); every piece of logic that can be pure lives in a `*.utils.ts` with a Vitest spec.

**Tech Stack:** Angular 21.2 (standalone, signals, `@if/@for/@switch/@defer`), TypeScript 5.9 strict, SCSS with the Instrument tokens, Transloco 8 with `t()` markers, Vitest 4 + jsdom, Playwright (`/Users/witek/repos/apply-and-pray/node_modules/playwright`) for viewport/reduced-motion checks, headless Chrome via `tools/screenshot.mjs`.

**Spec:** `docs/superpowers/specs/2026-09-30-instrument-redesign-design.md` — sections 4.1 (catalog), 4.4 (states and responsiveness), 5.3 (shell and catalog), 5.6 (i18n), 5.7 (performance), 6 phase 2, 7 (open questions 7.1, 7.3, 7.4, 7.6). Reference image: `docs/redesign-instrument/01-instrument-katalog.webp`. Mockup with the exact values: `proj-info/redesign/instrument/catalog.html` + `instrument.css` (git-ignored, on this machine). Phase 1 primitives and their inputs: `src/app/shared/instrument/**` (see the `ohno-design-tokens` skill for the list).

## Global Constraints

- Angular 21.2.x: standalone, `changeDetection: ChangeDetectionStrategy.OnPush`, signal inputs (`input()`, `input.required()`), `output()`, `inject()` only, `@if/@for/@switch` only, `name.ts` + `name.html` + `name.scss` per component.
- Prefix: new chrome/catalog components use the `Ohno` class prefix and `ohno-` selectors, like the Phase 1 primitives. Services stay under `src/app/core/`.
- Colours only through `var(--x)` or `rgb(var(--x-rgb) / a)` from `src/styles/_instrument-tokens.scss`; no hex literals in component SCSS; the comma form `rgba(var(` is forbidden; **no compatibility token from `src/styles/_compat-tokens.scss` in any new or rewritten file** (`--surface-*`, `--text-*`, `--accent`, `--chrome-*`, `--elevation-*`, `--ring-focus`, `--font-sans`, `--radius-lg/-xl/-2xl/-3xl`, …).
- Doto (`--font-dot` / `ohno-readout`) only for numbers, complexity notation and the one-word category marquee; never below 14px (the mockup's 13px recent readouts become the 15px `size="sm"`).
- No comments in code except a WHY comment for a non-obvious workaround.
- Every user-visible string goes through `t()` keys registered in `src/app/core/i18n/i18n-keys.ts` and present in both `public/i18n/pl.json` (PL first) and `en.json`. Transloco interpolation is `{{param}}`.
- No `backdrop-filter`; LED glows are `box-shadow`; `filter: drop-shadow` only on a preview's single current element while it is live.
- Reduced motion: the global kill switch in `_base.scss` covers CSS animations; anything JS-driven checks `prefersReducedMotion()` from `src/app/features/algorithms/utils/visualization-motion/`.
- The old workbench (`/algorithms/:id`, `AlgorithmDetail` and everything under `features/algorithms/components/`) is out of scope except for the two-line recent-store hook in Task 4; nothing it depends on may be deleted (see the "keep" list in Task 6).
- After every task: `npm run test:algorithms` passes, `npm run build` succeeds (pre-existing budget *warnings* are fine, errors are not), the affected screen is checked in the browser, then commit. Commit titles are short imperatives without prefixes; every commit message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Never commit `proj-info/`; never touch `src/app/features/algorithms/algorithms/**`.

## Review Focus

1. **Bank row for a category with zero visible modules after latching** — pressing all four difficulty latches off must show the empty plate ("Brak modułów") and never throw; pinned by `difficulty-filter.utils.spec.ts` (`filterByDifficulty(items, new Set())` → `[]`) in Task 2.
2. **Corrupted or foreign `ohno:recent:v1` JSON** — a person whose storage holds `"[]"`, `null`, a string, or entries missing `total` must get an empty recent list, not a crash on the sidebar; pinned by `recent-algorithms.utils.spec.ts` (`parseRecentEntries`) in Task 4.
3. **Search with diacritics and empty query** — typing "grafy" or "GRAFY" or "gráfy" must find graph modules, and an empty query must show the recent modules first; pinned by `search-index.utils.spec.ts` in Task 5.
4. **Starter path whose algorithm id no longer exists** — a path step referencing a removed id must be skipped, not rendered as an empty key; pinned by `paths.spec.ts` (every id exists) and `path-progress.utils.spec.ts` (unknown ids are dropped) in Task 2.
5. **Marquee with a long EN category label** — "Dynamic prog." or "Wyszukiwanie" at 58px would overflow the screen; the size must shrink and stay ≥ 26px; pinned by `marquee.utils.spec.ts` in Task 8.

---

### Task 0: Phase 1 review leftovers — mockup fidelity and cheap a11y nits

**Files:**
- Modify: `src/styles/_instrument-tokens.scss` (`--well`, `--well-rgb`, `--signal-ink`, `--signal-deep-rgb`, `--desk-halo-*-rgb`, `--gradient-cap`, screw stops)
- Modify: `src/styles/_base.scss` (reduced-motion kill switch also zeroes `transition-delay`)
- Modify: `src/app/shared/instrument/kbd/kbd.scss`, `lang-toggle/lang-toggle.scss`, `key/key.scss`, `key/key.ts`, `plate/plate.scss`, `search-field/search-field.scss`, `window-stepper/window-stepper.scss`, `slot/slot.scss`, `menu/menu.utils.ts`, `menu/menu.utils.spec.ts`

**Interfaces:**
- Produces: tokens `--well: #15161a` (+`-rgb`), `--signal-ink: #230d02`, `--gradient-cap`, `--screw-hi`/`--screw-lo`; `OhnoKey` shows a native `title` only when `title` is set or the key is icon-only; `nextMenuIndex(items, -1, -1)` lands on the last enabled item.

- [ ] **Step 1: Failing spec for the menu index**

In `menu.utils.spec.ts` add to the `nextMenuIndex` suite:

```ts
  it('starts from the last enabled item when moving up with nothing active', () => {
    expect(nextMenuIndex(items, -1, -1)).toBe(3);
  });
```

Run: `npx vitest run --config vitest.config.ts src/app/shared/instrument/menu` — Expected: FAIL (`2` received).

- [ ] **Step 2: Implement**

`menu.utils.ts`: replace the body of `nextMenuIndex` with:

```ts
  if (items.length === 0) return -1;
  let index = current === -1 && direction === -1 ? items.length : current;
  for (let attempt = 0; attempt < items.length; attempt += 1) {
    index = (index + direction + items.length) % items.length;
    if (!items[index].disabled) return index;
  }
  return -1;
```

Run the spec — Expected: PASS (5 tests).

Tokens (`_instrument-tokens.scss`): add `--signal-deep-rgb: 168 58 16;`, `--desk-halo-warm-rgb: 33 35 40;`, `--desk-halo-cool-rgb: 23 24 28;`, `--well: #15161a;`, `--well-rgb: 21 22 26;`, `--signal-ink: #230d02;`, `--screw-hi: #3b3e44;`, `--screw-lo: #14151a;`, `--gradient-cap: linear-gradient(150deg, #3a3d44, #24262b);`.

`_base.scss` kill switch: add `transition-delay: 0s !important;` next to `transition-duration`.

`kbd.scss`: `background: var(--screen);` → `background: var(--well);`. `lang-toggle.scss` `:host`: `background: var(--screen);` → `background: var(--well);`. `key.scss` `[data-variant='signal']`: `color: var(--paper-ink);` → `color: var(--signal-ink);` (both occurrences). `plate.scss` screw: `radial-gradient(circle at 35% 30%, var(--key-hi), var(--screen) 72%)` → `radial-gradient(circle at 35% 30%, var(--screw-hi), var(--screw-lo) 72%)`. `search-field.scss`: `border-radius: var(--radius-md);` → `border-radius: 11px;`. `window-stepper.scss`: `.ohno-window-stepper__keys ohno-key { --key-width: 34px; --key-radius: var(--radius-md); … }`. `slot.scss` cap: `background: var(--gradient-key);` → `background: var(--gradient-cap);`. `key.ts`: `titleText = computed(() => this.title() ?? (this.iconOnly() ? this.ariaLabel() : null))`.

- [ ] **Step 3: Verify and commit**

```bash
npm run test:algorithms 2>&1 | tail -3 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/p2-task0-specimen.png 1440 2000 2
git add src/styles src/app/shared/instrument
git commit -m "$(cat <<'EOF'
Align the primitives with the mockup wells, screws and radii

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1: Tooling for this phase

**Files:**
- Modify: `vitest.config.ts:7-10` (include globs)
- Modify: `transloco.config.ts` (`unflat: true`)
- Modify: `src/app/core/i18n/app-lang.ts` (PL first in `APP_LANG_OPTIONS`)

**Interfaces:**
- Produces: Vitest picks up `src/app/core/**/*.spec.ts`; `npm run i18n:extract` writes nested keys; `APP_LANG_OPTIONS` is `[PL, EN]` (Task 6 feeds it to `ohno-lang-toggle`).

- [ ] **Step 1: Include core specs in Vitest**

In `vitest.config.ts` replace the `include` array with:

```ts
    include: [
      'src/app/core/**/*.spec.ts',
      'src/app/features/algorithms/**/*.spec.ts',
      'src/app/shared/**/*.spec.ts',
    ],
```

- [ ] **Step 2: Make the keys manager write nested keys**

In `transloco.config.ts` change the `keysManager` object to:

```ts
  keysManager: {
    input: ['src/app'],
    output: 'public/i18n',
    marker: 't',
    sort: true,
    unflat: true,
    addMissingKeys: true,
  },
```

Run `npx transloco-keys-manager extract --help 2>&1 | grep -i unflat` — Expected: the option is listed (it is in `node_modules/@jsverse/transloco-keys-manager/cli-options.js`).

- [ ] **Step 3: PL first in the language options**

In `src/app/core/i18n/app-lang.ts` reorder the options so Polish comes first:

```ts
export const APP_LANG_OPTIONS: readonly AppLangOption[] = [
  { value: APP_LANG.PL, label: 'PL' },
  { value: APP_LANG.EN, label: 'EN' },
];
```

(`DEFAULT_APP_LANG` and `FALLBACK_APP_LANG` stay `en`.)

- [ ] **Step 4: Verify**

```bash
npm run test:algorithms 2>&1 | tail -4 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete"
```

Expected: the same 445 tests pass (no core spec exists yet); the build completes.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts transloco.config.ts src/app/core/i18n/app-lang.ts
git commit -m "$(cat <<'EOF'
Prepare tooling for the catalog rewrite

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Catalog-derived data — module ids, preview families, starter paths, difficulty filter

**Files:**
- Create: `src/app/features/algorithms/data/catalog/module-id/module-id.ts`, `module-id.spec.ts`
- Create: `src/app/features/algorithms/data/catalog/preview-family/preview-family.ts`, `preview-family.spec.ts`
- Create: `src/app/features/algorithms/data/catalog/paths/paths.ts`, `paths.spec.ts`
- Create: `src/app/features/algorithms/data/catalog/path-progress/path-progress.ts`, `path-progress.spec.ts`
- Create: `src/app/features/algorithms/data/catalog/difficulty-filter/difficulty-filter.ts`, `difficulty-filter.spec.ts`

**Interfaces:**
- Produces: `moduleId(item: AlgorithmItem, catalog: readonly AlgorithmItem[]): string` (`SRT-01`…), `MODULE_FAMILY_PREFIX`; `PreviewFamily = 'bars' | 'buckets' | 'graph' | 'matrix' | 'tape' | 'notebook' | 'xy' | 'stack'`, `previewFamily(item): PreviewFamily`; `CatalogPath { readonly groupId: string; readonly titleKey: string; readonly steps: readonly string[] }`, `CATALOG_PATHS: readonly CatalogPath[]`, `pathForGroup(groupId): CatalogPath`; `PathStepView { id, name, index, done, current }`, `pathProgress(path, resolve: (id) => AlgorithmItem | undefined, finishedIds: ReadonlySet<string>): PathProgressView { steps, doneCount, total }`; `ALL_DIFFICULTIES`, `filterByDifficulty(items, active: ReadonlySet<Difficulty>)`, `toggleDifficulty(active, difficulty): ReadonlySet<Difficulty>`.
- Consumes: `AlgorithmItem`, `Difficulty` from `src/app/features/algorithms/models/algorithm.ts`; `ALGORITHM_CATALOG` from `data/catalog/catalog.ts`.

- [ ] **Step 1: Write the failing specs**

`module-id.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from '../catalog';
import { moduleId } from './module-id';

const byId = (id: string) => ALGORITHM_CATALOG.find((item) => item.id === id)!;

describe('moduleId', () => {
  it('numbers modules within their category in catalog order', () => {
    expect(moduleId(byId('bubble-sort'), ALGORITHM_CATALOG)).toBe('SRT-01');
    expect(moduleId(byId('tim-sort'), ALGORITHM_CATALOG)).toBe('SRT-11');
    expect(moduleId(byId('linear-search'), ALGORITHM_CATALOG)).toBe('SRC-01');
    expect(moduleId(byId('tree-traversals'), ALGORITHM_CATALOG)).toBe('TRE-01');
    expect(moduleId(byId('bfs'), ALGORITHM_CATALOG)).toBe('GRF-01');
    expect(moduleId(byId('knapsack-01'), ALGORITHM_CATALOG)).toBe('DYN-01');
    expect(moduleId(byId('kmp-pattern-matching'), ALGORITHM_CATALOG)).toBe('STR-01');
    expect(moduleId(byId('convex-hull'), ALGORITHM_CATALOG)).toBe('GEO-01');
    expect(moduleId(byId('extended-euclidean'), ALGORITHM_CATALOG)).toBe('MSC-21');
  });

  it('gives every catalog entry a unique id', () => {
    const ids = ALGORITHM_CATALOG.map((item) => moduleId(item, ALGORITHM_CATALOG));
    expect(new Set(ids).size).toBe(ALGORITHM_CATALOG.length);
  });

  it('falls back to a generic prefix for an unknown category', () => {
    const stray = { ...byId('bubble-sort'), id: 'stray', category: 'quantum' };
    expect(moduleId(stray, [...ALGORITHM_CATALOG, stray])).toBe('MOD-01');
  });
});
```

`preview-family.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from '../catalog';
import { previewFamily } from './preview-family';

const byId = (id: string) => ALGORITHM_CATALOG.find((item) => item.id === id)!;

describe('previewFamily', () => {
  it('maps categories and subcategories onto the eight drawings', () => {
    expect(previewFamily(byId('bubble-sort'))).toBe('bars');
    expect(previewFamily(byId('counting-sort'))).toBe('buckets');
    expect(previewFamily(byId('binary-search'))).toBe('bars');
    expect(previewFamily(byId('tree-traversals'))).toBe('graph');
    expect(previewFamily(byId('dijkstra'))).toBe('graph');
    expect(previewFamily(byId('knapsack-01'))).toBe('matrix');
    expect(previewFamily(byId('kmp-pattern-matching'))).toBe('tape');
    expect(previewFamily(byId('convex-hull'))).toBe('xy');
    expect(previewFamily(byId('euclidean-gcd'))).toBe('notebook');
    expect(previewFamily(byId('recursion-call-stack'))).toBe('stack');
  });

  it('covers the whole catalog', () => {
    const families = new Set(ALGORITHM_CATALOG.map(previewFamily));
    expect([...families].sort()).toEqual(['bars', 'buckets', 'graph', 'matrix', 'notebook', 'stack', 'tape', 'xy']);
  });
});
```

`paths.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from '../catalog';
import { CATALOG_PATHS, pathForGroup } from './paths';

describe('CATALOG_PATHS', () => {
  const ids = new Set(ALGORITHM_CATALOG.map((item) => item.id));

  it('has one path per bank plus the overview', () => {
    expect(CATALOG_PATHS.map((path) => path.groupId)).toEqual([
      'overview', 'sorting', 'searching', 'trees', 'graphs', 'dp', 'strings', 'geometry', 'misc',
    ]);
  });

  it('only references existing algorithms, three or four per path, without repeats', () => {
    for (const path of CATALOG_PATHS) {
      expect(path.steps.length).toBeGreaterThanOrEqual(3);
      expect(path.steps.length).toBeLessThanOrEqual(4);
      expect(new Set(path.steps).size).toBe(path.steps.length);
      for (const id of path.steps) expect(ids.has(id), `${path.groupId}: ${id}`).toBe(true);
    }
  });

  it('falls back to the overview path for an unknown group', () => {
    expect(pathForGroup('quantum').groupId).toBe('overview');
  });
});
```

`path-progress.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from '../catalog';
import { CatalogPath } from '../paths/paths';
import { pathProgress } from './path-progress';

const resolve = (id: string) => ALGORITHM_CATALOG.find((item) => item.id === id);
const path: CatalogPath = {
  groupId: 'sorting',
  titleKey: 'x',
  steps: ['bubble-sort', 'insertion-sort', 'merge-sort', 'quick-sort'],
};

describe('pathProgress', () => {
  it('marks finished steps done and the first unfinished one current', () => {
    const view = pathProgress(path, resolve, new Set(['bubble-sort']));
    expect(view.doneCount).toBe(1);
    expect(view.total).toBe(4);
    expect(view.steps.map((step) => [step.index, step.done, step.current])).toEqual([
      [1, true, false], [2, false, true], [3, false, false], [4, false, false],
    ]);
    expect(view.steps[0].name).toBe('Bubble Sort');
  });

  it('has no current step once everything is finished', () => {
    const view = pathProgress(path, resolve, new Set(path.steps));
    expect(view.doneCount).toBe(4);
    expect(view.steps.every((step) => !step.current)).toBe(true);
  });

  it('drops steps whose algorithm no longer exists', () => {
    const view = pathProgress({ ...path, steps: ['bubble-sort', 'gone', 'merge-sort'] }, resolve, new Set());
    expect(view.steps.map((step) => step.id)).toEqual(['bubble-sort', 'merge-sort']);
    expect(view.total).toBe(2);
  });
});
```

`difficulty-filter.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { Difficulty } from '../../../models/algorithm';
import { ALGORITHM_CATALOG } from '../catalog';
import { ALL_DIFFICULTIES, filterByDifficulty, toggleDifficulty } from './difficulty-filter';

describe('difficulty filter', () => {
  it('keeps everything when every latch is pressed', () => {
    expect(filterByDifficulty(ALGORITHM_CATALOG, ALL_DIFFICULTIES)).toHaveLength(ALGORITHM_CATALOG.length);
  });

  it('keeps only the pressed difficulties', () => {
    const easy = filterByDifficulty(ALGORITHM_CATALOG, new Set([Difficulty.Easy]));
    expect(easy.length).toBe(14);
    expect(easy.every((item) => item.difficulty === Difficulty.Easy)).toBe(true);
  });

  it('returns nothing when no latch is pressed', () => {
    expect(filterByDifficulty(ALGORITHM_CATALOG, new Set())).toEqual([]);
  });

  it('toggles a difficulty in and out without mutating the input', () => {
    const start = new Set([Difficulty.Easy]);
    const withMedium = toggleDifficulty(start, Difficulty.Medium);
    expect([...withMedium]).toEqual([Difficulty.Easy, Difficulty.Medium]);
    expect([...toggleDifficulty(withMedium, Difficulty.Easy)]).toEqual([Difficulty.Medium]);
    expect([...start]).toEqual([Difficulty.Easy]);
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run --config vitest.config.ts src/app/features/algorithms/data/catalog`
Expected: five FAIL groups, each "Failed to resolve import".

- [ ] **Step 3: Implement**

`module-id.ts`:

```ts
import { AlgorithmItem } from '../../../models/algorithm';

export const MODULE_FAMILY_PREFIX: Readonly<Record<string, string>> = {
  sorting: 'SRT',
  searching: 'SRC',
  trees: 'TRE',
  graphs: 'GRF',
  dp: 'DYN',
  strings: 'STR',
  geometry: 'GEO',
  misc: 'MSC',
};

const FALLBACK_PREFIX = 'MOD';

export function moduleId(item: AlgorithmItem, catalog: readonly AlgorithmItem[]): string {
  const prefix = MODULE_FAMILY_PREFIX[item.category] ?? FALLBACK_PREFIX;
  const siblings = catalog.filter((entry) => entry.category === item.category);
  const index = siblings.findIndex((entry) => entry.id === item.id) + 1;
  return `${prefix}-${String(index).padStart(2, '0')}`;
}
```

`preview-family.ts`:

```ts
import { AlgorithmItem } from '../../../models/algorithm';

export type PreviewFamily = 'bars' | 'buckets' | 'graph' | 'matrix' | 'tape' | 'notebook' | 'xy' | 'stack';

const CATEGORY_FAMILY: Readonly<Record<string, PreviewFamily>> = {
  sorting: 'bars',
  searching: 'bars',
  trees: 'graph',
  graphs: 'graph',
  dp: 'matrix',
  strings: 'tape',
  geometry: 'xy',
  misc: 'stack',
};

export function previewFamily(item: AlgorithmItem): PreviewFamily {
  if (item.category === 'sorting' && item.subcategory === 'non-comparison') return 'buckets';
  if (item.category === 'misc' && item.subcategory === 'math') return 'notebook';
  return CATEGORY_FAMILY[item.category] ?? 'stack';
}
```

`paths.ts`:

```ts
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

export interface CatalogPath {
  readonly groupId: string;
  readonly titleKey: string;
  readonly steps: readonly string[];
}

export const CATALOG_PATHS: readonly CatalogPath[] = [
  {
    groupId: 'overview',
    titleKey: t('features.algorithms.catalog.path.titles.overview'),
    steps: ['bubble-sort', 'binary-search', 'bfs', 'fibonacci-dp'],
  },
  {
    groupId: 'sorting',
    titleKey: t('features.algorithms.catalog.path.titles.sorting'),
    steps: ['bubble-sort', 'insertion-sort', 'merge-sort', 'quick-sort'],
  },
  {
    groupId: 'searching',
    titleKey: t('features.algorithms.catalog.path.titles.searching'),
    steps: ['linear-search', 'binary-search', 'binary-search-variants'],
  },
  {
    groupId: 'trees',
    titleKey: t('features.algorithms.catalog.path.titles.trees'),
    steps: ['tree-traversals', 'dfs', 'bfs', 'dp-on-trees'],
  },
  {
    groupId: 'graphs',
    titleKey: t('features.algorithms.catalog.path.titles.graphs'),
    steps: ['bfs', 'dfs', 'dijkstra', 'prims-mst'],
  },
  {
    groupId: 'dp',
    titleKey: t('features.algorithms.catalog.path.titles.dp'),
    steps: ['climbing-stairs', 'fibonacci-dp', 'coin-change', 'knapsack-01'],
  },
  {
    groupId: 'strings',
    titleKey: t('features.algorithms.catalog.path.titles.strings'),
    steps: ['run-length-encoding', 'kmp-pattern-matching', 'rabin-karp', 'manacher'],
  },
  {
    groupId: 'geometry',
    titleKey: t('features.algorithms.catalog.path.titles.geometry'),
    steps: ['line-intersection', 'convex-hull', 'closest-pair-of-points', 'sweep-line'],
  },
  {
    groupId: 'misc',
    titleKey: t('features.algorithms.catalog.path.titles.misc'),
    steps: ['euclidean-gcd', 'factorial', 'sieve-of-eratosthenes', 'two-pointers'],
  },
];

export function pathForGroup(groupId: string): CatalogPath {
  return CATALOG_PATHS.find((path) => path.groupId === groupId) ?? CATALOG_PATHS[0];
}
```

`path-progress.ts`:

```ts
import { AlgorithmItem } from '../../../models/algorithm';
import { CatalogPath } from '../paths/paths';

export interface PathStepView {
  readonly id: string;
  readonly name: string;
  readonly index: number;
  readonly done: boolean;
  readonly current: boolean;
}

export interface PathProgressView {
  readonly steps: readonly PathStepView[];
  readonly doneCount: number;
  readonly total: number;
}

export function pathProgress(
  path: CatalogPath,
  resolve: (id: string) => AlgorithmItem | undefined,
  finishedIds: ReadonlySet<string>,
): PathProgressView {
  const items = path.steps
    .map((id) => resolve(id))
    .filter((item): item is AlgorithmItem => item !== undefined);
  const currentIndex = items.findIndex((item) => !finishedIds.has(item.id));
  const steps = items.map((item, position) => ({
    id: item.id,
    name: item.name,
    index: position + 1,
    done: finishedIds.has(item.id),
    current: position === currentIndex,
  }));
  return { steps, doneCount: steps.filter((step) => step.done).length, total: steps.length };
}
```

`difficulty-filter.ts`:

```ts
import { AlgorithmItem, Difficulty } from '../../../models/algorithm';

export const ALL_DIFFICULTIES: ReadonlySet<Difficulty> = new Set([
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
  Difficulty.UltraHard,
]);

export function filterByDifficulty(
  items: readonly AlgorithmItem[],
  active: ReadonlySet<Difficulty>,
): readonly AlgorithmItem[] {
  return items.filter((item) => active.has(item.difficulty));
}

export function toggleDifficulty(
  active: ReadonlySet<Difficulty>,
  difficulty: Difficulty,
): ReadonlySet<Difficulty> {
  const next = new Set(active);
  if (next.has(difficulty)) next.delete(difficulty);
  else next.add(difficulty);
  return next;
}
```

- [ ] **Step 4: Run the specs to see them pass**

Run: `npx vitest run --config vitest.config.ts src/app/features/algorithms/data/catalog`
Expected: PASS — 5 files, 15 tests (plus the pre-existing `catalog.spec.ts`).

- [ ] **Step 5: Commit**

```bash
git add src/app/features/algorithms/data/catalog
git commit -m "$(cat <<'EOF'
Add module ids, preview families, starter paths and the difficulty filter

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: i18n keys for the shell and catalog, translated module descriptions

**Files:**
- Modify: `src/app/core/i18n/i18n-keys.ts` (add `core.instrument` and `features.algorithms.catalog` groups)
- Create: `src/app/core/i18n/module-description-key.ts`
- Create: `src/app/features/algorithms/data/catalog/module-descriptions.spec.ts`
- Modify: `public/i18n/pl.json`, `public/i18n/en.json`

**Interfaces:**
- Produces: `I18N_KEY.core.instrument.{brand,bank,palette,shortcuts}`, `I18N_KEY.features.algorithms.catalog.{marquee,path,card,empty}` (exact leaves in Step 1), `moduleDescriptionKey(id: string): string` → `features.algorithms.catalog.modules.<id>.description`, and all values in both JSON files.

- [ ] **Step 1: Register the keys**

In `src/app/core/i18n/i18n-keys.ts`, inside the `core` group (after `worldGlobe`), add:

```ts
    instrument: {
      brand: {
        tagline: t('core.instrument.brand.tagline'),
        homeAriaLabel: t('core.instrument.brand.homeAriaLabel'),
      },
      bank: {
        navAriaLabel: t('core.instrument.bank.navAriaLabel'),
        algorithms: t('core.instrument.bank.algorithms'),
        all: t('core.instrument.bank.all'),
        structures: t('core.instrument.bank.structures'),
        structuresRow: t('core.instrument.bank.structuresRow'),
        comingSoon: t('core.instrument.bank.comingSoon'),
        recent: t('core.instrument.bank.recent'),
        recentEmpty: t('core.instrument.bank.recentEmpty'),
        recentAriaLabel: t('core.instrument.bank.recentAriaLabel'),
        shortcuts: t('core.instrument.bank.shortcuts'),
        languageAriaLabel: t('core.instrument.bank.languageAriaLabel'),
      },
      palette: {
        placeholder: t('core.instrument.palette.placeholder'),
        openAriaLabel: t('core.instrument.palette.openAriaLabel'),
        dialogLabel: t('core.instrument.palette.dialogLabel'),
        inputAriaLabel: t('core.instrument.palette.inputAriaLabel'),
        results: t('core.instrument.palette.results'),
        noResults: t('core.instrument.palette.noResults'),
        shortcutsTitle: t('core.instrument.palette.shortcutsTitle'),
        close: t('core.instrument.palette.close'),
      },
      shortcuts: {
        search: t('core.instrument.shortcuts.search'),
        shortcuts: t('core.instrument.shortcuts.shortcuts'),
        close: t('core.instrument.shortcuts.close'),
        play: t('core.instrument.shortcuts.play'),
        step: t('core.instrument.shortcuts.step'),
        reset: t('core.instrument.shortcuts.reset'),
        tempo: t('core.instrument.shortcuts.tempo'),
        tabs: t('core.instrument.shortcuts.tabs'),
        log: t('core.instrument.shortcuts.log'),
      },
    },
```

and inside `features.algorithms` (before `detail`), add:

```ts
    catalog: {
      marquee: {
        eyebrow: t('features.algorithms.catalog.marquee.eyebrow'),
        overviewEyebrow: t('features.algorithms.catalog.marquee.overviewEyebrow'),
        overviewTitle: t('features.algorithms.catalog.marquee.overviewTitle'),
        modules: t('features.algorithms.catalog.marquee.modules'),
        categories: t('features.algorithms.catalog.marquee.categories'),
        groups: t('features.algorithms.catalog.marquee.groups'),
      },
      path: {
        eyebrow: t('features.algorithms.catalog.path.eyebrow'),
        progressAriaLabel: t('features.algorithms.catalog.path.progressAriaLabel'),
        stepAriaLabel: t('features.algorithms.catalog.path.stepAriaLabel'),
      },
      card: {
        time: t('features.algorithms.catalog.card.time'),
        live: t('features.algorithms.catalog.card.live'),
        openAriaLabel: t('features.algorithms.catalog.card.openAriaLabel'),
      },
      empty: {
        title: t('features.algorithms.catalog.empty.title'),
        hint: t('features.algorithms.catalog.empty.hint'),
      },
    },
```

Also register the two existing filter keys that lose their `t()` markers when `select-button` is deleted in Task 8 — inside the `shared` group add:

```ts
    filters: {
      all: t('shared.filters.all'),
      difficulty: {
        ariaLabel: t('shared.filters.difficulty.ariaLabel'),
      },
    },
```

(The nine `path.titles.*` keys are declared with `t()` in `paths.ts` from Task 2; `modules.<id>.description` keys are dynamic — see Step 3.)

- [ ] **Step 2: Write the PL and EN values for the chrome and catalog keys**

Add to `public/i18n/pl.json` under `core` a new `instrument` object and under `features.algorithms` a new `catalog` object (keep alphabetical order; the extractor sorts anyway):

```json
"instrument": {
  "bank": {
    "algorithms": "Algorytmy",
    "all": "Wszystkie",
    "comingSoon": "Wkrótce",
    "languageAriaLabel": "Język interfejsu",
    "navAriaLabel": "Banki algorytmów",
    "recent": "Ostatnio otwierane",
    "recentAriaLabel": "Ostatnio otwierane moduły",
    "recentEmpty": "Otwórz dowolny moduł, a pojawi się tutaj.",
    "shortcuts": "Skróty",
    "structures": "Struktury",
    "structuresRow": "Struktury danych"
  },
  "brand": {
    "homeAriaLabel": "Oh(no) — katalog",
    "tagline": "Algorithm lab"
  },
  "palette": {
    "close": "Zamknij",
    "dialogLabel": "Wyszukiwarka i skróty",
    "inputAriaLabel": "Szukaj algorytmu",
    "noResults": "Brak modułów dla „{{query}}”",
    "openAriaLabel": "Otwórz wyszukiwarkę",
    "placeholder": "Szukaj w {{count}} algorytmach…",
    "results": "Wyniki",
    "shortcutsTitle": "Skróty klawiszowe"
  },
  "shortcuts": {
    "close": "Zamknij okno",
    "log": "Fokus na dziennik",
    "play": "Start / pauza",
    "reset": "Reset",
    "search": "Szukaj",
    "shortcuts": "Skróty",
    "step": "Krok wstecz / naprzód",
    "tabs": "Zakładki: kod, info, ślad",
    "tempo": "Tempo − / +"
  }
}
```

```json
"catalog": {
  "card": {
    "live": "Na żywo",
    "openAriaLabel": "Otwórz {{name}}",
    "time": "czas"
  },
  "empty": {
    "hint": "Wciśnij inny zatrzask trudności albo wybierz bank.",
    "title": "Brak modułów"
  },
  "marquee": {
    "categories": "Kategorii",
    "eyebrow": "Bank {{index}} · kategoria",
    "groups": "Grup",
    "modules": "Modułów",
    "overviewEyebrow": "Wszystkie banki · katalog",
    "overviewTitle": "Wszystkie"
  },
  "path": {
    "eyebrow": "Ścieżka startowa",
    "progressAriaLabel": "Postęp ścieżki startowej",
    "stepAriaLabel": "Krok {{index}}: {{name}}",
    "titles": {
      "dp": "Od schodów do plecaka",
      "geometry": "Od orientacji trójki punktów do otoczki",
      "graphs": "Od fali BFS do najkrótszej ścieżki",
      "misc": "Od reszty z dzielenia do sita",
      "overview": "Od pierwszej zamiany do pierwszego grafu",
      "searching": "Od przeglądania po kolei do połowienia",
      "sorting": "Od zamiany sąsiadów do dziel i zwyciężaj",
      "strings": "Od kodowania długości serii do funkcji prefiksowej",
      "trees": "Od korzenia do liści w trzech porządkach"
    }
  }
}
```

And the same shape in `public/i18n/en.json`:

```json
"instrument": {
  "bank": {
    "algorithms": "Algorithms",
    "all": "All",
    "comingSoon": "Soon",
    "languageAriaLabel": "Interface language",
    "navAriaLabel": "Algorithm banks",
    "recent": "Recently opened",
    "recentAriaLabel": "Recently opened modules",
    "recentEmpty": "Open any module and it will appear here.",
    "shortcuts": "Shortcuts",
    "structures": "Structures",
    "structuresRow": "Data structures"
  },
  "brand": {
    "homeAriaLabel": "Oh(no) — catalog",
    "tagline": "Algorithm lab"
  },
  "palette": {
    "close": "Close",
    "dialogLabel": "Search and shortcuts",
    "inputAriaLabel": "Search algorithms",
    "noResults": "No modules match “{{query}}”",
    "openAriaLabel": "Open search",
    "placeholder": "Search {{count}} algorithms…",
    "results": "Results",
    "shortcutsTitle": "Keyboard shortcuts"
  },
  "shortcuts": {
    "close": "Close the window",
    "log": "Focus the log",
    "play": "Play / pause",
    "reset": "Reset",
    "search": "Search",
    "shortcuts": "Shortcuts",
    "step": "Step back / forward",
    "tabs": "Tabs: code, info, trace",
    "tempo": "Tempo − / +"
  }
}
```

```json
"catalog": {
  "card": {
    "live": "Live",
    "openAriaLabel": "Open {{name}}",
    "time": "time"
  },
  "empty": {
    "hint": "Press another difficulty latch or pick a bank.",
    "title": "No modules"
  },
  "marquee": {
    "categories": "Categories",
    "eyebrow": "Bank {{index}} · category",
    "groups": "Groups",
    "modules": "Modules",
    "overviewEyebrow": "All banks · catalog",
    "overviewTitle": "All"
  },
  "path": {
    "eyebrow": "Starter path",
    "progressAriaLabel": "Starter path progress",
    "stepAriaLabel": "Step {{index}}: {{name}}",
    "titles": {
      "dp": "From stairs to the knapsack",
      "geometry": "From point orientation to the hull",
      "graphs": "From the BFS wave to the shortest path",
      "misc": "From remainders to the sieve",
      "overview": "From the first swap to the first graph",
      "searching": "From scanning to halving",
      "sorting": "From swapping neighbours to divide and conquer",
      "strings": "From run-length encoding to the prefix function",
      "trees": "From the root to the leaves in three orders"
    }
  }
}
```

- [ ] **Step 3: Module descriptions — key helper, failing spec, values**

`src/app/core/i18n/module-description-key.ts`:

```ts
export function moduleDescriptionKey(id: string): string {
  return `features.algorithms.catalog.modules.${id}.description`;
}
```

`src/app/features/algorithms/data/catalog/module-descriptions.spec.ts` (reads the JSON files from disk):

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from './catalog';

const load = (lang: string) =>
  JSON.parse(readFileSync(resolve(process.cwd(), `public/i18n/${lang}.json`), 'utf8')) as {
    features: { algorithms: { catalog: { modules: Record<string, { description: string }> } } };
  };

describe('module descriptions', () => {
  for (const lang of ['pl', 'en']) {
    it(`${lang}.json has a description for every catalog module`, () => {
      const modules = load(lang).features.algorithms.catalog.modules;
      for (const item of ALGORITHM_CATALOG) {
        expect(modules[item.id]?.description, item.id).toBeTruthy();
        expect(modules[item.id].description.length, item.id).toBeLessThanOrEqual(84);
      }
    });
  }
});
```

Run: `npx vitest run --config vitest.config.ts src/app/features/algorithms/data/catalog/module-descriptions`
Expected: FAIL — `modules` is undefined in both files.

Then write the EN descriptions from the catalog and the PL ones below with a one-off script (run from the repo root; it keeps the files sorted):

```bash
npx esbuild src/app/features/algorithms/data/catalog/catalog.ts --bundle --format=cjs --platform=node --log-level=error --outfile=/tmp/ohno-catalog.cjs && node - <<'SCRIPT'
const fs = require('node:fs');
const { ALGORITHM_CATALOG } = require('/tmp/ohno-catalog.cjs');
const PL = JSON.parse(fs.readFileSync('docs/superpowers/plans/module-descriptions.pl.json', 'utf8'));
const sortDeep = (value) => (value && typeof value === 'object' && !Array.isArray(value))
  ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]))
  : value;
for (const lang of ['pl', 'en']) {
  const path = `public/i18n/${lang}.json`;
  const json = JSON.parse(fs.readFileSync(path, 'utf8'));
  const modules = {};
  for (const item of ALGORITHM_CATALOG) {
    const description = lang === 'pl' ? PL[item.id] : item.description;
    if (!description) throw new Error(`missing ${lang} description for ${item.id}`);
    modules[item.id] = { description };
  }
  json.features.algorithms.catalog = { ...(json.features.algorithms.catalog ?? {}), modules };
  fs.writeFileSync(path, JSON.stringify(sortDeep(json), null, 2) + '\n');
}
console.log('descriptions written');
SCRIPT
```

`docs/superpowers/plans/module-descriptions.pl.json` (create it with exactly this content; it is committed with the plan as the PL source of truth):

```json
{
  "bubble-sort": "Zamienia sąsiednie elementy, aż największe wypłyną na koniec.",
  "selection-sort": "Wyszukuje najmniejszą wartość i dokłada ją do posortowanego prefiksu.",
  "insertion-sort": "Wstawia kolejny element we właściwe miejsce posortowanego prefiksu.",
  "counting-sort": "Zlicza wystąpienia wartości i odtwarza z nich posortowaną tablicę.",
  "merge-sort": "Dzieli tablicę na połowy, sortuje je i scala w jeden ciąg.",
  "quick-sort": "Dzieli elementy wokół pivota i sortuje obie części rekurencyjnie.",
  "heap-sort": "Buduje kopiec maksymalny i kolejno zdejmuje jego korzeń.",
  "radix-sort": "Sortuje liczby cyfra po cyfrze, od najmniej znaczącej.",
  "bucket-sort": "Rozdziela wartości do kubełków i sortuje każdy z osobna.",
  "shell-sort": "Sortuje elementy odległe o malejący odstęp, zanim dojdzie do sąsiadów.",
  "tim-sort": "Wykrywa naturalne przebiegi, dosortowuje je i scala parami.",
  "linear-search": "Sprawdza elementy po kolei, aż trafi na szukaną wartość.",
  "binary-search": "Połowi posortowany przedział, aż zostanie jedna pozycja.",
  "binary-search-variants": "Dolne i górne ograniczenia oraz przypadki brzegowe wyszukiwania binarnego.",
  "tree-traversals": "Odwiedza węzły drzewa w porządkach DFS i poziomami BFS.",
  "bfs": "Rozlewa się po grafie poziom po poziomie od wierzchołka startowego.",
  "dfs": "Schodzi w głąb grafu tak daleko, jak się da, i wraca po śladach.",
  "dijkstra": "Zachłannie relaksuje krawędzie o nieujemnych wagach, licząc najkrótsze ścieżki.",
  "topological-sort-kahn": "Porządkuje DAG, zdejmując kolejno wierzchołki bez krawędzi wchodzących.",
  "cycle-detection": "Sprawdza, czy graf zawiera cykl, śledząc stan odwiedzin.",
  "connected-components": "Grupuje wierzchołki, które wzajemnie się dosięgają w grafie nieskierowanym.",
  "union-find": "Utrzymuje rozłączne zbiory z szybkim łączeniem i sprawdzaniem spójności.",
  "flood-fill": "Rozlewa się na sąsiednie pola, aby przekolorować lub oznaczyć obszar.",
  "bipartite-check": "Koloruje graf dwiema barwami i sprawdza, czy każda krawędź je łączy.",
  "bellman-ford": "Wielokrotnie relaksuje krawędzie, obsługując ujemne wagi i wykrywając cykle.",
  "floyd-warshall": "Liczy najkrótsze ścieżki między wszystkimi parami przez pośrednie wierzchołki.",
  "a-star-pathfinding": "Łączy koszt dotarcia z heurystyką, by celować w najkrótszą ścieżkę.",
  "prims-mst": "Rozrasta minimalne drzewo rozpinające o najtańszą krawędź naraz.",
  "kruskals-mst": "Sortuje krawędzie i dokłada je do drzewa, omijając cykle.",
  "tarjan-scc": "Znajduje silnie spójne składowe w jednym DFS z wartościami low-link.",
  "kosaraju-scc": "Używa czasów zakończenia i grafu odwróconego, by wydzielić składowe.",
  "bridges-articulation-points": "Wskazuje krawędzie i wierzchołki, których usunięcie rozspaja graf.",
  "edmonds-karp": "Liczy maksymalny przepływ ścieżkami powiększającymi znajdowanymi przez BFS.",
  "hungarian-algorithm": "Redukuje macierz kosztów, by znaleźć najtańsze skojarzenie dwudzielne.",
  "euler-path-circuit": "Przechodzi każdą krawędź dokładnie raz, gdy pozwalają na to stopnie wierzchołków.",
  "hopcroft-karp": "Przyspiesza skojarzenie dwudzielne fazami warstwowego BFS i DFS.",
  "dinic-max-flow": "Buduje grafy warstwowe i przepływy blokujące dla szybszego max-flow.",
  "min-cost-max-flow": "Maksymalizuje przepływ, minimalizując jednocześnie łączny koszt transportu.",
  "chromatic-number": "Szuka najmniejszej liczby kolorów potrzebnej do pokolorowania grafu.",
  "steiner-tree": "Znajduje tanie drzewo łączące wybrany podzbiór wierzchołków.",
  "dominator-tree": "Wyznacza relacje dominacji w grafie przepływu sterowania.",
  "knapsack-01": "Wybiera przedmioty w limicie pojemności, maksymalizując łączną wartość.",
  "longest-common-subsequence": "Buduje tabelę DP mierzącą wspólny podciąg dwóch napisów.",
  "longest-increasing-subsequence": "Śledzi najdłuższy ściśle rosnący podciąg w tablicy.",
  "coin-change": "Znajduje najmniejszą liczbę monet składającą się na zadaną kwotę.",
  "edit-distance": "Liczy, ile wstawień, usunięć i zamian dzieli dwa napisy.",
  "climbing-stairs": "Zlicza sposoby wejścia na szczyt przy małych krokach.",
  "matrix-chain-multiplication": "Znajduje najtańsze nawiasowanie iloczynu łańcucha macierzy.",
  "fibonacci-dp": "Pokazuje, jak memoizacja i tabulacja usuwają powtórzoną rekurencję.",
  "dp-on-trees": "Składa stany poddrzew, rozwiązując hierarchiczne problemy optymalizacji.",
  "dp-with-bitmask": "Koduje podzbiory w maskach bitowych, kompresując stan kombinatoryczny.",
  "longest-palindromic-subsequence": "Rozwiązuje problem podciągu-palindromu przedziałowym DP.",
  "traveling-salesman-dp": "Odwiedza każde miasto raz, prowadząc DP po podzbiorach odwiedzonych.",
  "subset-sum": "Sprawdza, czy pewien podzbiór sumuje się dokładnie do celu.",
  "burst-balloons": "Wybiera optymalną kolejność przebijania balonów przedziałowym DP.",
  "regex-matching-dp": "Dopasowuje kropkę i gwiazdkę wzorca programowaniem dynamicznym.",
  "wildcard-matching": "Obsługuje znaki „?” i „*” przejściami stanów DP.",
  "dp-convex-hull-trick": "Przyspiesza liniowe przejścia DP, utrzymując kandydujące proste.",
  "divide-conquer-dp-optimization": "Wykorzystuje monotoniczne punkty podziału, by przyspieszyć rekurencje DP.",
  "knuth-dp-optimization": "Obniża złożoność przedziałowego DP, gdy zachodzą nierówności czworokąta.",
  "sos-dp": "Agreguje odpowiedzi po podzbiorach, iterując po wymiarach maski bitowej.",
  "profile-dp": "Śledzi częściowo wypełnione fronty siatki zwięzłymi profilami bitowymi.",
  "kmp-pattern-matching": "Cofa się po funkcji prefiksowej, nie sprawdzając znaków ponownie.",
  "rabin-karp": "Haszuje przesuwane okna, aby szybko porównywać podciągi.",
  "z-algorithm": "Liczy długość wspólnego prefiksu dla każdego sufiksu napisu.",
  "aho-corasick": "Dopasowuje wiele wzorców naraz z pomocą drzewa trie i łączy porażek.",
  "manacher": "Znajduje wszystkie najdłuższe palindromy parzyste i nieparzyste w czasie liniowym.",
  "suffix-array-construction": "Porządkuje sufiksy leksykograficznie dla szybkich narzędzi podciągowych.",
  "suffix-array-lcp-kasai": "Łączy porządek sufiksów z długościami wspólnych prefiksów sąsiadów.",
  "palindromic-tree": "Przechowuje wszystkie różne palindromy w strukturze budowanej on-line.",
  "burrows-wheeler-transform": "Przestawia tekst, by ułatwić kompresję i indeksowanie.",
  "run-length-encoding": "Kompresuje powtórzenia, zapisując pary wartość–liczność.",
  "huffman-coding": "Buduje kody prefiksowe o zmiennej długości z częstości symboli.",
  "convex-hull": "Owija skrajne punkty zbioru wielokątem wypukłym.",
  "line-intersection": "Sprawdza, czy odcinki się przecinają, i wyznacza punkt przecięcia.",
  "closest-pair-of-points": "Dzieli i zwycięża, by szybko znaleźć najbliższą parę punktów.",
  "sweep-line": "Przetwarza zdarzenia geometryczne w kolejności, utrzymując zbiór aktywny.",
  "voronoi-diagram": "Dzieli płaszczyznę na obszary najbliższe poszczególnym punktom.",
  "delaunay-triangulation": "Trianguluje punkty, maksymalizując najmniejsze kąty.",
  "minkowski-sum": "Składa kształty przez dodawanie wszystkich par wektorów.",
  "half-plane-intersection": "Wyznacza wielokąt dopuszczalny z liniowych ograniczeń półpłaszczyzn.",
  "fibonacci-iterative": "Liczy liczby Fibonacciego, przesuwając dwa ostatnie wyrazy.",
  "factorial": "Mnoży malejące liczby całkowite w wersji rekurencyjnej i iteracyjnej.",
  "euclidean-gcd": "Powtarza dzielenie z resztą, aż zostanie największy wspólny dzielnik.",
  "sieve-of-eratosthenes": "Wykreśla liczby złożone, zostawiając same liczby pierwsze.",
  "two-pointers": "Prowadzi parę indeksów przez kolekcję, korzystając z porządku lub symetrii.",
  "sliding-window": "Rozszerza i zwęża ruchome okno, utrzymując zagregowany stan.",
  "palindrome-check": "Sprawdza, czy ciąg czyta się tak samo z obu końców.",
  "reverse-string-array": "Zamienia lustrzane elementy, odwracając ciąg w miejscu.",
  "backtracking": "Buduje rozwiązanie krok po kroku i cofa się, gdy pęka ograniczenie.",
  "kadane": "Śledzi najlepszy podciąg kończący się na każdej pozycji w czasie liniowym.",
  "recursion-call-stack": "Pokazuje wywołania rekurencyjne, ramki stosu i kolejność zwijania.",
  "minimax-alpha-beta": "Przeszukuje drzewo gry, odcinając gałęzie, które nie zmienią wyniku.",
  "monte-carlo-tree-search": "Równoważy eksplorację i eksploatację losowymi rozgrywkami w drzewie gry.",
  "reservoir-sampling": "Utrzymuje nieobciążoną próbkę ze strumienia o nieznanej długości.",
  "fft-ntt": "Przekształca ciągi do szybkiego splotu w dziedzinie zespolonej lub modularnej.",
  "gaussian-elimination": "Redukuje układ równań operacjami na wierszach, by wyznaczyć niewiadome.",
  "simplex-algorithm": "Optymalizuje cel programowania liniowego, przechodząc po wierzchołkach.",
  "miller-rabin": "Probabilistycznie sprawdza, czy duża liczba całkowita jest pierwsza.",
  "pollards-rho": "Iteruje pseudolosowo, by znaleźć nietrywialne dzielniki liczby.",
  "chinese-remainder-theorem": "Odtwarza liczbę z reszt modulo względnie pierwsze moduły.",
  "extended-euclidean": "Znajduje współczynniki Bézouta razem z największym wspólnym dzielnikiem."
}
```

Run the spec again — Expected: PASS (2 tests). Every PL value above is ≤ 84 characters; the spec enforces it because the card clips at two lines of 12.5px.

- [ ] **Step 4: Extract and verify nothing is missing**

```bash
npm run i18n:extract 2>&1 | tail -3 && grep -c "Missing value" public/i18n/pl.json public/i18n/en.json && git diff --stat public/i18n
```

Expected: the extractor reports the new keys as already present; `Missing value` count is `0` for both files (if the extractor added a flat placeholder for any key, the value in Step 2 was misplaced — fix the nesting and re-run). Then `npm run test:algorithms 2>&1 | tail -3` — Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/i18n/i18n-keys.ts src/app/core/i18n/module-description-key.ts src/app/features/algorithms/data/catalog/module-descriptions.spec.ts public/i18n/pl.json public/i18n/en.json docs/superpowers/plans/module-descriptions.pl.json
git commit -m "$(cat <<'EOF'
Add catalog and shell i18n keys with translated module descriptions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Recent-algorithms store

**Files:**
- Create: `src/app/core/recent/recent-algorithms.utils.ts`, `recent-algorithms.utils.spec.ts`
- Create: `src/app/core/recent/recent-algorithms-store.ts`
- Modify: `src/app/features/algorithms/algorithm-detail/algorithm-detail.ts` (record progress until Phase 3 replaces the workbench)

**Interfaces:**
- Produces: `RecentEntry { readonly id: string; readonly step: number; readonly total: number; readonly finished: boolean; readonly updatedAt: number }`, `RECENT_LIMIT = 3`, `upsertRecent(list, entry, limit?)`, `parseRecentEntries(raw: string | null): readonly RecentEntry[]`, `RecentAlgorithmsStore` (`providedIn: 'root'`; `entries: Signal<readonly RecentEntry[]>`, `finishedIds: Signal<ReadonlySet<string>>`, `touch(id)`, `record(entry: Omit<RecentEntry, 'updatedAt'>)`, storage key `ohno:recent:v1`).
- Consumes: nothing from earlier tasks.

- [ ] **Step 1: Write the failing spec**

`recent-algorithms.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { RecentEntry, parseRecentEntries, upsertRecent } from './recent-algorithms.utils';

const entry = (id: string, updatedAt: number, extra: Partial<RecentEntry> = {}): RecentEntry => ({
  id, step: 0, total: 0, finished: false, updatedAt, ...extra,
});

describe('upsertRecent', () => {
  it('puts the newest entry first and caps the list', () => {
    const list = upsertRecent([entry('a', 1), entry('b', 2), entry('c', 3)], entry('d', 4));
    expect(list.map((item) => item.id)).toEqual(['d', 'c', 'b']);
  });

  it('replaces an existing id instead of duplicating it', () => {
    const list = upsertRecent([entry('a', 1), entry('b', 2)], entry('a', 5, { step: 12, total: 41 }));
    expect(list.map((item) => item.id)).toEqual(['a', 'b']);
    expect(list[0].step).toBe(12);
  });

  it('never loses a finished flag when the run is merely reopened', () => {
    const list = upsertRecent([entry('a', 1, { finished: true, step: 10, total: 10 })], entry('a', 2));
    expect(list[0].finished).toBe(true);
    expect(list[0].step).toBe(10);
  });
});

describe('parseRecentEntries', () => {
  it('reads a valid list', () => {
    const raw = JSON.stringify([{ id: 'bubble-sort', step: 66, total: 196, finished: false, updatedAt: 9 }]);
    expect(parseRecentEntries(raw)).toEqual([{ id: 'bubble-sort', step: 66, total: 196, finished: false, updatedAt: 9 }]);
  });

  it('returns an empty list for null, garbage, non-arrays and malformed entries', () => {
    expect(parseRecentEntries(null)).toEqual([]);
    expect(parseRecentEntries('not json')).toEqual([]);
    expect(parseRecentEntries('"[]"')).toEqual([]);
    expect(parseRecentEntries('{"id":"x"}')).toEqual([]);
    expect(parseRecentEntries('[{"id":"x","step":1}]')).toEqual([]);
    expect(parseRecentEntries('[{"id":5,"step":1,"total":2,"finished":false,"updatedAt":1}]')).toEqual([]);
  });

  it('keeps the valid entries of a partly broken list', () => {
    const raw = JSON.stringify([{ id: 'ok', step: 1, total: 2, finished: false, updatedAt: 1 }, { id: 'bad' }]);
    expect(parseRecentEntries(raw).map((item) => item.id)).toEqual(['ok']);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run --config vitest.config.ts src/app/core/recent`
Expected: FAIL — "Failed to resolve import './recent-algorithms.utils'".

- [ ] **Step 3: Implement the utils**

`recent-algorithms.utils.ts`:

```ts
export interface RecentEntry {
  readonly id: string;
  readonly step: number;
  readonly total: number;
  readonly finished: boolean;
  readonly updatedAt: number;
}

export const RECENT_LIMIT = 3;

export function upsertRecent(
  list: readonly RecentEntry[],
  entry: RecentEntry,
  limit = RECENT_LIMIT,
): readonly RecentEntry[] {
  const previous = list.find((item) => item.id === entry.id);
  const reopened = previous && entry.total === 0;
  const merged: RecentEntry = reopened
    ? { ...previous, updatedAt: entry.updatedAt }
    : { ...entry, finished: entry.finished || previous?.finished === true };
  return [merged, ...list.filter((item) => item.id !== entry.id)].slice(0, limit);
}

export function parseRecentEntries(raw: string | null): readonly RecentEntry[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isRecentEntry);
}

function isRecentEntry(value: unknown): value is RecentEntry {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    typeof candidate['step'] === 'number' &&
    typeof candidate['total'] === 'number' &&
    typeof candidate['finished'] === 'boolean' &&
    typeof candidate['updatedAt'] === 'number'
  );
}
```

- [ ] **Step 4: Run it to see it pass**

Run: `npx vitest run --config vitest.config.ts src/app/core/recent`
Expected: PASS (6 tests).

- [ ] **Step 5: Create the store**

`recent-algorithms-store.ts`:

```ts
import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';

import { RecentEntry, parseRecentEntries, upsertRecent } from './recent-algorithms.utils';

const STORAGE_KEY = 'ohno:recent:v1';

@Injectable({ providedIn: 'root' })
export class RecentAlgorithmsStore {
  private readonly storage = inject(DOCUMENT).defaultView?.localStorage ?? null;
  private readonly entriesState = signal<readonly RecentEntry[]>(this.read());

  readonly entries: Signal<readonly RecentEntry[]> = this.entriesState.asReadonly();
  readonly finishedIds: Signal<ReadonlySet<string>> = computed(
    () => new Set(this.entries().filter((entry) => entry.finished).map((entry) => entry.id)),
  );

  touch(id: string): void {
    this.record({ id, step: 0, total: 0, finished: false });
  }

  record(entry: Omit<RecentEntry, 'updatedAt'>): void {
    const next = upsertRecent(this.entriesState(), { ...entry, updatedAt: Date.now() });
    this.entriesState.set(next);
    this.write(next);
  }

  private read(): readonly RecentEntry[] {
    try {
      return parseRecentEntries(this.storage?.getItem(STORAGE_KEY) ?? null);
    } catch {
      return [];
    }
  }

  private write(entries: readonly RecentEntry[]): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      return;
    }
  }
}
```

- [ ] **Step 6: Record progress from the old workbench**

In `src/app/features/algorithms/algorithm-detail/algorithm-detail.ts`:

1. Add the import `import { RecentAlgorithmsStore } from '../../../core/recent/recent-algorithms-store';` and the field `private readonly recent = inject(RecentAlgorithmsStore);` next to the other `inject(...)` fields (around line 132).
2. In `loadScenario` (line ~878), right after `this.resetPlaybackState();`, add:

```ts
    const id = this.idParam();
    if (id) this.recent.touch(id);
```

3. In the constructor, add an effect (the class already has a constructor with effects; append inside it):

```ts
    effect(() => {
      const id = this.idParam();
      const step = this.currentStep();
      const total = this.totalSteps();
      if (!id || total === 0 || step < 0) return;
      this.recent.record({ id, step, total, finished: step >= total });
    });
```

`currentStep` and `totalSteps` are the engine signals already exposed on the class (lines 216–217).

- [ ] **Step 7: Verify in the browser**

```bash
npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete"
```

Open `http://localhost:4200/algorithms/bubble-sort`, press play for a few seconds, then in DevTools console run `JSON.parse(localStorage.getItem('ohno:recent:v1'))` — Expected: one entry `{ id: 'bubble-sort', step: <n>, total: <m>, finished: false, updatedAt: <ms> }`; step to the end → `finished: true`. Open `/algorithms/dijkstra` → two entries, Dijkstra first.

- [ ] **Step 8: Commit**

```bash
git add src/app/core/recent src/app/features/algorithms/algorithm-detail/algorithm-detail.ts
git commit -m "$(cat <<'EOF'
Add the recent-algorithms store

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Command palette (⌘K, `/`, `?`)

**Files:**
- Create: `src/app/core/layout/command-palette/search-index.utils.ts`, `search-index.utils.spec.ts`
- Create: `src/app/core/layout/command-palette/palette-keys.utils.ts`, `palette-keys.utils.spec.ts`
- Create: `src/app/core/layout/command-palette/command-palette.service.ts`
- Create: `src/app/core/layout/command-palette/command-palette.ts`, `.html`, `.scss`
- Modify: `src/app/app.ts`, `src/app/app.html` (mount the palette once, for every route)
- Modify: `src/app/core/i18n/i18n-keys.ts`, `public/i18n/pl.json`, `public/i18n/en.json` (one key: `core.instrument.shortcuts.spaceKey`)

**Interfaces:**
- Produces: `SearchEntry { id, name, moduleId, categoryId, subcategoryId, categoryLabel, subcategoryLabel, traits: readonly string[], difficulty: Difficulty }`, `normalizeSearchText(text)`, `scoreEntry(entry, query): number`, `searchEntries(entries, query, limit = 8)`, `defaultEntries(entries, recentIds, limit = 8)`, `cycleIndex(count, current, direction: -1 | 1)`; `PaletteAction = 'toggle' | 'search' | 'shortcuts' | 'close' | null`, `paletteAction(input: { key, metaKey, ctrlKey, typing, open }): PaletteAction`, `isTypingTarget(target: EventTarget | null): boolean`; `CommandPaletteService` (`open`, `mode: 'search' | 'shortcuts'`, `openSearch()`, `openShortcuts()`, `close()`, `toggle()`); `OhnoCommandPalette` (`ohno-command-palette`, no inputs). Task 6 calls `openSearch()` from the bank's `?` key and Task 8 from the search field.
- Consumes: `moduleId` (Task 2), `I18N_KEY.core.instrument.*` (Task 3), `RecentAlgorithmsStore` (Task 4), `deriveAlgorithmTraits`/`ALGORITHM_TRAITS` from `features/algorithms/algorithm-traits/algorithm-traits.ts`, `getAlgorithmFacetLabelKey` from `core/i18n/catalog-labels.ts`, `AlgorithmRegistry`.

- [ ] **Step 1: Write the failing specs**

`search-index.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { Difficulty } from '../../../features/algorithms/models/algorithm';
import { SearchEntry, cycleIndex, defaultEntries, normalizeSearchText, searchEntries } from './search-index.utils';

const entry = (id: string, name: string, extra: Partial<SearchEntry> = {}): SearchEntry => ({
  id, name, moduleId: 'MOD-01', categoryId: 'misc', subcategoryId: 'math', categoryLabel: 'Inne', subcategoryLabel: 'Matematyka', traits: [], difficulty: Difficulty.Easy, ...extra,
});

const entries: readonly SearchEntry[] = [
  entry('bubble-sort', 'Bubble Sort', { moduleId: 'SRT-01', categoryId: 'sorting', categoryLabel: 'Sortowanie', subcategoryLabel: 'Porównawcze' }),
  entry('bfs', 'BFS', { moduleId: 'GRF-01', categoryId: 'graphs', categoryLabel: 'Grafy', subcategoryLabel: 'Przechodzenie' }),
  entry('dijkstra', 'Dijkstra', { moduleId: 'GRF-03', categoryId: 'graphs', categoryLabel: 'Grafy', subcategoryLabel: 'Wyznaczanie ścieżek', traits: ['greedy', 'zachłanny', 'shortest-path'] }),
  entry('sieve-of-eratosthenes', 'Sieve of Eratosthenes'),
];

describe('normalizeSearchText', () => {
  it('lowercases, strips diacritics and collapses whitespace', () => {
    expect(normalizeSearchText('  Wyznaczanie   ŚCIEŻEK ')).toBe('wyznaczanie sciezek');
  });
});

describe('searchEntries', () => {
  it('ranks a name prefix above a substring and a substring above a category match', () => {
    expect(searchEntries(entries, 'b').map((hit) => hit.id)).toEqual(['bubble-sort', 'bfs']);
    expect(searchEntries(entries, 'sort')[0].id).toBe('bubble-sort');
  });

  it('matches category labels regardless of case and diacritics', () => {
    expect(searchEntries(entries, 'GRAFY').map((hit) => hit.id)).toEqual(['bfs', 'dijkstra']);
    expect(searchEntries(entries, 'gráfy').map((hit) => hit.id)).toEqual(['bfs', 'dijkstra']);
    expect(searchEntries(entries, 'sciezek').map((hit) => hit.id)).toEqual(['dijkstra']);
  });

  it('matches traits and module ids', () => {
    expect(searchEntries(entries, 'greedy').map((hit) => hit.id)).toEqual(['dijkstra']);
    expect(searchEntries(entries, 'grf-0').map((hit) => hit.id)).toEqual(['bfs', 'dijkstra']);
  });

  it('matches a subsequence of the name only for queries of three or more characters', () => {
    expect(searchEntries(entries, 'bblsrt').map((hit) => hit.id)).toEqual(['bubble-sort']);
    expect(searchEntries(entries, 'bs').map((hit) => hit.id)).toEqual(['bfs']);
  });

  it('returns nothing for an empty query and respects the limit', () => {
    expect(searchEntries(entries, '   ')).toEqual([]);
    expect(searchEntries(entries, 's', 1)).toHaveLength(1);
  });
});

describe('defaultEntries', () => {
  it('lists recent modules first, then the catalog order, without duplicates', () => {
    expect(defaultEntries(entries, ['dijkstra', 'missing'], 3).map((hit) => hit.id)).toEqual(['dijkstra', 'bubble-sort', 'bfs']);
  });
});

describe('cycleIndex', () => {
  it('wraps around both ends and handles an empty list', () => {
    expect(cycleIndex(3, 2, 1)).toBe(0);
    expect(cycleIndex(3, 0, -1)).toBe(2);
    expect(cycleIndex(3, -1, 1)).toBe(0);
    expect(cycleIndex(0, -1, 1)).toBe(-1);
  });
});
```

`palette-keys.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { paletteAction } from './palette-keys.utils';

const press = (key: string, extra: Partial<Parameters<typeof paletteAction>[0]> = {}) =>
  paletteAction({ key, metaKey: false, ctrlKey: false, typing: false, open: false, ...extra });

describe('paletteAction', () => {
  it('toggles on ⌘K / Ctrl+K even while typing', () => {
    expect(press('k', { metaKey: true })).toBe('toggle');
    expect(press('K', { ctrlKey: true, typing: true })).toBe('toggle');
  });

  it('opens search on / and shortcuts on ? outside inputs only', () => {
    expect(press('/')).toBe('search');
    expect(press('?')).toBe('shortcuts');
    expect(press('/', { typing: true })).toBeNull();
    expect(press('?', { typing: true })).toBeNull();
  });

  it('closes on Escape only while open and ignores other keys', () => {
    expect(press('Escape', { open: true })).toBe('close');
    expect(press('Escape')).toBeNull();
    expect(press('/', { open: true })).toBeNull();
    expect(press('a')).toBeNull();
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run --config vitest.config.ts src/app/core/layout/command-palette`
Expected: two FAIL groups, "Failed to resolve import".

- [ ] **Step 3: Implement the utils**

`search-index.utils.ts`:

```ts
import { Difficulty } from '../../../features/algorithms/models/algorithm';

export interface SearchEntry {
  readonly id: string;
  readonly name: string;
  readonly moduleId: string;
  readonly categoryId: string;
  readonly subcategoryId: string;
  readonly categoryLabel: string;
  readonly subcategoryLabel: string;
  readonly traits: readonly string[];
  readonly difficulty: Difficulty;
}

const SUBSEQUENCE_MIN_LENGTH = 3;

export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreEntry(entry: SearchEntry, query: string): number {
  const q = normalizeSearchText(query);
  if (q.length === 0) return 0;
  const name = normalizeSearchText(entry.name);
  if (name.startsWith(q)) return 100;
  if (name.split(' ').some((word) => word.startsWith(q))) return 80;
  if (name.includes(q)) return 60;
  if (normalizeSearchText(entry.moduleId).includes(q)) return 50;
  const facets = [entry.categoryLabel, entry.subcategoryLabel, entry.categoryId, entry.subcategoryId];
  if (facets.some((facet) => normalizeSearchText(facet).includes(q))) return 30;
  if (entry.traits.some((trait) => normalizeSearchText(trait).includes(q))) return 25;
  if (q.length >= SUBSEQUENCE_MIN_LENGTH && isSubsequence(q.replace(/ /g, ''), name)) return 15;
  return 0;
}

export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
  limit = 8,
): readonly SearchEntry[] {
  if (normalizeSearchText(query).length === 0) return [];
  return entries
    .map((entry, index) => ({ entry, index, score: scoreEntry(entry, query) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((hit) => hit.entry);
}

export function defaultEntries(
  entries: readonly SearchEntry[],
  recentIds: readonly string[],
  limit = 8,
): readonly SearchEntry[] {
  const recent = recentIds
    .map((id) => entries.find((entry) => entry.id === id))
    .filter((entry): entry is SearchEntry => entry !== undefined);
  const rest = entries.filter((entry) => !recent.includes(entry));
  return [...recent, ...rest].slice(0, limit);
}

export function cycleIndex(count: number, current: number, direction: -1 | 1): number {
  if (count === 0) return -1;
  if (current < 0) return direction === 1 ? 0 : count - 1;
  return (current + direction + count) % count;
}

function isSubsequence(needle: string, haystack: string): boolean {
  let position = 0;
  for (const char of haystack) {
    if (char === needle[position]) position += 1;
    if (position === needle.length) return true;
  }
  return false;
}
```

`palette-keys.utils.ts`:

```ts
export type PaletteAction = 'toggle' | 'search' | 'shortcuts' | 'close' | null;

export interface PaletteKeyInput {
  readonly key: string;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly typing: boolean;
  readonly open: boolean;
}

export function paletteAction(input: PaletteKeyInput): PaletteAction {
  if ((input.metaKey || input.ctrlKey) && input.key.toLowerCase() === 'k') return 'toggle';
  if (input.open) return input.key === 'Escape' ? 'close' : null;
  if (input.typing) return null;
  if (input.key === '/') return 'search';
  if (input.key === '?') return 'shortcuts';
  return null;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
```

- [ ] **Step 4: Run them to see them pass**

Run: `npx vitest run --config vitest.config.ts src/app/core/layout/command-palette`
Expected: PASS (11 tests).

- [ ] **Step 5: The service and the `spaceKey` i18n key**

`command-palette.service.ts`:

```ts
import { Injectable, Signal, signal } from '@angular/core';

export type PaletteMode = 'search' | 'shortcuts';

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly openState = signal(false);
  private readonly modeState = signal<PaletteMode>('search');

  readonly open: Signal<boolean> = this.openState.asReadonly();
  readonly mode: Signal<PaletteMode> = this.modeState.asReadonly();

  openSearch(): void {
    this.modeState.set('search');
    this.openState.set(true);
  }

  openShortcuts(): void {
    this.modeState.set('shortcuts');
    this.openState.set(true);
  }

  close(): void {
    this.openState.set(false);
  }

  toggle(): void {
    if (this.openState()) this.close();
    else this.openSearch();
  }
}
```

Add `spaceKey: t('core.instrument.shortcuts.spaceKey'),` to the `shortcuts` group in `i18n-keys.ts`, and the values `"spaceKey": "Spacja"` (pl.json) / `"spaceKey": "Space"` (en.json) inside `core.instrument.shortcuts`.

- [ ] **Step 6: The component**

`command-palette.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { faMagnifyingGlass } from '@fortawesome/pro-regular-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ALGORITHM_TRAITS, deriveAlgorithmTraits } from '../../../features/algorithms/algorithm-traits/algorithm-traits';
import { moduleId } from '../../../features/algorithms/data/catalog/module-id/module-id';
import { AlgorithmItem, Difficulty } from '../../../features/algorithms/models/algorithm';
import { AlgorithmRegistry } from '../../../features/algorithms/registry/algorithm-registry/algorithm-registry';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoKbd } from '../../../shared/instrument/kbd/kbd';
import { OhnoLed } from '../../../shared/instrument/led/led';
import { LedColor } from '../../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { AppLanguageService } from '../../i18n/app-language.service';
import { getAlgorithmFacetLabelKey } from '../../i18n/catalog-labels';
import { I18N_KEY } from '../../i18n/i18n-keys';
import { RecentAlgorithmsStore } from '../../recent/recent-algorithms-store';
import { CommandPaletteService } from './command-palette.service';
import { isTypingTarget, paletteAction } from './palette-keys.utils';
import { SearchEntry, cycleIndex, defaultEntries, searchEntries } from './search-index.utils';

interface ShortcutRow {
  readonly keys: readonly string[];
  readonly label: string;
}

const DIFFICULTY_LED: Readonly<Record<Difficulty, LedColor>> = {
  [Difficulty.Easy]: 'easy',
  [Difficulty.Medium]: 'amber',
  [Difficulty.Hard]: 'signal',
  [Difficulty.UltraHard]: 'red',
};

const RESULT_LIMIT = 8;
const SEARCH_MODE_SHORTCUTS = 5;

@Component({
  selector: 'ohno-command-palette',
  imports: [FaIconComponent, OhnoEngraving, OhnoKbd, OhnoLed, OhnoPlate],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class OhnoCommandPalette {
  private readonly palette = inject(CommandPaletteService);
  private readonly registry = inject(AlgorithmRegistry);
  private readonly recent = inject(RecentAlgorithmsStore);
  private readonly router = inject(Router);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly injector = inject(Injector);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { search: faMagnifyingGlass };
  protected readonly open = this.palette.open;
  protected readonly mode = this.palette.mode;
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  private previouslyFocused: HTMLElement | null = null;

  private readonly entries = computed<readonly SearchEntry[]>(() => {
    this.language.activeLang();
    const catalog = this.registry.all();
    return catalog.map((item) => this.toEntry(item, catalog));
  });

  protected readonly results = computed(() => {
    const query = this.query();
    if (query.trim().length === 0) {
      return defaultEntries(this.entries(), this.recent.entries().map((entry) => entry.id), RESULT_LIMIT);
    }
    return searchEntries(this.entries(), query, RESULT_LIMIT);
  });

  protected readonly activeOptionId = computed(() =>
    this.results().length > 0 ? `ohno-palette-option-${this.activeIndex()}` : null,
  );

  protected readonly placeholder = computed(() =>
    this.translate(I18N_KEY.core.instrument.palette.placeholder, { count: this.registry.all().length }),
  );

  protected readonly noResultsLabel = computed(() =>
    this.translate(I18N_KEY.core.instrument.palette.noResults, { query: this.query().trim() }),
  );

  protected readonly shortcutRows = computed<readonly ShortcutRow[]>(() => {
    const keys = I18N_KEY.core.instrument.shortcuts;
    const rows: ShortcutRow[] = [
      { keys: ['⌘K', '/'], label: this.translate(keys.search) },
      { keys: ['?'], label: this.translate(keys.shortcuts) },
      { keys: ['Esc'], label: this.translate(keys.close) },
      { keys: [this.translate(keys.spaceKey)], label: this.translate(keys.play) },
      { keys: ['←', '→'], label: this.translate(keys.step) },
      { keys: ['R'], label: this.translate(keys.reset) },
      { keys: ['[', ']'], label: this.translate(keys.tempo) },
      { keys: ['C', 'I', 'T'], label: this.translate(keys.tabs) },
      { keys: ['L'], label: this.translate(keys.log) },
    ];
    return this.mode() === 'shortcuts' ? rows : rows.slice(0, SEARCH_MODE_SHORTCUTS);
  });

  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => (open ? this.onOpened() : this.onClosed()));
    });
  }

  protected difficultyLed(difficulty: Difficulty): LedColor {
    return DIFFICULTY_LED[difficulty];
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    const action = paletteAction({
      key: event.key,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      typing: isTypingTarget(event.target),
      open: this.open(),
    });
    if (action === null) return;
    event.preventDefault();
    if (action === 'toggle') this.palette.toggle();
    else if (action === 'search') this.palette.openSearch();
    else if (action === 'shortcuts') this.palette.openShortcuts();
    else this.close();
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(cycleIndex(this.results().length, this.activeIndex(), event.key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const hit = this.results()[this.activeIndex()];
      if (hit) this.choose(hit);
    }
  }

  protected choose(hit: SearchEntry): void {
    this.close();
    void this.router.navigate(['/algorithms', hit.id]);
  }

  protected close(): void {
    this.palette.close();
  }

  private onOpened(): void {
    this.previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.query.set('');
    this.activeIndex.set(0);
    afterNextRender(() => this.input()?.nativeElement.focus(), { injector: this.injector });
  }

  private onClosed(): void {
    this.previouslyFocused?.focus({ preventScroll: true });
    this.previouslyFocused = null;
  }

  private toEntry(item: AlgorithmItem, catalog: readonly AlgorithmItem[]): SearchEntry {
    const traitIds = deriveAlgorithmTraits(item);
    const traitLabels = traitIds.map((id) => {
      const definition = ALGORITHM_TRAITS.find((trait) => trait.id === id);
      return definition ? this.translate(definition.labelKey) : id;
    });
    return {
      id: item.id,
      name: item.name,
      moduleId: moduleId(item, catalog),
      categoryId: item.category,
      subcategoryId: item.subcategory,
      categoryLabel: this.facetLabel(item.category),
      subcategoryLabel: this.facetLabel(item.subcategory),
      traits: [...traitIds, ...traitLabels],
      difficulty: item.difficulty,
    };
  }

  private facetLabel(facet: string): string {
    const key = getAlgorithmFacetLabelKey(facet);
    return key ? this.translate(key) : facet;
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
```

`command-palette.html`:

```html
@if (open()) {
  <div class="palette" (click)="close()">
    <ohno-plate
      class="palette__plate"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="I18N_KEY.core.instrument.palette.dialogLabel | transloco"
      [screws]="true"
      (click)="$event.stopPropagation()"
    >
      <div class="palette__field">
        <fa-icon class="palette__icon" [icon]="icons.search" />
        <input
          #input
          class="palette__input"
          type="text"
          role="combobox"
          autocomplete="off"
          spellcheck="false"
          aria-autocomplete="list"
          aria-controls="ohno-palette-results"
          [attr.aria-expanded]="mode() === 'search'"
          [attr.aria-activedescendant]="activeOptionId()"
          [attr.aria-label]="I18N_KEY.core.instrument.palette.inputAriaLabel | transloco"
          [placeholder]="placeholder()"
          [value]="query()"
          (input)="onInput($event)"
          (keydown)="onInputKeydown($event)"
        />
        <ohno-kbd>Esc</ohno-kbd>
      </div>

      @if (mode() === 'search') {
        <ohno-engraving>{{ I18N_KEY.core.instrument.palette.results | transloco }}</ohno-engraving>
        <ul id="ohno-palette-results" class="palette__results" role="listbox">
          @for (hit of results(); track hit.id; let index = $index) {
            <li
              class="palette__option"
              role="option"
              [id]="'ohno-palette-option-' + index"
              [class.palette__option--active]="index === activeIndex()"
              [attr.aria-selected]="index === activeIndex()"
              (pointermove)="activeIndex.set(index)"
              (click)="choose(hit)"
            >
              <ohno-led [color]="difficultyLed(hit.difficulty)" size="sm" />
              <ohno-engraving tone="dim">{{ hit.moduleId }}</ohno-engraving>
              <span class="palette__name">{{ hit.name }}</span>
              <ohno-engraving>{{ hit.categoryLabel }} · {{ hit.subcategoryLabel }}</ohno-engraving>
            </li>
          } @empty {
            <li class="palette__empty">{{ noResultsLabel() }}</li>
          }
        </ul>
      }

      <div class="palette__shortcuts">
        <ohno-engraving class="palette__shortcuts-title">{{ I18N_KEY.core.instrument.palette.shortcutsTitle | transloco }}</ohno-engraving>
        @for (row of shortcutRows(); track row.label) {
          <div class="palette__shortcut">
            <span class="palette__keys">
              @for (key of row.keys; track key) {
                <ohno-kbd>{{ key }}</ohno-kbd>
              }
            </span>
            <ohno-engraving tone="bright">{{ row.label }}</ohno-engraving>
          </div>
        }
      </div>
    </ohno-plate>
  </div>
}
```

Add `TranslocoPipe` to the component `imports` (the template uses `| transloco`).

`command-palette.scss`:

```scss
:host {
  display: contents;
}

.palette {
  position: fixed;
  inset: 0;
  z-index: var(--z-popover);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12vh 16px 16px;
  background: rgb(var(--desk-rgb) / 0.72);
}

.palette__plate {
  width: min(640px, 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ohno-fade-scale var(--duration-fast) var(--ease-out-quart);
}

.palette__field {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  padding: 0 10px 0 14px;
  border-radius: 13px;
  color: var(--ink-3);
  background: var(--screen);
  box-shadow: var(--shadow-screen);
}

.palette__field:has(.palette__input:focus-visible) {
  box-shadow: var(--shadow-screen), var(--focus-ring);
}

.palette__icon {
  font-size: 15px;
}

.palette__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ink);
  font: 400 14px/1 var(--font-ui);
}

.palette__input::placeholder {
  color: var(--ink-3);
}

.palette__results {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 50vh;
  overflow: auto;
}

.palette__option {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 11px;
  cursor: pointer;
}

.palette__option--active {
  background: var(--gradient-key-in);
  box-shadow: var(--shadow-key-in);
}

.palette__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 600 13.5px/1.2 var(--font-ui);
  color: var(--ink);
}

.palette__empty {
  padding: 12px;
  color: var(--ink-3);
  font: 400 13px/1.4 var(--font-ui);
}

.palette__shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px 16px;
  padding-top: 12px;
  border-top: 2px solid var(--groove);
}

.palette__shortcuts-title {
  grid-column: 1 / -1;
}

.palette__shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
}

.palette__keys {
  display: inline-flex;
  gap: 4px;
}
```

- [ ] **Step 7: Mount it in `App`**

`src/app/app.html`:

```html
<router-outlet />
<ohno-command-palette />
```

In `src/app/app.ts` import `OhnoCommandPalette` from `./core/layout/command-palette/command-palette` and add it to `imports: [RouterOutlet, OhnoCommandPalette]`; also add `changeDetection: ChangeDetectionStrategy.OnPush` to `App` (it never had it).

- [ ] **Step 8: Verify**

```bash
npm run test:algorithms 2>&1 | tail -3 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete"
```

In the browser on `/algorithms` (still the old catalog): press `⌘K` — the palette opens with the input focused and the three most recent modules first; type `graf` → graph modules; ArrowDown twice + Enter → navigates to that module and the palette closes; press `?` → the palette opens in shortcuts mode with nine rows; `Esc` closes and focus returns to the previously focused element; typing `/` inside the palette input does not reopen anything; on the old workbench `/algorithms/bubble-sort` the shortcuts still work.

- [ ] **Step 9: Commit**

```bash
git add src/app/core/layout/command-palette src/app/app.ts src/app/app.html src/app/core/i18n/i18n-keys.ts public/i18n/pl.json public/i18n/en.json
git commit -m "$(cat <<'EOF'
Add the command palette

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Bank sidebar and the instrument shell; chrome deletions

**Files:**
- Modify: `src/app/core/services/navigation-service.ts` (algorithms-only model)
- Modify: `src/app/core/models/navigation.ts` (drop the tab types)
- Create: `src/app/core/layout/bank-sidebar/bank-sidebar.ts`, `.html`, `.scss`
- Create: `src/app/core/layout/bank-sidebar/bank-rows.utils.ts`, `bank-rows.utils.spec.ts`
- Modify: `src/app/core/layout/shell/shell.ts`, `shell.html`, `shell.scss`
- Delete: `src/app/core/layout/navbar/` (whole folder incl. `navbar-tab-deck/`), `src/app/core/layout/sidebar/` (incl. `nav-icon.ts`), `src/app/core/layout/language-switcher/` (incl. `world-flag-globe/`), `src/app/core/layout/bg-energy-layer/`, `public/data/world-flag-markers.json`, `public/data/world-country-surface-dots.json`, `public/data/world-country-boundary-dots.json`, `src/app/shared/components/shader-card-effect/`, `src/app/shared/insane-shader-pool.service.ts`, `src/app/shared/components/difficulty-filter/`, `src/app/shared/components/roadmap-card-overlay/`, `src/app/shared/components/trace-table/` (empty dirs), `src/app/shared/styles/_chrome-pill.scss`, the dead `getDifficultyLabel` function (and its `EN_LABELS`/`PL_LABELS`) in `src/app/core/i18n/difficulty-label.ts`
- Modify: `package.json` (remove `three`, `@types/three`)

**Interfaces:**
- Produces: `NavigationService` with `sidebarGroups`, `activeItemKey`, `activeGroupId: Signal<string>`, `activeItem`, `setActiveItem(groupId, itemId)`; `BankRow { readonly groupId: string; readonly itemId: string; readonly label: string; readonly count: number; readonly active: boolean }`, `buildBankRows(groups, activeGroupId, allLabel)`; `OhnoBankSidebar` (`ohno-bank-sidebar`); the shell layout Task 8's page renders into.
- Consumes: `I18N_KEY.core.instrument.*` (Task 3), `RecentAlgorithmsStore` (Task 4), `CommandPaletteService` (Task 5), `OhnoPlate/OhnoEngraving/OhnoLed/OhnoReadout/OhnoKbd/OhnoLangToggle` (Phase 1).

**Keep (still used by the old workbench, deleted in Phase 3/5):** `shared/components/{button,ui-tag,segmented-panel,code-language-dial,copy-code-button,math-text,popover,table,viz-options-menu}`, `shared/controls/{slider,select,number-input,text-input,_control-chrome.scss,base-control-value-accessor.ts}`, `shared/styles/{_eyebrow.scss,_trace-chip.scss}`, `shared/category-theme.ts`, `shared/difficulty-theme.ts`, `core/i18n/difficulty-label.ts` (`getDifficultyLabelKey` only), `shared/pipes/i18n-text.pipe.ts`.

- [ ] **Step 1: Failing spec for the bank rows**

`bank-rows.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { SidebarGroup } from '../../models/navigation';
import { buildBankRows } from './bank-rows.utils';

const groups: readonly SidebarGroup[] = [
  { id: 'overview', label: 'Przeglądaj', items: [{ id: 'all-algorithms', label: 'Wszystkie algorytmy', count: 102, sectionTitle: '', filter: {} }] },
  {
    id: 'sorting',
    label: 'Sortowanie',
    items: [
      { id: 'all-sorting', label: 'Wszystkie', count: 11, sectionTitle: '', filter: { category: 'sorting' } },
      { id: 'comparison', label: 'Porównawcze', count: 8, sectionTitle: '', filter: { category: 'sorting', subcategory: 'comparison' } },
    ],
  },
];

describe('buildBankRows', () => {
  it('makes one row per group pointing at its first item, with the overview relabelled', () => {
    const rows = buildBankRows(groups, 'sorting', 'Wszystkie');
    expect(rows).toEqual([
      { groupId: 'overview', itemId: 'all-algorithms', label: 'Wszystkie', count: 102, active: false },
      { groupId: 'sorting', itemId: 'all-sorting', label: 'Sortowanie', count: 11, active: true },
    ]);
  });

  it('skips a group without items', () => {
    expect(buildBankRows([{ id: 'empty', label: 'x', items: [] }], 'empty', 'All')).toEqual([]);
  });
});
```

Run: `npx vitest run --config vitest.config.ts src/app/core/layout/bank-sidebar` — Expected: FAIL, missing module.

- [ ] **Step 2: Implement the util**

`bank-rows.utils.ts`:

```ts
import { SidebarGroup } from '../../models/navigation';

export interface BankRow {
  readonly groupId: string;
  readonly itemId: string;
  readonly label: string;
  readonly count: number;
  readonly active: boolean;
}

const OVERVIEW_GROUP_ID = 'overview';

export function buildBankRows(
  groups: readonly SidebarGroup[],
  activeGroupId: string,
  allLabel: string,
): readonly BankRow[] {
  return groups.flatMap((group) => {
    const first = group.items[0];
    if (!first) return [];
    return [{
      groupId: group.id,
      itemId: first.id,
      label: group.id === OVERVIEW_GROUP_ID ? allLabel : group.label,
      count: first.count,
      active: group.id === activeGroupId,
    }];
  });
}
```

Run the spec again — Expected: PASS (2 tests).

- [ ] **Step 3: Slim `NavigationService` to the algorithms model**

In `src/app/core/services/navigation-service.ts`:

1. Delete lines 13–30 (`NavTabDefinition` and `NAV_TABS`) and line 46 (`type SidebarTabId = NavTabId;`). Change the models import to `import { SidebarFilter, SidebarGroup, SidebarItem } from '../models/navigation';` and delete the `StructureRegistry` import.
2. Delete the whole `STRUCTURES_SIDEBAR` constant (lines 322–463).
3. Replace everything from `const DEFAULT_ACTIVE_ITEM_KEY` (line 464) to the end of the file with:

```ts
const DEFAULT_ACTIVE_ITEM_KEY = 'overview:all-algorithms';
const BASE_PATH = '/algorithms';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly algorithms = inject(AlgorithmRegistry);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly sidebarGroups: Signal<readonly SidebarGroup[]> = computed(() => {
    this.language.activeLang();
    return ALGORITHMS_SIDEBAR.map((group) => ({
      id: group.id,
      label: this.transloco.translate(group.labelKey),
      items: group.items.map((item) => ({
        id: item.id,
        label: this.transloco.translate(item.labelKey),
        count: this.algorithms.count(item.filter),
        sectionTitle: this.transloco.translate(item.sectionTitleKey),
        filter: item.filter,
      })),
    }));
  });

  private readonly activeItemState = signal(DEFAULT_ACTIVE_ITEM_KEY);
  readonly activeItemKey: Signal<string> = this.activeItemState.asReadonly();
  readonly activeGroupId: Signal<string> = computed(() => this.activeItemKey().split(':')[0]);

  readonly activeItem: Signal<SidebarItem | null> = computed(
    () => this.getItemByKey(this.sidebarGroups(), this.activeItemKey()),
  );

  constructor() {
    effect(() => {
      const groups = this.sidebarGroups();
      const routedKey = this.findItemKeyByRoute(groups, this.currentUrl());
      if (routedKey) {
        this.activeItemState.set(routedKey);
        return;
      }
      if (this.getItemByKey(groups, this.activeItemKey())) return;
      this.activeItemState.set(DEFAULT_ACTIVE_ITEM_KEY);
    });
  }

  setActiveItem(groupId: string, itemId: string): void {
    const key = `${groupId}:${itemId}`;
    const item = this.getItemByKey(this.sidebarGroups(), key);
    if (!item) return;
    this.activeItemState.set(key);
    void this.router.navigate([BASE_PATH], { queryParams: this.filterToQueryParams(item.filter) });
  }

  private getItemByKey(groups: readonly SidebarGroup[], key: string): SidebarItem | null {
    for (const group of groups) {
      for (const item of group.items) {
        if (`${group.id}:${item.id}` === key) return item;
      }
    }
    return null;
  }

  private findItemKeyByRoute(groups: readonly SidebarGroup[], url: string): string | null {
    const routeFilter = this.getFilterFromUrl(url);
    if (!routeFilter) return null;
    return this.findItemKeyByFilter(groups, routeFilter);
  }

  private getFilterFromUrl(url: string): SidebarFilter | null {
    const parsed = this.router.parseUrl(url);
    const segments = parsed.root.children['primary']?.segments.map((segment) => segment.path) ?? [];
    if (segments.length !== 1 || segments[0] !== 'algorithms') return null;
    const category = parsed.queryParams['category'];
    const subcategory = parsed.queryParams['subcategory'];
    return {
      category: typeof category === 'string' && category.length > 0 ? category : undefined,
      subcategory: typeof subcategory === 'string' && subcategory.length > 0 ? subcategory : undefined,
    };
  }

  private findItemKeyByFilter(groups: readonly SidebarGroup[], filterValue: SidebarFilter): string | null {
    const exactKey = this.findMatchingItemKey(groups, filterValue);
    if (exactKey) return exactKey;
    if (filterValue.category && filterValue.subcategory) {
      return this.findMatchingItemKey(groups, { category: filterValue.category });
    }
    return this.findMatchingItemKey(groups, {});
  }

  private findMatchingItemKey(groups: readonly SidebarGroup[], filterValue: SidebarFilter): string | null {
    for (const group of groups) {
      for (const item of group.items) {
        if (item.filter.category === filterValue.category && item.filter.subcategory === filterValue.subcategory) {
          return `${group.id}:${item.id}`;
        }
      }
    }
    return null;
  }

  private filterToQueryParams(filterValue: SidebarFilter): Record<string, string> {
    const queryParams: Record<string, string> = {};
    if (filterValue.category) queryParams['category'] = filterValue.category;
    if (filterValue.subcategory) queryParams['subcategory'] = filterValue.subcategory;
    return queryParams;
  }
}
```

4. In `src/app/core/models/navigation.ts` delete `NavTabId` and `NavTab`; keep `SidebarFilter`, `SidebarItem`, `SidebarGroup`.

- [ ] **Step 4: Create `OhnoBankSidebar`**

`bank-sidebar.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AlgorithmRegistry } from '../../../features/algorithms/registry/algorithm-registry/algorithm-registry';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoKbd } from '../../../shared/instrument/kbd/kbd';
import { LangToggleOption, OhnoLangToggle } from '../../../shared/instrument/lang-toggle/lang-toggle';
import { OhnoLed } from '../../../shared/instrument/led/led';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { OhnoReadout } from '../../../shared/instrument/readout/readout';
import { AppLang, isAppLang } from '../../i18n/app-lang';
import { AppLanguageService } from '../../i18n/app-language.service';
import { I18N_KEY } from '../../i18n/i18n-keys';
import { RecentAlgorithmsStore } from '../../recent/recent-algorithms-store';
import { NavigationService } from '../../services/navigation-service';
import { CommandPaletteService } from '../command-palette/command-palette.service';
import { BankRow, buildBankRows } from './bank-rows.utils';

interface RecentRow {
  readonly id: string;
  readonly name: string;
  readonly step: number;
  readonly total: number;
  readonly percent: number;
  readonly finished: boolean;
}

@Component({
  selector: 'ohno-bank-sidebar',
  imports: [OhnoEngraving, OhnoKbd, OhnoLangToggle, OhnoLed, OhnoPlate, OhnoReadout, RouterLink, TranslocoPipe],
  templateUrl: './bank-sidebar.html',
  styleUrl: './bank-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoBankSidebar {
  private readonly navigation = inject(NavigationService);
  private readonly registry = inject(AlgorithmRegistry);
  private readonly recent = inject(RecentAlgorithmsStore);
  private readonly palette = inject(CommandPaletteService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly activeLang = this.language.activeLang;
  protected readonly langOptions: readonly LangToggleOption[] = this.language.options.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  protected readonly rows = computed<readonly BankRow[]>(() => {
    this.language.activeLang();
    return buildBankRows(
      this.navigation.sidebarGroups(),
      this.navigation.activeGroupId(),
      this.transloco.translate(I18N_KEY.core.instrument.bank.all),
    );
  });

  protected readonly recentRows = computed<readonly RecentRow[]>(() =>
    this.recent.entries().flatMap((entry) => {
      const item = this.registry.getById(entry.id);
      if (!item) return [];
      const percent = entry.total > 0 ? Math.round((entry.step / entry.total) * 100) : 0;
      return [{ id: entry.id, name: item.name, step: entry.step, total: entry.total, percent, finished: entry.finished }];
    }),
  );

  protected select(row: BankRow): void {
    this.navigation.setActiveItem(row.groupId, row.itemId);
  }

  protected openShortcuts(): void {
    this.palette.openShortcuts();
  }

  protected setLang(value: string): void {
    if (isAppLang(value)) this.language.setActiveLang(value as AppLang);
  }
}
```

`bank-sidebar.html`:

```html
<ohno-plate class="bank" [screws]="true" padding="none">
  <a class="bank__brand" routerLink="/algorithms" [attr.aria-label]="I18N_KEY.core.instrument.brand.homeAriaLabel | transloco">
    <span class="bank__mark" aria-hidden="true">
      <svg viewBox="9 14 46 36" fill="none">
        <ellipse cx="22.5" cy="32.5" rx="9.6" ry="11.6" stroke="currentColor" stroke-width="4" />
        <path d="M33.5 17.5V46M33.5 31.2l6.4-4.6 5.8 1 4.6 6.6V46" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />
        <circle class="bank__mark-dot" cx="50.3" cy="46" r="3" />
      </svg>
    </span>
    <span class="bank__brand-text">
      <span class="bank__name">Oh<i>(</i>no<i>)</i></span>
      <ohno-engraving class="bank__tag">{{ I18N_KEY.core.instrument.brand.tagline | transloco }}</ohno-engraving>
    </span>
  </a>

  <ohno-engraving class="bank__title">{{ I18N_KEY.core.instrument.bank.algorithms | transloco }}</ohno-engraving>
  <nav class="bank__rows" [attr.aria-label]="I18N_KEY.core.instrument.bank.navAriaLabel | transloco">
    @for (row of rows(); track row.groupId) {
      <button
        type="button"
        class="bank__row"
        [class.bank__row--on]="row.active"
        [attr.aria-current]="row.active ? 'true' : null"
        (click)="select(row)"
      >
        <ohno-led color="signal" [on]="row.active" />
        <span class="bank__label">{{ row.label }}</span>
        <ohno-readout class="bank__count" [value]="row.count" [pad]="2" size="sm" [tone]="row.active ? 'signal' : 'dim'" />
      </button>
    }
  </nav>

  <hr class="bank__groove" />

  <ohno-engraving class="bank__title">{{ I18N_KEY.core.instrument.bank.structures | transloco }}</ohno-engraving>
  <div class="bank__row bank__row--off" aria-disabled="true">
    <ohno-led color="slate" [on]="false" />
    <span class="bank__label">{{ I18N_KEY.core.instrument.bank.structuresRow | transloco }}</span>
    <ohno-engraving tone="dim">{{ I18N_KEY.core.instrument.bank.comingSoon | transloco }}</ohno-engraving>
  </div>

  <hr class="bank__groove" />

  <ohno-engraving class="bank__title">{{ I18N_KEY.core.instrument.bank.recent | transloco }}</ohno-engraving>
  <div class="bank__recent" [attr.aria-label]="I18N_KEY.core.instrument.bank.recentAriaLabel | transloco">
    @for (row of recentRows(); track row.id) {
      <a class="bank__recent-row" [routerLink]="['/algorithms', row.id]">
        <b class="bank__recent-name">{{ row.name }}</b>
        <ohno-readout [value]="row.step" [total]="row.total" [pad]="3" size="sm" tone="dim" />
        <span class="bank__bar" [class.bank__bar--done]="row.finished" [style.--p]="row.percent + '%'" aria-hidden="true"></span>
      </a>
    } @empty {
      <p class="bank__recent-empty">{{ I18N_KEY.core.instrument.bank.recentEmpty | transloco }}</p>
    }
  </div>

  <div class="bank__foot">
    <button type="button" class="bank__shortcuts" (click)="openShortcuts()">
      <ohno-kbd>?</ohno-kbd>
      <ohno-engraving>{{ I18N_KEY.core.instrument.bank.shortcuts | transloco }}</ohno-engraving>
    </button>
    <ohno-lang-toggle
      [value]="activeLang()"
      [options]="langOptions"
      [label]="I18N_KEY.core.instrument.bank.languageAriaLabel | transloco"
      (valueChange)="setLang($event)"
    />
  </div>
</ohno-plate>
```

`bank-sidebar.scss` (values from `catalog.html` `.nav`, `.bank`, `.recent`, `.nav__foot` and `instrument.css` `.brand`):

```scss
:host {
  display: block;
  height: 100%;
  min-height: 0;
}

.bank {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 14px 16px;
  overflow: hidden auto;
}

.bank__brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 6px 22px;
  color: var(--ink);
  border-radius: var(--radius-key);
}

.bank__mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-key);
  background: var(--gradient-key);
  box-shadow: var(--shadow-key);
}

.bank__mark svg {
  width: 26px;
  height: 26px;
}

.bank__mark-dot {
  fill: var(--signal);
}

.bank__brand-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bank__name {
  font: 700 19px/1 var(--font-ui);
  letter-spacing: -0.02em;
}

.bank__name i {
  font-style: normal;
  color: var(--signal);
}

.bank__title {
  padding: 0 10px 10px;
}

.bank__rows {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bank__row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 12px 0 10px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: var(--ink-2);
  font: 550 14px/1 var(--font-ui);
  text-align: left;
  transition: color var(--duration-fast) var(--ease-soft);
}

.bank__row:hover {
  color: var(--ink);
}

.bank__row--on {
  color: var(--ink);
  background: var(--gradient-key-in);
  box-shadow: var(--shadow-key-in);
}

.bank__row--off {
  color: var(--ink-4);
  cursor: default;
}

.bank__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bank__groove {
  height: 2px;
  margin: 14px 8px;
  border: 0;
  border-radius: 1px;
  background: var(--groove);
  box-shadow: 0 1px 0 var(--groove-highlight);
}

.bank__recent {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 0 4px;
}

.bank__recent-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  row-gap: 8px;
  align-items: baseline;
  padding: 11px 12px 12px;
  border-radius: var(--radius-key);
  background: var(--gradient-key-in);
  box-shadow: var(--shadow-key-in);
  color: var(--ink);
}

.bank__recent-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 550 13px/1 var(--font-ui);
}

.bank__bar {
  position: relative;
  grid-column: 1 / 3;
  height: 3px;
  border-radius: 2px;
  background: var(--desk);
}

.bank__bar::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--p);
  border-radius: 2px;
  background: var(--signal);
  box-shadow: 0 0 8px var(--signal);
}

.bank__bar--done::before {
  background: var(--lime);
  box-shadow: 0 0 8px var(--lime);
}

.bank__recent-empty {
  padding: 4px 8px;
  color: var(--ink-4);
  font: 400 12.5px/1.4 var(--font-ui);
}

.bank__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding: 18px 4px 0;
}

.bank__shortcuts {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
}
```

- [ ] **Step 5: Rewrite the `Shell`**

`shell.ts`:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { OhnoBankSidebar } from '../bank-sidebar/bank-sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, OhnoBankSidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {}
```

`shell.html`:

```html
<div class="shell">
  <ohno-bank-sidebar class="shell__bank" />
  <main class="shell__main">
    <router-outlet />
  </main>
</div>
```

`shell.scss` (the mockup's absolute frame expressed as a grid: bank 252px, gutters 18/14/16, gap 16):

```scss
:host {
  display: block;
  height: 100dvh;
}

.shell {
  display: grid;
  grid-template-columns: 252px minmax(0, 1fr);
  gap: 16px;
  height: 100%;
  padding: 14px 18px 16px;
}

.shell__bank {
  min-height: 0;
}

.shell__main {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  scrollbar-gutter: stable;
  padding-bottom: 24px;
}
```

- [ ] **Step 6: Delete the old chrome and Three.js**

```bash
git rm -r -q src/app/core/layout/navbar src/app/core/layout/sidebar src/app/core/layout/language-switcher src/app/core/layout/bg-energy-layer src/app/shared/components/shader-card-effect src/app/shared/insane-shader-pool.service.ts src/app/shared/styles/_chrome-pill.scss public/data/world-flag-markers.json public/data/world-country-surface-dots.json public/data/world-country-boundary-dots.json && rmdir src/app/shared/components/difficulty-filter src/app/shared/components/roadmap-card-overlay src/app/shared/components/trace-table 2>/dev/null; rmdir public/data 2>/dev/null; npm uninstall three @types/three 2>&1 | tail -2
```

In `src/app/core/i18n/difficulty-label.ts` delete `getDifficultyLabel`, `EN_LABELS`, `PL_LABELS` and the now-unused `AppLang` import; keep `getDifficultyLabelKey`.

Then: `grep -rn "world-flag\|WorldFlagGlobe\|LanguageSwitcher\|NavbarTabDeck\|app-navbar\|app-sidebar\|NavTab\b\|NavTabId\|StructureRegistry\|from 'three'" src/app | grep -v "features/structures"` — Expected: no output (the structures registry import in the old `structures-page.ts` is deleted in Task 8).

- [ ] **Step 7: Verify**

```bash
npm run test:algorithms 2>&1 | tail -3 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete|Initial total"
```

Expected: tests pass; the build completes and the initial bundle is smaller than before (no three.js). Open `http://localhost:4200/algorithms`: the plate sidebar shows the brand, nine bank rows with Doto counts (Wszystkie 102 … Inne 21), the disabled structures row, the recent rows written in Task 4, the `?` foot key (opens the palette in shortcuts mode) and the PL/EN toggle (switching relabels the rows immediately). Clicking "Grafy" presses the row, lights its LED, sets `?category=graphs` and the old catalog page filters; reloading keeps the row pressed. The main column still shows the old catalog page (Task 8 replaces it).

- [ ] **Step 8: Commit**

```bash
git add -A src/app/core public/data package.json package-lock.json
git commit -m "$(cat <<'EOF'
Replace the navbar and sidebar with the instrument bank sidebar

Deletes the language globe with its data, the tab deck, the energy layer,
the shader card effect and Three.js.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Module preview and module card

**Files:**
- Modify: `src/app/shared/instrument/key/key.ts`, `key.html`, `key.scss` (`prefix` input, `--key-radius`)
- Modify: `src/app/shared/instrument/plate/plate.ts`, `plate.html` (`screwCorners` input)
- Modify: `src/app/dev/instrument-specimen/instrument-specimen.html` (one key with a prefix)
- Create: `src/app/features/algorithms/module-card/module-preview/module-preview.utils.ts`, `module-preview.utils.spec.ts`
- Create: `src/app/features/algorithms/module-card/module-preview/module-preview.ts`, `.html`, `.scss`
- Create: `src/app/features/algorithms/module-card/module-card.ts`, `.html`, `.scss`

**Interfaces:**
- Produces: `OhnoKey.prefix: input<string | null>(null)` (mono 10px index before the label) and the CSS variable `--key-radius`; `OhnoPlate.screwCorners: input<'all' | 'top'>('all')`; `hashSeed(id): number`, `createRng(seed): () => number`, `PreviewTone = 'slate' | 'cyan' | 'lime' | 'pink' | 'violet'`, `buildBars(seed)`, `buildBuckets(seed)`, `buildGraph(seed)`, `buildMatrix(seed)`, `buildTape(seed)`, `buildNotebook(seed)`, `buildXy(seed)`, `buildStack(seed)` (shapes in Step 3); `OhnoModulePreview` (`ohno-module-preview`, inputs `family: PreviewFamily`, `seed: number`, `live: boolean`); `OhnoModuleCard` (`ohno-module-card`, inputs `algorithm: AlgorithmItem`, `moduleId: string`).
- Consumes: `previewFamily`, `PreviewFamily` (Task 2), `moduleDescriptionKey` (Task 3), `I18N_KEY.features.algorithms.catalog.card.*` (Task 3), `getDifficultyLabelKey`.

- [ ] **Step 1: Extend the two primitives**

`key.ts`: add `readonly prefix = input<string | null>(null);` after `label`. `key.html`: inside the `#content` template, before the label block, add:

```html
  @if (prefix(); as index) {
    <span class="ohno-key__prefix">{{ index }}</span>
  }
```

`key.scss`: change `border-radius: var(--radius-key);` in `.ohno-key` to `border-radius: var(--key-radius, var(--radius-key));` and append:

```scss
.ohno-key__prefix {
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--ink-4);
}
```

`plate.ts`: add `readonly screwCorners = input<'all' | 'top'>('all');`. `plate.html`: wrap the two bottom screws:

```html
@if (screws()) {
  <i class="ohno-plate__screw ohno-plate__screw--tl" aria-hidden="true"></i>
  <i class="ohno-plate__screw ohno-plate__screw--tr" aria-hidden="true"></i>
  @if (screwCorners() === 'all') {
    <i class="ohno-plate__screw ohno-plate__screw--bl" aria-hidden="true"></i>
    <i class="ohno-plate__screw ohno-plate__screw--br" aria-hidden="true"></i>
  }
}
<ng-content />
```

Specimen: in the first key row add `<ohno-key prefix="02" label="Insertion Sort" led="signal" size="md" />`.

- [ ] **Step 2: Failing spec for the preview data**

`module-preview.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { buildBars, buildBuckets, buildGraph, buildMatrix, buildNotebook, buildStack, buildTape, buildXy, hashSeed } from './module-preview.utils';

describe('module preview data', () => {
  it('derives a stable seed from an id', () => {
    expect(hashSeed('bubble-sort')).toBe(hashSeed('bubble-sort'));
    expect(hashSeed('bubble-sort')).not.toBe(hashSeed('quick-sort'));
  });

  it('builds thirteen bars in range with a sorted lime tail and one cyan pair', () => {
    const bars = buildBars(hashSeed('bubble-sort'));
    expect(bars).toHaveLength(13);
    expect(bars.every((bar) => bar.height >= 1 && bar.height <= 14)).toBe(true);
    const tail = bars.filter((bar) => bar.tone === 'lime').map((bar) => bar.height);
    expect(tail.length).toBeGreaterThanOrEqual(2);
    expect([...tail].sort((a, b) => a - b)).toEqual(tail);
    expect(bars.filter((bar) => bar.tone === 'cyan')).toHaveLength(2);
    expect(buildBars(7)).toEqual(buildBars(7));
  });

  it('builds eight buckets with one cyan column', () => {
    const buckets = buildBuckets(hashSeed('counting-sort'));
    expect(buckets).toHaveLength(8);
    expect(buckets.every((bucket) => bucket.count >= 1 && bucket.count <= 5)).toBe(true);
    expect(buckets.filter((bucket) => bucket.tone === 'cyan')).toHaveLength(1);
  });

  it('picks a current and a frontier node that differ', () => {
    const graph = buildGraph(hashSeed('bfs'));
    expect(graph.current).not.toBe(graph.frontier);
    expect(graph.current).toBeGreaterThan(0);
  });

  it('fills the matrix in reading order up to the current cell', () => {
    const matrix = buildMatrix(hashSeed('knapsack-01'));
    expect(matrix.columns).toBe(8);
    expect(matrix.rows).toBe(4);
    expect(matrix.filled).toBeGreaterThan(0);
    expect(matrix.filled).toBeLessThan(32);
    expect(matrix.current).toBe(matrix.filled);
  });

  it('puts the tape head right after the matched prefix', () => {
    const tape = buildTape(hashSeed('kmp-pattern-matching'));
    expect(tape.cells).toHaveLength(12);
    expect(tape.cells.slice(0, tape.head).every((cell) => cell === 'lime')).toBe(true);
    expect(tape.cells[tape.head]).toBe('cyan');
  });

  it('draws notebook lines, points with a hull, and stack frames', () => {
    expect(buildNotebook(1)).toHaveLength(5);
    const xy = buildXy(hashSeed('convex-hull'));
    expect(xy.points).toHaveLength(9);
    expect(xy.hull.length).toBeGreaterThanOrEqual(3);
    expect(xy.points.every(([x, y]) => x >= 20 && x <= 225 && y >= 12 && y <= 80)).toBe(true);
    const stack = buildStack(hashSeed('recursion-call-stack'));
    expect(stack.length).toBeGreaterThanOrEqual(3);
    expect(stack[stack.length - 1].tone).toBe('cyan');
  });
});
```

Run: `npx vitest run --config vitest.config.ts src/app/features/algorithms/module-card` — Expected: FAIL, missing module.

- [ ] **Step 3: Implement the preview data**

`module-preview.utils.ts`:

```ts
export type PreviewTone = 'slate' | 'cyan' | 'lime' | 'pink' | 'violet';

export interface PreviewBar {
  readonly height: number;
  readonly tone: PreviewTone;
}

export interface PreviewBucket {
  readonly count: number;
  readonly tone: PreviewTone;
}

export interface PreviewGraph {
  readonly current: number;
  readonly frontier: number;
}

export interface PreviewMatrix {
  readonly columns: number;
  readonly rows: number;
  readonly filled: number;
  readonly current: number;
  readonly pink: number;
}

export interface PreviewTape {
  readonly cells: readonly PreviewTone[];
  readonly head: number;
}

export interface PreviewLine {
  readonly width: number;
  readonly tone: PreviewTone;
}

export interface PreviewXy {
  readonly points: readonly (readonly [number, number])[];
  readonly hull: readonly number[];
  readonly pink: number;
}

export function hashSeed(id: string): number {
  let hash = 0x811c9dc5;
  for (const char of id) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng: () => number, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

export function buildBars(seed: number): readonly PreviewBar[] {
  const rng = createRng(seed);
  const tailLength = pick(rng, 2, 4);
  const bodyLength = 13 - tailLength;
  const body = Array.from({ length: bodyLength }, () => pick(rng, 1, 10));
  const cyanAt = pick(rng, 0, bodyLength - 2);
  const bars: PreviewBar[] = body.map((height, index) => ({
    height,
    tone: index === cyanAt || index === cyanAt + 1 ? 'cyan' : 'slate',
  }));
  for (let index = 0; index < tailLength; index += 1) {
    bars.push({ height: 11 + index, tone: 'lime' });
  }
  return bars;
}

export function buildBuckets(seed: number): readonly PreviewBucket[] {
  const rng = createRng(seed);
  const cyanAt = pick(rng, 0, 7);
  return Array.from({ length: 8 }, (_, index) => ({
    count: pick(rng, 1, 5),
    tone: index === cyanAt ? 'cyan' : 'slate',
  }));
}

export function buildGraph(seed: number): PreviewGraph {
  const rng = createRng(seed);
  const current = pick(rng, 1, 6);
  let frontier = pick(rng, 1, 6);
  if (frontier === current) frontier = current === 6 ? 1 : current + 1;
  return { current, frontier };
}

export function buildMatrix(seed: number): PreviewMatrix {
  const rng = createRng(seed);
  const columns = 8;
  const rows = 4;
  const filled = pick(rng, 9, 27);
  return { columns, rows, filled, current: filled, pink: filled - columns };
}

export function buildTape(seed: number): PreviewTape {
  const rng = createRng(seed);
  const head = pick(rng, 2, 8);
  const cells = Array.from({ length: 12 }, (_, index): PreviewTone => {
    if (index < head) return 'lime';
    if (index === head) return 'cyan';
    if (index === head + 1) return 'pink';
    return 'slate';
  });
  return { cells, head };
}

export function buildNotebook(seed: number): readonly PreviewLine[] {
  const rng = createRng(seed);
  return [
    { width: pick(rng, 120, 170), tone: 'slate' },
    { width: pick(rng, 90, 150), tone: 'slate' },
    { width: pick(rng, 60, 110), tone: 'cyan' },
    { width: pick(rng, 100, 160), tone: 'slate' },
    { width: pick(rng, 50, 90), tone: 'lime' },
  ];
}

export function buildXy(seed: number): PreviewXy {
  const rng = createRng(seed);
  const points = Array.from({ length: 9 }, () => [pick(rng, 20, 225), pick(rng, 12, 80)] as const);
  const indexOf = (choose: (a: readonly [number, number], b: readonly [number, number]) => boolean) =>
    points.reduce((best, point, index) => (choose(point, points[best]) ? index : best), 0);
  const hull = [...new Set([
    indexOf((a, b) => a[0] < b[0]),
    indexOf((a, b) => a[1] < b[1]),
    indexOf((a, b) => a[0] > b[0]),
    indexOf((a, b) => a[1] > b[1]),
  ])];
  const pink = points.findIndex((_, index) => !hull.includes(index));
  return { points, hull, pink: pink === -1 ? 0 : pink };
}

export function buildStack(seed: number): readonly PreviewLine[] {
  const rng = createRng(seed);
  const depth = pick(rng, 3, 5);
  return Array.from({ length: depth }, (_, index) => ({
    width: 110 - index * 12,
    tone: index === 0 ? 'lime' : index === depth - 1 ? 'cyan' : 'slate',
  }));
}
```

Run the spec — Expected: PASS (7 tests).

- [ ] **Step 4: Create `OhnoModulePreview`**

`module-preview.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PreviewFamily } from '../../data/catalog/preview-family/preview-family';
import {
  buildBars,
  buildBuckets,
  buildGraph,
  buildMatrix,
  buildNotebook,
  buildStack,
  buildTape,
  buildXy,
} from './module-preview.utils';

interface GraphNode {
  readonly x: number;
  readonly y: number;
}

const GRAPH_NODES: readonly GraphNode[] = [
  { x: 122, y: 20 },
  { x: 78, y: 44 },
  { x: 166, y: 44 },
  { x: 54, y: 68 },
  { x: 100, y: 68 },
  { x: 144, y: 68 },
  { x: 190, y: 68 },
];

const GRAPH_EDGES: readonly (readonly [number, number])[] = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
];

@Component({
  selector: 'ohno-module-preview',
  templateUrl: './module-preview.html',
  styleUrl: './module-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.preview--live]': 'live()',
    'aria-hidden': 'true',
  },
})
export class OhnoModulePreview {
  readonly family = input.required<PreviewFamily>();
  readonly seed = input.required<number>();
  readonly live = input(false);

  protected readonly graphNodes = GRAPH_NODES;
  protected readonly graphEdges = GRAPH_EDGES;

  protected readonly bars = computed(() => buildBars(this.seed()));
  protected readonly buckets = computed(() => buildBuckets(this.seed()));
  protected readonly bucketCells = computed(() =>
    this.buckets().flatMap((bucket, slot) =>
      Array.from({ length: bucket.count }, (_, row) => ({ x: 34 + slot * 23, y: 66 - row * 9, tone: bucket.tone })),
    ),
  );
  protected readonly graph = computed(() => buildGraph(this.seed()));
  protected readonly matrix = computed(() => buildMatrix(this.seed()));
  protected readonly matrixCells = computed(() => {
    const { columns, rows, filled, current, pink } = this.matrix();
    return Array.from({ length: columns * rows }, (_, index) => ({
      x: 22 + (index % columns) * 25,
      y: 14 + Math.floor(index / columns) * 17,
      tone: index === current ? 'cyan' : index === pink ? 'pink' : index < filled ? 'lime' : 'slate',
    }));
  });
  protected readonly tape = computed(() => buildTape(this.seed()));
  protected readonly notebook = computed(() => buildNotebook(this.seed()));
  protected readonly xy = computed(() => buildXy(this.seed()));
  protected readonly hullPath = computed(() =>
    this.xy().hull.map((index, position) => `${position === 0 ? 'M' : 'L'}${this.xy().points[index][0]} ${this.xy().points[index][1]}`).join(' ') + ' Z',
  );
  protected readonly stack = computed(() => buildStack(this.seed()));

  protected graphTone(index: number): string {
    const { current, frontier } = this.graph();
    if (index === current) return 'cyan';
    if (index === frontier) return 'pink';
    return 'slate';
  }
}
```

`module-preview.html`:

```html
@switch (family()) {
  @case ('bars') {
    <div class="bars">
      @for (bar of bars(); track $index) {
        <i class="bars__bar" [class]="'bars__bar bars__bar--' + bar.tone" [class.preview__current]="bar.tone === 'cyan'" [style.--h]="bar.height"></i>
      }
    </div>
  }
  @case ('buckets') {
    <svg class="svg" viewBox="0 0 245 92">
      @for (cell of bucketCells(); track $index) {
        <rect [attr.x]="cell.x" [attr.y]="cell.y" width="16" height="6" rx="1.5" [class]="'cell cell--' + cell.tone" [class.preview__current]="cell.tone === 'cyan'" />
      }
    </svg>
  }
  @case ('graph') {
    <svg class="svg" viewBox="0 0 245 92">
      @for (edge of graphEdges; track $index) {
        <line class="edge" [attr.x1]="graphNodes[edge[0]].x" [attr.y1]="graphNodes[edge[0]].y" [attr.x2]="graphNodes[edge[1]].x" [attr.y2]="graphNodes[edge[1]].y" />
      }
      <path class="arc" [attr.d]="'M' + (graphNodes[0].x + 14) + ' ' + (graphNodes[0].y - 2) + 'c30-6 54 12 56 38'" />
      @for (node of graphNodes; track $index; let index = $index) {
        <circle [attr.cx]="node.x" [attr.cy]="node.y" [attr.r]="index === 0 ? 7.5 : 6.5" [class]="'node node--' + graphTone(index)" [class.preview__current]="graphTone(index) === 'cyan'" />
      }
    </svg>
  }
  @case ('matrix') {
    <svg class="svg" viewBox="0 0 245 92">
      @for (cell of matrixCells(); track $index) {
        <rect [attr.x]="cell.x" [attr.y]="cell.y" width="21" height="13" rx="2" [class]="'cell cell--' + cell.tone" [class.preview__current]="cell.tone === 'cyan'" />
      }
    </svg>
  }
  @case ('tape') {
    <svg class="svg" viewBox="0 0 245 92">
      @for (cell of tape().cells; track $index; let index = $index) {
        <rect [attr.x]="18 + index * 17.5" y="36" width="14" height="22" rx="3" [class]="'cell cell--' + cell" [class.preview__current]="cell === 'cyan'" />
      }
      <path class="reader" [attr.d]="'M' + (25 + tape().head * 17.5) + ' 30 l-5 -8 h10 z'" />
    </svg>
  }
  @case ('notebook') {
    <svg class="svg" viewBox="0 0 245 92">
      @for (line of notebook(); track $index; let index = $index) {
        <rect x="30" [attr.y]="14 + index * 14" [attr.width]="line.width" height="5" rx="2.5" [class]="'line line--' + line.tone" [class.preview__current]="line.tone === 'cyan'" />
      }
      <circle class="margin-dot" cx="18" cy="44.5" r="3" />
    </svg>
  }
  @case ('xy') {
    <svg class="svg" viewBox="0 0 245 92">
      <path class="hull" [attr.d]="hullPath()" />
      @for (point of xy().points; track $index; let index = $index) {
        <circle [attr.cx]="point[0]" [attr.cy]="point[1]" r="3.5" [class]="'point point--' + (xy().hull.includes(index) ? 'cyan' : index === xy().pink ? 'pink' : 'slate')" [class.preview__current]="xy().hull.includes(index)" />
      }
    </svg>
  }
  @case ('stack') {
    <div class="stack">
      @for (frame of stack(); track $index) {
        <i class="stack__frame" [class]="'stack__frame stack__frame--' + frame.tone" [class.preview__current]="frame.tone === 'cyan'" [style.width.px]="frame.width"></i>
      }
    </div>
  }
}
```

`module-preview.scss`:

```scss
:host {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
}

.svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.bars {
  position: absolute;
  inset: auto 0 12px 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
}

.bars__bar {
  width: 11px;
  height: calc(var(--h) * 4.4px);
  border-radius: 2px 2px 0 0;
  background: repeating-linear-gradient(to top, var(--bar-color, var(--slate)) 0 3px, transparent 3px 4.4px);
  opacity: 0.55;
}

.bars__bar--cyan { --bar-color: var(--cyan); opacity: 0.95; }
.bars__bar--lime { --bar-color: var(--lime); opacity: 0.9; }
.bars__bar--pink { --bar-color: var(--pink); opacity: 0.95; }

.stack {
  position: absolute;
  inset: auto 0 12px 0;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 5px;
}

.stack__frame {
  height: 11px;
  border-radius: 3px;
  background: repeating-linear-gradient(to right, var(--frame-color, var(--slate)) 0 3px, transparent 3px 4.4px);
  opacity: 0.55;
}

.stack__frame--cyan { --frame-color: var(--cyan); opacity: 0.95; }
.stack__frame--lime { --frame-color: var(--lime); opacity: 0.9; }

.cell,
.node,
.point,
.line {
  fill: var(--slate);
  opacity: 0.6;
}

.cell--cyan, .node--cyan, .point--cyan, .line--cyan { fill: var(--cyan); opacity: 1; }
.cell--lime, .line--lime { fill: var(--lime); opacity: 0.9; }
.cell--pink, .node--pink, .point--pink { fill: var(--pink); opacity: 1; }

.edge {
  stroke: rgb(var(--slate-rgb) / 0.6);
  stroke-width: 1.2;
}

.arc,
.hull {
  fill: none;
  stroke: var(--cyan);
  stroke-width: 1.2;
  stroke-dasharray: 3 3;
}

.reader {
  fill: var(--cyan);
}

.margin-dot {
  fill: var(--violet);
}

:host(.preview--live) .preview__current {
  animation: ohno-preview-pulse 1s ease-in-out 2;
  filter: drop-shadow(0 0 6px rgb(var(--cyan-rgb) / 0.6));
}

@keyframes ohno-preview-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
```

- [ ] **Step 5: Create `OhnoModuleCard`**

`module-card.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { moduleDescriptionKey } from '../../../core/i18n/module-description-key';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoLed } from '../../../shared/instrument/led/led';
import { LedColor } from '../../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { OhnoReadout } from '../../../shared/instrument/readout/readout';
import { OhnoScreen } from '../../../shared/instrument/screen/screen';
import { previewFamily } from '../data/catalog/preview-family/preview-family';
import { AlgorithmItem, Difficulty } from '../models/algorithm';
import { OhnoModulePreview } from './module-preview/module-preview';
import { hashSeed } from './module-preview/module-preview.utils';

const DIFFICULTY_LED: Readonly<Record<Difficulty, LedColor>> = {
  [Difficulty.Easy]: 'easy',
  [Difficulty.Medium]: 'amber',
  [Difficulty.Hard]: 'signal',
  [Difficulty.UltraHard]: 'red',
};

@Component({
  selector: 'ohno-module-card',
  imports: [FaIconComponent, OhnoEngraving, OhnoLed, OhnoModulePreview, OhnoPlate, OhnoReadout, OhnoScreen, RouterLink, TranslocoPipe],
  templateUrl: './module-card.html',
  styleUrl: './module-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoModuleCard {
  readonly algorithm = input.required<AlgorithmItem>();
  readonly moduleId = input.required<string>();

  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { open: faChevronRight };
  protected readonly live = signal(false);

  protected readonly link = computed(() => ['/algorithms', this.algorithm().id]);
  protected readonly family = computed(() => previewFamily(this.algorithm()));
  protected readonly seed = computed(() => hashSeed(this.algorithm().id));
  protected readonly difficultyLed = computed(() => DIFFICULTY_LED[this.algorithm().difficulty]);
  protected readonly difficultyLabel = computed(() => this.translate(getDifficultyLabelKey(this.algorithm().difficulty)));
  protected readonly description = computed(() => {
    const key = moduleDescriptionKey(this.algorithm().id);
    const translated = this.translate(key);
    return translated === key ? this.algorithm().description : translated;
  });
  protected readonly openAriaLabel = computed(() =>
    this.translate(I18N_KEY.features.algorithms.catalog.card.openAriaLabel, { name: this.algorithm().name }),
  );

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
```

`module-card.html`:

```html
<a
  class="module"
  [routerLink]="link()"
  queryParamsHandling="preserve"
  [attr.aria-label]="openAriaLabel()"
  (mouseenter)="live.set(true)"
  (mouseleave)="live.set(false)"
  (focus)="live.set(true)"
  (blur)="live.set(false)"
>
  <ohno-plate class="module__plate" [class.module__plate--live]="live()" [screws]="true" screwCorners="top" padding="none">
    <div class="module__top">
      <ohno-engraving>{{ moduleId() }}</ohno-engraving>
      <span class="module__difficulty">
        <ohno-led [color]="difficultyLed()" />
        <ohno-engraving tone="bright">{{ difficultyLabel() }}</ohno-engraving>
      </span>
    </div>
    <ohno-screen class="module__screen">
      @if (live()) {
        <span class="module__live">
          <ohno-led color="signal" [pulse]="true" size="sm" />
          <ohno-engraving tone="signal">{{ I18N_KEY.features.algorithms.catalog.card.live | transloco }}</ohno-engraving>
        </span>
      }
      <ohno-module-preview [family]="family()" [seed]="seed()" [live]="live()" />
    </ohno-screen>
    <h3 class="module__name">{{ algorithm().name }}</h3>
    <p class="module__description">{{ description() }}</p>
    <div class="module__foot">
      <ohno-readout class="module__complexity" [value]="algorithm().complexity.timeAverage" size="sm" />
      <ohno-engraving>{{ I18N_KEY.features.algorithms.catalog.card.time | transloco }}</ohno-engraving>
      <span class="module__go" [class.module__go--signal]="live()" aria-hidden="true">
        <fa-icon [icon]="icons.open" />
      </span>
    </div>
  </ohno-plate>
</a>
```

`module-card.scss` (values from `catalog.html` `.mod*`, `.live`):

```scss
:host {
  display: block;
}

.module {
  display: block;
  color: inherit;
  border-radius: var(--radius-card);
}

.module:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.module__plate {
  display: flex;
  flex-direction: column;
  height: 252px;
  padding: 13px 14px 14px;
  border-radius: var(--radius-card);
  transition: background var(--duration-fast) var(--ease-soft), box-shadow var(--duration-fast) var(--ease-soft);
}

.module__plate--live {
  background: var(--gradient-plate-hover);
  box-shadow: var(--shadow-plate-hover);
}

.module__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 16px;
  padding: 0 14px;
}

.module__difficulty {
  display: flex;
  align-items: center;
  gap: 7px;
}

.module__screen {
  position: relative;
  margin-top: 10px;
  height: 92px;
  border-radius: 11px;
  transition: box-shadow var(--duration-fast) var(--ease-soft);
}

.module__plate--live .module__screen {
  box-shadow: var(--shadow-screen), 0 0 0 1px rgb(var(--signal-rgb) / 0.25);
}

.module__live {
  position: absolute;
  z-index: 2;
  left: 10px;
  top: 9px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.module__name {
  margin-top: 13px;
  padding: 0 2px;
  font: 650 18px/1 var(--font-ui);
  letter-spacing: -0.015em;
  color: var(--ink);
}

.module__description {
  height: 34px;
  margin-top: 7px;
  padding: 0 2px;
  overflow: hidden;
  font: 400 12.5px/17px var(--font-ui);
  color: var(--ink-3);
}

.module__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-left: 2px;
}

.module__foot .module__complexity {
  font-size: 17px;
}

.module__go {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-left: auto;
  border-radius: 50%;
  color: var(--ink-2);
  font-size: 14px;
  background: var(--gradient-key);
  box-shadow: var(--shadow-key);
  transition: background var(--duration-instant) var(--ease-soft), box-shadow var(--duration-instant) var(--ease-soft), color var(--duration-fast) var(--ease-soft);
}

.module__go--signal {
  color: var(--paper-ink);
  background: var(--gradient-key-signal);
  box-shadow: var(--shadow-key-signal);
}
```

- [ ] **Step 6: Verify on the specimen**

Add to the specimen (imports `OhnoModuleCard`, `ALGORITHM_CATALOG`, `moduleId`) a plate with a 4-column grid of eight cards covering the eight families:

```ts
  protected readonly sampleModules = ['bubble-sort', 'counting-sort', 'heap-sort', 'knapsack-01', 'kmp-pattern-matching', 'euclidean-gcd', 'convex-hull', 'recursion-call-stack']
    .map((id) => ALGORITHM_CATALOG.find((item) => item.id === id)!)
    .map((item) => ({ item, moduleId: moduleId(item, ALGORITHM_CATALOG) }));
```

```html
  <ohno-plate class="specimen__unit" [screws]="true">
    <ohno-engraving>Karty modułów · osiem rodzin</ohno-engraving>
    <div class="specimen__cards">
      @for (sample of sampleModules; track sample.item.id) {
        <ohno-module-card [algorithm]="sample.item" [moduleId]="sample.moduleId" />
      }
    </div>
  </ohno-plate>
```

SCSS: `.specimen__cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }`.

```bash
npm run test:algorithms 2>&1 | tail -3 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete" && node tools/screenshot.mjs http://localhost:4200/dev/instrument proj-info/shots/p2-task7-cards.png 1440 2600 2
```

Expected: the eight cards match the module cards of image 01 (engraved id, difficulty LED, dotted screen with the family drawing, 18px name, two-line PL description, Doto complexity + "czas", round key); hovering a card brightens the plate, rings the screen orange, shows "● NA ŻYWO", pulses the cyan element twice and turns the round key orange; Tab focus does the same and shows the orange ring.

- [ ] **Step 7: Commit**

```bash
git add src/app/shared/instrument/key src/app/shared/instrument/plate src/app/dev src/app/features/algorithms/module-card
git commit -m "$(cat <<'EOF'
Add module card and the eight family previews

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: The catalog page — marquee, tools, starter path, groups, deferred grid; old catalog deletions

**Files:**
- Create: `src/app/features/algorithms/algorithms-page/catalog-groups.utils.ts`, `catalog-groups.utils.spec.ts`
- Create: `src/app/features/algorithms/algorithms-page/marquee.utils.ts`, `marquee.utils.spec.ts`
- Rewrite: `src/app/features/algorithms/algorithms-page/algorithms-page.ts`, `.html`, `.scss`
- Delete: `src/app/features/algorithms/algorithms-page/algorithms-page.utils/` (old utils + spec), `src/app/features/algorithms/algorithm-card/` (whole folder: card, preview, preview-spec, `.shared.ts`, specs, utils), `src/app/shared/directives/roadmap-overlay/`, `src/app/shared/styles/_browse-card.scss`, `src/app/shared/controls/multi-select/`, `src/app/shared/controls/select-button/`, `src/app/features/structures/structures-page/`, `src/app/features/structures/structure-card/`, `src/app/features/structures/structures.routes.ts`
- Modify: `vitest.config.ts` (coverage include entries for deleted folders)
- Modify: `src/app/shared/instrument/search-field/search-field.scss`, `src/app/shared/instrument/latch/latch.scss`, `src/app/shared/instrument/key/key.scss` (size hooks described in Step 3)

**Interfaces:**
- Produces: `CatalogGroupView { readonly id: string; readonly label: string; readonly items: readonly AlgorithmItem[] }`, `buildCatalogGroups(groups, activeItemKey, resolve, active)`; `MarqueeStat { readonly label: string; readonly value: number }`, `buildMarqueeStats(groups, activeGroupId, labels: { modules, categories, groups })`, `bankIndex(groups, activeGroupId): string | null`, `marqueeFontSize(label, maxWidth = 600, maxSize = 58, minSize = 26)`; the rewritten `AlgorithmsPage` (selector stays `app-algorithms-page`, route unchanged).
- Consumes: Tasks 2–7 (`moduleId`, `previewFamily` via the card, `CATALOG_PATHS`/`pathForGroup`/`pathProgress`, `ALL_DIFFICULTIES`/`filterByDifficulty`/`toggleDifficulty`, `I18N_KEY.features.algorithms.catalog.*`, `RecentAlgorithmsStore.finishedIds`, `CommandPaletteService.openSearch`, `NavigationService.sidebarGroups/activeItemKey/activeGroupId`, `OhnoModuleCard`), Phase 1 primitives (`ohno-screen`, `ohno-engraving`, `ohno-readout`, `ohno-search-field`, `ohno-latch`, `ohno-plate`, `ohno-key`).

- [ ] **Step 1: Failing specs**

`catalog-groups.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { SidebarFilter, SidebarGroup } from '../../../core/models/navigation';
import { ALGORITHM_CATALOG } from '../data/catalog/catalog';
import { ALL_DIFFICULTIES } from '../data/catalog/difficulty-filter/difficulty-filter';
import { Difficulty } from '../models/algorithm';
import { buildCatalogGroups, buildMarqueeStats, bankIndex } from './catalog-groups.utils';

const item = (id: string, label: string, filter: SidebarFilter, count: number) => ({ id, label, count, sectionTitle: '', filter });
const groups: readonly SidebarGroup[] = [
  { id: 'overview', label: 'Przeglądaj', items: [item('all-algorithms', 'Wszystkie', {}, 102)] },
  { id: 'sorting', label: 'Sortowanie', items: [item('all-sorting', 'Wszystkie', { category: 'sorting' }, 11), item('comparison', 'Porównawcze', { category: 'sorting', subcategory: 'comparison' }, 8), item('non-comparison', 'Nieporównawcze', { category: 'sorting', subcategory: 'non-comparison' }, 3)] },
  { id: 'searching', label: 'Wyszukiwanie', items: [item('all-searching', 'Wszystkie', { category: 'searching' }, 3), item('array-search', 'Liniowe', { category: 'searching', subcategory: 'array' }, 1), item('binary-search', 'Binarne', { category: 'searching', subcategory: 'binary' }, 2)] },
];
const resolve = (filter: SidebarFilter) =>
  ALGORITHM_CATALOG.filter((entry) => (!filter.category || entry.category === filter.category) && (!filter.subcategory || entry.subcategory === filter.subcategory));

describe('buildCatalogGroups', () => {
  it('renders one group per subcategory for a bank', () => {
    const view = buildCatalogGroups(groups, 'sorting:all-sorting', resolve, ALL_DIFFICULTIES);
    expect(view.map((group) => [group.id, group.label, group.items.length])).toEqual([['comparison', 'Porównawcze', 8], ['non-comparison', 'Nieporównawcze', 3]]);
  });

  it('renders one group per bank for the overview', () => {
    const view = buildCatalogGroups(groups, 'overview:all-algorithms', resolve, ALL_DIFFICULTIES);
    expect(view.map((group) => [group.id, group.items.length])).toEqual([['sorting', 11], ['searching', 3]]);
  });

  it('renders a single group when a subcategory is active through the URL', () => {
    const view = buildCatalogGroups(groups, 'sorting:comparison', resolve, ALL_DIFFICULTIES);
    expect(view.map((group) => group.id)).toEqual(['comparison']);
  });

  it('applies the difficulty latches and drops empty groups', () => {
    const view = buildCatalogGroups(groups, 'sorting:all-sorting', resolve, new Set([Difficulty.Easy]));
    expect(view.map((group) => [group.id, group.items.length])).toEqual([['comparison', 3], ['non-comparison', 1]]);
    expect(buildCatalogGroups(groups, 'sorting:all-sorting', resolve, new Set())).toEqual([]);
  });
});

describe('buildMarqueeStats and bankIndex', () => {
  const labels = { modules: 'Modułów', categories: 'Kategorii', groups: 'Grup' };

  it('lists modules and one stat per subcategory for a bank', () => {
    expect(buildMarqueeStats(groups, 'sorting', labels)).toEqual([
      { label: 'Modułów', value: 11 }, { label: 'Porównawcze', value: 8 }, { label: 'Nieporównawcze', value: 3 },
    ]);
    expect(bankIndex(groups, 'sorting')).toBe('01');
    expect(bankIndex(groups, 'searching')).toBe('02');
  });

  it('lists modules, banks and groups for the overview', () => {
    expect(buildMarqueeStats(groups, 'overview', labels)).toEqual([
      { label: 'Modułów', value: 102 }, { label: 'Kategorii', value: 2 }, { label: 'Grup', value: 4 },
    ]);
    expect(bankIndex(groups, 'overview')).toBeNull();
  });
});
```

`marquee.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { marqueeFontSize } from './marquee.utils';

describe('marqueeFontSize', () => {
  it('keeps short labels at the full 58px', () => {
    expect(marqueeFontSize('SORTOWANIE')).toBe(58);
    expect(marqueeFontSize('WYSZUKIWANIE')).toBe(58);
    expect(marqueeFontSize('')).toBe(58);
  });

  it('shrinks long labels to fit the screen and never below 26px', () => {
    expect(marqueeFontSize('PROGRAMOWANIE DYNAMICZNE')).toBe(32);
    expect(marqueeFontSize('A'.repeat(40))).toBe(26);
    expect(marqueeFontSize('DYNAMIC PROG.', 300)).toBe(29);
  });
});
```

Run: `npx vitest run --config vitest.config.ts src/app/features/algorithms/algorithms-page` — Expected: the two new files FAIL with "Failed to resolve import" (the old `algorithms-page.utils.spec.ts` still passes until Step 4 deletes it).

- [ ] **Step 2: Implement the utils**

`catalog-groups.utils.ts`:

```ts
import { SidebarFilter, SidebarGroup } from '../../../core/models/navigation';
import { filterByDifficulty } from '../data/catalog/difficulty-filter/difficulty-filter';
import { AlgorithmItem, Difficulty } from '../models/algorithm';

export interface CatalogGroupView {
  readonly id: string;
  readonly label: string;
  readonly items: readonly AlgorithmItem[];
}

export interface MarqueeStat {
  readonly label: string;
  readonly value: number;
}

export interface MarqueeLabels {
  readonly modules: string;
  readonly categories: string;
  readonly groups: string;
}

const OVERVIEW_GROUP_ID = 'overview';

export function buildCatalogGroups(
  groups: readonly SidebarGroup[],
  activeItemKey: string,
  resolve: (filter: SidebarFilter) => readonly AlgorithmItem[],
  active: ReadonlySet<Difficulty>,
): readonly CatalogGroupView[] {
  const [groupId, itemId] = activeItemKey.split(':');
  const group = groups.find((candidate) => candidate.id === groupId);
  const sources =
    groupId === OVERVIEW_GROUP_ID || !group
      ? groups.filter((candidate) => candidate.id !== OVERVIEW_GROUP_ID).flatMap((candidate) => {
          const first = candidate.items[0];
          return first ? [{ id: candidate.id, label: candidate.label, filter: first.filter }] : [];
        })
      : itemId === group.items[0]?.id
        ? group.items.slice(1).map((item) => ({ id: item.id, label: item.label, filter: item.filter }))
        : group.items.filter((item) => item.id === itemId).map((item) => ({ id: item.id, label: item.label, filter: item.filter }));

  return sources
    .map((source) => ({ id: source.id, label: source.label, items: filterByDifficulty(resolve(source.filter), active) }))
    .filter((view) => view.items.length > 0);
}

export function buildMarqueeStats(
  groups: readonly SidebarGroup[],
  activeGroupId: string,
  labels: MarqueeLabels,
): readonly MarqueeStat[] {
  const banks = groups.filter((group) => group.id !== OVERVIEW_GROUP_ID);
  if (activeGroupId === OVERVIEW_GROUP_ID) {
    const overview = groups.find((group) => group.id === OVERVIEW_GROUP_ID);
    return [
      { label: labels.modules, value: overview?.items[0]?.count ?? 0 },
      { label: labels.categories, value: banks.length },
      { label: labels.groups, value: banks.reduce((sum, bank) => sum + Math.max(bank.items.length - 1, 0), 0) },
    ];
  }
  const bank = banks.find((group) => group.id === activeGroupId);
  if (!bank) return [];
  const [all, ...subcategories] = bank.items;
  return [
    { label: labels.modules, value: all?.count ?? 0 },
    ...subcategories.map((item) => ({ label: item.label, value: item.count })),
  ];
}

export function bankIndex(groups: readonly SidebarGroup[], activeGroupId: string): string | null {
  const banks = groups.filter((group) => group.id !== OVERVIEW_GROUP_ID);
  const position = banks.findIndex((group) => group.id === activeGroupId);
  return position === -1 ? null : String(position + 1).padStart(2, '0');
}
```

`marquee.utils.ts`:

```ts
const DOTO_GLYPH_WIDTH_EM = 0.78;

export function marqueeFontSize(label: string, maxWidth = 600, maxSize = 58, minSize = 26): number {
  if (label.length === 0) return maxSize;
  const fitting = Math.floor(maxWidth / (DOTO_GLYPH_WIDTH_EM * label.length));
  return Math.max(minSize, Math.min(maxSize, fitting));
}
```

Run the two specs — Expected: PASS (8 tests).

- [ ] **Step 3: Rewrite the page**

`algorithms-page.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { getDifficultyLabelKey } from '../../../core/i18n/difficulty-label';
import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { CommandPaletteService } from '../../../core/layout/command-palette/command-palette.service';
import { RecentAlgorithmsStore } from '../../../core/recent/recent-algorithms-store';
import { NavigationService } from '../../../core/services/navigation-service';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoKey } from '../../../shared/instrument/key/key';
import { OhnoLatch } from '../../../shared/instrument/latch/latch';
import { LedColor } from '../../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { OhnoReadout } from '../../../shared/instrument/readout/readout';
import { OhnoScreen } from '../../../shared/instrument/screen/screen';
import { OhnoSearchField } from '../../../shared/instrument/search-field/search-field';
import { ALL_DIFFICULTIES, toggleDifficulty } from '../data/catalog/difficulty-filter/difficulty-filter';
import { moduleId } from '../data/catalog/module-id/module-id';
import { pathProgress } from '../data/catalog/path-progress/path-progress';
import { pathForGroup } from '../data/catalog/paths/paths';
import { Difficulty } from '../models/algorithm';
import { OhnoModuleCard } from '../module-card/module-card';
import { AlgorithmRegistry } from '../registry/algorithm-registry/algorithm-registry';
import { bankIndex, buildCatalogGroups, buildMarqueeStats } from './catalog-groups.utils';
import { marqueeFontSize } from './marquee.utils';

interface LatchView {
  readonly difficulty: Difficulty;
  readonly label: string;
  readonly led: LedColor;
  readonly pressed: boolean;
}

const LATCH_ORDER: readonly Difficulty[] = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard, Difficulty.UltraHard];
const DIFFICULTY_LED: Readonly<Record<Difficulty, LedColor>> = {
  [Difficulty.Easy]: 'easy',
  [Difficulty.Medium]: 'amber',
  [Difficulty.Hard]: 'signal',
  [Difficulty.UltraHard]: 'red',
};

@Component({
  selector: 'app-algorithms-page',
  imports: [OhnoEngraving, OhnoKey, OhnoLatch, OhnoModuleCard, OhnoPlate, OhnoReadout, OhnoScreen, OhnoSearchField, RouterLink, TranslocoPipe],
  templateUrl: './algorithms-page.html',
  styleUrl: './algorithms-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmsPage {
  private readonly registry = inject(AlgorithmRegistry);
  private readonly navigation = inject(NavigationService);
  private readonly recent = inject(RecentAlgorithmsStore);
  private readonly palette = inject(CommandPaletteService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  private readonly activeDifficulties = signal<ReadonlySet<Difficulty>>(ALL_DIFFICULTIES);

  private readonly moduleIds = computed(() => {
    const catalog = this.registry.all();
    return new Map(catalog.map((item) => [item.id, moduleId(item, catalog)]));
  });

  protected readonly latches = computed<readonly LatchView[]>(() =>
    LATCH_ORDER.map((difficulty) => ({
      difficulty,
      label: this.translate(getDifficultyLabelKey(difficulty)),
      led: DIFFICULTY_LED[difficulty],
      pressed: this.activeDifficulties().has(difficulty),
    })),
  );

  protected readonly groups = computed(() =>
    buildCatalogGroups(
      this.navigation.sidebarGroups(),
      this.navigation.activeItemKey(),
      (filter) => this.registry.filter(filter),
      this.activeDifficulties(),
    ),
  );

  protected readonly marqueeEyebrow = computed(() => {
    const index = bankIndex(this.navigation.sidebarGroups(), this.navigation.activeGroupId());
    return index === null
      ? this.translate(I18N_KEY.features.algorithms.catalog.marquee.overviewEyebrow)
      : this.translate(I18N_KEY.features.algorithms.catalog.marquee.eyebrow, { index });
  });

  protected readonly marqueeTitle = computed(() => {
    const groupId = this.navigation.activeGroupId();
    const group = this.navigation.sidebarGroups().find((candidate) => candidate.id === groupId);
    const label = groupId === 'overview' || !group
      ? this.translate(I18N_KEY.features.algorithms.catalog.marquee.overviewTitle)
      : group.label;
    return label.toLocaleUpperCase();
  });

  protected readonly marqueeSize = computed(() => marqueeFontSize(this.marqueeTitle()));

  protected readonly marqueeStats = computed(() =>
    buildMarqueeStats(this.navigation.sidebarGroups(), this.navigation.activeGroupId(), {
      modules: this.translate(I18N_KEY.features.algorithms.catalog.marquee.modules),
      categories: this.translate(I18N_KEY.features.algorithms.catalog.marquee.categories),
      groups: this.translate(I18N_KEY.features.algorithms.catalog.marquee.groups),
    }),
  );

  protected readonly searchPlaceholder = computed(() =>
    this.translate(I18N_KEY.core.instrument.palette.placeholder, { count: this.registry.all().length }),
  );

  protected readonly path = computed(() =>
    pathProgress(pathForGroup(this.navigation.activeGroupId()), (id) => this.registry.getById(id), this.recent.finishedIds()),
  );

  protected readonly pathTitle = computed(() => this.translate(pathForGroup(this.navigation.activeGroupId()).titleKey));

  protected moduleIdOf(id: string): string {
    return this.moduleIds().get(id) ?? '';
  }

  protected toggleLatch(difficulty: Difficulty): void {
    this.activeDifficulties.update((active) => toggleDifficulty(active, difficulty));
  }

  protected openSearch(): void {
    this.palette.openSearch();
  }

  protected stepAriaLabel(index: number, name: string): string {
    return this.translate(I18N_KEY.features.algorithms.catalog.path.stepAriaLabel, { index, name });
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
```

`algorithms-page.html`:

```html
<section class="catalog">
  <div class="catalog__row">
    <ohno-screen class="marquee" padding="none">
      <div class="marquee__title">
        <ohno-engraving>{{ marqueeEyebrow() }}</ohno-engraving>
        <ohno-readout class="marquee__name" [value]="marqueeTitle()" size="marquee" [style.font-size.px]="marqueeSize()" />
      </div>
      <div class="marquee__stats">
        @for (stat of marqueeStats(); track stat.label; let first = $first) {
          <div class="marquee__stat">
            <ohno-engraving>{{ stat.label }}</ohno-engraving>
            <ohno-readout [value]="stat.value" [pad]="2" size="lg" [tone]="first ? 'signal' : 'ink'" />
          </div>
        }
      </div>
    </ohno-screen>

    <div class="tools">
      <ohno-search-field
        class="tools__search"
        [placeholder]="searchPlaceholder()"
        [label]="I18N_KEY.core.instrument.palette.openAriaLabel | transloco"
        (open)="openSearch()"
      />
      <div class="tools__latches" role="group" [attr.aria-label]="I18N_KEY.shared.filters.difficulty.ariaLabel | transloco">
        @for (latch of latches(); track latch.difficulty) {
          <ohno-latch class="tools__latch" [label]="latch.label" [led]="latch.led" [pressed]="latch.pressed" size="lg" (pressedChange)="toggleLatch(latch.difficulty)" />
        }
      </div>
    </div>
  </div>

  <ohno-plate class="path" padding="none">
    <div class="path__label">
      <ohno-engraving>{{ I18N_KEY.features.algorithms.catalog.path.eyebrow | transloco }}</ohno-engraving>
      <b>{{ pathTitle() }}</b>
    </div>
    <div class="path__chain">
      @for (step of path().steps; track step.id; let first = $first; let index = $index) {
        @if (!first) {
          <i class="path__cable" [class.path__cable--lit]="path().steps[index - 1].done" aria-hidden="true"></i>
        }
        <ohno-key
          class="path__step"
          [prefix]="'0' + step.index"
          [label]="step.name"
          [led]="step.done ? 'lime' : 'signal'"
          [ledOn]="step.done || step.current"
          [pressed]="step.done"
          [routerLink]="['/algorithms', step.id]"
          [ariaLabel]="stepAriaLabel(step.index, step.name)"
        />
      }
    </div>
    <ohno-readout class="path__readout" [value]="path().doneCount" [total]="path().total" size="sm" [attr.aria-label]="I18N_KEY.features.algorithms.catalog.path.progressAriaLabel | transloco" />
  </ohno-plate>

  @for (group of groups(); track group.id) {
    <div class="group">
      <ohno-engraving tone="bright">{{ group.label }}</ohno-engraving>
      <ohno-readout [value]="group.items.length" [pad]="2" size="sm" tone="dim" />
    </div>
    <div class="grid">
      @for (item of group.items; track item.id) {
        @defer (on viewport) {
          <ohno-module-card [algorithm]="item" [moduleId]="moduleIdOf(item.id)" />
        } @placeholder {
          <div class="grid__slot"></div>
        }
      }
    </div>
  } @empty {
    <ohno-plate class="empty" [screws]="true">
      <ohno-screen class="empty__screen" padding="md">
        <ohno-engraving tone="bright">{{ I18N_KEY.features.algorithms.catalog.empty.title | transloco }}</ohno-engraving>
        <p class="empty__hint">{{ I18N_KEY.features.algorithms.catalog.empty.hint | transloco }}</p>
      </ohno-screen>
    </ohno-plate>
  }
</section>
```

`algorithms-page.scss` (values from `catalog.html` `.row1`, `.marquee`, `.stat`, `.tools`, `.latches`, `.path`, `.chain`, `.group`, `.grid`):

```scss
:host {
  display: block;
}

.catalog {
  display: flex;
  flex-direction: column;
}

.catalog__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 384px;
  gap: 14px;
  min-height: 118px;
}

.marquee {
  display: flex;
  align-items: flex-end;
  gap: 30px;
  padding: 16px 24px 0;
}

.marquee__title,
.marquee__stat {
  position: relative;
  z-index: 1;
  padding-bottom: 17px;
}

.marquee__title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-right: auto;
}

.marquee__name {
  margin-top: 12px;
  line-height: 0.8;
  white-space: nowrap;
  text-shadow: 0 0 22px rgb(var(--ink-rgb) / 0.25);
}

.marquee__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.marquee__stat {
  display: flex;
  flex-direction: column;
  gap: 9px;
  align-items: flex-start;
}

.tools {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tools__search {
  --search-height: 46px;
}

.tools__latches {
  display: flex;
  gap: 8px;
}

.tools__latch {
  flex: 1 1 auto;
  --key-width: 100%;
  --key-radius: 13px;
}

.path {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 60px;
  margin-top: 14px;
  padding: 0 8px 0 20px;
  border-radius: 16px;
}

.path__label b {
  display: block;
  margin-top: 7px;
  font: 550 13px/1 var(--font-ui);
  color: var(--ink-2);
  white-space: nowrap;
}

.path__chain {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.path__step {
  flex: none;
}

.path__cable {
  flex: 1;
  height: 4px;
  min-width: 18px;
  background: var(--desk);
  box-shadow: inset 0 1px 2px rgb(var(--black-rgb) / 0.9), 0 1px 0 var(--groove-highlight);
}

.path__cable--lit {
  background: linear-gradient(90deg, rgb(var(--lime-rgb) / 0.55), var(--lime));
  box-shadow: 0 0 8px rgb(var(--lime-rgb) / 0.4);
}

.path__readout {
  padding: 0 14px 0 4px;
  font-size: 17px;
}

.group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 4px 10px;
}

.group::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgb(var(--black-rgb) / 0.6);
  box-shadow: 0 1px 0 var(--groove-highlight);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.grid__slot {
  height: 252px;
  border-radius: var(--radius-card);
  background: rgb(var(--plate-lo-rgb) / 0.5);
}

.empty {
  margin-top: 18px;
}

.empty__screen {
  min-height: 120px;
}

.empty__hint {
  margin-top: 10px;
  color: var(--ink-3);
  font: 400 13px/1.5 var(--font-ui);
}
```

`OhnoSearchField` needs to honour the 46px tool height: in `search-field.scss` change `height: 38px;` to `height: var(--search-height, 38px);` and `border-radius: var(--radius-md);` to `border-radius: var(--search-radius, 11px);` (11px is the mockup's value for both sizes). `OhnoLatch` passes its host classes through to the inner `ohno-key`, so `--key-width`/`--key-radius` set on `.tools__latch` reach the key via inheritance of custom properties. The latch keys in the mockup are 60px tall two-line keys (LED above the label): add to `latch.scss`:

```scss
:host {
  display: inline-block;
}

:host ohno-key {
  --key-flex-direction: column;
  --key-gap: 10px;
}
```

and in `key.scss` make `.ohno-key` read `flex-direction: var(--key-flex-direction, row); gap: var(--key-gap, 8px);` (the `lg` size is 56px; add `.ohno-key[data-size='lg'].ohno-key--stacked { height: 60px; }` is not needed — set `--key-height: 60px` instead by changing the size rules to `height: var(--key-height, 34px)` etc. for each size). Concretely, in `key.scss` replace the four `[data-size]` height rules with:

```scss
.ohno-key[data-size='sm'] { height: var(--key-height, 34px); }
.ohno-key[data-size='md'] { height: var(--key-height, 40px); }
.ohno-key[data-size='lg'] { height: var(--key-height, 56px); border-radius: var(--key-radius, var(--radius-key-lg)); }
.ohno-key[data-size='xl'] { height: var(--key-height, 70px); padding: 0 20px; border-radius: var(--key-radius, var(--radius-key-xl)); }
```

and in `algorithms-page.scss` `.tools__latch` add `--key-height: 60px;`.

- [ ] **Step 4: Delete the old catalog and its structures twin**

```bash
git rm -r -q src/app/features/algorithms/algorithms-page/algorithms-page.utils src/app/features/algorithms/algorithm-card src/app/shared/directives/roadmap-overlay src/app/shared/styles/_browse-card.scss src/app/shared/controls/multi-select src/app/shared/controls/select-button src/app/features/structures/structures-page src/app/features/structures/structure-card src/app/features/structures/structures.routes.ts
```

In `vitest.config.ts` remove the coverage `include` entries `'src/app/features/algorithms/algorithm-card/algorithm-card.utils/**/*.ts'`, `'src/app/features/algorithms/algorithm-card/algorithm-card-preview/algorithm-card-preview-spec/**/*.ts'` and `'src/app/features/algorithms/algorithms-page/algorithms-page.utils/**/*.ts'`, and add `'src/app/features/algorithms/algorithms-page/*.utils.ts'`, `'src/app/features/algorithms/module-card/module-preview/*.utils.ts'`, `'src/app/features/algorithms/data/catalog/**/*.ts'` (the last one already matches through `data/**`; adding it is harmless).

Then: `grep -rn "AlgorithmCard\b\|app-algorithm-card\|appRoadmapOverlay\|MultiSelect\|SelectButton\|buildDifficultySelectButtonOptions\|browse-card\|StructuresPage\|StructureCard\|STRUCTURES_ROUTES" src/app` — Expected: no output.

- [ ] **Step 5: Verify**

```bash
npm run test:algorithms 2>&1 | tail -3 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete|exceeded"
```

Expected: tests pass; the build completes; no `algorithms-page.scss` budget warning (it was 622 lines; the new one is ~160).

Browser, `http://localhost:4200/algorithms?category=sorting`: the page matches image 01 — marquee "BANK 01 · KATEGORIA / SORTOWANIE" with Modułów 11 (orange), Porównawcze 08, Nieporównawcze 03; the search screen with ⌘K opens the palette; four 60px latches with LEDs, all pressed; the starter path plate with four numbered keys, cables and `0/4` (or `1/4` after Bubble Sort was played to the end in Task 4's check); group lines "PORÓWNAWCZE 08" and "NIEPORÓWNAWCZE 03" with 4-column grids of module cards; unpressing "Łatwe" removes the easy cards and updates the group counts; unpressing all four shows the empty plate. `/algorithms` (Wszystkie) shows one group per bank with cards below the fold rendered as placeholders until scrolled to (check the Elements panel: `ohno-module-card` elements appear as you scroll). `?category=sorting&subcategory=comparison` shows the single "Porównawcze" group and presses the Sortowanie bank row.

```bash
node tools/screenshot.mjs "http://localhost:4200/algorithms?category=sorting" proj-info/shots/p2-catalog-sorting.png 1440 900 2 && node tools/screenshot.mjs http://localhost:4200/algorithms proj-info/shots/p2-catalog-all.png 1440 2400 2
```

- [ ] **Step 6: Commit**

```bash
git add -A src/app/features/algorithms/algorithms-page src/app/features/algorithms/algorithm-card src/app/features/structures src/app/shared vitest.config.ts
git commit -m "$(cat <<'EOF'
Rebuild the catalog page as the instrument bank

Marquee, search and difficulty latches, the starter path, subcategory
groups and a deferred grid of module cards replace the hero, stat tiles,
trait popover and the old cards. Deletes the unrouted structures pages.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Responsive layout, reduced motion, keyboard pass, docs, phase verification

**Files:**
- Modify: `src/app/core/layout/shell/shell.scss`, `src/app/core/layout/bank-sidebar/bank-sidebar.scss`, `src/app/features/algorithms/algorithms-page/algorithms-page.scss` (breakpoints)
- Modify: `CLAUDE.md` ("Top-level layout" bullets for `core/` and the catalog)
- Modify: `.claude/skills/ohno-design-tokens/SKILL.md` ("Primitives" paragraph: mention `OhnoKey.prefix`, `--key-width/--key-height/--key-radius/--key-flex-direction/--key-gap`, `OhnoPlate.screwCorners`)

**Interfaces:**
- Produces: the breakpoints of spec 4.4 for the catalog; documentation for Phase 3.

- [ ] **Step 1: Breakpoints**

Append to `shell.scss`:

```scss
@media (max-width: 1023px) {
  .shell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
  }
}
```

Append to `bank-sidebar.scss` (the bank collapses to a top row of category keys; recent rows and the structures row are hidden, the foot stays inline):

```scss
@media (max-width: 1023px) {
  :host {
    height: auto;
  }

  .bank {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 10px;
    height: auto;
    padding: 12px 14px;
    overflow: visible;
  }

  .bank__brand {
    padding: 0 6px 0 0;
  }

  .bank__title,
  .bank__groove,
  .bank__row--off,
  .bank__recent {
    display: none;
  }

  .bank__rows {
    flex: 1 1 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  .bank__row {
    display: inline-grid;
    width: auto;
    height: 36px;
    gap: 6px;
    padding: 0 12px 0 10px;
    background: var(--gradient-key);
    box-shadow: var(--shadow-key);
  }

  .bank__row--on {
    background: var(--gradient-key-in);
    box-shadow: var(--shadow-key-in);
  }

  .bank__foot {
    margin-top: 0;
    margin-left: auto;
    padding: 0;
  }
}
```

Append to `algorithms-page.scss`:

```scss
@media (max-width: 1279px) {
  .catalog__row {
    grid-template-columns: minmax(0, 1fr) 340px;
  }
}

@media (max-width: 1023px) {
  .catalog__row {
    grid-template-columns: minmax(0, 1fr);
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .path {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 14px;
    gap: 12px 18px;
  }

  .path__chain {
    flex-basis: 100%;
    overflow: auto;
    padding-bottom: 4px;
  }
}

@media (max-width: 767px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .marquee {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 18px 0;
  }

  .marquee__name {
    font-size: min(var(--marquee-size, 58px), 11vw) !important;
  }

  .tools__latches {
    flex-wrap: wrap;
  }

  .tools__latch {
    flex-basis: calc(50% - 4px);
  }

  .path__label b {
    white-space: normal;
  }
}
```

and in `algorithms-page.html` change the marquee readout binding to `[style.--marquee-size.px]="marqueeSize()" [style.font-size.px]="marqueeSize()"` so the phone rule can cap it (the `!important` is the one legitimate override: an inline style must lose to the phone cap).

- [ ] **Step 2: Capture the four widths**

Start the Playwright helper (same package as Phase 1) — save as `/tmp/ohno-shots.cjs`:

```js
const { chromium } = require('/Users/witek/repos/apply-and-pray/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  for (const [name, width, height] of [['1440', 1440, 900], ['1280', 1280, 900], ['768', 768, 1200], ['360', 360, 800]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:4200/algorithms?category=sorting', { waitUntil: 'networkidle' });
    await page.waitForSelector('ohno-module-card');
    await page.waitForTimeout(600);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.screenshot({ path: `proj-info/shots/p2-catalog-${name}.png`, fullPage: true });
    console.log(name, 'horizontal overflow px:', overflow);
    await ctx.close();
  }
  await browser.close();
})();
```

Run `node /tmp/ohno-shots.cjs` — Expected: four PNGs and `horizontal overflow px: 0` for every width. At 1280 the tools column is 340px and the grid keeps four columns; at 768 the bank is a top row of keys, the tools stack under the marquee, the grid has two columns; at 360 everything is one column, the latches wrap 2×2, the marquee title fits the screen.

- [ ] **Step 3: Reduced motion and keyboard**

Reduced motion, with Playwright (`reducedMotion: 'reduce'` context): hover a module card (`page.hover('ohno-module-card')`) and read `getComputedStyle(document.querySelector('.preview__current')).animationDuration` — Expected `1e-05s` (kill switch); without the flag `1s`.

Keyboard, in the browser pane on `/algorithms?category=sorting`: Tab from the top — brand link → nine bank rows (orange ring, Enter selects) → `?` key → PL/EN radios → search field (Enter opens the palette; Esc returns focus to it) → four latches (Space toggles, `aria-pressed` flips) → path keys (Enter navigates) → module cards in order (each shows the orange ring and its live state). No element is skipped and nothing traps focus.

- [ ] **Step 4: i18n extract is clean**

```bash
npm run i18n:extract 2>&1 | tail -3 && grep -c "Missing value" public/i18n/pl.json public/i18n/en.json && git status --short public/i18n
```

Expected: `0` and `0`; if the extractor re-sorted the files, commit the sorted versions.

- [ ] **Step 5: Documentation**

In `CLAUDE.md` "Top-level layout": change the `core/` bullet to "shell (`core/layout/shell`), bank sidebar (`core/layout/bank-sidebar`), command palette (`core/layout/command-palette`, mounted in `App`), routing, i18n, `NavigationService` (`core/services`), `RecentAlgorithmsStore` (`core/recent`)" and the algorithms bullet's last line to "`algorithm-detail/` (old workbench, Phase 3), `algorithms-page/` (catalog: marquee, tools, starter path, groups), `module-card/` (card + 8 family previews), `algorithm-traits/`". Add under "Design system": "Catalog data derived at runtime: module ids (`data/catalog/module-id`), preview families, starter paths (`data/catalog/paths.ts`), difficulty latches; module descriptions live in `public/i18n/*.json` under `features.algorithms.catalog.modules.<id>.description`."

In `.claude/skills/ohno-design-tokens/SKILL.md` "Primitives" paragraph append: "`ohno-key` also takes `prefix` (mono index) and reads `--key-width`, `--key-height`, `--key-radius`, `--key-justify`, `--key-font`, `--key-flex-direction`, `--key-gap` from its host; `ohno-plate` takes `screwCorners="top"` for cards."

- [ ] **Step 6: Phase verification**

```bash
npm run verify 2>&1 | tail -6 && grep -rn "rgba(var(" src/app/core src/app/features/algorithms/algorithms-page src/app/features/algorithms/module-card src/app/shared/instrument | wc -l && grep -rln "surface-\|--text-primary\|--text-secondary\|--accent\b\|--chrome-\|--elevation-\|--ring-focus\|--font-sans" src/app/core src/app/features/algorithms/algorithms-page src/app/features/algorithms/module-card | wc -l && grep -rn "from 'three'" src | wc -l && git status --short
```

Expected: `verify` passes; the three greps print `0`; the tree is clean except this task's files.

- [ ] **Step 7: Commit**

```bash
git add src/app/core/layout/shell/shell.scss src/app/core/layout/bank-sidebar/bank-sidebar.scss src/app/features/algorithms/algorithms-page CLAUDE.md .claude/skills/ohno-design-tokens/SKILL.md public/i18n
git commit -m "$(cat <<'EOF'
Make the catalog responsive and document the shell

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

Then send the owner `p2-catalog-1440.png`, `p2-catalog-1280.png`, `p2-catalog-768.png`, `p2-catalog-360.png` and `p2-catalog-all.png` before Phase 3 starts.

---

## Rulings folded into this plan (defaults the spec leaves open)

- **Overview groups and marquee (spec 4.1 says "one group line per subcategory")** — "Wszystkie" renders one group per bank (8 lines, 102 cards) and its marquee stats are Modułów / Kategorii / Grup; a bank renders one group per subcategory with Modułów + one stat per subcategory.
- **Marquee label** — the bank's short label (`core.navigation.sidebar.algorithms.groups.*`, e.g. "Dynamiczne"), uppercased, shrunk by `marqueeFontSize` when long; never the long category label.
- **Recent readouts** — 15px Doto (`size="sm"`) instead of the mockup's 13px, because the spec forbids Doto below 14px.
- **Structures** — the disabled bank row per spec 7.3; the unrouted structures page/card/preview are deleted with the old catalog, the models/data/registry folder stays.
- **Module descriptions** — translated (PL in `docs/superpowers/plans/module-descriptions.pl.json`, EN from the catalog data) because image 01 shows Polish copy; names stay as they are (proper names).
- **Palette on every route** — mounted in `App`, so ⌘K, `/` and `?` work on the old workbench too (spec 3.5 keyboard map).
- **Bank at ≤1023px** — a wrapping row of category keys with the PL/EN toggle; recent rows and the structures row are hidden at that width.
- **Recent-store writes during Phase 2** — the old `AlgorithmDetail` records every step change; Phase 3 replaces this with the pause/leave/complete hooks the spec names.

## Phases 3–6

- `…-phase-3-workbench.md` — spec 4.2, 4.4 states, 5.4, 5.5 for sorting displays; replaces `AlgorithmDetail`, wires `RecentAlgorithmsStore` on pause/leave/complete, adds the workbench topbar with the search field and PL/EN toggle, the keyboard map and aria-live.
- `…-phase-4-family-displays.md` — spec 4.3 and images 08–12.
- `…-phase-5-cleanup.md` — spec 5.1 (delete `_compat-tokens.scss`), remaining 5.2 deletions (`ui-tag`, `segmented-panel`, `code-language-dial`, `AppButton`, old controls, `_eyebrow.scss`, `_trace-chip.scss`, `category-theme.ts`, `difficulty-theme.ts`), old i18n keys (`core.navbar`, `core.languageSwitcher`, `core.worldGlobe`, `core.navigation.tabs`, `features.algorithms.page`, `features.algorithms.card`, `features.structures`), 5.7 budgets, 5.8 docs.
- `…-phase-6-responsive-and-polish.md` — spec 4.4 for the workbench and the polish checklist.
