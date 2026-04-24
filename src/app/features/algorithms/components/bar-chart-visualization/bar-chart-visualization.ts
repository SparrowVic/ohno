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
} from '../../utils/helpers/visualization-motion/visualization-motion';

interface Bar {
  id: string;
  value: number;
  position: number;
  group: SVGGElement;
  rect: SVGRectElement;
  text: SVGTextElement;
}

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted';

interface StateStyle {
  readonly fill: string;
  readonly stroke: string;
}

/** Single source of truth for each visual state. Each bar is a SOLID
 *  fill + hairline stroke — no vertical gradient, no sheen, no cap,
 *  no shadow. Colors alias directly onto the app's identity palette
 *  (cyan = attending, pink = acting, lime = done). Text color stays
 *  `--text-primary` always — the bar's own color already conveys the
 *  state and tinting the label on top of a same-colored fill was a
 *  low-contrast read. */
const BAR_STATE_STYLES: Record<BarState, StateStyle> = {
  default: {
    fill: 'rgb(var(--viz-state-default-rgb) / 0.85)',
    stroke: 'rgb(var(--viz-state-default-rgb) / 0.95)',
  },
  comparing: {
    fill: 'rgb(var(--viz-state-compare-rgb) / 0.92)',
    stroke: 'var(--viz-state-compare)',
  },
  swapping: {
    fill: 'rgb(var(--viz-state-swap-rgb) / 0.92)',
    stroke: 'var(--viz-state-swap)',
  },
  sorted: {
    fill: 'rgb(var(--viz-state-sorted-rgb) / 0.92)',
    stroke: 'var(--viz-state-sorted)',
  },
};

const TOP_PADDING = 44;
const BOTTOM_PADDING = 30;
const MIN_BAR_WIDTH = 4;

@Component({
  selector: 'app-bar-chart-visualization',
  imports: [],
  templateUrl: './bar-chart-visualization.html',
  styleUrl: './bar-chart-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private svg: d3Selection.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private barsGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private bars: Bar[] = [];
  private width = 0;
  private height = 0;
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
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'none');

    this.barsGroup = this.svg.append('g').attr('class', 'bars');

    this.measure();
    this.resizeObserver = new ResizeObserver(() => {
      this.measure();
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
    this.clearBars();
    this.maxValue = Math.max(1, ...array);
    this.bars = array.map((value, i) => this.createBar(`el-${i}`, value, i));
    this.layoutAll();
    this.lastStep = null;
  }

  render(step: SortStep): void {
    const previousStep = this.lastStep;
    if (this.bars.length !== step.array.length) {
      this.snapRebuild(step.array);
      this.lastStep = step;
      this.applyStates(step);
      this.animateStepEffects(previousStep, step);
      return;
    }

    const needsSync = this.bars.some((bar) => bar.value !== step.array[bar.position]);
    if (!needsSync) {
      this.lastStep = step;
      this.applyStates(step);
      this.animateStepEffects(previousStep, step);
      return;
    }

    if (step.swapping && this.tryAnimatedSwap(step)) {
      this.lastStep = step;
      this.applyStates(step);
      this.animateStepEffects(previousStep, step);
      return;
    }

    this.snapRebuild(step.array);
    this.lastStep = step;
    this.applyStates(step);
    this.animateStepEffects(previousStep, step);
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.clearBars();
    this.svg?.remove();
    this.svg = null;
    this.barsGroup = null;
    this.initialized = false;
    this.lastStep = null;
  }

  private tryAnimatedSwap(step: SortStep): boolean {
    if (!step.swapping) return false;
    const [a, b] = step.swapping;
    const barA = this.bars.find((bar) => bar.position === a);
    const barB = this.bars.find((bar) => bar.position === b);
    if (!barA || !barB) return false;

    const expectedArray = this.valuesByPosition();
    [expectedArray[a], expectedArray[b]] = [expectedArray[b], expectedArray[a]];
    const matches = expectedArray.every((value, index) => value === step.array[index]);
    if (!matches) return false;

    barA.position = b;
    barB.position = a;
    this.animateBarTo(barA, a, b);
    this.animateBarTo(barB, b, a);
    return true;
  }

  private snapRebuild(array: readonly number[]): void {
    this.clearBars();
    this.maxValue = Math.max(1, ...array);
    this.bars = array.map((value, i) => this.createBar(`el-${i}`, value, i));
    this.layoutAll();
  }

  private createBar(id: string, value: number, position: number): Bar {
    if (!this.barsGroup) {
      throw new Error('bars group not initialized');
    }

    const g = this.barsGroup.append('g').attr('class', 'bar').attr('data-id', id);
    const defaultStyle = BAR_STATE_STYLES.default;
    const rect = g
      .append('rect')
      .attr('fill', defaultStyle.fill)
      .attr('stroke', defaultStyle.stroke)
      .attr('stroke-width', 0.5)
      .style('shape-rendering', 'geometricPrecision')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center bottom');
    const text = g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .style('font-family', 'var(--font-mono)')
      .style('font-weight', '600')
      .style('letter-spacing', '0.02em')
      .style('font-variant-numeric', 'tabular-nums')
      .style('paint-order', 'stroke fill')
      .style('stroke', 'rgba(8, 10, 16, 0.82)')
      .style('stroke-width', '2px')
      .style('stroke-linejoin', 'round')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center center')
      .text(String(value));

    return {
      id,
      value,
      position,
      group: g.node() as SVGGElement,
      rect: rect.node() as SVGRectElement,
      text: text.node() as SVGTextElement,
    };
  }

  private clearBars(): void {
    if (this.barsGroup) {
      this.barsGroup.selectAll('g.bar').remove();
    }
    this.bars = [];
  }

  private measure(): void {
    const rect = this.containerRef().nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.svg?.attr('viewBox', `0 0 ${Math.max(this.width, 1)} ${Math.max(this.height, 1)}`);
  }

  private horizontalPadding(): number {
    return clamp(this.width * 0.03, 10, 24);
  }

  private usableWidth(): number {
    return Math.max(0, this.width - this.horizontalPadding() * 2);
  }

  private barStepRaw(): number {
    if (this.bars.length === 0) return 0;
    return this.usableWidth() / this.bars.length;
  }

  private barGap(): number {
    return clamp(this.barStepRaw() * 0.18, 2, 10);
  }

  private barWidth(): number {
    return Math.max(MIN_BAR_WIDTH, this.barStepRaw() - this.barGap());
  }

  private xFor(position: number): number {
    return this.horizontalPadding() + position * this.barStepRaw() + this.barGap() / 2;
  }

  private baselineY(): number {
    const preferredFloor = Math.max(TOP_PADDING + 42, this.height - BOTTOM_PADDING);
    return Math.min(Math.max(0, this.height - 12), preferredFloor);
  }

  private heightFor(value: number): number {
    const usable = Math.max(32, this.baselineY() - TOP_PADDING);
    return (value / this.maxValue) * usable;
  }

  private radiusFor(barWidth: number, barHeight: number): number {
    return clamp(Math.min(barWidth, barHeight) * 0.28, 3, 18);
  }

  private layoutAll(): void {
    this.measure();
    const barWidth = this.barWidth();
    for (const bar of this.bars) {
      this.layoutBar(bar, barWidth);
    }
  }

  private layoutBar(bar: Bar, barWidth: number): void {
    const x = this.xFor(bar.position);
    const floorY = this.baselineY();
    const barHeight = this.heightFor(bar.value);
    const y = floorY - barHeight;
    const radius = this.radiusFor(barWidth, barHeight);
    const labelSize = clamp(barWidth * 0.42, 10, 14);
    const labelY = Math.max(labelSize + 6, y - 10);

    bar.group.setAttribute('transform', `translate(${x}, 0)`);

    bar.rect.setAttribute('x', '0');
    bar.rect.setAttribute('y', String(y));
    bar.rect.setAttribute('width', String(barWidth));
    bar.rect.setAttribute('height', String(barHeight));
    bar.rect.setAttribute('rx', String(radius));
    bar.rect.setAttribute('ry', String(radius));
    bar.rect.removeAttribute('transform');

    bar.text.setAttribute('x', String(barWidth / 2));
    bar.text.setAttribute('y', String(labelY));
    bar.text.setAttribute('font-size', String(labelSize));
    bar.text.textContent = String(bar.value);
    bar.text.removeAttribute('transform');
  }

  private animateBarTo(bar: Bar, fromPos: number, toPos: number): void {
    const motion = this.motion();
    const fromX = this.xFor(fromPos);
    const toX = this.xFor(toPos);
    const distance = Math.abs(toX - fromX);
    const lift = Math.min(motion.swapLiftPx + 6, Math.max(14, distance * 0.18));
    const target = bar.group;
    const state = { x: fromX, t: 0 };

    target.setAttribute('transform', `translate(${fromX}, 0)`);

    animate(state, {
      x: toX,
      t: 1,
      duration: motion.swapMs,
      ease: 'inOutQuad',
      onUpdate: () => {
        const arc = Math.sin(Math.PI * state.t);
        const y = -arc * lift;
        target.setAttribute('transform', `translate(${state.x}, ${y})`);
      },
      onComplete: () => {
        target.setAttribute('transform', `translate(${toX}, 0)`);
      },
    });
  }

  private applyStates(step: SortStep): void {
    const stateFor = (position: number): BarState => {
      if (step.swapping && (step.swapping[0] === position || step.swapping[1] === position))
        return 'swapping';
      if (step.comparing && (step.comparing[0] === position || step.comparing[1] === position))
        return 'comparing';
      if (step.sorted.includes(position)) return 'sorted';
      return 'default';
    };

    for (const bar of this.bars) {
      const state = stateFor(bar.position);
      bar.group.setAttribute('data-state', state);
      this.applyStateStyles(bar, state);
    }
  }

  private applyStateStyles(bar: Bar, state: BarState): void {
    const style = BAR_STATE_STYLES[state];
    bar.rect.setAttribute('fill', style.fill);
    bar.rect.setAttribute('stroke', style.stroke);
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    if (prefersReducedMotion()) return;

    const motion = this.motion();
    if (step.comparing && !samePair(previousStep?.comparing ?? null, step.comparing)) {
      this.animateCompare(step.comparing, motion);
    }

    const freshSorted = findNewSorted(previousStep?.sorted, step.sorted);
    if (freshSorted.length > 0) {
      this.animateSorted(freshSorted, motion);
    }

    if (
      (previousStep?.sorted.length ?? 0) < step.array.length &&
      step.sorted.length === step.array.length
    ) {
      this.animateCompletion(motion);
    }
  }

  private animateCompare(pair: readonly [number, number], motion: MotionProfile): void {
    for (const position of pair) {
      const bar = this.findBar(position);
      if (!bar) continue;
      pulseSvgElement(bar.rect, {
        duration: motion.compareMs,
        scale: 1.05,
        origin: 'center bottom',
        filter: glowFilter('var(--viz-state-compare)', 16),
      });
    }
  }

  private animateSorted(indices: readonly number[], motion: MotionProfile): void {
    indices.forEach((position, index) => {
      const bar = this.findBar(position);
      if (!bar) return;
      const delay = index * motion.completeStepMs;
      pulseSvgElement(bar.rect, {
        duration: motion.settleMs,
        delay,
        scale: 1.04,
        origin: 'center bottom',
        filter: glowFilter('var(--viz-state-sorted)', 18),
      });
    });
  }

  private animateCompletion(motion: MotionProfile): void {
    const ordered = [...this.bars].sort((left, right) => left.position - right.position);
    ordered.forEach((bar, index) => {
      const delay = index * motion.completeStepMs;
      pulseSvgElement(bar.rect, {
        duration: motion.settleMs,
        delay,
        scale: 1.05,
        origin: 'center bottom',
        filter: glowFilter('var(--viz-state-sorted)', 22),
      });
    });
  }

  private findBar(position: number): Bar | undefined {
    return this.bars.find((bar) => bar.position === position);
  }

  private valuesByPosition(): number[] {
    const values = new Array<number>(this.bars.length);
    for (const bar of this.bars) {
      values[bar.position] = bar.value;
    }
    return values;
  }

  private motion(): MotionProfile {
    return createMotionProfile(this.speed());
  }

}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Build the 3-frame `drop-shadow` filter keyframes used for state
 *  pulses. The middle frame carries the color + blur radius; the
 *  edges are transparent so the glow fades in and out smoothly. */
function glowFilter(color: string, radius: number): readonly [string, string, string] {
  return [
    'drop-shadow(0 0 0 transparent)',
    `drop-shadow(0 0 ${radius}px ${color})`,
    'drop-shadow(0 0 0 transparent)',
  ];
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
