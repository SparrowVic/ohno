import {
  ChangeDetectionStrategy,
  Component,
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
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SortStep } from '../../models/sort-step';
import { StringTraceState } from '../../models/string';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { prefersReducedMotion } from '../../utils/helpers/visualization-motion/visualization-motion';
import { PlaybackController } from '../../workbench/playback-controller';
import { hasCompactRows, placeMarkers, stringDisplay, stringSourceLength } from './string-display.utils';
import { CELL_GAP, GRID_INSET, stringCellMetrics, stringGridLines } from './string-tape.utils';

const FALLBACK_WIDTH = 640;
const FALLBACK_TREE = { width: 520, height: 240 };
const SCROLL_MARGIN = 24;

@Component({
  selector: 'app-string-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoEngraving, OhnoLed, OhnoRack, OhnoRackRow],
  templateUrl: './string-visualization.html',
  styleUrl: './string-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringVisualization implements VisualizationRenderer {
  protected readonly STRING = I18N_KEY.features.algorithms.display.string;
  protected readonly gap = CELL_GAP;
  protected readonly inset = GRID_INSET;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly playback = inject(PlaybackController, { optional: true });
  private readonly tapesRef = viewChild<ElementRef<HTMLElement>>('tapes');
  private readonly treeRef = viewChild<ElementRef<HTMLElement>>('tree');
  private readonly rackRef = viewChild<ElementRef<HTMLElement>>('rack');
  private readonly width = signal(0);
  private readonly treeBox = signal(FALLBACK_TREE);

  protected readonly state = computed<StringTraceState | null>(() => this.step()?.string ?? null);
  protected readonly display = computed(() =>
    stringDisplay(this.state(), {
      step: this.step(),
      history: this.playback?.history() ?? [],
      treeBox: this.treeBox(),
    }),
  );
  protected readonly grid = computed(() => stringGridLines(this.display().rows));
  protected readonly metrics = computed(() =>
    stringCellMetrics(this.width() || FALLBACK_WIDTH, this.grid().columns, hasCompactRows(this.display().rows)),
  );
  protected readonly markers = computed(() => placeMarkers(this.display().markers, this.grid().body));
  protected readonly hasRack = computed(() => {
    const view = this.display();
    return view.racks.length > 0 || view.facts.length > 0 || view.notes.length > 0;
  });
  protected readonly length = computed(() => stringSourceLength(this.state()));
  protected readonly viewWidth = computed(() => Math.max(0, (this.width() || FALLBACK_WIDTH) - GRID_INSET * 2));

  constructor() {
    effect((onCleanup) => {
      const element = this.tapesRef()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const next = Math.floor(entry.contentRect.width);
        if (next !== this.width()) this.width.set(next);
      });
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    });

    effect((onCleanup) => {
      const element = this.treeRef()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        const current = this.treeBox();
        if (width > 0 && height > 0 && (width !== current.width || height !== current.height)) {
          this.treeBox.set({ width, height });
        }
      });
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    });

    afterRenderEffect(() => {
      this.display();
      this.markers();
      this.metrics();
      const tapes = this.tapesRef()?.nativeElement;
      if (tapes) keepInView(tapes, tapes.querySelector<HTMLElement>('[data-follow="true"]'));
      this.rackRef()
        ?.nativeElement.querySelectorAll<HTMLElement>('.ohno-rack__rows')
        .forEach((rows) => {
          const marked = rows.querySelectorAll<HTMLElement>('ohno-rack-row[data-tone="now"], ohno-rack-row[data-tone="head"]');
          const done = rows.querySelectorAll<HTMLElement>('ohno-rack-row[data-tone="done"]');
          const target = marked.item(0) ?? done.item(done.length - 1);
          if (target) keepInView(rows, target);
        });
    });
  }

  initialize(_: readonly number[]): void {
    this.tapesRef()?.nativeElement.scrollTo({ left: 0, top: 0 });
  }

  render(_: SortStep): void {
    const tapes = this.tapesRef()?.nativeElement;
    if (tapes) keepInView(tapes, tapes.querySelector<HTMLElement>('[data-follow="true"]'));
  }

  destroy(): void {
    this.width.set(0);
  }
}

function keepInView(container: HTMLElement, target: HTMLElement | null): void {
  if (!target) return;
  const box = container.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  let left = 0;
  let top = 0;
  if (rect.left < box.left + SCROLL_MARGIN) left = rect.left - box.left - SCROLL_MARGIN;
  else if (rect.right > box.right - SCROLL_MARGIN) left = rect.right - box.right + SCROLL_MARGIN;
  if (rect.top < box.top) top = rect.top - box.top - 4;
  else if (rect.bottom > box.bottom) top = rect.bottom - box.bottom + 4;
  if (left === 0 && top === 0) return;
  container.scrollBy({ left, top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
