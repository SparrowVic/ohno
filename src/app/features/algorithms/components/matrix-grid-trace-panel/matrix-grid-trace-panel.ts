import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { MatrixGridCellState, MatrixGridTraceState } from '../../models/matrix-grid';

const ROW_TONES: Readonly<Partial<Record<MatrixGridCellState, RackRowTone>>> = {
  pivot: 'head',
  'pivot-row': 'now',
  eliminating: 'now',
  updated: 'done',
  leading: 'done',
};

interface MatrixGridRowView {
  readonly index: number;
  readonly label: string;
  readonly values: string;
  readonly tone: RackRowTone;
}

@Component({
  selector: 'app-matrix-grid-trace-panel',
  imports: [I18nTextPipe, MathText, OhnoEngraving, OhnoRack, OhnoRackRow, TranslocoPipe],
  templateUrl: './matrix-grid-trace-panel.html',
  styleUrl: './matrix-grid-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixGridTracePanel {
  readonly state = input<MatrixGridTraceState | null>(null);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly pivotLabel = computed(() => {
    const pivot = this.state()?.cells.find((cell) => cell.state === 'pivot');
    return pivot ? `${pivot.row + 1} : ${pivot.col + 1}` : null;
  });
  protected readonly sizeLabel = computed(() => {
    const state = this.state();
    return state ? `${state.rows} × ${state.cols}` : '';
  });
  protected readonly rows = computed<readonly MatrixGridRowView[]>(() => {
    const state = this.state();
    if (!state) return [];
    return Array.from({ length: state.rows }, (_, row) => {
      const cells = state.cells.filter((cell) => cell.row === row).sort((a, b) => a.col - b.col);
      const strongest = cells.map((cell) => ROW_TONES[cell.state]).find((tone) => tone === 'head') ??
        cells.map((cell) => ROW_TONES[cell.state]).find((tone) => tone === 'now') ??
        cells.map((cell) => ROW_TONES[cell.state]).find((tone) => tone === 'done') ??
        'default';
      return {
        index: row,
        label: `R${row + 1}`,
        values: cells
          .map((cell, col) => (state.dividerCol !== null && col === state.dividerCol ? `| ${cell.value}` : cell.value))
          .join('  '),
        tone: strongest,
      };
    });
  });
}
