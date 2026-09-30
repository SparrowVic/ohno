import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { slotMarks, slotPercent } from './slot.utils';

@Component({
  selector: 'ohno-slot',
  templateUrl: './slot.html',
  styleUrl: './slot.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoSlot {
  readonly step = input.required<number>();
  readonly total = input.required<number>();
  readonly label = input.required<string>();
  readonly marks = input<readonly number[] | null>(null);

  readonly stepChange = output<number>();

  protected readonly percent = computed(() => `${slotPercent(this.step(), this.total())}%`);
  protected readonly markList = computed(() => this.marks() ?? slotMarks(this.total()));

  protected onInput(event: Event): void {
    this.stepChange.emit(Number((event.target as HTMLInputElement).value));
  }
}
