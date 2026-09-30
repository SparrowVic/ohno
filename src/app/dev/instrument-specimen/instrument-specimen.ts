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
import { OhnoFloatingPlate } from '../../shared/instrument/floating-plate/floating-plate';
import { OhnoGauge } from '../../shared/instrument/gauge/gauge';
import { OhnoKbd } from '../../shared/instrument/kbd/kbd';
import { OhnoKey } from '../../shared/instrument/key/key';
import { OhnoKnob } from '../../shared/instrument/knob/knob';
import { OhnoLangToggle } from '../../shared/instrument/lang-toggle/lang-toggle';
import { OhnoLatch } from '../../shared/instrument/latch/latch';
import { OhnoLed } from '../../shared/instrument/led/led';
import { OhnoMenu } from '../../shared/instrument/menu/menu';
import { MenuItem } from '../../shared/instrument/menu/menu.types';
import { OhnoMeter } from '../../shared/instrument/meter/meter';
import { OhnoOpLine } from '../../shared/instrument/opline/opline';
import { LedColor } from '../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../shared/instrument/plate/plate';
import { OhnoRack } from '../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../shared/instrument/rack/rack-row/rack-row';
import { OhnoReadout } from '../../shared/instrument/readout/readout';
import { OhnoScreen } from '../../shared/instrument/screen/screen';
import { OhnoSearchField } from '../../shared/instrument/search-field/search-field';
import { OhnoSlot } from '../../shared/instrument/slot/slot';
import { OhnoTape } from '../../shared/instrument/tape/tape';
import { TapeRow } from '../../shared/instrument/tape/tape.types';
import { OhnoWindowStepper } from '../../shared/instrument/window-stepper/window-stepper';

// Dev-only specimen sheet: literal Polish labels are intentional, it never ships.
@Component({
  selector: 'app-instrument-specimen',
  imports: [OhnoPlate, OhnoScreen, OhnoEngraving, OhnoLed, OhnoKbd, OhnoReadout, OhnoMeter, OhnoKey, OhnoLatch, OhnoKnob, OhnoSlot, OhnoGauge, OhnoWindowStepper, OhnoOpLine, OhnoRack, OhnoRackRow, OhnoTape, OhnoFloatingPlate, OhnoMenu, OhnoSearchField, OhnoLangToggle],
  templateUrl: './instrument-specimen.html',
  styleUrl: './instrument-specimen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentSpecimen {
  protected readonly ledColors: readonly LedColor[] = [
    'signal', 'cyan', 'pink', 'lime', 'amber', 'red', 'violet', 'slate', 'easy',
  ];

  protected readonly speed = signal(5);
  protected readonly size = signal(16);
  protected readonly step = signal(66);
  protected readonly menuOpen = signal(false);
  protected readonly language = signal('pl');
  protected readonly codeLanguage = signal('ts');
  protected readonly languageItems: readonly MenuItem[] = [
    { id: 'ts', label: 'TypeScript' },
    { id: 'py', label: 'Python' },
    { id: 'rs', label: 'Rust', disabled: true },
  ];

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

  protected readonly tapeRows: readonly TapeRow[] = [
    { step: 56, kind: 'separator', tone: 'slate', event: '── PRZEBIEG 2 ZAKOŃCZONY ──', detail: '' },
    { step: 57, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '56[0] : 13[1]' },
    { step: 58, kind: 'event', tone: 'pink', event: 'ZAMIEŃ', detail: '56[0] ↔ 13[1]' },
    { step: 59, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '56[1] : 74[2]' },
    { step: 60, kind: 'event', tone: 'lime', event: 'USTAL', detail: '99[15]' },
  ];
}
