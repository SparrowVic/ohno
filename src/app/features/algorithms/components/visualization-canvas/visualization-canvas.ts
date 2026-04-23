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
import { DsuGraphVisualization } from '../dsu-graph-visualization/dsu-graph-visualization';
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
import { TreePresetOption } from '../../models/tree';
import { TreeVisualization } from '../tree-visualization/tree-visualization';
import { NumberLabVisualization } from '../number-lab-visualization/number-lab-visualization';
import { PointerLabVisualization } from '../pointer-lab-visualization/pointer-lab-visualization';
import { SieveGridVisualization } from '../sieve-grid-visualization/sieve-grid-visualization';
import { CallStackLabVisualization } from '../call-stack-lab-visualization/call-stack-lab-visualization';
import { CallTreeLabVisualization } from '../call-tree-lab-visualization/call-tree-lab-visualization';
import { ScratchpadLabVisualization } from '../scratchpad-lab-visualization/scratchpad-lab-visualization';
import { NumberLabPresetOption } from '../../utils/number-lab-scenarios/number-lab-scenarios';
import { PointerLabPresetOption } from '../../utils/pointer-lab-scenarios/pointer-lab-scenarios';
import { SieveGridPresetOption } from '../../utils/sieve-grid-scenarios/sieve-grid-scenarios';
import { CallStackLabPresetOption } from '../../utils/call-stack-lab-scenarios/call-stack-lab-scenarios';
import { CallTreeLabPresetOption } from '../../utils/call-tree-lab-scenarios/call-tree-lab-scenarios';
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
    DsuGraphVisualization,
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
    TreeVisualization,
    NumberLabVisualization,
    PointerLabVisualization,
    SieveGridVisualization,
    CallStackLabVisualization,
    CallTreeLabVisualization,
    ScratchpadLabVisualization,
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
  readonly treePresetOptions = input<readonly TreePresetOption[]>([]);
  readonly treePresetId = input<string | null>(null);
  readonly numberLabPresetOptions = input<readonly NumberLabPresetOption[]>([]);
  readonly numberLabPresetId = input<string | null>(null);
  readonly pointerLabPresetOptions = input<readonly PointerLabPresetOption[]>([]);
  readonly pointerLabPresetId = input<string | null>(null);
  readonly sieveGridPresetOptions = input<readonly SieveGridPresetOption[]>([]);
  readonly sieveGridPresetId = input<string | null>(null);
  readonly callStackLabPresetOptions = input<readonly CallStackLabPresetOption[]>([]);
  readonly callStackLabPresetId = input<string | null>(null);
  readonly callTreeLabPresetOptions = input<readonly CallTreeLabPresetOption[]>([]);
  readonly callTreeLabPresetId = input<string | null>(null);
  readonly graphFocusTargetChange = output<string | null>();
  readonly dpPresetChange = output<string>();
  readonly stringPresetChange = output<string>();
  readonly treePresetChange = output<string>();
  readonly numberLabPresetChange = output<string>();
  readonly pointerLabPresetChange = output<string>();
  readonly sieveGridPresetChange = output<string>();
  readonly callStackLabPresetChange = output<string>();
  readonly callTreeLabPresetChange = output<string>();
}
