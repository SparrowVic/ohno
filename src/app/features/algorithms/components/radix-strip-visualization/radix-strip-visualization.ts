import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SortStep } from '../../models/sort-step';
import {
  createMotionProfile,
  prefersReducedMotion,
} from '../../utils/helpers/visualization-motion/visualization-motion';
import { radixPlaceLabel, radixState } from './radix-digits.utils';
import { RADIX_TAPE_METRICS, radixBinColumns, radixStripView, radixTapeLayout } from './radix-strip-display.utils';

const FALLBACK_WIDTH = 640;
const SCROLL_MARGIN = 8;

@Component({
  selector: 'app-radix-strip-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoEngraving],
  templateUrl: './radix-strip-visualization.html',
  styleUrl: './radix-strip-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadixStripVisualization {
  protected readonly RADIX = I18N_KEY.features.algorithms.display.radix;
  protected readonly TAPE = RADIX_TAPE_METRICS;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly destroyRef = inject(DestroyRef);
  private readonly mainRef = viewChild<ElementRef<HTMLElement>>('main');
  private readonly trackRef = viewChild<ElementRef<HTMLElement>>('track');
  private readonly binsRef = viewChild<ElementRef<HTMLElement>>('bins');
  private readonly width = signal(0);
  private observer: ResizeObserver | null = null;

  protected readonly state = computed(() => radixState(this.step(), this.array()));
  protected readonly view = computed(() => radixStripView(this.state()));
  protected readonly tape = computed(() =>
    radixTapeLayout(this.state().source.length, this.state().maxDigits, this.width() || FALLBACK_WIDTH),
  );
  protected readonly binColumns = computed(() =>
    radixBinColumns(this.width() || FALLBACK_WIDTH, this.state().maxDigits),
  );
  protected readonly place = computed(() => {
    const exponent = this.state().exponent;
    return exponent === null ? null : radixPlaceLabel(exponent);
  });
  protected readonly moveMs = computed(() => createMotionProfile(this.speed()).swapMs);

  constructor() {
    effect(() => {
      const main = this.mainRef()?.nativeElement;
      this.observer?.disconnect();
      this.observer = null;
      if (!main || typeof ResizeObserver === 'undefined') return;
      this.observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const width = Math.floor(entry.contentRect.width);
        if (width !== this.width()) this.width.set(width);
      });
      this.observer.observe(main);
    });

    afterRenderEffect(() => {
      this.view();
      this.tape();
      this.binColumns();
      const track = this.trackRef()?.nativeElement;
      if (track) centerHead(track, track.querySelector<HTMLElement>('[data-head="true"]'));
      const bins = this.binsRef()?.nativeElement;
      const fresh = bins?.querySelector<HTMLElement>('[data-fresh="true"]');
      if (fresh?.parentElement) {
        keepInView(fresh.parentElement, fresh);
      } else {
        bins?.querySelectorAll<HTMLElement>('.strip__stack').forEach((stack) => (stack.scrollTop = 0));
      }
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
    });
  }
}

function centerHead(track: HTMLElement, head: HTMLElement | null): void {
  if (track.scrollWidth <= track.clientWidth) return;
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (!head) {
    if (track.scrollLeft > 0) track.scrollTo({ left: 0, behavior });
    return;
  }
  const box = track.getBoundingClientRect();
  const rect = head.getBoundingClientRect();
  const offset = rect.left + rect.width / 2 - (box.left + box.width / 2);
  if (Math.abs(offset) >= 1) track.scrollTo({ left: track.scrollLeft + offset, behavior });
}

function keepInView(container: HTMLElement, target: HTMLElement): void {
  const box = container.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  if (rect.top < box.top + SCROLL_MARGIN) {
    container.scrollTop -= box.top + SCROLL_MARGIN - rect.top;
  } else if (rect.bottom > box.bottom - SCROLL_MARGIN) {
    container.scrollTop += rect.bottom - (box.bottom - SCROLL_MARGIN);
  }
}
