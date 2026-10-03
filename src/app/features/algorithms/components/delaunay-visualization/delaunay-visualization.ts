import { ChangeDetectionStrategy, Component, ElementRef, computed, input, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { DelaunayTriangulationStepState, isDelaunayTriangulationState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { GeoGraticule } from '../geo-canvas/geo-graticule/geo-graticule';
import { GeoRack } from '../geo-canvas/geo-rack/geo-rack';
import { GeoReadout } from '../geo-canvas/geo-readout/geo-readout';
import { observePlaneBox } from '../geo-canvas/plane-box';
import { delaunayView } from './delaunay-display.utils';

let nextClipId = 0;

@Component({
  selector: 'app-delaunay-visualization',
  imports: [TranslocoPipe, GeoGraticule, GeoRack, GeoReadout],
  templateUrl: './delaunay-visualization.html',
  styleUrl: './delaunay-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelaunayVisualization {
  protected readonly GEO = I18N_KEY.features.algorithms.display.geometry;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly clipId = `delaunay-plot-${nextClipId++}`;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly planeRef = viewChild<ElementRef<HTMLElement>>('plane');
  private readonly box = observePlaneBox(this.planeRef);

  protected readonly state = computed<DelaunayTriangulationStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isDelaunayTriangulationState(geometry) ? geometry : null;
  });

  protected readonly view = computed(() => {
    const state = this.state();
    return state ? delaunayView(state, this.box()) : null;
  });
}
