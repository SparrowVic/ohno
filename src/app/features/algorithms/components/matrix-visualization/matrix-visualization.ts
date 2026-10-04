import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { MatrixCellStatus, MatrixTraceState } from '../../models/matrix';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  prefersReducedMotion,
  pulseElement,
} from '../../utils/helpers/visualization-motion/visualization-motion';
import {
  MatrixBand,
  MatrixCellView,
  MatrixHeaderView,
  MatrixNote,
  MatrixRackRowView,
  matrixBands,
  matrixCellViews,
  matrixColHeaderViews,
  matrixCornerKey,
  matrixDensity,
  matrixNote,
  matrixRackMeta,
  matrixRackRows,
  matrixRackSpec,
  matrixRowHeaderViews,
} from './matrix-display.utils';

interface MatrixRackView {
  readonly title: TranslatableText;
  readonly meta: string | null;
  readonly rows: readonly MatrixRackRowView[];
}

interface MatrixRowView {
  readonly header: MatrixHeaderView;
  readonly cells: readonly MatrixCellView[];
}

const PULSE_STATUSES: ReadonlySet<MatrixCellStatus> = new Set(['active', 'improved', 'assignment']);
const NO_FILTER: readonly [string, string, string] = ['none', 'none', 'none'];

@Component({
  selector: 'app-matrix-visualization',
  imports: [I18nTextPipe, TranslocoPipe, OhnoRack, OhnoRackRow],
  templateUrl: './matrix-visualization.html',
  styleUrl: './matrix-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  protected readonly MATRIX = I18N_KEY.features.algorithms.display.matrix;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly scrollRef = viewChild<ElementRef<HTMLElement>>('scroll');

  private initialized = false;
  private lastState: MatrixTraceState | null = null;

  protected readonly state = computed<MatrixTraceState | null>(() => this.step()?.matrix ?? null);

  protected readonly columns = computed<readonly MatrixHeaderView[]>(() => {
    const state = this.state();
    return state ? matrixColHeaderViews(state) : [];
  });

  protected readonly rows = computed<readonly MatrixRowView[]>(() => {
    const state = this.state();
    if (!state) return [];
    const headers = matrixRowHeaderViews(state);
    const cells = matrixCellViews(state, this.step()?.phase === 'graph-complete');
    return headers.map((header) => ({
      header,
      cells: cells.filter((cell) => cell.row === header.index),
    }));
  });

  protected readonly bands = computed<readonly MatrixBand[]>(() => {
    const state = this.state();
    return state ? matrixBands(state) : [];
  });

  protected readonly cornerKey = computed(() => {
    const state = this.state();
    return state ? matrixCornerKey(state) : this.MATRIX.corner.dist;
  });

  protected readonly density = computed(() =>
    matrixDensity(Math.max(this.columns().length, this.rows().length)),
  );

  protected readonly gridColumns = computed(
    () => `auto repeat(${this.columns().length}, minmax(var(--cell-min), var(--cell-max)))`,
  );

  protected readonly racks = computed<readonly MatrixRackView[]>(() => {
    const state = this.state();
    if (!state) return [];
    const size = state.rowHeaders.length;
    return [
      this.rackView(state.focusItemsLabel, state.focusItems, size),
      this.rackView(state.secondaryItemsLabel, state.secondaryItems, size),
    ];
  });

  protected readonly note = computed<MatrixNote | null>(() => {
    const state = this.state();
    return state ? matrixNote(state) : null;
  });

  constructor() {
    effect(() => {
      const values = this.array();
      if (!this.initialized) return;
      this.initialize(values);
      untracked(() => {
        const step = this.step();
        if (step) this.render(step);
      });
    });

    effect(() => {
      const step = this.step();
      if (this.initialized && step) this.render(step);
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.initialize(this.array());
    const step = this.step();
    if (step) this.render(step);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initialize(_: readonly number[]): void {
    this.lastState = null;
  }

  render(step: SortStep): void {
    const previous = this.lastState;
    const current = step.matrix ?? null;
    this.lastState = current;
    queueMicrotask(() => this.afterStep(previous, current));
  }

  destroy(): void {
    this.lastState = null;
    this.initialized = false;
  }

  protected bandRow(band: MatrixBand): string {
    return band.axis === 'row' ? `${band.index + 2}` : `2 / span ${this.rows().length}`;
  }

  protected bandColumn(band: MatrixBand): string {
    return band.axis === 'col' ? `${band.index + 2}` : `2 / span ${this.columns().length}`;
  }

  private rackView(label: TranslatableText, items: readonly TranslatableText[], size: number): MatrixRackView {
    const spec = matrixRackSpec(label);
    return {
      title: spec.title,
      meta: matrixRackMeta(spec.kind, items, size),
      rows: matrixRackRows(items, spec.kind),
    };
  }

  private afterStep(previous: MatrixTraceState | null, current: MatrixTraceState | null): void {
    const host = this.scrollRef()?.nativeElement;
    if (!host || !current) return;

    const focus = host.querySelector<HTMLElement>('[data-current="true"]');
    if (focus) this.revealWithin(host, focus);

    if (!previous || prefersReducedMotion()) return;
    const motion = createMotionProfile(this.speed());
    const before = new Map(previous.cells.map((cell) => [cell.id, cell.status]));
    for (const cell of current.cells) {
      const prior = before.get(cell.id);
      if (!prior || prior === cell.status || !PULSE_STATUSES.has(cell.status)) continue;
      const element = host.querySelector<HTMLElement>(`[data-cell-id="${CSS.escape(cell.id)}"]`);
      if (!element) continue;
      pulseElement(element, {
        duration: cell.status === 'active' ? motion.compareMs : motion.settleMs,
        scale: 1.06,
        filter: NO_FILTER,
      });
    }
  }

  private revealWithin(container: HTMLElement, target: HTMLElement): void {
    const box = container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const margin = 8;
    if (rect.left < box.left + margin) container.scrollLeft -= box.left + margin - rect.left;
    else if (rect.right > box.right - margin)
      container.scrollLeft += rect.right - (box.right - margin);
    if (rect.top < box.top + margin) container.scrollTop -= box.top + margin - rect.top;
    else if (rect.bottom > box.bottom - margin)
      container.scrollTop += rect.bottom - (box.bottom - margin);
  }
}
