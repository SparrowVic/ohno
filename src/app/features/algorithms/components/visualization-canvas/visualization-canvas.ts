import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SortStep } from '../../models/sort-step';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { BarChartVisualization } from '../bar-chart-visualization/bar-chart-visualization';
import { BlockSwapVisualization } from '../block-swap-visualization/block-swap-visualization';
import { ColorGradientVisualization } from '../color-gradient-visualization/color-gradient-visualization';
import { DotPlotVisualization } from '../dot-plot-visualization/dot-plot-visualization';
import { RadialVisualization } from '../radial-visualization/radial-visualization';
import { SoundBarsVisualization } from '../sound-bars-visualization/sound-bars-visualization';

@Component({
  selector: 'app-visualization-canvas',
  imports: [
    BarChartVisualization,
    BlockSwapVisualization,
    ColorGradientVisualization,
    DotPlotVisualization,
    RadialVisualization,
    SoundBarsVisualization,
  ],
  templateUrl: './visualization-canvas.html',
  styleUrl: './visualization-canvas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationCanvas {
  readonly variant = input.required<VisualizationVariant>();
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly muted = input<boolean>(true);
}
