import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { MatrixGridTraceState } from '../../models/matrix-grid';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

/**
 * Lightweight matrix-grid renderer used by row-pivoting algorithms
 * (Gaussian Elimination today, Simplex tomorrow). The trace state
 * carries a flat list of cells with state-based tints; this component
 * only picks the layout (CSS grid) and pulls the operation label /
 * result string into the header.
 */
@Component({
  selector: 'app-matrix-grid-visualization',
  imports: [I18nTextPipe, MathText, VizHeader, VizPanel],
  templateUrl: './matrix-grid-visualization.html',
  styleUrl: './matrix-grid-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixGridVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly state = computed<MatrixGridTraceState | null>(() => this.step()?.matrixGrid ?? null);

  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return state.operationLabel ?? state.decisionLabel ?? state.phaseLabel ?? '';
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const tone = this.state()?.tone ?? 'idle';
    switch (tone) {
      case 'pivot':
        return 'compare';
      case 'eliminate':
        return 'swap';
      case 'compute':
        return 'compare';
      case 'complete':
        return 'complete';
      case 'fail':
        return 'swap';
      default:
        return 'default';
    }
  });

  /** CSS grid template — N+1 columns when there's an augmented divider
   *  (N coefficients + 1 RHS), with a fractional gap repointed to the
   *  divider position. */
  readonly gridTemplate = computed(() => {
    const state = this.state();
    if (!state) return '';
    const cols = state.cols;
    const divider = state.dividerCol;
    if (divider === null) {
      return `repeat(${cols}, minmax(48px, 1fr))`;
    }
    // dividerCol is the index of the first column AFTER the divider
    // (e.g. for 3-vars + RHS: dividerCol = 3, cells 0..2 are coeffs,
    // cell 3 is RHS).
    return `repeat(${divider}, minmax(48px, 1fr)) 6px minmax(48px, 1fr)`;
  });

  /** Pixel offset to insert a divider gap. We render the divider as a
   *  separate grid track of 6px (above) so it sits between coeffs and
   *  RHS without disrupting cell sizing. */
  readonly cellGridColumn = (col: number): string => {
    const state = this.state();
    if (!state || state.dividerCol === null) return String(col + 1);
    if (col < state.dividerCol) return String(col + 1);
    // Skip the divider track (which uses grid-column = dividerCol + 1).
    return String(col + 2);
  };

  readonly hasDivider = computed(() => this.state()?.dividerCol !== null);
}
