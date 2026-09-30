import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from '@angular/core';

@Component({
  selector: 'ohno-floating-plate',
  templateUrl: './floating-plate.html',
  styleUrl: './floating-plate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    '[attr.aria-label]': 'label()',
    '[class.ohno-floating-plate--open]': 'open()',
    '(document:keydown.escape)': 'onEscape()',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class OhnoFloatingPlate {
  readonly open = input.required<boolean>();
  readonly label = input.required<string>();

  readonly dismiss = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onEscape(): void {
    if (this.open()) this.dismiss.emit();
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!this.open()) return;
    const anchor = this.host.nativeElement.parentElement ?? this.host.nativeElement;
    if (anchor.contains(event.target as Node)) return;
    this.dismiss.emit();
  }
}
