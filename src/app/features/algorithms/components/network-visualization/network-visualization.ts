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

import { NetworkEdgeSnapshot, NetworkNodeSnapshot, NetworkTraceState } from '../../models/network';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { createMotionProfile, pulseSvgElement } from '../../utils/visualization-motion';

@Component({
  selector: 'app-network-visualization',
  imports: [],
  templateUrl: './network-visualization.html',
  styleUrl: './network-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<NetworkTraceState | null>(() => this.step()?.network ?? null);
  readonly modeLabel = computed(() => this.state()?.modeLabel ?? 'Layered network');
  readonly phaseLabel = computed(() => this.state()?.phaseLabel ?? 'Initialize');
  readonly frontierLabel = computed(() => this.state()?.frontierLabel ?? 'Frontier');
  readonly frontierCount = computed(() => this.state()?.frontierCount ?? 0);
  readonly routeLabel = computed(() => this.state()?.activeRouteLabel ?? '—');
  readonly resultLabel = computed(() => this.state()?.resultLabel ?? '—');
  readonly focusItemsLabel = computed(() => this.state()?.focusItemsLabel ?? 'Focus');
  readonly focusItems = computed(() => this.state()?.focusItems ?? []);
  readonly statusLabel = computed(() => this.state()?.statusLabel ?? 'Awaiting step');
  readonly decisionLabel = computed(() => this.state()?.computation?.decision ?? 'Waiting for next network event.');
  readonly nodes = computed(() => this.state()?.nodes ?? []);
  readonly edges = computed(() => this.state()?.edges ?? []);
  readonly queueLabel = computed(() => this.state()?.queueLabel ?? 'Queue');
  readonly queuePreview = computed(() => {
    const queue = this.state()?.queue ?? [];
    return queue.length > 0 ? queue.join(' · ') : 'empty';
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
      if (edge.status !== 'augment' && edge.status !== 'matched' && edge.status !== 'flow') continue;
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

  node(nodeId: string): NetworkNodeSnapshot | undefined {
    return this.nodes().find((node) => node.id === nodeId);
  }

  private findSvgElement(selector: string): SVGElement | null {
    return this.containerRef().nativeElement.querySelector<SVGElement>(selector);
  }
}
