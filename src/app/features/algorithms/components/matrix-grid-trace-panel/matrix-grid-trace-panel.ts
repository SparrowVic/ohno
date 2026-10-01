import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { MatrixGridTraceState } from '../../models/matrix-grid';
import { PlaybackController } from '../../workbench/playback-controller';
import {
  buildMatrixGridFacts,
  buildMatrixGridTable,
  buildOperationHistory,
  buildSolutionRows,
  MatrixGridFacts,
  MatrixGridHistoryEntry,
  MatrixGridSolutionRow,
  MatrixGridTableView,
} from '../matrix-grid-visualization/matrix-grid-display.utils';

@Component({
  selector: 'app-matrix-grid-trace-panel',
  imports: [I18nTextPipe, OhnoEngraving, OhnoRack, OhnoRackRow, TranslocoPipe],
  templateUrl: './matrix-grid-trace-panel.html',
  styleUrl: './matrix-grid-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixGridTracePanel {
  readonly state = input<MatrixGridTraceState | null>(null);

  private readonly playback = inject(PlaybackController, { optional: true });

  protected readonly PANEL = I18N_KEY.features.algorithms.tracePanels.matrixGrid;
  protected readonly COMMON = I18N_KEY.features.algorithms.tracePanels.common;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly GRID = I18N_KEY.features.algorithms.display.matrixGrid;

  protected readonly table = computed<MatrixGridTableView | null>(() => {
    const state = this.state();
    return state ? buildMatrixGridTable(state) : null;
  });

  protected readonly facts = computed<MatrixGridFacts | null>(() => {
    const state = this.state();
    const table = this.table();
    return state && table ? buildMatrixGridFacts(state, table) : null;
  });

  protected readonly history = computed<readonly MatrixGridHistoryEntry[]>(() => {
    const state = this.state();
    if (!state) return [];
    const steps = this.playback?.history() ?? [];
    const index = steps.findIndex((step) => step.matrixGrid === state);
    const trail =
      index < 0
        ? [state]
        : steps
            .slice(0, index + 1)
            .map((step) => step.matrixGrid)
            .filter((entry): entry is MatrixGridTraceState => entry !== undefined);
    return buildOperationHistory(trail);
  });

  protected readonly solution = computed<readonly MatrixGridSolutionRow[]>(() => {
    const state = this.state();
    return state ? buildSolutionRows(state) : [];
  });

  protected readonly operation = computed<string | null>(() => {
    const head = this.history()[0];
    return this.facts()?.operation ?? (head?.tone === 'head' && head.kind === 'operation' ? head.text : null);
  });

  protected readonly isSimplex = computed(() => this.state()?.mode === 'simplex');
}
