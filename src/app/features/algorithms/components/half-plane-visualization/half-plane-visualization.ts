import { ChangeDetectionStrategy, Component, ElementRef, computed, input, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { HalfPlaneIntersectionStepState, isHalfPlaneIntersectionState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { GeoGraticule } from '../geo-canvas/geo-graticule/geo-graticule';
import { GeoRack } from '../geo-canvas/geo-rack/geo-rack';
import { GeoReadout } from '../geo-canvas/geo-readout/geo-readout';
import { observePlaneBox } from '../geo-canvas/plane-box';
import { halfPlaneView } from './half-plane-display.utils';

let nextClipId = 0;

@Component({
  selector: 'app-half-plane-visualization',
  imports: [TranslocoPipe, GeoGraticule, GeoRack, GeoReadout],
  templateUrl: './half-plane-visualization.html',
  styleUrl: './half-plane-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalfPlaneVisualization {
  protected readonly GEO = I18N_KEY.features.algorithms.display.geometry;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly clipId = `half-plane-plot-${nextClipId++}`;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly planeRef = viewChild<ElementRef<HTMLElement>>('plane');
  private readonly box = observePlaneBox(this.planeRef);

  protected readonly state = computed<HalfPlaneIntersectionStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isHalfPlaneIntersectionState(geometry) ? geometry : null;
  });

  protected readonly view = computed(() => {
    const state = this.state();
    return state ? halfPlaneView(state, this.box()) : null;
  });
}
