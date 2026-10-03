import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { MatrixGridTraceState } from '../../models/matrix-grid';
import { SortStep } from '../../models/sort-step';
import { PlaybackController } from '../../workbench/playback-controller';
import {
  buildMatrixGridTable,
  buildOperationHistory,
  buildSolutionRows,
  MatrixGridHistoryEntry,
  MatrixGridSolutionRow,
  MatrixGridTableView,
} from './matrix-grid-display.utils';

@Component({
  selector: 'app-matrix-grid-visualization',
  imports: [OhnoRack, OhnoRackRow, TranslocoPipe],
  templateUrl: './matrix-grid-visualization.html',
  styleUrl: './matrix-grid-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixGridVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly playback = inject(PlaybackController, { optional: true });

  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;
  protected readonly GRID = I18N_KEY.features.algorithms.display.matrixGrid;

  readonly state = computed<MatrixGridTraceState | null>(() => this.step()?.matrixGrid ?? null);

  protected readonly table = computed<MatrixGridTableView | null>(() => {
    const state = this.state();
    return state ? buildMatrixGridTable(state) : null;
  });

  protected readonly trail = computed<readonly MatrixGridTraceState[]>(() => {
    const step = this.step();
    const state = step?.matrixGrid;
    if (!step || !state) return [];
    const history = this.playback?.history() ?? [];
    const index = history.indexOf(step);
    if (index < 0) return [state];
    return history
      .slice(0, index + 1)
      .map((entry) => entry.matrixGrid)
      .filter((entry): entry is MatrixGridTraceState => entry !== undefined);
  });

  protected readonly history = computed<readonly MatrixGridHistoryEntry[]>(() => buildOperationHistory(this.trail()));

  protected readonly solution = computed<readonly MatrixGridSolutionRow[]>(() => {
    const state = this.state();
    return state ? buildSolutionRows(state) : [];
  });

  protected readonly isSimplex = computed(() => this.state()?.mode === 'simplex');
}
