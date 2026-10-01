import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AlgorithmRegistry } from '../../../features/algorithms/registry/algorithm-registry/algorithm-registry';
import { OhnoBrand } from '../../../shared/instrument/brand/brand';
import { OhnoEngraving } from '../../../shared/instrument/engraving/engraving';
import { OhnoKbd } from '../../../shared/instrument/kbd/kbd';
import { LangToggleOption, OhnoLangToggle } from '../../../shared/instrument/lang-toggle/lang-toggle';
import { OhnoLed } from '../../../shared/instrument/led/led';
import { OhnoPlate } from '../../../shared/instrument/plate/plate';
import { OhnoReadout } from '../../../shared/instrument/readout/readout';
import { AppLang, isAppLang } from '../../i18n/app-lang';
import { AppLanguageService } from '../../i18n/app-language.service';
import { I18N_KEY } from '../../i18n/i18n-keys';
import { RecentAlgorithmsStore } from '../../recent/recent-algorithms-store';
import { NavigationService } from '../../services/navigation-service';
import { CommandPaletteService } from '../command-palette/command-palette.service';
import { BankRow, buildBankRows } from './bank-rows.utils';

interface RecentRow {
  readonly id: string;
  readonly name: string;
  readonly step: number;
  readonly total: number;
  readonly percent: number;
  readonly finished: boolean;
}

@Component({
  selector: 'ohno-bank-sidebar',
  imports: [OhnoBrand, OhnoEngraving, OhnoKbd, OhnoLangToggle, OhnoLed, OhnoPlate, OhnoReadout, RouterLink, TranslocoPipe],
  templateUrl: './bank-sidebar.html',
  styleUrl: './bank-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoBankSidebar {
  private readonly navigation = inject(NavigationService);
  private readonly registry = inject(AlgorithmRegistry);
  private readonly recent = inject(RecentAlgorithmsStore);
  private readonly palette = inject(CommandPaletteService);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly activeLang = this.language.activeLang;
  protected readonly langOptions: readonly LangToggleOption[] = this.language.options.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  protected readonly rows = computed<readonly BankRow[]>(() => {
    this.language.activeLang();
    return buildBankRows(
      this.navigation.sidebarGroups(),
      this.navigation.activeGroupId(),
      this.transloco.translate(I18N_KEY.core.instrument.bank.all),
    );
  });

  protected readonly recentRows = computed<readonly RecentRow[]>(() =>
    this.recent.entries().flatMap((entry) => {
      const item = this.registry.getById(entry.id);
      if (!item) return [];
      const percent = entry.total > 0 ? Math.round((entry.step / entry.total) * 100) : 0;
      return [{ id: entry.id, name: item.name, step: entry.step, total: entry.total, percent, finished: entry.finished }];
    }),
  );

  protected select(row: BankRow): void {
    this.navigation.setActiveItem(row.groupId, row.itemId);
  }

  protected openShortcuts(): void {
    this.palette.openShortcuts();
  }

  protected setLang(value: string): void {
    if (isAppLang(value)) this.language.setActiveLang(value as AppLang);
  }
}
