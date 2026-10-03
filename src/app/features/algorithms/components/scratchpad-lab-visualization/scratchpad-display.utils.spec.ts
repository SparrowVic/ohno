import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { getAlgorithmViewConfig } from '../../algorithm-detail/algorithm-detail-config/algorithm-detail-config';
import { ScratchpadLabTraceState, ScratchpadLine, ScratchpadMargin } from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import {
  notebookLineNumber,
  notebookMargins,
  notebookPhaseHead,
  notebookScrollTop,
  notebookSectionTitle,
  notebookView,
} from './scratchpad-display.utils';

const NOTEBOOK = I18N_KEY.features.algorithms.display.notebook;

const NOTEBOOK_IDS = [
  'euclidean-gcd',
  'extended-euclidean',
  'reservoir-sampling',
  'fft-ntt',
  'gaussian-elimination',
  'simplex-algorithm',
  'miller-rabin',
  'pollards-rho',
  'chinese-remainder-theorem',
];

function run(id: string): readonly SortStep[] {
  const config = getAlgorithmViewConfig(id) as unknown as {
    defaultSize: number;
    defaultTaskId?: string;
    defaultPresetId: string;
    tasks?: readonly { id: string; defaultValues: unknown }[];
    createScenario: (size: number, presetId: string, values?: unknown) => unknown;
    generator: (scenario: unknown) => Generator<SortStep>;
  };
  const task = config.tasks?.find((item) => item.id === config.defaultTaskId);
  return [...config.generator(config.createScenario(config.defaultSize, config.defaultTaskId ?? config.defaultPresetId, task?.defaultValues))];
}

function line(id: string, kind: ScratchpadLine['kind'], indent: number, state: ScratchpadLine['state'] = 'settled', extra: Partial<ScratchpadLine> = {}): ScratchpadLine {
  return { id, kind, indent, marker: null, caption: null, content: id, instruction: null, annotation: null, state, ...extra };
}

function pad(lines: readonly ScratchpadLine[], margins: readonly ScratchpadMargin[] = [], tone: ScratchpadLabTraceState['tone'] = 'compute'): ScratchpadLabTraceState {
  return {
    mode: 'euclidean-gcd',
    modeLabel: 'mode',
    phaseLabel: 'phase',
    decisionLabel: 'now',
    presetLabel: 'preset',
    taskPrompt: null,
    tone,
    lines,
    margins,
    resultLabel: null,
    iteration: 0,
  };
}

describe('notebook view', () => {
  it('opens a section per indent-0 note and numbers the lines from 01', () => {
    const view = notebookView(
      pad([line('forward', 'note', 0), line('e1', 'equation', 1), line('e2', 'equation', 1), line('back', 'note', 0), line('e3', 'substitute', 1, 'current')]),
    );
    expect(view.sections.map((section) => [section.title, section.status])).toEqual([
      ['forward', 'done'],
      ['back', 'current'],
    ]);
    expect(view.sections.flatMap((section) => section.rows.map((row) => row.number))).toEqual(['01', '02', '03']);
    expect(view.lineCount).toBe(3);
    expect(view.currentId).toBe('e3');
  });

  it('colours the current line cyan, decisions pink and the result block lime', () => {
    const view = notebookView(
      pad([
        line('forward', 'note', 0),
        line('e1', 'equation', 1),
        line('d1', 'decision', 1),
        line('result', 'result', 0, 'settled', { marker: '✓' }),
        line('r1', 'equation', 1),
        line('r2', 'equation', 1, 'current'),
      ]),
    );
    const rows = view.sections[0]?.rows ?? [];
    expect(rows.map((row) => [row.id, row.kind, row.tone, row.current])).toEqual([
      ['e1', 'math', 'idle', false],
      ['d1', 'math', 'pink', false],
      ['result', 'result-head', 'lime', false],
      ['r1', 'math', 'lime', false],
      ['r2', 'math', 'lime', true],
    ]);
    expect(rows[2]?.number).toBeNull();
  });

  it('marks a current line cyan when it is a plain equation', () => {
    const view = notebookView(pad([line('a', 'note', 0), line('e1', 'equation', 1, 'current')]));
    expect(view.sections[0]?.rows[0]).toMatchObject({ tone: 'cyan', current: true, indent: 0 });
  });

  it('falls back to divider sections and treats every section as done once nothing is current', () => {
    const view = notebookView(pad([line('e1', 'equation', 0), line('div', 'divider', 0), line('e2', 'equation', 0)], [], 'complete'));
    expect(view.sections.map((section) => [section.title, section.status, section.rows.length])).toEqual([
      [null, 'done', 1],
      [null, 'done', 1],
    ]);
    expect(view.complete).toBe(true);
  });

  it('uses captions as section titles when the generator writes them', () => {
    const caption = i18nText('features.algorithms.runtime.scratchpadLab.extendedEuclidean.captions.forwardStart');
    const view = notebookView(pad([line('e1', 'equation', 1, 'current', { caption })]));
    expect(view.sections[0]?.title).toEqual(caption);
    expect(view.sections[0]?.rows[0]?.caption).toBeNull();
  });

  it('maps the generators’ Polish section titles onto keys', () => {
    expect(notebookSectionTitle('Eliminacja w przód')).toBe(NOTEBOOK.sections.forwardElimination);
    expect(notebookSectionTitle('Pivot 2')).toEqual(i18nText(NOTEBOOK.sections.pivot, { n: 2 }));
    expect(notebookSectionTitle('Test bazy a = 2')).toEqual(i18nText(NOTEBOOK.sections.baseTest, { a: 2 }));
    expect(notebookSectionTitle('Nieznany nagłówek')).toBe('Nieznany nagłówek');
    expect(notebookLineNumber(7)).toBe('07');
  });

  it.each(NOTEBOOK_IDS)('%s agrees with the phase gauge and keeps one current line', (id) => {
    for (const step of run(id)) {
      const state = step.scratchpadLab;
      if (!state) continue;
      const view = notebookView(state);
      const heads = state.lines.filter(notebookPhaseHead(state.lines)).length;
      const leadSection = state.lines.length > 0 && !notebookPhaseHead(state.lines)(state.lines[0] as ScratchpadLine) ? 1 : 0;
      expect(view.sections.length).toBe(heads + leadSection);
      expect(view.sections.flatMap((section) => section.rows).filter((row) => row.current).length).toBeLessThanOrEqual(1);
      expect(view.sections.filter((section) => section.status === 'current').length).toBeLessThanOrEqual(1);
    }
  });

  it.each(NOTEBOOK_IDS)('%s titles every section through a key', (id) => {
    const steps = run(id);
    const last = steps[steps.length - 1]?.scratchpadLab;
    expect(last).toBeTruthy();
    for (const section of notebookView(last as ScratchpadLabTraceState).sections) {
      const title = section.title;
      const key = typeof title === 'string' ? title : title?.key;
      expect(key?.startsWith('features.algorithms.'), String(key)).toBe(true);
    }
  });
});

describe('notebook margins', () => {
  const margins: ScratchpadMargin[] = [
    { id: 'hint-old', anchorLineId: 'e1', text: 'old', tone: 'hint' },
    { id: 'hint-now', anchorLineId: 'e2', text: 'transient', tone: 'hint' },
    { id: 'inv', anchorLineId: null, text: 'invariant', tone: 'invariant' },
  ];

  it('keeps invariants, the transient note of the current line and the now note, in that order', () => {
    const state = pad([line('e1', 'equation', 0), line('e2', 'equation', 0, 'current')], margins);
    expect(notebookMargins(state, 'e2').map((margin) => [margin.id, margin.tone, margin.title])).toEqual([
      ['inv', 'violet', NOTEBOOK.marginTitles.invariant],
      ['hint-now', 'amber', NOTEBOOK.marginTitles.hint],
      ['now', 'cyan', NOTEBOOK.marginTitles.now],
    ]);
  });

  it('drops an empty decision label', () => {
    const state = { ...pad([], []), decisionLabel: '  ' };
    expect(notebookMargins(state, null)).toEqual([]);
  });
});

describe('notebook scroll', () => {
  it('leaves a visible line alone', () => {
    expect(notebookScrollTop({ top: 0, height: 300 }, { top: 100, height: 40 })).toBeNull();
  });

  it('scrolls down just enough to show a line below the fold', () => {
    expect(notebookScrollTop({ top: 0, height: 300 }, { top: 320, height: 40 })).toBe(76);
  });

  it('scrolls up to a line above the view and pins a tall line to its top', () => {
    expect(notebookScrollTop({ top: 200, height: 300 }, { top: 120, height: 40 })).toBe(104);
    expect(notebookScrollTop({ top: 0, height: 100 }, { top: 400, height: 160 })).toBe(384);
  });
});
