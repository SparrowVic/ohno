import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OhnoKbd } from '../../../../shared/instrument/kbd/kbd';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { LedColor } from '../../../../shared/instrument/led/led.types';

export interface LegendEntry {
  readonly label: string;
  readonly color: LedColor;
  readonly dim?: boolean;
}

export interface LegendHint {
  readonly keys: readonly string[];
  readonly label: string;
}

@Component({
  selector: 'ohno-legend-row',
  imports: [OhnoKbd, OhnoLed],
  templateUrl: './legend-row.html',
  styleUrl: './legend-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoLegendRow {
  readonly items = input.required<readonly LegendEntry[]>();
  readonly hints = input<readonly LegendHint[]>([]);
}
