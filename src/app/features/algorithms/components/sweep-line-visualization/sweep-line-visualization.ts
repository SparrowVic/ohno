import { ChangeDetectionStrategy, Component, ElementRef, computed, input, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SweepLineStepState, isSweepLineState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { GeoGraticule } from '../geo-canvas/geo-graticule/geo-graticule';
import { GeoRack } from '../geo-canvas/geo-rack/geo-rack';
import { GeoReadout } from '../geo-canvas/geo-readout/geo-readout';
import { observePlaneBox } from '../geo-canvas/plane-box';
import { sweepLineView } from './sweep-line-display.utils';

@Component({
  selector: 'app-sweep-line-visualization',
  imports: [TranslocoPipe, I18nTextPipe, GeoGraticule, GeoRack, GeoReadout],
  templateUrl: './sweep-line-visualization.html',
  styleUrl: './sweep-line-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SweepLineVisualization {
  protected readonly GEO = I18N_KEY.features.algorithms.display.geometry;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly planeRef = viewChild<ElementRef<HTMLElement>>('plane');
  private readonly box = observePlaneBox(this.planeRef);

  protected readonly state = computed<SweepLineStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isSweepLineState(geometry) ? geometry : null;
  });

  protected readonly view = computed(() => {
    const state = this.state();
    return state ? sweepLineView(state, this.box()) : null;
  });
}
