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
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { CallTreeLabTraceState } from '../../models/call-tree-lab';
import { SortStep } from '../../models/sort-step';
import { prefersReducedMotion } from '../../utils/helpers/visualization-motion/visualization-motion';
import {
  CALL_TREE_NODE_RADIUS,
  CallTreeMark,
  boardCells,
  boardPlacedCount,
  callTreePathRows,
  callTreeScene,
  followScroll,
} from './call-tree-display.utils';

const HALO_RADIUS = 20;
const VALUE_OFFSET = CALL_TREE_NODE_RADIUS + 17;
const MARK_OFFSET = CALL_TREE_NODE_RADIUS - 2;
const FOLLOW_MARGIN = 48;

interface PanState {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly scrollLeft: number;
  readonly scrollTop: number;
}

@Component({
  selector: 'app-call-tree-lab-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoRack, OhnoRackRow],
  templateUrl: './call-tree-lab-visualization.html',
  styleUrl: './call-tree-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallTreeLabVisualization {
  protected readonly CALL_TREE = I18N_KEY.features.algorithms.display.callTree;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;
  protected readonly NODE_RADIUS = CALL_TREE_NODE_RADIUS;
  protected readonly HALO_RADIUS = HALO_RADIUS;
  protected readonly VALUE_OFFSET = VALUE_OFFSET;
  protected readonly MARK_OFFSET = MARK_OFFSET;
  protected readonly MARK_GLYPHS: Readonly<Record<Exclude<CallTreeMark, null>, string>> = {
    cross: '×',
    check: '✓',
    undo: '↶',
  };

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly destroyRef = inject(DestroyRef);
  private readonly viewportRef = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly size = signal({ width: 0, height: 0 });
  private observer: ResizeObserver | null = null;
  private pan: PanState | null = null;

  protected readonly state = computed<CallTreeLabTraceState | null>(() => this.step()?.callTreeLab ?? null);
  protected readonly scene = computed(() => {
    const { width, height } = this.size();
    return callTreeScene(this.state(), width, height);
  });
  protected readonly pathRows = computed(() => callTreePathRows(this.state()));
  protected readonly board = computed(() => this.state()?.sidecar ?? null);
  protected readonly cells = computed(() => boardCells(this.board()));
  protected readonly placed = computed(() => boardPlacedCount(this.board()));
  protected readonly currentTitle = computed(() => {
    const state = this.state();
    const id = state?.activePath[state.activePath.length - 1];
    const node = id ? state?.nodes.find((entry) => entry.id === id) : undefined;
    return node ? node.title : '—';
  });

  constructor() {
    effect(() => {
      const viewport = this.viewportRef()?.nativeElement;
      this.observer?.disconnect();
      this.observer = null;
      if (!viewport || typeof ResizeObserver === 'undefined') return;
      this.observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        const current = this.size();
        if (width !== current.width || height !== current.height) this.size.set({ width, height });
      });
      this.observer.observe(viewport);
    });

    afterRenderEffect(() => {
      const focus = this.scene().focus;
      const scroller = this.scrollerRef()?.nativeElement;
      if (!focus || !scroller || this.pan) return;
      const target = followScroll(
        focus,
        { left: scroller.scrollLeft, top: scroller.scrollTop, width: scroller.clientWidth, height: scroller.clientHeight },
        FOLLOW_MARGIN,
      );
      if (target) scroller.scrollTo({ ...target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
    });
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const scroller = event.currentTarget as HTMLElement;
    if (scroller.scrollWidth <= scroller.clientWidth && scroller.scrollHeight <= scroller.clientHeight) return;
    this.pan = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    };
    scroller.setPointerCapture(event.pointerId);
    scroller.dataset['grabbing'] = 'true';
  }

  protected onPointerMove(event: PointerEvent): void {
    const pan = this.pan;
    if (!pan || pan.pointerId !== event.pointerId) return;
    const scroller = event.currentTarget as HTMLElement;
    scroller.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
    scroller.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
  }

  protected onPointerUp(event: PointerEvent): void {
    const pan = this.pan;
    if (!pan || pan.pointerId !== event.pointerId) return;
    const scroller = event.currentTarget as HTMLElement;
    scroller.releasePointerCapture(event.pointerId);
    delete scroller.dataset['grabbing'];
    this.pan = null;
  }
}
