import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';
import { OhnoLed } from '../led/led';
import { LedColor } from '../led/led.types';
import { OhnoReadout } from '../readout/readout';
import { gaugeLeds } from './gauge.utils';

@Component({
  selector: 'ohno-gauge',
  imports: [OhnoEngraving, OhnoLed, OhnoReadout],
  templateUrl: './gauge.html',
  styleUrl: './gauge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoGauge {
  readonly label = input.required<string>();
  readonly count = input.required<number>();
  readonly lit = input.required<number>();
  readonly done = input(0);
  readonly litColor = input<LedColor>('signal');
  readonly doneColor = input<LedColor>('lime');

  protected readonly leds = computed(() => gaugeLeds(this.count(), this.lit(), this.done()));
}
