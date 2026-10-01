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
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { DsuTraceState } from '../../models/dsu';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  cancelElementAnimations,
  createMotionProfile,
  prefersReducedMotion,
  pulseElement,
} from '../../utils/helpers/visualization-motion/visualization-motion';
import {
  DsuGroupRow,
  dsuActivePairChanged,
  dsuComplete,
  dsuDecidedCount,
  dsuFocusOperationId,
  dsuGroupRows,
  dsuMovedNodeIds,
  dsuNoteTone,
  dsuOperationRows,
} from './dsu-display.utils';

interface ChipPosition {
  readonly left: number;
  readonly top: number;
}

const FLIP_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const NO_FILTER: readonly [string, string, string] = ['none', 'none', 'none'];

@Component({
  selector: 'app-dsu-visualization',
  imports: [I18nTextPipe, TranslocoPipe, OhnoRack, OhnoRackRow],
  templateUrl: './dsu-visualization.html',
  styleUrl: './dsu-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  protected readonly DSU = I18N_KEY.features.algorithms.display.dsu;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly groupsRef = viewChild<ElementRef<HTMLElement>>('groups');
  private readonly opsRef = viewChild<string, ElementRef<HTMLElement>>('ops', { read: ElementRef });

  private initialized = false;
  private lastState: DsuTraceState | null = null;
  private positions = new Map<string, ChipPosition>();

  protected readonly state = computed<DsuTraceState | null>(() => this.step()?.dsu ?? null);
  protected readonly rows = computed<readonly DsuGroupRow[]>(() => {
    const state = this.state();
    return state ? dsuGroupRows(state) : [];
  });
  protected readonly operations = computed(() => {
    const state = this.state();
    return state ? dsuOperationRows(state) : [];
  });
  protected readonly isKruskal = computed(() => this.state()?.mode === 'kruskal');
  protected readonly rackMeta = computed(() => {
    const state = this.state();
    return state ? `${dsuDecidedCount(state)}/${state.edges.length}` : null;
  });
  protected readonly complete = computed(() => {
    const state = this.state();
    return state ? dsuComplete(state) : false;
  });
  protected readonly noteTone = computed(() => {
    const state = this.state();
    return state ? dsuNoteTone(state) : 'slate';
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
    this.positions.clear();
  }

  render(step: SortStep): void {
    const previous = this.lastState;
    const current = step.dsu ?? null;
    this.lastState = current;
    queueMicrotask(() => this.afterStep(previous, current));
  }

  destroy(): void {
    this.lastState = null;
    this.positions.clear();
    this.initialized = false;
  }

  protected memberList(row: DsuGroupRow): string {
    return [row.root.label, ...row.members.map((chip) => chip.label)].join(', ');
  }

  private afterStep(previous: DsuTraceState | null, current: DsuTraceState | null): void {
    const host = this.groupsRef()?.nativeElement;
    if (!host || !current) {
      this.positions.clear();
      return;
    }

    const moved = new Set(dsuMovedNodeIds(previous, current));
    const next = this.measureChips(host);
    const reduced = prefersReducedMotion();
    const motion = createMotionProfile(this.speed());

    if (!reduced) {
      for (const id of moved) {
        const before = this.positions.get(id);
        const after = next.get(id);
        const chip = this.chipElement(host, id);
        if (!before || !after || !chip) continue;
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
        cancelElementAnimations(chip);
        chip.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
          { duration: motion.swapMs, easing: FLIP_EASING },
        );
      }

      if (moved.size === 0 && dsuActivePairChanged(previous, current)) {
        for (const node of current.nodes) {
          if (node.status !== 'active') continue;
          const chip = this.chipElement(host, node.id);
          if (chip) pulseElement(chip, { duration: motion.compareMs, scale: 1.06, filter: NO_FILTER });
        }
      }
    }

    this.positions = next;
    this.revealFocus(host, current);
  }

  private measureChips(host: HTMLElement): Map<string, ChipPosition> {
    const origin = host.getBoundingClientRect();
    const result = new Map<string, ChipPosition>();
    for (const chip of host.querySelectorAll<HTMLElement>('[data-node-id]')) {
      const rect = chip.getBoundingClientRect();
      const id = chip.dataset['nodeId'];
      if (!id) continue;
      result.set(id, {
        left: rect.left - origin.left + host.scrollLeft,
        top: rect.top - origin.top + host.scrollTop,
      });
    }
    return result;
  }

  private chipElement(host: HTMLElement, id: string): HTMLElement | null {
    return host.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(id)}"]`);
  }

  private revealFocus(host: HTMLElement, state: DsuTraceState): void {
    const activeRow = host.querySelector<HTMLElement>('.dsu__row[data-active="true"]');
    if (activeRow) this.scrollWithin(host, activeRow);

    const rack = this.opsRef()?.nativeElement;
    const focusId = dsuFocusOperationId(state);
    if (!rack || !focusId) return;
    const row = rack.querySelector<HTMLElement>(`[data-op-id="${CSS.escape(focusId)}"]`);
    if (row) this.scrollWithin(rack, row);
  }

  private scrollWithin(container: HTMLElement, target: HTMLElement): void {
    const box = container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const margin = 8;
    if (rect.top < box.top + margin) {
      container.scrollTop -= box.top + margin - rect.top;
    } else if (rect.bottom > box.bottom - margin) {
      container.scrollTop += rect.bottom - (box.bottom - margin);
    }
  }
}
