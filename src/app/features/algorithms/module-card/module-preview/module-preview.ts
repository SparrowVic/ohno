import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PreviewFamily } from '../../data/catalog/preview-family/preview-family';
import {
  buildBars,
  buildBuckets,
  buildGraph,
  buildMatrix,
  buildNotebook,
  buildStack,
  buildTape,
  buildXy,
} from './module-preview.utils';

interface GraphNode {
  readonly x: number;
  readonly y: number;
}

const GRAPH_NODES: readonly GraphNode[] = [
  { x: 122, y: 20 },
  { x: 78, y: 44 },
  { x: 166, y: 44 },
  { x: 54, y: 68 },
  { x: 100, y: 68 },
  { x: 144, y: 68 },
  { x: 190, y: 68 },
];

const GRAPH_EDGES: readonly (readonly [number, number])[] = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
];

@Component({
  selector: 'ohno-module-preview',
  templateUrl: './module-preview.html',
  styleUrl: './module-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.preview--live]': 'live()',
    'aria-hidden': 'true',
  },
})
export class OhnoModulePreview {
  readonly family = input.required<PreviewFamily>();
  readonly seed = input.required<number>();
  readonly live = input(false);

  protected readonly graphNodes = GRAPH_NODES;
  protected readonly graphEdges = GRAPH_EDGES;

  protected readonly bars = computed(() => buildBars(this.seed()));
  protected readonly buckets = computed(() => buildBuckets(this.seed()));
  protected readonly bucketCells = computed(() =>
    this.buckets().flatMap((bucket, slot) =>
      Array.from({ length: bucket.count }, (_, row) => ({ x: 34 + slot * 23, y: 66 - row * 9, tone: bucket.tone })),
    ),
  );
  protected readonly graph = computed(() => buildGraph(this.seed()));
  protected readonly matrix = computed(() => buildMatrix(this.seed()));
  protected readonly matrixCells = computed(() => {
    const { columns, rows, filled, current, pink } = this.matrix();
    return Array.from({ length: columns * rows }, (_, index) => ({
      x: 22 + (index % columns) * 25,
      y: 14 + Math.floor(index / columns) * 17,
      tone: index === current ? 'cyan' : index === pink ? 'pink' : index < filled ? 'lime' : 'slate',
    }));
  });
  protected readonly tape = computed(() => buildTape(this.seed()));
  protected readonly notebook = computed(() => buildNotebook(this.seed()));
  protected readonly xy = computed(() => buildXy(this.seed()));
  protected readonly hullPath = computed(() =>
    this.xy().hull.map((index, position) => `${position === 0 ? 'M' : 'L'}${this.xy().points[index][0]} ${this.xy().points[index][1]}`).join(' ') + ' Z',
  );
  protected readonly stack = computed(() => buildStack(this.seed()));

  protected graphTone(index: number): string {
    const { current, frontier } = this.graph();
    if (index === current) return 'cyan';
    if (index === frontier) return 'pink';
    return 'slate';
  }
}
