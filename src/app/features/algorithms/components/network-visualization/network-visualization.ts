import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { NetworkEdgeSnapshot, NetworkNodeSnapshot, NetworkTraceState } from '../../models/network';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseSvgElement,
} from '../../utils/visualization-motion/visualization-motion';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

@Component({
  selector: 'app-network-visualization',
  imports: [TranslocoPipe, VizHeader, VizPanel],
  templateUrl: './network-visualization.html',
  styleUrl: './network-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<SVGSVGElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<NetworkTraceState | null>(() => this.step()?.network ?? null);
  readonly nodes = computed(() => this.state()?.nodes ?? []);
  readonly edges = computed(() => this.state()?.edges ?? []);

  private readonly modeLabel = computed(
    () =>
      this.state()?.modeLabel ??
      this.translate(I18N_KEY.features.algorithms.visualizations.network.modeFallback),
  );
  private readonly statusLabel = computed(
    () =>
      this.state()?.statusLabel ??
      this.translate(I18N_KEY.features.algorithms.visualizations.network.statusFallback),
  );
  private readonly decisionLabel = computed(() => this.state()?.computation?.decision ?? null);
  private readonly routeLabel = computed(() => this.state()?.activeRouteLabel ?? null);

  /** Mode tag — the algorithm family ("Max-flow", "Matching", …). Stays
   *  fixed across steps, so it reads as the viz's identity badge. */
  readonly phaseLabel = computed<TranslatableText>(() => this.modeLabel());

  /** Action sentence for the header. Priority:
   *    1. `computation.decision` — richest per-step fact.
   *    2. `activeRouteLabel`     — augmenting path under consideration.
   *    3. `statusLabel`          — generic state fallback. */
  readonly actionText = computed<TranslatableText>(() => {
    const decision = this.decisionLabel();
    if (decision) return decision;

    const route = this.routeLabel();
    if (route) return route;

    return this.statusLabel();
  });

  /** Tone derived from edge/node status flags — same convention as
   *  other viz headers:
   *    - augment / matched / flow → sorted (lime, locked in)
   *    - active                   → swap   (pink, acting now)
   *    - blocked                  → compare (cyan, attending)
   *    - current node             → compare
   *    - idle                     → default */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const state = this.state();
    if (!state) return 'default';

    const edges = state.edges;
    if (edges.some((edge) => edge.status === 'augment')) return 'sorted';
    if (edges.some((edge) => edge.status === 'matched' || edge.status === 'flow')) {
      return 'sorted';
    }
    if (edges.some((edge) => edge.status === 'active')) return 'swap';
    if (edges.some((edge) => edge.status === 'blocked')) return 'compare';

    const nodes = state.nodes;
    if (nodes.some((node) => node.status === 'current')) return 'compare';

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

  levelLabel(node: NetworkNodeSnapshot): string {
    if (this.state()?.mode === 'min-cost-max-flow') {
      return node.level === null ? 'C—' : `C${node.level}`;
    }
    return node.level === null ? 'L—' : `L${node.level}`;
  }

  linkLabel(node: NetworkNodeSnapshot): string {
    return node.linkLabel ?? '—';
  }

  edgeMidpoint(edge: NetworkEdgeSnapshot, axis: 'x' | 'y'): number {
    const from = this.node(edge.fromId);
    const to = this.node(edge.toId);
    if (!from || !to) return 0;
    return axis === 'x' ? (from.x + to.x) / 2 : (from.y + to.y) / 2;
  }

  edgeTransform(edge: NetworkEdgeSnapshot): string {
    return `translate(${this.edgeMidpoint(edge, 'x')} ${this.edgeMidpoint(edge, 'y')})`;
  }

  node(nodeId: string): NetworkNodeSnapshot | undefined {
    return this.nodes().find((node) => node.id === nodeId);
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.network;
    const previous = previousStep?.network ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());

    const previousCurrent = previous?.nodes.find((node) => node.status === 'current')?.id ?? null;
    const nextCurrent = current.nodes.find((node) => node.status === 'current')?.id ?? null;
    if (nextCurrent && nextCurrent !== previousCurrent) {
      const nodeEl = this.findSvgElement(`[data-node-id="${nextCurrent}"]`);
      if (nodeEl) {
        pulseSvgElement(nodeEl, {
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

    const previousEdges = new Map(previous?.edges.map((edge) => [edge.id, edge.status]) ?? []);
    for (const edge of current.edges) {
      const prior = previousEdges.get(edge.id);
      if (!prior || prior === edge.status) continue;
      if (edge.status !== 'augment' && edge.status !== 'matched' && edge.status !== 'flow')
        continue;
      const edgeEl = this.findSvgElement(`[data-edge-id="${edge.id}"]`);
      if (!edgeEl) continue;
      pulseSvgElement(edgeEl, {
        duration: motion.settleMs,
        scale: 1.015,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 8px rgba(62,207,142,0.14))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private findSvgElement(selector: string): SVGElement | null {
    return this.containerRef().nativeElement.querySelector<SVGElement>(selector);
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
