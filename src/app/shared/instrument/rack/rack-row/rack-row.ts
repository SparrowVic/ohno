import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type RackRowTone = 'default' | 'head' | 'done' | 'now' | 'dim';

@Component({
  selector: 'ohno-rack-row',
  templateUrl: './rack-row.html',
  styleUrl: './rack-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
  },
})
export class OhnoRackRow {
  readonly tone = input<RackRowTone>('default');
}
