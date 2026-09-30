import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { KeySize, OhnoKey } from '../key/key';
import { LedColor } from '../led/led.types';

@Component({
  selector: 'ohno-latch',
  imports: [OhnoKey],
  templateUrl: './latch.html',
  styleUrl: './latch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoLatch {
  readonly label = input.required<string>();
  readonly led = input<LedColor>('signal');
  readonly pressed = input.required<boolean>();
  readonly disabled = input(false);
  readonly size = input<KeySize>('md');

  readonly pressedChange = output<boolean>();
}
