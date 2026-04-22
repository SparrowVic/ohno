import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import {
  GeometryPolygonRegion,
  HalfPlaneIntersectionStepState,
  isHalfPlaneIntersectionState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.halfPlane;

@Component({
  selector: 'app-half-plane-visualization',
  imports: [VizHeader, VizPanel],
  templateUrl: './half-plane-visualization.html',
  styleUrl: './half-plane-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfPlaneVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<HalfPlaneIntersectionStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isHalfPlaneIntersectionState(geometry) ? geometry : null;
  });

  readonly phaseLabel = computed<TranslatableText>(() => {
    const phase = this.geoState()?.phase;
    switch (phase) {
      case 'init': return I18N.phases.init;
      case 'constraint': return I18N.phases.constraint;
      case 'clip': return I18N.phases.clip;
      case 'infeasible': return I18N.phases.infeasible;
      case 'complete': return I18N.phases.complete;
      default: return '';
    }
  });

  readonly actionText = computed<TranslatableText>(() => {
    const geo = this.geoState();
    if (!geo) return '';
    return geo.currentConstraintLabel || geo.status || '';
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const phase = this.geoState()?.phase;
    if (phase === 'complete') return 'sorted';
    if (phase === 'infeasible') return 'compare';
    if (phase === 'clip') return 'swap';
    if (phase === 'constraint') return 'compare';
    return 'default';
  });

  polygonPoints(region: GeometryPolygonRegion): string {
    return region.vertices.map((vertex) => `${vertex.x},${100 - vertex.y}`).join(' ');
  }

  /** Feasible regions build up as constraints are applied. Map them to
   *  the shared polygon palette — feasible final = hull-ish, previous
   *  = preview dashed outline, forbidden = danger tone. */
  polygonToneClass(tone: GeometryPolygonRegion['tone']): string {
    switch (tone) {
      case 'feasible':  return 'route';
      case 'previous':  return 'preview';
      case 'forbidden': return 'warm';
      default:          return 'preview';
    }
  }

  /** Constraint lines ride the same tone vocabulary as edges. */
  constraintToneClass(tone: 'pending' | 'active' | 'applied' | 'blocking'): string {
    switch (tone) {
      case 'active':   return 'active';
      case 'applied':  return 'best';
      case 'blocking': return 'danger';
      default:         return 'muted';
    }
  }
}
