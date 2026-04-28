# Unified task-picker + custom-values architecture

**Date:** 2026-04-23
**Scope:** Cross-category chrome refactor. Replaces 8 per-viz-family preset pickers with a single toolbar-level **task picker** + an orthogonal **customize-values** affordance. Adds `Task` as a first-class concept in the algorithm config model.

## Why

Today, every viz-family component renders its own preset picker inside its own `viz-header` (scratchpad, number-lab, pointer-lab, sieve-grid, call-stack-lab, call-tree-lab, dp, string, tree — 8+ different implementations). They're all in the same relative place *inside the viz panel*, but each looks and behaves slightly differently. Users learning across algorithm categories (graphs → DP → strings → scratchpad) must relocate the picker mentally every time.

There's also no way for a user to type their own values — only pre-authored presets. "Generate new" exists for dataset-size randomization in array algorithms, but there's no "let me solve gcd(999, 371) instead of gcd(1071, 462)".

This spec consolidates everything into the existing `visualization-toolbar` (which is already the cross-category home for transport, variant, size, speed, randomize) and introduces a principled `Task` abstraction.

## The model — what is a "task"

A **task** is a bundle combining the shape of a problem with the code that solves it:

```ts
interface Task<TValues> {
  readonly id: string;
  readonly name: TranslatableText;
  /** Pre-authored default inputs — becomes the initial state of the
   *  customize-values popover when this task is selected. */
  readonly defaultValues: TValues;
  /** Form schema describing editable fields in the customize popover.
   *  Typed per-algorithm (e.g. `{ a: number, b: number }` for GCD, or
   *  `{ pairs: Array<{ r: number, m: number }> }` for CRT). */
  readonly inputSchema: TaskInputSchema<TValues>;
  /** Optional per-task validation — e.g. CRT non-coprime branch may
   *  require `gcd(mᵢ, mⱼ) | (aᵢ − aⱼ)`. Returns a localized message on
   *  failure; called before starting a run. */
  readonly validate?: (values: TValues) => TranslatableText | null;
  /** Which pre-authored code snippet this task's implementation uses.
   *  Multiple tasks of the same algorithm can share a snippet (e.g.
   *  GCD "Classic 1071, 462" and "Brief 48, 18" both reference
   *  `euclidean-gcd`), while tasks with genuinely different code
   *  reference different snippets (e.g. EEA "Bézout coefficients",
   *  "modular inverse", and "linear diophantine" are three tasks
   *  pointing at three distinct snippets). */
  readonly codeSnippetId: string;
  /** Optional — if the algorithm has multiple view variants (e.g.
   *  number-lab's numeric dashboard vs chalkboard), a task can
   *  prefer one. Independent from the toolbar's `view` picker; user
   *  can still override. */
  readonly preferredView?: string;
}
```

This replaces the patchwork of per-family option shapes (`DpPresetOption`, `StringPresetOption`, `NumberLabPresetOption`, …) with one generic parameterised type.

### What presets become

Today's preset = (a set of input values, a label, an implicit algorithm). In the new model every preset becomes a task whose `defaultValues` are its current input object. The label migrates to `task.name`. The implicit algorithm becomes explicit via `task.codeSnippetId`.

For algorithms where several presets share code (the common case — different input values for the same problem) they all point at the same `codeSnippetId`. No duplication.

### What "additional tasks" (problem-type variants) are

For algorithms where pedagogically different problems share a core algorithm, each problem formulation is its own task. Example — Extended Euclidean:

```ts
const EEA_TASKS: Task<EuclideanValues>[] = [
  {
    id: 'bezout-classic-1071-462',
    name: 'Znajdź gcd + Bézout dla (1071, 462)',
    defaultValues: { a: 1071, b: 462, mode: 'bezout' },
    inputSchema: { a: 'int+', b: 'int+' },
    codeSnippetId: 'eea-bezout',
  },
  {
    id: 'modinverse-7-26',
    name: 'Znajdź odwrotność 7 mod 26',
    defaultValues: { a: 7, b: 26, mode: 'mod-inverse' },
    inputSchema: { a: 'int+', b: 'int+' },
    validate: ({ a, b }) => gcd(a, b) === 1 ? null : 'a i b muszą być względnie pierwsze',
    codeSnippetId: 'eea-mod-inverse',
  },
  {
    id: 'diophantine-15x10y-5',
    name: 'Rozwiąż 15x + 10y = 5',
    defaultValues: { a: 15, b: 10, c: 5, mode: 'diophantine' },
    inputSchema: { a: 'int', b: 'int', c: 'int' },
    validate: ({ a, b, c }) => c % gcd(a, b) === 0 ? null : 'Brak rozwiązania całkowitego',
    codeSnippetId: 'eea-diophantine',
  },
];
```

Three tasks, three code snippets, one generator core (the algorithm knows how to run all three given the `mode` field in values).

### What is NOT a task

User-provided custom values are **not** a separate task type. They're a modification of the *currently selected task's* `defaultValues`. The code snippet doesn't change because values change. This distinction is central — it's why we don't have a "Custom…" option in the task picker.

User-defined *problems* (e.g. "let the student compose their own recurrence") are out of scope. No algorithm in the Ohno catalog has a credible case for it, and allowing it would demand per-algorithm validators and dynamic snippet generation that's out of proportion with the educational framing.

## UI — where things live

### Visualization toolbar (cross-category chrome)

New control layout, left-to-right:

```
[⟲] [◀] [▶/⏸] [▶]  ─ progress ─  [View: ▼]?  [Task: ▼] [✎]  [Size: ▼]?  [Speed]  [⚡ Generate new]?
```

- **`View:` select** — unchanged, still shows only when the algorithm has `>1` view variant.
- **`Task:` select** — **new**. Flat list of the algorithm's pre-authored tasks. Shows always when the algorithm has `≥1` task (which in practice is nearly all of them — any preset today is a task tomorrow). Label format: plain task name (e.g. *Classic 1071, 462*). No grouping in v1; if catalogs grow to >8 tasks per algorithm we revisit.
- **`✎` button** — **new**. Icon button (pencil, 32px control). Always shows alongside the task picker when the selected task has a non-empty `inputSchema`. Opens a popover positioned directly below the button.
- **`Size:` select** — unchanged.
- **`Speed` slider** — unchanged.
- **`Generate new` button** — unchanged (existing randomization stays scoped to algorithms where it makes sense, typically sort/pointer families).

### Task picker behaviour

- First render: picks first task's `id` unless algorithm specifies a different default.
- On change: emits `taskChange(taskId)`. The algorithm-detail component resolves this to `(defaultValues, codeSnippetId, preferredView?)` and reruns the generator.
- Persistence: remembered per algorithm in localStorage so navigating away and back preserves the student's choice.
- Hidden (together with `✎`) when the algorithm has 0 or 1 tasks and no `inputSchema` (effectively: nothing to pick, nothing to customize). Cheap vanishing keeps trivial algorithms clean.

### Customize-values popover

- Trigger: click `✎` icon button next to the task picker.
- Position: absolutely positioned below the button, max-width ~420px, auto height. Arrow pointer to the trigger.
- Content: dynamically rendered from `task.inputSchema`. Primitives supported in v1:
  - `'int'` / `'int+'` / `'int-nonzero'` — single integer field with validation
  - `'float'` — decimal
  - `'string'` — single-line text
  - `'textarea'` — multi-line text
  - `'list<schema>'` — dynamic row list with `+` / `−` buttons (for CRT's `(r, m)` pairs, etc.)
- Values preloaded from currently-active values (task defaults if not yet customized, previous custom values otherwise).
- Live validation using `task.validate` + per-field schema rules. Disabled "Apply" button when invalid.
- On Apply: emits `customValues(values)`. Algorithm-detail rebuilds the scenario and reruns.
- Cancel / click-outside: closes without applying.
- Values persist per `(algorithmId, taskId)` in localStorage — return to the same task and your last custom values are there.
- `prefers-reduced-motion`: popover appears/disappears instantly instead of slide-in.

### Code tab (side panel)

Minor additive change only. Above the code snippet, a small metadata line:

```
Code · for task: Classic 1071, 462 · gcd+Bézout
```

- Font: Sora 12px, muted (text-tertiary).
- Updates when task changes.
- No rename of the tab. Tab label stays "Code".

Side panel otherwise unchanged. Trace / Code / Log / Info remain read-only / reference views.

## Migration plan — what needs to change

### Phase A — foundations (no migration yet)

1. **Create `Task<TValues>` type** in `src/app/features/algorithms/models/task.ts`.
2. **Create `TaskInputSchema<TValues>` type** (discriminated primitives listed above).
3. **Extend `AlgorithmDetailConfig`** to optionally accept `tasks: readonly Task<TValues>[]` alongside the existing preset fields. Both coexist during migration.
4. **Build `VizTaskPicker` primitive** — thin wrapper over existing `select`, exports `taskId` input + `taskChange` output.
5. **Build `VizCustomValuesPopover` primitive** — container with dynamic field rendering from schema + validation hook.
6. **Wire both into `visualization-toolbar`** — new inputs `[taskOptions]`, `[activeTaskId]`, `[inputSchema]`, `[currentValues]`; new outputs `taskChange`, `customValues`.
7. **Algorithm-detail** grows parallel handlers `onTaskChange` / `onCustomValues` that dispatch to the algorithm's generator with resolved values.

Phase A ships no user-visible change. The new primitives exist but nothing renders them yet.

### Phase B — first migration (scratchpad family)

1. Convert Euclidean GCD and Extended Euclidean preset-picker data into tasks:
   - GCD: 3–4 tasks sharing one snippet (pure preset migration).
   - EEA: existing presets → tasks sharing one snippet; add "mod-inverse" and "diophantine" task-types with their own snippets (when we author them).
2. Remove the per-viz preset-picker slot from `scratchpad-lab-visualization`'s `viz-header`. Viz-header is now just phase/action + options gear.
3. Hook GCD/EEA up to the new toolbar task picker + customize popover.
4. Author `eea-mod-inverse` and `eea-diophantine` code snippets for the new tasks.
5. Add "for task: X" meta-label to Code tab.

Phase B ships first user-visible change: students doing EEA see a richer task list and can retype values.

### Phase C — rolling migration (remaining families)

For each family — in order of descending complexity so risk is front-loaded — do the preset→task conversion and remove the per-viz picker:

1. **Number-lab** (GCD dashboard view) — pair with scratchpad since they share algorithms.
2. **String family** — KMP, Z, Manacher, Rabin-Karp, Aho-Corasick, Suffix Array, Suffix Array + LCP, Palindromic Tree, BWT, RLE, Huffman.
3. **DP family** — Fibonacci DP, Knapsack, LCS, LIS, LPS, Edit Distance, Coin Change, Matrix Chain, Subset Sum, Burst Balloons, Climbing Stairs, Wildcard, Regex.
4. **Tree family** — Tree traversals.
5. **Pointer-lab** — two-pointers, sliding-window, palindrome, reverse, Kadane.
6. **Sieve-grid** — Sieve of Eratosthenes.
7. **Call-stack-lab** — Recursive Fibonacci.
8. **Call-tree-lab** — N-Queens, Minimax, MCTS.
9. **Graph family** — Dijkstra, BFS, DFS, Bellman-Ford, Floyd-Warshall, Topological, Bipartite, Cycle detection, Connected components, Flood-fill, A* (if already has presets).

Each step is mechanical: convert preset array → task array (usually the same `codeSnippetId` for all), remove the per-viz slot from that family's viz-header, verify `npm run verify`.

### Phase D — cleanup

1. Remove the old `presetOptions` / `presetChange` / `presetId` through-lines from:
   - `visualization-canvas.ts` (currently has 9 pairs of these)
   - `algorithm-detail.ts` (currently has 9 handlers)
   - `AlgorithmDetailConfig` interfaces (9 per-family shapes)
2. Remove the per-viz preset-picker use from `viz-header` — slot is reclaimed.
3. Update CLAUDE.md + relevant skill docs to reflect the new chrome.

## Code snippet handling

The existing `codeVariants` field on an algorithm config (array of snippet shapes) stays. Tasks reference snippets by `id`, snippets live in the algorithm's code-variants set.

Fallback when a task references a snippet not present in `codeVariants`: Code tab shows *"Snippet dla tego zadania nie jest jeszcze dostępny."* in tertiary text. Not reached in production — only surfaces as a warning during authoring.

## i18n keys

Adding to `features.algorithms.toolbar.*`:
- `taskLabel` — "Zadanie"
- `taskSelectAriaLabel` — "Wybierz zadanie"
- `customizeValuesAriaLabel` — "Dostosuj wartości"
- `customizeValuesApplyLabel` — "Zastosuj"
- `customizeValuesCancelLabel` — "Anuluj"
- `customizeValuesInvalidLabel` — "Nieprawidłowe wartości"

Adding to `features.algorithms.sidePanel.*`:
- `codeForTaskLabel` — "Kod dla zadania: {{taskName}}"
- `codeSnippetUnavailableLabel` — "Snippet dla tego zadania nie jest jeszcze dostępny."

All algorithm-specific task names get their own keys under `features.algorithms.tasks.<algorithmId>.<taskId>`. PL-first per i18n-discipline skill.

## Non-goals

- **No scenario-3 "user-defined task"**. User cannot compose new problem formulations. Every task is pre-authored.
- **No side-panel tab changes.** Trace / Code / Log / Info stay. Code tab gets one small meta-label, nothing else.
- **No variant-selector removal.** The existing `View:` selector stays for orthogonal view-variant choices (e.g. number-lab numeric vs chalkboard).
- **No custom code editor.** User cannot modify the displayed snippet. Code is reference only.
- **No auto-generation of code snippets for dynamic tasks.** If a task is added, its snippet is authored by hand.

## Acceptance criteria

- From any algorithm detail page in any category, the task picker sits in the same toolbar position with the same visual treatment.
- Selecting a task re-runs the algorithm with its default values and updates the Code tab with the corresponding snippet.
- Clicking `✎` opens a popover with the current task's input fields. Typed changes validate live. Apply re-runs; Cancel doesn't.
- Code tab shows "Kod dla zadania: <name>" above the snippet.
- No per-viz preset-picker visible inside any `viz-header` after Phase D.
- `npm run verify` green at each phase checkpoint.
- Phase B through D are incremental and each is independently reviewable + revertable.

## Open questions (authoring-side, not architectural)

- For algorithms with 10+ presets today (Dijkstra has canonical graphs, KMP has canonical text/pattern pairs), we need to decide whether to keep them all as tasks or prune to 3–5. Recommend: trim to the genuinely distinct ones per algorithm when migrating that family.
- Default task: use the previously "default" preset, or first-in-list? Recommend: keep whatever the config's defaults were; no UX change.
- Tasks with custom input that fails validation: currently "Apply" is disabled. Do we also show an inline error? Yes — per-field and at popover bottom.
