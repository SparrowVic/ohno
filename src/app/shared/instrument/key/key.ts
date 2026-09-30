import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, type QueryParamsHandling } from '@angular/router';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { OhnoKbd } from '../kbd/kbd';
import { OhnoLed } from '../led/led';
import { LedColor } from '../led/led.types';

export type KeyVariant = 'default' | 'in' | 'signal';
export type KeySize = 'sm' | 'md' | 'lg' | 'xl';
export type KeyMenuRole = 'menuitem' | 'menuitemradio';

@Component({
  selector: 'ohno-key',
  imports: [FaIconComponent, NgTemplateOutlet, OhnoKbd, OhnoLed, RouterLink],
  templateUrl: './key.html',
  styleUrl: './key.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoKey {
  readonly label = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly title = input<string | null>(null);
  readonly variant = input<KeyVariant>('default');
  readonly size = input<KeySize>('md');
  readonly icon = input<IconDefinition | null>(null);
  readonly led = input<LedColor | null>(null);
  readonly ledOn = input(true);
  readonly kbd = input<string | null>(null);
  readonly pressed = input<boolean | null>(null);
  readonly disabled = input(false);
  readonly menu = input(false);
  readonly expanded = input<boolean | null>(null);
  readonly menuRole = input<KeyMenuRole | null>(null);
  readonly checked = input<boolean | null>(null);
  readonly type = input<'button' | 'submit'>('button');
  readonly routerLink = input<string | unknown[] | null>(null);
  readonly queryParamsHandling = input<QueryParamsHandling | null>(null);
  readonly keyId = input<string | null>(null);
  readonly tabIndex = input<number | null>(null);

  readonly keyClick = output<MouseEvent>();

  protected readonly effectiveVariant = computed<KeyVariant>(() =>
    this.pressed() === true && this.variant() === 'default' ? 'in' : this.variant(),
  );
  protected readonly iconOnly = computed(() => this.label() === null && this.icon() !== null);
  protected readonly titleText = computed(() => this.title() ?? this.ariaLabel() ?? this.label());

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.keyClick.emit(event);
  }
}
