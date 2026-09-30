import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';

@Component({
  selector: 'ohno-rack',
  imports: [OhnoEngraving],
  templateUrl: './rack.html',
  styleUrl: './rack.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoRack {
  readonly title = input.required<string>();
  readonly meta = input<string | null>(null);
}
