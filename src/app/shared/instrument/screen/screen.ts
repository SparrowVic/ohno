import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PlatePadding } from '../plate/plate';

@Component({
  selector: 'ohno-screen',
  templateUrl: './screen.html',
  styleUrl: './screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-padding]': 'padding()',
    '[class.ohno-screen--dots]': 'dots()',
  },
})
export class OhnoScreen {
  readonly dots = input(true);
  readonly padding = input<PlatePadding>('none');
}
