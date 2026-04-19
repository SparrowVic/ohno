import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { BaseControlValueAccessor } from '../base-control-value-accessor';

export interface LabMultiSelectOption<T extends string | number> {
  readonly value: T;
  readonly label: string;
  readonly hint?: string;
  readonly count?: number | string;
  readonly disabled?: boolean;
}

export interface LabMultiSelectGroup<T extends string | number> {
  readonly id: string;
  readonly label: string;
  readonly options: readonly LabMultiSelectOption<T>[];
}

@Component({
  selector: 'app-lab-multi-select',
  imports: [],
  templateUrl: './lab-multi-select.html',
  styleUrl: './lab-multi-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabMultiSelect),
      multi: true,
    },
  ],
})
export class LabMultiSelect<
  T extends string | number = string | number,
> extends BaseControlValueAccessor<readonly T[]> {
  readonly label = input.required<string>();
  readonly ariaLabel = input<string>('');
  readonly summary = input<string>('');
  readonly placeholder = input<string>('Select options');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly emptyLabel = input<string>('No options available.');
  readonly clearLabel = input<string>('Clear');
  readonly columns = input<number>(2);
  readonly groups = input<readonly LabMultiSelectGroup<T>[]>([]);
  readonly valueInput = input<readonly T[]>([], { alias: 'value' });
  readonly valueChange = output<readonly T[]>();

  readonly open = signal(false);
  readonly selectedValues = computed(() => this.value() ?? []);
  readonly selectionCount = computed(() => this.selectedValues().length);
  readonly triggerValue = computed(() => {
    if (this.summary().trim().length > 0) {
      return this.summary();
    }

    return this.selectionCount() > 0 ? `${this.selectionCount()} selected` : this.placeholder();
  });
  readonly allOptions = computed(() => this.groups().flatMap((group) => group.options));
  readonly selectedSet = computed(() => new Set(this.selectedValues()));

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    super();

    effect(
      () => {
        this.writeValue(this.valueInput());
      },
      { allowSignalWrites: true },
    );
  }

  protected override coerceValue(value: readonly T[] | null): readonly T[] {
    if (!value || value.length === 0) {
      return [];
    }

    const allowed = new Set(this.allOptions().map((option) => option.value));
    const next: T[] = [];

    for (const entry of value) {
      if (!allowed.has(entry) || next.includes(entry)) {
        continue;
      }

      next.push(entry);
    }

    return next;
  }

  toggleOpen(): void {
    if (this.disabled()) {
      return;
    }

    this.open.update((open) => !open);
    this.markAsTouched();
  }

  close(): void {
    this.open.set(false);
  }

  toggleOption(option: LabMultiSelectOption<T>): void {
    if (this.disabled() || option.disabled) {
      return;
    }

    const selected = new Set(this.selectedValues());

    if (selected.has(option.value)) {
      selected.delete(option.value);
    } else {
      selected.add(option.value);
    }

    const next = this.allOptions()
      .map((entry) => entry.value)
      .filter((value) => selected.has(value));

    this.setValue(next);
    this.valueChange.emit(next);
    this.markAsTouched();
  }

  clear(): void {
    if (this.disabled() || this.selectionCount() === 0) {
      return;
    }

    this.setValue([]);
    this.valueChange.emit([]);
    this.open.set(false);
    this.markAsTouched();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

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

  isSelected(value: T): boolean {
    return this.selectedSet().has(value);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (!this.open()) {
      return;
    }

    const host = this.hostRef.nativeElement;
    if (!host.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.open.set(false);
  }
}
