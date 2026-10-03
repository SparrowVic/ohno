import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PlaneGrid } from '../plane-display.utils';

@Component({
  selector: 'g[appGeoGraticule]',
  templateUrl: './geo-graticule.html',
  styleUrl: './geo-graticule.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class GeoGraticule {
  readonly grid = input.required<PlaneGrid>();
}
