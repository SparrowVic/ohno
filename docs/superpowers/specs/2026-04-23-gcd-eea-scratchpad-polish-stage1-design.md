# Stage 1 — GCD + Extended Euclidean scratchpad polish (pedagogical pass)

**Date:** 2026-04-23
**Scope:** Pedagogical clarity of the chalkboard derivation for `euclidean-gcd` and `extended-euclidean`. Visual polish (Stage 2) is deliberately deferred.

## Goals

The chalkboard view has three pedagogical defects that a student would notice on their first run-through. This spec fixes exactly those, nothing more:

1. The Extended Euclidean forward instruction ("Podziel 1071 przez 462") is ambiguous — it reads as plain division when the student actually needs to write a division-with-remainder equation `a = q·b + r`.
2. In both algorithms, the imperative instruction chip ("→ Policz 48 mod 36") lingers on the substitute/result line after the operation has already been computed, duplicating what the annotation says and misleading the reader about *when* the action happens.
3. Captions (the tutor's pencil note above each line, rendered with a "✎" prefix) repeat on every forward row, adding visual noise on long derivations and a weak "current vs settled" signal. The student loses the current line once they scroll in a long run because there is no auto-scroll.

## Non-goals

Explicitly **not** in this stage:

- Typography / color hierarchy tweaks (result-box loudness, annotation column styling, unified marker alphabet, phase-label vs current-line color duplication).
- New viz-options toggles beyond those that exist today.
- Structural changes to `ScratchpadLine` model or the `scratchpad-lab-visualization` DOM grid.
- Any changes to non-chalkboard views (NumberLab dashboard, code panel, log panel).

These live in Stage 2 and will get their own spec.

## Changes by file

### `public/i18n/pl.json` + `public/i18n/en.json`

Rewrite one key in Extended Euclidean:

```
features.algorithms.runtime.scratchpadLab.extendedEuclidean.forwardInstruction
```

From:
```
"Podziel [[math]]{{a}}[[/math]] przez [[math]]{{b}}[[/math]]"
```
To (variant B from the brainstorm):
```
"Rozpisz [[math]]{{a}} = q \\cdot {{b}} + r[[/math]]"
```

Rationale: the instruction should teach the *shape of the equation the student must write*, not name an abstract operation. In Extended Euclidean, every forward step is a division-with-remainder equation, and later the whole back-substitution depends on that shape. Making it visible in the hint itself aligns the imperative with the object that appears one line below.

English equivalent: `"Write out [[math]]{{a}} = q \\cdot {{b}} + r[[/math]]"`.

The regular GCD's `remainderInstruction` ("Policz a mod b") stays untouched — it already matches the operation exactly (the algorithm only needs `r`, not `q`).

### `src/app/features/algorithms/algorithms/euclidean-gcd/euclidean-gcd.ts`

Drop the persistent `instruction` field on the substitute line. Today's code (`lineBuilders.push({ id: substituteLineId, … instruction: i18nText(I18N.scratchpad.remainderInstruction, …), annotation: … })`) sets both `instruction` and `annotation` on the line that represents the *result* of `a mod b`. Keep `annotation` (it documents the derivation: `"48 mod 36 = 12"`). Drop `instruction` (imperative "→ Policz 48 mod 36" is temporally wrong on a line that is already the computed outcome).

Net effect on the board:
- During *compute* phase: transient margin `"→ Policz 48 mod 36"` anchored to the current pair line — unchanged, still present.
- After *swap* phase: the new substitute line shows body + annotation only. No imperative chip on a computed result.

### `src/app/features/algorithms/algorithms/extended-euclidean/extended-euclidean.ts`

Same pattern — the forward-row lineBuilders currently set both `instruction` (imperative "Rozpisz…") and `annotation` ("a mod b = r"). Drop `instruction` from forward rows **except** on the `fwd-0` (first) line, where it does serve as a "start here" anchor while the board is otherwise empty.

For back-sub lines (`back-seed`, `back-N`) the instruction text is different ("Odczytaj z a = q·b + r", "Użyj a = q·b + r") — it names the *rule being applied* rather than an imperative on a finished computation, so it stays.

### `src/app/features/algorithms/components/scratchpad-lab-visualization/scratchpad-lab-visualization.html`

Gate the caption render on `line.state === 'current'` so the ✎-prefixed tutor note only appears on the line that's currently executing. Settled lines drop their caption — the marker (①②✓) and body carry enough structural signal, and captions stay as a focused "what this line is *about*" pointer for the active step.

Current markup (the relevant block):
```html
@if (showCaptions() && line.caption) {
  <span class="scratchpad__line-caption">…</span>
}
```
Becomes:
```html
@if (showCaptions() && line.caption && line.state === 'current') {
  <span class="scratchpad__line-caption">…</span>
}
```

The `showCaptions()` toggle is still honored — the user can switch them off entirely. What changes is that when they're on, they don't spam every row; they follow the cursor.

Side note: the existing CSS rule `.scratchpad__line--current .scratchpad__line-caption { color: rgba(var(--viz-warning-rgb), 1); opacity: 0.95; }` becomes redundant after this change (only current lines ever render a caption). Simplify by removing that specialized rule — the base `.scratchpad__line-caption { color: var(--text-quaternary) }` gets bumped to a stronger tone since it now only represents "active step":

```scss
.scratchpad__line-caption {
  color: rgba(var(--viz-warning-rgb), 0.95);  /* was text-quaternary */
  /* …rest unchanged… */
}
```

### `src/app/features/algorithms/components/scratchpad-lab-visualization/scratchpad-lab-visualization.ts`

Add auto-scroll-to-current-line behavior. When the `state()` signal emits a new snapshot, find the DOM node of the current line and call `scrollIntoView({ block: 'nearest' })`. Gate the smooth behavior behind a local `prefersReducedMotion()` helper — if reduced-motion is on, use `behavior: 'auto'` (instant jump, no pacing).

`prefersReducedMotion` is not exported from `utils/visualization-motion/` today; bar-chart and block-swap each inline a small helper. Match that pattern — put a module-local function at the bottom of the file:

```ts
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

Extracting it into the shared utility (and migrating the two existing call-sites) is tempting but out of scope — stays on the list as tech debt.

Implementation sketch (inside the component):

```ts
private readonly hostEl = inject(ElementRef<HTMLElement>);

constructor() {
  effect(() => {
    const snapshot = this.state();
    if (!snapshot) return;
    const currentId = snapshot.lines.find((l) => l.state === 'current')?.id;
    if (!currentId) return;
    queueMicrotask(() => {
      const el = this.hostEl.nativeElement.querySelector<HTMLElement>(
        `[data-line-id="${CSS.escape(currentId)}"]`,
      );
      el?.scrollIntoView({
        block: 'nearest',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    });
  });
}
```

Template side — add `[attr.data-line-id]="line.id"` to the `<article class="scratchpad__line …">` element so the effect can find the node without traversing text content or building a line→element map.

Why `queueMicrotask`: the effect fires before Angular has flushed the DOM update, so direct `querySelector` would hit the previous snapshot's DOM. Microtask scheduling waits for the render commit, which matches the established pattern in dp-/matrix-/tree-visualization.

Why `block: 'nearest'`: keeps the current line in the viewport without rudely yanking the page to center on every tick. If the line is already visible, no-op.

## Test coverage

Neither `euclidean-gcd` nor `extended-euclidean` has a colocated `*.spec.ts` file today. `npm run test:algorithms` therefore asserts nothing about their output beyond the utility/helper suites elsewhere. This spec does **not** add tests — adding test coverage for these generators is its own piece of work (they're narrative-heavy; capturing the derivation as a stable snapshot needs thought). `npm run verify` after the change must still pass.

## Acceptance criteria

A student running the "Classic 1071, 462" preset in Extended Euclidean should:

- See the first forward instruction as `"Rozpisz 1071 = q · 462 + r"` (not "Podziel 1071 przez 462").
- See an imperative chip *only* on the line that currently needs an action taken — never on lines that already show a computed result with an annotation.
- See the ✎-captioned tutor note *only* on the current line as they step through; settled lines show just marker + body + annotation.
- Have the viewport auto-follow the current line without needing to scroll manually, both at normal and reduced-motion settings.

A student running the short "Brief 48, 18" preset in the regular Euclidean GCD should see the same behavior applied to substitute lines: no imperative chip on `= gcd(b, a mod b)`, only the annotation `a mod b = r`.

Both locales (PL + EN) should show the rewritten forward instruction.

## Open questions deferred to Stage 2

Noted for the follow-up spec so they're not forgotten:

- Result-box loudness vs signoff duplication.
- Annotation column visual differentiation from the body (different ink role, not just smaller mono).
- Unified marker alphabet across the number-theory family.
- Phase-label header vs current-line highlight color duplication.
- Instruction chip color token unification (warning vs accent depending on placement).

---

# Stage 2 — visual polish

Stage 1 fixed the pedagogical defects. Stage 2 is the aesthetic pass — less "this teaches wrong", more "this reads nicer and hangs together". Chalkboard language per `ohno-ux-principles` ("tutor-at-a-whiteboard"); token discipline per `ohno-design-tokens`.

One concern from the Stage 1 backlog is **dropped**: the phase-label header tone vs the current-line warm highlight isn't duplication — the header cycles through cyan/pink/lime semantically per algorithm phase, while the scratchpad current-line stays warm. Two different signals, not a clash.

## Changes

### 1. Tone down the result box

Today the result row is a loud floating widget (20px 800 mono, gradient bg, 4px ring shadow) right above a quieter Caveat signoff that says the same thing in full form. Two "THE ANSWER" shouts in a row.

The signoff is the right place for the final statement (matches the chalkboard metaphor — the tutor's closing signature `∎`). The result line stays but gets dialed down:

`src/app/features/algorithms/components/scratchpad-lab-visualization/scratchpad-lab-visualization.scss` — `.scratchpad__line--result` block:
- Remove the 4px ring `box-shadow` — it was making the row read as a UI button, not notebook content.
- Drop the gradient bg; use a flat `rgba(var(--accent-rgb), 0.08)` (same family as signoff).
- Reduce `.scratchpad__line--result .scratchpad__line-body` weight `800 → 700`.
- Keep 20px mono — "final answer" still deserves size emphasis, just not shout.

### 2. Annotation column: lead with `∴`, drop the rule

Annotation content is math (e.g. `48 mod 36 = 12`), so Caveat font on the container doesn't actually apply — KaTeX handles the math glyphs. Differentiation has to come from composition, not typeface alone.

`.scratchpad__line-annotation`:
- Prepend a Caveat `∴` glyph (CSS `::before` content, viz-warning tinted at ~0.7 opacity, 15px Caveat) — announces "therefore / derivation" in the tutor's hand.
- Drop the 1px dashed `border-left`; replace with plain `padding-left` so the annotation reads as a soft margin note, not a parallel table column.
- Reduce `font-size` 12.5px → 12px; leave everything else.
- Remove the `.scratchpad__line--current .scratchpad__line-annotation` border-left color override (no border to override anymore).

The `∴` sits in the tutor's cursive tone, math stays mono — the hybrid composition is what communicates "side note about the line to its left".

### 3. Marker standardization — GCD ② becomes ⟹

EEA uses `①⟹②③✓`, where `⟹` isn't a phase counter — it's a "therefore" arrow at the point where `gcd = last remainder` is declared. GCD currently uses `①②✓` where `②` marks the `b = 0 → stop` decision row.

Those two `②`s mean different things across the family (phase-number in EEA vs stop-decision in GCD). Swap GCD's `②` for `⟹` so the alphabet is consistent across both:

`src/app/features/algorithms/algorithms/euclidean-gcd/euclidean-gcd.ts` — `SECTION_MARKERS`:
- `start: '①'` (unchanged)
- `decision: '②'` → `decision: '⟹'`
- `result: '✓'` (unchanged)

Resulting vocabulary across number-theory family:
- `①` — phase start
- `⟹` — logical consequence / stop decision ("therefore the answer is…")
- `②` — additional phase start (back-sub in EEA)
- `③` — additional phase start (verify in EEA)
- `✓` — final answer row

One word per glyph, same meaning wherever it appears.

### 4. Unify imperative chip color

Today: the persistent `.scratchpad__line-instruction` chip is warm tan (`viz-warning`); the transient sticky note variant `.scratchpad__sticky--hint` is cool slate (`viz-accent`). Same imperative text ("→ Policz 48 mod 36") renders in two different colors depending on lifecycle phase (transient margin during compute → it's cyan-slate, persistent chip on e.g. fwd-0 → it's warm tan).

Warm tan reads as chalk/teacher's marker; cool slate reads as UI/system. The chalkboard metaphor wins — unify on `viz-warning` for both.

`src/app/features/algorithms/components/scratchpad-lab-visualization/scratchpad-lab-visualization.scss` — `.scratchpad__sticky--hint` block:
- Background gradient: swap `--viz-accent-rgb` → `--viz-warning-rgb`.
- Border color: swap `--viz-accent-rgb` → `--viz-warning-rgb`.
- Text color: swap `var(--viz-accent)` → `rgb(var(--viz-warning-rgb))`.

## Non-goals (still)

- No new tokens needed (everything lands on existing `--accent-rgb`, `--viz-warning-rgb`).
- No change to the marker glyph rendering logic — markers are plain string characters passed through as-is.
- No HTML restructuring — all changes are SCSS + one string-constant swap in the GCD generator.
- No caption / instruction model change (Stage 1 took care of those).

## Acceptance criteria

- Final row in any derivation: flat lime-tinted box, no ring shadow. The Caveat signoff below it reads as the finishing line, not a redundant second announcement.
- Annotation column: every non-empty annotation leads with a cursive `∴`, no vertical dashed rule, reads as a margin note.
- GCD "Classic" preset: the decision row before the result shows `⟹` instead of `②`, same visual weight as before.
- "Rozpisz 1071 = q·462 + r" chip on fwd-0 (persistent) and the transient "→ Policz a mod b" margin in GCD: identical color family (warm tan).
- `npm run verify` still green; no new bundle-size warnings.
