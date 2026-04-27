import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, type QueryParamsHandling } from '@angular/router';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

export type ButtonAccent = 'brand' | 'primary' | 'neutral' | 'warm' | 'danger' | 'custom';
export type ButtonAppearance = 'solid' | 'tonal' | 'soft' | 'outline' | 'ghost' | 'bloom';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  imports: [FaIconComponent, NgTemplateOutlet, RouterLink],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButton implements OnDestroy {
  readonly label = input<string | null>(null);
  readonly suffix = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly title = input<string | null>(null);
  readonly leftIcon = input<IconDefinition | null>(null);
  readonly rightIcon = input<IconDefinition | null>(null);
  readonly accent = input<ButtonAccent>('brand');
  readonly appearance = input<ButtonAppearance>('tonal');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false);
  readonly active = input(false);
  readonly pulse = input(false);
  readonly iconPopOnClick = input(true);
  readonly compact = input(false);
  readonly wide = input(false);
  readonly interactive = input(true);
  readonly customAccent = input<string | null>(null);
  readonly expanded = input<boolean | null>(null);
  readonly routerLink = input<string | unknown[] | null>(null);
  readonly queryParamsHandling = input<QueryParamsHandling | null>(null);

  readonly buttonClick = output<MouseEvent>();
  readonly buttonFocus = output<FocusEvent>();

  private readonly elementRef = viewChild<ElementRef<HTMLElement>>('buttonEl');
  private iconPopResetTimer: ReturnType<typeof setTimeout> | null = null;

  readonly iconPopActive = signal(false);
  readonly iconOnly = computed(
    () =>
      !this.label() && !this.suffix() && (this.leftIcon() !== null || this.rightIcon() !== null),
  );
  readonly titleText = computed(() => this.title() ?? this.ariaLabel() ?? this.label());

  element(): HTMLElement | null {
    return this.elementRef()?.nativeElement ?? null;
  }

  ngOnDestroy(): void {
    if (this.iconPopResetTimer !== null) {
      clearTimeout(this.iconPopResetTimer);
    }
  }

  onClick(event: MouseEvent): void {
    if (this.disabled() || !this.interactive()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.runIconPop();
    this.buttonClick.emit(event);
  }

  onFocus(event: FocusEvent): void {
    if (this.disabled() || !this.interactive()) return;
    this.buttonFocus.emit(event);
  }

  private runIconPop(): void {
    if (!this.iconPopOnClick()) return;

    this.iconPopActive.set(false);
    if (this.iconPopResetTimer !== null) {
      clearTimeout(this.iconPopResetTimer);
    }

    queueMicrotask(() => this.iconPopActive.set(true));
    this.iconPopResetTimer = setTimeout(() => this.iconPopActive.set(false), 520);
  }
}
