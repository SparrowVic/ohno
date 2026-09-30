import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type EngravingTone = 'default' | 'bright' | 'dim' | 'signal' | 'cyan' | 'pink' | 'lime' | 'amber';

@Component({
  selector: 'ohno-engraving',
  templateUrl: './engraving.html',
  styleUrl: './engraving.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
  },
})
export class OhnoEngraving {
  readonly tone = input<EngravingTone>('default');
}
