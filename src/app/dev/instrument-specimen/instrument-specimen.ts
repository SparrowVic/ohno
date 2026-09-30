import { ChangeDetectionStrategy, Component } from '@angular/core';

import { OhnoEngraving } from '../../shared/instrument/engraving/engraving';
import { OhnoKbd } from '../../shared/instrument/kbd/kbd';
import { OhnoLed } from '../../shared/instrument/led/led';
import { OhnoMeter } from '../../shared/instrument/meter/meter';
import { LedColor } from '../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../shared/instrument/plate/plate';
import { OhnoReadout } from '../../shared/instrument/readout/readout';
import { OhnoScreen } from '../../shared/instrument/screen/screen';

// Dev-only specimen sheet: literal Polish labels are intentional, it never ships.
@Component({
  selector: 'app-instrument-specimen',
  imports: [OhnoPlate, OhnoScreen, OhnoEngraving, OhnoLed, OhnoKbd, OhnoReadout, OhnoMeter],
  templateUrl: './instrument-specimen.html',
  styleUrl: './instrument-specimen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentSpecimen {
  protected readonly ledColors: readonly LedColor[] = [
    'signal', 'cyan', 'pink', 'lime', 'amber', 'red', 'violet', 'slate', 'easy',
  ];
}
