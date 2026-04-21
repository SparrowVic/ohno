import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';

import { I18N_KEY } from '../../../i18n/i18n-keys';
import { NavTab, NavTabId } from '../../../models/navigation';

export type NavbarTabDeckVariant = 'aura' | 'gooey' | 'fusion' | 'pill';

const PARTICLE_COLORS: Record<Exclude<NavbarTabDeckVariant, 'aura'>, readonly number[]> = {
  gooey: [1, 2, 3, 1, 2, 3, 1, 4],
  fusion: [1, 2, 1, 3, 4, 2, 1, 3],
  pill: [1, 2, 3, 1, 2, 4, 1, 3],
};

const PARTICLE_COUNT: Record<NavbarTabDeckVariant, number> = {
  aura: 0,
  gooey: 15,
  fusion: 10,
  pill: 5,
};

const PARTICLE_DISTANCES: Record<NavbarTabDeckVariant, readonly [number, number]> = {
  aura: [0, 0],
  gooey: [90, 10],
  fusion: [72, 14],
  pill: [54, 8],
};

const PARTICLE_RADIUS: Record<NavbarTabDeckVariant, number> = {
  aura: 0,
  gooey: 100,
  fusion: 72,
  pill: 56,
};

interface ParticleConfig {
  readonly start: readonly [number, number];
  readonly end: readonly [number, number];
  readonly time: number;
  readonly scale: number;
  readonly color: number;
  readonly rotate: number;
}

@Component({
  selector: 'app-navbar-tab-deck',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './navbar-tab-deck.html',
  styleUrl: './navbar-tab-deck.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarTabDeck {
  protected readonly I18N_KEY = I18N_KEY;
  readonly tabs = input.required<readonly NavTab[]>();
  readonly activeTabId = input.required<NavTabId>();
  readonly variant = input<NavbarTabDeckVariant>('fusion');

  readonly activeLabel = computed(
    () => this.tabs().find((tab) => tab.id === this.activeTabId())?.label ?? '',
  );

  private readonly destroyRef = inject(DestroyRef);
  private readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('container');
  private readonly filterRef = viewChild<ElementRef<HTMLSpanElement>>('filterEffect');
  private readonly textRef = viewChild<ElementRef<HTMLSpanElement>>('textEffect');
  private readonly tabRefs = viewChildren<ElementRef<HTMLLIElement>>('tabItem');
  private readonly timers = new Set<number>();

  constructor() {
    effect(() => {
      const container = this.containerRef()?.nativeElement;
      const filter = this.filterRef()?.nativeElement;
      const text = this.textRef()?.nativeElement;
      const items = this.tabRefs();
      this.tabs();
      const activeTabId = this.activeTabId();
      this.variant();
      if (!container || !filter || !text || items.length === 0) {
        return;
      }

      window.requestAnimationFrame(() => {
        this.syncEffectToTab(activeTabId, false);
      });
    });

    effect((onCleanup) => {
      const container = this.containerRef()?.nativeElement;
      const items = this.tabRefs().map((ref) => ref.nativeElement);
      if (!container || items.length === 0) {
        return;
      }

      const observer = new ResizeObserver(() => {
        this.syncEffectToTab(this.activeTabId(), false);
      });

      observer.observe(container);
      for (const item of items) {
        observer.observe(item);
      }

      onCleanup(() => observer.disconnect());
    });

    this.destroyRef.onDestroy(() => {
      this.clearParticles();
      this.clearTimers();
    });
  }

  handleActivate(tabId: NavTabId): void {
    if (tabId === this.activeTabId()) {
      return;
    }

    this.syncEffectToTab(tabId, true);
  }

  private syncEffectToTab(tabId: NavTabId, animate: boolean): void {
    const container = this.containerRef()?.nativeElement;
    const filter = this.filterRef()?.nativeElement;
    const text = this.textRef()?.nativeElement;
    const target = this.findTabElement(tabId);
    if (!container || !filter || !text || !target) {
      return;
    }

    this.updateEffectPosition(container, filter, target);
    this.updateEffectPosition(container, text, target);
    text.textContent = target.innerText.trim();

    if (!animate) {
      filter.classList.add('is-active');
      text.classList.add('is-active');
      return;
    }

    this.restartClass(filter, 'is-active');
    this.restartClass(text, 'is-active');

    const variant = this.variant();
    if (variant === 'aura') {
      return;
    }

    this.clearParticles();
    this.makeParticles(filter, variant);
  }

  private updateEffectPosition(
    container: HTMLElement,
    effect: HTMLElement,
    target: HTMLElement,
  ): void {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    effect.style.left = `${targetRect.left - containerRect.left}px`;
    effect.style.top = `${targetRect.top - containerRect.top}px`;
    effect.style.width = `${targetRect.width}px`;
    effect.style.height = `${targetRect.height}px`;
  }

  private restartClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  private findTabElement(tabId: NavTabId): HTMLElement | null {
    const index = this.tabs().findIndex((tab) => tab.id === tabId);
    return index >= 0 ? (this.tabRefs()[index]?.nativeElement ?? null) : null;
  }

  private clearParticles(): void {
    const filter = this.filterRef()?.nativeElement;
    if (!filter) {
      return;
    }

    for (const particle of filter.querySelectorAll('.tab-deck__particle')) {
      particle.remove();
    }
  }

  private clearTimers(): void {
    for (const timerId of this.timers) {
      window.clearTimeout(timerId);
    }
    this.timers.clear();
  }

  private makeParticles(
    container: HTMLElement,
    variant: Exclude<NavbarTabDeckVariant, 'aura'>,
  ): void {
    const particleCount = PARTICLE_COUNT[variant];
    const colors = PARTICLE_COLORS[variant];
    const distances = PARTICLE_DISTANCES[variant];
    const radius = PARTICLE_RADIUS[variant];
    const animationTime = variant === 'fusion' ? 520 : 600;
    const timeVariance = variant === 'fusion' ? 220 : 300;

    for (let index = 0; index < particleCount; index += 1) {
      const time = animationTime * 2 + this.noise(timeVariance * 2);
      const particle = this.createParticle(index, particleCount, time, distances, radius, colors);
      const timerId = window.setTimeout(() => {
        const particleElement = document.createElement('span');
        const pointElement = document.createElement('span');
        particleElement.classList.add('tab-deck__particle');
        pointElement.classList.add('tab-deck__point');

        particleElement.style.setProperty('--start-x', `${particle.start[0]}px`);
        particleElement.style.setProperty('--start-y', `${particle.start[1]}px`);
        particleElement.style.setProperty('--end-x', `${particle.end[0]}px`);
        particleElement.style.setProperty('--end-y', `${particle.end[1]}px`);
        particleElement.style.setProperty('--particle-time', `${particle.time}ms`);
        particleElement.style.setProperty('--particle-scale', `${particle.scale}`);
        particleElement.style.setProperty('--particle-color', `var(--nav-color-${particle.color})`);
        particleElement.style.setProperty('--particle-rotate', `${particle.rotate}deg`);

        particleElement.appendChild(pointElement);
        container.appendChild(particleElement);

        const cleanupId = window.setTimeout(() => {
          particleElement.remove();
          this.timers.delete(cleanupId);
        }, particle.time);
        this.timers.add(cleanupId);
        this.timers.delete(timerId);
      }, 24);

      this.timers.add(timerId);
    }
  }

  private createParticle(
    index: number,
    total: number,
    time: number,
    distances: readonly [number, number],
    radius: number,
    colors: readonly number[],
  ): ParticleConfig {
    const rotate = this.noise(radius / 10);
    return {
      start: this.getPoint(distances[0], total - index, total),
      end: this.getPoint(distances[1] + this.noise(7), total - index, total),
      time,
      scale: 1 + this.noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)] ?? 1,
      rotate: rotate > 0 ? (rotate + radius / 20) * 10 : (rotate - radius / 20) * 10,
    };
  }

  private getPoint(distance: number, index: number, total: number): readonly [number, number] {
    const angle = ((360 + this.noise(8)) / total) * index * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  }

  private noise(value = 1): number {
    return value / 2 - Math.random() * value;
  }
}
