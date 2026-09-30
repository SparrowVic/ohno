import { describe, expect, it } from 'vitest';

import { TapeRow } from './tape.types';
import { currentTapeIndex } from './tape.utils';

const event = (step: number): TapeRow => ({ step, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '' });
const separator = (step: number): TapeRow => ({ step, kind: 'separator', tone: 'slate', event: '── PRZEBIEG ──', detail: '' });

describe('currentTapeIndex', () => {
  it('points at the last event row', () => {
    expect(currentTapeIndex([event(1), event(2), event(3)])).toBe(2);
  });

  it('skips a trailing separator', () => {
    expect(currentTapeIndex([event(1), separator(2)])).toBe(0);
  });

  it('returns -1 for an empty tape or separators only', () => {
    expect(currentTapeIndex([])).toBe(-1);
    expect(currentTapeIndex([separator(1)])).toBe(-1);
  });
});
