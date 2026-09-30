import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OhnoEngraving } from '../engraving/engraving';

@Component({
  selector: 'ohno-brand',
  imports: [OhnoEngraving, RouterLink],
  templateUrl: './brand.html',
  styleUrl: './brand.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoBrand {
  readonly tagline = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly link = input<string | unknown[]>('/algorithms');
}
