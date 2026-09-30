import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { OhnoKey } from '../key/key';
import { MenuItem } from './menu.types';
import { nextMenuIndex } from './menu.utils';

@Component({
  selector: 'ohno-menu',
  imports: [OhnoKey],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menu',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
    '(keydown.arrowdown)': 'move($event, 1)',
    '(keydown.arrowup)': 'move($event, -1)',
    '(keydown.enter)': 'choose($event)',
    '(keydown.space)': 'choose($event)',
    '(keydown.escape)': 'dismiss.emit()',
  },
})
export class OhnoMenu {
  readonly items = input.required<readonly MenuItem[]>();
  readonly activeId = input<string | null>(null);
  readonly label = input.required<string>();

  readonly select = output<string>();
  readonly dismiss = output<void>();

  protected readonly focusIndex = signal(-1);
  protected readonly activeIndex = computed(() => this.items().findIndex((item) => item.id === this.activeId()));

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.host.nativeElement.focus({ preventScroll: true }));
  }

  protected move(event: Event, direction: -1 | 1): void {
    event.preventDefault();
    const start = this.focusIndex() === -1 ? this.activeIndex() : this.focusIndex();
    this.focusIndex.set(nextMenuIndex(this.items(), start, direction));
  }

  protected choose(event: Event): void {
    event.preventDefault();
    const item = this.items()[this.focusIndex()];
    if (item && !item.disabled) this.select.emit(item.id);
  }

  protected pick(item: MenuItem): void {
    if (!item.disabled) this.select.emit(item.id);
  }
}
