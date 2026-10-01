import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, isI18nText } from '../../../../core/i18n/translatable-text';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { NetworkEdgeStatus, NetworkNodeStatus, NetworkTraceState } from '../../models/network';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import {
  createMotionProfile,
  pulseSvgElement,
} from '../../utils/helpers/visualization-motion/visualization-motion';
import {
  NetworkBox,
  NetworkEdgeGeometry,
  NetworkRackEntry,
  NetworkTone,
  estimateChipWidth,
  networkEdgeGeometry,
  networkEdgeText,
  networkEdgeTone,
  networkFocusEntry,
  networkLevelChip,
  networkLinkLabel,
  networkNodeTone,
  networkQueueEntry,
  networkRackTitle,
  networkViewBox,
  placeEdgeChips,
} from './network-display.utils';

const NODE_RADIUS = 21;
const ARROW_TIP_INSET = 3;
const VIEW_PAD_X = 66;
const VIEW_PAD_Y = 64;
const CHIP_GLYPH_WIDTH = 7.8;
const NODE_CHIP_OFFSET = NODE_RADIUS + 19;
const NODE_CHIP_HEIGHT = 20;
const LEVEL_SLOT_WIDTH = 34;
const LINK_SLOT_WIDTH = 56;
const CHIP_PADDING_X = 7;
const EDGE_CHIP_LINE_HEIGHT = 17;
const ARROW_TONES: readonly NetworkTone[] = ['slate', 'cyan', 'pink', 'lime', 'amber', 'red'];
const ARROW_FILLS: Readonly<Record<NetworkTone, string>> = {
  slate: 'var(--ink-3)',
  cyan: 'var(--cyan)',
  pink: 'var(--pink)',
  lime: 'var(--lime)',
  violet: 'var(--violet)',
  amber: 'var(--amber)',
  red: 'rgb(var(--red-rgb) / 0.6)',
};

interface RenderedNetworkNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly status: NetworkNodeStatus;
  readonly tone: NetworkTone;
  readonly isSink: boolean;
  readonly levelText: string | null;
  readonly levelWidth: number;
  readonly linkText: string | null;
  readonly linkWidth: number;
}

interface RenderedNetworkEdge extends NetworkEdgeGeometry {
  readonly id: string;
  readonly status: NetworkEdgeStatus;
  readonly tone: NetworkTone;
  readonly marker: string | null;
  readonly primaryText: string;
  readonly secondaryText: string | null;
  readonly chipWidth: number;
  readonly chipHeight: number;
  readonly chipX: number;
  readonly chipY: number;
}

function nodeObstacles(nodes: readonly RenderedNetworkNode[]): readonly NetworkBox[] {
  const ring = NODE_RADIUS * 2 + 6;
  return nodes.flatMap((node) => [
    { cx: node.x, cy: node.y, width: ring, height: ring },
    { cx: node.x, cy: node.y - NODE_CHIP_OFFSET, width: Math.max(LEVEL_SLOT_WIDTH, node.levelWidth), height: NODE_CHIP_HEIGHT },
    { cx: node.x, cy: node.y + NODE_CHIP_OFFSET, width: Math.max(LINK_SLOT_WIDTH, node.linkWidth), height: NODE_CHIP_HEIGHT },
  ]);
}

@Component({
  selector: 'app-network-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoRack, OhnoRackRow],
  templateUrl: './network-visualization.html',
  styleUrl: './network-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  private readonly transloco = inject(TranslocoService);
  private readonly translation = toSignal(this.transloco.selectTranslation());

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly nodeRadius = NODE_RADIUS;
  protected readonly nodeChipOffset = NODE_CHIP_OFFSET;
  protected readonly arrowTones = ARROW_TONES;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly containerRef = viewChild<ElementRef<SVGSVGElement>>('container');

  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<NetworkTraceState | null>(() => this.step()?.network ?? null);

  readonly viewBox = computed(() => {
    const box = networkViewBox(this.state()?.nodes ?? [], VIEW_PAD_X, VIEW_PAD_Y);
    return `${box.x} ${box.y} ${box.width} ${box.height}`;
  });

  readonly nodes = computed<readonly RenderedNetworkNode[]>(() => {
    const state = this.state();
    if (!state) return [];
    return state.nodes.map((node) => {
      const levelText = this.resolve(networkLevelChip(state.mode, node.level));
      const linkText = this.resolve(networkLinkLabel(node.linkLabel));
      return {
        id: node.id,
        label: node.label,
        x: node.x,
        y: node.y,
        status: node.status,
        tone: networkNodeTone(node.status),
        isSink: node.lane === 'sink',
        levelText,
        levelWidth: levelText ? this.chipWidth(levelText, 28) : 0,
        linkText,
        linkWidth: linkText ? this.chipWidth(linkText, 28) : 0,
      };
    });
  });

  readonly edges = computed<readonly RenderedNetworkEdge[]>(() => {
    const state = this.state();
    if (!state) return [];
    const nodesById = new Map(state.nodes.map((node) => [node.id, node] as const));
    const drafts = state.edges.map((edge) => {
      const tone = networkEdgeTone(edge.status);
      const primaryText = this.resolve(networkEdgeText(edge.primaryText)) ?? '';
      const secondaryText = this.resolve(networkEdgeText(edge.secondaryText));
      const chipWidth = Math.max(
        this.chipWidth(primaryText, 30),
        secondaryText ? this.chipWidth(secondaryText, 30) : 0,
      );
      return {
        ...networkEdgeGeometry(edge, nodesById, NODE_RADIUS + ARROW_TIP_INSET),
        id: edge.id,
        status: edge.status,
        tone,
        marker: edge.directed ? `url(#network-arrow-${tone})` : null,
        primaryText,
        secondaryText,
        chipWidth,
        chipHeight: secondaryText ? EDGE_CHIP_LINE_HEIGHT * 2 + 4 : EDGE_CHIP_LINE_HEIGHT + 5,
      };
    });
    const positions = placeEdgeChips(
      drafts.map((draft) => ({ x1: draft.x1, y1: draft.y1, x2: draft.x2, y2: draft.y2, width: draft.chipWidth, height: draft.chipHeight })),
      nodeObstacles(this.nodes()),
    );
    return drafts.map((draft, index) => ({ ...draft, chipX: positions[index].x, chipY: positions[index].y }));
  });

  readonly queueTitle = computed<TranslatableText>(() => networkRackTitle(this.state()?.queueLabel ?? ''));
  readonly queueRows = computed<readonly NetworkRackEntry[]>(() => {
    const state = this.state();
    if (!state) return [];
    return state.queue.map((label) => networkQueueEntry(label, state.nodes));
  });

  readonly focusTitle = computed<TranslatableText>(() => networkRackTitle(this.state()?.focusItemsLabel ?? ''));
  readonly focusRows = computed<readonly NetworkRackEntry[]>(() =>
    (this.state()?.focusItems ?? []).map((item) => networkFocusEntry(item)),
  );

  arrowFill(tone: NetworkTone): string {
    return ARROW_FILLS[tone];
  }

  readonly route = computed(() => this.state()?.activeRouteLabel ?? null);

  constructor() {
    effect(() => {
      const values = this.array();
      if (!this.initialized) return;
      this.initialize(values);
      untracked(() => {
        const step = this.step();
        if (step) this.render(step);
      });
    });

    effect(() => {
      const step = this.step();
      if (this.initialized && step) this.render(step);
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.initialize(this.array());
    const step = this.step();
    if (step) this.render(step);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initialize(_: readonly number[]): void {
    this.lastStep = null;
  }

  render(step: SortStep): void {
    const previous = this.lastStep;
    this.lastStep = step;
    queueMicrotask(() => this.animateStepEffects(previous, step));
  }

  destroy(): void {
    this.lastStep = null;
    this.initialized = false;
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.network;
    const previous = previousStep?.network ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());
    const flat = ['none', 'none', 'none'] as const;

    const previousCurrent = previous?.nodes.find((node) => node.status === 'current')?.id ?? null;
    const nextCurrent = current.nodes.find((node) => node.status === 'current')?.id ?? null;
    if (nextCurrent && nextCurrent !== previousCurrent) {
      const halo = this.findSvgElement(`[data-node-id="${nextCurrent}"] .node__halo`);
      if (halo) {
        pulseSvgElement(halo, { duration: motion.compareMs, scale: 1.3, opacity: [0.2, 0.9, 0.55], filter: flat });
      }
    }

    const previousEdges = new Map(previous?.edges.map((edge) => [edge.id, edge.status]) ?? []);
    for (const edge of current.edges) {
      const prior = previousEdges.get(edge.id);
      if (!prior || prior === edge.status) continue;
      if (edge.status !== 'augment' && edge.status !== 'matched' && edge.status !== 'flow') continue;
      const line = this.findSvgElement(`[data-edge-id="${edge.id}"] .network__edge`);
      if (!line) continue;
      pulseSvgElement(line, { duration: motion.settleMs, scale: 1, opacity: [1, 0.45, 1], filter: flat });
    }
  }

  private findSvgElement(selector: string): SVGElement | null {
    return this.containerRef()?.nativeElement.querySelector<SVGElement>(selector) ?? null;
  }

  private resolve(text: TranslatableText | null): string | null {
    if (text === null) return null;
    if (!isI18nText(text)) return text;
    this.translation();
    return this.transloco.translate(text.key, text.params);
  }

  private chipWidth(text: string, minWidth: number): number {
    return estimateChipWidth(text, CHIP_GLYPH_WIDTH, CHIP_PADDING_X, minWidth);
  }
}
