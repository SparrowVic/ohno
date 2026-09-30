# Ohno — complete visual redesign: "Instrument"

**Date:** 2026-09-30
**Branch:** `feat/redesign` (cut from `main` at `306de40`)
**Status:** for the owner's review before planning

## 1. Decision and scope

Ohno gets a complete visual redesign in the **Instrument** direction: the app is a
laboratory instrument for algorithms. Every screen is a graphite chassis with inset
dot-matrix displays and raised keys; the algorithm runs on the display; the user operates
it with transport keys, a tempo knob and a step slider.

The owner approved the direction from two mockups and wants them built **exactly as
drawn** ("zrób tak samo jak na obrazkach, wygląda to kozacko"). Those two images are the
contract for the catalog and for the sorting workbench. Five more mockups made for this
spec define how the other algorithm families render on the same display language.

In scope: every screen, element, flow and layout of the app chrome, the catalog, the
algorithm workbench and all 30 visualization components; the design-token catalog; the
rules that keep future work consistent (CLAUDE.md, skills, reviewer agent).

Out of scope: algorithm generators and their step models, the code snippets, the i18n
content of algorithm descriptions and logs, KaTeX and Shiki integration, the Structures
feature (stays "wkrótce"), a light theme.

## 2. Reference images (the contract)

Full-size sources live in `proj-info/redesign/` (outside git). Reduced copies for this
document sit in `docs/redesign-instrument/`.

| Image | Shows | Status |
|---|---|---|
| `01-instrument-katalog` | Catalog, Sorting category | approved by the owner, build 1:1 |
| `02-instrument-ekran-algorytmu` | Workbench, Bubble Sort at step 66/196 | approved by the owner, build 1:1 |
| `08-instrument-graf-dijkstra` | Graph display (Dijkstra) | proposed here |
| `09-instrument-dp-knapsack` | Table display (Knapsack 0/1) | proposed here |
| `10-instrument-notatnik-euklides` | Notebook display (Extended Euclidean) | proposed here |
| `11-instrument-xy-otoczka` | XY-scope display (Convex Hull) | proposed here |
| `12-instrument-tasma-kmp` | Tape display (KMP) | proposed here |

Mockup sources: `proj-info/redesign/instrument/*.html` with `instrument.css` (materials),
`detail.css` (workbench layout) and `frame.js` (shared chrome). The CSS values in those
files are the numeric source of truth for tokens; the numbers repeated below are copied
from them.

## 3. Design language

### 3.1 Materials

| Material | Recipe | Used for |
|---|---|---|
| Desk | `#0b0c0e` with two soft radial highlights; SVG noise overlay at 0.5 opacity, `mix-blend-mode: overlay` | page background |
| Plate | radius 20, gradient `#25272c → #1a1c20` at 150°, shadow `-6px -6px 16px white/.028, 10px 12px 26px black/.62, inset 1px 1px white/.075, inset -1px -1px black/.45` | every unit (sidebar bank, workbench units, module cards, path plate) |
| Screen | `#060708`, radius 14, `inset 0 0 0 1px black/.9, inset 4px 5px 12px black/.95, 0 1px white/.07`; dot texture `radial-gradient(white/.04 1px, transparent 1.25px)` at 6px; diagonal sheen | stage, code, search field, marquee, size window, card previews |
| Key | radius 12, gradient `#2e3137 → #202227`, shadow `-3px -3px 8px white/.035, 5px 6px 12px black/.6, inset highlights`; `.in` (pressed) = darker gradient with inset shadow; `.signal` = orange gradient `#ff8548 → #ef470a` with orange glow | every button, tab, latch, toggle |
| LED | 7px dot; off `#292b30`; on = colour with `0 0 7px` + `0 0 16px` glow | state indicators everywhere |
| Screw | 9px radial gradient dot with a slot line, four corners of large plates | decoration only |
| Knob | 84px ring of 11 ticks, conic-gradient cap, orange pointer; lit ticks up to the value | tempo |
| Slot | 14px inset channel with orange fill and a 22×36 cap | step position |
| Paper tape | cream `#ebe6d9` gradient, zig-zag top edge, drop shadow, dark lip | log printer |
| Engraving | mono 9.5px, `letter-spacing .15em`, uppercase, `#82827d`, 1px dark text-shadow | labels on the chassis |

No glass, no backdrop blur, no aurora gradients, no film grain on content, no brand rail,
no energy streams, no WebGL. Shadows are static; nothing lifts on hover. Hover on a key
is a slightly brighter gradient; press is `.in`.

### 3.2 Colour

| Token (new) | Value | Role |
|---|---|---|
| `--desk` / `--plate-hi` / `--plate-lo` / `--key-hi` / `--key-lo` / `--screen` | `#0b0c0e` `#25272c` `#1a1c20` `#2e3137` `#202227` `#060708` | materials |
| `--ink` / `--ink-2` / `--ink-3` / `--ink-4` | `#f0efea` `#b9b8b2` `#82827d` `#56575b` | text ramp |
| `--signal` | `#ff5a1f` | the one action colour: play key, active LED on tabs/latches, main step counter, slot fill, knob pointer, focus ring |
| `--viz-state-compare` (cyan) | `#4ce3ff` | attending: current node/cell/line, read head, comparison |
| `--viz-state-swap` (pink) | `#ff5fa8` | acting: swap, relaxation, decision, rejection |
| `--viz-state-sorted` (lime) | `#c7e56a` | done: settled, matched, result, "na żywo" LED |
| `--viz-state-default` (slate) | `#7d8696` | idle data |
| `--amber` | `#ffb224` | queued/frontier, warnings, pause LED, LPS table |
| `--red` | `#ff6257` | errors, "Ekstremalne" difficulty LED |
| `--violet` | `#a992ff` | source/pivot/invariant |
| `--paper` / `--paper-ink` | `#ebe6d9` `#2a2620` | tape |

Difficulty LEDs: Łatwe `#7fe08a`, Średnie amber, Trudne signal orange, Ekstremalne red.
Every colour token also gets an `-rgb` twin; components use only
`var(--token)` or `rgb(var(--token-rgb) / a)`. The `rgba(var(--x-rgb), a)` form is
forbidden (419 such declarations are silently dropped by browsers today).

The semantic viz vocabulary stays: cyan attends, pink acts, lime is done. Existing
components that read `--viz-state-*` keep working; the family accents (`--viz-accent`,
`--viz-window`, `--viz-warning`, `--viz-success`, `--viz-route`, `--viz-danger`,
`--viz-hit`, `--viz-ember`) are remapped onto the new palette (slate, violet, amber, lime,
cyan, red, amber, signal) so that untouched components degrade gracefully during the
migration.

### 3.3 Typography

| Face | Package | Use |
|---|---|---|
| Instrument Sans | `@fontsource-variable/instrument-sans` | all UI text, headings, descriptions on screen |
| Doto (ROND 100, weight 900) | `@fontsource-variable/doto` | numeric readouts only: counters, complexities, values on bars/cells, register values |
| Geist Mono | `@fontsource-variable/geist-mono` | engravings, code, small labels, registers in the op-line |
Sora, IBM Plex Mono, Newsreader and Caveat are removed; KaTeX keeps its own fonts. Fonts are self-hosted through `@fontsource`
imports in `styles.scss` (no Google Fonts `@import`).

Sizes in use: headings 28 (workbench title), 19 (brand), 18 (card title), 14.5/13/12.5
(UI), 11.5 (code), 9.5 (engravings). Doto: 50 (main counter), 30 (meters), 22–24
(registers, marquee stats), 15–19 (values in cells/bars), 58 (marquee category name).
Rule: Doto is for numbers, complexity notation and the one-word category marquee; never below 14px and never for sentences.

### 3.4 Shape, depth, motion

Radii: plate 20, module card 18, screen 14, key 12 (transport keys 15, play key 18),
window 10, LED chip 13, kbd 5. No element is more rounded than 20px except LEDs.

Motion (all through `--duration-*` and gated by `prefers-reduced-motion`):

- Key press: gradient swap + inset shadow, 90ms.
- LED on/off: 150ms opacity; the "na żywo" and current-step LEDs pulse gently (2.4s).
- Knob: pointer rotates 220ms `--ease-out-quart`; ticks light in sequence.
- Slot cap slides with the step; the fill follows.
- Tape: a new log row feeds in from under the lip (translateY + fade, 220ms).
- Display refresh: when a step changes, the op-line description cross-fades (150ms);
  numeric readouts change instantly (no digit rolling).
- Visualizations keep their own choreography (D3 + Anime.js for sorting, WAAPI pulses
  elsewhere) but every pulse goes through one shared `prefersReducedMotion()` gate.

Reduced motion: no pulses, no tape feed animation, no knob sweep; state changes are
instant. Playback delay itself is unchanged.

### 3.5 Accessibility

- Focus ring: `0 0 0 2px var(--signal)` outside plus a soft orange halo; on keys it
  replaces the highlight edge. Never removed.
- Keys are real `<button>`s with `aria-label`s; latches are `aria-pressed`; tabs are a
  `tablist`; the knob is an `<input type="range">` (1–10) rendered as a knob; the size
  window is a spinbutton; the slot is a `range` over steps.
- Contrast: engravings at `#82827d` on plate meet 4.5:1 only at ≥12px, so engravings
  are informational; every control also has a visible sans label or an aria-label.
  Doto readouts are ≥14px and high-contrast.
- Every stage `<svg>` gets `role="img"` and an `aria-label` from the family mode label.
- An `aria-live="polite"` region announces the op-line sentence on step change (throttled
  to once per 400ms during playback).
- Keyboard on the workbench: `Space` play/pause, `←`/`→` step, `R` reset,
  `[`/`]` tempo −/+, `C` `I` `T` inspector tabs, `L` focus log, `⌘K`/`/` search,
  `Esc` closes menus. Shortcuts show as `kbd` chips under the keys and in the legend row.
- Language: `<html lang>` follows the PL/EN toggle (existing service).

## 4. Screens

### 4.1 Catalog (image 01)

Layout at 1440: left plate (sidebar bank, 252px), main column.

- **Bank sidebar (plate).** Brand block; engraved group title "Algorytmy"; one row per
  category: LED (lit for the active one, orange), name, Doto count. Rows: Wszystkie 102,
  Sortowanie 11, Wyszukiwanie 3, Drzewa 1, Grafy 26, Dynamiczne 21, Napisy 11,
  Geometria 8, Inne 21. A groove, then "Struktury" with one disabled row "Struktury
  danych · Wkrótce". A groove, then "Ostatnio otwierane": up to three inset rows with
  algorithm name, Doto step counter (`066/196`) and a thin progress bar (orange; lime when
  finished). Foot: `?` Skróty and the PL/EN toggle.
- **Marquee screen.** Engraving "Bank 01 · kategoria", category name in Doto 58,
  stats to the right: Modułów, and one per subcategory (counts), Doto 30.
- **Tools.** Search screen "Szukaj w 102 algorytmach… ⌘K" and four difficulty latches
  (Łatwe, Średnie, Trudne, Ekstremalne) — each a key with a coloured LED; pressed keys are
  the active filters (multi-select, all pressed by default).
- **Ścieżka startowa (plate).** Curated path for beginners per category: numbered keys
  chained by "cables"; the current step key is pressed, lit cables mark progress; a Doto
  `1/4` readout. Paths are static data per category (`data/catalog/paths.ts`), progress
  comes from the "recent" store (an algorithm counts as done when it was played to the end).
- **Groups.** One engraved group line per subcategory with its Doto count, then a
  4-column grid of module cards.
- **Module card (plate, radius 18).** Two screws; top row: engraved module id (`SRT-01`)
  and difficulty LED + label; a screen with a live preview; name (18px); description
  (12.5px, two lines); foot: Doto complexity + "czas" engraving and a round key. Hover:
  plate brightens, the screen gets a faint orange ring, the preview plays a short loop, a
  "● NA ŻYWO" engraving appears, the round key turns signal orange. Cards are links.
- **Preview.** Each family has one preview drawing in the dot language (bars, buckets,
  graph, matrix, tape, notebook lines, XY points, stack). The existing static
  `algorithm-card-preview-spec` (1529 lines of hand-drawn variants) is replaced by 8
  family drawings parameterised by the algorithm's colours; on hover the drawing animates
  its "current" element (cyan) for two seconds.
- **Removed from today's catalog:** the prose hero, the "Interactive Algorithm Atlas"
  eyebrow, the three stat tiles, the meta pills, the traits multi-select popover, the
  "Interaktywny / Na żywo / TIME / SPACE" badge row on cards, the 2px stripe, difficulty
  pips, the roadmap overlay directive, the card glint/scan hover.
- **Traits** stay in data and become searchable in ⌘K ("greedy", "in-place"); they are not
  a catalog filter any more (open question 7.1).
- "Wszystkie 102" renders all groups; cards below the fold are `@defer (on viewport)`.

Module ids: three-letter family code + index within the category (`SRT-01`, `SRC-01`,
`TRE-01`, `GRF-01`, `DYN-01`, `STR-01`, `GEO-01`, `MSC-01`), derived from catalog order.

### 4.2 Workbench (image 02)

Layout at 1440: topbar 48px; a grid `minmax(0,1fr) 456px` × `minmax(0,1fr) 318px` with
14px gaps; unit A spans both rows.

- **Topbar.** Brand (mark + "Oh(no)" + engraving "Algorithm lab · 102 moduły"), key
  "‹ Katalog", engraved crumbs (Algorytmy • Sortowanie • Porównawcze, last one brighter),
  search screen "Szukaj algorytmu… ⌘K", PL/EN toggle.
- **Unit A — the instrument.** Screws. Head row: title (28px; 22px when longer than 14
  characters), difficulty LED chip, Doto complexity readouts with engravings "czas" and
  "pamięć" (one readout "czas · pamięć" when both are equal), view keys (segmented, LED
  per key; a single pressed key when the algorithm has one view), an options key (`…`).
- **Stage screen.** Meters row: main counter `KROK 066/196` (Doto 50, orange) plus up to
  three family meters (Doto 30); status chip on the right (LED + engraving "Pauza · tempo
  5×" / "Odtwarzanie · tempo 5×"). The visualization fills the middle. The **op-line** at
  the bottom: LED in the phase colour, engraved phase name, the step description as a
  sentence (numbers in the phase colour), and a register strip in mono (`end 13 · index 5
  · swapped true`).
- **Legend row.** LED + label per state, and `kbd` hints on the right.
- **Deck.** Sections separated by grooves, engraved titles:
  - *Transport*: Reset, Krok ←, Start/Pauza (signal key 104×70), Krok →, each with its
    `kbd` hint.
  - *Oś kroków*: ruler with marks, the slot with its cap (drag to scrub), a gauge row of
    LEDs with an engraved label and Doto readout (sorting: "Przebiegi 03/15"; graph:
    "Ustalone 03/8"; DP: "Wiersze"; scratchpad: "Fazy"; geometry: "Sprawdzone"; string:
    "Znaki tekstu").
  - *Tempo*: the knob with a Doto `5×` readout (`[`/`]`).
  - *Rozmiar*: a screen window with the value and −/+ keys, engraving with the unit
    ("elementów", "węzłów", "punktów", "znaków", "przedmiotów"); cycles through the
    algorithm's allowed sizes. Hidden when only one size exists.
  - *Dane*: keys "Losuj" / "Nowy graf" / "Nowa chmura" … (the family's randomize label)
    and "Własne…" (custom values popover) when the algorithm has an input schema.
  - *Zadanie* (replaces Rozmiar for task-based algorithms): a key showing the active
    task name and its parameters (`Znany gcd · 735, 210 ▾`) that opens the task list, and
    "Własne liczby…".
- **Unit B — inspector.** Tabs as keys with LEDs: Kod, Info, Ślad (Ślad only when the
  family has trace state). Right: language key `TS ▾` (menu) and a copy key. The code
  screen shows Shiki output restyled: mono 11.5px, line numbers, the active line with an
  orange gradient and an LED in the gutter, fold arrows. Info keeps its content
  (description, tags, complexity cards, tutorial) restyled as engraved sections. Ślad keeps
  each family's trace panel restyled as racks and tables on the screen.
- **Unit C — log printer.** Engraving "Log · drukarka kroków", "● Na żywo" LED. A paper
  tape with `KROK · ZDARZENIE` header, rows `066 ● PORÓWNAJ 74[5] : 12[6]` (dot in the
  phase colour, mono), separators for phases (`── PRZEBIEG 2 ZAKOŃCZONY ──`), the current
  row bold with a `◂` mark. Side keys: export (downloads the log as text) and filter
  (phase filter menu). Doto row count. The tape scrolls; new rows feed in from the lip.
  The log is always visible (no longer a tab).
- **Removed from today's workbench:** the glass viz-panel, the toolbar card layout,
  "RUN STATE" progress card, the select controls, the speed slider, the resizable
  side panel and drag handle, the Log tab, the viz-header chips inside the canvas (their
  content moves to the meters/op-line), the "New …" bloom button.

Behaviour kept: all playback semantics of `VisualizationEngine`, sizes, variants, tasks,
presets (preset chips move into the *Dane* section as a key with a menu), custom values
popover (restyled as a floating plate), graph focus (click a node), code language choice,
copy, fold regions, the not-found and "unavailable" states (restyled as a screen with an
engraved message).

### 4.3 Displays per family (images 08–12)

Every family renders inside the same stage grammar:

1. **Meters** — the main step counter plus 2–3 family counters.
2. **The display** — the visualization itself, in the dot language: data glyphs are
   lit elements on the black screen; numbers are Doto; small labels are mono.
3. **Rack** — an optional right-hand column (196–214px) with LED-rowed lists: queue,
   stack, items, matches, registers, margins.
4. **Op-line** — phase LED, phase name, the step sentence, registers.
5. **Cursors and markers** — brackets, dashed guides and rings in cyan for "attending",
   pink for "acting", lime dashed lines for "settled" boundaries, violet for
   source/pivot. Annotations that teach (e.g. `74 > 12`, `+412`, `r = 105`) sit in small
   screen-coloured boxes next to the element, never as tooltips.

| Archetype | Mockup | Components (variant keys) | Notes |
|---|---|---|---|
| Słupki / bloki | 02 | bar-chart, block-swap | as approved: dotted solid bars, Doto values, index axis, pair bracket, settled boundary |
| Kubełki | (derive from 02) | radix-bucket, radix-strip, radix-matrix; counting/bucket sort via bar-chart | bins are small inset screens in a row; cards fly between them (keep Anime); digit strip cells use tape cells |
| Graf | 08 | graph (16 algorithms), dsu-graph, network, tree, call-tree-lab (tree part), string (Huffman/Aho-Corasick tries) | LED-ring nodes with Doto distance/value under them; weight chips on edges; tree edges lime, active edge pink dashed; rack = queue/stack + settled list; network: edge label `flow/cap` |
| Tabela | 09 | dp (21 algorithms), matrix, matrix-grid, grid (flood fill, A*), sieve-grid, call-tree sidecar board | Doto cells; idle cells dim `·`; active cell cyan with `?`; candidates pink with tags (skip/take, R₂−3·R₁); result path lime; rack = items/rows/primes |
| Taśma | 12 | string (KMP, Rabin–Karp, Z, Manacher, BWT, RLE, suffix arrays, palindromic tree), search, pointer-lab | tape strips with sprocket dots; Doto characters with mono indices; read head bracket spanning aligned tapes; LPS/Z rows in amber; pointers as labelled cursors; search shows lo/mid/hi cursors on one tape |
| Notatnik | 10 | scratchpad-lab (11 modes), number-lab | register rack (Doto values; current cyan, result lime, unused dim); derivation display with numbered lines (KaTeX on dark), dividers per phase, current line cyan, decision pink, result lime; margin notes with coloured LED bars (invariant violet, hint amber, now cyan) |
| Płaszczyzna XY | 11 | the 8 geometry components | cyan graticule with mono axis numbers; phosphor points with ids; hull/stack lime polyline; check triple as cyan dashed path; rejected points pink ×; rack = stack rows + a "cross product" readout with verdict |
| Stos | (derive from 10 + 08) | call-stack-lab | frames as a vertical rack of inset cards (title Doto/mono, locals as mini registers); the top frame cyan; returns rail on the right; call tree on the display when present |
| Zbiory | (derive from 09) | dsu | sets as rack rows of LED chips; union animates a chip moving between rows |

The five proposed mockups carry the same real data the app uses (Dijkstra's 8-node graph,
the "camp" knapsack, task "Znany gcd" 735/210, a 14-point cloud, the KMP text
`ABABDABACDABABCABAB`).

### 4.4 States and responsiveness

- **Empty/idle:** before the first step the op-line reads the algorithm's start sentence;
  meters show `000`.
- **Complete:** the status chip turns lime "Zakończono"; the play key shows the reset
  glyph; the slot cap sits at the end.
- **Unavailable / not found:** a single plate with a screen and an engraved message and a
  "‹ Katalog" key.
- **Loading (lazy chunks, fonts):** plates render immediately; screens show a dim dot
  texture until content arrives (no spinners).
- **1280–1440:** the same layout; unit B shrinks to 400px.
- **1024–1279:** unit B and C move under unit A as two columns; the deck keeps five
  sections.
- **768–1023:** the deck wraps into two rows (transport + axis, then tempo + size +
  data); the inspector and log stack; the catalog grid has two columns and the bank
  sidebar collapses to a top row of category keys.
- **360–767:** one column everywhere; transport keys 48px; the knob becomes a
  `−`/`5×`/`+` window; the stage keeps a 320px minimum height and scrolls horizontally
  for wide tapes/tables; the catalog shows one column; the marquee stats wrap.
- **Reduced motion:** see 3.4.

## 5. Front-end architecture

### 5.1 Tokens (`src/styles.scss`)

Rewrite the file: keep only the token groups in section 3 plus radii, motion, elevation
(plate/key/screen recipes as tokens: `--shadow-plate`, `--shadow-key`, `--shadow-key-in`,
`--shadow-screen`), focus, fonts, z-index (`--z-menu`, `--z-popover`, `--z-toast`). Delete
the grid canvas, the brand rail, the `.viz-flow*` block (dead, ~300 lines), unused
keyframes and `@property` registrations, the surface ladder, chrome layers, glass and
aurora tokens. Add the `-rgb` twins. Remove the Google Fonts import; add the three
`@fontsource` imports and keep `katex.min.css`.

### 5.2 Primitives (`src/app/shared/instrument/`)

Standalone, OnPush, signal inputs, one folder per primitive (`ts` + `html` + `scss`):

| Primitive | Replaces | Notes |
|---|---|---|
| `OhnoPlate` | glass panels, `segmented-panel` shells | attribute-style host with `screws` input |
| `OhnoScreen` | – | inset display; `dots` input for the texture |
| `OhnoKey` | `AppButton` (6 appearances × 6 accents) | `variant: default \| in \| signal`, `size`, `led`, `kbd`, icon slot; renders `button`/`a` |
| `OhnoLed` | `ui-tag` colour dots, legend dots | `color`, `on`, `pulse` |
| `OhnoReadout` | – | Doto number with optional `/total`; `size` |
| `OhnoEngraving` | `eyebrow` mixin | mono uppercase label |
| `OhnoKnob` | `controls/slider` | wraps a range input |
| `OhnoWindowStepper` | `controls/select` for sizes, `number-input` | value window with −/+ keys |
| `OhnoSlot` | toolbar progress bar | scrubbable range over steps |
| `OhnoGauge` | – | LED row with label and readout |
| `OhnoMeter`, `OhnoOpLine`, `OhnoRack`, `OhnoRackRow` | viz-header, trace chips | stage grammar |
| `OhnoTape` | `log-panel` | printer with rows, separators, side keys |
| `OhnoSearchField` | navbar command trigger | opens the palette |
| `OhnoLangToggle` | `language-switcher` + `world-flag-globe` | two keys PL/EN |
| `OhnoMenu` | `select`, `code-language-dial` | floating plate with keys; keyboard navigable |
| `OhnoFloatingPlate` | `popover` | for custom values, task list, options |
| `OhnoLatch` | `select-button`, `multi-select` | pressed keys with LEDs |

Kept and restyled: `MathText`, `CodePanel` (+ Shiki theme swap to the instrument palette),
`CopyCodeButton` (becomes an `OhnoKey`), `Table`, `TraceTable`-style tables inside racks,
form controls used by the custom-values popover (restyled as screen fields).

Deleted: `shader-card-effect`, `insane-shader-pool.service`, `world-flag-globe` and its
2.3 MB of JSON in `public/data`, `bg-energy-layer`, `navbar-tab-deck*`,
`roadmap-overlay` directive, `_browse-card.scss`, `_chrome-pill.scss`, `_eyebrow.scss`,
`ui-tag`, `segmented-panel`, `code-language-dial` (fan menu), the empty `difficulty-filter`,
`roadmap-card-overlay` and `trace-table` directories, `algorithm-card-preview-spec` and its
`.shared.ts`, `difficulty-label.ts` (hard-coded strings), Three.js from `package.json`.

### 5.3 Shell and catalog

- `Shell` becomes the instrument shell: topbar-less (the bank sidebar carries the brand),
  `BankSidebar` + `<main>`; the detail route keeps its own `WorkbenchTopbar`.
- `NavigationService` keeps its group/item model; the bank shows categories only and the
  subcategory groups render inside the catalog. `SidebarFilter` stays; query params stay.
- New `RecentAlgorithmsStore` (signals + localStorage `ohno:recent:v1`): id, last step,
  total, finished flag; written by the workbench on pause/leave/complete.
- New `CommandPalette` (⌘K, `/`): fuzzy search over name, category, subcategory, traits;
  Enter opens; arrows move; also lists the five shortcuts.
- `AlgorithmsPage`: marquee, tools, path plate, groups, deferred grid. Difficulty latches
  stay local state. `filteredSnapshot` keeps its single pass; the tracks stat is dropped
  (its subcategory-name collision bug goes with it).
- `AlgorithmCard` → `ModuleCard` with `ModulePreview` (8 family drawings in one small
  component, `@switch` on family).

### 5.4 Workbench decomposition

`AlgorithmDetail` (954 lines) splits into:

- `Workbench` — route component; resolves config, tasks, sizes; owns the engine (provided
  per component) and the `PlaybackController`.
- `PlaybackController` (service, per workbench) — engine signals, log entries, recent
  store writes, keyboard shortcuts (`@HostListener` on the workbench host), the
  aria-live announcer, `ngOnDestroy` stops the engine timer (fixes the leak).
- `WorkbenchTopbar`, `StageHead`, `StageScreen` (meters + `VisualizationCanvas` +
  op-line), `LegendRow`, `TransportDeck` (transport, axis, tempo, size/task, data),
  `Inspector` (tabs + `CodePanel` / `InfoPanel` / trace panels), `LogPrinter`.
- Family meters and op-line content come from a new `StageReadoutAdapter` per family that
  maps the existing state slots (`phaseLabel`, `decisionLabel`, `computation`, counts) to
  `{ meters, phase, sentence, registers }`. Most families already carry these fields.
- `visualization-canvas` keeps its `@switch`; the 8 preset input/output pairs collapse
  into one `presetOptions`/`presetId` pair keyed by family.

### 5.5 Visualizations

- Sorting (bar, block, radix ×3) follow image 02; D3 + Anime.js stay.
- The template-driven families get a shared `_display.scss` (cells, tapes, racks,
  cursors, LED rings, graticule) and per-family SCSS reduced to layout; colours only via
  tokens; numbers in Doto through a `.readout` class; hard-coded English in radix HUD,
  geometry trace eyebrows, number-lab and call-stack-lab moves to i18n keys.
- `prefersReducedMotion()` becomes one exported helper in `utils/visualization-motion`;
  `pulseElement`/`pulseSvgElement` check it.
- `VIZ_HEX` in `visualization-palette` is deleted; radix-bucket reads CSS tokens through
  `getComputedStyle` once per render.
- Trace-panel selection quirks are fixed while restyling: `matrixGrid` gets its own
  panel; when a chalkboard view is active its panel wins over number-lab.

### 5.6 i18n

All new strings through `t()`; PL first, then EN. New groups: `core.instrument.*`
(chrome, shortcuts, palette), `features.algorithms.workbench.*` (deck, meters, op-line
phases, printer), `features.algorithms.catalog.*` (marquee, path, module card). Legend
labels and the 16 unmapped "New …" actions, 7 units and 7 variants get keys. `npm run
i18n:extract` after each phase.

### 5.7 Performance and build

- No `backdrop-filter` anywhere; `filter: drop-shadow` only on the single current
  node/point; LED glows are `box-shadow`.
- Catalog cards `@defer (on viewport)`; preview animation only on hover.
- Removing Three.js, the globe data, the energy layer, the shader pool and the dead
  CSS shrinks the bundles. The initial bundle is 716 kB today against a 500 kB warning
  budget; the warning is not a blocker and `angular.json` budgets stay as they are.
- Component style budgets: keep 8 kB warn / 16 kB error; the largest current files
  (string 867 lines, scratchpad 600, `_browse-card` 612) shrink under the shared
  `_display.scss`.

### 5.8 Rules for future work

`CLAUDE.md` (design system section), the eight `.claude/skills/ohno-*` skills and the
`ohno-design-reviewer` agent describe the old style and must be rewritten with this spec:
materials, tokens, the stage grammar, the primitive inventory, the rgb-syntax rule, the
Doto-only-for-numbers rule, keyboard map, reduced-motion gate.

## 6. Delivery phases

Each phase ends with `npm run verify`, screenshots at 360 / 768 / 1280 / 1440 of every
touched screen, a reduced-motion check and a keyboard pass; the owner sees screenshots
before the next phase starts.

1. **Foundation** — tokens, fonts, `shared/instrument` primitives, a `/dev/instrument`
   specimen route (all primitives in one page; removed from production builds by a route
   guard on `isDevMode()`).
2. **Shell and catalog** — bank sidebar, PL/EN toggle, palette, recent store, marquee,
   latches, path plate, module cards and previews; deletions of chrome dead weight.
3. **Workbench frame** — decomposition, deck, stage grammar, inspector, log printer,
   keyboard and aria-live; sorting displays per image 02.
4. **Family displays** — graph family, table family, tape family, notebook, XY,
   stack, sets; readout adapters; trace panels restyled.
5. **Cleanup** — dead code and tokens, invalid rgba, unmapped i18n, palette drift,
   budgets, CLAUDE.md + skills + reviewer rewrite, README screenshots.
6. **Responsive and polish** — breakpoints from 4.4, focus paths, reduced motion, final
   pass with the polish checklist.

## 7. Open questions (with defaults)

1. **Traits filter.** Default: not in the catalog; searchable in ⌘K.
2. **Inspector width.** Default: fixed 456px (400px under 1440); no drag handle.
3. **Structures.** Default: one disabled bank row "Wkrótce"; the feature folder stays.
4. **Language globe.** Default: removed with its data; PL/EN toggle only.
5. **Log export.** Default: plain-text download; no clipboard variant.
6. **Module ids on cards** (`SRT-01`). Default: yes, derived, not stored in the catalog.
7. **Shortcut letters** `C I T L`. Default: as listed; they are not localised.

## 8. Definition of done

- Every screen matches images 01/02 in layout, colours, type and behaviour; families
  match 08–12 and the archetype table.
- `npm run verify` passes; no `rgba(var(` in `src`; no Google Fonts import; no
  Three.js; no `backdrop-filter`.
- All strings translated in both files; `npm run i18n:extract` clean.
- Keyboard map and aria-live work; reduced motion honoured in every animated component.
- CLAUDE.md, skills and the reviewer agent describe the new system.
