import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LegendItem } from '../../models/detail';

@Component({
  selector: 'app-legend-bar',
  imports: [],
  templateUrl: './legend-bar.html',
  styleUrl: './legend-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegendBar {
  readonly items = input.required<readonly LegendItem[]>();
}
