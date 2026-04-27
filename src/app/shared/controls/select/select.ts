import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { PopoverCoordinator } from '../../components/popover/popover-coordinator';
import { Popover } from '../../components/popover/popover';
import { BaseControlValueAccessor } from '../base-control-value-accessor';

export interface SelectOption<T extends string | number> {
  readonly value: T;
  readonly label: string;
  readonly hint?: string;
}

@Component({
  selector: 'app-select',
  imports: [Popover],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
})
export class Select<
  T extends string | number = string | number,
> extends BaseControlValueAccessor<T> {
  readonly label = input.required<string>();
  readonly options = input<readonly SelectOption<T>[]>([]);
  readonly placeholder = input<string>('Select');
  readonly compact = input(false);
  readonly chrome = input(false);

  readonly open = signal(false);
  readonly selectedOption = computed(() => {
    const value = this.value();
    if (value === null) return null;
    return this.options().find((option) => Object.is(option.value, value)) ?? null;
  });

  private readonly destroyRef = inject(DestroyRef);
  private readonly popoverRegistration = inject(PopoverCoordinator).register(() => this.close());

  constructor() {
    super();
    this.destroyRef.onDestroy(() => this.popoverRegistration.unregister());
  }

  protected override coerceValue(value: T | null): T | null {
    if (value === null) return null;
    return this.options().find((option) => Object.is(option.value, value))?.value ?? value;
  }

  toggleOpen(event?: Event): void {
    event?.stopPropagation();
    if (this.disabled()) return;

    if (this.open()) {
      this.close();
    } else {
      this.openPopover();
    }

    this.markAsTouched();
  }

  close(): void {
    this.open.set(false);
  }

  selectOption(option: SelectOption<T>): void {
    if (this.disabled()) return;
    this.setValue(option.value);
    this.markAsTouched();
    this.open.set(false);
  }

  onTriggerFocus(): void {
    if (this.disabled()) return;
    this.popoverRegistration.activate();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleOpen();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.openPopover();
      this.markAsTouched();
    }
    if (event.key === 'Escape') {
      this.open.set(false);
    }
  }

  private openPopover(): void {
    this.popoverRegistration.activate();
    this.open.set(true);
  }
}
