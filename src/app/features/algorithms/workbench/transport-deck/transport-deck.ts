import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  faBackwardStep,
  faDice,
  faForwardStep,
  faPause,
  faPen,
  faPlay,
  faRotateLeft,
  faRotateRight,
} from '@fortawesome/pro-solid-svg-icons';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoFloatingPlate } from '../../../../shared/instrument/floating-plate/floating-plate';
import { OhnoGauge } from '../../../../shared/instrument/gauge/gauge';
import { OhnoKbd } from '../../../../shared/instrument/kbd/kbd';
import { OhnoKey } from '../../../../shared/instrument/key/key';
import { OhnoKnob } from '../../../../shared/instrument/knob/knob';
import { OhnoMenu } from '../../../../shared/instrument/menu/menu';
import { MenuItem } from '../../../../shared/instrument/menu/menu.types';
import { OhnoReadout } from '../../../../shared/instrument/readout/readout';
import { OhnoSlot } from '../../../../shared/instrument/slot/slot';
import { OhnoWindowStepper } from '../../../../shared/instrument/window-stepper/window-stepper';
import { PresetOption } from '../../models/preset-option';
import { TaskInputSchema } from '../../models/task';
import { OhnoCustomValuesForm } from '../custom-values-form/custom-values-form';
import { hasCustomFields, showSizeSection, TaskChoice } from '../utils/deck.utils';
import { PassGauge } from '../utils/stage-readout.utils';
import { PlaybackStatus, TransportAction } from '../utils/transport.utils';

const MIN_SPEED = 1;
const MAX_SPEED = 10;

@Component({
  selector: 'ohno-transport-deck',
  imports: [
    OhnoCustomValuesForm,
    OhnoEngraving,
    OhnoFloatingPlate,
    OhnoGauge,
    OhnoKbd,
    OhnoKey,
    OhnoKnob,
    OhnoMenu,
    OhnoReadout,
    OhnoSlot,
    OhnoWindowStepper,
    TranslocoPipe,
  ],
  templateUrl: './transport-deck.html',
  styleUrl: './transport-deck.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoTransportDeck {
  readonly status = input.required<PlaybackStatus>();
  readonly transportAction = input.required<TransportAction>();
  readonly stepIndex = input.required<number>();
  readonly lastIndex = input.required<number>();
  readonly speed = input.required<number>();
  readonly gauge = input<PassGauge | null>(null);
  readonly gaugeLabel = input('');
  readonly sizeOptions = input<readonly number[]>([]);
  readonly size = input.required<number>();
  readonly sizeUnit = input('');
  readonly tasks = input<readonly TaskChoice[]>([]);
  readonly activeTaskId = input<string | null>(null);
  readonly randomizeLabel = input.required<string>();
  readonly presetOptions = input<readonly PresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly customSchema = input<TaskInputSchema<Record<string, unknown>> | null>(null);
  readonly customValues = input<Record<string, unknown>>({});
  readonly customValidate = input<((values: Record<string, unknown>) => TranslatableText | null) | null>(null);

  readonly reset = output<void>();
  readonly stepBack = output<void>();
  readonly toggle = output<void>();
  readonly stepForward = output<void>();
  readonly seek = output<number>();
  readonly speedChange = output<number>();
  readonly sizeChange = output<number>();
  readonly randomize = output<void>();
  readonly taskChange = output<string>();
  readonly customValuesChange = output<Record<string, unknown>>();
  readonly presetChange = output<string>();

  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly minSpeed = MIN_SPEED;
  protected readonly maxSpeed = MAX_SPEED;
  protected readonly icons = {
    reset: faRotateLeft,
    back: faBackwardStep,
    play: faPlay,
    pause: faPause,
    restart: faRotateRight,
    forward: faForwardStep,
    random: faDice,
    custom: faPen,
  };
  protected readonly taskMenuOpen = signal(false);
  protected readonly customOpen = signal(false);
  protected readonly presetMenuOpen = signal(false);

  protected readonly playIcon = computed(() => {
    const action = this.transportAction();
    return action === 'pause' ? this.icons.pause : action === 'restart' ? this.icons.restart : this.icons.play;
  });
  protected readonly playLabel = computed(() => {
    this.language.activeLang();
    const deck = I18N_KEY.features.algorithms.workbench.deck;
    return this.transloco.translate(this.transportAction() === 'pause' ? deck.pause : deck.start);
  });
  protected readonly playAriaLabel = computed(() => {
    this.language.activeLang();
    const deck = I18N_KEY.features.algorithms.workbench.deck;
    const action = this.transportAction();
    return this.transloco.translate(
      action === 'pause' ? deck.pauseAriaLabel : action === 'restart' ? deck.restartAriaLabel : deck.playAriaLabel,
    );
  });
  protected readonly showSize = computed(() => showSizeSection(this.sizeOptions(), this.tasks()));
  protected readonly hasTasks = computed(() => this.tasks().length > 0);
  protected readonly activeTaskLabel = computed(
    () => this.tasks().find((task) => task.id === this.activeTaskId())?.label ?? '',
  );
  protected readonly taskItems = computed<readonly MenuItem[]>(() =>
    this.tasks().map((task) => ({ id: task.id, label: task.label })),
  );
  protected readonly hasCustom = computed(() => hasCustomFields(this.customSchema()));
  protected readonly hasPresets = computed(() => this.presetOptions().length > 1);
  protected readonly activePresetLabel = computed(() => {
    this.language.activeLang();
    const option = this.presetOptions().find((item) => item.id === this.presetId()) ?? this.presetOptions()[0];
    return option ? this.translatePreset(option.label) : '';
  });
  protected readonly presetItems = computed<readonly MenuItem[]>(() => {
    this.language.activeLang();
    return this.presetOptions().map((option) => ({ id: option.id, label: this.translatePreset(option.label) }));
  });
  protected readonly canStepBack = computed(() => this.stepIndex() > 0);
  protected readonly canStepForward = computed(() => this.stepIndex() < this.lastIndex());
  protected readonly tempoReadout = computed(() => `${this.speed()}×`);

  protected pickTask(id: string): void {
    this.taskMenuOpen.set(false);
    if (id !== this.activeTaskId()) this.taskChange.emit(id);
  }

  protected pickPreset(id: string): void {
    this.presetMenuOpen.set(false);
    if (id !== this.presetId()) this.presetChange.emit(id);
  }

  private translatePreset(label: string): string {
    return looksLikeI18nKey(label) ? this.transloco.translate(label) : label;
  }

  protected applyCustomValues(values: Record<string, unknown>): void {
    this.customOpen.set(false);
    this.customValuesChange.emit(values);
  }
}
