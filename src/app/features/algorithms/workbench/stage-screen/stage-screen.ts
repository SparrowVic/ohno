import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { OhnoMeter } from '../../../../shared/instrument/meter/meter';
import { OhnoOpLine } from '../../../../shared/instrument/opline/opline';
import { OpLineRegister } from '../../../../shared/instrument/opline/opline.types';
import { OhnoScreen } from '../../../../shared/instrument/screen/screen';
import { SentencePart } from '../utils/sentence-markup.utils';
import { StageMeter } from '../utils/stage-readout.utils';
import { PlaybackStatus } from '../utils/transport.utils';

const STATUS_LEDS: Readonly<Record<PlaybackStatus, LedColor>> = {
  idle: 'slate',
  playing: 'signal',
  paused: 'amber',
  complete: 'lime',
};

const STATUS_KEYS: Readonly<Record<PlaybackStatus, string>> = {
  idle: I18N_KEY.features.algorithms.workbench.stage.status.idle,
  playing: I18N_KEY.features.algorithms.workbench.stage.status.playing,
  paused: I18N_KEY.features.algorithms.workbench.stage.status.paused,
  complete: I18N_KEY.features.algorithms.workbench.stage.status.complete,
};

@Component({
  selector: 'ohno-stage-screen',
  imports: [MathText, OhnoEngraving, OhnoLed, OhnoMeter, OhnoOpLine, OhnoScreen, TranslocoPipe],
  templateUrl: './stage-screen.html',
  styleUrl: './stage-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoStageScreen {
  readonly stepIndex = input.required<number>();
  readonly lastIndex = input.required<number>();
  readonly meters = input<readonly StageMeter[]>([]);
  readonly status = input.required<PlaybackStatus>();
  readonly speed = input.required<number>();
  readonly phaseLabel = input.required<string>();
  readonly tone = input<LedColor>('cyan');
  readonly sentence = input.required<readonly SentencePart[]>();
  readonly registers = input<readonly OpLineRegister[]>([]);
  readonly liveText = input('');

  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly statusLed = computed(() => STATUS_LEDS[this.status()]);
  protected readonly statusLabel = computed(() => {
    this.language.activeLang();
    const status = this.transloco.translate(STATUS_KEYS[this.status()]);
    const tempo = this.transloco.translate(I18N_KEY.features.algorithms.workbench.stage.tempo, { speed: this.speed() });
    return `${status} · ${tempo}`;
  });
}
