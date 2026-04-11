import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { animate } from 'animejs';

import {
  SortBucketSnapshot,
  SortItemSnapshot,
  SortStep,
} from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  MotionProfile,
  createMotionProfile,
  pulseSvgElement,
} from '../../utils/visualization-motion';

interface MutableGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

interface CardDigitsPayload {
  readonly digits: readonly string[];
  readonly colors: readonly string[];
}

interface CardGeometry extends MutableGeometry {
  readonly zone: 'top' | 'bucket';
  readonly bucket: number | null;
}

interface Card {
  readonly id: string;
  value: number;
  readonly group: SVGGElement;
  readonly rect: SVGRectElement;
  readonly gloss: SVGRectElement;
  readonly accent: SVGRectElement;
  readonly frame: SVGRectElement;
  readonly digitGroup: SVGGElement;
  digits: SVGTextElement[];
  geometry: MutableGeometry;
  zone: 'top' | 'bucket';
  bucket: number | null;
  digitsPayload: CardDigitsPayload;
}

interface BucketElements {
  readonly group: SVGGElement;
  readonly panel: SVGRectElement;
  readonly header: SVGRectElement;
  readonly label: SVGTextElement;
  readonly count: SVGTextElement;
}

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface LayoutSnapshot {
  readonly placements: Map<string, CardGeometry>;
  readonly bucketRects: Map<number, Rect>;
}

interface DigitBadge {
  readonly label: string;
  readonly active: boolean;
}

const HUD_Y = 104;
const STAGE_PADDING_X = 28;
const STAGE_PADDING_BOTTOM = 28;
const TOP_GAP_X = 12;
const TOP_GAP_Y = 14;
const BUCKET_GAP_X = 16;
const BUCKET_GAP_Y = 18;
const BUCKET_HEADER_HEIGHT = 30;
const BUCKET_PADDING = 12;
const BUCKET_CARD_GAP_X = 8;
const BUCKET_CARD_GAP_Y = 8;

const BUCKET_COLORS = [
  '#38bdf8',
  '#22d3ee',
  '#06b6d4',
  '#2dd4bf',
  '#34d399',
  '#a3e635',
  '#facc15',
  '#f59e0b',
  '#fb7185',
  '#f472b6',
] as const;

@Component({
  selector: 'app-radix-bucket-visualization',
  imports: [],
  templateUrl: './radix-bucket-visualization.html',
  styleUrl: './radix-bucket-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadixBucketVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly phaseLabel = computed(() => phaseLabelFor(this.step()?.phase ?? 'idle'));
  readonly passLabel = computed(() => {
    const step = this.step();
    const maxDigits = step?.maxDigits ?? Math.max(1, String(Math.max(0, ...this.array())).length);
    if (step?.digitIndex == null) {
      return `Pass 1/${maxDigits}`;
    }
    return `Pass ${step.digitIndex + 1}/${maxDigits}`;
  });
  readonly digitBadges = computed<readonly DigitBadge[]>(() => {
    const step = this.step();
    const maxDigits = step?.maxDigits ?? Math.max(1, String(Math.max(0, ...this.array())).length);
    return Array.from({ length: maxDigits }, (_, index) => {
      const exponent = maxDigits - index - 1;
      return {
        label: digitPowerLabel(exponent),
        active: step?.digitIndex === exponent,
      };
    });
  });
  readonly activeSummary = computed(() => {
    const step = this.step();
    if (!step) return 'Preparing buckets';
    const activeValue = step.activeItemId ? this.findValueForId(step, step.activeItemId) : null;
    if (step.phase === 'distribute' && activeValue !== null && step.activeBucket !== null) {
      return `Routing ${activeValue} to bucket ${step.activeBucket}`;
    }
    if (step.phase === 'gather' && activeValue !== null && step.activeBucket !== null) {
      return `Collecting ${activeValue} from bucket ${step.activeBucket}`;
    }
    if (step.phase === 'focus-digit' && step.digitIndex !== null && step.digitIndex !== undefined) {
      return `Scanning ${digitName(step.digitIndex)}`;
    }
    return step.description;
  });

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private bucketLayer: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private cardLayer: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private flowPath: SVGPathElement | null = null;
  private bucketElements = new Map<number, BucketElements>();
  private cards = new Map<string, Card>();
  private width = 0;
  private height = 0;
  private initialized = false;
  private resizeObserver: ResizeObserver | null = null;
  private lastStep: SortStep | null = null;
  private lastLayout: LayoutSnapshot | null = null;

  constructor() {
    effect(() => {
      const arr = this.array();
      if (!this.initialized) return;
      this.initialize(arr);
      untracked(() => {
        const step = this.step();
        if (step) this.render(step);
      });
    });

    effect(() => {
      const step = this.step();
      if (this.initialized && step) {
        this.render(step);
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

    this.bucketLayer = this.svg.append('g').attr('class', 'buckets');
    const flow = this.svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', '8 8')
      .attr('opacity', 0);
    this.flowPath = flow.node();
    this.cardLayer = this.svg.append('g').attr('class', 'cards');

    for (let bucket = 0; bucket < 10; bucket++) {
      this.bucketElements.set(bucket, this.createBucketElements(bucket));
    }

    this.measure();
    this.resizeObserver = new ResizeObserver(() => {
      this.measure();
      const step = this.lastStep ?? this.createFallbackStep(this.array());
      const layout = this.computeLayout(step);
      this.updateBucketPanels(step, layout, false);
      this.updateFlowPath(step, layout, false);
      this.applyLayout(step, layout, false);
      this.lastLayout = layout;
    });
    this.resizeObserver.observe(container);
    this.initialized = true;
    this.initialize(this.array());
    const step = this.step();
    if (step) {
      this.render(step);
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initialize(array: readonly number[]): void {
    this.clearCards();
    array.forEach((value, index) => {
      this.cards.set(`rdx-${index}`, this.createCard(`rdx-${index}`, value));
    });
    const step = this.step() ?? this.createFallbackStep(array);
    this.ensureCards(step);
    const layout = this.computeLayout(step);
    this.updateBucketPanels(step, layout, false);
    this.updateFlowPath(step, layout, false);
    this.applyLayout(step, layout, false);
    this.lastLayout = layout;
    this.lastStep = null;
  }

  render(step: SortStep): void {
    this.ensureCards(step);
    const previousStep = this.lastStep;
    const layout = this.computeLayout(step);
    this.updateBucketPanels(step, layout, true);
    this.updateFlowPath(step, layout, true);
    this.applyLayout(step, layout, true);
    this.animateStepEffects(previousStep, step, layout);
    this.lastLayout = layout;
    this.lastStep = step;
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.clearCards();
    this.bucketElements.clear();
    this.flowPath = null;
    this.svg?.remove();
    this.svg = null;
    this.bucketLayer = null;
    this.cardLayer = null;
    this.initialized = false;
    this.lastLayout = null;
    this.lastStep = null;
  }

  private motion(): MotionProfile {
    return createMotionProfile(this.speed());
  }

  private createBucketElements(bucket: number): BucketElements {
    if (!this.bucketLayer) {
      throw new Error('bucket layer not initialized');
    }
    const group = this.bucketLayer.append('g').attr('data-bucket', bucket);
    const panel = group
      .append('rect')
      .attr('rx', 18)
      .attr('ry', 18)
      .attr('fill', 'rgba(11, 18, 33, 0.7)')
      .attr('stroke-width', 1.25)
      .attr('stroke', 'rgba(255, 255, 255, 0.08)');
    const header = group
      .append('rect')
      .attr('rx', 18)
      .attr('ry', 18)
      .attr('fill-opacity', 0.18);
    const label = group
      .append('text')
      .attr('font-size', 11)
      .attr('font-weight', 700)
      .attr('fill', 'rgba(241, 245, 249, 0.95)')
      .style('font-family', 'var(--font-mono)');
    const count = group
      .append('text')
      .attr('font-size', 11)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(196, 206, 226, 0.72)')
      .style('font-family', 'var(--font-mono)');
    return {
      group: group.node() as SVGGElement,
      panel: panel.node() as SVGRectElement,
      header: header.node() as SVGRectElement,
      label: label.node() as SVGTextElement,
      count: count.node() as SVGTextElement,
    };
  }

  private createCard(id: string, value: number): Card {
    if (!this.cardLayer) {
      throw new Error('card layer not initialized');
    }
    const group = this.cardLayer.append('g').attr('class', 'card').attr('data-id', id);
    const rect = group
      .append('rect')
      .attr('rx', 16)
      .attr('ry', 16)
      .attr('stroke-width', 1.3);
    const gloss = group
      .append('rect')
      .attr('rx', 16)
      .attr('ry', 16)
      .attr('fill', 'rgba(255, 255, 255, 0.06)');
    const accent = group
      .append('rect')
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('fill-opacity', 0.92);
    const frame = group
      .append('rect')
      .attr('rx', 16)
      .attr('ry', 16)
      .attr('fill', 'none')
      .attr('stroke-width', 1);
    const digitGroup = group.append('g').attr('class', 'digits');
    return {
      id,
      value,
      group: group.node() as SVGGElement,
      rect: rect.node() as SVGRectElement,
      gloss: gloss.node() as SVGRectElement,
      accent: accent.node() as SVGRectElement,
      frame: frame.node() as SVGRectElement,
      digitGroup: digitGroup.node() as SVGGElement,
      digits: [],
      geometry: { x: 0, y: 0, width: 68, height: 52, fontSize: 15 },
      zone: 'top',
      bucket: null,
      digitsPayload: { digits: [String(value)], colors: ['rgba(241, 245, 249, 0.92)'] },
    };
  }

  private clearCards(): void {
    this.cardLayer?.selectAll('g.card').remove();
    this.cards.clear();
  }

  private measure(): void {
    const rect = this.containerRef().nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
  }

  private ensureCards(step: SortStep): void {
    const items = this.collectUniqueItems(step);
    for (const item of items) {
      const existing = this.cards.get(item.id);
      if (existing) {
        existing.value = item.value;
        continue;
      }
      this.cards.set(item.id, this.createCard(item.id, item.value));
    }
  }

  private collectUniqueItems(step: SortStep): readonly SortItemSnapshot[] {
    const byId = new Map<string, SortItemSnapshot>();
    const collect = (items: readonly SortItemSnapshot[] | null | undefined): void => {
      items?.forEach((item) => byId.set(item.id, item));
    };
    collect(step.items);
    collect(step.sourceItems);
    step.buckets?.forEach((bucket) => collect(bucket.items));
    if (byId.size > 0) {
      return [...byId.values()];
    }
    return this.array().map((value, index) => ({ id: `rdx-${index}`, value }));
  }

  private computeLayout(step: SortStep): LayoutSnapshot {
    const placements = new Map<string, CardGeometry>();
    const sourceItems = step.sourceItems?.length ? step.sourceItems : step.items ?? this.collectUniqueItems(step);
    const topItems = this.resolveTopItems(step, sourceItems);
    const totalItems = Math.max(this.cards.size, sourceItems.length, this.array().length, 1);
    const usableWidth = Math.max(320, this.width - STAGE_PADDING_X * 2);
    const preferredTopWidth = this.width >= 1100 ? 78 : this.width >= 880 ? 72 : 64;
    const topCols = Math.max(
      1,
      Math.min(totalItems, Math.floor((usableWidth + TOP_GAP_X) / (preferredTopWidth + TOP_GAP_X))),
    );
    const topWidth = clamp(
      (usableWidth - TOP_GAP_X * Math.max(0, topCols - 1)) / topCols,
      56,
      preferredTopWidth,
    );
    const topHeight = Math.round(topWidth * 0.72);
    const topFontSize = clamp(topHeight * 0.3, 12, 17);
    const topRows = Math.max(1, Math.ceil(Math.max(1, topItems.length) / topCols));
    const topAreaHeight = topRows * topHeight + Math.max(0, topRows - 1) * TOP_GAP_Y;
    const bucketTop = HUD_Y + topAreaHeight + 54;

    this.layoutRow(
      topItems,
      placements,
      {
        x: STAGE_PADDING_X,
        y: HUD_Y,
        width: usableWidth,
        height: topAreaHeight,
      },
      topCols,
      {
        width: topWidth,
        height: topHeight,
        fontSize: topFontSize,
        zone: 'top',
        bucket: null,
      },
      TOP_GAP_X,
      TOP_GAP_Y,
    );

    const bucketCols = this.width >= 1180 ? 10 : this.width >= 900 ? 5 : 4;
    const bucketRows = Math.ceil(10 / bucketCols);
    const bucketWidth = (usableWidth - BUCKET_GAP_X * Math.max(0, bucketCols - 1)) / bucketCols;
    const availableBucketHeight = Math.max(180, this.height - bucketTop - STAGE_PADDING_BOTTOM);
    const bucketHeight = clamp(
      (availableBucketHeight - BUCKET_GAP_Y * Math.max(0, bucketRows - 1)) / bucketRows,
      120,
      184,
    );
    const bucketCardWidth = clamp(topWidth - 20, 42, 56);
    const bucketCardHeight = Math.round(bucketCardWidth * 0.74);
    const bucketFontSize = clamp(bucketCardHeight * 0.38, 11, 14);
    const buckets = step.buckets ?? [];

    for (let bucket = 0; bucket < 10; bucket++) {
      const col = bucket % bucketCols;
      const row = Math.floor(bucket / bucketCols);
      const rect: Rect = {
        x: STAGE_PADDING_X + col * (bucketWidth + BUCKET_GAP_X),
        y: bucketTop + row * (bucketHeight + BUCKET_GAP_Y),
        width: bucketWidth,
        height: bucketHeight,
      };
      const bucketSnapshot = buckets.find((entry) => entry.bucket === bucket);
      this.layoutBucket(bucketSnapshot?.items ?? [], bucket, rect, placements, {
        width: bucketCardWidth,
        height: bucketCardHeight,
        fontSize: bucketFontSize,
        zone: 'bucket',
        bucket,
      });
    }

    const bucketRects = new Map<number, Rect>();
    for (let bucket = 0; bucket < 10; bucket++) {
      const col = bucket % bucketCols;
      const row = Math.floor(bucket / bucketCols);
      bucketRects.set(bucket, {
        x: STAGE_PADDING_X + col * (bucketWidth + BUCKET_GAP_X),
        y: bucketTop + row * (bucketHeight + BUCKET_GAP_Y),
        width: bucketWidth,
        height: bucketHeight,
      });
    }

    return {
      placements,
      bucketRects,
    };
  }

  private resolveTopItems(
    step: SortStep,
    sourceItems: readonly SortItemSnapshot[],
  ): readonly SortItemSnapshot[] {
    if (step.phase === 'distribute') {
      const inBuckets = new Set<string>();
      step.buckets?.forEach((bucket) => {
        bucket.items.forEach((item) => inBuckets.add(item.id));
      });
      return sourceItems.filter((item) => !inBuckets.has(item.id));
    }
    if (step.phase === 'gather') {
      return step.items ?? [];
    }
    return step.items?.length ? step.items : sourceItems;
  }

  private layoutRow(
    items: readonly SortItemSnapshot[],
    placements: Map<string, CardGeometry>,
    area: Rect,
    cols: number,
    geometry: Omit<CardGeometry, 'x' | 'y'>,
    gapX: number,
    gapY: number,
  ): void {
    if (items.length === 0) return;
    const rows = Math.ceil(items.length / cols);
    const contentHeight = rows * geometry.height + Math.max(0, rows - 1) * gapY;
    const startY = area.y + Math.max(0, (area.height - contentHeight) / 2);
    for (let row = 0; row < rows; row++) {
      const rowItems = items.slice(row * cols, row * cols + cols);
      const rowWidth = rowItems.length * geometry.width + Math.max(0, rowItems.length - 1) * gapX;
      const startX = area.x + Math.max(0, (area.width - rowWidth) / 2);
      rowItems.forEach((item, index) => {
        placements.set(item.id, {
          x: startX + index * (geometry.width + gapX),
          y: startY + row * (geometry.height + gapY),
          width: geometry.width,
          height: geometry.height,
          fontSize: geometry.fontSize,
          zone: geometry.zone,
          bucket: geometry.bucket,
        });
      });
    }
  }

  private layoutBucket(
    items: readonly SortItemSnapshot[],
    bucket: number,
    rect: Rect,
    placements: Map<string, CardGeometry>,
    geometry: Omit<CardGeometry, 'x' | 'y'>,
  ): void {
    if (items.length === 0) return;
    const innerWidth = rect.width - BUCKET_PADDING * 2;
    const cols = Math.max(
      1,
      Math.floor((innerWidth + BUCKET_CARD_GAP_X) / (geometry.width + BUCKET_CARD_GAP_X)),
    );
    const rows = Math.ceil(items.length / cols);
    const innerTop = rect.y + BUCKET_HEADER_HEIGHT + BUCKET_PADDING;
    for (let row = 0; row < rows; row++) {
      const rowItems = items.slice(row * cols, row * cols + cols);
      const rowWidth = rowItems.length * geometry.width + Math.max(0, rowItems.length - 1) * BUCKET_CARD_GAP_X;
      const startX = rect.x + Math.max(0, (rect.width - rowWidth) / 2);
      rowItems.forEach((item, index) => {
        placements.set(item.id, {
          x: startX + index * (geometry.width + BUCKET_CARD_GAP_X),
          y: innerTop + row * (geometry.height + BUCKET_CARD_GAP_Y),
          width: geometry.width,
          height: geometry.height,
          fontSize: geometry.fontSize,
          zone: geometry.zone,
          bucket,
        });
      });
    }
  }

  private updateBucketPanels(step: SortStep, layout: LayoutSnapshot, animatePanels: boolean): void {
    const activeBucket = step.activeBucket ?? null;
    for (let bucket = 0; bucket < 10; bucket++) {
      const elements = this.bucketElements.get(bucket);
      const rect = layout.bucketRects.get(bucket);
      if (!elements || !rect) continue;
      const color = BUCKET_COLORS[bucket];
      const snapshot = step.buckets?.find((entry) => entry.bucket === bucket);
      const count = snapshot?.items.length ?? 0;
      const isActive = activeBucket === bucket && (step.phase === 'distribute' || step.phase === 'gather');

      elements.panel.setAttribute('x', String(rect.x));
      elements.panel.setAttribute('y', String(rect.y));
      elements.panel.setAttribute('width', String(rect.width));
      elements.panel.setAttribute('height', String(rect.height));
      elements.panel.setAttribute('fill', isActive ? hexToRgba(color, 0.18) : 'rgba(11, 18, 33, 0.72)');
      elements.panel.setAttribute('stroke', isActive ? hexToRgba(color, 0.92) : 'rgba(148, 163, 184, 0.18)');

      elements.header.setAttribute('x', String(rect.x));
      elements.header.setAttribute('y', String(rect.y));
      elements.header.setAttribute('width', String(rect.width));
      elements.header.setAttribute('height', String(BUCKET_HEADER_HEIGHT));
      elements.header.setAttribute('fill', hexToRgba(color, isActive ? 0.22 : 0.14));

      elements.label.setAttribute('x', String(rect.x + 14));
      elements.label.setAttribute('y', String(rect.y + 20));
      elements.label.textContent = `Bucket ${bucket}`;

      elements.count.setAttribute('x', String(rect.x + rect.width - 14));
      elements.count.setAttribute('y', String(rect.y + 20));
      elements.count.textContent = `${count}`;

      if (animatePanels && isActive && this.lastStep?.activeBucket !== bucket) {
        pulseSvgElement(elements.panel, {
          duration: this.motion().compareMs,
          scale: 1.02,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            `drop-shadow(0 0 18px ${hexToRgba(color, 0.65)})`,
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }
  }

  private updateFlowPath(step: SortStep, layout: LayoutSnapshot, animatePath: boolean): void {
    if (!this.flowPath) return;
    const activeId = step.activeItemId;
    const activeBucket = step.activeBucket;
    if (!activeId || activeBucket === null || activeBucket === undefined) {
      this.flowPath.setAttribute('opacity', '0');
      return;
    }
    const currentPlacement = layout.placements.get(activeId);
    const previousPlacement = this.lastLayout?.placements.get(activeId) ?? currentPlacement;
    const bucketRect = layout.bucketRects.get(activeBucket);
    if (!currentPlacement || !previousPlacement || !bucketRect) {
      this.flowPath.setAttribute('opacity', '0');
      return;
    }

    const start =
      step.phase === 'gather'
        ? centerOf(previousPlacement)
        : centerOf(
            previousPlacement.zone === 'bucket' && currentPlacement.zone === 'bucket'
              ? currentPlacement
              : previousPlacement,
          );
    const end =
      step.phase === 'gather'
        ? centerOf(currentPlacement)
        : {
            x: bucketRect.x + bucketRect.width / 2,
            y: bucketRect.y + BUCKET_HEADER_HEIGHT / 2 + 6,
          };
    const arc = Math.max(26, Math.abs(end.x - start.x) * 0.18);
    const midY = Math.min(start.y, end.y) - arc;
    const d = `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
    const color = BUCKET_COLORS[activeBucket];
    this.flowPath.setAttribute('d', d);
    this.flowPath.setAttribute('stroke', hexToRgba(color, 0.92));
    this.flowPath.setAttribute('opacity', '0.82');
    if (animatePath) {
      pulseSvgElement(this.flowPath, {
        duration: this.motion().compareMs,
        scale: 1,
        opacity: [0.35, 1, 0.82],
        filter: [
          'drop-shadow(0 0 0 transparent)',
          `drop-shadow(0 0 20px ${hexToRgba(color, 0.55)})`,
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private applyLayout(step: SortStep, layout: LayoutSnapshot, animateCards: boolean): void {
    for (const card of this.cards.values()) {
      const target = layout.placements.get(card.id);
      if (!target) continue;
      this.applyCardVisuals(card, step, target);
      if (!animateCards || !this.lastLayout) {
        this.commitGeometry(card, target);
        continue;
      }
      const from = { ...card.geometry };
      if (sameGeometry(from, target) && card.zone === target.zone && card.bucket === target.bucket) {
        this.commitGeometry(card, target);
        continue;
      }
      const useArc = card.zone !== target.zone || step.activeItemId === card.id;
      const motion = this.motion();
      const duration = useArc ? motion.swapMs : motion.settleMs;
      const state = {
        t: 0,
        width: from.width,
        height: from.height,
        fontSize: from.fontSize,
      };
      animate(state, {
        t: 1,
        width: target.width,
        height: target.height,
        fontSize: target.fontSize,
        duration,
        ease: 'inOutQuad',
        onUpdate: () => {
          const x = lerp(from.x, target.x, state.t);
          const yBase = lerp(from.y, target.y, state.t);
          const distance = Math.hypot(target.x - from.x, target.y - from.y);
          const lift = useArc ? Math.min(52, 18 + distance * 0.14) : 0;
          this.commitGeometry(card, {
            x,
            y: yBase - Math.sin(Math.PI * state.t) * lift,
            width: state.width,
            height: state.height,
            fontSize: state.fontSize,
            zone: target.zone,
            bucket: target.bucket,
          });
        },
        onComplete: () => {
          this.commitGeometry(card, target);
        },
      });
    }
  }

  private commitGeometry(card: Card, geometry: CardGeometry): void {
    card.geometry.x = geometry.x;
    card.geometry.y = geometry.y;
    card.geometry.width = geometry.width;
    card.geometry.height = geometry.height;
    card.geometry.fontSize = geometry.fontSize;
    card.zone = geometry.zone;
    card.bucket = geometry.bucket;

    card.group.setAttribute('transform', `translate(${geometry.x}, ${geometry.y})`);
    card.rect.setAttribute('width', String(geometry.width));
    card.rect.setAttribute('height', String(geometry.height));
    card.gloss.setAttribute('width', String(geometry.width));
    card.gloss.setAttribute('height', String(Math.max(14, geometry.height * 0.42)));
    card.accent.setAttribute('x', '10');
    card.accent.setAttribute('y', String(Math.max(geometry.height - 8, geometry.height * 0.84)));
    card.accent.setAttribute('width', String(Math.max(geometry.width - 20, 8)));
    card.accent.setAttribute('height', '4');
    card.frame.setAttribute('width', String(geometry.width));
    card.frame.setAttribute('height', String(geometry.height));
    this.syncDigitNodes(card);
  }

  private applyCardVisuals(card: Card, step: SortStep, geometry: CardGeometry): void {
    const activeBucket = geometry.bucket;
    const bucketColor = activeBucket === null ? null : BUCKET_COLORS[activeBucket];
    const isActive = step.activeItemId === card.id;
    const isComplete = step.phase === 'complete';
    const isPassComplete = step.phase === 'pass-complete';

    let fill = 'rgba(124, 110, 240, 0.14)';
    let stroke = 'rgba(124, 110, 240, 0.38)';
    let accent = 'rgba(167, 139, 250, 0.92)';
    let frame = 'rgba(255, 255, 255, 0.08)';
    let shadow = 'drop-shadow(0 18px 24px rgba(11, 18, 33, 0.28))';

    if (geometry.zone === 'bucket' && bucketColor) {
      fill = hexToRgba(bucketColor, 0.16);
      stroke = hexToRgba(bucketColor, 0.54);
      accent = bucketColor;
      frame = hexToRgba(bucketColor, 0.22);
      shadow = `drop-shadow(0 16px 20px ${hexToRgba(bucketColor, 0.18)})`;
    }

    if (isActive && step.phase === 'distribute') {
      fill = 'rgba(56, 189, 248, 0.22)';
      stroke = 'rgba(56, 189, 248, 0.96)';
      accent = bucketColor ?? '#38bdf8';
      frame = 'rgba(125, 211, 252, 0.52)';
      shadow = 'drop-shadow(0 20px 24px rgba(56, 189, 248, 0.26))';
    }

    if (isActive && step.phase === 'gather') {
      fill = 'rgba(52, 211, 153, 0.22)';
      stroke = 'rgba(52, 211, 153, 0.94)';
      accent = '#34d399';
      frame = 'rgba(110, 231, 183, 0.48)';
      shadow = 'drop-shadow(0 20px 24px rgba(52, 211, 153, 0.24))';
    }

    if (isPassComplete && geometry.zone === 'top') {
      fill = 'rgba(52, 211, 153, 0.14)';
      stroke = 'rgba(74, 222, 128, 0.7)';
      accent = '#4ade80';
      frame = 'rgba(134, 239, 172, 0.28)';
      shadow = 'drop-shadow(0 18px 22px rgba(34, 197, 94, 0.18))';
    }

    if (isComplete) {
      fill = 'rgba(34, 197, 94, 0.16)';
      stroke = 'rgba(74, 222, 128, 0.82)';
      accent = '#4ade80';
      frame = 'rgba(187, 247, 208, 0.34)';
      shadow = 'drop-shadow(0 18px 22px rgba(34, 197, 94, 0.22))';
    }

    card.rect.setAttribute('fill', fill);
    card.rect.setAttribute('stroke', stroke);
    card.gloss.setAttribute('fill', 'rgba(255, 255, 255, 0.06)');
    card.accent.setAttribute('fill', accent);
    card.frame.setAttribute('stroke', frame);
    card.group.style.filter = shadow;

    const payload = this.buildDigitsPayload(card, step, accent, geometry.zone === 'bucket');
    card.digitsPayload = payload;
    this.syncDigitNodes(card);
  }

  private buildDigitsPayload(
    card: Card,
    step: SortStep,
    accent: string,
    inBucket: boolean,
  ): CardDigitsPayload {
    const maxDigits = step.maxDigits ?? Math.max(1, String(Math.max(0, ...this.array())).length);
    const activeCharIndex =
      step.digitIndex === null || step.digitIndex === undefined ? null : maxDigits - step.digitIndex - 1;
    const digits = String(card.value).padStart(maxDigits, '0').split('');
    const base = inBucket ? 'rgba(226, 232, 240, 0.9)' : 'rgba(241, 245, 249, 0.92)';
    const colors = digits.map((_, index) =>
      index === activeCharIndex ? accent : base,
    );
    return { digits, colors };
  }

  private syncDigitNodes(card: Card): void {
    const desired = card.digitsPayload.digits.length;
    while (card.digits.length < desired) {
      const node = d3
        .select(card.digitGroup)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 700)
        .style('font-family', 'var(--font-mono)')
        .node() as SVGTextElement;
      card.digits.push(node);
    }
    while (card.digits.length > desired) {
      const node = card.digits.pop();
      node?.remove();
    }
    const spacing = desired > 1 ? Math.min(card.geometry.width * 0.24, 18) : 0;
    const total = spacing * Math.max(0, desired - 1);
    const centerX = card.geometry.width / 2;
    const centerY = card.geometry.height / 2 + card.geometry.fontSize * 0.34;
    card.digits.forEach((node, index) => {
      node.setAttribute('x', String(centerX - total / 2 + index * spacing));
      node.setAttribute('y', String(centerY));
      node.setAttribute('font-size', String(card.geometry.fontSize));
      node.setAttribute('fill', card.digitsPayload.colors[index]);
      node.textContent = card.digitsPayload.digits[index];
    });
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep, layout: LayoutSnapshot): void {
    const activeId = step.activeItemId;
    if (activeId && activeId !== previousStep?.activeItemId) {
      const card = this.cards.get(activeId);
      if (card) {
        pulseSvgElement(card.rect, {
          duration: this.motion().compareMs,
          scale: 1.05,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            `drop-shadow(0 0 18px ${step.activeBucket === null || step.activeBucket === undefined ? '#38bdf8' : hexToRgba(BUCKET_COLORS[step.activeBucket], 0.65)})`,
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }

    if (
      step.phase === 'focus-digit' &&
      step.digitIndex !== previousStep?.digitIndex
    ) {
      for (const card of this.cards.values()) {
        pulseSvgElement(card.frame, {
          duration: this.motion().compareMs,
          scale: 1.03,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            'drop-shadow(0 0 12px rgba(56, 189, 248, 0.38))',
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      }
    }

    if (step.phase === 'pass-complete' || step.phase === 'complete') {
      const ordered = step.items ?? [];
      ordered.forEach((item, index) => {
        const card = this.cards.get(item.id);
        if (!card) return;
        pulseSvgElement(card.rect, {
          duration: this.motion().settleMs,
          delay: index * this.motion().completeStepMs,
          scale: 1.04,
          filter: [
            'drop-shadow(0 0 0 transparent)',
            `drop-shadow(0 0 16px ${step.phase === 'complete' ? 'rgba(74, 222, 128, 0.75)' : 'rgba(52, 211, 153, 0.6)'})`,
            'drop-shadow(0 0 0 transparent)',
          ],
        });
      });
    }

    if (step.phase === 'gather' && activeId) {
      const activeBucket = step.activeBucket;
      if (activeBucket !== null && activeBucket !== undefined) {
        const bucketElements = this.bucketElements.get(activeBucket);
        if (bucketElements) {
          pulseSvgElement(bucketElements.panel, {
            duration: this.motion().compareMs,
            scale: 1.02,
            filter: [
              'drop-shadow(0 0 0 transparent)',
              `drop-shadow(0 0 16px ${hexToRgba(BUCKET_COLORS[activeBucket], 0.48)})`,
              'drop-shadow(0 0 0 transparent)',
            ],
          });
        }
      }
    }

    const activeBucket = step.activeBucket;
    if (activeBucket !== null && activeBucket !== undefined && activeBucket !== previousStep?.activeBucket) {
      const rect = layout.bucketRects.get(activeBucket);
      if (rect && this.flowPath) {
        this.flowPath.setAttribute('stroke-dashoffset', '0');
      }
    }
  }

  private createFallbackStep(array: readonly number[]): SortStep {
    const items = array.map((value, index) => ({ id: `rdx-${index}`, value }));
    return {
      array: [...array],
      comparing: null,
      swapping: null,
      sorted: [],
      boundary: array.length,
      activeCodeLine: 1,
      description: 'Preparing radix sort',
      phase: 'idle',
      items,
      sourceItems: items,
      buckets: Array.from({ length: 10 }, (_, bucket) => ({ bucket, items: [] })),
      digitIndex: 0,
      maxDigits: Math.max(1, String(Math.max(0, ...array)).length),
      activeItemId: null,
      activeBucket: null,
    };
  }

  private findValueForId(step: SortStep, id: string): number | null {
    for (const item of this.collectUniqueItems(step)) {
      if (item.id === id) return item.value;
    }
    return null;
  }
}

function centerOf(geometry: CardGeometry): { x: number; y: number } {
  return {
    x: geometry.x + geometry.width / 2,
    y: geometry.y + geometry.height / 2,
  };
}

function digitPowerLabel(exponent: number): string {
  if (exponent === 0) return '1s';
  if (exponent === 1) return '10s';
  if (exponent === 2) return '100s';
  return `10^${exponent}`;
}

function digitName(exponent: number): string {
  if (exponent === 0) return 'ones digit';
  if (exponent === 1) return 'tens digit';
  if (exponent === 2) return 'hundreds digit';
  return `10^${exponent} place`;
}

function phaseLabelFor(phase: SortStep['phase']): string {
  switch (phase) {
    case 'focus-digit':
      return 'Digit Focus';
    case 'distribute':
      return 'Bucket Routing';
    case 'gather':
      return 'Stable Gather';
    case 'pass-complete':
      return 'Pass Complete';
    case 'complete':
      return 'Sorted';
    default:
      return 'Ready';
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function sameGeometry(left: MutableGeometry, right: MutableGeometry): boolean {
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height &&
    left.fontSize === right.fontSize
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const chunk =
    normalized.length === 3
      ? normalized
          .split('')
          .map((value) => `${value}${value}`)
          .join('')
      : normalized;
  const red = Number.parseInt(chunk.slice(0, 2), 16);
  const green = Number.parseInt(chunk.slice(2, 4), 16);
  const blue = Number.parseInt(chunk.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
