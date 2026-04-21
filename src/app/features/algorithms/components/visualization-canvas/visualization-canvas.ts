import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ClosestPairVisualization } from '../closest-pair-visualization/closest-pair-visualization';
import { ConvexHullVisualization } from '../convex-hull-visualization/convex-hull-visualization';
import { DelaunayVisualization } from '../delaunay-visualization/delaunay-visualization';
import { DpPresetOption } from '../../models/dp';
import { WeightedGraphData } from '../../models/graph';
import { SortStep } from '../../models/sort-step';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { BarChartVisualization } from '../bar-chart-visualization/bar-chart-visualization';
import { BlockSwapVisualization } from '../block-swap-visualization/block-swap-visualization';
import { GraphVisualization } from '../graph-visualization/graph-visualization';
import { DpVisualization } from '../dp-visualization/dp-visualization';
import { DsuVisualization } from '../dsu-visualization/dsu-visualization';
import { HalfPlaneVisualization } from '../half-plane-visualization/half-plane-visualization';
import { LineIntersectionVisualization } from '../line-intersection-visualization/line-intersection-visualization';
import { MatrixVisualization } from '../matrix-visualization/matrix-visualization';
import { MinkowskiSumVisualization } from '../minkowski-sum-visualization/minkowski-sum-visualization';
import { NetworkVisualization } from '../network-visualization/network-visualization';
import { GridVisualization } from '../grid-visualization/grid-visualization';
import { RadixBucketVisualization } from '../radix-bucket-visualization/radix-bucket-visualization';
import { RadixMatrixVisualization } from '../radix-matrix-visualization/radix-matrix-visualization';
import { RadixStripVisualization } from '../radix-strip-visualization/radix-strip-visualization';
import { SearchVisualization } from '../search-visualization/search-visualization';
import { StringPresetOption } from '../../models/string';
import { StringVisualization } from '../string-visualization/string-visualization';
import { SweepLineVisualization } from '../sweep-line-visualization/sweep-line-visualization';
import { VoronoiVisualization } from '../voronoi-visualization/voronoi-visualization';

@Component({
  selector: 'app-visualization-canvas',
  imports: [
    BarChartVisualization,
    ClosestPairVisualization,
    ConvexHullVisualization,
    DelaunayVisualization,
    BlockSwapVisualization,
    GraphVisualization,
    DpVisualization,
    DsuVisualization,
    HalfPlaneVisualization,
    MatrixVisualization,
    LineIntersectionVisualization,
    MinkowskiSumVisualization,
    NetworkVisualization,
    GridVisualization,
    RadixBucketVisualization,
    RadixMatrixVisualization,
    RadixStripVisualization,
    SearchVisualization,
    StringVisualization,
    SweepLineVisualization,
    VoronoiVisualization,
  ],
  templateUrl: './visualization-canvas.html',
  styleUrl: './visualization-canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationCanvas {
  readonly variant = input.required<VisualizationVariant>();
  readonly array = input.required<readonly number[]>();
  readonly graph = input<WeightedGraphData | null>(null);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly graphFocusTargetId = input<string | null>(null);
  readonly dpPresetOptions = input<readonly DpPresetOption[]>([]);
  readonly dpPresetId = input<string | null>(null);
  readonly stringPresetOptions = input<readonly StringPresetOption[]>([]);
  readonly stringPresetId = input<string | null>(null);
  readonly graphFocusTargetChange = output<string | null>();
  readonly dpPresetChange = output<string>();
  readonly stringPresetChange = output<string>();
}
