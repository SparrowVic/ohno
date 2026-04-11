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
import {
  MotionProfile,
  createMotionProfile,
  findNewSorted,
  pulseSvgElement,
  samePair,
} from '../../utils/visualization-motion';

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

const FREQ_MIN = 200;
const FREQ_MAX = 800;
const AUDIO_GAIN = 0.05;
const COMPLETE_GAIN = 0.06;

@Component({
  selector: 'app-sound-bars-visualization',
  imports: [],
  templateUrl: './sound-bars-visualization.html',
  styleUrl: './sound-bars-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundBarsVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly muted = input<boolean>(true);

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

  private audioCtx: AudioContext | null = null;
  private freqScale: d3.ScaleLinear<number, number> = d3.scaleLinear();

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
    this.bars = array.map((value, i) => this.createBar(`sb-${i}`, value, i));
    this.freqScale = d3
      .scaleLinear()
      .domain([1, this.maxValue])
      .range([FREQ_MIN, FREQ_MAX])
      .clamp(true);
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
    this.closeAudio();
  }

  private tryAnimatedSwap(step: SortStep): boolean {
    if (!step.swapping) return false;
    const [a, b] = step.swapping;
    const barA = this.bars.find((bar) => bar.position === a);
    const barB = this.bars.find((bar) => bar.position === b);
    if (!barA || !barB) return false;

    const expectedArray = this.valuesByPosition();
    [expectedArray[a], expectedArray[b]] = [expectedArray[b], expectedArray[a]];
    if (!expectedArray.every((v, i) => v === step.array[i])) return false;

    barA.position = b;
    barB.position = a;
    this.animateBarTo(barA, b, a);
    this.animateBarTo(barB, a, b);
    return true;
  }

  private snapRebuild(array: readonly number[]): void {
    this.clearBars();
    this.maxValue = Math.max(1, ...array);
    this.freqScale = d3
      .scaleLinear()
      .domain([1, this.maxValue])
      .range([FREQ_MIN, FREQ_MAX])
      .clamp(true);
    this.bars = array.map((value, i) => this.createBar(`sb-${i}`, value, i));
    this.layoutAll();
  }

  private createBar(id: string, value: number, position: number): Bar {
    if (!this.barsGroup) throw new Error('bars group not initialized');
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
    this.barsGroup?.selectAll('g.bar').remove();
    this.bars = [];
  }

  private measure(): void {
    const rect = this.containerRef().nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
  }

  private barStep(): number {
    return this.bars.length === 0 ? 0 : this.width / this.bars.length;
  }

  private barWidth(): number {
    return Math.max(2, this.barStep() - BAR_GAP);
  }

  private xFor(position: number): number {
    return position * this.barStep() + BAR_GAP / 2;
  }

  private heightFor(value: number): number {
    return (value / this.maxValue) * Math.max(0, this.height - TOP_PADDING);
  }

  private layoutAll(): void {
    const barW = this.barWidth();
    for (const bar of this.bars) this.layoutBar(bar, barW);
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
    const motion = this.motion();
    const fromX = this.xFor(fromPos);
    const toX = this.xFor(toPos);
    const distance = Math.abs(toX - fromX);
    const lift = Math.min(motion.swapLiftPx, Math.max(12, distance * 0.18));
    bar.group.setAttribute('transform', `translate(${fromX}, 0)`);
    const state = { x: fromX, y: 0 };
    const target = bar.group;
    animate(state, {
      x: toX,
      y: 1,
      duration: motion.swapMs,
      ease: 'inOutQuad',
      onUpdate: () => {
        const y = -Math.sin(Math.PI * state.y) * lift;
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
      switch (state) {
        case 'comparing':
          bar.rect.setAttribute('fill', 'var(--compare-color)');
          bar.rect.setAttribute('fill-opacity', '1');
          bar.text.setAttribute('fill', 'var(--compare-color)');
          break;
        case 'swapping':
          bar.rect.setAttribute('fill', 'var(--swap-color)');
          bar.rect.setAttribute('fill-opacity', '1');
          bar.text.setAttribute('fill', 'var(--swap-color)');
          break;
        case 'sorted':
          bar.rect.setAttribute('fill', 'var(--sorted-color)');
          bar.rect.setAttribute('fill-opacity', '0.85');
          bar.text.setAttribute('fill', 'var(--sorted-color)');
          break;
        default:
          bar.rect.setAttribute('fill', 'var(--accent)');
          bar.rect.setAttribute('fill-opacity', '0.5');
          bar.text.setAttribute('fill', 'var(--text-tertiary)');
      }
    }
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const motion = this.motion();
    if (step.comparing && !samePair(previousStep?.comparing ?? null, step.comparing)) {
      this.animateCompare(step.comparing, motion);
      this.playCompare(step.comparing[0], step.comparing[1], step.array, motion);
    }

    if (step.swapping && !samePair(previousStep?.swapping ?? null, step.swapping)) {
      this.playSwap(step.swapping[0], step.swapping[1], step.array, motion);
    }

    const freshSorted = findNewSorted(previousStep?.sorted, step.sorted);
    if (freshSorted.length > 0) {
      this.animateSorted(freshSorted, motion);
    }

    if ((previousStep?.sorted.length ?? 0) < step.array.length && step.sorted.length === step.array.length) {
      this.animateCompletion(motion);
      this.playComplete(step.array, motion);
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
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 14px var(--compare-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(bar.text, {
        duration: motion.compareMs,
        scale: 1.08,
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
        scale: 1.03,
        origin: 'center bottom',
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 16px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(bar.text, {
        duration: motion.settleMs,
        delay,
        scale: 1.06,
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
      pulseSvgElement(bar.rect, {
        duration: motion.settleMs,
        delay: index * motion.completeStepMs,
        scale: 1.04,
        origin: 'center bottom',
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 18px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    });
  }

  private initAudio(): void {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
  }

  private closeAudio(): void {
    void this.audioCtx?.close();
    this.audioCtx = null;
  }

  private scheduleTone(freq: number, duration: number, delay: number, gain = AUDIO_GAIN): void {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const t0 = ctx.currentTime + delay;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain, t0);
    gainNode.gain.linearRampToValueAtTime(0, t0 + duration);
    gainNode.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    osc.connect(gainNode);
    osc.start(t0);
    osc.stop(t0 + duration + 0.01);
  }

  private scheduleSweep(
    fromFreq: number,
    toFreq: number,
    duration: number,
    delay: number,
  ): void {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const t0 = ctx.currentTime + delay;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(AUDIO_GAIN, t0);
    gainNode.gain.linearRampToValueAtTime(0, t0 + duration);
    gainNode.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(fromFreq, t0);
    osc.frequency.linearRampToValueAtTime(toFreq, t0 + duration);
    osc.connect(gainNode);
    osc.start(t0);
    osc.stop(t0 + duration + 0.01);
  }

  private playCompare(
    posA: number,
    posB: number,
    array: readonly number[],
    motion: MotionProfile,
  ): void {
    if (this.muted()) return;
    this.initAudio();
    const duration = motion.compareMs / 1000;
    this.scheduleTone(this.freqScale(array[posA]), duration, 0);
    this.scheduleTone(this.freqScale(array[posB]), duration, 0);
  }

  private playSwap(
    posA: number,
    posB: number,
    array: readonly number[],
    motion: MotionProfile,
  ): void {
    if (this.muted()) return;
    this.initAudio();
    this.scheduleSweep(
      this.freqScale(array[posA]),
      this.freqScale(array[posB]),
      motion.swapMs / 1000,
      0,
    );
  }

  private playComplete(array: readonly number[], motion: MotionProfile): void {
    if (this.muted()) return;
    this.initAudio();
    const duration = motion.completeStepMs / 1000;
    array.forEach((v, idx) => {
      this.scheduleTone(
        this.freqScale(v),
        duration,
        idx * duration,
        COMPLETE_GAIN,
      );
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
