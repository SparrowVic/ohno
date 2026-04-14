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
import * as d3Scale from 'd3-scale';
import * as d3Selection from 'd3-selection';
import { animate } from 'animejs';

import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  MotionProfile,
  createMotionProfile,
  findNewSorted,
  pulseSvgElement,
  samePair,
} from '../../utils/visualization-motion';

interface Dot {
  id: string;
  value: number;
  position: number;
  circle: SVGCircleElement;
}

type DotState = 'default' | 'comparing' | 'swapping' | 'sorted';

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
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private svg: d3Selection.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private gridGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private dotsGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private dots: Dot[] = [];
  private width = 0;
  private height = 0;
  private xScale: d3Scale.ScaleLinear<number, number> = d3Scale.scaleLinear();
  private yScale: d3Scale.ScaleLinear<number, number> = d3Scale.scaleLinear();
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
    this.svg = d3Selection
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
    const previousStep = this.lastStep;
    if (this.dots.length !== step.array.length) {
      this.snapRebuild(step.array);
      this.lastStep = step;
      this.applyStates(step);
      this.animateStepEffects(previousStep, step);
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
    this.animateStepEffects(previousStep, step);
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

    const expected = this.valuesByPosition();
    [expected[a], expected[b]] = [expected[b], expected[a]];
    if (!expected.every((v, i) => v === step.array[i])) return false;

    dotA.position = b;
    dotB.position = a;
    this.animateDotTo(dotA, a, b, -1);
    this.animateDotTo(dotB, b, a, 1);
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
    this.xScale = d3Scale
      .scaleLinear()
      .domain([0, count - 1])
      .range([PADDING_X, Math.max(PADDING_X, this.width - PADDING_X)]);
    this.yScale = d3Scale
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

  private animateDotTo(
    dot: Dot,
    fromPos: number,
    toPos: number,
    direction: number,
  ): void {
    const motion = this.motion();
    const fromX = this.xScale(fromPos);
    const toX = this.xScale(toPos);
    const cy = this.yScale(dot.value);
    dot.circle.setAttribute('cx', String(fromX));
    dot.circle.setAttribute('cy', String(cy));
    const state = { x: fromX, t: 0 };
    const target = dot.circle;
    animate(state, {
      x: toX,
      t: 1,
      duration: motion.swapMs,
      ease: 'inOutQuad',
      onUpdate: () => {
        target.setAttribute('cx', String(state.x));
        const lift = Math.sin(Math.PI * state.t) * motion.swapLiftPx * direction;
        target.setAttribute('cy', String(cy - lift));
      },
      onComplete: () => {
        target.setAttribute('cx', String(toX));
        target.setAttribute('cy', String(cy));
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

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const motion = this.motion();
    if (step.comparing && !samePair(previousStep?.comparing ?? null, step.comparing)) {
      this.animateCompare(step.comparing, motion);
    }

    const freshSorted = findNewSorted(previousStep?.sorted, step.sorted);
    if (freshSorted.length > 0) {
      this.animateSorted(freshSorted, motion);
    }

    if ((previousStep?.sorted.length ?? 0) < step.array.length && step.sorted.length === step.array.length) {
      this.animateCompletion(motion);
    }
  }

  private animateCompare(pair: readonly [number, number], motion: MotionProfile): void {
    for (const position of pair) {
      const dot = this.findDot(position);
      if (!dot) continue;
      pulseSvgElement(dot.circle, {
        duration: motion.compareMs,
        scale: 1.22,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 12px var(--compare-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private animateSorted(indices: readonly number[], motion: MotionProfile): void {
    indices.forEach((position, index) => {
      const dot = this.findDot(position);
      if (!dot) return;
      pulseSvgElement(dot.circle, {
        duration: motion.settleMs,
        delay: index * motion.completeStepMs,
        scale: 1.18,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 14px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    });
  }

  private animateCompletion(motion: MotionProfile): void {
    const ordered = [...this.dots].sort((left, right) => left.position - right.position);
    ordered.forEach((dot, index) => {
      pulseSvgElement(dot.circle, {
        duration: motion.settleMs,
        delay: index * motion.completeStepMs,
        scale: 1.2,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 16px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    });
  }

  private findDot(position: number): Dot | undefined {
    return this.dots.find((dot) => dot.position === position);
  }

  private valuesByPosition(): number[] {
    const values = new Array<number>(this.dots.length);
    for (const dot of this.dots) {
      values[dot.position] = dot.value;
    }
    return values;
  }

  private motion(): MotionProfile {
    return createMotionProfile(this.speed());
  }
}
