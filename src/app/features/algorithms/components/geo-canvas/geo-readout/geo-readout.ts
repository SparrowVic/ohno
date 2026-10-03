import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { OhnoEngraving } from '../../../../../shared/instrument/engraving/engraving';
import { OhnoLed } from '../../../../../shared/instrument/led/led';
import { I18nTextPipe } from '../../../../../shared/pipes/i18n-text.pipe';
import { GeoReadoutView } from '../plane-display.utils';

@Component({
  selector: 'app-geo-readout',
  imports: [I18nTextPipe, OhnoEngraving, OhnoLed],
  templateUrl: './geo-readout.html',
  styleUrl: './geo-readout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoReadout {
  readonly view = input.required<GeoReadoutView>();
}
