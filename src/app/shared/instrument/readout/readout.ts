import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { formatReadout } from './readout.utils';

export type ReadoutSize = 'sm' | 'md' | 'lg' | 'xl' | 'marquee';
export type ReadoutTone = 'ink' | 'signal' | 'cyan' | 'lime' | 'pink' | 'amber' | 'dim';

@Component({
  selector: 'ohno-readout',
  templateUrl: './readout.html',
  styleUrl: './readout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
  },
})
export class OhnoReadout {
  readonly value = input.required<number | string>();
  readonly total = input<number | string | null>(null);
  readonly pad = input(0);
  readonly size = input<ReadoutSize>('md');
  readonly tone = input<ReadoutTone>('ink');

  protected readonly text = computed(() => formatReadout(this.value(), this.pad()));
  protected readonly totalText = computed(() => {
    const total = this.total();
    return total === null ? null : formatReadout(total, 0);
  });
}
