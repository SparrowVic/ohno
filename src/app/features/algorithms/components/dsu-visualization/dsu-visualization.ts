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
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { DsuGroupTrace, DsuNodeTrace, DsuTraceState } from '../../models/dsu';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { createMotionProfile, pulseElement } from '../../utils/helpers/visualization-motion/visualization-motion';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.dsu;

@Component({
  selector: 'app-dsu-visualization',
  imports: [I18nTextPipe, TranslocoPipe, VizHeader, VizPanel],
  templateUrl: './dsu-visualization.html',
  styleUrl: './dsu-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  protected readonly I18N = I18N;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<DsuTraceState | null>(() => this.step()?.dsu ?? null);

  /** Algorithm tag — "Union-Find" or "Kruskal". Stays fixed for the
   *  run; the header's rail tone adds the step-level motion. */
  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  /** Action sentence. `decision` is the richest per-step fact; we
   *  fall back to the generic status label when nothing meaningful
   *  is decided yet. */
  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.decision ?? state.statusLabel ?? '';
  });

  /** Tone derived from edge/node statuses — mirrors the dsu-graph
   *  viz convention so both DSU views read as the same family. */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.state();
    if (!state) return 'default';

    const edges = state.edges;
    if (edges.some((edge) => edge.status === 'accepted')) return 'sorted';
    if (edges.some((edge) => edge.status === 'active')) return 'swap';

    const nodes = state.nodes;
    if (nodes.some((node) => node.status === 'merged' || node.status === 'compressed')) {
      return 'sorted';
    }
    if (nodes.some((node) => node.status === 'active' || node.status === 'query')) {
      return 'compare';
    }

    if (edges.some((edge) => edge.status === 'rejected')) return 'compare';
    return 'default';
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

  nodeSubtitle(node: DsuNodeTrace): TranslatableText {
    if (node.parentId === node.id) return I18N.nodeSubtitle.root;
    return i18nText(I18N.nodeSubtitle.parent, { label: node.parentLabel });
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.dsu;
    const previous = previousStep?.dsu ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());

    if (current.activePairLabel && current.activePairLabel !== previous?.activePairLabel) {
      for (const node of current.nodes.filter(
        (item) => item.status === 'active' || item.status === 'query',
      )) {
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

    const previousStatuses = new Map(
      previous?.nodes.map((node) => [node.id, node.status]) ?? [],
    );
    for (const node of current.nodes) {
      const prior = previousStatuses.get(node.id);
      if (!prior || prior === node.status) continue;
      if (node.status !== 'merged' && node.status !== 'compressed') continue;
      const el = this.findElement(`[data-node-id="${node.id}"]`);
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
  }

  private findElement(selector: string): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(selector);
  }
}
