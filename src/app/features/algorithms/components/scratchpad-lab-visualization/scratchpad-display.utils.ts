import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText, isI18nText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { ScratchpadLabTraceState, ScratchpadLine, ScratchpadMarginTone } from '../../models/scratchpad-lab';

export type NotebookLineTone = 'idle' | 'cyan' | 'pink' | 'lime';

export type NotebookRowKind = 'math' | 'prose' | 'result-head' | 'rule';

export type NotebookSectionStatus = 'done' | 'current' | 'pending';

export type NotebookMarginKind = ScratchpadMarginTone | 'now';

export interface NotebookRow {
  readonly id: string;
  readonly kind: NotebookRowKind;
  readonly number: string | null;
  readonly content: TranslatableText;
  readonly caption: TranslatableText | null;
  readonly instruction: TranslatableText | null;
  readonly annotation: TranslatableText | null;
  readonly marker: string | null;
  readonly indent: number;
  readonly tone: NotebookLineTone;
  readonly current: boolean;
}

export interface NotebookSection {
  readonly id: string;
  readonly title: TranslatableText | null;
  readonly status: NotebookSectionStatus;
  readonly rows: readonly NotebookRow[];
}

export interface NotebookView {
  readonly sections: readonly NotebookSection[];
  readonly currentId: string | null;
  readonly lineCount: number;
  readonly complete: boolean;
}

export interface NotebookMarginView {
  readonly id: string;
  readonly kind: NotebookMarginKind;
  readonly tone: LedColor;
  readonly title: I18nKey;
  readonly text: TranslatableText;
}

const NOTEBOOK = I18N_KEY.features.algorithms.display.notebook;
const SECTIONS = NOTEBOOK.sections;

const SECTION_KEYS: Readonly<Record<string, I18nKey>> = {
  Obliczenia: SECTIONS.computation,
  'Ostatnia niezerowa reszta': SECTIONS.lastRemainder,
  Wynik: SECTIONS.result,
  Sprawdzenie: SECTIONS.check,
  Parametry: SECTIONS.parameters,
  Przebieg: SECTIONS.run,
  'Sprawdzenie idei prawdopodobieństwa': SECTIONS.probabilityCheck,
  'Sprawdzenie pierwiastka': SECTIONS.rootCheck,
  'Transformata A': SECTIONS.transformA,
  'Transformata B': SECTIONS.transformB,
  'Mnożenie punktowe': SECTIONS.pointwise,
  'Transformata odwrotna': SECTIONS.inverse,
  'Układ równań': SECTIONS.system,
  'Macierz rozszerzona': SECTIONS.augmented,
  'Eliminacja w przód': SECTIONS.forwardElimination,
  'Eliminacja wstecz': SECTIONS.backElimination,
  Model: SECTIONS.model,
  'Postać standardowa': SECTIONS.standardForm,
  'Tableau początkowe': SECTIONS.initialTableau,
  'Test ilorazów': SECTIONS.ratioTest,
  'Test optymalności': SECTIONS.optimality,
  'Rozkład n - 1': SECTIONS.decomposition,
  Wniosek: SECTIONS.conclusion,
  Iteracje: SECTIONS.iterations,
  Rozbicie: SECTIONS.factorisation,
  'Test wzglednej pierwszosci': SECTIONS.coprimality,
  'Modul laczny': SECTIONS.modulus,
  'Konstrukcja CRT': SECTIONS.construction,
  'Suma CRT': SECTIONS.sum,
};

const PIVOT_TITLE = /^Pivot (\d+)$/;
const BASE_TEST_TITLE = /^Test bazy a = (\d+)$/;

const MARGIN_TONES: Readonly<Record<NotebookMarginKind, LedColor>> = {
  invariant: 'violet',
  hint: 'amber',
  warning: 'red',
  success: 'lime',
  now: 'cyan',
};

const MARGIN_TITLES: Readonly<Record<NotebookMarginKind, I18nKey>> = {
  invariant: NOTEBOOK.marginTitles.invariant,
  hint: NOTEBOOK.marginTitles.hint,
  warning: NOTEBOOK.marginTitles.warning,
  success: NOTEBOOK.marginTitles.success,
  now: NOTEBOOK.marginTitles.now,
};

const MARGIN_ORDER: readonly NotebookMarginKind[] = ['invariant', 'hint', 'warning', 'success', 'now'];

const isSectionNote = (line: ScratchpadLine): boolean => line.kind === 'note' && line.indent === 0;
const isCaptioned = (line: ScratchpadLine): boolean => line.caption !== null;
const isDivider = (line: ScratchpadLine): boolean => line.kind === 'divider';
const isResultHead = (line: ScratchpadLine): boolean => line.kind === 'result' && line.indent === 0;
const isLive = (line: ScratchpadLine): boolean => line.state === 'current' || line.state === 'entering';

export function notebookPhaseHead(lines: readonly ScratchpadLine[]): (line: ScratchpadLine) => boolean {
  if (lines.some(isCaptioned)) return isCaptioned;
  if (lines.some(isSectionNote)) return isSectionNote;
  return isDivider;
}

export function notebookSectionTitle(content: TranslatableText): TranslatableText {
  if (isI18nText(content)) return content;
  const title = content.trim();
  const known = SECTION_KEYS[title];
  if (known) return known;
  const pivot = PIVOT_TITLE.exec(title);
  if (pivot) return i18nText(SECTIONS.pivot, { n: Number(pivot[1]) });
  const base = BASE_TEST_TITLE.exec(title);
  if (base) return i18nText(SECTIONS.baseTest, { a: Number(base[1]) });
  return content;
}

export function notebookLineNumber(position: number): string {
  return String(position).padStart(2, '0');
}

export function hasText(value: TranslatableText | null | undefined): value is TranslatableText {
  if (value === null || value === undefined) return false;
  return isI18nText(value) || value.trim().length > 0;
}

function currentLineId(lines: readonly ScratchpadLine[]): string | null {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (line && isLive(line)) return line.id;
  }
  return null;
}

function rowTone(line: ScratchpadLine, inResult: boolean, current: boolean): NotebookLineTone {
  if (line.kind === 'decision') return 'pink';
  if (line.kind === 'result' || inResult) return 'lime';
  return current ? 'cyan' : 'idle';
}

function rowKind(line: ScratchpadLine): NotebookRowKind {
  if (line.kind === 'divider') return 'rule';
  if (isResultHead(line)) return 'result-head';
  return line.kind === 'note' ? 'prose' : 'math';
}

interface SectionDraft {
  id: string;
  title: TranslatableText | null;
  rows: NotebookRow[];
  current: boolean;
}

export function notebookView(state: ScratchpadLabTraceState): NotebookView {
  const isHead = notebookPhaseHead(state.lines);
  const headIsCaption = state.lines.some(isCaptioned);
  const currentId = currentLineId(state.lines);
  const drafts: SectionDraft[] = [];
  let section: SectionDraft | null = null;
  let inResult = false;
  let position = 0;

  for (const line of state.lines) {
    const current = line.id === currentId;
    if (isHead(line)) {
      section = {
        id: line.id,
        title: line.kind === 'divider' ? null : notebookSectionTitle(headIsCaption ? (line.caption ?? line.content) : line.content),
        rows: [],
        current: false,
      };
      drafts.push(section);
      inResult = false;
      if (current) section.current = true;
      if (line.kind === 'divider' || isSectionNote(line)) continue;
    }
    if (!section) {
      section = { id: `${line.id}-lead`, title: null, rows: [], current: false };
      drafts.push(section);
    }
    const kind = rowKind(line);
    if (kind === 'result-head') inResult = true;
    const numbered = kind === 'math' || kind === 'prose';
    if (numbered) position += 1;
    section.rows.push({
      id: line.id,
      kind,
      number: numbered ? notebookLineNumber(position) : null,
      content: kind === 'result-head' ? notebookSectionTitle(line.content) : line.content,
      caption: !headIsCaption && line.caption && (current || line.captionPinned) ? line.caption : null,
      instruction: line.instruction,
      annotation: line.annotation,
      marker: line.marker,
      indent: Math.max(0, line.indent - 1),
      tone: rowTone(line, inResult && kind !== 'result-head', current),
      current,
    });
    if (current) section.current = true;
  }

  const complete = currentId === null || state.tone === 'complete';
  const currentSection = complete ? drafts.length : drafts.findIndex((draft) => draft.current);
  const sections = drafts.map<NotebookSection>((draft, index) => ({
    id: draft.id,
    title: draft.title,
    rows: draft.rows,
    status: index < currentSection || currentSection < 0 ? 'done' : index === currentSection ? 'current' : 'pending',
  }));

  return { sections, currentId, lineCount: position, complete };
}

export function notebookMargins(state: ScratchpadLabTraceState, currentId: string | null): readonly NotebookMarginView[] {
  const margins: NotebookMarginView[] = state.margins
    .filter((margin) => margin.anchorLineId === null || margin.anchorLineId === currentId)
    .filter((margin) => hasText(margin.text))
    .map((margin) => ({
      id: margin.id,
      kind: margin.tone,
      tone: MARGIN_TONES[margin.tone],
      title: MARGIN_TITLES[margin.tone],
      text: margin.text,
    }));
  if (hasText(state.decisionLabel)) {
    margins.push({ id: 'now', kind: 'now', tone: MARGIN_TONES.now, title: MARGIN_TITLES.now, text: state.decisionLabel });
  }
  return margins.sort((left, right) => MARGIN_ORDER.indexOf(left.kind) - MARGIN_ORDER.indexOf(right.kind));
}

export interface ScrollWindow {
  readonly top: number;
  readonly height: number;
}

export function notebookScrollTop(view: ScrollWindow, target: ScrollWindow, margin = 16): number | null {
  const targetBottom = target.top + target.height;
  const viewBottom = view.top + view.height;
  if (target.height + 2 * margin >= view.height) return Math.max(0, target.top - margin);
  if (target.top - margin < view.top) return Math.max(0, target.top - margin);
  if (targetBottom + margin > viewBottom) return targetBottom + margin - view.height;
  return null;
}
