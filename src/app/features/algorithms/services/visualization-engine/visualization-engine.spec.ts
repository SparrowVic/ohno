import { afterEach, describe, expect, it, vi } from 'vitest';

import { VisualizationEngine } from './visualization-engine';
import type { SortStep } from '../../models/sort-step';

function makeStep(index: number): SortStep {
  return {
    array: [index],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: 0,
    activeCodeLine: index,
    description: `step ${index}`,
  };
}

function* makeGenerator(steps: readonly SortStep[]): Generator<SortStep> {
  yield* steps;
}

describe('visualization-engine', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads history, emits the first snapshot and exposes paused state', () => {
    const engine = new VisualizationEngine();
    const seen: number[] = [];

    engine.load(makeGenerator([makeStep(0), makeStep(1)]), (_step, index) => {
      seen.push(index);
    });

    expect(seen).toEqual([0]);
    expect(engine.state()).toBe('paused');
    expect(engine.currentStep()).toBe(0);
    expect(engine.totalSteps()).toBe(1);
    expect(engine.currentSnapshot()?.description).toBe('step 0');
  });

  it('plays through the remaining history and marks completion', () => {
    vi.useFakeTimers();

    const engine = new VisualizationEngine();
    const seen: number[] = [];

    engine.load(makeGenerator([makeStep(0), makeStep(1), makeStep(2)]), (_step, index) => {
      seen.push(index);
    });
    engine.setSpeed(10);

    engine.play();
    vi.runAllTimers();

    expect(seen).toEqual([0, 1, 2]);
    expect(engine.state()).toBe('complete');
    expect(engine.currentStep()).toBe(2);
    expect(engine.currentSnapshot()?.description).toBe('step 2');
  });

  it('pauses scheduled playback and supports stepping, reset and stop', () => {
    vi.useFakeTimers();

    const engine = new VisualizationEngine();

    engine.load(makeGenerator([makeStep(0), makeStep(1), makeStep(2)]), () => undefined);
    engine.setSpeed(10);
    engine.play();

    vi.advanceTimersByTime(20);
    engine.pause();
    vi.runAllTimers();

    expect(engine.state()).toBe('paused');
    expect(engine.currentStep()).toBe(1);

    engine.stepBack();
    expect(engine.currentStep()).toBe(0);

    engine.stepForward();
    expect(engine.currentStep()).toBe(1);

    engine.reset();
    expect(engine.state()).toBe('paused');
    expect(engine.currentStep()).toBe(0);

    engine.stop();
    expect(engine.state()).toBe('idle');
    expect(engine.totalSteps()).toBe(0);
    expect(engine.currentSnapshot()).toBeNull();
  });
});
