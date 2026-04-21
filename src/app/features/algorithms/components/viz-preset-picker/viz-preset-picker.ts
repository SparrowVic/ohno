import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';

/** Minimal shape shared by `DpPresetOption` and `StringPresetOption`.
 *  Kept local so consumers don't have to import each other's types
 *  just to use the picker. */
export interface VizPresetOption {
  readonly id: string;
  readonly label: string;
}

/**
 * Compact chip row for switching between scenario presets inside a
 * viz panel's header slot. Extracted from the DP and String vizes —
 * both had identical chip rows with the same styling and the same
 * "click → emit id unless already active" behavior.
 *
 *     <app-viz-preset-picker
 *       [options]="presetOptions()"
 *       [activeId]="presetId()"
 *       (selected)="presetChange.emit($event)"
 *     />
 *
 * The picker handles i18n key detection per-option (some algorithms
 * pass plain strings, others pass translocus keys) so consumers don't
 * have to pipe individual chips.
 */
@Component({
  selector: 'app-viz-preset-picker',
  imports: [TranslocoPipe],
  templateUrl: './viz-preset-picker.html',
  styleUrl: './viz-preset-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VizPresetPicker {
  protected readonly looksLikeI18nKey = looksLikeI18nKey;
  readonly options = input<readonly VizPresetOption[]>([]);
  readonly activeId = input<string | null>(null);
  readonly selected = output<string>();

  select(id: string): void {
    if (id === this.activeId()) return;
    this.selected.emit(id);
  }
}
