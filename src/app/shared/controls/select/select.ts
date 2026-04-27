import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { BaseControlValueAccessor } from '../base-control-value-accessor';

export interface SelectOption<T extends string | number> {
  readonly value: T;
  readonly label: string;
  readonly hint?: string;
}

@Component({
  selector: 'app-select',
  imports: [],
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

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected override coerceValue(value: T | null): T | null {
    if (value === null) return null;
    return this.options().find((option) => Object.is(option.value, value))?.value ?? value;
  }

  toggleOpen(): void {
    if (this.disabled()) return;
    this.open.update((open) => !open);
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

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleOpen();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.open.set(true);
      this.markAsTouched();
    }
    if (event.key === 'Escape') {
      this.open.set(false);
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (!this.open()) return;
    const host = this.hostRef.nativeElement;
    if (!host.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
