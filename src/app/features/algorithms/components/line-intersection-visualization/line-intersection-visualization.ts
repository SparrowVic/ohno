import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { LineIntersectionStepState, isLineIntersectionState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.lineIntersection;

@Component({
  selector: 'app-line-intersection-visualization',
  imports: [VizHeader, VizPanel],
  templateUrl: './line-intersection-visualization.html',
  styleUrl: './line-intersection-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineIntersectionVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<LineIntersectionStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isLineIntersectionState(geometry) ? geometry : null;
  });
  readonly segments = computed(() => this.geoState()?.segments ?? []);
  readonly intersections = computed(() => this.geoState()?.intersections ?? []);
  readonly events = computed(() => this.geoState()?.events ?? []);

  readonly phaseLabel = computed<TranslatableText>(() => {
    const phase = this.geoState()?.phase;
    switch (phase) {
      case 'init': return I18N.phases.init;
      case 'activate': return I18N.phases.activate;
      case 'retire': return I18N.phases.retire;
      case 'intersection': return I18N.phases.intersection;
      case 'complete': return I18N.phases.complete;
      default: return '';
    }
  });

  readonly actionText = computed<TranslatableText>(() => this.geoState()?.currentEventLabel ?? '');

  readonly headerTone = computed<VizHeaderTone>(() => {
    const phase = this.geoState()?.phase;
    if (phase === 'complete') return 'sorted';
    if (phase === 'intersection') return 'sorted';
    if (phase === 'activate' || phase === 'retire') return 'swap';
    return 'default';
  });

  /** Segment tone → `.geo-line--*`. Line-intersection's segments
   *  ride the Bentley-Ottmann event stream: `pending` → quiet,
   *  `active` → under sweep consideration, `focus` → crossing
   *  candidate, `hit` → intersection just reported, `done` → retired. */
  segmentToneClass(tone: 'pending' | 'active' | 'focus' | 'hit' | 'done'): string {
    switch (tone) {
      case 'active': return 'active';
      case 'focus':  return 'candidate';
      case 'hit':    return 'best';
      case 'done':   return 'muted';
      default:       return '';
    }
  }

  /** Intersection marker tone — uses the point palette. Markers on
   *  the sweep use the generic geometry-marker vocabulary
   *  (`intersection`, `current`, `candidate`, …). */
  hitToneClass(
    tone: 'intersection' | 'current' | 'vertex' | 'candidate' | 'terminal' | 'robot' | 'result',
  ): string {
    switch (tone) {
      case 'intersection': return 'hit';
      case 'current':      return 'active';
      case 'candidate':    return 'accent';
      case 'result':       return 'success';
      default:             return 'route';
    }
  }
}
