import { describe, expect, it } from 'vitest';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { currentTapeIndex } from '../../../../shared/instrument/tape/tape.utils';
import { BUBBLE_HISTORY } from './step-events.fixture';
import { classifyStepEvents } from './step-events.utils';
import { buildTapeRows, formatTapeText, TapeLabels } from './tape-rows.utils';

const labels: TapeLabels = {
  events: {
    start: 'START',
    step: 'KROK',
    compare: 'PORÓWNAJ',
    swap: 'ZAMIEŃ',
    settle: 'USTAL',
    pass: 'PRZEBIEG',
    complete: 'KONIEC',
  },
  passSeparator: (index) => `── PRZEBIEG ${index} ZAKOŃCZONY ──`,
};

const translate = (text: TranslatableText): string => (typeof text === 'string' ? text : text.key);
const events = classifyStepEvents(BUBBLE_HISTORY);

describe('buildTapeRows', () => {
  it('keeps only the rows up to the cursor', () => {
    const rows = buildTapeRows(events, BUBBLE_HISTORY, 3, 'all', labels, translate);
    expect(rows.map((row) => row.step)).toEqual([0, 1, 2, 3]);
    expect(rows[1]).toEqual({ step: 1, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '56[0] : 13[1]' });
    expect(rows[2]?.tone).toBe('pink');
    expect(rows[0]?.detail).toBe('start');
  });

  it('renders a pass as a separator that is never the bold current row', () => {
    const rows = buildTapeRows(events, BUBBLE_HISTORY, 4, 'all', labels, translate);
    expect(rows.at(-1)).toEqual({ step: 4, kind: 'separator', tone: 'slate', event: '── PRZEBIEG 1 ZAKOŃCZONY ──', detail: '' });
    expect(currentTapeIndex(rows)).toBe(3);
  });

  it('filters by event kind', () => {
    expect(buildTapeRows(events, BUBBLE_HISTORY, 5, 'swap', labels, translate).map((row) => row.step)).toEqual([2]);
    expect(buildTapeRows(events, BUBBLE_HISTORY, 5, 'pass', labels, translate).map((row) => row.kind)).toEqual(['separator']);
    expect(buildTapeRows(events, BUBBLE_HISTORY, 5, 'compare', labels, translate)).toHaveLength(2);
  });

  it('falls back to the translated description for events without a pair', () => {
    const rows = buildTapeRows(events, BUBBLE_HISTORY, 5, 'all', labels, translate);
    expect(rows.at(-1)).toEqual({ step: 5, kind: 'event', tone: 'lime', event: 'KONIEC', detail: 'complete' });
  });
});

describe('formatTapeText', () => {
  it('prints a header and three-digit steps', () => {
    const rows = buildTapeRows(events, BUBBLE_HISTORY, 4, 'all', labels, translate);
    const text = formatTapeText(rows, 'KROK', 'ZDARZENIE');
    expect(text.split('\n')).toEqual([
      'KROK ZDARZENIE',
      '000  START     start',
      '001  PORÓWNAJ  56[0] : 13[1]',
      '002  ZAMIEŃ    56[0] ↔ 13[1]',
      '003  PORÓWNAJ  74[2] : 35[3]',
      '004  ── PRZEBIEG 1 ZAKOŃCZONY ──',
    ]);
  });
});
