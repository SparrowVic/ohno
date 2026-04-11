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

interface Dot {
  id: string;
  value: number;
  position: number;
  circle: SVGCircleElement;
}

type DotState = 'default' | 'comparing' | 'swapping' | 'sorted';

const SWAP_DURATION = 200;
const DOT_RADIUS_LARGE = 6;
const DOT_RADIUS_SMALL = 4;
const SMALL_THRESHOLD = 32;
const PADDING_X = 24;
const PADDING_Y = 28;
const GRID_STEPS = 5;

@Component({
  selector: 'app-dot-plot-visualization',
  imports: [],
  templateUrl: './dot-plot-visualization.html',
  styleUrl: './dot-plot-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DotPlotVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private gridGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private dotsGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private dots: Dot[] = [];
  private width = 0;
  private height = 0;
  private xScale: d3.ScaleLinear<number, number> = d3.scaleLinear();
  private yScale: d3.ScaleLinear<number, number> = d3.scaleLinear();
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
    this.gridGroup = this.svg.append('g').attr('class', 'grid');
    this.dotsGroup = this.svg.append('g').attr('class', 'dots');

    this.measure();
    this.resizeObserver = new ResizeObserver(() => {
      this.measure();
      this.rebuildScales();
      this.drawGrid();
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
    this.clearDots();
    this.maxValue = Math.max(1, ...array);
    this.dots = array.map((value, i) => this.createDot(`dp-${i}`, value, i));
    this.rebuildScales();
    this.drawGrid();
    this.layoutAll();
    this.lastStep = null;
  }

  render(step: SortStep): void {
    if (this.dots.length !== step.array.length) {
      this.snapRebuild(step.array);
      this.lastStep = step;
      this.applyStates(step);
      return;
    }

    const needsSync = this.dots.some((d) => d.value !== step.array[d.position]);

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
    this.clearDots();
    this.svg?.remove();
    this.svg = null;
    this.gridGroup = null;
    this.dotsGroup = null;
    this.initialized = false;
    this.lastStep = null;
  }

  private tryAnimatedSwap(step: SortStep): boolean {
    if (!step.swapping) return false;
    const [a, b] = step.swapping;
    const dotA = this.dots.find((d) => d.position === a);
    const dotB = this.dots.find((d) => d.position === b);
    if (!dotA || !dotB) return false;

    const expected = [...this.dots.map((d) => d.value)];
    [expected[a], expected[b]] = [expected[b], expected[a]];
    if (!expected.every((v, i) => v === step.array[i])) return false;

    dotA.position = b;
    dotB.position = a;
    this.animateDotCx(dotA, a, b);
    this.animateDotCx(dotB, b, a);
    return true;
  }

  private snapRebuild(array: readonly number[]): void {
    this.clearDots();
    this.maxValue = Math.max(this.maxValue, ...array);
    this.dots = array.map((value, i) => this.createDot(`dp-${i}`, value, i));
    this.rebuildScales();
    this.drawGrid();
    this.layoutAll();
  }

  private createDot(id: string, value: number, position: number): Dot {
    if (!this.dotsGroup) {
      throw new Error('dots group not initialized');
    }
    const circle = this.dotsGroup
      .append('circle')
      .attr('data-id', id)
      .attr('r', this.radius())
      .attr('fill', 'var(--accent)')
      .attr('fill-opacity', 0.6)
      .attr('stroke', 'var(--accent)')
      .attr('stroke-opacity', 0.9)
      .attr('stroke-width', 1.5);
    return {
      id,
      value,
      position,
      circle: circle.node() as SVGCircleElement,
    };
  }

  private clearDots(): void {
    if (this.dotsGroup) {
      this.dotsGroup.selectAll('circle').remove();
    }
    this.dots = [];
  }

  private measure(): void {
    const rect = this.containerRef().nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
  }

  private rebuildScales(): void {
    const count = Math.max(1, this.dots.length || 1);
    this.xScale = d3
      .scaleLinear()
      .domain([0, count - 1])
      .range([PADDING_X, Math.max(PADDING_X, this.width - PADDING_X)]);
    this.yScale = d3
      .scaleLinear()
      .domain([0, this.maxValue])
      .range([Math.max(PADDING_Y, this.height - PADDING_Y), PADDING_Y]);
  }

  private drawGrid(): void {
    if (!this.gridGroup) return;
    this.gridGroup.selectAll('*').remove();

    const x0 = PADDING_X;
    const x1 = Math.max(PADDING_X, this.width - PADDING_X);
    const y0 = PADDING_Y;
    const y1 = Math.max(PADDING_Y, this.height - PADDING_Y);

    for (let i = 0; i <= GRID_STEPS; i++) {
      const t = i / GRID_STEPS;
      const y = y1 - (y1 - y0) * t;
      this.gridGroup
        .append('line')
        .attr('x1', x0)
        .attr('x2', x1)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', 'var(--text-primary)')
        .attr('stroke-opacity', 0.1);
    }
    for (let i = 0; i <= GRID_STEPS; i++) {
      const t = i / GRID_STEPS;
      const x = x0 + (x1 - x0) * t;
      this.gridGroup
        .append('line')
        .attr('y1', y0)
        .attr('y2', y1)
        .attr('x1', x)
        .attr('x2', x)
        .attr('stroke', 'var(--text-primary)')
        .attr('stroke-opacity', 0.1);
    }
  }

  private radius(): number {
    return this.dots.length >= SMALL_THRESHOLD ? DOT_RADIUS_SMALL : DOT_RADIUS_LARGE;
  }

  private layoutAll(): void {
    const r = this.radius();
    for (const dot of this.dots) {
      dot.circle.setAttribute('r', String(r));
      dot.circle.setAttribute('cx', String(this.xScale(dot.position)));
      dot.circle.setAttribute('cy', String(this.yScale(dot.value)));
    }
  }

  private animateDotCx(dot: Dot, fromPos: number, toPos: number): void {
    const fromX = this.xScale(fromPos);
    const toX = this.xScale(toPos);
    const cy = this.yScale(dot.value);
    dot.circle.setAttribute('cx', String(fromX));
    dot.circle.setAttribute('cy', String(cy));
    const state = { x: fromX };
    const target = dot.circle;
    animate(state, {
      x: toX,
      duration: SWAP_DURATION,
      ease: 'inOutQuad',
      onUpdate: () => {
        target.setAttribute('cx', String(state.x));
      },
      onComplete: () => {
        target.setAttribute('cx', String(toX));
      },
    });
  }

  private applyStates(step: SortStep): void {
    const stateFor = (pos: number): DotState => {
      if (step.swapping && (step.swapping[0] === pos || step.swapping[1] === pos))
        return 'swapping';
      if (step.comparing && (step.comparing[0] === pos || step.comparing[1] === pos))
        return 'comparing';
      if (step.sorted.includes(pos)) return 'sorted';
      return 'default';
    };

    for (const dot of this.dots) {
      const state = stateFor(dot.position);
      dot.circle.setAttribute('data-state', state);
      switch (state) {
        case 'comparing':
          dot.circle.setAttribute('fill', 'var(--compare-color)');
          dot.circle.setAttribute('fill-opacity', '1');
          dot.circle.setAttribute('stroke', 'var(--compare-color)');
          break;
        case 'swapping':
          dot.circle.setAttribute('fill', 'var(--swap-color)');
          dot.circle.setAttribute('fill-opacity', '1');
          dot.circle.setAttribute('stroke', 'var(--swap-color)');
          break;
        case 'sorted':
          dot.circle.setAttribute('fill', 'var(--sorted-color)');
          dot.circle.setAttribute('fill-opacity', '1');
          dot.circle.setAttribute('stroke', 'var(--sorted-color)');
          break;
        default:
          dot.circle.setAttribute('fill', 'var(--accent)');
          dot.circle.setAttribute('fill-opacity', '0.6');
          dot.circle.setAttribute('stroke', 'var(--accent)');
      }
    }
  }
}
