---
name: ohno-i18n-discipline
description: Use whenever you introduce or modify user-visible text, labels, descriptions, or log entries in this app. Covers the t() marker pattern, TranslatableText type, i18nText helper, key structure conventions, and the extract/find tooling. Trigger on any string literal in a template, any step description yielded by a generator, and any component outputting text.
---

# Ohno — i18n discipline

Everything user-visible goes through Transloco. This isn't about being "international-ready" — PL is the primary language, EN is a first-class parallel, and both must stay in sync.

## The pipeline in one picture

```
  t('features.algorithms.runtime.xxx.yyy')   ← marker in TS / HTML
             │
             ▼
  npm run i18n:extract   ← populates public/i18n/{pl,en}.json
             │
             ▼
  Transloco pipe in template OR i18nText(key, params) in TS
             │
             ▼
  UI shows translated string (with param interpolation)
```

Config: [transloco.config.ts](../../../transloco.config.ts) — roots to `public/i18n`, langs `['pl', 'en']`, marker function is `t`, `sort: true`, `addMissingKeys: true`.

Helpers: [src/app/core/i18n/translatable-text.ts](../../../src/app/core/i18n/translatable-text.ts).

## Types

```ts
export type I18nTextParam = string | number | boolean | null | undefined;
export type I18nTextParams = Readonly<Record<string, I18nTextParam>>;

export interface I18nText { readonly key: string; readonly params?: I18nTextParams; }
export type TranslatableText = string | I18nText;

export function i18nText(key: string, params?: I18nTextParams): I18nText;
export function isI18nText(value: unknown): value is I18nText;
```

`TranslatableText` is **either** a bare string (when the content is already localized, e.g. a user-entered value) **or** an `I18nText` (key + params).

## Declaring keys — always through the marker

In TypeScript files (algorithms, components, services):

```ts
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

const I18N = {
  modeLabel: t('features.algorithms.runtime.numberLab.gcd.modeLabel'),
  phases: {
    setup:     t('features.algorithms.runtime.numberLab.gcd.phases.setup'),
    remainder: t('features.algorithms.runtime.numberLab.gcd.phases.remainder'),
  },
  decisions: {
    remainder: t('features.algorithms.runtime.numberLab.gcd.decisions.remainder'),
  },
} as const;
```

- **Always** an `as const` constant at top of file.
- Keep keys literal inside `t(...)` — don't interpolate. The extractor is static.
- Nesting the constant mirrors the dot-path for readability.

In templates, use the Transloco pipe:

```html
{{ 'features.algorithms.runtime.xxx.yyy' | transloco }}
{{ 'features.algorithms.runtime.xxx.yyy' | transloco: { count: items.length } }}
```

Or, when you already have a `TranslatableText` from TS:

```html
<span [innerHTML]="translateText(stepDescription)"></span>   <!-- via a pipe/service -->
```

## Using i18nText at yield / emit time

```ts
import { i18nText } from '../../../core/i18n/translatable-text';

yield {
  // …
  description: i18nText(I18N.descriptions.remainder, { a, b, r }),
};
```

The returned `I18nText` is carried through the step stream; the log-panel and the viz header resolve it to a string at render time.

## Key structure conventions

The tree mirrors the app structure. Typical namespaces:

- `features.algorithms.runtime.<family>.<algo>.phases.*` — `init`, `compare`, `swap`, `complete`, …
- `features.algorithms.runtime.<family>.<algo>.descriptions.*` — narrated text per step.
- `features.algorithms.runtime.<family>.<algo>.decisions.*` — branch outcomes.
- `features.algorithms.runtime.<family>.<algo>.hints.*` — margin/tooltip hints.
- `features.algorithms.runtime.scratchpadLab.<algo>.*` — chalkboard-specific copy.
- `features.algorithms.codePanel.*` — code-panel chrome.
- `features.algorithms.catalog.<id>.*` — catalog cards, titles, taglines, intro.
- `features.algorithms.vizOptions.*` — gear-menu labels.
- `core.language.*`, `core.shell.*`, `core.navbar.*` — app chrome.

Rules:
- **camelCase for leaves, lowercase-dotted path.**
- **Group by feature, then by algorithm, then by slot.** Algorithm id goes in the path (`gcd`, not `euclideanGcd` — the catalog ids are already short).
- **Don't prefix with language.** One tree, two resolutions.

## Parameters

Use `{paramName}` style:

```json
"remainder": "Policz {a} mod {b} = {r}"
```

```ts
i18nText(I18N.descriptions.remainder, { a, b, r });
```

Params are flat primitives (no nested objects). If you need pluralization, use Transloco's plural support or split into two keys.

## Extraction workflow

1. Add `t(...)` markers or `| transloco` usages.
2. Run `npm run i18n:extract`.
3. Check the diff in `public/i18n/pl.json` and `public/i18n/en.json`. New keys arrive with their dot-path as placeholder text.
4. Fill in **both** PL and EN. PL is the reference — if in doubt about EN, write a faithful literal translation, not a localized rewrite.
5. Run `npm run i18n:find` if you need to audit where a key is used.
6. Commit JSON changes together with the code change.

Never:
- Hand-edit JSON before running extract (your key will be overwritten next run if the marker isn't present).
- Delete keys manually without confirming no usage.
- Leave a key in the JSON with the raw dot-path as its translation — that's a TODO, not shipped content.

## Dynamic keys — when necessary

Sometimes you need a key chosen at runtime (e.g., difficulty → localized label). Two options:

1. **Declare all variants in the `I18N` constant**, then pick:
   ```ts
   const difficultyLabel = {
     easy: I18N.difficulty.easy,
     medium: I18N.difficulty.medium,
     hard: I18N.difficulty.hard,
   }[level];
   ```
2. **Build the key string, but still declare each full literal** with `t()` somewhere so the extractor finds them. Leaving a bare template-literal key unreferenced by any `t()` call is a bug — the extractor won't see it.

## Tooling quick-ref

- `npm run i18n:extract` — scans for `t(...)` + `| transloco`, writes missing keys to JSONs, sorts alphabetically.
- `npm run i18n:find` — lists all usages of each key (useful before deleting).
- `transloco.config.ts` — change roots, langs, marker-function name here.

## When NOT to i18n

- Developer console logs, error throws with English-only messages (rare — most error text is user-facing).
- Algorithm names in code (identifiers, enum values, type tags) — those are symbols, not UI.
- Math in scratchpad lines: the LaTeX inside `[[math]] … [[/math]]` is language-agnostic. The surrounding narrative text **is** i18n-ed.
