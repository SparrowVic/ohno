import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { QUICK_SORT_CODE } from '../data/quick-sort-code';
import { DEFAULT_SORTING_LEGEND } from '../data/sorting-legend';
import { AlgorithmItem } from '../models/algorithm';
import { CodeLine, LegendItem, LogEntry } from '../models/detail';
import { AlgorithmRegistry } from '../registry/algorithm-registry';
import { LegendBar } from '../components/legend-bar/legend-bar';
import { SidePanel } from '../components/side-panel/side-panel';
import { VisualizationCanvas } from '../components/visualization-canvas/visualization-canvas';
import { VisualizationToolbar } from '../components/visualization-toolbar/visualization-toolbar';

@Component({
  selector: 'app-algorithm-detail',
  imports: [
    TitleCasePipe,
    LegendBar,
    SidePanel,
    VisualizationCanvas,
    VisualizationToolbar,
  ],
  templateUrl: './algorithm-detail.html',
  styleUrl: './algorithm-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registry = inject(AlgorithmRegistry);

  private readonly idParam = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  readonly algorithm = computed<AlgorithmItem | undefined>(() => {
    const id = this.idParam();
    return id ? this.registry.getById(id) : undefined;
  });

  readonly isPlaying = signal(false);
  readonly speed = signal(5);
  readonly currentStep = signal(0);
  readonly totalSteps = signal(0);
  readonly size = signal(16);
  readonly activeLineNumber = signal<number | null>(3);
  readonly logEntries = signal<readonly LogEntry[]>([]);

  readonly legendItems: readonly LegendItem[] = DEFAULT_SORTING_LEGEND;
  readonly codeLines: readonly CodeLine[] = QUICK_SORT_CODE;

  back(): void {
    this.router.navigate(['/algorithms']);
  }

  onReset(): void {}

  onStepBack(): void {}

  onPlayToggle(): void {}

  onStepForward(): void {}

  onSpeedChange(value: number): void {
    this.speed.set(value);
  }

  onSizeChange(value: number): void {
    this.size.set(value);
  }

  onRandomize(): void {}
}
