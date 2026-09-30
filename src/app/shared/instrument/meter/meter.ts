import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';
import { OhnoReadout } from '../readout/readout';

@Component({
  selector: 'ohno-meter',
  imports: [OhnoEngraving, OhnoReadout],
  templateUrl: './meter.html',
  styleUrl: './meter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ohno-meter--main]': 'main()',
  },
})
export class OhnoMeter {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly total = input<number | string | null>(null);
  readonly pad = input(0);
  readonly main = input(false);
}
