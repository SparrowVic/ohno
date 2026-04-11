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

interface Bar {
  id: string;
  value: number;
  position: number;
  group: SVGGElement;
  rect: SVGRectElement;
  text: SVGTextElement;
}

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted';

const BAR_GAP = 4;
const TOP_PADDING = 24;
const SWAP_DURATION = 200;

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

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private barsGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
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
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');
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
    if (this.bars.length !== step.array.length) {
      this.snapRebuild(step.array);
      this.lastStep = step;
      this.applyStates(step);
      return;
    }

    const needsSync = this.bars.some((bar) => bar.value !== step.array[bar.position]);

    if (!needsSync) {
      this.lastStep = step;
      this.applyStates(step);
      return;
    }

    if (step.swapping && this.tryAnimatedSwap(step)) {
      this.lastStep = step;
      this.applyStates(step);
      return;
    }

    this.snapRebuild(step.array);
    this.lastStep = step;
    this.applyStates(step);
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

    const expectedArray = [...this.bars.map((bar) => bar.value)];
    [expectedArray[a], expectedArray[b]] = [expectedArray[b], expectedArray[a]];
    const matches = expectedArray.every((v, i) => v === step.array[i]);
    if (!matches) return false;

    barA.position = b;
    barB.position = a;
    this.animateBarTo(barA, b, a);
    this.animateBarTo(barB, a, b);
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
    const rect = g
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', 'var(--accent)')
      .attr('fill-opacity', 0.5);
    const text = g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', 'var(--text-tertiary)')
      .style('font-family', 'var(--font-mono)')
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
  }

  private barStep(): number {
    if (this.bars.length === 0) return 0;
    return this.width / this.bars.length;
  }

  private barWidth(): number {
    return Math.max(2, this.barStep() - BAR_GAP);
  }

  private xFor(position: number): number {
    return position * this.barStep() + BAR_GAP / 2;
  }

  private heightFor(value: number): number {
    const usable = Math.max(0, this.height - TOP_PADDING);
    return (value / this.maxValue) * usable;
  }

  private layoutAll(): void {
    const barW = this.barWidth();
    for (const bar of this.bars) {
      this.layoutBar(bar, barW);
    }
  }

  private layoutBar(bar: Bar, barW: number): void {
    const x = this.xFor(bar.position);
    const barH = this.heightFor(bar.value);
    const y = this.height - barH;
    bar.group.setAttribute('transform', `translate(${x}, 0)`);
    bar.rect.setAttribute('x', '0');
    bar.rect.setAttribute('y', String(y));
    bar.rect.setAttribute('width', String(barW));
    bar.rect.setAttribute('height', String(barH));
    bar.text.setAttribute('x', String(barW / 2));
    bar.text.setAttribute('y', String(y - 6));
    bar.text.textContent = String(bar.value);
  }

  private animateBarTo(bar: Bar, fromPos: number, toPos: number): void {
    const fromX = this.xFor(fromPos);
    const toX = this.xFor(toPos);
    bar.group.setAttribute('transform', `translate(${fromX}, 0)`);
    const state = { x: fromX };
    const target = bar.group;
    animate(state, {
      x: toX,
      duration: SWAP_DURATION,
      ease: 'inOutQuad',
      onUpdate: () => {
        target.setAttribute('transform', `translate(${state.x}, 0)`);
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
      switch (state) {
        case 'comparing':
          bar.rect.setAttribute('fill', 'var(--compare-color)');
          bar.rect.setAttribute('fill-opacity', '1');
          break;
        case 'swapping':
          bar.rect.setAttribute('fill', 'var(--swap-color)');
          bar.rect.setAttribute('fill-opacity', '1');
          break;
        case 'sorted':
          bar.rect.setAttribute('fill', 'var(--sorted-color)');
          bar.rect.setAttribute('fill-opacity', '0.85');
          break;
        default:
          bar.rect.setAttribute('fill', 'var(--accent)');
          bar.rect.setAttribute('fill-opacity', '0.5');
      }
    }
  }
}
