import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';

import { formatReadout } from '../readout/readout.utils';
import { TapeRow } from './tape.types';
import { currentTapeIndex } from './tape.utils';

@Component({
  selector: 'ohno-tape',
  templateUrl: './tape.html',
  styleUrl: './tape.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoTape {
  readonly rows = input.required<readonly TapeRow[]>();
  readonly stepHeader = input.required<string>();
  readonly eventHeader = input.required<string>();
  readonly emptyLabel = input.required<string>();

  protected readonly currentIndex = computed(() => currentTapeIndex(this.rows()));
  private readonly paper = viewChild.required<ElementRef<HTMLElement>>('paper');

  constructor() {
    effect(() => {
      const index = this.currentIndex();
      const rowElement = this.paper().nativeElement.querySelector<HTMLElement>(`[data-row="${index}"]`);
      rowElement?.scrollIntoView({ block: 'nearest' });
    });
  }

  protected stepText(row: TapeRow): string {
    return formatReadout(row.step, 3);
  }

  protected toneToken(row: TapeRow): string {
    return `var(--${row.tone})`;
  }
}
