import { LedColor } from '../../../../shared/instrument/led/led.types';
import { OpLineRegister } from '../../../../shared/instrument/opline/opline.types';
import { SortStep } from '../../models/sort-step';
import { countStepEvents, StepEvent, StepEventKind } from './step-events.utils';

export interface StageMeter {
  readonly id: string;
  readonly label: string;
  readonly value: number | string;
  readonly total: number | null;
  readonly pad: number;
}

export interface PassGauge {
  readonly count: number;
  readonly lit: number;
  readonly done: number;
}

export interface StageReadout {
  readonly meters: readonly StageMeter[];
  readonly phaseLabel: string;
  readonly tone: LedColor;
  readonly registers: readonly OpLineRegister[];
  readonly gauge: PassGauge | null;
  readonly gaugeLabel: string;
}

export interface StageReadoutLabels {
  readonly meters: { readonly passes: string; readonly comparisons: string; readonly swaps: string };
  readonly phases: Readonly<Record<StepEventKind, string>>;
  readonly registers: {
    readonly left: string;
    readonly right: string;
    readonly boundary: string;
    readonly settled: string;
  };
  readonly gauge: string;
}

const PHASE_TONES: Readonly<Record<StepEventKind, LedColor>> = {
  start: 'slate',
  step: 'slate',
  compare: 'cyan',
  swap: 'pink',
  settle: 'lime',
  pass: 'lime',
  complete: 'lime',
};

export function sortingPassGauge(events: readonly StepEvent[], cursor: number): PassGauge {
  const count = events.filter((event) => event.kind === 'pass').length;
  const done = countStepEvents(events, cursor).passes;
  const complete = events.length > 0 && cursor >= events.length - 1;
  return { count, done, lit: Math.min(count, complete ? done : done + 1) };
}

export function sortingStageReadout(
  step: SortStep,
  events: readonly StepEvent[],
  cursor: number,
  labels: StageReadoutLabels,
): StageReadout {
  const kind: StepEventKind = events[cursor]?.kind ?? 'step';
  const counts = countStepEvents(events, cursor);
  const gauge = sortingPassGauge(events, cursor);
  const pair = step.comparing ?? step.swapping;
  const pairRegisters: OpLineRegister[] = pair
    ? [
        { label: labels.registers.left, value: String(pair[0]) },
        { label: labels.registers.right, value: String(pair[1]) },
      ]
    : [];
  return {
    meters: [
      { id: 'passes', label: labels.meters.passes, value: gauge.lit, total: gauge.count, pad: 2 },
      { id: 'comparisons', label: labels.meters.comparisons, value: counts.comparisons, total: null, pad: 3 },
      { id: 'swaps', label: labels.meters.swaps, value: counts.swaps, total: null, pad: 3 },
    ],
    phaseLabel: labels.phases[kind],
    tone: PHASE_TONES[kind],
    registers: [
      ...pairRegisters,
      { label: labels.registers.boundary, value: String(step.boundary) },
      { label: labels.registers.settled, value: String(step.sorted.length) },
    ],
    gauge,
    gaugeLabel: labels.gauge,
  };
}

export function genericStageReadout(
  index: number,
  lastIndex: number,
  labels: StageReadoutLabels,
): StageReadout {
  const kind: StepEventKind = index <= 0 ? 'start' : index >= lastIndex ? 'complete' : 'step';
  return {
    meters: [],
    phaseLabel: labels.phases[kind],
    tone: kind === 'step' ? 'cyan' : PHASE_TONES[kind],
    registers: [],
    gauge: null,
    gaugeLabel: '',
  };
}
