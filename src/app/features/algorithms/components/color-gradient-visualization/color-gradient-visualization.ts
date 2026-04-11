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

interface Cell {
  id: string;
  value: number;
  position: number;
  group: SVGGElement;
  rect: SVGRectElement;
  text: SVGTextElement;
}

interface CellLayout {
  readonly x: number;
  readonly y: number;
}

type CellState = 'default' | 'comparing' | 'swapping' | 'sorted';

const CELL_WIDTH = 44;
const CELL_HEIGHT = 60;
const CELL_GAP = 6;
const MIN_OPACITY = 0.15;
const MAX_OPACITY = 1;
const HIDE_LABEL_THRESHOLD = 32;
const SWAP_DURATION = 200;
const SWAP_CURVE_OFFSET = 24;

@Component({
  selector: 'app-color-gradient-visualization',
  imports: [],
  templateUrl: './color-gradient-visualization.html',
  styleUrl: './color-gradient-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorGradientVisualization
  implements AfterViewInit, OnDestroy, VisualizationRenderer
{
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private rowGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private cells: Cell[] = [];
  private width = 0;
  private height = 0;
  private itemsPerRow = 1;
  private gridTop = 0;
  private opacityScale: d3.ScaleLinear<number, number> = d3.scaleLinear();
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
    this.rowGroup = this.svg.append('g').attr('class', 'row');

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
    this.clearCells();
    this.opacityScale = d3
      .scaleLinear<number, number>()
      .domain([Math.min(1, ...array), Math.max(1, ...array)])
      .range([MIN_OPACITY, MAX_OPACITY])
      .clamp(true);
    this.cells = array.map((value, i) => this.createCell(`cg-${i}`, value, i));
    this.layoutAll();
    this.lastStep = null;
  }

  render(step: SortStep): void {
    if (this.cells.length !== step.array.length) {
      this.snapRebuild(step.array);
      this.lastStep = step;
      this.applyStates(step);
      return;
    }

    const needsSync = this.cells.some((c) => c.value !== step.array[c.position]);

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
    this.clearCells();
    this.svg?.remove();
    this.svg = null;
    this.rowGroup = null;
    this.initialized = false;
    this.lastStep = null;
  }

  private tryAnimatedSwap(step: SortStep): boolean {
    if (!step.swapping) return false;
    const [a, b] = step.swapping;
    const cellA = this.cells.find((c) => c.position === a);
    const cellB = this.cells.find((c) => c.position === b);
    if (!cellA || !cellB) return false;

    const expected = this.valuesByPosition();
    [expected[a], expected[b]] = [expected[b], expected[a]];
    if (!expected.every((v, i) => v === step.array[i])) return false;

    cellA.position = b;
    cellB.position = a;
    this.animateCellTo(cellA, a, b, -1);
    this.animateCellTo(cellB, b, a, 1);
    return true;
  }

  private snapRebuild(array: readonly number[]): void {
    this.clearCells();
    this.opacityScale = d3
      .scaleLinear<number, number>()
      .domain([Math.min(1, ...array), Math.max(1, ...array)])
      .range([MIN_OPACITY, MAX_OPACITY])
      .clamp(true);
    this.cells = array.map((value, i) => this.createCell(`cg-${i}`, value, i));
    this.layoutAll();
  }

  private createCell(id: string, value: number, position: number): Cell {
    if (!this.rowGroup) {
      throw new Error('row group not initialized');
    }
    const g = this.rowGroup.append('g').attr('class', 'cell').attr('data-id', id);
    const rect = g
      .append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'var(--accent)')
      .attr('fill-opacity', this.opacityScale(value))
      .attr('stroke', 'var(--border)')
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 2);
    const text = g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
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

  private clearCells(): void {
    if (this.rowGroup) {
      this.rowGroup.selectAll('g.cell').remove();
    }
    this.cells = [];
  }

  private measure(): void {
    const rect = this.containerRef().nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    const count = Math.max(1, this.cells.length);
    const usableWidth = Math.max(this.width, CELL_WIDTH);
    const itemStep = CELL_WIDTH + CELL_GAP;
    this.itemsPerRow = Math.max(1, Math.floor((usableWidth + CELL_GAP) / itemStep));
    const rows = Math.ceil(count / this.itemsPerRow);
    const gridHeight = rows * CELL_HEIGHT + Math.max(0, rows - 1) * CELL_GAP;
    this.gridTop = Math.max(0, (this.height - gridHeight) / 2);
  }

  private rowItemCount(row: number): number {
    const rowStart = row * this.itemsPerRow;
    return Math.max(0, Math.min(this.itemsPerRow, this.cells.length - rowStart));
  }

  private rowStartX(row: number): number {
    const count = this.rowItemCount(row);
    if (count <= 0) return 0;
    const rowWidth = count * (CELL_WIDTH + CELL_GAP) - CELL_GAP;
    return Math.max(0, (this.width - rowWidth) / 2);
  }

  private layoutFor(position: number): CellLayout {
    const row = Math.floor(position / this.itemsPerRow);
    const col = position % this.itemsPerRow;
    return {
      x: this.rowStartX(row) + col * (CELL_WIDTH + CELL_GAP),
      y: this.gridTop + row * (CELL_HEIGHT + CELL_GAP),
    };
  }

  private showLabels(): boolean {
    return this.cells.length < HIDE_LABEL_THRESHOLD;
  }

  private layoutAll(): void {
    this.measure();
    const showLabels = this.showLabels();
    for (const cell of this.cells) {
      const layout = this.layoutFor(cell.position);
      cell.group.setAttribute('transform', `translate(${layout.x}, ${layout.y})`);
      cell.rect.setAttribute('x', '0');
      cell.rect.setAttribute('y', '0');
      cell.rect.setAttribute('width', String(CELL_WIDTH));
      cell.rect.setAttribute('height', String(CELL_HEIGHT));
      cell.rect.setAttribute('fill-opacity', String(this.opacityScale(cell.value)));
      cell.text.setAttribute('x', String(CELL_WIDTH / 2));
      cell.text.setAttribute('y', String(CELL_HEIGHT / 2 + 4));
      cell.text.textContent = showLabels ? String(cell.value) : '';
    }
  }

  private animateCellTo(cell: Cell, fromPos: number, toPos: number, direction: number): void {
    const from = this.layoutFor(fromPos);
    const to = this.layoutFor(toPos);
    cell.group.setAttribute('transform', `translate(${from.x}, ${from.y})`);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    const controlX =
      (from.x + to.x) / 2 + (-dy / distance) * SWAP_CURVE_OFFSET * direction;
    const controlY = (from.y + to.y) / 2 + (dx / distance) * SWAP_CURVE_OFFSET * direction;
    const state = { t: 0 };
    const target = cell.group;
    animate(state, {
      t: 1,
      duration: SWAP_DURATION,
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
    const stateFor = (pos: number): CellState => {
      if (step.swapping && (step.swapping[0] === pos || step.swapping[1] === pos))
        return 'swapping';
      if (step.comparing && (step.comparing[0] === pos || step.comparing[1] === pos))
        return 'comparing';
      if (step.sorted.includes(pos)) return 'sorted';
      return 'default';
    };

    for (const cell of this.cells) {
      const state = stateFor(cell.position);
      cell.group.setAttribute('data-state', state);
      switch (state) {
        case 'comparing':
          cell.rect.setAttribute('stroke', 'var(--compare-color)');
          cell.rect.setAttribute('stroke-opacity', '1');
          break;
        case 'swapping':
          cell.rect.setAttribute('stroke', 'var(--swap-color)');
          cell.rect.setAttribute('stroke-opacity', '1');
          break;
        case 'sorted':
          cell.rect.setAttribute('stroke', 'var(--sorted-color)');
          cell.rect.setAttribute('stroke-opacity', '1');
          break;
        default:
          cell.rect.setAttribute('stroke', 'var(--border)');
          cell.rect.setAttribute('stroke-opacity', '1');
      }
    }
  }

  private valuesByPosition(): number[] {
    const values = new Array<number>(this.cells.length);
    for (const cell of this.cells) {
      values[cell.position] = cell.value;
    }
    return values;
  }

  private quadraticPoint(start: number, control: number, end: number, t: number): number {
    const mt = 1 - t;
    return mt * mt * start + 2 * mt * t * control + t * t * end;
  }
}
