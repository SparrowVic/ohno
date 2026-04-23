---
name: ohno-algorithm-step-generator
description: Use when adding a new algorithm or modifying an existing one under src/app/features/algorithms/algorithms/. Covers the Generator<SortStep> pattern, per-family trace state slots, code-line synchronization, i18n-marker usage in step descriptions, and the withScratchpad helper for pairing a numeric view with a chalkboard derivation.
---

# Ohno — writing algorithm step generators

Every algorithm in [src/app/features/algorithms/algorithms/](../../../src/app/features/algorithms/algorithms/) exports a **generator** that yields [`SortStep`](../../../src/app/features/algorithms/models/sort-step.ts) records — one per user-visible step. The visualization components don't execute the algorithm; they consume the step stream.

## The SortStep contract

Every yielded step must provide:

```ts
{
  array: readonly number[];                        // current array state
  comparing: readonly [number, number] | null;     // indices under comparison
  swapping: readonly [number, number] | null;      // indices being swapped (single-frame)
  sorted: readonly number[];                       // indices confirmed final
  boundary: number;                                // "already processed" cutoff (e.g., outer-loop i)
  activeCodeLine: number;                          // 1-based line in the code-panel
  description: TranslatableText;                   // narrated by log-panel + top-bar
  phase?: SortPhase;                               // discrete state machine marker
}
```

Plus one (or more) **family-specific state slots** depending on what the algorithm is:

| Slot | Use case |
|---|---|
| `graph?: GraphStepState` | anything on a graph (BFS, DFS, Dijkstra, MST, flows, bridges…) |
| `dp?: DpTraceState` | DP tables, optimization recurrences |
| `dsu?: DsuTraceState` | union-find |
| `grid?: GridTraceState` | 2D grid problems |
| `matrix?: MatrixTraceState` | matrix operations |
| `network?: NetworkTraceState` | max-flow / min-cut |
| `search?: SearchTraceState` | binary search variants |
| `string?: StringTraceState` | string matching, automata |
| `geometry?: GeometryStepState` | convex hull, closest pair, voronoi, … |
| `tree?: TreeTraversalTraceState` | tree traversals |
| `numberLab?: NumberLabTraceState` | numeric dashboard (registers, formula, history) |
| `pointerLab?: PointerLabTraceState` | two-pointer / sliding window |
| `sieveGrid?: SieveGridTraceState` | Eratosthenes-style sieves |
| `callStackLab?: CallStackLabTraceState` | recursion visualized as a stack |
| `callTreeLab?: CallTreeLabTraceState` | recursion as a tree |
| `scratchpadLab?: ScratchpadLabTraceState` | chalkboard derivation |

## Generator skeleton

```ts
import { marker as t } from '@jsverse/transloco-keys-manager/marker';
import { i18nText } from '../../../core/i18n/translatable-text';
import { SortStep } from '../../models/sort-step';

const I18N = {
  phases: {
    init:    t('features.algorithms.runtime.<family>.<algo>.phases.init'),
    compare: t('features.algorithms.runtime.<family>.<algo>.phases.compare'),
    done:    t('features.algorithms.runtime.<family>.<algo>.phases.done'),
  },
  descriptions: {
    compareAt: t('features.algorithms.runtime.<family>.<algo>.descriptions.compareAt'),
  },
} as const;

export function* myAlgoGenerator(input: MyScenario): Generator<SortStep> {
  const array = [...input.array];
  const sorted: number[] = [];

  yield {
    array, comparing: null, swapping: null, sorted, boundary: 0,
    activeCodeLine: 1,
    description: i18nText(I18N.phases.init),
    phase: 'init',
  };

  // ... iteration ...
  yield {
    array, comparing: [i, j], swapping: null, sorted, boundary: i,
    activeCodeLine: 4,
    description: i18nText(I18N.descriptions.compareAt, { i, j }),
    phase: 'compare',
  };

  // ... completion ...
  yield {
    array, comparing: null, swapping: null,
    sorted: [...array.keys()], boundary: array.length,
    activeCodeLine: 12,
    description: i18nText(I18N.phases.done),
    phase: 'complete',
  };
}
```

## Code-line synchronization

`activeCodeLine` is the **1-based line number in the code-panel snippet** you author for this algorithm (in the catalog data). Keep it in lock-step with the snippet — if you renumber the snippet, renumber the steps.

Line numbers are an interface; treat them stably. Prefer refactoring the pseudocode to preserve existing line indices over rewriting every step yield.

## i18n — only via markers

- **Never** hardcode a description string: use `t()` from `@jsverse/transloco-keys-manager/marker`.
- Wrap keys in an `I18N = { ... } as const` object at the top of the file. Declarative and extract-friendly.
- At yield time, use `i18nText(I18N.xxx, params?)` which returns the `TranslatableText` object the UI resolves.
- Params are typed `I18nTextParams` (string | number | boolean | null | undefined).
- After adding new keys, run `npm run i18n:extract` to populate `pl.json` / `en.json`.

See the `ohno-i18n-discipline` skill for key-structure conventions.

## Pairing a numeric dashboard with a chalkboard — `withScratchpad`

When an algorithm benefits from both views (numeric snapshot + narrative derivation), yield a single composed step:

```ts
import { withScratchpad } from '../scratchpad-lab-step';
import { createNumberLabStep } from '../number-lab-step';

yield withScratchpad(
  createNumberLabStep({ /* registers, formula, history, ... */ }),
  scratchpadSnapshot({ /* lines, margins, tone, phaseLabel, ... */ }),
);
```

Euclidean GCD is the reference — it emits both a `NumberLabTraceState` (registers a/b/r, modulo formula, history list) and a `ScratchpadLabTraceState` (goal → rule → substitutions → decision → result). See [src/app/features/algorithms/algorithms/euclidean-gcd/euclidean-gcd.ts](../../../src/app/features/algorithms/algorithms/euclidean-gcd/euclidean-gcd.ts).

## Testing

- Colocate `<algo>.spec.ts` next to `<algo>.ts`. Vitest, `*.spec.ts`, no Jest.
- Run via `npm run test:algorithms`. Coverage threshold is 70% (line/statement) in the algo layer.
- Typical test shape:

```ts
import { describe, expect, it } from 'vitest';
import { myAlgoGenerator } from './my-algo';

describe('myAlgo', () => {
  it('produces a complete run', () => {
    const steps = [...myAlgoGenerator({ array: [3, 1, 2] })];
    expect(steps.at(0)?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.array).toEqual([1, 2, 3]);
    expect(steps.at(-1)?.sorted).toEqual([0, 1, 2]);
  });

  it('emits valid activeCodeLine indices', () => {
    const steps = [...myAlgoGenerator({ array: [3, 1, 2] })];
    for (const step of steps) {
      expect(step.activeCodeLine).toBeGreaterThan(0);
    }
  });
});
```

- Prefer assertions on **phase transitions** and **final state** over full-step snapshots (which break for cosmetic changes).

## Common pitfalls

- Don't mutate `array` without yielding a fresh snapshot — the UI memoizes by reference.
- `swapping` is a single-frame marker. Yield one step with `swapping` set, then the next step with the array already swapped and `swapping: null`.
- `sorted` grows monotonically in sorting algorithms. For non-sorting ones, leave it empty or re-purpose it semantically (e.g., "settled nodes" for Dijkstra).
- `boundary` is how the bar-chart draws the shaded "done" region. Use it or set `0`.
- Never `yield` without a `description` — the log-panel depends on it.
