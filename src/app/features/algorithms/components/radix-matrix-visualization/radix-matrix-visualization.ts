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
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow, RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SortStep } from '../../models/sort-step';
import { createMotionProfile } from '../../utils/helpers/visualization-motion/visualization-motion';
import { RadixBinTone, radixPlaceLabel, radixState } from '../radix-strip-visualization/radix-digits.utils';
import {
  RADIX_MATRIX_METRICS,
  radixMatrixGroups,
  radixMatrixLayout,
  radixMatrixView,
} from './radix-matrix-display.utils';

interface AreaSize {
  readonly width: number;
  readonly height: number;
}

const FALLBACK_SIZE: AreaSize = { width: 600, height: 380 };
const SCROLL_MARGIN = 6;

const BIN_ROW_TONES: Readonly<Record<RadixBinTone, RackRowTone>> = {
  idle: 'default',
  empty: 'dim',
  cyan: 'head',
  pink: 'default',
};

@Component({
  selector: 'app-radix-matrix-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoRack, OhnoRackRow],
  templateUrl: './radix-matrix-visualization.html',
  styleUrl: './radix-matrix-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadixMatrixVisualization {
  protected readonly RADIX = I18N_KEY.features.algorithms.display.radix;
  protected readonly MATRIX = I18N_KEY.features.algorithms.display.radixMatrix;
  protected readonly METRICS = RADIX_MATRIX_METRICS;
  protected readonly BIN_ROW_TONES = BIN_ROW_TONES;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly destroyRef = inject(DestroyRef);
  private readonly mainRef = viewChild<ElementRef<HTMLElement>>('main');
  private readonly rackRef = viewChild<ElementRef<HTMLElement>>('rack');
  private readonly size = signal<AreaSize>({ width: 0, height: 0 });
  private observer: ResizeObserver | null = null;

  protected readonly state = computed(() => radixState(this.step(), this.array()));
  protected readonly view = computed(() => radixMatrixView(this.state()));
  protected readonly layout = computed(() => {
    const measured = this.size();
    const area = measured.width > 0 && measured.height > 0 ? measured : FALLBACK_SIZE;
    return radixMatrixLayout(this.state().source.length, this.state().maxDigits, area.width, area.height);
  });
  protected readonly groups = computed(() => radixMatrixGroups(this.view().rows, this.layout().rowsPerGroup));
  protected readonly columnsTemplate = computed(() => {
    const { index, side } = RADIX_MATRIX_METRICS;
    return `${index}px repeat(${this.state().maxDigits}, ${this.layout().cell}px) ${side}px ${side}px`;
  });
  protected readonly rowsTemplate = computed(() => {
    const { caption, head } = RADIX_MATRIX_METRICS;
    const { row, rowsPerGroup } = this.layout();
    return `${caption}px ${head}px repeat(${rowsPerGroup}, ${row}px)`;
  });
  protected readonly bucketColumn = computed(() => this.state().maxDigits + 2);
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
        const height = Math.floor(entry.contentRect.height);
        const current = this.size();
        if (current.width !== width || current.height !== height) this.size.set({ width, height });
      });
      this.observer.observe(main);
    });

    afterRenderEffect(() => {
      this.view();
      this.layout();
      const main = this.mainRef()?.nativeElement;
      const scroller = main?.querySelector<HTMLElement>('.matrix__scroller');
      const lane = scroller?.querySelector<HTMLElement>('.matrix__lane');
      if (scroller && lane) keepInView(scroller, lane, RADIX_MATRIX_METRICS.caption + RADIX_MATRIX_METRICS.head);
      const rack = this.rackRef()?.nativeElement;
      const bin = rack?.querySelector<HTMLElement>('[data-bin-tone="cyan"], [data-bin-tone="pink"]');
      const holder = rack && bin ? scrollingAncestor(bin, rack) : null;
      if (holder && bin) keepInView(holder, bin, 0);
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
    });
  }
}

function scrollingAncestor(target: HTMLElement, boundary: HTMLElement): HTMLElement | null {
  for (let node = target.parentElement; node; node = node.parentElement) {
    const scrollable = /(auto|scroll)/.test(getComputedStyle(node).overflowY);
    if (scrollable && node.scrollHeight > node.clientHeight + 1) return node;
    if (node === boundary) return null;
  }
  return null;
}

function keepInView(container: HTMLElement, target: HTMLElement, stickyTop: number): void {
  const box = container.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  const top = box.top + stickyTop + SCROLL_MARGIN;
  if (rect.top < top) {
    container.scrollTop -= top - rect.top;
  } else if (rect.bottom > box.bottom - SCROLL_MARGIN) {
    container.scrollTop += rect.bottom - (box.bottom - SCROLL_MARGIN);
  }
}
