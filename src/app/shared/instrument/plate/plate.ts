import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PlatePadding = 'none' | 'sm' | 'md';

@Component({
  selector: 'ohno-plate',
  templateUrl: './plate.html',
  styleUrl: './plate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-padding]': 'padding()',
  },
})
export class OhnoPlate {
  readonly screws = input(false);
  readonly padding = input<PlatePadding>('md');
}
