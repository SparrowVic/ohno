# Instrument Redesign — Phase 4: Family Displays Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every non-sorting family renders inside the Phase 3 stage grammar in the dot language of reference images 08–12: data glyphs lit on the black screen, Doto numbers, mono labels, cyan "attending" / pink "acting" / lime "settled" / violet "source" cursors, teaching annotations in small screen boxes, an optional right-hand rack of LED rows, family meters above and the op-line below. The old viz-panel / viz-header chrome, the in-canvas preset chips, the compat tokens, the invalid `rgba(var(` colours and the hard-coded English inside the family components go away. Trace panels are restyled as racks and screen tables.

**Architecture:**

- **One display stylesheet** — `src/styles/_display.scss` — holds the mixins the family components share: `display-layout` (main area + optional 200px rack), `display-cell` (inset Doto value cell with state modifiers), `display-tape` (sprocket strip + character cells), `display-node` (LED-ring SVG node), `display-graticule`, `display-cursor` (bracket / dashed guide / ring), `display-note` (teaching box), `display-chip` (mono label chip). Component SCSS files `@use` it and keep only layout.
- **Readout adapters** — `workbench/utils/family-readout.utils.ts` maps each state slot to `{ meters, phaseLabel, tone, registers, gauge }`. Phase labels come from the slot's `phaseLabel`; tones from the slot's `tone` or status flags. The deck gauge label per family comes from the same adapter (graph "Ustalone", DP "Wiersze", scratchpad "Fazy", geometry "Sprawdzone", string "Znaki tekstu", tree/grid/search/network/dsu their own).
- **Racks live inside the display.** A family visualization that has a list to show (queue, stack, items, registers, matches, margins) renders `ohno-rack` + `ohno-rack-row` in its right column through the `display-layout` mixin. The Ślad tab keeps the detailed trace panel.
- **Presets move to the deck.** `OhnoTransportDeck` gets `presetOptions` / `presetId` / `presetChange`; the *Dane* section shows a key with a menu (like the task key). `VizPresetPicker`, `VizPanel` and `VizHeader` are deleted once no template uses them.
- **Trace host knows the active view.** `OhnoTraceHost` takes `variant`; when the view is `number-lab` the number-lab panel wins, when it is `matrix-grid` the new `MatrixGridTracePanel` wins; otherwise scratchpad wins. `hasTrace` counts `matrixGrid`.
- **Trace panels** share three small primitives built from the Phase 1 set: `ohno-trace-facts` (rack of label/value rows), `ohno-trace-chips` (mono chips with tones) and `ohno-trace-table` (screen table). `SegmentedPanel`, `Table`, `TraceHint`, `UiTag` and `_eyebrow` go away when the last panel stops using them.
- **i18n**: every hard-coded English label found in the inventory gets a key under `features.algorithms.display.*` (rack titles, annotations, "result", "returns", "primes", radix HUD) or `features.algorithms.tracePanels.*`; geometry labels that the generators emit as plain strings are mapped through lookup tables in the component (same technique as `legend.utils.ts`).

**Tech Stack:** as Phase 3. No D3 outside the radix bucket view; template SVG everywhere else. Anime.js only for the radix card flights (gated).

**Spec:** sections 3.2 (colour), 4.3 (displays per family — the archetype table is the contract), 4.4, 5.5, 5.6, 8. Reference images 08 (graph), 09 (table), 10 (notebook), 11 (XY), 12 (tape); the bucket, stack and set archetypes derive from 02 / 09 / 10 as the table says.

## Global Constraints

Same as Phase 3, plus:

- No compat token (`--viz-*`, `--accent*`, `--chrome-*`, `--text-*`, `--surface*`, `--border*`, `--font-notebook`, `--font-sans`, `--radius-lg`) in any file this phase touches. The family colours are `--cyan` (attending), `--pink` (acting), `--lime` (settled / result), `--violet` (source / pivot), `--amber` (hint / LPS / warning), `--red` (conflict / rejected), `--slate` (idle), `--signal` only for the main counter and the active code line.
- Doto (`--font-dot`, ≥14px) for numbers only; mono for labels, ids, chips; UI font for sentences.
- No `backdrop-filter`; `filter: drop-shadow` only on the single current node / point.
- Every infinite CSS animation sits under `@media (prefers-reduced-motion: no-preference)` or is covered by the global kill switch; JS motion checks `prefersReducedMotion()`.
- Generators (`algorithms/**`) and `algorithm-detail-config.ts` stay untouched except for named edits (legend arrays, variant labels).
- After every task: `npm run test:algorithms`, `npm run build`, screenshots of the touched family at 1440 and 360, commit, push.

## Review Focus

1. **Rack overflow** — a rack with more rows than fit (Dijkstra queue of 10, DP items of 6) scrolls inside the display; the display never grows the stage.
2. **Family meters when a slot is missing** — the adapter falls back to the generic readout; `meters` is never `undefined`.
3. **Preset change from the deck** resets playback exactly like the old in-canvas chips (`onPresetChange` path unchanged).
4. **Trace host with both `scratchpadLab` and `numberLab`** picks the panel by the active view (pinned by a spec on the pure selector).
5. **Radix card flight under reduced motion** jumps instead of tweening.

## Status / handoff — 2026-10-04

**Done: Tasks 0–10.** Tasks 0–8 and 10 landed on `main` through PRs #42–#50. Task 9 (this sweep) passes the type check, the full Vitest suite (159 files, 1143 tests) and the production build.

**What Task 9 changed.**
- Deleted the dead UI: `viz-panel`, `viz-header`, `viz-preset-picker`, `visualization-palette` (`VIZ_COLOR`), `viz-options-menu`, `button`, `popover`, the whole `shared/controls` set (select, slider, number and text inputs, control chrome), `ui-tag`, `shared/styles/_eyebrow.scss` and the unused `DEFAULT_SORTING_LEGEND`.
- `info-panel` (the Info tab) is rebuilt on Instrument tokens, `ohno-engraving` and mono tag chips.
- Variant labels, randomize labels and the bar/block legends in `algorithm-detail-config.ts` are `I18N_KEY` references; the English lookup tables for variants, actions and legend labels are gone (the size-unit table stays). New keys: five variants (sieve grid, pointer lab, matrix grid, call tree, call stack) and sixteen randomize actions. Removed keys: `shared.vizOptionsMenu.*`, `toolbar.actions.newNetwork`/`newPresetCase`, `workbench.legend.activeDigit`/`bucketLane`.
- `_compat-tokens.scss` is deleted; `src/` has no compat alias, no `rgba(var(` and no `backdrop-filter`. The invalid comma-form glows in `math-text` were no-ops and are removed.
- Global tone scope: `styles.scss` emits `display.tone-scope` once (named `[data-tone]` → non-inheriting `--tone-pick`/`--tone-pick-rgb` registered with `@property`); `display.tone-vars` shrank to two declarations. Every family component is back under the 8 kB style budget (radix-matrix 11.34 → under, radix-strip 10.35 → under, dp, network, button gone); seeded before/after screenshots of all archetypes at 1440 and 360 are pixel-identical.
- CLAUDE.md and the `ohno-*` skills and reviewer agent drop the deleted components and compat tokens and describe the trace primitives, the tone scope and the display-readiness list.

**Remaining known issues.**
- Budget warnings left: the initial bundle (≈697 kB against 500 kB) and the dev-only specimen stylesheet (9.18 kB against 8 kB; was 13.62 kB).
- The `ohno-design-reviewer` audit has not run on Task 9 (Info tab restyle, tone scope).
- The Polish wording of the new variant and randomize keys wants a read by the author.
- Size units still resolve through the English `UNIT_KEY_SUFFIXES` table in `visualization-labels.ts`; the specimen page keeps a few hard-coded English sample labels (dev-only).
- Unverified from the Task 2/3 generator list after #50: the regex default case ending in a match and flood-fill queue order.
- Display proposals still unruled: `_display.scss` variants for soft settled / dashed frontier / dim settled cells; a `history` input on `visualization-canvas` instead of injecting `PlaybackController` into the matrix-grid display and trace panel.
- Repository housekeeping from the previous note (stale remote branches, Dependabot PRs) still applies.

---

### Task 0: Display language, readout adapters, deck presets, trace-host view awareness — DONE

**Files:**
- Create: `src/styles/_display.scss`
- Create: `src/app/features/algorithms/workbench/utils/family-readout.utils.ts` + spec
- Rulings: scratchpad phases are counted from captions, else indent-0 `note` lines, else dividers; the deck *Dane* section keeps `flex: 1 1 128px` / `max-width: 300px` so a third key never wraps the row at 1440, labels ellipsize; the preset key has no icon (the ▾ marks the menu).
- Modify: `stage-readout.utils.ts` (`StageReadout.gauge`, `gaugeLabel`), `workbench.ts` (use the family adapter), `workbench.html`
- Modify: `transport-deck.{ts,html,scss}` (preset key + menu in *Dane*), `workbench.html` (bind presets), `visualization-canvas.{ts,html}` (drop preset inputs)
- Modify: `trace-host.{ts,html}` (`variant` input, pure `pickTracePanel()` in `trace-host.utils.ts` + spec), `workbench-traces.ts` (`matrixGrid` counted), `inspector.{ts,html}`
- Modify: `i18n-keys.ts`, `pl.json`, `en.json` (`features.algorithms.display.*`)
- Modify: `src/app/dev/instrument-specimen/*` (display language samples)

- [x] Step 1: tokens check — no new tokens needed; `--screen` cells use `rgb(var(--white-rgb) / 0.035)` like rack rows.
- [x] Step 2: `_display.scss` mixins; specimen section "Display language" rendering a cell row, a tape strip, two nodes, a graticule, a note box, a rack.
- [x] Step 3: `family-readout.utils.ts` with `familyStageReadout(step, labels)` dispatching on the first present slot; specs for graph, dp, string, scratchpad, geometry.
- [x] Step 4: deck preset menu; canvas and family components stop receiving `presetOptions`.
- [x] Step 5: trace host `variant`; `MatrixGridTracePanel` placeholder (facts only) so the branch exists.
- [x] Step 6: i18n keys, extract, verify, commit "Lay the display language and family readouts".

### Task 1: Graph family (image 08) — DONE
Rulings: generator node and edge labels map to `features.algorithms.display.{graph,network,tree,dsuGraph,dsu}.*` through lookup tables; the log printer names graph phases with short verbs (`workbench.log.phases.*`); task algorithms fold task, custom values and randomize into one *Zadanie* deck section; the wide workbench is not height-locked — the inspector is `contain: size` at ≥1280 so long code scrolls inside it; the deck gauge caps at 12 LEDs and scales progress; op-line math renders through KaTeX while tape, export and aria-live read `plainSentence()`.
Follow-ups carried into later tasks: `_display` edge variants (red conflict, solid pink), `--node-value-size`, the `dsu-graph-layout` members-as-labels bug, the `pulseElement` default filter token, a min-cost register for networks, the DSU compressed tone, family tape verbs for dsu / network / tree.

`graph-visualization`, `dsu-graph-visualization`, `dsu-visualization`, `network-visualization`, `tree-visualization`: LED-ring nodes (r 14, ring 1.5px, Doto label inside, Doto distance under), weight chips, tree edges lime, active edge pink dashed, settled nodes lime, frontier dotted amber ring, source violet; rack = queue (head cyan) + settled (lime); network rack = queue + focus items with `flow/cap` edge labels; tree rack = stack/queue + output tape; DSU rack = sets as LED chip rows. Readout: settled/queue/relaxations meters, gauge "Ustalone". Delete viz-header usage. Commit "Rebuild the graph displays in the dot language".

### Task 2: Table family (image 09) — DONE
Rulings: the 26 table legends go through keys and follow image 09 (base slate, current cyan, candidates pink, computed ink, result path lime); the DP value meter reads the generator's `computation.result` while a cell is being decided; the DP gauge completes only at the backtrack or the last cell; A* labels its meter and gauge "closed"; the sieve readout uses the smallest factor that the board shows on composite cells.

`dp-visualization` (items rack + capacity readout, Doto cells, idle `·`, active cyan `?`, candidates pink with tags, result path lime), `matrix-visualization`, `matrix-grid-visualization` (divider rendered), `grid-visualization`, `sieve-grid-visualization` (primes rack); `MatrixGridTracePanel` filled; readouts: row/capacity/best (dp), pivot/row/col (matrix), frontier/visited (grid), prime/marked (sieve). Commit "Rebuild the table displays in the dot language".

### Task 3: Buckets — DONE
Rulings: radix steps bypass the sorting readout and show digit, bucket and in-buckets meters with a digits gauge; the legend reads input slate, current digit cyan, scatter pink, gathered output lime; Polish copy says "kubełek" everywhere; layout maths live in pure `radix-*-display.utils.ts` files with specs. Open items are listed in the status section above.

`radix-bucket` (D3 kept, colours via `getComputedStyle` tokens, HUD removed — meters/op-line carry it, no backdrop-filter, flight gated), `radix-strip`, `radix-matrix` (tape cells); `VIZ_HEX` and `VIZ_BUCKET_COLORS` deleted; radix strings to i18n. Commit "Rebuild the bucket displays".

### Task 4: Tape family (image 12) — DONE
`string-visualization` (11 modes on tape strips with sprocket dots, read-head bracket, LPS/Z rows amber, matches rack, "last fallback" note), `search-visualization` (lo/mid/hi cursors), `pointer-lab-visualization` (labelled cursors, window band, stats rack). Readouts: i/j/matches (string), lo/hi/probe (search), pointers (pointer-lab); gauge "Znaki tekstu". Commit "Rebuild the tape displays".

### Task 5: Notebook (image 10) — DONE
`scratchpad-lab-visualization` (register rack left, derivation lines numbered `01…`, dividers per phase, current cyan, decision pink, result lime, margins rack right with LED bars violet/amber/cyan), `number-lab-visualization` (registers + formula + history tape). Readouts: registers; gauge "Fazy". Commit "Rebuild the notebook displays".

### Task 6: XY plane (image 11) — DONE
`_geometry-viz.scss` → `_display.scss` graticule; 8 geometry components: cyan graticule with mono axis numbers, phosphor points with ids, hull/stack lime polyline, check triple cyan dashed, rejected pink ×, racks (stack + cross-product readout with verdict; events rail for sweep/voronoi/delaunay); `geometry-trace-panel` fully i18n. Gauge "Sprawdzone". Commit "Rebuild the plane displays".

### Task 7: Stack and sets — DONE
`call-stack-lab-visualization` (frames as inset cards, top cyan, returns rail), `call-tree-lab-visualization` (LED-ring tree + sidecar board as Doto cells). Commit "Rebuild the stack displays".

### Task 8: Trace panels — DONE
`ohno-trace-facts` / `ohno-trace-chips` / `ohno-trace-table` primitives; all 27 panels rewritten on them; invalid `rgba(var(` gone; `SegmentedPanel`, `Table`, `TraceHint`, `UiTag`, `_eyebrow`, `_trace-chip` deleted when unused. Commit "Restyle the trace panels as racks".

### Task 9: Sweep — DONE
Delete `viz-panel`, `viz-header`, `viz-preset-picker`, `visualization-palette`; legend arrays and variant labels through keys; `rgba(var(` count in `src` → 0; `grep backdrop-filter` → 0; screenshots of all seven archetypes at 1440 / 360; CLAUDE.md + skills updated. Commit "Finish the family displays".

### Task 10: Generator strings — DONE
Step descriptions, phase labels and node/edge captions that generators still emit as English template strings (graph, network, tree, DSU, radix HUD and the call-tree lab) move to `features.algorithms.runtime.<family>.*` keys with `i18nText(key, params)`; PL first, then EN; specs assert keys, not prose. Commit "Translate the generator strings".
