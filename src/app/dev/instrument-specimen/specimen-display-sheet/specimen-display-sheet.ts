import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../shared/instrument/led/led';
import { OhnoRack } from '../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../shared/instrument/rack/rack-row/rack-row';

const NOTES = I18N_KEY.features.algorithms.display.notes;

@Component({
  selector: 'app-specimen-display-sheet',
  imports: [OhnoLed, OhnoRack, OhnoRackRow, TranslocoPipe],
  templateUrl: './specimen-display-sheet.html',
  styleUrl: './specimen-display-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenDisplaySheet {
  protected readonly cells = [
    { value: '0', tone: 'idle', tag: null, mark: null },
    { value: '6', tone: 'slate', tag: null, mark: null },
    { value: '6', tone: 'pink', tag: NOTES.take, mark: null },
    { value: '9', tone: 'pink', tag: NOTES.skip, mark: null },
    { value: '13', tone: 'cyan', tag: null, mark: '?' },
    { value: '10', tone: 'lime', tag: null, mark: null },
    { value: '·', tone: 'dim', tag: null, mark: null },
  ];
  protected readonly tape = [
    { char: 'A', index: 10, tone: 'lime' },
    { char: 'B', index: 11, tone: 'lime' },
    { char: 'C', index: 12, tone: 'cyan' },
    { char: 'A', index: 13, tone: 'slate' },
    { char: 'B', index: 14, tone: 'dim' },
    { char: 'D', index: 15, tone: 'pink' },
  ];
  protected readonly planeTicks = [0, 20, 40, 60, 80, 100];
  protected readonly planeRows = [0, 20, 40, 60];
}
