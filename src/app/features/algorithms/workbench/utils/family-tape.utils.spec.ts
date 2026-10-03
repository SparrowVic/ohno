import { describe, expect, it } from 'vitest';

import { dijkstraGenerator } from '../../algorithms/dijkstra/dijkstra';
import { kmpPatternMatchingGenerator } from '../../algorithms/kmp-pattern-matching/kmp-pattern-matching';
import { createKmpScenario } from '../../utils/scenarios/string/string-scenarios';
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
  compare: 'PORÓWNAJ',
  match: 'ZGODNE',
  fallback: 'POWRÓT',
  shift: 'PRZESUŃ',
  hit: 'TRAFIENIE',
  lps: 'LPS',
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

describe('KMP tape verbs', () => {
  const history = [...kmpPatternMatchingGenerator(createKmpScenario(20, 'overlap'))];
  const overrides = familyTapeOverrides(history, labels);
  const kmp = (index: number) => history[index]!.string as { stage: string; fallbackFrom: number | null; compareTextIndex: number | null; comparePatternIndex: number | null; text: string; pattern: string };

  it('names compares, matches, fallbacks, shifts and hits like image 12', () => {
    const events = new Set(overrides.filter((item) => item !== null).map((item) => item!.event));
    ['PORÓWNAJ', 'ZGODNE', 'PRZESUŃ', 'LPS'].forEach((verb) => expect(events.has(verb)).toBe(true));
  });

  it('calls the advance after an equal compare a match and the move after a dead end a shift', () => {
    history.forEach((step, index) => {
      if (index === 0 || step.phase !== 'pass-complete') return;
      const state = kmp(index);
      if (state.stage !== 'scan' || state.fallbackFrom !== null) return;
      const before = kmp(index - 1);
      const equal =
        before.compareTextIndex !== null &&
        before.comparePatternIndex !== null &&
        before.text[before.compareTextIndex] === before.pattern[before.comparePatternIndex];
      expect(overrides[index]).toEqual(equal ? { event: 'ZGODNE', tone: 'lime' } : { event: 'PRZESUŃ', tone: 'slate' });
    });
  });

  it('marks fallbacks pink and compares cyan', () => {
    history.forEach((step, index) => {
      if (index === 0) return;
      const state = kmp(index);
      if (state.stage === 'scan' && state.fallbackFrom !== null && step.phase !== 'complete') {
        expect(overrides[index]).toEqual({ event: 'POWRÓT', tone: 'pink' });
      }
      if (step.phase === 'compare' && state.stage === 'scan') expect(overrides[index]).toEqual({ event: 'PORÓWNAJ', tone: 'cyan' });
    });
  });
});
