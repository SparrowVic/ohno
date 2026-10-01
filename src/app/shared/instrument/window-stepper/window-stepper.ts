import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { OhnoEngraving } from '../engraving/engraving';
import { OhnoKey } from '../key/key';
import { OhnoReadout } from '../readout/readout';
import { OhnoScreen } from '../screen/screen';
import { stepOption } from './window-stepper.utils';

@Component({
  selector: 'ohno-window-stepper',
  imports: [OhnoEngraving, OhnoKey, OhnoReadout, OhnoScreen],
  templateUrl: './window-stepper.html',
  styleUrl: './window-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoWindowStepper {
  readonly options = input.required<readonly number[]>();
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly unitLabel = input<string | null>(null);
  readonly decreaseLabel = input.required<string>();
  readonly increaseLabel = input.required<string>();

  readonly valueChange = output<number>();

  protected readonly atStart = computed(() => stepOption(this.options(), this.value(), -1) === this.value());
  protected readonly atEnd = computed(() => stepOption(this.options(), this.value(), 1) === this.value());
  protected readonly minOption = computed(() => this.options()[0] ?? this.value());
  protected readonly maxOption = computed(() => this.options()[this.options().length - 1] ?? this.value());

  protected step(direction: -1 | 1, event?: Event): void {
    event?.preventDefault();
    const next = stepOption(this.options(), this.value(), direction);
    if (next !== this.value()) this.valueChange.emit(next);
  }
}
