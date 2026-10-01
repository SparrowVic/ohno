import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import * as d3Selection from 'd3-selection';
import { animate } from 'animejs';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  MotionProfile,
  createMotionProfile,
  findNewSorted,
  prefersReducedMotion,
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
  axis: SVGTextElement;
}

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted';

interface StateStyle {
  readonly fill: string;
  readonly label: string;
  readonly axis: string;
}

const BAR_STATE_STYLES: Record<BarState, StateStyle> = {
  default: {
    fill: 'rgb(var(--viz-state-default-rgb) / 0.72)',
    label: 'var(--ink-3)',
    axis: 'var(--ink-4)',
  },
  comparing: {
    fill: 'var(--viz-state-compare)',
    label: 'var(--viz-state-compare)',
    axis: 'var(--viz-state-compare)',
  },
  swapping: {
    fill: 'var(--viz-state-swap)',
    label: 'var(--viz-state-swap)',
    axis: 'var(--viz-state-swap)',
  },
  sorted: {
    fill: 'var(--viz-state-sorted)',
    label: 'var(--viz-state-sorted)',
    axis: 'var(--viz-state-sorted)',
  },
};

const TOP_PADDING = 74;
const BOTTOM_PADDING = 34;
const MIN_BAR_WIDTH = 4;
const MIN_LABEL_BAR_WIDTH = 14;
const MIN_AXIS_BAR_WIDTH = 22;
const SEGMENT_PERIOD = 6;
const SEGMENT_HEIGHT = 4;
const LABEL_SIZE = 15;
const AXIS_SIZE = 11;
const BRACKET_LIFT = 12;
const BRACKET_ARM = 12;
const DOT_SETTINGS = "'ROND' 100";

let instanceSequence = 0;

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
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly maskId = `bar-segments-${instanceSequence++}`;

  private svg: d3Selection.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private barsGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private boundaryGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private bracketGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private boundaryLine: SVGLineElement | null = null;
  private boundaryLabel: SVGTextElement | null = null;
  private bracketPath: SVGPathElement | null = null;
  private bracketLabel: SVGTextElement | null = null;
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

    effect(() => {
      this.language.activeLang();
      if (this.initialized && this.lastStep) untracked(() => this.applyMarkers(this.lastStep!));
    });
  }

  ngAfterViewInit(): void {
    const container = this.containerRef().nativeElement;
    this.svg = d3Selection
      .select(container)
      .append('svg')
      .attr('class', 'bars-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'none');

    this.appendSegmentMask();
    this.boundaryGroup = this.svg.append('g').attr('class', 'boundary');
    this.boundaryLine = this.boundaryGroup
      .append('line')
      .attr('stroke', 'var(--viz-state-sorted)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 5')
      .attr('opacity', 0.75)
      .node();
    this.boundaryLabel = this.boundaryGroup
      .append('text')
      .attr('fill', 'var(--viz-state-sorted)')
      .attr('text-anchor', 'start')
      .style('font', '500 9.5px var(--font-mono)')
      .style('letter-spacing', '0.15em')
      .style('text-transform', 'uppercase')
      .node();
    this.barsGroup = this.svg.append('g').attr('class', 'bars');
    this.bracketGroup = this.svg.append('g').attr('class', 'bracket');
    this.bracketPath = this.bracketGroup
      .append('path')
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round')
      .node();
    this.bracketLabel = this.bracketGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-dot)')
      .style('font-weight', '900')
      .style('font-variation-settings', DOT_SETTINGS)
      .style('font-size', `${LABEL_SIZE}px`)
      .node();
    this.hideMarkers();

    this.measure();
    this.resizeObserver = new ResizeObserver(() => {
      this.measure();
      this.layoutAll();
      if (this.lastStep) {
        this.applyStates(this.lastStep);
        this.applyMarkers(this.lastStep);
      }
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
    this.hideMarkers();
  }

  render(step: SortStep): void {
    const previousStep = this.lastStep;
    if (this.bars.length !== step.array.length) {
      this.snapRebuild(step.array);
    } else {
      const needsSync = this.bars.some((bar) => bar.value !== step.array[bar.position]);
      if (needsSync && !(step.swapping && this.tryAnimatedSwap(step))) {
        this.snapRebuild(step.array);
      }
    }
    this.lastStep = step;
    this.applyStates(step);
    this.applyMarkers(step);
    this.animateStepEffects(previousStep, step);
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.clearBars();
    this.svg?.remove();
    this.svg = null;
    this.barsGroup = null;
    this.boundaryGroup = null;
    this.bracketGroup = null;
    this.initialized = false;
    this.lastStep = null;
  }

  private appendSegmentMask(): void {
    if (!this.svg) return;
    const defs = this.svg.append('defs');
    const pattern = defs
      .append('pattern')
      .attr('id', `${this.maskId}-pattern`)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 4)
      .attr('height', SEGMENT_PERIOD);
    pattern.append('rect').attr('width', 4).attr('height', SEGMENT_HEIGHT).attr('fill', '#fff');
    const mask = defs
      .append('mask')
      .attr('id', this.maskId)
      .attr('maskUnits', 'userSpaceOnUse')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 100000)
      .attr('height', 100000);
    mask
      .append('rect')
      .attr('width', 100000)
      .attr('height', 100000)
      .attr('fill', `url(#${this.maskId}-pattern)`);
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
      .attr('mask', `url(#${this.maskId})`)
      .style('shape-rendering', 'crispEdges')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center bottom');
    const text = g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', defaultStyle.label)
      .style('font-family', 'var(--font-dot)')
      .style('font-weight', '900')
      .style('font-variation-settings', DOT_SETTINGS)
      .style('font-size', `${LABEL_SIZE}px`)
      .text(String(value));
    const axis = g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', defaultStyle.axis)
      .style('font-family', 'var(--font-mono)')
      .style('font-weight', '500')
      .style('font-size', `${AXIS_SIZE}px`)
      .style('letter-spacing', '0.06em')
      .text(String(position).padStart(2, '0'));

    return {
      id,
      value,
      position,
      group: g.node() as SVGGElement,
      rect: rect.node() as SVGRectElement,
      text: text.node() as SVGTextElement,
      axis: axis.node() as SVGTextElement,
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
    return clamp(this.width * 0.03, 12, 40);
  }

  private usableWidth(): number {
    return Math.max(0, this.width - this.horizontalPadding() * 2);
  }

  private barStepRaw(): number {
    if (this.bars.length === 0) return 0;
    return this.usableWidth() / this.bars.length;
  }

  private barGap(): number {
    return clamp(this.barStepRaw() * 0.32, 2, 26);
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
    const raw = (value / this.maxValue) * usable;
    return Math.max(SEGMENT_HEIGHT, Math.round(raw / SEGMENT_PERIOD) * SEGMENT_PERIOD - (SEGMENT_PERIOD - SEGMENT_HEIGHT));
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
    const labelSize = clamp(barWidth * 0.5, 14, LABEL_SIZE);
    const labelY = Math.max(labelSize + 6, y - 10);

    bar.group.setAttribute('transform', `translate(${x}, 0)`);

    bar.rect.setAttribute('x', '0');
    bar.rect.setAttribute('y', String(y));
    bar.rect.setAttribute('width', String(barWidth));
    bar.rect.setAttribute('height', String(barHeight));
    bar.rect.setAttribute('rx', '1.5');
    bar.rect.setAttribute('ry', '1.5');
    bar.rect.removeAttribute('transform');

    bar.text.setAttribute('x', String(barWidth / 2));
    bar.text.setAttribute('y', String(labelY));
    bar.text.style.fontSize = `${labelSize}px`;
    bar.text.textContent = String(bar.value);
    bar.text.setAttribute('visibility', barWidth < MIN_LABEL_BAR_WIDTH ? 'hidden' : 'visible');
    bar.text.removeAttribute('transform');

    bar.axis.setAttribute('x', String(barWidth / 2));
    bar.axis.setAttribute('y', String(floorY + 20));
    bar.axis.textContent = String(bar.position).padStart(2, '0');
    const thinAxis = barWidth < MIN_AXIS_BAR_WIDTH && bar.position % 2 === 1;
    bar.axis.setAttribute('visibility', thinAxis ? 'hidden' : 'visible');
  }

  private animateBarTo(bar: Bar, fromPos: number, toPos: number): void {
    const motion = this.motion();
    const fromX = this.xFor(fromPos);
    const toX = this.xFor(toPos);
    const target = bar.group;
    bar.axis.textContent = String(toPos).padStart(2, '0');

    if (prefersReducedMotion()) {
      target.setAttribute('transform', `translate(${toX}, 0)`);
      return;
    }

    const distance = Math.abs(toX - fromX);
    const lift = Math.min(motion.swapLiftPx + 6, Math.max(14, distance * 0.18));
    const state = { x: fromX, t: 0 };
    target.setAttribute('transform', `translate(${fromX}, 0)`);

    animate(state, {
      x: toX,
      t: 1,
      duration: motion.swapMs,
      ease: 'inOutQuad',
      onUpdate: () => {
        const arc = Math.sin(Math.PI * state.t);
        target.setAttribute('transform', `translate(${state.x}, ${-arc * lift})`);
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
      const style = BAR_STATE_STYLES[state];
      bar.rect.setAttribute('fill', style.fill);
      bar.text.setAttribute('fill', style.label);
      bar.axis.setAttribute('fill', style.axis);
    }
  }

  private applyMarkers(step: SortStep): void {
    this.applyBoundary(step);
    this.applyBracket(step);
  }

  private applyBoundary(step: SortStep): void {
    if (!this.boundaryLine || !this.boundaryLabel) return;
    const count = step.array.length;
    const settledFrom = step.boundary;
    const visible = count > 0 && settledFrom > 0 && settledFrom < count && step.sorted.length > 0;
    this.boundaryLine.setAttribute('visibility', visible ? 'visible' : 'hidden');
    this.boundaryLabel.setAttribute('visibility', visible ? 'visible' : 'hidden');
    if (!visible) return;
    const x = this.xFor(settledFrom) - this.barGap() / 2;
    this.boundaryLine.setAttribute('x1', String(x));
    this.boundaryLine.setAttribute('x2', String(x));
    this.boundaryLine.setAttribute('y1', String(TOP_PADDING - 34));
    this.boundaryLine.setAttribute('y2', String(this.baselineY() + 4));
    this.boundaryLabel.setAttribute('x', String(x + 10));
    this.boundaryLabel.setAttribute('y', String(TOP_PADDING - 28));
    this.boundaryLabel.textContent = this.settledLabel();
  }

  private applyBracket(step: SortStep): void {
    if (!this.bracketPath || !this.bracketLabel) return;
    const pair = step.comparing ?? step.swapping;
    if (!pair) {
      this.bracketPath.setAttribute('visibility', 'hidden');
      this.bracketLabel.setAttribute('visibility', 'hidden');
      return;
    }
    const [first, second] = pair;
    const left = Math.min(first, second);
    const right = Math.max(first, second);
    const barWidth = this.barWidth();
    const x1 = this.xFor(left);
    const x2 = this.xFor(right) + barWidth;
    const top = Math.min(this.topOf(left), this.topOf(right)) - LABEL_SIZE - BRACKET_LIFT - 8;
    const y = Math.max(BRACKET_ARM + LABEL_SIZE + 4, top);
    const color = step.swapping ? BAR_STATE_STYLES.swapping.fill : BAR_STATE_STYLES.comparing.fill;
    const leftValue = step.array[left] ?? 0;
    const rightValue = step.array[right] ?? 0;
    const relation = step.swapping ? '↔' : leftValue > rightValue ? '>' : leftValue < rightValue ? '<' : '=';

    this.bracketPath.setAttribute('visibility', 'visible');
    this.bracketPath.setAttribute('stroke', color);
    this.bracketPath.setAttribute('d', `M ${x1} ${y + BRACKET_ARM} V ${y} H ${x2} V ${y + BRACKET_ARM}`);
    this.bracketLabel.setAttribute('visibility', 'visible');
    this.bracketLabel.setAttribute('fill', color);
    this.bracketLabel.setAttribute('x', String((x1 + x2) / 2));
    this.bracketLabel.setAttribute('y', String(y - 6));
    this.bracketLabel.textContent = `${leftValue} ${relation} ${rightValue}`;
  }

  private hideMarkers(): void {
    for (const node of [this.boundaryLine, this.boundaryLabel, this.bracketPath, this.bracketLabel]) {
      node?.setAttribute('visibility', 'hidden');
    }
  }

  private topOf(position: number): number {
    const bar = this.findBar(position);
    return bar ? this.baselineY() - this.heightFor(bar.value) : this.baselineY();
  }

  private settledLabel(): string {
    return this.transloco.translate(I18N_KEY.features.algorithms.workbench.registers.settled).toUpperCase();
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
        scale: 1.04,
        origin: 'center bottom',
        filter: glowFilter('var(--viz-state-compare)', 14),
      });
    }
  }

  private animateSorted(indices: readonly number[], motion: MotionProfile): void {
    indices.forEach((position, index) => {
      const bar = this.findBar(position);
      if (!bar) return;
      pulseSvgElement(bar.rect, {
        duration: motion.settleMs,
        delay: index * motion.completeStepMs,
        scale: 1.03,
        origin: 'center bottom',
        filter: glowFilter('var(--viz-state-sorted)', 14),
      });
    });
  }

  private animateCompletion(motion: MotionProfile): void {
    const ordered = [...this.bars].sort((left, right) => left.position - right.position);
    ordered.forEach((bar, index) => {
      pulseSvgElement(bar.rect, {
        duration: motion.settleMs,
        delay: index * motion.completeStepMs,
        scale: 1.04,
        origin: 'center bottom',
        filter: glowFilter('var(--viz-state-sorted)', 18),
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

function glowFilter(color: string, radius: number): readonly [string, string, string] {
  return [
    'drop-shadow(0 0 0 transparent)',
    `drop-shadow(0 0 ${radius}px ${color})`,
    'drop-shadow(0 0 0 transparent)',
  ];
}
