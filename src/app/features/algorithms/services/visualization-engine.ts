import { Injectable, Signal, computed, signal } from '@angular/core';

import { SortStep } from '../models/sort-step';
import { computePlaybackDelay } from '../utils/visualization-motion';

export type EngineState = 'idle' | 'running' | 'paused' | 'complete';

type StepListener = (step: SortStep, index: number) => void;

@Injectable()
export class VisualizationEngine {
  private history: SortStep[] = [];
  private cursor = -1;
  private timerId: number | null = null;
  private listener: StepListener | null = null;

  private readonly stateSig = signal<EngineState>('idle');
  private readonly cursorSig = signal(-1);
  private readonly totalSig = signal(0);
  private readonly speedSig = signal(5);

  readonly state: Signal<EngineState> = this.stateSig.asReadonly();
  readonly speed: Signal<number> = this.speedSig.asReadonly();
  readonly totalSteps: Signal<number> = computed(() => Math.max(this.totalSig() - 1, 0));
  readonly currentStep: Signal<number> = computed(() => {
    const c = this.cursorSig();
    return c < 0 ? 0 : c;
  });
  readonly isPlaying: Signal<boolean> = computed(() => this.stateSig() === 'running');
  readonly currentSnapshot: Signal<SortStep | null> = computed(() => {
    const c = this.cursorSig();
    if (c < 0 || c >= this.totalSig()) return null;
    return this.history[c];
  });

  load(generator: Generator<SortStep>, onStep: StepListener): void {
    this.stop();
    this.history = Array.from(generator);
    this.cursor = this.history.length > 0 ? 0 : -1;
    this.listener = onStep;
    this.stateSig.set(this.history.length > 0 ? 'paused' : 'idle');
    this.totalSig.set(this.history.length);
    this.cursorSig.set(this.cursor);
    this.emitCurrent();
  }

  setSpeed(speed: number): void {
    this.speedSig.set(speed);
  }

  play(): void {
    if (this.history.length === 0) return;
    if (this.cursor >= this.history.length - 1) return;
    this.stateSig.set('running');
    this.scheduleTick();
  }

  pause(): void {
    this.clearTimer();
    if (this.stateSig() === 'running') {
      this.stateSig.set('paused');
    }
  }

  stepForward(): void {
    this.clearTimer();
    if (this.history.length === 0) return;
    if (this.cursor < this.history.length - 1) {
      this.cursor++;
      this.cursorSig.set(this.cursor);
      this.emitCurrent();
    }
    if (this.cursor >= this.history.length - 1) {
      this.stateSig.set('complete');
    } else {
      this.stateSig.set('paused');
    }
  }

  stepBack(): void {
    this.clearTimer();
    if (this.cursor > 0) {
      this.cursor--;
      this.cursorSig.set(this.cursor);
      this.emitCurrent();
    }
    this.stateSig.set('paused');
  }

  reset(): void {
    this.clearTimer();
    if (this.history.length === 0) {
      this.stateSig.set('idle');
      return;
    }
    this.cursor = 0;
    this.cursorSig.set(0);
    this.stateSig.set('paused');
    this.emitCurrent();
  }

  stop(): void {
    this.clearTimer();
    this.history = [];
    this.cursor = -1;
    this.listener = null;
    this.stateSig.set('idle');
    this.cursorSig.set(-1);
    this.totalSig.set(0);
  }

  private scheduleTick(): void {
    if (this.stateSig() !== 'running') return;
    const delay = this.computeDelay(this.speedSig());
    this.timerId = window.setTimeout(() => {
      this.timerId = null;
      if (this.stateSig() !== 'running') return;
      if (this.cursor < this.history.length - 1) {
        this.cursor++;
        this.cursorSig.set(this.cursor);
        this.emitCurrent();
      }
      if (this.cursor >= this.history.length - 1) {
        this.stateSig.set('complete');
        return;
      }
      this.scheduleTick();
    }, delay);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private emitCurrent(): void {
    if (this.cursor < 0 || this.cursor >= this.history.length) return;
    const step = this.history[this.cursor];
    this.listener?.(step, this.cursor);
  }

  private computeDelay(speed: number): number {
    return computePlaybackDelay(speed);
  }
}
