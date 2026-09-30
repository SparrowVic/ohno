import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';
import { OhnoLed } from '../led/led';
import { LedColor } from '../led/led.types';
import { OpLineRegister } from './opline.types';

@Component({
  selector: 'ohno-opline',
  imports: [OhnoEngraving, OhnoLed],
  templateUrl: './opline.html',
  styleUrl: './opline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
  },
})
export class OhnoOpLine {
  readonly phase = input.required<string>();
  readonly tone = input<LedColor>('cyan');
  readonly registers = input<readonly OpLineRegister[]>([]);
}
