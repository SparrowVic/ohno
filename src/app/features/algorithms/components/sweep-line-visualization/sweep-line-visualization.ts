import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SweepLineStepState, isSweepLineState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';

@Component({
  selector: 'app-sweep-line-visualization',
  imports: [],
  templateUrl: './sweep-line-visualization.html',
  styleUrl: './sweep-line-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SweepLineVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<SweepLineStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isSweepLineState(geometry) ? geometry : null;
  });

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'init': return 'Scanner Ready';
      case 'event': return 'Edge Event';
      case 'complete': return 'Area Done';
      default: return phase;
    }
  }
}
