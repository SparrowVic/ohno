import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  faBackwardStep,
  faChevronLeft,
  faCopy,
  faForwardStep,
  faPlay,
  faRotateLeft,
} from '@fortawesome/pro-solid-svg-icons';

import { OhnoEngraving } from '../../shared/instrument/engraving/engraving';
import { OhnoKbd } from '../../shared/instrument/kbd/kbd';
import { OhnoKey } from '../../shared/instrument/key/key';
import { OhnoKnob } from '../../shared/instrument/knob/knob';
import { OhnoLatch } from '../../shared/instrument/latch/latch';
import { OhnoLed } from '../../shared/instrument/led/led';
import { OhnoMeter } from '../../shared/instrument/meter/meter';
import { LedColor } from '../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../shared/instrument/plate/plate';
import { OhnoReadout } from '../../shared/instrument/readout/readout';
import { OhnoScreen } from '../../shared/instrument/screen/screen';

// Dev-only specimen sheet: literal Polish labels are intentional, it never ships.
@Component({
  selector: 'app-instrument-specimen',
  imports: [OhnoPlate, OhnoScreen, OhnoEngraving, OhnoLed, OhnoKbd, OhnoReadout, OhnoMeter, OhnoKey, OhnoLatch, OhnoKnob],
  templateUrl: './instrument-specimen.html',
  styleUrl: './instrument-specimen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentSpecimen {
  protected readonly ledColors: readonly LedColor[] = [
    'signal', 'cyan', 'pink', 'lime', 'amber', 'red', 'violet', 'slate', 'easy',
  ];

  protected readonly speed = signal(5);

  protected readonly icons = {
    back: faChevronLeft,
    copy: faCopy,
    reset: faRotateLeft,
    previous: faBackwardStep,
    play: faPlay,
    next: faForwardStep,
  };
  protected readonly difficulties = signal<readonly { id: string; label: string; led: LedColor; on: boolean }[]>([
    { id: 'easy', label: 'Łatwe', led: 'easy', on: true },
    { id: 'medium', label: 'Średnie', led: 'amber', on: true },
    { id: 'hard', label: 'Trudne', led: 'signal', on: true },
    { id: 'ultra', label: 'Ekstremalne', led: 'red', on: false },
  ]);

  protected toggleDifficulty(id: string, on: boolean): void {
    this.difficulties.update((items) => items.map((item) => (item.id === id ? { ...item, on } : item)));
  }
}
