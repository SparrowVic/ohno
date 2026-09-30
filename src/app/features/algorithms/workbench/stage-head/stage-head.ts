import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { faEllipsis } from '@fortawesome/pro-solid-svg-icons';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { CommandPaletteService } from '../../../../core/layout/command-palette/command-palette.service';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoFloatingPlate } from '../../../../shared/instrument/floating-plate/floating-plate';
import { OhnoKey } from '../../../../shared/instrument/key/key';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { OhnoMenu } from '../../../../shared/instrument/menu/menu';
import { MenuItem } from '../../../../shared/instrument/menu/menu.types';
import { OhnoReadout } from '../../../../shared/instrument/readout/readout';
import { Difficulty } from '../../models/algorithm';
import { VisualizationOption } from '../../models/visualization-option';
import { VisualizationVariant } from '../../models/visualization-renderer';

const DIFFICULTY_LED: Readonly<Record<Difficulty, LedColor>> = {
  [Difficulty.Easy]: 'easy',
  [Difficulty.Medium]: 'amber',
  [Difficulty.Hard]: 'signal',
  [Difficulty.UltraHard]: 'red',
};

const LONG_TITLE_LENGTH = 14;
const COPIED_FLASH_MS = 1400;
const OPTION_SHORTCUTS = 'shortcuts';
const OPTION_COPY_LINK = 'copy-link';

@Component({
  selector: 'ohno-stage-head',
  imports: [OhnoEngraving, OhnoFloatingPlate, OhnoKey, OhnoLed, OhnoMenu, OhnoReadout, TranslocoPipe],
  templateUrl: './stage-head.html',
  styleUrl: './stage-head.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoStageHead {
  readonly name = input.required<string>();
  readonly difficulty = input.required<Difficulty>();
  readonly difficultyLabel = input.required<string>();
  readonly time = input.required<string>();
  readonly space = input.required<string>();
  readonly views = input.required<readonly VisualizationOption[]>();
  readonly activeView = input.required<VisualizationVariant>();
  readonly viewChange = output<VisualizationVariant>();

  private readonly document = inject(DOCUMENT);
  private readonly palette = inject(CommandPaletteService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);
  private copiedTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { options: faEllipsis };
  protected readonly menuOpen = signal(false);
  protected readonly copied = signal(false);

  protected readonly difficultyLed = computed(() => DIFFICULTY_LED[this.difficulty()]);
  protected readonly longTitle = computed(() => this.name().length > LONG_TITLE_LENGTH);
  protected readonly sameComplexity = computed(() => this.time() === this.space());
  protected readonly optionItems = computed<readonly MenuItem[]>(() => [
    { id: OPTION_SHORTCUTS, label: this.translate(I18N_KEY.features.algorithms.workbench.head.shortcuts) },
    { id: OPTION_COPY_LINK, label: this.translate(I18N_KEY.features.algorithms.workbench.head.copyLink) },
  ]);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearCopiedTimer());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected pickOption(id: string): void {
    this.closeMenu();
    if (id === OPTION_SHORTCUTS) this.palette.openShortcuts();
    if (id === OPTION_COPY_LINK) void this.copyLink();
  }

  private async copyLink(): Promise<void> {
    const url = this.document.location.href;
    const clipboard = this.document.defaultView?.navigator.clipboard;
    if (!clipboard) return;
    try {
      await clipboard.writeText(url);
    } catch {
      return;
    }
    this.copied.set(true);
    this.clearCopiedTimer();
    this.copiedTimer = setTimeout(() => this.copied.set(false), COPIED_FLASH_MS);
  }

  private clearCopiedTimer(): void {
    if (this.copiedTimer !== null) clearTimeout(this.copiedTimer);
    this.copiedTimer = null;
  }

  private translate(key: string): string {
    this.language.activeLang();
    return this.transloco.translate(key);
  }
}
