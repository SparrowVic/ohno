import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import {
  GeometryPolygonRegion,
  VoronoiDiagramStepState,
  isVoronoiDiagramState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.voronoi;

@Component({
  selector: 'app-voronoi-visualization',
  imports: [VizHeader, VizPanel],
  templateUrl: './voronoi-visualization.html',
  styleUrl: './voronoi-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<VoronoiDiagramStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isVoronoiDiagramState(geometry) ? geometry : null;
  });

  readonly phaseLabel = computed<TranslatableText>(() => {
    const phase = this.geoState()?.phase;
    switch (phase) {
      case 'init': return I18N.phases.init;
      case 'site': return I18N.phases.site;
      case 'cell': return I18N.phases.cell;
      case 'complete': return I18N.phases.complete;
      default: return '';
    }
  });

  readonly actionText = computed<TranslatableText>(() => {
    const geo = this.geoState();
    if (!geo) return '';
    const focus = geo.currentCellLabel;
    const closed = geo.closedCells;
    return focus
      ? i18nText(I18N.action.focusAndClosed, { focus, closed })
      : i18nText(I18N.action.closedOnly, { closed });
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const phase = this.geoState()?.phase;
    if (phase === 'complete') return 'sorted';
    if (phase === 'cell') return 'sorted';
    if (phase === 'site') return 'swap';
    return 'default';
  });

  polygonPoints(region: GeometryPolygonRegion): string {
    return region.vertices.map((vertex) => `${vertex.x},${100 - vertex.y}`).join(' ');
  }

  cellColor(id: string): string {
    const index = Number(id.replace('cell-', '')) || 0;
    const hues = [192, 330, 40, 145, 260, 15, 90, 210];
    return `hsla(${hues[index % hues.length]}, 78%, 66%, 0.15)`;
  }

  cellStroke(id: string): string {
    const index = Number(id.replace('cell-', '')) || 0;
    const hues = [192, 330, 40, 145, 260, 15, 90, 210];
    return `hsla(${hues[index % hues.length]}, 82%, 72%, 0.68)`;
  }
}
