import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { WeightedGraphData } from '../../models/graph';
import { SortStep } from '../../models/sort-step';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { BarChartVisualization } from '../bar-chart-visualization/bar-chart-visualization';
import { BlockSwapVisualization } from '../block-swap-visualization/block-swap-visualization';
import { ColorGradientVisualization } from '../color-gradient-visualization/color-gradient-visualization';
import { DijkstraGraphVisualization } from '../dijkstra-graph-visualization/dijkstra-graph-visualization';
import { DotPlotVisualization } from '../dot-plot-visualization/dot-plot-visualization';
import { RadixBucketVisualization } from '../radix-bucket-visualization/radix-bucket-visualization';
import { RadixMatrixVisualization } from '../radix-matrix-visualization/radix-matrix-visualization';
import { RadixStripVisualization } from '../radix-strip-visualization/radix-strip-visualization';
import { RadialVisualization } from '../radial-visualization/radial-visualization';
import { SearchVisualization } from '../search-visualization/search-visualization';
import { SoundBarsVisualization } from '../sound-bars-visualization/sound-bars-visualization';

@Component({
  selector: 'app-visualization-canvas',
  imports: [
    BarChartVisualization,
    BlockSwapVisualization,
    ColorGradientVisualization,
    DijkstraGraphVisualization,
    DotPlotVisualization,
    RadixBucketVisualization,
    RadixMatrixVisualization,
    RadixStripVisualization,
    RadialVisualization,
    SearchVisualization,
    SoundBarsVisualization,
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
  readonly muted = input<boolean>(true);
}
