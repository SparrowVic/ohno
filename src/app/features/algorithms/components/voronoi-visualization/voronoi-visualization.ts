import { ChangeDetectionStrategy, Component, ElementRef, computed, input, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { VoronoiDiagramStepState, isVoronoiDiagramState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { GeoGraticule } from '../geo-canvas/geo-graticule/geo-graticule';
import { GeoRack } from '../geo-canvas/geo-rack/geo-rack';
import { GeoReadout } from '../geo-canvas/geo-readout/geo-readout';
import { observePlaneBox } from '../geo-canvas/plane-box';
import { voronoiView } from './voronoi-display.utils';

@Component({
  selector: 'app-voronoi-visualization',
  imports: [TranslocoPipe, I18nTextPipe, GeoGraticule, GeoRack, GeoReadout],
  templateUrl: './voronoi-visualization.html',
  styleUrl: './voronoi-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoronoiVisualization {
  protected readonly GEO = I18N_KEY.features.algorithms.display.geometry;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly planeRef = viewChild<ElementRef<HTMLElement>>('plane');
  private readonly box = observePlaneBox(this.planeRef);

  protected readonly state = computed<VoronoiDiagramStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isVoronoiDiagramState(geometry) ? geometry : null;
  });

  protected readonly view = computed(() => {
    const state = this.state();
    return state ? voronoiView(state, this.box()) : null;
  });
}
