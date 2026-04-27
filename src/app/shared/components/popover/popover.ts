import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Shared floating panel primitive - the popover chrome used by the
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
  selector: 'app-popover',
  imports: [],
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Popover {
  readonly panelRole = input<string | null>('dialog');
  readonly close = output<void>();

  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly onAnyScroll = () => this.close.emit();

  constructor() {
    const options: AddEventListenerOptions = { capture: true, passive: true };
    const windowRef = this.documentRef.defaultView;

    this.documentRef.addEventListener('scroll', this.onAnyScroll, options);
    windowRef?.addEventListener('scroll', this.onAnyScroll, options);

    this.destroyRef.onDestroy(() => {
      this.documentRef.removeEventListener('scroll', this.onAnyScroll, options);
      windowRef?.removeEventListener('scroll', this.onAnyScroll, options);
    });
  }

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
