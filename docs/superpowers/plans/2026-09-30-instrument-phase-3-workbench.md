# Instrument Redesign — Phase 3: Workbench Frame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old algorithm-detail page with the Instrument workbench of reference image 02 — topbar, unit A (head, stage screen with meters and op-line, legend row, transport deck), unit B (inspector: Kod / Info / Ślad), unit C (log printer) — with all playback semantics kept, the keyboard map and aria-live added, the recent store written on pause/leave/complete, the engine leak fixed, and the sorting bar display rebuilt in the dot language. Every other family keeps its current visualization and trace panel inside the new frame (Phase 4 restyles them).

**Architecture:** `Workbench` is the new route component (`features/algorithms/workbench/`). It resolves the algorithm and its `AlgorithmViewConfig` (the config file stays where it is), owns the scenario state that `AlgorithmDetail` had (size, variant, one `presetId`, task, custom values, graph focus) and delegates playback to `PlaybackController`, a per-workbench service wrapping `VisualizationEngine`: history, cursor, step events, counters, keyboard actions, aria-live, recent-store writes and `ngOnDestroy → stop()`. The stage grammar is a set of small OnPush components composed from the Phase 1 primitives: `WorkbenchTopbar`, `StageHead`, `StageScreen` (meters + `VisualizationCanvas` + op-line), `LegendRow`, `TransportDeck`, `Inspector`, `LogPrinter`. Family-specific readouts come from `StageReadout` adapters (`sortingStageReadout` now, a generic fallback for everything else; Phase 4 adds the rest). All logic that can be pure lives in `*.utils.ts` files with Vitest specs.

**Tech Stack:** Angular 21.2 (standalone, signals, `@if/@for/@switch`, `afterRenderEffect`), TypeScript 5.9 strict, SCSS with the Instrument tokens, Transloco 8, Vitest 4, Shiki 4 (custom theme), Anime.js 4 for the bar swap arc, Playwright (`/opt/node-tools/node_modules/playwright` in the cloud container, headless Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`) for viewport/reduced-motion checks.

**Spec:** `docs/superpowers/specs/2026-09-30-instrument-redesign-design.md` — sections 3.4 (motion), 3.5 (accessibility and keyboard map), 4.2 (workbench), 4.4 (states and responsiveness), 5.4 (decomposition), 5.5 (visualizations: sorting bar), 5.6 (i18n), 7 (open questions 7.2, 7.5, 7.7). Reference image `docs/redesign-instrument/02-instrument-ekran-algorytmu.webp` (crops of its six regions were read at 1:1 while writing this plan; the mockup HTML sources are not available in the cloud container, so the image is the contract). Inventory of the code being replaced: summarised inside each task's "What exists" notes.

## Global Constraints

- Angular 21.2.x: standalone, `changeDetection: ChangeDetectionStrategy.OnPush`, signal inputs, `output()`, `inject()` only, new control flow only, `name.ts` + `name.html` + `name.scss` per component; new components use the `Ohno` prefix / `ohno-` selectors except the route component `Workbench` (`app-workbench`).
- Colours only through `var(--x)` / `rgb(var(--x-rgb) / a)` from `src/styles/_instrument-tokens.scss`; no hex literals in component SCSS; `rgba(var(` forbidden; **no compatibility token** (`--surface-*`, `--text-*`, `--accent`, `--chrome-*`, `--elevation-*`, `--ring-focus`, `--font-sans`, `--radius-lg/-xl/-2xl/-3xl`, `--panel-*`, `--control-*`) in any new or rewritten file. Untouched visualizations and trace panels may keep theirs until Phase 4/5.
- Doto only for numbers, complexity notation and the marquee; never below 14px (recent readouts 15px). Engravings are `ohno-engraving`; every control has a visible label or `aria-label`.
- No comments in code except a WHY comment for a non-obvious workaround.
- Every user-visible string through `t()` keys registered in `src/app/core/i18n/i18n-keys.ts` and present in `public/i18n/pl.json` (PL first) and `en.json`; after each task that adds keys run `npm run i18n:extract` and strip the empty-string root key it leaves (read the file first, then write — the one-liner in Task 0 Step 5 of the first draft truncated `pl.json`; use `strip-root-key.py` from Task 0).
- Reduced motion: CSS animations are covered by the global kill switch; JS-driven motion checks `prefersReducedMotion()` from `src/app/features/algorithms/utils/helpers/visualization-motion/visualization-motion.ts` (Task 7 exports it there).
- No `backdrop-filter`; `filter: drop-shadow` only on the comparing bars while they pulse.
- Never touch `src/app/features/algorithms/algorithms/**` (generators) or `algorithm-detail-config.ts` except where a task names an exact edit.
- After every task: `npm run test:algorithms` passes, `npm run build` succeeds (pre-existing budget warnings are fine), the workbench is checked in the browser on `/algorithms/bubble-sort`, then commit and push. Commit titles are short imperatives; every commit message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Never commit `proj-info/` or `tmp/`.

## Review Focus

1. **Play at the end of a run** — pressing Space or the play key when the cursor is on the last step must restart from step 0 and play (the old engine ignored it); pinned by `transport.utils.spec.ts` (`nextTransportAction`) in Task 1.
2. **Stepping back after a pass separator** — the log tape must drop rows above the cursor and never show a bold "current" separator row; pinned by `tape-rows.utils.spec.ts` in Task 1.
3. **Keyboard shortcuts while typing in the custom-values form, on a focused key, or with the palette open** — Space/R/arrows must not drive playback there; pinned by `workbench-keys.utils.spec.ts` in Task 1.
4. **A sentence with no numbers and one with negative or decimal numbers** — the op-line markup must escape HTML, wrap `-3`, `2.5` and `10` as whole numbers and leave words (and the digits inside `&apos;`) alone; pinned by `sentence-markup.utils.spec.ts` in Task 1.
5. **Size window with a single size and a tempo change mid-run** — the size section must be hidden when `sizeOptions.length === 1`, and changing tempo must keep the cursor; pinned by the transport-deck rendering checks in Task 4 and `PlaybackController` behaviour in Task 2 (`setSpeed` never touches the cursor).

---

### Task 0: Workbench i18n keys, code-screen tokens, shared brand — DONE (`09645e0`)

**Files:**
- Modify: `src/app/core/i18n/i18n-keys.ts` (`features.algorithms.workbench` group), `public/i18n/pl.json`, `public/i18n/en.json`
- Modify: `src/styles/_instrument-tokens.scss` (code-screen syntax colours after `--screw-lo`)
- Create: `src/app/shared/instrument/brand/brand.ts`, `brand.html`, `brand.scss`
- Modify: `src/app/core/layout/bank-sidebar/bank-sidebar.html`, `bank-sidebar.scss`, `bank-sidebar.ts` (use `ohno-brand`)

**Interfaces:**
- Produces: `I18N_KEY.features.algorithms.workbench.{topbar,head,stage,meters,phases,registers,legend,deck,inspector,log,states}`; tokens `--code-fg #d8d7d1`, `--code-keyword #ff9d6b`, `--code-type #8fd6ff`, `--code-fn #ffffff`, `--code-comment #66676c`, `--code-punct #94948f` (+ `-rgb` twins), `--code-value` = `var(--lime)`; `OhnoBrand` (`ohno-brand`, inputs `tagline: string` (required), `link: string | unknown[] = '/algorithms'`, `ariaLabel: string` (required)).

- [x] **Step 1: Register the keys** — `workbench` group inserted after `catalog` inside `features.algorithms` (topbar, head, stage + status, meters, phases, registers, legend, deck, inspector, log + filters + events, states).
- [x] **Step 2: PL and EN values** — merged with `ohno-merge-i18n.py` (PL: "Oś kroków", "Log · drukarka kroków", "── PRZEBIEG {{index}} ZAKOŃCZONY ──", "tempo {{speed}}×", "Algorithm lab · {{count}} modułów" …; EN mirrors).
- [x] **Step 3: Code-screen tokens** — added after `--screw-lo`.
- [x] **Step 4: `OhnoBrand` and its use in the bank** — the bank sidebar's brand block became `<ohno-brand class="bank__brand" [tagline] [ariaLabel] />`; `.bank__brand` reduced to `{ padding: 0 6px 22px; }`.
- [x] **Step 5: Extract, verify, commit** — `npm run i18n:extract` then the root-key strip script below (0 `Missing value` in both files), 487 Vitest tests pass, the production build completes, `/algorithms?category=sorting` renders the bank brand unchanged.

Root-key strip script (safe: reads before it writes):

```python
import json
for lang in ('pl', 'en'):
    path = f'public/i18n/{lang}.json'
    with open(path) as handle:
        data = json.load(handle)
    data.pop('', None)
    with open(path, 'w') as handle:
        handle.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
```

---

### Task 1: Pure workbench utilities with specs

**Files:**
- Create: `src/app/features/algorithms/workbench/utils/sentence-markup.utils.ts`, `sentence-markup.utils.spec.ts`
- Create: `src/app/features/algorithms/workbench/utils/workbench-keys.utils.ts`, `workbench-keys.utils.spec.ts`
- Create: `src/app/features/algorithms/workbench/utils/transport.utils.ts`, `transport.utils.spec.ts`
- Create: `src/app/features/algorithms/workbench/utils/step-events.utils.ts`, `step-events.utils.spec.ts`
- Create: `src/app/features/algorithms/workbench/utils/tape-rows.utils.ts`, `tape-rows.utils.spec.ts`
- Create: `src/app/features/algorithms/workbench/utils/stage-readout.utils.ts`, `stage-readout.utils.spec.ts`

**Interfaces:**
- Produces: `markupSentence(text): string`; `WorkbenchKeyAction`, `WorkbenchKeyContext`, `resolveWorkbenchKey(context): WorkbenchKeyAction | null`, `keyTargetKind(target): KeyTargetKind`; `PlaybackStatus`, `TransportAction`, `nextTransportAction(playing, cursor, lastIndex)`, `resolvePlaybackStatus(playing, cursor, lastIndex)`; `StepEventKind`, `StepEvent`, `classifyStepEvents(history)`, `countStepEvents(events, cursor)`; `TapeFilter`, `TapeLabels`, `buildTapeRows(events, history, cursor, filter, labels, translate)`, `formatTapeText(rows, stepHeader, eventHeader)`; `StageMeter`, `StageReadout`, `StageReadoutLabels`, `sortingStageReadout(step, events, cursor, labels)`, `genericStageReadout(step, index, lastIndex, labels)`, `sortingPassGauge(events, cursor)`.
- Consumes: `SortStep` (`models/sort-step`), `TranslatableText`, `TapeRow` (`shared/instrument/tape/tape.types`), `LedColor`, `OpLineRegister`.

**What exists:** every sorting generator yields `SortStep` with `comparing`, `swapping`, `sorted`, `boundary`, `description`; only radix/bucket/counting and the newer sorts set `phase`; bubble sort (image 02) sets none. The old workbench derived its Trace tab with `deriveSortTrace` (`utils/helpers/derive-sort-trace`), whose `resolvePhase` infers `swap`/`compare`/`complete`/`idle` — reused for the op-line phase label. Counters (comparisons, swaps, passes) do not exist anywhere and must be derived from the history.

- [ ] **Step 1: Sentence markup (spec first)**

`sentence-markup.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { markupSentence } from './sentence-markup.utils';

describe('markupSentence', () => {
  it('wraps whole numbers, negative and decimal numbers in em', () => {
    expect(markupSentence('Porównaj 74 na indeksie 5 z -3 oraz 2.5.')).toBe(
      'Porównaj <em>74</em> na indeksie <em>5</em> z <em>-3</em> oraz <em>2.5</em>.',
    );
  });

  it('leaves words, identifiers and ranges alone', () => {
    expect(markupSentence('Tablica a1 ma n-1 elementów i 10 kroków.')).toBe(
      'Tablica a1 ma n-1 elementów i <em>10</em> kroków.',
    );
  });

  it('escapes html before wrapping and never wraps digits inside entities', () => {
    expect(markupSentence("<b>1</b> & 'x'")).toBe('&lt;b&gt;<em>1</em>&lt;/b&gt; &amp; &apos;x&apos;');
  });

  it('returns a sentence without numbers unchanged', () => {
    expect(markupSentence('Gotowe.')).toBe('Gotowe.');
  });
});
```

`sentence-markup.utils.ts`:

```ts
const NUMBER_PATTERN = /(?<![\w.-])-?\d+(?:\.\d+)?(?!\w)/g;
const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

export function markupSentence(text: string): string {
  return escapeHtml(text).replace(NUMBER_PATTERN, (match) => `<em>${match}</em>`);
}
```

Run: `npx vitest run --config vitest.config.ts src/app/features/algorithms/workbench/utils/sentence-markup` — Expected: 4 tests pass.

- [ ] **Step 2: Keyboard map (spec first)**

`workbench-keys.utils.spec.ts` covers: Space → `toggle`, `ArrowLeft`/`ArrowRight` → `stepBack`/`stepForward`, `r`/`R` → `reset`, `[`/`]` → `tempoDown`/`tempoUp`, `c`/`i`/`t` → `tabCode`/`tabInfo`/`tabTrace`, `l` → `focusLog`; `null` when `paletteOpen`, when a modifier is held, for every key when the target kind is `text`, and for Space/arrows when the target kind is `control` (a focused key or range must keep its native behaviour); letters still work on a `control` target.

`workbench-keys.utils.ts`:

```ts
export type WorkbenchKeyAction =
  | 'toggle' | 'stepBack' | 'stepForward' | 'reset'
  | 'tempoDown' | 'tempoUp' | 'tabCode' | 'tabInfo' | 'tabTrace' | 'focusLog';

export type KeyTargetKind = 'none' | 'control' | 'text';

export interface WorkbenchKeyContext {
  readonly key: string;
  readonly modifier: boolean;
  readonly target: KeyTargetKind;
  readonly paletteOpen: boolean;
}

const LETTER_ACTIONS: Readonly<Record<string, WorkbenchKeyAction>> = {
  r: 'reset', '[': 'tempoDown', ']': 'tempoUp', c: 'tabCode', i: 'tabInfo', t: 'tabTrace', l: 'focusLog',
};
const NAVIGATION_ACTIONS: Readonly<Record<string, WorkbenchKeyAction>> = {
  ' ': 'toggle', Spacebar: 'toggle', ArrowLeft: 'stepBack', ArrowRight: 'stepForward',
};
const TEXT_INPUT_TYPES = new Set(['text', 'number', 'search', 'email', 'url', 'tel', 'password']);

export function resolveWorkbenchKey(context: WorkbenchKeyContext): WorkbenchKeyAction | null {
  if (context.paletteOpen || context.modifier || context.target === 'text') return null;
  const navigation = NAVIGATION_ACTIONS[context.key];
  if (navigation) return context.target === 'control' ? null : navigation;
  return LETTER_ACTIONS[context.key.toLowerCase()] ?? null;
}

export function keyTargetKind(target: EventTarget | null): KeyTargetKind {
  if (!(target instanceof HTMLElement)) return 'none';
  if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return 'text';
  if (target instanceof HTMLInputElement) return TEXT_INPUT_TYPES.has(target.type) ? 'text' : 'control';
  if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.getAttribute('role') === 'menu') return 'control';
  return 'none';
}
```

The spec uses jsdom (`// @vitest-environment jsdom` is the default in `vitest.config.ts`) for `keyTargetKind`: a `<button>` → `control`, `<input type="range">` → `control`, `<input type="text">` and `<textarea>` → `text`, `document.body` → `none`.

- [ ] **Step 3: Transport actions and status (spec first)**

`transport.utils.ts`:

```ts
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'complete';
export type TransportAction = 'play' | 'pause' | 'restart';

export function nextTransportAction(playing: boolean, cursor: number, lastIndex: number): TransportAction {
  if (playing) return 'pause';
  return lastIndex > 0 && cursor >= lastIndex ? 'restart' : 'play';
}

export function resolvePlaybackStatus(playing: boolean, cursor: number, lastIndex: number): PlaybackStatus {
  if (playing) return 'playing';
  if (lastIndex > 0 && cursor >= lastIndex) return 'complete';
  return cursor <= 0 ? 'idle' : 'paused';
}

export function clampCursor(cursor: number, lastIndex: number): number {
  return Math.max(0, Math.min(Math.max(lastIndex, 0), Math.trunc(cursor)));
}
```

Spec pins: playing → `pause`; at the last index → `restart`; on step 0 or mid-run → `play`; status `idle`/`paused`/`playing`/`complete`; `clampCursor(250, 195) === 195`, `clampCursor(-1, 195) === 0`, `clampCursor(3, -1) === 0`.

- [ ] **Step 4: Step events and counters (spec first)**

`step-events.utils.ts`:

```ts
import { SortStep } from '../../models/sort-step';

export type StepEventKind = 'start' | 'step' | 'compare' | 'swap' | 'settle' | 'pass' | 'complete';

export interface StepEvent {
  readonly index: number;
  readonly kind: StepEventKind;
  readonly detail: string;
  readonly pass: number;
}

export interface StepEventCounts {
  readonly comparisons: number;
  readonly swaps: number;
  readonly passes: number;
}

export function classifyStepEvents(history: readonly SortStep[]): readonly StepEvent[] {
  let pass = 0;
  return history.map((step, index) => {
    const kind = classify(step, history[index - 1] ?? null, index === history.length - 1, index);
    if (kind === 'pass') pass += 1;
    return { index, kind, detail: detailFor(step, kind), pass };
  });
}

export function countStepEvents(events: readonly StepEvent[], cursor: number): StepEventCounts {
  const counts = { comparisons: 0, swaps: 0, passes: 0 };
  for (const event of events) {
    if (event.index > cursor) break;
    if (event.kind === 'compare') counts.comparisons += 1;
    if (event.kind === 'swap') counts.swaps += 1;
    if (event.kind === 'pass') counts.passes += 1;
  }
  return counts;
}

function classify(step: SortStep, previous: SortStep | null, last: boolean, index: number): StepEventKind {
  if (index === 0) return 'start';
  if (step.swapping) return 'swap';
  if (step.comparing) return 'compare';
  if (last || step.phase === 'complete') return 'complete';
  const grew = previous !== null && step.sorted.length > previous.sorted.length;
  if (step.phase === 'pass-complete' || (grew && step.sorted.length < step.array.length)) return 'pass';
  if (grew) return 'settle';
  return 'step';
}

function detailFor(step: SortStep, kind: StepEventKind): string {
  if (kind === 'swap' && step.swapping) {
    const [left, right] = step.swapping;
    return `${step.array[right]}[${left}] ↔ ${step.array[left]}[${right}]`;
  }
  if (kind === 'compare' && step.comparing) {
    const [left, right] = step.comparing;
    return `${step.array[left]}[${left}] : ${step.array[right]}[${right}]`;
  }
  return '';
}
```

Spec fixtures: a hand-written 6-step bubble history (`start`, `compare 56[0] : 13[1]`, `swap 56[0] ↔ 13[1]` (array already swapped), `compare`, pass step with `sorted` grown and no phase, `complete` last) → kinds `['start','compare','swap','compare','pass','complete']`, pass numbers `[0,0,0,0,1,1]`, `countStepEvents(events, 3)` = `{ comparisons: 2, swaps: 1, passes: 0 }`, `countStepEvents(events, 5)` = `{ 2, 1, 1 }`; a radix history where the third step has `phase: 'pass-complete'` and `sorted` unchanged → `pass`; a step whose `sorted` grows to the full length before the last step → `settle`.

- [ ] **Step 5: Tape rows and export text (spec first)**

`tape-rows.utils.ts`:

```ts
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { formatReadout } from '../../../../shared/instrument/readout/readout.utils';
import { TapeRow } from '../../../../shared/instrument/tape/tape.types';
import { SortStep } from '../../models/sort-step';
import { StepEvent, StepEventKind } from './step-events.utils';

export type TapeFilter = 'all' | 'compare' | 'swap' | 'pass';

export interface TapeLabels {
  readonly events: Readonly<Record<StepEventKind, string>>;
  readonly passSeparator: (index: number) => string;
}

const TONES: Readonly<Record<StepEventKind, LedColor>> = {
  start: 'slate', step: 'slate', compare: 'cyan', swap: 'pink', settle: 'lime', pass: 'slate', complete: 'lime',
};

const FILTERS: Readonly<Record<TapeFilter, ReadonlySet<StepEventKind>>> = {
  all: new Set(['start', 'step', 'compare', 'swap', 'settle', 'pass', 'complete']),
  compare: new Set(['compare']),
  swap: new Set(['swap']),
  pass: new Set(['pass']),
};

export function buildTapeRows(
  events: readonly StepEvent[],
  history: readonly SortStep[],
  cursor: number,
  filter: TapeFilter,
  labels: TapeLabels,
  translate: (text: TranslatableText) => string,
): readonly TapeRow[] {
  const allowed = FILTERS[filter];
  return events.flatMap((event) => {
    if (event.index > cursor || !allowed.has(event.kind)) return [];
    if (event.kind === 'pass') {
      return [{ step: event.index, kind: 'separator' as const, tone: TONES.pass, event: labels.passSeparator(event.pass), detail: '' }];
    }
    const step = history[event.index];
    const detail = event.detail || (step ? translate(step.description) : '');
    return [{ step: event.index, kind: 'event' as const, tone: TONES[event.kind], event: labels.events[event.kind], detail }];
  });
}

export function formatTapeText(rows: readonly TapeRow[], stepHeader: string, eventHeader: string): string {
  const lines = rows.map((row) =>
    row.kind === 'separator'
      ? `${formatReadout(row.step, 3)}  ${row.event}`
      : `${formatReadout(row.step, 3)}  ${row.event.padEnd(10)}${row.detail}`.trimEnd(),
  );
  return [`${stepHeader.padEnd(5)}${eventHeader}`, ...lines].join('\n');
}
```

Spec pins (review focus 2): with the cursor on step 3 of the fixture only rows 0–3 remain; with the cursor on the pass step the last row is a separator and `currentTapeIndex(rows)` (from `tape.utils`) points at the compare row before it, never at the separator; `filter: 'swap'` keeps only the swap row; the separator text comes from `passSeparator(1)`; `formatTapeText` output starts with the header line and pads step numbers to three digits.

- [ ] **Step 6: Stage readouts (spec first)**

`stage-readout.utils.ts`:

```ts
import { OpLineRegister } from '../../../../shared/instrument/opline/opline.types';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { SortStep } from '../../models/sort-step';
import { countStepEvents, StepEvent, StepEventKind } from './step-events.utils';

export interface StageMeter {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly total: number | null;
  readonly pad: number;
}

export interface StageReadout {
  readonly meters: readonly StageMeter[];
  readonly phaseLabel: string;
  readonly tone: LedColor;
  readonly registers: readonly OpLineRegister[];
}

export interface StageReadoutLabels {
  readonly meters: { readonly passes: string; readonly comparisons: string; readonly swaps: string };
  readonly phases: Readonly<Record<StepEventKind, string>>;
  readonly registers: { readonly left: string; readonly right: string; readonly boundary: string; readonly settled: string };
}

export interface PassGauge {
  readonly count: number;
  readonly lit: number;
  readonly done: number;
}

const PHASE_TONES: Readonly<Record<StepEventKind, LedColor>> = {
  start: 'slate', step: 'slate', compare: 'cyan', swap: 'pink', settle: 'lime', pass: 'lime', complete: 'lime',
};

export function sortingPassGauge(events: readonly StepEvent[], cursor: number): PassGauge {
  const count = events.filter((event) => event.kind === 'pass').length;
  const done = countStepEvents(events, cursor).passes;
  const complete = cursor >= events.length - 1;
  return { count, done, lit: Math.min(count, complete ? done : done + 1) };
}

export function sortingStageReadout(step: SortStep, events: readonly StepEvent[], cursor: number, labels: StageReadoutLabels): StageReadout {
  const event = events[cursor];
  const kind: StepEventKind = event?.kind ?? 'step';
  const counts = countStepEvents(events, cursor);
  const gauge = sortingPassGauge(events, cursor);
  const pair = step.comparing ?? step.swapping;
  const registers: OpLineRegister[] = pair
    ? [{ label: labels.registers.left, value: String(pair[0]) }, { label: labels.registers.right, value: String(pair[1]) }]
    : [];
  return {
    meters: [
      { id: 'passes', label: labels.meters.passes, value: gauge.lit, total: gauge.count, pad: 2 },
      { id: 'comparisons', label: labels.meters.comparisons, value: counts.comparisons, total: null, pad: 3 },
      { id: 'swaps', label: labels.meters.swaps, value: counts.swaps, total: null, pad: 3 },
    ],
    phaseLabel: labels.phases[kind],
    tone: PHASE_TONES[kind],
    registers: [
      ...registers,
      { label: labels.registers.boundary, value: String(step.boundary) },
      { label: labels.registers.settled, value: String(step.sorted.length) },
    ],
  };
}

export function genericStageReadout(step: SortStep, index: number, lastIndex: number, labels: StageReadoutLabels): StageReadout {
  const kind: StepEventKind = index === 0 ? 'start' : index >= lastIndex ? 'complete' : 'step';
  return { meters: [], phaseLabel: labels.phases[kind], tone: kind === 'step' ? 'cyan' : PHASE_TONES[kind], registers: [] };
}
```

Spec pins: on the fixture's step 1 (compare) the meters read passes `01/1`, comparisons `1`, swaps `0`, tone `cyan`, registers `i 0 · j 1 · granica 4 · ustalone 0` (labels from the fixture); on the pass step the gauge is `{ count: 1, lit: 1, done: 1 }`; on the last step the tone is `lime`; the generic readout has no meters and the `start`/`step`/`complete` labels.

- [ ] **Step 7: Verify and commit**

```bash
npx vitest run --config vitest.config.ts src/app/features/algorithms/workbench 2>&1 | tail -4 && npm run test:algorithms 2>&1 | tail -3
git add src/app/features/algorithms/workbench/utils
git commit -m "$(cat <<'EOF'
Add the pure workbench utilities with specs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `PlaybackController` and the engine `seek`

**Files:**
- Modify: `src/app/features/algorithms/services/visualization-engine/visualization-engine.ts`, `visualization-engine.spec.ts` (add `seek(index)`, clamp `setSpeed` to 1–10)
- Create: `src/app/features/algorithms/workbench/playback-controller.ts`

**Interfaces:**
- Produces: `VisualizationEngine.seek(index: number): void` (clears the timer, clamps, emits the step, state `complete` at the last index else `paused`); `PlaybackController` (`@Injectable()`, provided by `Workbench` next to `VisualizationEngine`) with signals `history`, `step`, `cursor`, `lastIndex`, `playing`, `speed`, `status: PlaybackStatus`, `transportAction: TransportAction`, `events: readonly StepEvent[]`, `counts: StepEventCounts`, and methods `load(algorithmId, generator)`, `unload()`, `toggle()`, `play()`, `pause()`, `stepForward()`, `stepBack()`, `reset()`, `seek(index)`, `setSpeed(speed)`, `ngOnDestroy()`.
- Consumes: Task 1 utils, `RecentAlgorithmsStore`.

**What exists:** `VisualizationEngine` (`services/visualization-engine`, 147 lines) reads the whole generator into a private `history` on `load(generator, onStep)`, exposes `state`, `speed`, `totalSteps` (= last index), `currentStep`, `isPlaying`, `currentSnapshot`, `play` (silently returns at the last step), `pause`, `stepForward`, `stepBack`, `reset`, `stop`, and runs a recursive `setTimeout` chain; nothing calls `stop()` on destroy (the leak). The old page wrote the recent store on every tick.

- [ ] **Step 1: Engine `seek` + speed clamp (spec first)** — extend `visualization-engine.spec.ts`: `seek(3)` emits step 3 and pauses; `seek(99)` lands on the last index with state `complete`; `seek(-2)` lands on 0; `setSpeed(42)` reads back `10`, `setSpeed(0)` reads back `1`.
- [ ] **Step 2: The controller.** `load` materialises the generator once (`[...generator]`), stores it in `history`, hands `history.values()` to `engine.load`, and calls `recent.touch(id)`. `toggle` dispatches on `nextTransportAction`: `pause` → `engine.pause()` + a recent-store write; `restart` → `engine.reset(); engine.play()`; `play` → `engine.play()`. `setSpeed` only calls the engine (never the cursor). An `effect` records `{ id, step: lastIndex, total: lastIndex, finished: true }` when `status()` turns `complete`; `ngOnDestroy` records the current cursor (finished when complete) and calls `engine.stop()` — this is the leave hook and the leak fix.
- [ ] **Step 3: Verify and commit** — `npm run test:algorithms`, `npm run build`; commit "Add the playback controller and the engine seek".

---

### Task 3: Topbar, stage head, stage screen, legend row

**Files:**
- Create: `src/app/features/algorithms/workbench/workbench-topbar/workbench-topbar.{ts,html,scss}`, `stage-head/stage-head.{ts,html,scss}`, `stage-screen/stage-screen.{ts,html,scss}`, `legend-row/legend-row.{ts,html,scss}`
- Create: `src/app/features/algorithms/workbench/utils/legend.utils.ts`, `legend.utils.spec.ts`
- Modify: `i18n-keys.ts`, `pl.json`, `en.json` (`workbench.head.{optionsAriaLabel,shortcuts,copyLink,linkCopied}`, `workbench.legend.{unsorted,comparing,swapping,sorted,pivot,boundary}`)

**Interfaces:**
- `OhnoWorkbenchTopbar` (`ohno-workbench-topbar`): inputs `crumbs: readonly string[]`, `moduleCount: number`. Brand (tagline `topbar.tagline` with `{ count }`), key "‹ Katalog" (`faChevronLeft`, size `sm`, `routerLink="/algorithms"`, `queryParamsHandling="preserve"`), engraved crumbs joined by orange LED dots (last crumb `tone="bright"`), `ohno-search-field` (opens the palette), `ohno-lang-toggle`.
- `OhnoStageHead` (`ohno-stage-head`): inputs `name`, `difficulty: Difficulty`, `difficultyLabel`, `time`, `space`, `views: readonly VisualizationOption[]`, `activeView: VisualizationVariant`; outputs `viewChange`, `shortcuts`, `copyLink`. Title 28px (22px above 14 characters via `[class.stage-head__title--long]`), difficulty chip (inset pill: LED in the difficulty colour + engraving), Doto complexity readouts (`ohno-readout` string value, size `md`) with engravings "czas" / "pamięć" (one readout with "czas · pamięć" when equal), view keys (`ohno-key` with `led="signal"`, pressed = active), options key `…` (`faEllipsis`, `menu`) opening an `ohno-floating-plate` + `ohno-menu` with "Skróty klawiszowe" and "Kopiuj link" (a `linkCopied` engraving flashes for 1.4s).
- `OhnoStageScreen` (`ohno-stage-screen`): inputs `stepIndex`, `lastIndex`, `meters: readonly StageMeter[]`, `status: PlaybackStatus`, `statusLabel: string`, `phaseLabel`, `tone: LedColor`, `sentenceHtml: string`, `registers`, `liveText`, `liveRegionLabel`, `stepLabel`. Renders: the meters row (`ohno-meter [main]="true"` KROK + family meters), the status chip (LED amber `paused`, signal + pulse `playing`, lime `complete`, slate `idle`), the display (`<ng-content />` — the canvas), the op-line (`ohno-opline` with `<span [innerHTML]="sentenceHtml()">`, `em` picks the phase colour through the global `ohno-opline em` rule), and a visually hidden `aria-live="polite"` region.
- `OhnoLegendRow` (`ohno-legend-row`): inputs `items: readonly LegendEntry[]` (`{ label: string; color: LedColor }`), `hints: readonly LegendHint[]` (`{ keys: readonly string[]; label: string }`).
- `legend.utils.ts`: `legendLedColor(cssColor: string): LedColor` (`--viz-state-default`→slate, `-compare`→cyan, `-swap`→pink, `-sorted`→lime, `--chrome-accent`/`--viz-accent`→violet, `--viz-warning`/`--viz-hit`→amber, `--viz-danger`→red, `--viz-success`→lime, `--viz-route`→cyan, `--viz-ember`→signal, else slate), `legendLabelKey(label: string): string | null` (Unsorted, Comparing, Swapping, Sorted, Pivot, Boundary, Input stream, Active digit, Bucket lane, Gathered output → `workbench.legend.*`).

- [ ] **Step 1: legend utils spec + implementation.**
- [ ] **Step 2: the four components** with SCSS from image 02: head row height 70px, screen padding 26px 28px, meters gap 44px, op-line sits 18px above the screen edge, legend row 38px with 8px LEDs and `kbd` hints right-aligned.
- [ ] **Step 3: specimen** — add a "Stage" section to `/dev/instrument` rendering the head, screen (with a placeholder display), legend row and topbar; screenshot at 1440.
- [ ] **Step 4: i18n extract, verify, commit** — "Add the workbench topbar, stage head, stage screen and legend row".

---

### Task 4: Transport deck

**Files:**
- Create: `src/app/features/algorithms/workbench/transport-deck/transport-deck.{ts,html,scss}`, `src/app/features/algorithms/workbench/utils/deck.utils.ts`, `deck.utils.spec.ts`
- Modify: `i18n-keys.ts`, `pl.json`, `en.json` (`workbench.deck.{playAriaLabel,pauseAriaLabel,restartAriaLabel,taskAriaLabel}`)

**Interfaces:**
- `OhnoTransportDeck` (`ohno-transport-deck`): inputs `status`, `transportAction`, `stepIndex`, `lastIndex`, `speed`, `gauge: PassGauge | null`, `gaugeLabel`, `sizeOptions`, `size`, `sizeUnit`, `tasks: readonly TaskChoice[]` (`{ id; label }`), `activeTaskId`, `randomizeLabel`, `customSchema: TaskInputSchema<Record<string, unknown>> | null`, `customValues`, `customValidate`; outputs `reset`, `stepBack`, `toggle`, `stepForward`, `seek: number`, `speedChange: number`, `sizeChange: number`, `randomize`, `taskChange: string`, `customValuesChange: Record<string, unknown>`.
- `deck.utils.ts`: `hasCustomFields(schema): boolean` (any `int` / `float` / `string` field), `showSizeSection(sizeOptions, tasks): boolean` (more than one size and no tasks).

Sections (grooves between them, engraved titles): **Transport** — reset (`faRotateLeft`, lg), step back (`faBackwardStep`, lg), play/pause/restart (xl `signal`, icon `faPlay` / `faPause` / `faRotateRight` by `transportAction`), step forward (`faForwardStep`, lg); under each a `kbd` + engraving hint (R RESET, ← KROK, SPACJA START/PAUZA, → KROK). **Oś kroków** — engraving + `ohno-readout` `066/196` (md, pad 3), `ohno-slot` (seek), `ohno-gauge` when `gauge` is set. **Tempo** — `ohno-knob` 1–10 with readout `5×`. **Rozmiar** — `ohno-window-stepper` (hidden by `showSizeSection`), engraving unit. **Zadanie** (task algorithms) — `ohno-key` with the task name and `▾` opening an `ohno-menu` in an `ohno-floating-plate`. **Dane** — randomize key (`faDice`, family label) and "Własne…" (`faPen`) opening an `ohno-floating-plate` with the existing `app-viz-custom-values-popover` form (`apply` → `customValuesChange`, `close` → dismiss).

- [ ] **Step 1: deck utils spec + implementation.**
- [ ] **Step 2: the component** — the deck is 178px tall at 1440 (transport keys 56px, play key 104×70, gap 16px); at ≤1023 it wraps into two rows (transport + axis, then tempo + size + data). Rendering checks (review focus 5): with `[sizeOptions]="[16]"` the size section is absent; changing the knob emits `speedChange` only.
- [ ] **Step 3: specimen + i18n extract + verify + commit** — "Add the transport deck".

---

### Task 5: Inspector, code screen, trace host and log printer

**Files:**
- Create: `src/app/features/algorithms/workbench/inspector/inspector.{ts,html,scss}`, `workbench/trace-host/trace-host.{ts,html,scss}`, `workbench/log-printer/log-printer.{ts,html,scss}`, `workbench/utils/download-text.utils.ts`, `workbench/models/workbench-traces.ts`
- Modify: `components/code-panel/code-panel.{ts,html,scss}` (screen only: no dial, no copy button; `language` input decides the variant; Shiki `createCssVariablesTheme` mapped onto `--code-*`), `shared/code-highlight.service.ts` (theme swap)
- Delete: `shared/components/code-language-dial/`, `shared/components/copy-code-button/`, `components/code-panel/code-panel.utils` language-option helpers that fed the dial

**Interfaces:**
- `WorkbenchTraces` — one readonly record with the 17 family trace states (`graph`, `dp`, `dsu`, `grid`, `matrix`, `matrixGrid`, `network`, `search`, `sort`, `string`, `tree`, `numberLab`, `pointerLab`, `sieveGrid`, `callStackLab`, `callTreeLab`, `scratchpadLab`, `geometry`) and `graphFocus: { targetLabel; pathLabel; modeLabel; hint } | null`; `hasTrace(traces): boolean`.
- `OhnoInspector` (`ohno-inspector`): inputs `tab: InspectorTab` (`'code' | 'info' | 'trace'`), `algorithm: AlgorithmItem`, `codeLines`, `codeRegions`, `codeVariants`, `activeLineNumber`, `activeTaskName`, `codeSnippetMissing`, `traces: WorkbenchTraces`; output `tabChange`. Tabs are `ohno-key`s with LEDs in a `tablist` (Kod, Info, Ślad — the last only when `hasTrace`); right: language key `TS ▾` (`ohno-menu` of the available `codeVariants`, disabled entries for absent languages) and a copy key (`faCopy`, engraving "Skopiowano kod" flashes). The screen holds `app-code-panel` / `app-info-panel` / `ohno-trace-host`.
- `OhnoTraceHost` (`ohno-trace-host`): input `traces`; the trace `@switch` moved verbatim from `side-panel.html` (same order: graph → dp → dsu → grid → matrix → network → string → tree → numberLab → pointerLab → sieveGrid → callStackLab → callTreeLab → scratchpadLab → geometry family panels → sort → search) plus `matrixGrid` before `matrix` (spec 5.5 quirk fix).
- `OhnoLogPrinter` (`ohno-log-printer`): inputs `rows: readonly TapeRow[]`, `live: boolean`, `filter: TapeFilter`, `algorithmId: string`; output `filterChange: TapeFilter`. Engraving "Log · drukarka kroków", LED (lime + pulse when live, amber when paused), `ohno-tape`, side keys export (`faDownload`, downloads `<id>-log.txt` built with `formatTapeText`) and filter (`faFilter`, menu of the four filters), Doto row count + engraving "wierszy".
- Code screen: gutter 44px with line numbers in `--ink-4`, the active line gets `linear-gradient(90deg, rgb(var(--signal-rgb) / 0.22), transparent)` and a signal LED in the gutter, fold toggles render `▸`/`▾`, wrapped continuation lines get `↪`; mono 11.5px/1.7.

- [ ] **Step 1: `WorkbenchTraces` + `OhnoTraceHost`** (move the switch, keep every trace panel untouched).
- [ ] **Step 2: Code panel restyle + Shiki theme** (`createCssVariablesTheme({ name: 'instrument', variablePrefix: '--shiki-', variableDefaults: {} })`; the screen sets `--shiki-foreground`, `--shiki-token-keyword`, `-function`, `-constant`, `-string`, `-string-expression`, `-comment`, `-punctuation`, `-parameter`, `-link` from `--code-*`).
- [ ] **Step 3: Inspector + log printer + specimen section; i18n extract; verify; commit** — "Add the inspector, the code screen and the log printer".

---

### Task 6: The workbench route, single preset pair, deletions

**Files:**
- Create: `src/app/features/algorithms/workbench/workbench.{ts,html,scss}`, `workbench/utils/scenario.utils.ts`, `scenario.utils.spec.ts`
- Modify: `src/app/app.routes.ts` (`algorithms/:id` → `Workbench`), `components/visualization-canvas/visualization-canvas.{ts,html}` (one `presetOptions` / `presetId` / `presetChange`), `dev/instrument-specimen` (nothing), `core/layout/command-palette` (nothing — it already navigates to `/algorithms/:id`)
- Delete: `algorithm-detail/algorithm-detail.{ts,html,scss}` (the `algorithm-detail-config/` folder stays), `components/side-panel/`, `components/visualization-toolbar/`, `components/legend-bar/`, `components/log-panel/`, `components/sort-trace-panel/sort-algorithm-hints.ts` (dead)

**Interfaces:**
- `Workbench` (`app-workbench`, `providers: [VisualizationEngine, PlaybackController]`, host `(document:keydown)`): resolves `id` → `AlgorithmItem` / `AlgorithmViewConfig`; state `size`, `variant`, `presetId`, `taskId`, `customValues`, `graphFocusTargetId`, `inspectorTab`, `logFilter`, `graph`, `array`; `scenario.utils.ts` holds the pure pieces of the old `rebuildVisualization` (`resolvePresetId(config, requested)`, `resolveTaskId(config, requested)`, `presetOptionsOf(config)`, `hasTasks(config)`, `createRandomArray(size, range, random)`); the rest of the rebuild switch is ported from `AlgorithmDetail` lines 750–876.
- Layout (1440): `.workbench` = topbar 48px + grid `minmax(0, 1fr) 456px` / `minmax(0, 1fr) 318px`, gap 14px, page padding 14px 18px 16px; unit A (`ohno-plate` with screws) spans both rows: head, `ohno-stage-screen` (flex 1, min-height 320px), legend row, deck; unit B = inspector; unit C = log printer. Under 1440 unit B is 400px.
- Keyboard: `resolveWorkbenchKey({ key, modifier: ctrl/meta/alt, target: keyTargetKind(event.target), paletteOpen: palette.open() })` → `preventDefault()` + controller/tab/focus action. aria-live: the translated sentence, throttled to one announcement per 400ms while playing.
- Recent: `PlaybackController` handles pause/complete/leave (Task 2); the old per-tick effect is gone.
- States: not found → `ohno-plate` + `ohno-screen` + engraved `states.notFound` + "‹ Katalog" key; unavailable → the same with `states.unavailableEyebrow` / `states.unavailable`.

- [ ] **Step 1: scenario utils spec + implementation.**
- [ ] **Step 2: canvas preset collapse** (the eight renderers already take `presetOptions` / `presetId` / `presetChange`).
- [ ] **Step 3: `Workbench`** — port the state and the rebuild switch; compose the units; wire the keyboard map and the live region; legend items via `legendLedColor` / `legendLabelKey`; op-line sentence via `markupSentence(translate(step.description))`.
- [ ] **Step 4: route swap, deletions, i18n extract, verify** — every old component listed above has no importer left (`grep -rl`), `npm run test:algorithms`, `npm run build`, `/algorithms/bubble-sort` plays, pauses, steps, seeks, restarts from the end, changes tempo without moving the cursor, switches size and view, opens the palette with ⌘K, and writes `ohno:recent:v1` on pause and on completion; commit "Replace the algorithm detail page with the workbench".

---

### Task 7: Sorting displays in the dot language

**Files:**
- Modify: `components/bar-chart-visualization/bar-chart-visualization.{ts,html,scss}`, `components/block-swap-visualization/block-swap-visualization.{ts,scss}`, `utils/helpers/visualization-motion/visualization-motion.ts` (+ spec: export `prefersReducedMotion()`, gate `pulseElement` / `pulseSvgElement`)

**Display (image 02):** bars are LED-segment stacks (an SVG `mask` of 4px stripes with 2px gaps over a solid state-coloured rect), Doto 15px value labels above the bars (`--ink-3` idle, the state colour when comparing / swapping / sorted), a mono index axis `00 … 15` under the bars (comparing indices in cyan), a cyan bracket over the comparing pair with the annotation `74 > 12` (Doto 15px, the operator from the pair values), a lime dashed vertical rule at the boundary with the engraving "USTALONE" (`legend.sorted` uppercase) when `boundary < array.length`. Swap arc stays (Anime `animate`, `motion.swapMs`), compare pulses and the settle cascade go through `prefersReducedMotion()`. Block swap keeps its layout and gets the same texture, Doto values and tokens.

- [ ] **Step 1: `prefersReducedMotion` export + spec** (matchMedia stubbed).
- [ ] **Step 2: bar chart rewrite** (layout stays manual `setAttribute`; add the mask defs, the axis group, the bracket group, the boundary group).
- [ ] **Step 3: block swap pass; verify at speed 1 and 10; reduced motion; commit** — "Rebuild the sorting displays in the dot language".

---

### Task 8: Responsive layout, reduced motion, keyboard pass, docs, phase verification

**Files:**
- Modify: `workbench.scss`, `transport-deck.scss`, `inspector.scss`, `log-printer.scss` (breakpoints from spec 4.4), `CLAUDE.md`, `.claude/skills/ohno-design-tokens/SKILL.md`, `.claude/skills/ohno-motion-and-a11y/SKILL.md`

- [ ] **Step 1: Breakpoints** — 1280–1439: unit B 400px; 1024–1279: units B and C under unit A as two columns; 768–1023: the deck wraps into two rows, inspector and log stack; 360–767: one column, transport keys 48px, the knob becomes a `−` / `5×` / `+` window (`ohno-window-stepper` over 1…10), the stage keeps a 320px minimum height and scrolls horizontally.
- [ ] **Step 2: Screenshots** at 360 / 768 / 1024 / 1280 / 1440 of `/algorithms/bubble-sort` (paused at step 66) and of `/algorithms/dijkstra` (a non-sorting family inside the frame), plus a reduced-motion run (`reducedMotion: 'reduce'`: no LED pulse, no tape feed, instant knob).
- [ ] **Step 3: Keyboard pass** — Tab order: topbar brand → Katalog → search → PL/EN → view keys → options → transport keys → slot → knob → size keys → data keys → inspector tabs → language → copy → code screen (scrollable) → log keys; Space / ← / → / R / [ / ] / C / I / T / L work from the body and never from a focused key or field; Esc closes menus and plates.
- [ ] **Step 4: Docs** — CLAUDE.md "Top-level layout" (`workbench/` replaces `algorithm-detail/`), keyboard map + aria-live in `ohno-motion-and-a11y`, `--code-*` tokens and `ohno-brand` in `ohno-design-tokens`.
- [ ] **Step 5: Phase verification** — `npm run verify`; `grep -rn "rgba(var(" src/app/features/algorithms/workbench src/app/shared/instrument | wc -l` → 0; no compat token in `workbench/`; `npm run i18n:extract` clean; commit "Make the workbench responsive and document it"; push; send the screenshots.

---

## Rulings folded into this plan (defaults the spec leaves open)

- **Options key `…`** — image 02 shows it; Phase 3 gives it two real actions (keyboard shortcuts, copy link) instead of a dead control; family display options (scratchpad captions) join the menu in Phase 4.
- **Pass detection** — bubble sort emits no `phase`; a step whose `sorted` grows without a compare/swap counts as a pass boundary (`step-events.utils`), which is also right for selection, insertion, quick and merge sort; radix keeps its explicit `pass-complete`.
- **Tape detail for non-pair events** — the translated step description; the tape hides horizontal overflow.
- **Registers on the sorting op-line** — `i`, `j` (the active pair), `granica` (boundary), `ustalone` (settled count); the mockup's `end / index / swapped` are bubble-sort locals the generators do not expose.
- **Recent-store `total`** — the last step index (as the bank's `066/196` expects), written on pause, completion and leave only.
- **Custom values form** — the existing `VizCustomValuesPopover` form mounts inside an `ohno-floating-plate`; its inner controls keep their look until Phase 5.
- **Old i18n groups** (`features.algorithms.detail`, `sidePanel`, `toolbar.*Label`, `logPanel`) — left in place for Phase 5's key sweep.
- **Icons** — free Font Awesome glyphs wherever one exists (`faDice`, `faPen`, `faEllipsis`, `faDownload`, `faFilter`), so the cloud container's stubbed Pro packages render the real glyphs.
