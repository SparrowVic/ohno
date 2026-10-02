import { describe, expect, it } from 'vitest';

import { dijkstraGenerator } from '../../algorithms/dijkstra/dijkstra';
import { generateDijkstraGraph } from '../../utils/helpers/dijkstra-graph/dijkstra-graph';
import { FamilyTapeLabels, familyTapeOverride, familyTapeOverrides } from './family-tape.utils';
import { sortStep } from './step-events.fixture';
import { buildTapeRows } from './tape-rows.utils';
import { classifyStepEvents } from './step-events.utils';

const labels: FamilyTapeLabels = {
  pickNode: 'POBIERZ',
  inspectEdge: 'SPRAWDŹ',
  relax: 'RELAKSUJ',
  skipRelax: 'POMIŃ',
  settleNode: 'USTAL',
  complete: 'KONIEC',
  focusDigit: 'CYFRA',
  distribute: 'ROZŁÓŻ',
  gather: 'ZBIERZ',
};

describe('familyTapeOverride', () => {
  it('maps the graph phases to short verbs and phase colours', () => {
    expect(familyTapeOverride(sortStep({ array: [], phase: 'pick-node' }), labels)).toEqual({ event: 'POBIERZ', tone: 'cyan' });
    expect(familyTapeOverride(sortStep({ array: [], phase: 'relax' }), labels)).toEqual({ event: 'RELAKSUJ', tone: 'pink' });
    expect(familyTapeOverride(sortStep({ array: [], phase: 'skip-relax' }), labels)).toEqual({ event: 'POMIŃ', tone: 'slate' });
    expect(familyTapeOverride(sortStep({ array: [], phase: 'settle-node' }), labels)).toEqual({ event: 'USTAL', tone: 'lime' });
    expect(familyTapeOverride(sortStep({ array: [], phase: 'graph-complete' }), labels)).toEqual({ event: 'KONIEC', tone: 'lime' });
  });

  it('maps the radix phases to digit, scatter and gather verbs', () => {
    expect(familyTapeOverride(sortStep({ array: [], phase: 'focus-digit' }), labels)).toEqual({ event: 'CYFRA', tone: 'cyan' });
    expect(familyTapeOverride(sortStep({ array: [], phase: 'distribute' }), labels)).toEqual({ event: 'ROZŁÓŻ', tone: 'pink' });
    expect(familyTapeOverride(sortStep({ array: [], phase: 'gather' }), labels)).toEqual({ event: 'ZBIERZ', tone: 'lime' });
    expect(familyTapeOverride(sortStep({ array: [], phase: 'pass-complete' }), labels)).toBeNull();
    expect(familyTapeOverride(sortStep({ array: [], phase: 'swap' }), labels)).toBeNull();
  });

  it('leaves steps without a family phase to the generic classifier', () => {
    expect(familyTapeOverride(sortStep({ array: [] }), labels)).toBeNull();
    expect(familyTapeOverride(sortStep({ array: [], phase: 'compare' }), labels)).toBeNull();
  });
});

describe('familyTapeOverrides', () => {
  it('keeps the start row generic and labels every Dijkstra step after it', () => {
    const history = [...dijkstraGenerator(generateDijkstraGraph(8))];
    const overrides = familyTapeOverrides(history, labels);
    expect(overrides).toHaveLength(history.length);
    expect(overrides[0]).toBeNull();
    expect(overrides.slice(1).filter((item) => item === null)).toHaveLength(history.slice(1).filter((step) => step.phase === 'init').length);
    const rows = buildTapeRows(
      classifyStepEvents(history),
      history,
      history.length - 1,
      'all',
      { events: { start: 'START', step: 'KROK', compare: 'P', swap: 'Z', settle: 'U', pass: 'PASS', complete: 'KONIEC' }, passSeparator: () => '' },
      (text) => (typeof text === 'string' ? text : text.key),
      overrides,
    );
    expect(rows[0]).toMatchObject({ event: 'START' });
    expect(rows.some((row) => row.event === 'RELAKSUJ' && row.tone === 'pink')).toBe(true);
    expect(rows.at(-1)).toMatchObject({ event: 'KONIEC', tone: 'lime' });
  });
});
