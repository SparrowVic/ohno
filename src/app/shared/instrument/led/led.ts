import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { LED_COLOR_RGB_TOKENS, LED_COLOR_TOKENS, LedColor } from './led.types';

@Component({
  selector: 'ohno-led',
  templateUrl: './led.html',
  styleUrl: './led.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ohno-led--on]': 'on()',
    '[class.ohno-led--pulse]': 'pulse()',
    '[class.ohno-led--sm]': "size() === 'sm'",
    '[style.--led-color]': 'colorToken()',
    '[style.--led-color-rgb]': 'colorRgbToken()',
    'aria-hidden': 'true',
  },
})
export class OhnoLed {
  readonly color = input<LedColor>('signal');
  readonly on = input(true);
  readonly pulse = input(false);
  readonly size = input<'sm' | 'md'>('md');

  protected readonly colorToken = computed(() => LED_COLOR_TOKENS[this.color()]);
  protected readonly colorRgbToken = computed(() => LED_COLOR_RGB_TOKENS[this.color()]);
}
