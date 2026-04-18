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
} from '../../utils/visualization-motion/visualization-motion';

interface Bar {
  id: string;
  value: number;
  position: number;
  group: SVGGElement;
  shadow: SVGEllipseElement;
  rect: SVGRectElement;
  sheen: SVGRectElement;
  cap: SVGRectElement;
  text: SVGTextElement;
}

interface GradientStop {
  readonly offset: string;
  readonly color: string;
}

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted';

const TOP_PADDING = 44;
const BOTTOM_PADDING = 30;
const MIN_BAR_WIDTH = 4;

let nextChartId = 0;

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
  private readonly gradientNamespace = `bar-chart-${nextChartId++}`;

  private svg: d3Selection.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private backdropGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private guideLinesGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null =
    null;
  private barsGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private floorGlow: SVGRectElement | null = null;
  private baselineLine: SVGLineElement | null = null;
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

    const defs = this.svg.append('defs');
    this.createDefs(defs);

    this.backdropGroup = this.svg.append('g').attr('pointer-events', 'none');
    this.floorGlow = this.backdropGroup
      .append('rect')
      .attr('fill', `url(#${this.gradientId('floor-glow')})`)
      .node() as SVGRectElement;
    this.guideLinesGroup = this.backdropGroup.append('g').attr('pointer-events', 'none');
    this.baselineLine = this.backdropGroup
      .append('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.14)')
      .attr('stroke-width', 1.25)
      .attr('stroke-linecap', 'round')
      .node() as SVGLineElement;

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
    this.backdropGroup = null;
    this.guideLinesGroup = null;
    this.barsGroup = null;
    this.floorGlow = null;
    this.baselineLine = null;
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
    const shadow = g
      .append('ellipse')
      .attr('fill', 'rgba(2, 6, 23, 0.46)')
      .attr('opacity', 0.34)
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center center');
    const rect = g
      .append('rect')
      .attr('fill', this.fillForState('default'))
      .attr('stroke', this.strokeForState('default'))
      .attr('stroke-width', 1.15)
      .style('shape-rendering', 'geometricPrecision')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center bottom');
    const sheen = g
      .append('rect')
      .attr('fill', `url(#${this.gradientId('bar-sheen')})`)
      .attr('opacity', this.sheenOpacityForState('default'))
      .style('mix-blend-mode', 'screen')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center top');
    const cap = g
      .append('rect')
      .attr('fill', 'rgba(255, 255, 255, 0.28)')
      .attr('opacity', this.capOpacityForState('default'))
      .style('mix-blend-mode', 'screen')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center top');
    const text = g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('opacity', this.textOpacityForState('default'))
      .style('font-family', 'var(--font-mono)')
      .style('font-weight', '600')
      .style('letter-spacing', '0.02em')
      .style('paint-order', 'stroke fill')
      .style('stroke', 'rgba(8, 10, 16, 0.92)')
      .style('stroke-width', '3.5px')
      .style('stroke-linejoin', 'round')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center center')
      .text(String(value));

    return {
      id,
      value,
      position,
      group: g.node() as SVGGElement,
      shadow: shadow.node() as SVGEllipseElement,
      rect: rect.node() as SVGRectElement,
      sheen: sheen.node() as SVGRectElement,
      cap: cap.node() as SVGRectElement,
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

  private syncBackdrop(): void {
    const floorY = this.baselineY();
    const left = this.horizontalPadding();
    const right = Math.max(left, this.width - left);
    const top = Math.max(18, TOP_PADDING - 14);

    if (this.floorGlow) {
      this.floorGlow.setAttribute('x', String(left));
      this.floorGlow.setAttribute('y', String(floorY - 24));
      this.floorGlow.setAttribute('width', String(Math.max(0, right - left)));
      this.floorGlow.setAttribute('height', String(Math.max(42, this.height - floorY + 48)));
    }

    if (this.baselineLine) {
      this.baselineLine.setAttribute('x1', String(left));
      this.baselineLine.setAttribute('x2', String(right));
      this.baselineLine.setAttribute('y1', String(floorY + 1));
      this.baselineLine.setAttribute('y2', String(floorY + 1));
    }

    const guideYs = [0.2, 0.45, 0.7].map((ratio) => top + (floorY - top) * ratio);
    this.guideLinesGroup
      ?.selectAll<SVGLineElement, number>('line')
      .data(guideYs)
      .join(
        (enter) =>
          enter
            .append('line')
            .attr('stroke', 'rgba(255, 255, 255, 0.06)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4 10')
            .attr('stroke-linecap', 'round'),
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr('x1', left)
      .attr('x2', right)
      .attr('y1', (y) => y)
      .attr('y2', (y) => y);
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
    this.syncBackdrop();
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
    const sheenX = Math.max(1, barWidth * 0.16);
    const sheenWidth = Math.max(3, Math.min(barWidth * 0.42, barWidth - sheenX - 1));
    const sheenHeight = Math.max(8, Math.min(barHeight * 0.48, 34));
    const capHeight = Math.max(2, Math.min(8, barHeight * 0.055));
    const labelSize = clamp(barWidth * 0.42, 10, 14);
    const labelY = Math.max(labelSize + 6, y - 10);
    const shadowWidth = Math.max(10, barWidth * 0.72);
    const shadowHeight = Math.max(3, Math.min(10, barWidth * 0.16));

    bar.group.setAttribute('transform', `translate(${x}, 0)`);

    bar.shadow.setAttribute('cx', String(barWidth / 2));
    bar.shadow.setAttribute('cy', String(floorY + 5));
    bar.shadow.setAttribute('rx', String(shadowWidth / 2));
    bar.shadow.setAttribute('ry', String(shadowHeight / 2));
    bar.shadow.removeAttribute('transform');

    bar.rect.setAttribute('x', '0');
    bar.rect.setAttribute('y', String(y));
    bar.rect.setAttribute('width', String(barWidth));
    bar.rect.setAttribute('height', String(barHeight));
    bar.rect.setAttribute('rx', String(radius));
    bar.rect.setAttribute('ry', String(radius));
    bar.rect.removeAttribute('transform');

    bar.sheen.setAttribute('x', String(sheenX));
    bar.sheen.setAttribute('y', String(y + 2));
    bar.sheen.setAttribute('width', String(sheenWidth));
    bar.sheen.setAttribute('height', String(sheenHeight));
    bar.sheen.setAttribute('rx', String(Math.max(2, radius * 0.72)));
    bar.sheen.setAttribute('ry', String(Math.max(2, radius * 0.72)));
    bar.sheen.removeAttribute('transform');

    bar.cap.setAttribute('x', '1.5');
    bar.cap.setAttribute('y', String(y + 2));
    bar.cap.setAttribute('width', String(Math.max(0, barWidth - 3)));
    bar.cap.setAttribute('height', String(capHeight));
    bar.cap.setAttribute('rx', String(Math.max(1.5, capHeight / 2)));
    bar.cap.setAttribute('ry', String(Math.max(1.5, capHeight / 2)));
    bar.cap.removeAttribute('transform');

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
        const shadowScaleX = 1 - arc * 0.22;
        const shadowScaleY = 1 - arc * 0.38;
        target.setAttribute('transform', `translate(${state.x}, ${y})`);
        bar.shadow.setAttribute(
          'transform',
          `translate(0, ${-y * 0.92}) scale(${shadowScaleX}, ${shadowScaleY})`,
        );
        bar.sheen.setAttribute('opacity', String(0.42 + arc * 0.16));
        bar.cap.setAttribute('opacity', String(0.48 + arc * 0.18));
      },
      onComplete: () => {
        target.setAttribute('transform', `translate(${toX}, 0)`);
        bar.shadow.removeAttribute('transform');
        this.restoreOverlayOpacities(bar);
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
    bar.rect.setAttribute('fill', this.fillForState(state));
    bar.rect.setAttribute('stroke', this.strokeForState(state));
    bar.rect.setAttribute('stroke-opacity', state === 'default' ? '0.82' : '1');
    bar.text.setAttribute('fill', this.textFillForState(state));
    bar.text.setAttribute('opacity', String(this.textOpacityForState(state)));
    bar.shadow.setAttribute('fill', this.shadowFillForState(state));
    bar.shadow.setAttribute('opacity', String(this.shadowOpacityForState(state)));
    bar.sheen.setAttribute('opacity', String(this.sheenOpacityForState(state)));
    bar.cap.setAttribute('opacity', String(this.capOpacityForState(state)));
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
        scale: 1.06,
        origin: 'center bottom',
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 18px var(--compare-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(bar.sheen, {
        duration: motion.compareMs,
        scale: 1.08,
        opacity: [0.5, 0.88, 0.5],
        origin: 'center top',
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 12px var(--compare-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(bar.text, {
        duration: motion.compareMs,
        scale: 1.1,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 10px var(--compare-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
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
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 18px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(bar.sheen, {
        duration: motion.settleMs,
        delay,
        scale: 1.06,
        opacity: [0.46, 0.82, 0.46],
        origin: 'center top',
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 12px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(bar.text, {
        duration: motion.settleMs,
        delay,
        scale: 1.08,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 10px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
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
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 20px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(bar.sheen, {
        duration: motion.settleMs,
        delay,
        scale: 1.08,
        opacity: [0.46, 0.88, 0.46],
        origin: 'center top',
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 12px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
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

  private restoreOverlayOpacities(bar: Bar): void {
    const state = (bar.group.getAttribute('data-state') as BarState | null) ?? 'default';
    bar.sheen.setAttribute('opacity', String(this.sheenOpacityForState(state)));
    bar.cap.setAttribute('opacity', String(this.capOpacityForState(state)));
  }

  private fillForState(state: BarState): string {
    switch (state) {
      case 'comparing':
        return `url(#${this.gradientId('bar-compare-fill')})`;
      case 'swapping':
        return `url(#${this.gradientId('bar-swap-fill')})`;
      case 'sorted':
        return `url(#${this.gradientId('bar-sorted-fill')})`;
      default:
        return `url(#${this.gradientId('bar-default-fill')})`;
    }
  }

  private strokeForState(state: BarState): string {
    switch (state) {
      case 'comparing':
        return 'var(--compare-color)';
      case 'swapping':
        return 'var(--swap-color)';
      case 'sorted':
        return 'var(--sorted-color)';
      default:
        return 'rgb(var(--viz-accent-rgb) / 0.52)';
    }
  }

  private textFillForState(state: BarState): string {
    switch (state) {
      case 'comparing':
        return 'var(--compare-color)';
      case 'swapping':
        return 'var(--swap-color)';
      case 'sorted':
        return 'var(--sorted-color)';
      default:
        return 'var(--text-primary)';
    }
  }

  private textOpacityForState(state: BarState): number {
    switch (state) {
      case 'default':
        return 0.78;
      default:
        return 1;
    }
  }

  private shadowFillForState(state: BarState): string {
    switch (state) {
      case 'comparing':
        return 'var(--compare-color)';
      case 'swapping':
        return 'var(--swap-color)';
      case 'sorted':
        return 'var(--sorted-color)';
      default:
        return 'rgba(2, 6, 23, 0.46)';
    }
  }

  private shadowOpacityForState(state: BarState): number {
    switch (state) {
      case 'comparing':
        return 0.18;
      case 'swapping':
        return 0.2;
      case 'sorted':
        return 0.16;
      default:
        return 0.34;
    }
  }

  private sheenOpacityForState(state: BarState): number {
    switch (state) {
      case 'comparing':
        return 0.5;
      case 'swapping':
        return 0.56;
      case 'sorted':
        return 0.46;
      default:
        return 0.34;
    }
  }

  private capOpacityForState(state: BarState): number {
    switch (state) {
      case 'comparing':
        return 0.58;
      case 'swapping':
        return 0.64;
      case 'sorted':
        return 0.54;
      default:
        return 0.42;
    }
  }

  private createDefs(defs: d3Selection.Selection<SVGDefsElement, unknown, null, undefined>): void {
    this.appendLinearGradient(defs, 'bar-default-fill', '0%', '0%', '0%', '100%', [
      { offset: '0%', color: 'rgb(var(--viz-accent-rgb) / 0.94)' },
      { offset: '56%', color: 'rgb(var(--viz-accent-rgb) / 0.72)' },
      { offset: '100%', color: 'rgb(var(--viz-accent-rgb) / 0.24)' },
    ]);
    this.appendLinearGradient(defs, 'bar-compare-fill', '0%', '0%', '0%', '100%', [
      { offset: '0%', color: 'rgb(var(--medium-rgb) / 1)' },
      { offset: '56%', color: 'rgb(var(--medium-rgb) / 0.8)' },
      { offset: '100%', color: 'rgb(var(--medium-rgb) / 0.28)' },
    ]);
    this.appendLinearGradient(defs, 'bar-swap-fill', '0%', '0%', '0%', '100%', [
      { offset: '0%', color: 'rgb(var(--hard-rgb) / 1)' },
      { offset: '54%', color: 'rgb(var(--hard-rgb) / 0.82)' },
      { offset: '100%', color: 'rgb(var(--hard-rgb) / 0.32)' },
    ]);
    this.appendLinearGradient(defs, 'bar-sorted-fill', '0%', '0%', '0%', '100%', [
      { offset: '0%', color: 'rgb(var(--easy-rgb) / 0.98)' },
      { offset: '58%', color: 'rgb(var(--easy-rgb) / 0.82)' },
      { offset: '100%', color: 'rgb(var(--easy-rgb) / 0.28)' },
    ]);
    this.appendLinearGradient(defs, 'bar-sheen', '0%', '0%', '76%', '100%', [
      { offset: '0%', color: 'rgba(255, 255, 255, 0.36)' },
      { offset: '24%', color: 'rgba(255, 255, 255, 0.18)' },
      { offset: '100%', color: 'rgba(255, 255, 255, 0)' },
    ]);

    const floorGlow = defs
      .append('radialGradient')
      .attr('id', this.gradientId('floor-glow'))
      .attr('cx', '50%')
      .attr('cy', '18%')
      .attr('r', '78%');
    [
      { offset: '0%', color: 'rgb(var(--viz-accent-rgb) / 0.2)' },
      { offset: '48%', color: 'rgb(var(--viz-window-rgb) / 0.1)' },
      { offset: '100%', color: 'rgba(255, 255, 255, 0)' },
    ].forEach((stop) => {
      floorGlow.append('stop').attr('offset', stop.offset).attr('stop-color', stop.color);
    });
  }

  private appendLinearGradient(
    defs: d3Selection.Selection<SVGDefsElement, unknown, null, undefined>,
    name: string,
    x1: string,
    y1: string,
    x2: string,
    y2: string,
    stops: readonly GradientStop[],
  ): void {
    const gradient = defs
      .append('linearGradient')
      .attr('id', this.gradientId(name))
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2);

    stops.forEach((stop) => {
      gradient.append('stop').attr('offset', stop.offset).attr('stop-color', stop.color);
    });
  }

  private gradientId(name: string): string {
    return `${this.gradientNamespace}-${name}`;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
