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
} from '../../utils/visualization-motion';

interface Block {
  id: string;
  value: number;
  position: number;
  group: SVGGElement;
  rect: SVGRectElement;
  text: SVGTextElement;
}

interface BlockLayout {
  readonly x: number;
  readonly y: number;
  readonly row: number;
  readonly col: number;
}

interface BoundaryGeometry {
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
  readonly visible: boolean;
}

type BlockState = 'default' | 'comparing' | 'swapping' | 'sorted';

const BLOCK_SIZE = 48;
const BLOCK_GAP = 8;
const BLOCK_STEP = BLOCK_SIZE + BLOCK_GAP;
const ARC_HEIGHT = 56;

@Component({
  selector: 'app-block-swap-visualization',
  imports: [],
  templateUrl: './block-swap-visualization.html',
  styleUrl: './block-swap-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockSwapVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private svg: d3Selection.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private rowGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private boundaryLine: SVGLineElement | null = null;
  private blocks: Block[] = [];
  private width = 0;
  private height = 0;
  private itemsPerRow = 1;
  private gridTop = 0;
  private initialized = false;
  private resizeObserver: ResizeObserver | null = null;
  private lastStep: SortStep | null = null;
  private currentBoundary = 0;

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
    this.rowGroup = this.svg.append('g').attr('class', 'row');

    const line = this.svg
      .append('line')
      .attr('class', 'boundary')
      .attr('stroke', 'var(--accent)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 4')
      .attr('opacity', 0);
    this.boundaryLine = line.node();

    this.measure();
    this.resizeObserver = new ResizeObserver(() => {
      this.measure();
      this.layoutAll();
      if (this.lastStep) {
        this.applyStates(this.lastStep);
        this.updateBoundary(this.lastStep.boundary, false);
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
    this.clearBlocks();
    this.blocks = array.map((value, i) => this.createBlock(`bl-${i}`, value, i));
    this.currentBoundary = array.length;
    this.layoutAll();
    this.updateBoundary(this.currentBoundary, false);
    this.lastStep = null;
  }

  render(step: SortStep): void {
    const previousStep = this.lastStep;
    if (this.blocks.length !== step.array.length) {
      this.snapRebuild(step.array);
      this.lastStep = step;
      this.applyStates(step);
      this.updateBoundary(step.boundary, false);
      this.animateStepEffects(previousStep, step);
      return;
    }

    const needsSync = this.blocks.some((bl) => bl.value !== step.array[bl.position]);

    if (needsSync) {
      if (!step.swapping || !this.tryArcSwap(step)) {
        this.snapRebuild(step.array);
      }
    }

    this.lastStep = step;
    this.applyStates(step);
    this.updateBoundary(step.boundary, true);
    this.animateStepEffects(previousStep, step);
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.clearBlocks();
    this.svg?.remove();
    this.svg = null;
    this.rowGroup = null;
    this.boundaryLine = null;
    this.initialized = false;
    this.lastStep = null;
  }

  private tryArcSwap(step: SortStep): boolean {
    if (!step.swapping) return false;
    const [a, b] = step.swapping;
    const blockA = this.blocks.find((bl) => bl.position === a);
    const blockB = this.blocks.find((bl) => bl.position === b);
    if (!blockA || !blockB) return false;

    const expected = this.valuesByPosition();
    [expected[a], expected[b]] = [expected[b], expected[a]];
    if (!expected.every((v, i) => v === step.array[i])) return false;

    blockA.position = b;
    blockB.position = a;
    this.animateArc(blockA, a, b, -1);
    this.animateArc(blockB, b, a, 1);
    return true;
  }

  private snapRebuild(array: readonly number[]): void {
    this.clearBlocks();
    this.blocks = array.map((value, i) => this.createBlock(`bl-${i}`, value, i));
    this.layoutAll();
  }

  private createBlock(id: string, value: number, position: number): Block {
    if (!this.rowGroup) {
      throw new Error('row group not initialized');
    }
    const g = this.rowGroup.append('g').attr('class', 'block').attr('data-id', id);
    const rect = g
      .append('rect')
      .attr('width', BLOCK_SIZE)
      .attr('height', BLOCK_SIZE)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', 'var(--accent)')
      .attr('fill-opacity', 0.18)
      .attr('stroke', 'var(--accent)')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1);
    const text = g
      .append('text')
      .attr('x', BLOCK_SIZE / 2)
      .attr('y', BLOCK_SIZE / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('fill', 'var(--text-primary)')
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

  private clearBlocks(): void {
    if (this.rowGroup) {
      this.rowGroup.selectAll('g.block').remove();
    }
    this.blocks = [];
  }

  private measure(): void {
    const rect = this.containerRef().nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    const count = Math.max(1, this.blocks.length);
    const usableWidth = Math.max(this.width, BLOCK_SIZE);
    this.itemsPerRow = Math.max(1, Math.floor((usableWidth + BLOCK_GAP) / BLOCK_STEP));
    const rows = Math.ceil(count / this.itemsPerRow);
    const gridHeight = rows * BLOCK_SIZE + Math.max(0, rows - 1) * BLOCK_GAP;
    this.gridTop = Math.max(0, (this.height - gridHeight) / 2);
  }

  private rowItemCount(row: number): number {
    const rowStart = row * this.itemsPerRow;
    return Math.max(0, Math.min(this.itemsPerRow, this.blocks.length - rowStart));
  }

  private rowStartX(row: number): number {
    const count = this.rowItemCount(row);
    if (count <= 0) return 0;
    const rowWidth = count * BLOCK_STEP - BLOCK_GAP;
    return Math.max(0, (this.width - rowWidth) / 2);
  }

  private layoutFor(position: number): BlockLayout {
    const row = Math.floor(position / this.itemsPerRow);
    const col = position % this.itemsPerRow;
    return {
      x: this.rowStartX(row) + col * BLOCK_STEP,
      y: this.gridTop + row * BLOCK_STEP,
      row,
      col,
    };
  }

  private layoutAll(): void {
    this.measure();
    for (const bl of this.blocks) {
      const layout = this.layoutFor(bl.position);
      bl.group.setAttribute('transform', `translate(${layout.x}, ${layout.y})`);
      bl.text.textContent = String(bl.value);
    }
  }

  private animateArc(block: Block, fromPos: number, toPos: number, direction: number): void {
    const motion = this.motion();
    const from = this.layoutFor(fromPos);
    const to = this.layoutFor(toPos);
    block.group.setAttribute('transform', `translate(${from.x}, ${from.y})`);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    const controlOffset = Math.min(ARC_HEIGHT, Math.max(24, distance * 0.3, motion.swapLiftPx));
    const controlX = (from.x + to.x) / 2 + (-dy / distance) * controlOffset * direction;
    const controlY = (from.y + to.y) / 2 + (dx / distance) * controlOffset * direction;

    const state = { t: 0 };
    const target = block.group;
    animate(state, {
      t: 1,
      duration: motion.swapMs,
      ease: 'inOutQuad',
      onUpdate: () => {
        const x = this.quadraticPoint(from.x, controlX, to.x, state.t);
        const y = this.quadraticPoint(from.y, controlY, to.y, state.t);
        target.setAttribute('transform', `translate(${x}, ${y})`);
      },
      onComplete: () => {
        target.setAttribute('transform', `translate(${to.x}, ${to.y})`);
      },
    });
  }

  private applyStates(step: SortStep): void {
    const stateFor = (pos: number): BlockState => {
      if (step.swapping && (step.swapping[0] === pos || step.swapping[1] === pos))
        return 'swapping';
      if (step.comparing && (step.comparing[0] === pos || step.comparing[1] === pos))
        return 'comparing';
      if (step.sorted.includes(pos)) return 'sorted';
      return 'default';
    };

    for (const bl of this.blocks) {
      const state = stateFor(bl.position);
      bl.group.setAttribute('data-state', state);
      switch (state) {
        case 'comparing':
          bl.rect.setAttribute('fill', 'var(--compare-color)');
          bl.rect.setAttribute('fill-opacity', '0.25');
          bl.rect.setAttribute('stroke', 'var(--compare-color)');
          bl.rect.setAttribute('stroke-opacity', '1');
          bl.text.setAttribute('fill', 'var(--compare-color)');
          break;
        case 'swapping':
          bl.rect.setAttribute('fill', 'var(--swap-color)');
          bl.rect.setAttribute('fill-opacity', '0.25');
          bl.rect.setAttribute('stroke', 'var(--swap-color)');
          bl.rect.setAttribute('stroke-opacity', '1');
          bl.text.setAttribute('fill', 'var(--swap-color)');
          break;
        case 'sorted':
          bl.rect.setAttribute('fill', 'var(--sorted-color)');
          bl.rect.setAttribute('fill-opacity', '0.2');
          bl.rect.setAttribute('stroke', 'var(--sorted-color)');
          bl.rect.setAttribute('stroke-opacity', '0.8');
          bl.text.setAttribute('fill', 'var(--sorted-color)');
          break;
        default:
          bl.rect.setAttribute('fill', 'var(--accent)');
          bl.rect.setAttribute('fill-opacity', '0.18');
          bl.rect.setAttribute('stroke', 'var(--accent)');
          bl.rect.setAttribute('stroke-opacity', '0.5');
          bl.text.setAttribute('fill', 'var(--text-primary)');
      }
    }
  }

  private valuesByPosition(): number[] {
    const values = new Array<number>(this.blocks.length);
    for (const block of this.blocks) {
      values[block.position] = block.value;
    }
    return values;
  }

  private quadraticPoint(start: number, control: number, end: number, t: number): number {
    const mt = 1 - t;
    return mt * mt * start + 2 * mt * t * control + t * t * end;
  }

  private boundaryGeometry(position: number): BoundaryGeometry {
    if (this.blocks.length === 0) {
      return { x: 0, y1: 0, y2: 0, visible: false };
    }

    const clamped = Math.max(0, Math.min(this.blocks.length, position));
    if (clamped >= this.blocks.length) {
      const lastIndex = this.blocks.length - 1;
      const lastLayout = this.layoutFor(lastIndex);
      const x =
        this.rowStartX(lastLayout.row) + this.rowItemCount(lastLayout.row) * BLOCK_STEP - BLOCK_GAP / 2;
      return {
        x,
        y1: lastLayout.y - 12,
        y2: lastLayout.y + BLOCK_SIZE + 12,
        visible: false,
      };
    }

    const row = Math.floor(clamped / this.itemsPerRow);
    const col = clamped % this.itemsPerRow;
    const y = this.gridTop + row * BLOCK_STEP;
    return {
      x: this.rowStartX(row) + col * BLOCK_STEP - BLOCK_GAP / 2,
      y1: y - 12,
      y2: y + BLOCK_SIZE + 12,
      visible: true,
    };
  }

  private updateBoundary(target: number, shouldAnimate: boolean): void {
    if (!this.boundaryLine) return;
    const clamped = Math.max(0, Math.min(this.blocks.length, target));
    const targetGeometry = this.boundaryGeometry(clamped);
    const motion = this.motion();

    if (!shouldAnimate) {
      this.boundaryLine.setAttribute('x1', String(targetGeometry.x));
      this.boundaryLine.setAttribute('x2', String(targetGeometry.x));
      this.boundaryLine.setAttribute('y1', String(targetGeometry.y1));
      this.boundaryLine.setAttribute('y2', String(targetGeometry.y2));
      this.boundaryLine.setAttribute('opacity', targetGeometry.visible ? '0.8' : '0');
      this.currentBoundary = clamped;
      return;
    }

    const fromGeometry = this.boundaryGeometry(this.currentBoundary);
    const line = this.boundaryLine;
    const state = {
      x: fromGeometry.x,
      y1: fromGeometry.y1,
      y2: fromGeometry.y2,
      opacity: fromGeometry.visible ? 0.8 : 0,
    };
    animate(state, {
      x: targetGeometry.x,
      y1: targetGeometry.y1,
      y2: targetGeometry.y2,
      opacity: targetGeometry.visible ? 0.8 : 0,
      duration: motion.settleMs,
      ease: 'outQuad',
      onUpdate: () => {
        line.setAttribute('x1', String(state.x));
        line.setAttribute('x2', String(state.x));
        line.setAttribute('y1', String(state.y1));
        line.setAttribute('y2', String(state.y2));
        line.setAttribute('opacity', String(state.opacity));
      },
      onComplete: () => {
        line.setAttribute('x1', String(targetGeometry.x));
        line.setAttribute('x2', String(targetGeometry.x));
        line.setAttribute('y1', String(targetGeometry.y1));
        line.setAttribute('y2', String(targetGeometry.y2));
        line.setAttribute('opacity', targetGeometry.visible ? '0.8' : '0');
      },
    });
    this.currentBoundary = clamped;
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
      const block = this.findBlock(position);
      if (!block) continue;
      pulseSvgElement(block.rect, {
        duration: motion.compareMs,
        scale: 1.08,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 16px var(--compare-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(block.text, {
        duration: motion.compareMs,
        scale: 1.12,
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
      const block = this.findBlock(position);
      if (!block) return;
      const delay = index * motion.completeStepMs;
      pulseSvgElement(block.rect, {
        duration: motion.settleMs,
        delay,
        scale: 1.06,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 18px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
      pulseSvgElement(block.text, {
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
    const ordered = [...this.blocks].sort((left, right) => left.position - right.position);
    ordered.forEach((block, index) => {
      const delay = index * motion.completeStepMs;
      pulseSvgElement(block.rect, {
        duration: motion.settleMs,
        delay,
        scale: 1.08,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          'drop-shadow(0 0 20px var(--sorted-color))',
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    });
  }

  private findBlock(position: number): Block | undefined {
    return this.blocks.find((block) => block.position === position);
  }

  private motion(): MotionProfile {
    return createMotionProfile(this.speed());
  }
}
