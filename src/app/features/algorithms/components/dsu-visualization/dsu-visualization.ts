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

import { DsuEdgeTrace, DsuGroupTrace, DsuNodeTrace, DsuTraceState } from '../../models/dsu';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { createMotionProfile, pulseElement } from '../../utils/visualization-motion/visualization-motion';

@Component({
  selector: 'app-dsu-visualization',
  imports: [],
  templateUrl: './dsu-visualization.html',
  styleUrl: './dsu-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<DsuTraceState | null>(() => this.step()?.dsu ?? null);
  readonly activeLabel = computed(() => this.state()?.activePairLabel ?? '—');
  readonly railLabel = computed(() => this.state()?.operationsLabel ?? 'Operation rail');
  readonly modeHint = computed(() => {
    const state = this.state();
    if (!state) return '—';
    return state.mode === 'union-find'
      ? 'Parent pointers + path compression'
      : 'Sorted edges + DSU cycle checks';
  });

  constructor() {
    effect(() => {
      const arr = this.array();
      if (!this.initialized) return;
      this.initialize(arr);
      untracked(() => {
        const step = this.step();
        if (step) this.render(step);
      });
    });

    effect(() => {
      const step = this.step();
      if (this.initialized && step) {
        this.render(step);
      }
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
    this.lastStep = null;
  }

  render(step: SortStep): void {
    const previous = this.lastStep;
    this.lastStep = step;
    queueMicrotask(() => this.animateStepEffects(previous, step));
  }

  destroy(): void {
    this.lastStep = null;
    this.initialized = false;
  }

  groups(): readonly DsuGroupTrace[] {
    return [...(this.state()?.groups ?? [])].sort((left, right) => {
      if (left.active !== right.active) return left.active ? -1 : 1;
      return left.rootLabel.localeCompare(right.rootLabel);
    });
  }

  nodesForGroup(group: DsuGroupTrace): readonly DsuNodeTrace[] {
    const traces = this.state()?.nodes ?? [];
    return traces
      .filter((node) => node.rootId === group.rootId)
      .sort((left, right) => left.label.localeCompare(right.label));
  }

  nodeRows(): readonly DsuNodeTrace[] {
    return [...(this.state()?.nodes ?? [])].sort((left, right) => left.label.localeCompare(right.label));
  }

  edgeRows(): readonly DsuEdgeTrace[] {
    return this.state()?.edges ?? [];
  }

  edgeLabel(edge: DsuEdgeTrace): string {
    const state = this.state();
    if (state?.mode === 'union-find') {
      if (edge.toLabel === 'find') {
        return `find ${edge.fromLabel}`;
      }
      return `union ${edge.fromLabel}-${edge.toLabel}`;
    }
    return `${edge.fromLabel}-${edge.toLabel}`;
  }

  nodeSubtitle(node: DsuNodeTrace): string {
    if (node.parentId === node.id) return 'root';
    return `parent ${node.parentLabel}`;
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.dsu;
    const previous = previousStep?.dsu ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());

    if (current.activePairLabel && current.activePairLabel !== previous?.activePairLabel) {
      for (const node of current.nodes.filter((item) => item.status === 'active' || item.status === 'query')) {
        const el = this.findElement(`[data-node-id="${node.id}"]`);
        if (!el) continue;
        pulseElement(el, {
          duration: motion.compareMs,
          scale: 1.025,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 8px rgba(240,180,41,0.14))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }

    const previousStatuses = new Map(previous?.nodes.map((node) => [node.id, node.status]) ?? []);
    for (const node of current.nodes) {
      const prior = previousStatuses.get(node.id);
      if (!prior || prior === node.status) continue;
      if (node.status !== 'merged' && node.status !== 'compressed') continue;
      const el = this.findElement(`[data-parent-id="${node.id}"]`);
      if (!el) continue;
      pulseElement(el, {
        duration: motion.settleMs,
        scale: 1.02,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 7px rgba(62,207,142,0.14))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }

    const previousEdges = new Map(previous?.edges.map((edge) => [edge.id, edge.status]) ?? []);
    for (const edge of current.edges) {
      const prior = previousEdges.get(edge.id);
      if (!prior || prior === edge.status) continue;
      const el = this.findElement(`[data-edge-id="${edge.id}"]`);
      if (!el) continue;
      pulseElement(el, {
        duration: motion.compareMs,
        scale: 1.015,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          edge.status === 'accepted'
            ? 'drop-shadow(0 0 8px rgba(62,207,142,0.14))'
            : 'drop-shadow(0 0 8px rgba(244,63,94,0.14))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private findElement(selector: string): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(selector);
  }
}
