import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import {
  DelaunayTriangulationStepState,
  GeometryPolygonRegion,
  isDelaunayTriangulationState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.delaunay;

@Component({
  selector: 'app-delaunay-visualization',
  imports: [VizHeader, VizPanel],
  templateUrl: './delaunay-visualization.html',
  styleUrl: './delaunay-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelaunayVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<DelaunayTriangulationStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isDelaunayTriangulationState(geometry) ? geometry : null;
  });

  readonly phaseLabel = computed<TranslatableText>(() => {
    const phase = this.geoState()?.phase;
    switch (phase) {
      case 'init': return I18N.phases.init;
      case 'circumcircle': return I18N.phases.circumcircle;
      case 'commit': return I18N.phases.commit;
      case 'complete': return I18N.phases.complete;
      default: return '';
    }
  });

  readonly actionText = computed<TranslatableText>(() => {
    const geo = this.geoState();
    if (!geo) return '';
    const count = geo.triangleCount;
    const focus = geo.activeTriangleLabel;
    if (focus) return i18nText(I18N.action.focusAndCount, { focus, count });
    return i18nText(I18N.action.countOnly, { count });
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const phase = this.geoState()?.phase;
    if (phase === 'complete') return 'sorted';
    if (phase === 'commit') return 'sorted';
    if (phase === 'circumcircle') return 'swap';
    return 'default';
  });

  polygonPoints(region: GeometryPolygonRegion): string {
    return region.vertices.map((vertex) => `${vertex.x},${100 - vertex.y}`).join(' ');
  }
}
