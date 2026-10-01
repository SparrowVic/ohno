import { describe, expect, it } from 'vitest';

import { convexHullGenerator } from '../../algorithms/convex-hull';
import { dijkstraGenerator } from '../../algorithms/dijkstra/dijkstra';
import { kmpPatternMatchingGenerator } from '../../algorithms/kmp-pattern-matching/kmp-pattern-matching';
import { knapsack01Generator } from '../../algorithms/knapsack-01/knapsack-01';
import { ScratchpadLabTraceState } from '../../models/scratchpad-lab';
import { SortStep } from '../../models/sort-step';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { generateDijkstraGraph } from '../../utils/helpers/dijkstra-graph/dijkstra-graph';
import {
  FamilyGaugeId,
  FamilyMeterId,
  FamilyReadoutLabels,
  FamilyRegisterId,
  familyStageReadout,
  scratchpadReadout,
} from './family-readout.utils';
import { sortStep } from './step-events.fixture';

const METER_IDS: readonly FamilyMeterId[] = [
  'settled', 'queue', 'relaxed', 'row', 'column', 'value', 'textIndex', 'patternIndex', 'matches', 'stack', 'checked',
  'rejected', 'frontier', 'visited', 'result', 'pivot', 'improved', 'prime', 'bound', 'primes', 'components', 'merged',
  'output', 'low', 'high', 'probe', 'frames', 'returns', 'iteration', 'explored', 'depth', 'phases', 'lines', 'hits',
  'events', 'area', 'cells', 'triangles', 'vertices', 'pairs', 'distance', 'edges', 'rows',
];
const GAUGE_IDS: readonly FamilyGaugeId[] = [
  'settled', 'rows', 'phases', 'checked', 'textChars', 'visited', 'marked', 'eliminated', 'output', 'frames', 'explored', 'events', 'cells',
];
const REGISTER_IDS: readonly FamilyRegisterId[] = [
  'u', 'v', 'w', 'alt', 'i', 'j', 'c', 'o', 'a', 'b', 'stack', 'p', 'lo', 'hi', 'mid', 'n', 'k', 'x', 'y', 'depth', 'row', 'col',
];

function labelMap<T extends string>(ids: readonly T[], prefix: string): Record<T, string> {
  return Object.fromEntries(ids.map((id) => [id, `${prefix}:${id}`])) as Record<T, string>;
}

const labels: FamilyReadoutLabels = {
  meters: labelMap(METER_IDS, 'm'),
  gauges: labelMap(GAUGE_IDS, 'g'),
  registers: labelMap(REGISTER_IDS, 'r'),
  phases: { start: 'Start', step: 'Krok', complete: 'Koniec' },
  translate: (text) => (typeof text === 'string' ? text : text.key),
};

function history(generator: Generator<SortStep>): readonly SortStep[] {
  return [...generator];
}

function readoutAt(steps: readonly SortStep[], index: number, variant: VisualizationVariant) {
  return familyStageReadout({ step: steps[index]!, index, lastIndex: steps.length - 1, variant, labels });
}

describe('familyStageReadout', () => {
  it('reads settled, queue and relaxed meters from a Dijkstra step and lights the settled gauge', () => {
    const steps = history(dijkstraGenerator(generateDijkstraGraph(8)));
    const relaxIndex = steps.findIndex((step) => step.graph?.activeEdgeId && step.graph.computation);
    const readout = readoutAt(steps, relaxIndex, 'dijkstra-graph')!;
    expect(readout.meters.map((meter) => meter.id)).toEqual(['settled', 'queue', 'relaxed']);
    expect(readout.meters[0]).toMatchObject({ label: 'm:settled', total: 8 });
    expect(readout.tone).toBe('pink');
    expect(readout.registers.map((item) => item.label)).toEqual(['r:u', 'r:v', 'r:w', 'r:alt']);
    expect(readout.gaugeLabel).toBe('g:settled');
    expect(readout.gauge?.count).toBe(8);
    const last = readoutAt(steps, steps.length - 1, 'dijkstra-graph')!;
    expect(last.tone).toBe('lime');
    expect(last.phaseLabel).toBe(steps.at(-1)!.graph!.phaseLabel);
  });

  it('reads row, column and value meters from a knapsack step', () => {
    const steps = history(
      knapsack01Generator({
        kind: 'knapsack-01',
        presetId: 'camp',
        presetLabel: 'Camp',
        presetDescription: 'camp',
        capacity: 7,
        items: [
          { id: 'compass', label: 'Compass', weight: 2, value: 6 },
          { id: 'torch', label: 'Torch', weight: 1, value: 3 },
          { id: 'rope', label: 'Rope', weight: 3, value: 7 },
        ],
      }),
    );
    const activeIndex = steps.findIndex((step) => step.dp?.cells.some((cell) => cell.status === 'active'));
    const readout = readoutAt(steps, activeIndex, 'dp')!;
    expect(readout.meters.map((meter) => meter.id)).toEqual(['row', 'column', 'value']);
    expect(readout.meters[0]!.total).toBe(steps[activeIndex]!.dp!.rowHeaders.length);
    expect(readout.registers.map((item) => item.label)).toEqual(['r:i', 'r:c']);
    expect(readout.gaugeLabel).toBe('g:rows');
    expect(['cyan', 'pink']).toContain(readout.tone);
  });

  it('reads the text and pattern cursors from a KMP step and counts scanned characters', () => {
    const steps = history(
      kmpPatternMatchingGenerator({
        kind: 'kmp-pattern-matching',
        presetId: 'overlap',
        presetLabel: 'Overlap',
        presetDescription: 'overlap',
        text: 'ABABDABACDABABCABAB',
        pattern: 'ABABCABAB',
      }),
    );
    const scanIndex = steps.findIndex((step) => step.string?.mode === 'kmp' && step.string.stage === 'scan' && step.string.textIndex !== null);
    const readout = readoutAt(steps, scanIndex, 'string')!;
    expect(readout.meters.map((meter) => meter.id)).toEqual(['textIndex', 'patternIndex', 'matches']);
    expect(readout.meters[0]!.total).toBe(19);
    expect(readout.meters[1]!.total).toBe(9);
    expect(readout.gaugeLabel).toBe('g:textChars');
    expect(readout.gauge).toEqual({ count: 19, done: (steps[scanIndex]!.string as { textIndex: number }).textIndex + 1, lit: (steps[scanIndex]!.string as { textIndex: number }).textIndex + 1 });
  });

  it('reads stack, checked and rejected meters from a convex hull step', () => {
    const steps = history(
      convexHullGenerator({
        points: [
          { x: 48, y: 4 }, { x: 86, y: 14 }, { x: 94, y: 36 }, { x: 78, y: 52 }, { x: 56, y: 60 }, { x: 30, y: 54 },
          { x: 10, y: 42 }, { x: 14, y: 20 }, { x: 40, y: 30 }, { x: 60, y: 28 }, { x: 70, y: 44 },
        ],
      }),
    );
    const checkIndex = steps.findIndex((step) => step.geometry?.mode === 'convex-hull' && step.geometry.turnCheck !== null);
    const readout = readoutAt(steps, checkIndex, 'convex-hull')!;
    expect(readout.meters.map((meter) => meter.id)).toEqual(['stack', 'checked', 'rejected']);
    expect(readout.meters[1]!.total).toBe(11);
    expect(readout.registers.map((item) => item.label)).toEqual(['r:o', 'r:a', 'r:b', 'r:stack']);
    expect(readout.gaugeLabel).toBe('g:checked');
  });

  it('returns null when the step carries no family slot', () => {
    expect(readoutAt([sortStep({ array: [1, 2] })], 0, 'bar')).toBeNull();
  });
});

describe('scratchpadReadout', () => {
  const scratchpad: ScratchpadLabTraceState = {
    mode: 'extended-euclidean',
    modeLabel: 'eea',
    phaseLabel: 'phase.forward',
    decisionLabel: 'decide',
    presetLabel: 'preset',
    taskPrompt: null,
    tone: 'decide',
    lines: [
      { id: 'g', kind: 'goal', indent: 0, marker: null, caption: null, content: 'goal', instruction: null, annotation: null, state: 'settled' },
      { id: 'd1', kind: 'divider', indent: 0, marker: null, caption: null, content: '', instruction: null, annotation: null, state: 'settled' },
      { id: 'e1', kind: 'equation', indent: 0, marker: '01', caption: null, content: '735 = 3 · 210 + 105', instruction: null, annotation: null, state: 'settled' },
      { id: 'e2', kind: 'equation', indent: 0, marker: '02', caption: null, content: '210 = 2 · 105 + 0', instruction: null, annotation: null, state: 'settled' },
      { id: 'x', kind: 'decision', indent: 0, marker: '03', caption: null, content: 'r = 0', instruction: null, annotation: null, state: 'current' },
      { id: 'd2', kind: 'divider', indent: 0, marker: null, caption: null, content: '', instruction: null, annotation: null, state: 'entering' },
    ],
    margins: [],
    resultLabel: null,
    iteration: 3,
  };

  it('uses number-lab registers as meters when they exist and counts passed phases for the gauge', () => {
    const registers = {
      modeLabel: 'm',
      phaseLabel: 'p',
      decisionLabel: 'd',
      tone: 'compare' as const,
      registers: [
        { id: 'a', label: 'a', value: '210', hint: null, tone: 'default' as const },
        { id: 'b', label: 'b', value: '105', hint: null, tone: 'default' as const },
        { id: 'q', label: 'q', value: '2', hint: null, tone: 'active' as const },
        { id: 'r', label: 'r', value: '0', hint: null, tone: 'active' as const },
      ],
      history: [],
      formula: null,
      presetLabel: 'preset',
      resultLabel: null,
      iteration: 3,
    };
    const readout = scratchpadReadout(scratchpad, registers, {
      step: sortStep({ array: [], scratchpadLab: scratchpad, numberLab: registers }),
      index: 4,
      lastIndex: 11,
      variant: 'scratchpad-lab',
      labels,
    });
    expect(readout.meters.map((meter) => [meter.label, meter.value])).toEqual([['a', '210'], ['b', '105'], ['q', '2']]);
    expect(readout.registers).toHaveLength(4);
    expect(readout.tone).toBe('pink');
    expect(readout.phaseLabel).toBe('phase.forward');
    expect(readout.gauge).toEqual({ count: 2, done: 0, lit: 1 });
    expect(readout.gaugeLabel).toBe('g:phases');
  });

  it('falls back to line counts when no registers exist', () => {
    const readout = scratchpadReadout(scratchpad, null, {
      step: sortStep({ array: [], scratchpadLab: scratchpad }),
      index: 4,
      lastIndex: 11,
      variant: 'scratchpad-lab',
      labels,
    });
    expect(readout.meters.map((meter) => [meter.id, meter.value])).toEqual([['lines', 2], ['phases', 1], ['result', 1]]);
    expect(readout.registers).toEqual([]);
  });
});
