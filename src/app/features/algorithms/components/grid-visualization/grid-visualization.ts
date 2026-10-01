import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { GridTraceState } from '../../models/grid';
import { SortStep } from '../../models/sort-step';
import {
  createMotionProfile,
  pulseElement,
} from '../../utils/helpers/visualization-motion/visualization-motion';
import {
  GRID_CELL_MAX,
  GRID_CELL_MAX_STACKED,
  GRID_HEADER_SIZE,
  GridDisplayCell,
  gridActiveCell,
  gridBoardMetrics,
  gridDecisionTone,
  gridDisplayCells,
  gridFrontierRows,
  gridPathRows,
  gridVisitRows,
} from './grid-display.utils';

const STACKED_QUERY = '(max-width: 1023px)';

interface GridDisplayRow {
  readonly index: number;
  readonly cells: readonly GridDisplayCell[];
}

@Component({
  selector: 'app-grid-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoRack, OhnoRackRow],
  templateUrl: './grid-visualization.html',
  styleUrl: './grid-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridVisualization {
  protected readonly I18N = I18N_KEY.features.algorithms.display.grid;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly areaRef = viewChild<ElementRef<HTMLElement>>('area');
  private readonly boardRef = viewChild<ElementRef<HTMLElement>>('board');
  private readonly areaSize = signal({ width: 0, height: 0 });
  private readonly stacked = signal(false);

  protected readonly state = computed<GridTraceState | null>(() => this.step()?.grid ?? null);
  protected readonly cells = computed(() => gridDisplayCells(this.state()));

  protected readonly rows = computed<readonly GridDisplayRow[]>(() => {
    const state = this.state();
    if (!state) return [];
    const cells = this.cells();
    return Array.from({ length: state.rows }, (_, index) => ({
      index,
      cells: cells.filter((cell) => cell.row === index),
    }));
  });

  protected readonly colIndices = computed(() =>
    Array.from({ length: this.state()?.cols ?? 0 }, (_, index) => index),
  );

  protected readonly metrics = computed(() => {
    const state = this.state();
    const { width, height } = this.areaSize();
    return gridBoardMetrics(
      width,
      this.stacked() ? Number.POSITIVE_INFINITY : height,
      state?.rows ?? 1,
      state?.cols ?? 1,
      this.stacked() ? GRID_CELL_MAX_STACKED : GRID_CELL_MAX,
    );
  });

  protected readonly boardColumns = computed(
    () => `${GRID_HEADER_SIZE}px repeat(${this.state()?.cols ?? 1}, ${this.metrics().cellSize}px)`,
  );

  protected readonly boardRows = computed(
    () => `${GRID_HEADER_SIZE}px repeat(${this.state()?.rows ?? 1}, ${this.metrics().cellSize}px)`,
  );

  protected readonly active = computed(() => gridActiveCell(this.state()));
  protected readonly pathRows = computed(() => gridPathRows(this.state()));
  protected readonly frontierRows = computed(() => gridFrontierRows(this.state()));
  protected readonly visitRows = computed(() => gridVisitRows(this.state()));
  protected readonly visitTotal = computed(() => this.state()?.visitOrder.length ?? 0);
  protected readonly decisionTone = computed(() => gridDecisionTone(this.step()?.phase, this.state()));

  private previousState: GridTraceState | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        const query = window.matchMedia(STACKED_QUERY);
        this.stacked.set(query.matches);
        const onChange = (event: MediaQueryListEvent): void => this.stacked.set(event.matches);
        query.addEventListener('change', onChange);
        destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
      }
      const element = this.areaRef()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        this.areaSize.set({ width, height });
      });
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    afterRenderEffect(() => {
      const current = this.state();
      const previous = this.previousState;
      this.previousState = current;
      if (current && previous && current !== previous) this.animateStep(previous, current);
    });
  }

  private animateStep(previous: GridTraceState, current: GridTraceState): void {
    const motion = createMotionProfile(this.speed());
    if (current.activeCellId && current.activeCellId !== previous.activeCellId) {
      this.pulse(current.activeCellId, motion.compareMs, 1.06);
    }
    const settled = new Set(
      previous.cells.filter((cell) => cell.status === 'filled' || cell.status === 'path').map((cell) => cell.id),
    );
    for (const cell of current.cells) {
      if ((cell.status === 'filled' || cell.status === 'path') && !settled.has(cell.id)) {
        this.pulse(cell.id, motion.settleMs, 1.04);
      }
    }
  }

  private pulse(cellId: string, duration: number, scale: number): void {
    const board = this.boardRef()?.nativeElement;
    const element = board?.querySelector<HTMLElement>(`[data-cell-id="${cellId}"]`);
    if (!element) return;
    const filter = getComputedStyle(element).filter || 'none';
    pulseElement(element, { duration, scale, filter: [filter, filter, filter] });
  }
}
