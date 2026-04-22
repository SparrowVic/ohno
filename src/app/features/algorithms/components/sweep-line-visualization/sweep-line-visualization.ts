import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { SweepLineStepState, isSweepLineState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.sweepLine;

@Component({
  selector: 'app-sweep-line-visualization',
  imports: [VizHeader, VizPanel],
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

  readonly phaseLabel = computed<TranslatableText>(() => {
    const phase = this.geoState()?.phase;
    switch (phase) {
      case 'init': return I18N.phases.init;
      case 'event': return I18N.phases.event;
      case 'complete': return I18N.phases.complete;
      default: return '';
    }
  });

  readonly actionText = computed<TranslatableText>(() => this.geoState()?.currentEventLabel ?? '');

  readonly headerTone = computed<VizHeaderTone>(() => {
    const phase = this.geoState()?.phase;
    if (phase === 'complete') return 'sorted';
    if (phase === 'event') return 'compare';
    return 'default';
  });

  /** Rectangle tone — sweep-line scans a collection of rectangles and
   *  the tone reflects whether each rect is pending, currently being
   *  opened / closed, or already settled in the area calculation. */
  rectToneClass(tone: 'pending' | 'active' | 'done' | 'focus'): string {
    switch (tone) {
      case 'active': return 'active';
      case 'focus':  return 'accent';
      case 'done':   return 'muted';
      default:       return '';
    }
  }
}
