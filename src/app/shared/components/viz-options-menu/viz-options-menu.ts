import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../pipes/i18n-text.pipe';
import { TranslatableText } from '../../../core/i18n/translatable-text';

export interface VizOptionDefinition {
  readonly id: string;
  readonly label: TranslatableText;
  /** Optional short description shown below the label — keep it brief. */
  readonly description?: TranslatableText;
  readonly checked: boolean;
}

/**
 * Compact per-viz settings trigger. Renders a gear icon in a
 * top-right corner; clicking opens a popover anchored to the button
 * with a list of boolean checkboxes. Designed to live inside the
 * visualization header so each viz can expose its own view-mode
 * toggles without polluting the playback toolbar (speed / preset /
 * size already carry enough chrome there).
 *
 * State is held by the parent — the menu is controlled. On each
 * option flip we emit `optionChange` with the option id and the new
 * boolean value.
 */
@Component({
  selector: 'app-viz-options-menu',
  imports: [I18nTextPipe, TranslocoPipe],
  templateUrl: './viz-options-menu.html',
  styleUrl: './viz-options-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VizOptionsMenu implements OnDestroy {
  protected readonly I18N_KEY = I18N_KEY;
  readonly options = input.required<readonly VizOptionDefinition[]>();
  /** Panel heading — defaults to a generic "View options" i18n key. */
  readonly title = input<TranslatableText | null>(null);
  readonly optionChange = output<{ id: string; checked: boolean }>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly openState = signal(false);
  readonly isOpen = this.openState.asReadonly();

  readonly hasOptions = computed(() => this.options().length > 0);

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.openState.update((v) => !v);
  }

  close(): void {
    if (this.openState()) this.openState.set(false);
  }

  onOptionToggle(option: VizOptionDefinition, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.optionChange.emit({ id: option.id, checked: input.checked });
  }

  /* ---- Global listeners so clicking elsewhere / pressing Escape
     closes the popover — kept minimal, no overlay to avoid blocking
     interactions with the rest of the viz. ---- */

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.openState()) return;
    const target = event.target as Node;
    if (this.hostEl.contains(target)) return;
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close();
  }

  ngOnDestroy(): void {
    // Listeners attached via host binding auto-detach.
  }
}
