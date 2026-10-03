import { describe, expect, it } from 'vitest';

import { GeometryEventChip } from '../../models/geometry';
import { formatCoordPair, geometryEventChips } from './geometry-trace.utils';

const event = (id: string, tone: GeometryEventChip['tone']): GeometryEventChip => ({
  id,
  label: `E${id}`,
  x: 0,
  kind: 'start',
  tone,
});

describe('geometryEventChips', () => {
  it('maps current, done and queued events onto chip tones', () => {
    const chips = geometryEventChips([event('1', 'done'), event('2', 'current'), event('3', 'queued')]);
    expect(chips.map((chip) => [chip.tone, chip.active, chip.dim])).toEqual([
      ['lime', false, true],
      ['cyan', true, false],
      [null, false, false],
    ]);
  });

  it('uses the label mapper when given', () => {
    const chips = geometryEventChips([event('1', 'queued')], (item) => `#${item.id}`);
    expect(chips[0]?.label).toBe('#1');
  });
});

describe('formatCoordPair', () => {
  it('prints one decimal and dashes for missing values', () => {
    expect(formatCoordPair(1.234, -2)).toBe('(1.2, -2.0)');
    expect(formatCoordPair(undefined, undefined)).toBe('(—, —)');
  });
});
