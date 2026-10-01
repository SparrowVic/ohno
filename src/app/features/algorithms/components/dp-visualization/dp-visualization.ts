import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { DpTraceState } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { prefersReducedMotion } from '../../utils/helpers/visualization-motion/visualization-motion';
import {
  DP_CELL_GAP,
  DpDisplayCell,
  DpDisplayHeader,
  dpColumnAxis,
  dpDisplayHeaders,
  dpDisplayRows,
  dpFocusCell,
  dpMaxValueLength,
  dpPrimaryRackMeta,
  dpPrimaryRows,
  dpReadouts,
  dpRowHeadChars,
  dpSecondaryRows,
  dpTableMetrics,
} from './dp-display.utils';

const HEADER_HEIGHT = 34;
const AXIS_HEIGHT = 12;
const META_HEIGHT = 12;
const CAPTION_MIN_HEIGHT = 44;
const SCROLL_MARGIN = 8;

interface DpDisplayRow {
  readonly header: DpDisplayHeader;
  readonly cells: readonly DpDisplayCell[];
}

@Component({
  selector: 'app-dp-visualization',
  imports: [I18nTextPipe, TranslocoPipe, OhnoLed, OhnoRack, OhnoRackRow],
  templateUrl: './dp-visualization.html',
  styleUrl: './dp-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpVisualization implements VisualizationRenderer {
  protected readonly DP = I18N_KEY.features.algorithms.display.dp;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly viewport = signal({ width: 0, height: 0 });

  protected readonly state = computed<DpTraceState | null>(() => this.step()?.dp ?? null);
  protected readonly axis = computed(() => {
    const state = this.state();
    return state ? dpColumnAxis(state) : { caption: null, columnMeta: false };
  });
  protected readonly columns = computed<readonly DpDisplayHeader[]>(() =>
    dpDisplayHeaders(this.state()?.colHeaders ?? [], this.axis().columnMeta),
  );
  protected readonly rows = computed<readonly DpDisplayRow[]>(() => {
    const state = this.state();
    if (!state) return [];
    const headers = dpDisplayHeaders(state.rowHeaders, true);
    const cells = dpDisplayRows(state, this.step()?.phase);
    return headers.map((header, index) => ({ header, cells: cells[index] ?? [] }));
  });
  protected readonly metrics = computed(() => {
    const state = this.state();
    const { width, height } = this.viewport();
    const axis = this.axis();
    return dpTableMetrics({
      width,
      height,
      cols: state?.colHeaders.length ?? 1,
      rows: state?.rowHeaders.length ?? 1,
      maxValueLength: state ? dpMaxValueLength(state) : 1,
      rowHeadChars: state ? dpRowHeadChars(state) : 4,
      headerHeight: HEADER_HEIGHT + (axis.caption ? AXIS_HEIGHT : 0) + (axis.columnMeta ? META_HEIGHT : 0),
    });
  });
  protected readonly gridColumns = computed(() => {
    const { rowHeadWidth, cellWidth } = this.metrics();
    return `${rowHeadWidth}px repeat(${this.columns().length}, ${cellWidth}px)`;
  });
  protected readonly showCaptions = computed(() => this.metrics().cellHeight >= CAPTION_MIN_HEIGHT);
  protected readonly primaryRows = computed(() => {
    const state = this.state();
    return state ? dpPrimaryRows(state) : [];
  });
  protected readonly secondaryRows = computed(() => {
    const state = this.state();
    return state ? dpSecondaryRows(state) : [];
  });
  protected readonly primaryMeta = computed(() => {
    const state = this.state();
    return state ? dpPrimaryRackMeta(state.mode) : null;
  });
  protected readonly readouts = computed(() => {
    const state = this.state();
    return state ? dpReadouts(state) : [];
  });
  protected readonly cellGap = DP_CELL_GAP;

  private readonly focusId = computed(() => dpFocusCell(this.state())?.id ?? null);

  constructor() {
    effect((onCleanup) => {
      const element = this.scrollerRef()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        this.viewport.set({ width, height });
      });
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    });

    effect(() => {
      const id = this.focusId();
      untracked(() => {
        if (id) requestAnimationFrame(() => this.revealCell(id));
      });
    });
  }

  initialize(_: readonly number[]): void {
    this.scrollerRef()?.nativeElement.scrollTo({ left: 0, top: 0 });
  }

  render(_: SortStep): void {
    const id = this.focusId();
    if (id) this.revealCell(id);
  }

  destroy(): void {
    this.viewport.set({ width: 0, height: 0 });
  }

  private revealCell(id: string): void {
    const scroller = this.scrollerRef()?.nativeElement;
    const cell = scroller?.querySelector<HTMLElement>(`[data-cell-id="${id}"]`);
    if (!scroller || !cell) return;
    const bounds = scroller.getBoundingClientRect();
    const box = cell.getBoundingClientRect();
    const { rowHeadWidth } = this.metrics();
    const head = scroller.querySelector<HTMLElement>('.dp__corner')?.offsetHeight ?? HEADER_HEIGHT;
    const left = deltaInto(box.left, box.right, bounds.left + rowHeadWidth + SCROLL_MARGIN, bounds.right - SCROLL_MARGIN);
    const top = deltaInto(box.top, box.bottom, bounds.top + head + SCROLL_MARGIN, bounds.bottom - SCROLL_MARGIN);
    if (left === 0 && top === 0) return;
    scroller.scrollBy({ left, top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

function deltaInto(start: number, end: number, min: number, max: number): number {
  if (start < min) return start - min;
  if (end > max) return Math.min(end - max, start - min);
  return 0;
}
