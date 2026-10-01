import { describe, expect, it } from 'vitest';

import { genericStageReadout, sortingPassGauge, sortingStageReadout, StageReadoutLabels } from './stage-readout.utils';
import { BUBBLE_HISTORY } from './step-events.fixture';
import { classifyStepEvents } from './step-events.utils';

const labels: StageReadoutLabels = {
  meters: { passes: 'Przebieg', comparisons: 'Porównania', swaps: 'Zamiany' },
  phases: {
    start: 'Start',
    step: 'Krok',
    compare: 'Porównanie',
    swap: 'Zamiana',
    settle: 'Ustalone',
    pass: 'Przebieg zakończony',
    complete: 'Koniec',
  },
  registers: { left: 'i', right: 'j', boundary: 'granica', settled: 'ustalone' },
  gauge: 'Przebiegi',
};

const events = classifyStepEvents(BUBBLE_HISTORY);
const stepAt = (index: number) => BUBBLE_HISTORY[index] ?? BUBBLE_HISTORY[0]!;

describe('sortingStageReadout', () => {
  it('reads meters, phase and registers on a compare step', () => {
    const readout = sortingStageReadout(stepAt(1), events, 1, labels);
    expect(readout.meters).toEqual([
      { id: 'passes', label: 'Przebieg', value: 1, total: 1, pad: 2 },
      { id: 'comparisons', label: 'Porównania', value: 1, total: null, pad: 3 },
      { id: 'swaps', label: 'Zamiany', value: 0, total: null, pad: 3 },
    ]);
    expect(readout.phaseLabel).toBe('Porównanie');
    expect(readout.tone).toBe('cyan');
    expect(readout.registers).toEqual([
      { label: 'i', value: '0' },
      { label: 'j', value: '1' },
      { label: 'granica', value: '4' },
      { label: 'ustalone', value: '0' },
    ]);
  });

  it('drops the pair registers when no pair is active and turns lime when done', () => {
    const readout = sortingStageReadout(stepAt(5), events, 5, labels);
    expect(readout.tone).toBe('lime');
    expect(readout.phaseLabel).toBe('Koniec');
    expect(readout.registers).toEqual([
      { label: 'granica', value: '0' },
      { label: 'ustalone', value: '4' },
    ]);
    expect(readout.meters[0]).toEqual({ id: 'passes', label: 'Przebieg', value: 1, total: 1, pad: 2 });
  });
});

describe('sortingPassGauge', () => {
  it('lights the pass in progress and marks finished passes as done', () => {
    expect(sortingPassGauge(events, 1)).toEqual({ count: 1, lit: 1, done: 0 });
    expect(sortingPassGauge(events, 4)).toEqual({ count: 1, lit: 1, done: 1 });
    expect(sortingPassGauge(events, 5)).toEqual({ count: 1, lit: 1, done: 1 });
  });

  it('never lights more LEDs than there are passes', () => {
    expect(sortingPassGauge([], 0)).toEqual({ count: 0, lit: 0, done: 0 });
  });
});

describe('genericStageReadout', () => {
  it('labels the first, middle and last steps without meters or registers', () => {
    expect(genericStageReadout(0, 5, labels)).toEqual({ meters: [], phaseLabel: 'Start', tone: 'slate', registers: [], gauge: null, gaugeLabel: '' });
    expect(genericStageReadout(2, 5, labels)).toEqual({ meters: [], phaseLabel: 'Krok', tone: 'cyan', registers: [], gauge: null, gaugeLabel: '' });
    expect(genericStageReadout(5, 5, labels)).toEqual({ meters: [], phaseLabel: 'Koniec', tone: 'lime', registers: [], gauge: null, gaugeLabel: '' });
  });
});
