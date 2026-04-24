import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  output,
} from '@angular/core';

/**
 * Shared floating panel primitive — the "popover" chrome used by the
 * customize-values form, the view-options menu and any future overlay
 * that needs the same visual language as the filter drop-downs on the
 * algorithms page.
 *
 * The component is purely presentational + behavioural:
 *   - renders the `floating-panel` mixin chrome (border, bg, shadow,
 *     grain, entrance animation)
 *   - closes on outside-click and Escape, emitting `close`
 *   - projects content so the caller decides what sits inside
 *
 * The parent owns the open/close state and positions the popover via
 * its own wrapper (so anchoring can differ case-by-case — below a
 * trigger, inside a side panel, centered, etc.).
 */
@Component({
  selector: 'app-lab-popover',
  imports: [],
  templateUrl: './lab-popover.html',
  styleUrl: './lab-popover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabPopover {
  readonly close = output<void>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.hostEl.contains(target)) return;
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close.emit();
  }

  onInnerClick(event: MouseEvent): void {
    // Swallow clicks inside the panel so they don't propagate to the
    // document listener above (which would close it). External close
    // triggers (explicit cancel button) should call `close.emit()`
    // directly from the caller instead.
    event.stopPropagation();
  }
}
