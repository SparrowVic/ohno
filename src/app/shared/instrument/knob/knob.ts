import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { clampKnobValue, knobAngle, knobTicks, knobValueFromPointer } from './knob.utils';

@Component({
  selector: 'ohno-knob',
  templateUrl: './knob.html',
  styleUrl: './knob.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoKnob {
  readonly value = input.required<number>();
  readonly min = input(1);
  readonly max = input(10);
  readonly label = input.required<string>();
  readonly readout = input<string | null>(null);

  readonly valueChange = output<number>();

  protected readonly angle = computed(() => knobAngle(this.value(), this.min(), this.max()));
  protected readonly ticks = computed(() => knobTicks(this.min(), this.max()));
  protected readonly dragging = signal(false);

  private readonly rangeInput = viewChild.required<ElementRef<HTMLInputElement>>('rangeInput');
  private dragStartY = 0;
  private dragStartValue = 0;

  protected tickAngle(tick: number): string {
    return `${knobAngle(tick, this.min(), this.max())}deg`;
  }

  protected onInput(event: Event): void {
    const next = clampKnobValue(Number((event.target as HTMLInputElement).value), this.min(), this.max());
    this.valueChange.emit(next);
  }

  protected onPointerDown(event: PointerEvent): void {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.rangeInput().nativeElement.focus({ preventScroll: true });
    this.dragStartY = event.clientY;
    this.dragStartValue = this.value();
    this.dragging.set(true);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) return;
    const next = knobValueFromPointer(this.dragStartValue, this.dragStartY - event.clientY, this.min(), this.max());
    if (next !== this.value()) this.valueChange.emit(next);
  }

  protected onPointerUp(): void {
    this.dragging.set(false);
  }
}
