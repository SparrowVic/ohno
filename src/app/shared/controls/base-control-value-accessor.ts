import { ControlValueAccessor } from '@angular/forms';
import { Directive, computed, signal } from '@angular/core';

@Directive()
export abstract class BaseControlValueAccessor<T> implements ControlValueAccessor {
  private readonly valueState = signal<T | null>(null);
  private readonly disabledState = signal(false);
  private readonly touchedState = signal(false);

  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  readonly value = this.valueState.asReadonly();
  readonly disabled = this.disabledState.asReadonly();
  readonly touched = this.touchedState.asReadonly();
  readonly hasValue = computed(() => this.value() !== null);

  writeValue(value: T | null): void {
    this.valueState.set(this.coerceValue(value));
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  protected coerceValue(value: T | null): T | null {
    return value;
  }

  protected setValue(value: T, emit = true): void {
    this.valueState.set(value);
    if (emit) {
      this.onChange(value);
    }
  }

  protected markAsTouched(): void {
    if (!this.touchedState()) {
      this.touchedState.set(true);
    }
    this.onTouched();
  }
}
