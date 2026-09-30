# Instrument Redesign — Phase 3: Workbench Frame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old algorithm-detail page with the Instrument workbench of reference image 02 — topbar, unit A (head, stage screen with meters and op-line, legend row, transport deck), unit B (inspector: Kod / Info / Ślad), unit C (log printer) — with all playback semantics kept, the keyboard map and aria-live added, the recent store written on pause/leave/complete, the engine leak fixed, and the sorting bar display rebuilt in the dot language. Every other family keeps its current visualization and trace panel inside the new frame (Phase 4 restyles them).

**Architecture:** `Workbench` is the new route component (`features/algorithms/workbench/`). It resolves the algorithm and its `AlgorithmViewConfig` (the config file stays where it is), owns the scenario state that `AlgorithmDetail` had (size, variant, one `presetId`, task, custom values, graph focus) and delegates playback to `PlaybackController`, a per-workbench service wrapping `VisualizationEngine`: history, cursor, log rows, counters, keyboard actions, aria-live, recent-store writes and `ngOnDestroy → stop()`. The stage grammar is a set of small OnPush components composed from the Phase 1 primitives: `WorkbenchTopbar`, `StageHead`, `StageScreen` (meters + `VisualizationCanvas` + op-line), `LegendRow`, `TransportDeck`, `Inspector`, `LogPrinter`. Family-specific readouts come from `StageReadout` adapters (`sortingStageReadout` now, a generic fallback for everything else; Phase 4 adds the rest). All logic that can be pure lives in `*.utils.ts` files with Vitest specs.

**Tech Stack:** Angular 21.2 (standalone, signals, `@if/@for/@switch`, `afterRenderEffect`), TypeScript 5.9 strict, SCSS with the Instrument tokens, Transloco 8, Vitest 4, Shiki 4 (custom theme), Anime.js 4 for the bar swap arc, Playwright for viewport/reduced-motion checks.

**Spec:** `docs/superpowers/specs/2026-09-30-instrument-redesign-design.md` — sections 3.4 (motion), 3.5 (accessibility and keyboard map), 4.2 (workbench), 4.4 (states and responsiveness), 5.4 (decomposition), 5.5 (visualizations: sorting bar), 5.6 (i18n), 7 (open questions 7.2, 7.5, 7.7). Reference image `docs/redesign-instrument/02-instrument-ekran-algorytmu.webp`; mockup sources `proj-info/redesign/instrument/detail.html` + `detail.css` + `frame.js` (git-ignored, on disk). Inventory of the code being replaced: the executor's scratch reports (detail, playback, side-panel, viz, data) summarised inside each task's "What exists" notes.

## Global Constraints

- Angular 21.2.x: standalone, `changeDetection: ChangeDetectionStrategy.OnPush`, signal inputs, `output()`, `inject()` only, new control flow only, `name.ts` + `name.html` + `name.scss` per component; new components use the `Ohno` prefix / `ohno-` selectors except the route component `Workbench` (`app-workbench`).
- Colours only through `var(--x)` / `rgb(var(--x-rgb) / a)` from `src/styles/_instrument-tokens.scss`; no hex literals in component SCSS; `rgba(var(` forbidden; **no compatibility token** (`--surface-*`, `--text-*`, `--accent`, `--chrome-*`, `--elevation-*`, `--ring-focus`, `--font-sans`, `--radius-lg/-xl/-2xl/-3xl`, `--panel-*`, `--control-*`) in any new or rewritten file. Untouched visualizations and trace panels may keep theirs until Phase 4/5.
- Doto only for numbers, complexity notation and the marquee; never below 14px (recent readouts 15px). Engravings are `ohno-engraving`; every control has a visible label or `aria-label`.
- No comments in code except a WHY comment for a non-obvious workaround.
- Every user-visible string through `t()` keys registered in `src/app/core/i18n/i18n-keys.ts` and present in `public/i18n/pl.json` (PL first) and `en.json`; after each task that adds keys run `npm run i18n:extract` and delete the empty-string root key it leaves (`python3 -c` snippet in Task 0 Step 5).
- Reduced motion: CSS animations are covered by the global kill switch; JS-driven motion checks `prefersReducedMotion()` from `src/app/features/algorithms/utils/helpers/visualization-motion/visualization-motion.ts` (Task 5 exports it there).
- No `backdrop-filter`; `filter: drop-shadow` only on the comparing bars while they pulse.
- Never touch `src/app/features/algorithms/algorithms/**` (generators) or `algorithm-detail-config.ts` except where a task names an exact edit.
- After every task: `npm run test:algorithms` passes, `npm run build` succeeds (pre-existing budget warnings are fine), the workbench is checked in the browser on `/algorithms/bubble-sort`, then commit. Commit titles are short imperatives; every commit message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Never commit `proj-info/`.

## Review Focus

1. **Play at the end of a run** — pressing Space or the play key when the cursor is on the last step must restart from step 0 and play (the old engine ignored it); pinned by `playback-controller.utils.spec.ts` (`nextTransportAction`) in Task 1.
2. **Stepping back after a pass separator** — the log tape must drop rows above the cursor and never show a bold "current" separator row; pinned by `tape-rows.utils.spec.ts` in Task 1.
3. **Keyboard shortcuts while typing in the custom-values form or with the palette open** — Space/R/arrows must not drive playback there; pinned by `workbench-keys.utils.spec.ts` in Task 1.
4. **A sentence with no numbers and one with negative or decimal numbers** — the op-line markup must escape HTML, wrap `-3`, `2.5` and `10` as whole numbers and leave words alone; pinned by `sentence-markup.utils.spec.ts` in Task 1.
5. **Size window with a single size and a tempo change mid-run** — the size section must be hidden when `sizeOptions.length === 1`, and changing tempo must keep the cursor; pinned by `transport-deck` rendering checks in Task 2 and `playback-controller` behaviour in Task 1 (`setSpeed` never touches the cursor).

---

### Task 0: Workbench i18n keys, code-screen tokens, shared brand

**Files:**
- Modify: `src/app/core/i18n/i18n-keys.ts` (`features.algorithms.workbench` group), `public/i18n/pl.json`, `public/i18n/en.json`
- Modify: `src/styles/_instrument-tokens.scss` (code-screen syntax colours, `--well` already exists)
- Create: `src/app/shared/instrument/brand/brand.ts`, `brand.html`, `brand.scss`
- Modify: `src/app/core/layout/bank-sidebar/bank-sidebar.html`, `bank-sidebar.scss`, `bank-sidebar.ts` (use `ohno-brand`)

**Interfaces:**
- Produces: `I18N_KEY.features.algorithms.workbench.{topbar,head,stage,meters,phases,registers,legend,deck,inspector,log,states}` (leaves in Step 1); tokens `--code-fg #d8d7d1`, `--code-keyword #ff9d6b`, `--code-type #8fd6ff`, `--code-fn #ffffff`, `--code-comment #66676c`, `--code-punct #94948f` (+ `-rgb` twins), `--code-value` = `var(--lime)`; `OhnoBrand` (`ohno-brand`, inputs `tagline: string` (required), `link: string | unknown[] = '/algorithms'`, `ariaLabel: string` (required)).

- [ ] **Step 1: Register the keys**

In `src/app/core/i18n/i18n-keys.ts` inside `features.algorithms` (after `catalog`), add:

```ts
    workbench: {
      topbar: {
        catalog: t('features.algorithms.workbench.topbar.catalog'),
        crumbsAriaLabel: t('features.algorithms.workbench.topbar.crumbsAriaLabel'),
        tagline: t('features.algorithms.workbench.topbar.tagline'),
      },
      head: {
        time: t('features.algorithms.workbench.head.time'),
        space: t('features.algorithms.workbench.head.space'),
        timeSpace: t('features.algorithms.workbench.head.timeSpace'),
        viewsAriaLabel: t('features.algorithms.workbench.head.viewsAriaLabel'),
      },
      stage: {
        step: t('features.algorithms.workbench.stage.step'),
        tempo: t('features.algorithms.workbench.stage.tempo'),
        liveRegionLabel: t('features.algorithms.workbench.stage.liveRegionLabel'),
        status: {
          idle: t('features.algorithms.workbench.stage.status.idle'),
          paused: t('features.algorithms.workbench.stage.status.paused'),
          playing: t('features.algorithms.workbench.stage.status.playing'),
          complete: t('features.algorithms.workbench.stage.status.complete'),
        },
      },
      meters: {
        passes: t('features.algorithms.workbench.meters.passes'),
        comparisons: t('features.algorithms.workbench.meters.comparisons'),
        swaps: t('features.algorithms.workbench.meters.swaps'),
      },
      phases: {
        start: t('features.algorithms.workbench.phases.start'),
        step: t('features.algorithms.workbench.phases.step'),
        complete: t('features.algorithms.workbench.phases.complete'),
      },
      registers: {
        left: t('features.algorithms.workbench.registers.left'),
        right: t('features.algorithms.workbench.registers.right'),
        boundary: t('features.algorithms.workbench.registers.boundary'),
        settled: t('features.algorithms.workbench.registers.settled'),
      },
      legend: {
        hintTempo: t('features.algorithms.workbench.legend.hintTempo'),
        hintCode: t('features.algorithms.workbench.legend.hintCode'),
        hintLog: t('features.algorithms.workbench.legend.hintLog'),
        inputStream: t('features.algorithms.workbench.legend.inputStream'),
        activeDigit: t('features.algorithms.workbench.legend.activeDigit'),
        bucketLane: t('features.algorithms.workbench.legend.bucketLane'),
        gatheredOutput: t('features.algorithms.workbench.legend.gatheredOutput'),
      },
      deck: {
        transport: t('features.algorithms.workbench.deck.transport'),
        reset: t('features.algorithms.workbench.deck.reset'),
        step: t('features.algorithms.workbench.deck.step'),
        start: t('features.algorithms.workbench.deck.start'),
        pause: t('features.algorithms.workbench.deck.pause'),
        resetAriaLabel: t('features.algorithms.workbench.deck.resetAriaLabel'),
        stepBackAriaLabel: t('features.algorithms.workbench.deck.stepBackAriaLabel'),
        stepForwardAriaLabel: t('features.algorithms.workbench.deck.stepForwardAriaLabel'),
        axis: t('features.algorithms.workbench.deck.axis'),
        axisAriaLabel: t('features.algorithms.workbench.deck.axisAriaLabel'),
        tempo: t('features.algorithms.workbench.deck.tempo'),
        tempoAriaLabel: t('features.algorithms.workbench.deck.tempoAriaLabel'),
        size: t('features.algorithms.workbench.deck.size'),
        sizeAriaLabel: t('features.algorithms.workbench.deck.sizeAriaLabel'),
        sizeDecrease: t('features.algorithms.workbench.deck.sizeDecrease'),
        sizeIncrease: t('features.algorithms.workbench.deck.sizeIncrease'),
        task: t('features.algorithms.workbench.deck.task'),
        taskMenuLabel: t('features.algorithms.workbench.deck.taskMenuLabel'),
        data: t('features.algorithms.workbench.deck.data'),
        custom: t('features.algorithms.workbench.deck.custom'),
        customAriaLabel: t('features.algorithms.workbench.deck.customAriaLabel'),
      },
      inspector: {
        tabsAriaLabel: t('features.algorithms.workbench.inspector.tabsAriaLabel'),
        code: t('features.algorithms.workbench.inspector.code'),
        info: t('features.algorithms.workbench.inspector.info'),
        trace: t('features.algorithms.workbench.inspector.trace'),
        languageAriaLabel: t('features.algorithms.workbench.inspector.languageAriaLabel'),
        copy: t('features.algorithms.workbench.inspector.copy'),
        copied: t('features.algorithms.workbench.inspector.copied'),
      },
      log: {
        title: t('features.algorithms.workbench.log.title'),
        live: t('features.algorithms.workbench.log.live'),
        paused: t('features.algorithms.workbench.log.paused'),
        export: t('features.algorithms.workbench.log.export'),
        filter: t('features.algorithms.workbench.log.filter'),
        rows: t('features.algorithms.workbench.log.rows'),
        stepHeader: t('features.algorithms.workbench.log.stepHeader'),
        eventHeader: t('features.algorithms.workbench.log.eventHeader'),
        empty: t('features.algorithms.workbench.log.empty'),
        filters: {
          all: t('features.algorithms.workbench.log.filters.all'),
          compare: t('features.algorithms.workbench.log.filters.compare'),
          swap: t('features.algorithms.workbench.log.filters.swap'),
          pass: t('features.algorithms.workbench.log.filters.pass'),
        },
        events: {
          start: t('features.algorithms.workbench.log.events.start'),
          step: t('features.algorithms.workbench.log.events.step'),
          compare: t('features.algorithms.workbench.log.events.compare'),
          swap: t('features.algorithms.workbench.log.events.swap'),
          settle: t('features.algorithms.workbench.log.events.settle'),
          pass: t('features.algorithms.workbench.log.events.pass'),
          complete: t('features.algorithms.workbench.log.events.complete'),
        },
      },
      states: {
        notFound: t('features.algorithms.workbench.states.notFound'),
        unavailableEyebrow: t('features.algorithms.workbench.states.unavailableEyebrow'),
        unavailable: t('features.algorithms.workbench.states.unavailable'),
      },
    },
```

- [ ] **Step 2: PL and EN values**

Merge into `public/i18n/pl.json` under `features.algorithms` as `"workbench"` (run the merge script of Step 5 rather than editing by hand):

```json
{
  "deck": { "axis": "Oś kroków", "axisAriaLabel": "Pozycja kroku", "custom": "Własne…", "customAriaLabel": "Własne wartości", "data": "Dane", "pause": "Pauza", "reset": "Reset", "resetAriaLabel": "Resetuj przebieg", "size": "Rozmiar", "sizeAriaLabel": "Rozmiar danych", "sizeDecrease": "Mniej elementów", "sizeIncrease": "Więcej elementów", "start": "Start", "step": "Krok", "stepBackAriaLabel": "Krok wstecz", "stepForwardAriaLabel": "Krok naprzód", "task": "Zadanie", "taskMenuLabel": "Wybierz zadanie", "tempo": "Tempo", "tempoAriaLabel": "Tempo odtwarzania", "transport": "Transport" },
  "head": { "space": "pamięć", "time": "czas", "timeSpace": "czas · pamięć", "viewsAriaLabel": "Widok wizualizacji" },
  "inspector": { "code": "Kod", "copied": "Skopiowano kod", "copy": "Kopiuj kod", "info": "Info", "languageAriaLabel": "Język kodu", "tabsAriaLabel": "Inspektor", "trace": "Ślad" },
  "legend": { "activeDigit": "Aktywna cyfra", "bucketLane": "Kubełek", "gatheredOutput": "Zebrane wyjście", "hintCode": "kod", "hintLog": "log", "hintTempo": "tempo", "inputStream": "Strumień wejścia" },
  "log": { "empty": "Uruchom scenariusz, aby rozpocząć zapis.", "eventHeader": "ZDARZENIE", "events": { "compare": "PORÓWNAJ", "complete": "KONIEC", "pass": "── PRZEBIEG {{index}} ZAKOŃCZONY ──", "settle": "USTAL", "start": "START", "step": "KROK", "swap": "ZAMIEŃ" }, "export": "Pobierz log jako tekst", "filter": "Filtr zdarzeń", "filters": { "all": "Wszystkie zdarzenia", "compare": "Porównania", "pass": "Przebiegi", "swap": "Zamiany" }, "live": "Na żywo", "paused": "Wstrzymany", "rows": "wierszy", "stepHeader": "KROK", "title": "Log · drukarka kroków" },
  "meters": { "comparisons": "Porównania", "passes": "Przebieg", "swaps": "Zamiany" },
  "phases": { "complete": "Koniec", "start": "Start", "step": "Krok" },
  "registers": { "boundary": "granica", "left": "i", "right": "j", "settled": "ustalone" },
  "stage": { "liveRegionLabel": "Bieżący krok", "status": { "complete": "Zakończono", "idle": "Gotowy", "paused": "Pauza", "playing": "Odtwarzanie" }, "step": "Krok", "tempo": "tempo {{speed}}×" },
  "states": { "notFound": "Nie znaleziono modułu.", "unavailable": "Ta wizualizacja nie jest jeszcze gotowa.", "unavailableEyebrow": "Moduł zablokowany" },
  "topbar": { "catalog": "Katalog", "crumbsAriaLabel": "Ścieżka kategorii", "tagline": "Algorithm lab · {{count}} modułów" }
}
```

and into `public/i18n/en.json`:

```json
{
  "deck": { "axis": "Step axis", "axisAriaLabel": "Step position", "custom": "Custom…", "customAriaLabel": "Custom values", "data": "Data", "pause": "Pause", "reset": "Reset", "resetAriaLabel": "Reset the run", "size": "Size", "sizeAriaLabel": "Data size", "sizeDecrease": "Fewer elements", "sizeIncrease": "More elements", "start": "Start", "step": "Step", "stepBackAriaLabel": "Step back", "stepForwardAriaLabel": "Step forward", "task": "Task", "taskMenuLabel": "Choose a task", "tempo": "Tempo", "tempoAriaLabel": "Playback tempo", "transport": "Transport" },
  "head": { "space": "space", "time": "time", "timeSpace": "time · space", "viewsAriaLabel": "Visualization view" },
  "inspector": { "code": "Code", "copied": "Code copied", "copy": "Copy code", "info": "Info", "languageAriaLabel": "Code language", "tabsAriaLabel": "Inspector", "trace": "Trace" },
  "legend": { "activeDigit": "Active digit", "bucketLane": "Bucket lane", "gatheredOutput": "Gathered output", "hintCode": "code", "hintLog": "log", "hintTempo": "tempo", "inputStream": "Input stream" },
  "log": { "empty": "Run the scenario to start the tape.", "eventHeader": "EVENT", "events": { "compare": "COMPARE", "complete": "DONE", "pass": "── PASS {{index}} DONE ──", "settle": "SETTLE", "start": "START", "step": "STEP", "swap": "SWAP" }, "export": "Download the log as text", "filter": "Event filter", "filters": { "all": "All events", "compare": "Comparisons", "pass": "Passes", "swap": "Swaps" }, "live": "Live", "paused": "Paused", "rows": "rows", "stepHeader": "STEP", "title": "Log · step printer" },
  "meters": { "comparisons": "Comparisons", "passes": "Pass", "swaps": "Swaps" },
  "phases": { "complete": "Done", "start": "Start", "step": "Step" },
  "registers": { "boundary": "bound", "left": "i", "right": "j", "settled": "settled" },
  "stage": { "liveRegionLabel": "Current step", "status": { "complete": "Finished", "idle": "Ready", "paused": "Paused", "playing": "Playing" }, "step": "Step", "tempo": "tempo {{speed}}×" },
  "states": { "notFound": "Module not found.", "unavailable": "This visualization is not ready yet.", "unavailableEyebrow": "Module locked" },
  "topbar": { "catalog": "Catalog", "crumbsAriaLabel": "Category path", "tagline": "Algorithm lab · {{count}} modules" }
}
```

- [ ] **Step 3: Code-screen tokens**

In `src/styles/_instrument-tokens.scss` after `--screw-lo`, add:

```scss
  --code-fg: #d8d7d1;
  --code-fg-rgb: 216 215 209;
  --code-keyword: #ff9d6b;
  --code-keyword-rgb: 255 157 107;
  --code-type: #8fd6ff;
  --code-type-rgb: 143 214 255;
  --code-fn: #ffffff;
  --code-comment: #66676c;
  --code-comment-rgb: 102 103 108;
  --code-punct: #94948f;
  --code-punct-rgb: 148 148 143;
  --code-value: var(--lime);
```

- [ ] **Step 4: `OhnoBrand` and its use in the bank**

`src/app/shared/instrument/brand/brand.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OhnoEngraving } from '../engraving/engraving';

@Component({
  selector: 'ohno-brand',
  imports: [OhnoEngraving, RouterLink],
  templateUrl: './brand.html',
  styleUrl: './brand.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoBrand {
  readonly tagline = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly link = input<string | unknown[]>('/algorithms');
}
```

`brand.html`:

```html
<a class="brand" [routerLink]="link()" [attr.aria-label]="ariaLabel()">
  <span class="brand__mark" aria-hidden="true">
    <svg viewBox="9 14 46 36" fill="none">
      <ellipse cx="22.5" cy="32.5" rx="9.6" ry="11.6" stroke="currentColor" stroke-width="4" />
      <path d="M33.5 17.5V46M33.5 31.2l6.4-4.6 5.8 1 4.6 6.6V46" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />
      <circle class="brand__dot" cx="50.3" cy="46" r="3" />
    </svg>
  </span>
  <span class="brand__text">
    <span class="brand__name">Oh<i>(</i>no<i>)</i></span>
    <ohno-engraving>{{ tagline() }}</ohno-engraving>
  </span>
</a>
```

`brand.scss`:

```scss
:host {
  display: inline-block;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  color: var(--ink);
  border-radius: var(--radius-key);
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-key);
  background: var(--gradient-key);
  box-shadow: var(--shadow-key);
}

.brand__mark svg {
  width: 26px;
  height: 26px;
}

.brand__dot {
  fill: var(--signal);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.brand__name {
  font: 700 19px/1 var(--font-ui);
  letter-spacing: -0.02em;
}

.brand__name i {
  font-style: normal;
  color: var(--signal);
}
```

In `bank-sidebar.html` replace the whole `<a class="bank__brand" …>…</a>` block with:

```html
  <ohno-brand class="bank__brand" [tagline]="I18N_KEY.core.instrument.brand.tagline | transloco" [ariaLabel]="I18N_KEY.core.instrument.brand.homeAriaLabel | transloco" />
```

In `bank-sidebar.scss` delete the rules `.bank__mark`, `.bank__mark svg`, `.bank__mark-dot`, `.bank__brand-text`, `.bank__name`, `.bank__name i` and reduce `.bank__brand` to `{ padding: 0 6px 22px; }`. In `bank-sidebar.ts` import `OhnoBrand` from `../../../shared/instrument/brand/brand` and add it to `imports`.

- [ ] **Step 5: Merge script, extract, verify, commit**

```bash
cat > /tmp/ohno-merge-i18n.py <<'PY'
import json, sys
def sd(v): return {k: sd(v[k]) for k in sorted(v)} if isinstance(v, dict) else v
lang, path, value = sys.argv[1], sys.argv[2].split('.'), json.load(open(sys.argv[3]))
p = f'public/i18n/{lang}.json'; j = json.load(open(p)); node = j
for key in path[:-1]: node = node.setdefault(key, {})
node[path[-1]] = {**node.get(path[-1], {}), **value}
j.pop('', None); open(p, 'w').write(json.dumps(sd(j), ensure_ascii=False, indent=2) + '\n'); print(lang, 'merged', path)
PY
```

Save the two JSON blocks of Step 2 as `/tmp/wb-pl.json` and `/tmp/wb-en.json`, then `python3 /tmp/ohno-merge-i18n.py pl features.algorithms.workbench /tmp/wb-pl.json && python3 /tmp/ohno-merge-i18n.py en features.algorithms.workbench /tmp/wb-en.json && npm run i18n:extract && python3 -c "import json;[open(f'public/i18n/{l}.json','w').write(json.dumps({k:v for k,v in json.load(open(f'public/i18n/{l}.json')).items() if k!=''},ensure_ascii=False,indent=2)+'\n') for l in ('pl','en')]" && grep -c 'Missing value' public/i18n/pl.json public/i18n/en.json`

Expected: `0` and `0`. Then `npm run test:algorithms 2>&1 | tail -3 && npm run build 2>&1 | grep -E "ERROR|Application bundle generation complete"` — pass; open `/algorithms` and confirm the bank brand looks unchanged.

```bash
git add src/app/core/i18n/i18n-keys.ts public/i18n src/styles/_instrument-tokens.scss src/app/shared/instrument/brand src/app/core/layout/bank-sidebar
git commit -m "$(cat <<'EOF'
Add workbench i18n keys, code-screen tokens and a shared brand primitive

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---
