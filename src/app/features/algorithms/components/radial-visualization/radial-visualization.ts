import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { animate } from 'animejs';

import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';

interface RadialNode {
  id: string;
  value: number;
  position: number;
  circle: SVGCircleElement;
  line: SVGLineElement;
  text: SVGTextElement;
}

type NodeState = 'default' | 'comparing' | 'swapping' | 'sorted';

const MIN_NODE_R = 4;
const MAX_NODE_R = 16;
const SWAP_DURATION = 300;
const HIDE_LABEL_THRESHOLD = 32;
const LINE_OPACITY = 0.1;

@Component({
  selector: 'app-radial-visualization',
  imports: [],
  templateUrl: './radial-visualization.html',
  styleUrl: './radial-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadialVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private ringEl: SVGCircleElement | null = null;
  private linesGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private nodesGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private labelsGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private nodes: RadialNode[] = [];
  private width = 0;
  private height = 0;
  private cx = 0;
  private cy = 0;
  private ringRadius = 0;
  private maxValue = 1;
  private initialized = false;
  private resizeObserver: ResizeObserver | null = null;
  private lastStep: SortStep | null = null;

  constructor() {
    effect(() => {
      const arr = this.array();
      if (!this.initialized) return;
      this.initialize(arr);
      untracked(() => {
        const s = this.step();
        if (s) this.render(s);
      });
    });

    effect(() => {
      const s = this.step();
      if (this.initialized && s) {
        this.render(s);
      }
    });
  }

  ngAfterViewInit(): void {
    const container = this.containerRef().nativeElement;
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    const ring = this.svg
      .append('circle')
      .attr('class', 'ring')
      .attr('fill', 'none')
      .attr('stroke', 'var(--text-primary)')
      .attr('stroke-opacity', 0.06)
      .attr('stroke-width', 1);
    this.ringEl = ring.node();

    this.linesGroup = this.svg.append('g').attr('class', 'lines');
    this.nodesGroup = this.svg.append('g').attr('class', 'nodes');
    this.labelsGroup = this.svg.append('g').attr('class', 'labels');

    this.measure();
    this.resizeObserver = new ResizeObserver(() => {
      this.measure();
      this.updateRing();
      this.layoutAll();
      if (this.lastStep) this.applyStates(this.lastStep);
    });
    this.resizeObserver.observe(container);
    this.initialized = true;
    this.initialize(this.array());
    const s = this.step();
    if (s) this.render(s);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initialize(array: readonly number[]): void {
    this.clearNodes();
    this.maxValue = Math.max(1, ...array);
    this.nodes = array.map((value, i) => this.createNode(`rn-${i}`, value, i));
    this.updateRing();
    this.layoutAll();
    this.lastStep = null;
  }

  render(step: SortStep): void {
    if (this.nodes.length !== step.array.length) {
      this.snapRebuild(step.array);
      this.lastStep = step;
      this.applyStates(step);
      return;
    }

    const needsSync = this.nodes.some((n) => n.value !== step.array[n.position]);

    if (needsSync) {
      if (!step.swapping || !this.tryAnimatedSwap(step)) {
        this.snapRebuild(step.array);
      }
    }

    this.lastStep = step;
    this.applyStates(step);
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.clearNodes();
    this.svg?.remove();
    this.svg = null;
    this.ringEl = null;
    this.linesGroup = null;
    this.nodesGroup = null;
    this.labelsGroup = null;
    this.initialized = false;
    this.lastStep = null;
  }

  private tryAnimatedSwap(step: SortStep): boolean {
    if (!step.swapping) return false;
    const [a, b] = step.swapping;
    const nodeA = this.nodes.find((n) => n.position === a);
    const nodeB = this.nodes.find((n) => n.position === b);
    if (!nodeA || !nodeB) return false;

    const expected = [...this.nodes.map((n) => n.value)];
    [expected[a], expected[b]] = [expected[b], expected[a]];
    if (!expected.every((v, i) => v === step.array[i])) return false;

    const fromA = this.angleFor(a);
    const fromB = this.angleFor(b);
    nodeA.position = b;
    nodeB.position = a;
    this.animateNodeAngle(nodeA, fromA, this.angleFor(b));
    this.animateNodeAngle(nodeB, fromB, this.angleFor(a));
    return true;
  }

  private snapRebuild(array: readonly number[]): void {
    this.clearNodes();
    this.maxValue = Math.max(1, ...array);
    this.nodes = array.map((value, i) => this.createNode(`rn-${i}`, value, i));
    this.updateRing();
    this.layoutAll();
  }

  private createNode(id: string, value: number, position: number): RadialNode {
    const line = this.linesGroup!
      .append('line')
      .attr('data-id', id)
      .attr('x1', this.cx)
      .attr('y1', this.cy)
      .attr('stroke', 'var(--text-primary)')
      .attr('stroke-opacity', LINE_OPACITY)
      .attr('stroke-width', 1);

    const circle = this.nodesGroup!
      .append('circle')
      .attr('data-id', id)
      .attr('r', this.nodeRadius(value))
      .attr('fill', 'var(--accent)')
      .attr('fill-opacity', 0.6)
      .attr('stroke', 'var(--accent)')
      .attr('stroke-opacity', 0.9)
      .attr('stroke-width', 1.5);

    const text = this.labelsGroup!
      .append('text')
      .attr('data-id', id)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 9)
      .attr('fill', 'var(--text-secondary)')
      .style('font-family', 'var(--font-mono)')
      .text(this.showLabels() ? String(value) : '');

    return {
      id,
      value,
      position,
      circle: circle.node() as SVGCircleElement,
      line: line.node() as SVGLineElement,
      text: text.node() as SVGTextElement,
    };
  }

  private clearNodes(): void {
    this.linesGroup?.selectAll('line').remove();
    this.nodesGroup?.selectAll('circle').remove();
    this.labelsGroup?.selectAll('text').remove();
    this.nodes = [];
  }

  private measure(): void {
    const rect = this.containerRef().nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.ringRadius = Math.min(this.width, this.height) * 0.4;
  }

  private updateRing(): void {
    if (!this.ringEl) return;
    this.ringEl.setAttribute('cx', String(this.cx));
    this.ringEl.setAttribute('cy', String(this.cy));
    this.ringEl.setAttribute('r', String(this.ringRadius));
  }

  private angleFor(position: number): number {
    const n = this.nodes.length || 1;
    return -Math.PI / 2 + (2 * Math.PI * position) / n;
  }

  private nodeRadius(value: number): number {
    const range = Math.max(1, this.maxValue - 1);
    return MIN_NODE_R + ((value - 1) / range) * (MAX_NODE_R - MIN_NODE_R);
  }

  private showLabels(): boolean {
    return this.nodes.length < HIDE_LABEL_THRESHOLD;
  }

  private layoutAll(): void {
    const show = this.showLabels();
    for (const node of this.nodes) {
      const angle = this.angleFor(node.position);
      const r = this.nodeRadius(node.value);
      const x = this.cx + Math.cos(angle) * this.ringRadius;
      const y = this.cy + Math.sin(angle) * this.ringRadius;

      node.circle.setAttribute('r', String(r));
      node.circle.setAttribute('cx', String(x));
      node.circle.setAttribute('cy', String(y));

      node.line.setAttribute('x1', String(this.cx));
      node.line.setAttribute('y1', String(this.cy));
      node.line.setAttribute('x2', String(x));
      node.line.setAttribute('y2', String(y));

      if (show) {
        const labelR = this.ringRadius + r + 12;
        node.text.setAttribute('x', String(this.cx + Math.cos(angle) * labelR));
        node.text.setAttribute('y', String(this.cy + Math.sin(angle) * labelR));
        node.text.textContent = String(node.value);
      } else {
        node.text.textContent = '';
      }
    }
  }

  private animateNodeAngle(node: RadialNode, fromAngle: number, toAngle: number): void {
    const cx = this.cx;
    const cy = this.cy;
    const ringRadius = this.ringRadius;
    const r = this.nodeRadius(node.value);
    const show = this.showLabels();
    const state = { a: fromAngle };
    const circle = node.circle;
    const line = node.line;
    const text = node.text;

    animate(state, {
      a: toAngle,
      duration: SWAP_DURATION,
      ease: 'inOutQuad',
      onUpdate: () => {
        const x = cx + Math.cos(state.a) * ringRadius;
        const y = cy + Math.sin(state.a) * ringRadius;
        circle.setAttribute('cx', String(x));
        circle.setAttribute('cy', String(y));
        line.setAttribute('x2', String(x));
        line.setAttribute('y2', String(y));
        if (show) {
          const labelR = ringRadius + r + 12;
          text.setAttribute('x', String(cx + Math.cos(state.a) * labelR));
          text.setAttribute('y', String(cy + Math.sin(state.a) * labelR));
        }
      },
      onComplete: () => {
        const x = cx + Math.cos(toAngle) * ringRadius;
        const y = cy + Math.sin(toAngle) * ringRadius;
        circle.setAttribute('cx', String(x));
        circle.setAttribute('cy', String(y));
        line.setAttribute('x2', String(x));
        line.setAttribute('y2', String(y));
        if (show) {
          const labelR = ringRadius + r + 12;
          text.setAttribute('x', String(cx + Math.cos(toAngle) * labelR));
          text.setAttribute('y', String(cy + Math.sin(toAngle) * labelR));
        }
      },
    });
  }

  private applyStates(step: SortStep): void {
    const stateFor = (pos: number): NodeState => {
      if (step.swapping && (step.swapping[0] === pos || step.swapping[1] === pos))
        return 'swapping';
      if (step.comparing && (step.comparing[0] === pos || step.comparing[1] === pos))
        return 'comparing';
      if (step.sorted.includes(pos)) return 'sorted';
      return 'default';
    };

    for (const node of this.nodes) {
      const state = stateFor(node.position);
      node.circle.setAttribute('data-state', state);
      switch (state) {
        case 'comparing':
          node.circle.setAttribute('fill', 'var(--compare-color)');
          node.circle.setAttribute('fill-opacity', '1');
          node.circle.setAttribute('stroke', 'var(--compare-color)');
          node.circle.setAttribute('stroke-opacity', '1');
          node.text.setAttribute('fill', 'var(--compare-color)');
          break;
        case 'swapping':
          node.circle.setAttribute('fill', 'var(--swap-color)');
          node.circle.setAttribute('fill-opacity', '1');
          node.circle.setAttribute('stroke', 'var(--swap-color)');
          node.circle.setAttribute('stroke-opacity', '1');
          node.text.setAttribute('fill', 'var(--swap-color)');
          break;
        case 'sorted':
          node.circle.setAttribute('fill', 'var(--sorted-color)');
          node.circle.setAttribute('fill-opacity', '1');
          node.circle.setAttribute('stroke', 'var(--sorted-color)');
          node.circle.setAttribute('stroke-opacity', '1');
          node.text.setAttribute('fill', 'var(--sorted-color)');
          break;
        default:
          node.circle.setAttribute('fill', 'var(--accent)');
          node.circle.setAttribute('fill-opacity', '0.6');
          node.circle.setAttribute('stroke', 'var(--accent)');
          node.circle.setAttribute('stroke-opacity', '0.9');
          node.text.setAttribute('fill', 'var(--text-secondary)');
      }
    }
  }
}
