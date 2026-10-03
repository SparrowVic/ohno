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
import { keepTapeFocusInView } from '../../utils/helpers/tape-layout/tape-scroll';
import { maxChars, tapeLayout } from '../../utils/helpers/tape-layout/tape-layout.utils';
import {
  SEARCH_CANDIDATE_LABELS,
  SEARCH_CANDIDATE_MARKS,
  SEARCH_CELL_OUTSET,
  SEARCH_RANGE_OUTSET,
  SEARCH_TAPE_METRICS,
  placeSearchCursors,
  placeSearchSpan,
  searchTapeView,
} from './search-display.utils';

const FALLBACK_WIDTH = 640;

@Component({
  selector: 'app-search-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoEngraving],
  templateUrl: './search-visualization.html',
  styleUrl: './search-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchVisualization {
  protected readonly SEARCH = I18N_KEY.features.algorithms.display.search;
  protected readonly CANDIDATE_LABELS = SEARCH_CANDIDATE_LABELS;
  protected readonly CANDIDATE_MARKS = SEARCH_CANDIDATE_MARKS;
  protected readonly METRICS = SEARCH_TAPE_METRICS;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly destroyRef = inject(DestroyRef);
  private readonly mainRef = viewChild<ElementRef<HTMLElement>>('main');
  private readonly trackRef = viewChild<ElementRef<HTMLElement>>('track');
  private readonly width = signal(0);
  private observer: ResizeObserver | null = null;

  protected readonly state = computed(() => this.step()?.search ?? null);
  protected readonly view = computed(() => {
    const state = this.state();
    return state ? searchTapeView(state) : null;
  });
  protected readonly layout = computed(() => {
    const cells = this.view()?.cells ?? [];
    return tapeLayout(
      cells.length,
      maxChars(cells.map((cell) => cell.value)),
      this.width() || FALLBACK_WIDTH,
      SEARCH_TAPE_METRICS,
    );
  });
  protected readonly range = computed(() => placeSearchSpan(this.view()?.range ?? null, this.layout(), SEARCH_RANGE_OUTSET));
  protected readonly hit = computed(() => placeSearchSpan(this.view()?.hit ?? null, this.layout(), SEARCH_CELL_OUTSET));
  protected readonly probe = computed(() => placeSearchSpan(this.view()?.probe ?? null, this.layout(), SEARCH_CELL_OUTSET));
  protected readonly cursors = computed(() => placeSearchCursors(this.view()?.cursors ?? [], this.layout()));

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
      this.layout();
      const track = this.trackRef()?.nativeElement;
      if (track) keepTapeFocusInView(track, track.querySelector<HTMLElement>('[data-focus="true"]'));
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
    });
  }
}
