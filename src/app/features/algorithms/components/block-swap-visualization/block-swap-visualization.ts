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

interface Block {
  id: string;
  value: number;
  position: number;
  group: SVGGElement;
  shadow: SVGRectElement;
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

interface StateStyle {
  readonly fill: string;
  readonly stroke: string;
  readonly textFill: string;
  readonly shadowFill: string;
  readonly shadowOpacity: number;
}

/** Single source of truth for each visual state. Each tile is a SOLID
 *  fill + thin stroke — no backplate, no inner glow core, no gloss
 *  overlay. Colors alias directly onto the app's identity palette so
 *  the block field reads as the same UI language as the rest of the
 *  app (cyan = attending, pink = acting, lime = done). */
const BLOCK_STATE_STYLES: Record<BlockState, StateStyle> = {
  default: {
    fill: 'rgb(var(--viz-state-default-rgb) / 0.7)',
    stroke: 'rgb(var(--viz-state-default-rgb) / 0.9)',
    textFill: 'var(--text-primary)',
    shadowFill: 'rgba(2, 6, 23, 0.5)',
    shadowOpacity: 0.38,
  },
  comparing: {
    fill: 'rgb(var(--viz-state-compare-rgb) / 0.92)',
    stroke: 'var(--viz-state-compare)',
    textFill: 'var(--viz-state-compare)',
    shadowFill: 'var(--viz-state-compare)',
    shadowOpacity: 0.24,
  },
  swapping: {
    fill: 'rgb(var(--viz-state-swap-rgb) / 0.92)',
    stroke: 'var(--viz-state-swap)',
    textFill: 'var(--viz-state-swap)',
    shadowFill: 'var(--viz-state-swap)',
    shadowOpacity: 0.26,
  },
  sorted: {
    fill: 'rgb(var(--viz-state-sorted-rgb) / 0.92)',
    stroke: 'var(--viz-state-sorted)',
    textFill: 'var(--viz-state-sorted)',
    shadowFill: 'var(--viz-state-sorted)',
    shadowOpacity: 0.22,
  },
};

const BLOCK_SIZE = 52;
const BLOCK_GAP = 10;
const BLOCK_STEP = BLOCK_SIZE + BLOCK_GAP;
const ARC_HEIGHT = 72;
const STAGE_PADDING = 24;

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
  private boundaryGroup: d3Selection.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private boundaryGlow: SVGLineElement | null = null;
  private boundaryLine: SVGLineElement | null = null;
  private boundaryTopCap: SVGCircleElement | null = null;
  private boundaryBottomCap: SVGCircleElement | null = null;
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
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'none');

    this.rowGroup = this.svg.append('g').attr('class', 'row');

    this.boundaryGroup = this.svg.append('g').attr('pointer-events', 'none');
    this.boundaryGlow = this.boundaryGroup
      .append('line')
      .attr('stroke', 'rgb(var(--viz-state-sorted-rgb) / 0.32)')
      .attr('stroke-width', 16)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .node() as SVGLineElement;
    this.boundaryLine = this.boundaryGroup
      .append('line')
      .attr('stroke', 'var(--viz-state-sorted)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6 8')
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .node() as SVGLineElement;
    this.boundaryTopCap = this.boundaryGroup
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', 'var(--viz-state-sorted)')
      .attr('opacity', 0)
      .node() as SVGCircleElement;
    this.boundaryBottomCap = this.boundaryGroup
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', 'var(--viz-state-sorted)')
      .attr('opacity', 0)
      .node() as SVGCircleElement;

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

    const needsSync = this.blocks.some((block) => block.value !== step.array[block.position]);
    if (needsSync && (!step.swapping || !this.tryArcSwap(step))) {
      this.snapRebuild(step.array);
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
    this.boundaryGroup = null;
    this.boundaryGlow = null;
    this.boundaryLine = null;
    this.boundaryTopCap = null;
    this.boundaryBottomCap = null;
    this.initialized = false;
    this.lastStep = null;
  }

  private tryArcSwap(step: SortStep): boolean {
    if (!step.swapping) return false;
    const [a, b] = step.swapping;
    const blockA = this.blocks.find((block) => block.position === a);
    const blockB = this.blocks.find((block) => block.position === b);
    if (!blockA || !blockB) return false;

    const expected = this.valuesByPosition();
    [expected[a], expected[b]] = [expected[b], expected[a]];
    if (!expected.every((value, index) => value === step.array[index])) return false;

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
    const shadow = g
      .append('rect')
      .attr('x', '4')
      .attr('y', '7')
      .attr('width', String(BLOCK_SIZE - 8))
      .attr('height', String(BLOCK_SIZE - 4))
      .attr('rx', '15')
      .attr('ry', '15')
      .attr('fill', 'rgba(2, 6, 23, 0.5)')
      .attr('opacity', 0.38)
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center center');
    const defaultStyle = BLOCK_STATE_STYLES.default;
    const rect = g
      .append('rect')
      .attr('width', String(BLOCK_SIZE))
      .attr('height', String(BLOCK_SIZE))
      .attr('rx', '14')
      .attr('ry', '14')
      .attr('fill', defaultStyle.fill)
      .attr('stroke', defaultStyle.stroke)
      .attr('stroke-width', 1)
      .style('shape-rendering', 'geometricPrecision')
      .style('transform-box', 'fill-box')
      .style('transform-origin', 'center center');
    const text = g
      .append('text')
      .attr('x', String(BLOCK_SIZE / 2))
      .attr('y', String(BLOCK_SIZE / 2 + 5))
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('fill', defaultStyle.textFill)
      .style('font-family', 'var(--font-mono)')
      .style('font-weight', '600')
      .style('letter-spacing', '0.03em')
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
      shadow: shadow.node() as SVGRectElement,
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
    this.svg?.attr('viewBox', `0 0 ${Math.max(this.width, 1)} ${Math.max(this.height, 1)}`);

    const count = Math.max(1, this.blocks.length);
    const usableWidth = Math.max(this.width - STAGE_PADDING * 2, BLOCK_SIZE);
    this.itemsPerRow = Math.max(1, Math.floor((usableWidth + BLOCK_GAP) / BLOCK_STEP));
    const rows = Math.ceil(count / this.itemsPerRow);
    const gridHeight = rows * BLOCK_SIZE + Math.max(0, rows - 1) * BLOCK_GAP;
    this.gridTop = Math.max(18, (this.height - gridHeight) / 2);
  }

  private rowItemCount(row: number): number {
    const rowStart = row * this.itemsPerRow;
    return Math.max(0, Math.min(this.itemsPerRow, this.blocks.length - rowStart));
  }

  private rowStartX(row: number): number {
    const count = this.rowItemCount(row);
    if (count <= 0) return STAGE_PADDING;
    const rowWidth = count * BLOCK_STEP - BLOCK_GAP;
    return Math.max(STAGE_PADDING, (this.width - rowWidth) / 2);
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
    for (const block of this.blocks) {
      const layout = this.layoutFor(block.position);
      block.group.setAttribute('transform', `translate(${layout.x}, ${layout.y})`);
      block.text.textContent = String(block.value);
      block.shadow.removeAttribute('transform');
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
    const controlOffset = Math.min(
      ARC_HEIGHT,
      Math.max(28, distance * 0.32, motion.swapLiftPx + 16),
    );
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
        const arc = Math.sin(Math.PI * state.t);
        target.setAttribute('transform', `translate(${x}, ${y})`);
        block.shadow.setAttribute(
          'transform',
          `translate(0, ${arc * 7}) scale(${1 - arc * 0.08}, ${1 - arc * 0.18})`,
        );
      },
      onComplete: () => {
        target.setAttribute('transform', `translate(${to.x}, ${to.y})`);
        block.shadow.removeAttribute('transform');
      },
    });
  }

  private applyStates(step: SortStep): void {
    const stateFor = (position: number): BlockState => {
      if (step.swapping && (step.swapping[0] === position || step.swapping[1] === position))
        return 'swapping';
      if (step.comparing && (step.comparing[0] === position || step.comparing[1] === position))
        return 'comparing';
      if (step.sorted.includes(position)) return 'sorted';
      return 'default';
    };

    for (const block of this.blocks) {
      const state = stateFor(block.position);
      block.group.setAttribute('data-state', state);
      this.applyStateStyles(block, state);
    }
  }

  private applyStateStyles(block: Block, state: BlockState): void {
    const style = BLOCK_STATE_STYLES[state];
    block.rect.setAttribute('fill', style.fill);
    block.rect.setAttribute('stroke', style.stroke);
    block.text.setAttribute('fill', style.textFill);
    block.shadow.setAttribute('fill', style.shadowFill);
    block.shadow.setAttribute('opacity', String(style.shadowOpacity));
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
        this.rowStartX(lastLayout.row) +
        this.rowItemCount(lastLayout.row) * BLOCK_STEP -
        BLOCK_GAP / 2;
      return {
        x,
        y1: lastLayout.y - 18,
        y2: lastLayout.y + BLOCK_SIZE + 18,
        visible: false,
      };
    }

    const row = Math.floor(clamped / this.itemsPerRow);
    const col = clamped % this.itemsPerRow;
    const y = this.gridTop + row * BLOCK_STEP;
    return {
      x: this.rowStartX(row) + col * BLOCK_STEP - BLOCK_GAP / 2,
      y1: y - 18,
      y2: y + BLOCK_SIZE + 18,
      visible: true,
    };
  }

  private updateBoundary(target: number, shouldAnimate: boolean): void {
    if (
      !this.boundaryGlow ||
      !this.boundaryLine ||
      !this.boundaryTopCap ||
      !this.boundaryBottomCap
    ) {
      return;
    }

    const clamped = Math.max(0, Math.min(this.blocks.length, target));
    const targetGeometry = this.boundaryGeometry(clamped);
    const motion = this.motion();

    if (!shouldAnimate) {
      this.setBoundaryGeometry(targetGeometry);
      this.currentBoundary = clamped;
      return;
    }

    const fromGeometry = this.boundaryGeometry(this.currentBoundary);
    const state = {
      x: fromGeometry.x,
      y1: fromGeometry.y1,
      y2: fromGeometry.y2,
      opacity: fromGeometry.visible ? 1 : 0,
    };
    animate(state, {
      x: targetGeometry.x,
      y1: targetGeometry.y1,
      y2: targetGeometry.y2,
      opacity: targetGeometry.visible ? 1 : 0,
      duration: motion.settleMs,
      ease: 'outQuad',
      onUpdate: () => {
        this.setBoundaryGeometry({
          x: state.x,
          y1: state.y1,
          y2: state.y2,
          visible: state.opacity > 0.01,
        });
      },
      onComplete: () => {
        this.setBoundaryGeometry(targetGeometry);
      },
    });
    this.currentBoundary = clamped;
  }

  private setBoundaryGeometry(geometry: BoundaryGeometry): void {
    if (
      !this.boundaryGlow ||
      !this.boundaryLine ||
      !this.boundaryTopCap ||
      !this.boundaryBottomCap
    ) {
      return;
    }

    const opacity = geometry.visible ? 1 : 0;
    this.boundaryGlow.setAttribute('x1', String(geometry.x));
    this.boundaryGlow.setAttribute('x2', String(geometry.x));
    this.boundaryGlow.setAttribute('y1', String(geometry.y1));
    this.boundaryGlow.setAttribute('y2', String(geometry.y2));
    this.boundaryGlow.setAttribute('opacity', String(opacity * 0.7));

    this.boundaryLine.setAttribute('x1', String(geometry.x));
    this.boundaryLine.setAttribute('x2', String(geometry.x));
    this.boundaryLine.setAttribute('y1', String(geometry.y1));
    this.boundaryLine.setAttribute('y2', String(geometry.y2));
    this.boundaryLine.setAttribute('opacity', String(opacity));

    this.boundaryTopCap.setAttribute('cx', String(geometry.x));
    this.boundaryTopCap.setAttribute('cy', String(geometry.y1));
    this.boundaryTopCap.setAttribute('opacity', String(opacity));

    this.boundaryBottomCap.setAttribute('cx', String(geometry.x));
    this.boundaryBottomCap.setAttribute('cy', String(geometry.y2));
    this.boundaryBottomCap.setAttribute('opacity', String(opacity));
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
      const block = this.findBlock(position);
      if (!block) continue;
      pulseSvgElement(block.rect, {
        duration: motion.compareMs,
        scale: 1.06,
        filter: glowFilter('var(--viz-state-compare)', 18),
      });
      pulseSvgElement(block.text, {
        duration: motion.compareMs,
        scale: 1.08,
        filter: glowFilter('var(--viz-state-compare)', 10),
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
        scale: 1.05,
        filter: glowFilter('var(--viz-state-sorted)', 20),
      });
      pulseSvgElement(block.text, {
        duration: motion.settleMs,
        delay,
        scale: 1.08,
        filter: glowFilter('var(--viz-state-sorted)', 10),
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
        scale: 1.07,
        filter: glowFilter('var(--viz-state-sorted)', 22),
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
