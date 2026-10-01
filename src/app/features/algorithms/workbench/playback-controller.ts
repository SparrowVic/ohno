import { computed, effect, inject, Injectable, OnDestroy, Signal, signal, untracked } from '@angular/core';

import { RecentAlgorithmsStore } from '../../../core/recent/recent-algorithms-store';
import { SortStep } from '../models/sort-step';
import { VisualizationEngine } from '../services/visualization-engine/visualization-engine';
import { classifyStepEvents, countStepEvents, StepEvent, StepEventCounts } from './utils/step-events.utils';
import {
  nextTransportAction,
  PlaybackStatus,
  resolvePlaybackStatus,
  TransportAction,
} from './utils/transport.utils';

@Injectable()
export class PlaybackController implements OnDestroy {
  private readonly engine = inject(VisualizationEngine);
  private readonly recent = inject(RecentAlgorithmsStore);
  private readonly historyState = signal<readonly SortStep[]>([]);
  private readonly stepState = signal<SortStep | null>(null);
  private algorithmId: string | null = null;

  readonly history: Signal<readonly SortStep[]> = this.historyState.asReadonly();
  readonly step: Signal<SortStep | null> = this.stepState.asReadonly();
  readonly cursor: Signal<number> = this.engine.currentStep;
  readonly lastIndex: Signal<number> = this.engine.totalSteps;
  readonly playing: Signal<boolean> = this.engine.isPlaying;
  readonly speed: Signal<number> = this.engine.speed;
  readonly status: Signal<PlaybackStatus> = computed(() =>
    resolvePlaybackStatus(this.playing(), this.cursor(), this.lastIndex()),
  );
  readonly transportAction: Signal<TransportAction> = computed(() =>
    nextTransportAction(this.playing(), this.cursor(), this.lastIndex()),
  );
  readonly events: Signal<readonly StepEvent[]> = computed(() => classifyStepEvents(this.history()));
  readonly counts: Signal<StepEventCounts> = computed(() => countStepEvents(this.events(), this.cursor()));

  constructor() {
    effect(() => {
      if (this.status() === 'complete') untracked(() => this.recordProgress(true));
    });
  }

  load(algorithmId: string, generator: Iterable<SortStep>): void {
    const history = Array.from(generator);
    this.algorithmId = algorithmId;
    this.historyState.set(history);
    this.stepState.set(null);
    this.engine.load(history, (step) => this.stepState.set(step));
    this.recent.touch(algorithmId);
  }

  unload(): void {
    this.engine.stop();
    this.algorithmId = null;
    this.historyState.set([]);
    this.stepState.set(null);
  }

  toggle(): void {
    const action = this.transportAction();
    if (action === 'pause') {
      this.pause();
      return;
    }
    if (action === 'restart') this.engine.reset();
    this.engine.play();
  }

  play(): void {
    this.engine.play();
  }

  pause(): void {
    this.engine.pause();
    this.recordProgress(false);
  }

  stepForward(): void {
    this.engine.stepForward();
  }

  stepBack(): void {
    this.engine.stepBack();
  }

  reset(): void {
    this.engine.reset();
  }

  seek(index: number): void {
    this.engine.seek(index);
  }

  setSpeed(speed: number): void {
    this.engine.setSpeed(speed);
  }

  ngOnDestroy(): void {
    this.recordProgress(this.status() === 'complete');
    this.engine.stop();
  }

  private recordProgress(finished: boolean): void {
    const total = this.lastIndex();
    if (this.algorithmId === null || total <= 0) return;
    this.recent.record({ id: this.algorithmId, step: finished ? total : this.cursor(), total, finished });
  }
}
