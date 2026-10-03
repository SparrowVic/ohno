import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import * as d3Selection from 'd3-selection';
import { JSAnimation, animate } from 'animejs';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { radixSuperscript } from '../radix-strip-visualization/radix-digits.utils';
import {
  createMotionProfile,
  prefersReducedMotion,
} from '../../utils/helpers/visualization-motion/visualization-motion';
import {
  RadixBinView,
  RadixBucketLayout,
  RadixCardFrame,
  RadixCardView,
  RadixLayoutInput,
  RadixScene,
  radixBinRect,
  radixBinSlot,
  radixBucketLayout,
  radixCardFrame,
  radixCardText,
  radixChipVisible,
  radixFlightPoint,
  radixGuide,
  radixGuidePath,
  radixOverflow,
  radixScene,
  radixStreamSlot,
  radixZoneChanges,
} from './radix-bucket-display.utils';

interface CardParts {
  readonly group: SVGGElement;
  readonly base: SVGRectElement;
  readonly box: SVGRectElement;
  readonly lit: SVGRectElement;
  readonly value: SVGTextElement;
  readonly digits: SVGGElement;
}

interface PaintedScene {
  readonly scene: RadixScene;
  readonly layout: RadixBucketLayout;
  readonly array: readonly number[];
}

type FlightPath = 'arc' | 'line';

const MAX_ANIMATED_ZONE_CHANGES = 2;
const CARD_RADIUS = 7;
const BIN_RADIUS = 7;

@Component({
  selector: 'app-radix-bucket-visualization',
  imports: [TranslocoPipe],
  templateUrl: './radix-bucket-visualization.html',
  styleUrl: './radix-bucket-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--radix-natural-height.px]': 'layout().naturalHeight',
  },
})
export class RadixBucketVisualization implements VisualizationRenderer {
  protected readonly RADIX = I18N_KEY.features.algorithms.display.radix;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly destroyRef = inject(DestroyRef);
  private readonly frameRef = viewChild.required<ElementRef<HTMLDivElement>>('frame');
  private readonly slotLayerRef = viewChild.required<ElementRef<SVGGElement>>('slots');
  private readonly binLayerRef = viewChild.required<ElementRef<SVGGElement>>('bins');
  private readonly guideRef = viewChild.required<ElementRef<SVGPathElement>>('guide');
  private readonly cardLayerRef = viewChild.required<ElementRef<SVGGElement>>('cards');
  private readonly size = signal({ width: 0, height: 0 });

  protected readonly scene = computed(() => radixScene(this.step(), this.array()));

  private readonly layoutInput = computed<RadixLayoutInput>(
    () => {
      const { width, height } = this.size();
      const scene = this.scene();
      return {
        width: width || 640,
        height,
        count: scene.slotCount,
        maxDigits: scene.maxDigits,
        maxLoad: scene.maxLoad,
      };
    },
    { equal: sameLayoutInput },
  );

  protected readonly layout = computed(() => radixBucketLayout(this.layoutInput()));

  protected readonly viewBox = computed(() => {
    const { width, height } = this.layout();
    return `0 0 ${Math.round(width)} ${Math.round(height)}`;
  });

  protected readonly place = computed(() => {
    const place = this.scene().place;
    if (!place) return null;
    const keys = this.RADIX.digitPlace;
    return {
      tone: place.tone,
      key: place.name === 'power' ? keys.power : keys[place.name],
      params: { power: radixSuperscript(place.exponent) },
    };
  });

  private readonly cardParts = new Map<string, CardParts>();
  private readonly frames = new Map<string, RadixCardFrame>();
  private readonly targets = new Map<string, RadixCardFrame>();
  private readonly flights = new Map<string, JSAnimation>();
  private painted: PaintedScene | null = null;
  private paintLayout: RadixBucketLayout | null = null;

  constructor() {
    afterNextRender(() => {
      const frame = this.frameRef().nativeElement;
      if (typeof ResizeObserver === 'undefined') {
        this.size.set({ width: frame.clientWidth, height: frame.clientHeight });
        return;
      }
      const observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        const current = this.size();
        if (current.width !== width || current.height !== height) this.size.set({ width, height });
      });
      observer.observe(frame);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    afterRenderEffect(() => {
      const scene = this.scene();
      const layout = this.layout();
      const array = this.array();
      const measured = this.size().width > 0;
      untracked(() => {
        if (measured) this.paint(scene, layout, array);
      });
    });

    this.destroyRef.onDestroy(() => this.destroy());
  }

  initialize(_: readonly number[]): void {
    this.painted = null;
    this.stopFlights();
  }

  render(step: SortStep): void {
    if (this.size().width === 0) return;
    this.paint(radixScene(step, this.array()), this.layout(), this.array());
  }

  destroy(): void {
    this.stopFlights();
    this.cardParts.clear();
    this.frames.clear();
    this.targets.clear();
    this.painted = null;
    this.paintLayout = null;
  }

  private paint(scene: RadixScene, layout: RadixBucketLayout, array: readonly number[]): void {
    const previous = this.painted;
    const snap =
      !previous ||
      previous.layout !== layout ||
      previous.array !== array ||
      prefersReducedMotion() ||
      radixZoneChanges(previous.scene.cards, scene.cards) > MAX_ANIMATED_ZONE_CHANGES;
    this.paintLayout = layout;
    this.paintSlots(scene, layout);
    this.paintBins(scene, layout);
    this.paintGuide(scene, layout);
    this.paintCards(scene, layout, snap);
    this.painted = { scene, layout, array };
  }

  private paintSlots(scene: RadixScene, layout: RadixBucketLayout): void {
    const filled = new Set(
      scene.cards.flatMap((card) => (card.placement.zone === 'stream' ? [card.placement.slot] : [])),
    );
    const slots = Array.from({ length: scene.slotCount }, (_, slot) => slot);
    d3Selection
      .select(this.slotLayerRef().nativeElement)
      .selectAll<SVGRectElement, number>('rect.radix-slot')
      .data(slots, (slot) => slot)
      .join('rect')
      .attr('class', 'radix-slot')
      .attr('data-empty', (slot) => String(!filled.has(slot)))
      .attr('x', (slot) => radixStreamSlot(layout, slot).x + 0.5)
      .attr('y', (slot) => radixStreamSlot(layout, slot).y + 0.5)
      .attr('width', layout.card.width - 1)
      .attr('height', layout.card.fullHeight - 1)
      .attr('rx', CARD_RADIUS);
  }

  private paintBins(scene: RadixScene, layout: RadixBucketLayout): void {
    const { bins, card } = layout;
    const groups = d3Selection
      .select(this.binLayerRef().nativeElement)
      .selectAll<SVGGElement, RadixBinView>('g.radix-bin')
      .data(scene.bins, (bin) => bin.bucket)
      .join((enter) => {
        const group = enter.append('g').attr('class', 'radix-bin');
        group.append('rect').attr('class', 'radix-bin__base');
        group.append('rect').attr('class', 'radix-bin__well');
        group.append('line').attr('class', 'radix-bin__lip');
        group.append('text').attr('class', 'radix-bin__number');
        group.append('text').attr('class', 'radix-bin__count');
        group.append('text').attr('class', 'radix-bin__overflow');
        return group;
      });

    groups
      .attr('data-tone', (bin) => bin.tone)
      .attr('data-empty', (bin) => String(bin.count === 0))
      .attr('transform', (bin) => {
        const rect = radixBinRect(layout, bin.bucket);
        return `translate(${rect.x}, ${rect.y})`;
      });
    groups
      .select<SVGRectElement>('.radix-bin__base')
      .attr('width', bins.width)
      .attr('height', bins.height)
      .attr('rx', BIN_RADIUS);
    groups
      .select<SVGRectElement>('.radix-bin__well')
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', bins.width - 1)
      .attr('height', bins.height - 1)
      .attr('rx', BIN_RADIUS - 0.5);
    groups
      .select<SVGLineElement>('.radix-bin__lip')
      .attr('x1', BIN_RADIUS)
      .attr('x2', bins.width - BIN_RADIUS)
      .attr('y1', bins.height + 1)
      .attr('y2', bins.height + 1);
    const headerBaseline = Math.round(bins.header * 0.65);
    groups
      .select<SVGTextElement>('.radix-bin__number')
      .attr('x', 8)
      .attr('y', headerBaseline)
      .text((bin) => String(bin.bucket));
    groups
      .select<SVGTextElement>('.radix-bin__count')
      .attr('x', bins.width - 8)
      .attr('y', headerBaseline + 1)
      .text((bin) => String(bin.count));

    const chipSlot = radixBinSlot(layout, 0, bins.capacity - 1);
    const binOrigin = radixBinRect(layout, 0);
    groups
      .select<SVGTextElement>('.radix-bin__overflow')
      .attr('x', bins.width / 2)
      .attr('y', chipSlot.y - binOrigin.y + (card.compactHeight + card.valueCap) / 2)
      .attr('visibility', (bin) => (radixChipVisible(scene, bin.bucket, bins.capacity) ? 'visible' : 'hidden'))
      .text((bin) => `+${radixOverflow(bin.count, bins.capacity)}`);
  }

  private paintGuide(scene: RadixScene, layout: RadixBucketLayout): void {
    const guide = this.guideRef().nativeElement;
    const route = radixGuide(layout, scene);
    if (!route) {
      guide.setAttribute('visibility', 'hidden');
      return;
    }
    guide.setAttribute('d', radixGuidePath(route));
    guide.setAttribute('visibility', 'visible');
  }

  private paintCards(scene: RadixScene, layout: RadixBucketLayout, snap: boolean): void {
    const groups = d3Selection
      .select(this.cardLayerRef().nativeElement)
      .selectAll<SVGGElement, RadixCardView>('g.radix-card')
      .data(scene.cards, (card) => card.id)
      .join(
        (enter) =>
          enter.append('g').each((card, index, nodes) => {
            this.cardParts.set(card.id, this.buildCard(nodes[index]));
          }),
        (update) => update,
        (exit) =>
          exit
            .each((card) => this.forgetCard(card.id))
            .remove(),
      );

    if (snap) this.stopFlights();
    const motion = createMotionProfile(this.speed());

    groups.each((card) => {
      const parts = this.cardParts.get(card.id);
      if (!parts) return;
      this.dressCard(parts, card, layout);
      const target = radixCardFrame(layout, scene, card);
      const previousTarget = this.targets.get(card.id);
      const current = this.frames.get(card.id);
      this.targets.set(card.id, target);
      parts.group.setAttribute('data-hidden', String(target.hidden));
      if (snap || !current) {
        this.drawCard(card.id, target);
        return;
      }
      if (previousTarget && sameFrame(previousTarget, target)) {
        if (!this.flights.has(card.id)) this.drawCard(card.id, target);
        return;
      }
      const path: FlightPath = previousTarget && zoneOf(previousTarget, layout) !== zoneOf(target, layout) ? 'arc' : 'line';
      this.flyCard(card.id, current, target, path, path === 'arc' ? motion.swapMs : motion.settleMs);
    });

    groups.filter((card) => card.active).raise();
  }

  private buildCard(node: SVGGElement): CardParts {
    const group = d3Selection.select(node).attr('class', 'radix-card');
    return {
      group: node,
      base: group.append('rect').attr('class', 'radix-card__base').attr('rx', CARD_RADIUS).node() as SVGRectElement,
      box: group.append('rect').attr('class', 'radix-card__box').attr('rx', CARD_RADIUS).node() as SVGRectElement,
      lit: group.append('rect').attr('class', 'radix-card__lit').attr('rx', 2.5).node() as SVGRectElement,
      value: group.append('text').attr('class', 'radix-card__value').node() as SVGTextElement,
      digits: group.append('g').attr('class', 'radix-card__digits').node() as SVGGElement,
    };
  }

  private dressCard(parts: CardParts, card: RadixCardView, layout: RadixBucketLayout): void {
    const { group, value, digits } = parts;
    group.setAttribute('data-tone', card.tone);
    group.setAttribute('data-active', String(card.active));
    group.setAttribute('data-lit', card.litTone ?? 'none');
    group.setAttribute('data-font', layout.card.valueFont);
    value.textContent = String(card.value);
    value.style.fontSize = `${layout.card.valueSize}px`;
    d3Selection
      .select(digits)
      .selectAll<SVGTextElement, string>('text.radix-card__digit')
      .data(card.digits)
      .join('text')
      .attr('class', 'radix-card__digit')
      .attr('data-lit', (_, index) => String(index === card.litIndex))
      .text((digit) => digit);
  }

  private flyCard(id: string, from: RadixCardFrame, to: RadixCardFrame, path: FlightPath, duration: number): void {
    this.flights.get(id)?.cancel();
    const progress = { t: 0 };
    const flight = animate(progress, {
      t: 1,
      duration,
      ease: path === 'arc' ? 'inOutQuad' : 'outQuart',
      onUpdate: () => this.drawCard(id, interpolateFrame(from, to, progress.t, path)),
      onComplete: () => {
        this.flights.delete(id);
        this.drawCard(id, to);
      },
    });
    this.flights.set(id, flight);
  }

  private drawCard(id: string, frame: RadixCardFrame): void {
    const parts = this.cardParts.get(id);
    const layout = this.paintLayout;
    if (!parts || !layout) return;
    const metrics = layout.card;
    const text = radixCardText(metrics, parts.digits.childElementCount, frame.height, frame.fullness);
    parts.group.setAttribute('transform', `translate(${round(frame.x)}, ${round(frame.y)})`);
    parts.base.setAttribute('width', String(metrics.width));
    parts.base.setAttribute('height', String(round(frame.height)));
    parts.box.setAttribute('x', '0.5');
    parts.box.setAttribute('y', '0.5');
    parts.box.setAttribute('width', String(metrics.width - 1));
    parts.box.setAttribute('height', String(round(frame.height - 1)));
    parts.value.setAttribute('x', String(text.valueX));
    parts.value.setAttribute('y', String(round(text.valueY)));
    parts.digits.setAttribute('opacity', String(round(text.digitsOpacity)));
    const digitNodes = parts.digits.children;
    let litX: number | null = null;
    for (let index = 0; index < digitNodes.length; index++) {
      const node = digitNodes[index];
      const x = text.digitXs[index] ?? text.valueX;
      node.setAttribute('x', String(round(x)));
      node.setAttribute('y', String(round(text.digitsY)));
      if (node.getAttribute('data-lit') === 'true') litX = x;
    }
    if (litX === null) {
      parts.lit.setAttribute('visibility', 'hidden');
    } else {
      parts.lit.setAttribute('visibility', 'visible');
      parts.lit.setAttribute('x', String(round(litX - metrics.digitPitch / 2 + 0.5)));
      parts.lit.setAttribute('y', String(round(text.digitsY - metrics.digitCap - 3.5)));
      parts.lit.setAttribute('width', String(round(metrics.digitPitch - 1)));
      parts.lit.setAttribute('height', String(round(metrics.digitCap + 7)));
      parts.lit.setAttribute('opacity', String(round(text.digitsOpacity)));
    }
    this.frames.set(id, frame);
  }

  private forgetCard(id: string): void {
    this.flights.get(id)?.cancel();
    this.flights.delete(id);
    this.cardParts.delete(id);
    this.frames.delete(id);
    this.targets.delete(id);
  }

  private stopFlights(): void {
    for (const flight of this.flights.values()) flight.cancel();
    this.flights.clear();
  }
}

function sameLayoutInput(left: RadixLayoutInput, right: RadixLayoutInput): boolean {
  return (
    left.width === right.width &&
    left.height === right.height &&
    left.count === right.count &&
    left.maxDigits === right.maxDigits &&
    left.maxLoad === right.maxLoad
  );
}

function sameFrame(left: RadixCardFrame, right: RadixCardFrame): boolean {
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height &&
    left.fullness === right.fullness
  );
}

function zoneOf(frame: RadixCardFrame, layout: RadixBucketLayout): 'stream' | 'bins' {
  return frame.y < layout.bins.y ? 'stream' : 'bins';
}

function interpolateFrame(from: RadixCardFrame, to: RadixCardFrame, progress: number, path: FlightPath): RadixCardFrame {
  const point = path === 'arc' ? radixFlightPoint(from, to, progress) : { x: lerp(from.x, to.x, progress), y: lerp(from.y, to.y, progress) };
  return {
    ...point,
    width: lerp(from.width, to.width, progress),
    height: lerp(from.height, to.height, progress),
    fullness: lerp(from.fullness, to.fullness, progress),
    hidden: to.hidden,
  };
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
