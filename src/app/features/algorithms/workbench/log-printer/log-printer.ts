import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { faDownload, faFilter } from '@fortawesome/pro-solid-svg-icons';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoFloatingPlate } from '../../../../shared/instrument/floating-plate/floating-plate';
import { OhnoKey } from '../../../../shared/instrument/key/key';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoMenu } from '../../../../shared/instrument/menu/menu';
import { MenuItem } from '../../../../shared/instrument/menu/menu.types';
import { OhnoReadout } from '../../../../shared/instrument/readout/readout';
import { OhnoTape } from '../../../../shared/instrument/tape/tape';
import { TapeRow } from '../../../../shared/instrument/tape/tape.types';
import { downloadText } from '../utils/download-text.utils';
import { formatTapeText, TAPE_FILTERS, TapeFilter } from '../utils/tape-rows.utils';

const FILTER_KEYS: Readonly<Record<TapeFilter, string>> = {
  all: I18N_KEY.features.algorithms.workbench.log.filters.all,
  compare: I18N_KEY.features.algorithms.workbench.log.filters.compare,
  swap: I18N_KEY.features.algorithms.workbench.log.filters.swap,
  pass: I18N_KEY.features.algorithms.workbench.log.filters.pass,
};

@Component({
  selector: 'ohno-log-printer',
  imports: [OhnoEngraving, OhnoFloatingPlate, OhnoKey, OhnoLed, OhnoMenu, OhnoReadout, OhnoTape, TranslocoPipe],
  templateUrl: './log-printer.html',
  styleUrl: './log-printer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoLogPrinter {
  readonly rows = input.required<readonly TapeRow[]>();
  readonly live = input(false);
  readonly filter = input<TapeFilter>('all');
  readonly algorithmId = input.required<string>();
  readonly filterChange = output<TapeFilter>();

  private readonly document = inject(DOCUMENT);
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  protected readonly icons = { download: faDownload, filter: faFilter };
  protected readonly filterMenuOpen = signal(false);
  protected readonly rowCount = computed(() => this.rows().length);
  protected readonly filterItems = computed<readonly MenuItem[]>(() => {
    this.language.activeLang();
    return TAPE_FILTERS.map((id) => ({ id, label: this.transloco.translate(FILTER_KEYS[id]) }));
  });

  protected pickFilter(id: string): void {
    this.filterMenuOpen.set(false);
    const filter = TAPE_FILTERS.find((candidate) => candidate === id);
    if (filter && filter !== this.filter()) this.filterChange.emit(filter);
  }

  protected exportLog(): void {
    const log = I18N_KEY.features.algorithms.workbench.log;
    const text = formatTapeText(
      this.rows(),
      this.transloco.translate(log.stepHeader),
      this.transloco.translate(log.eventHeader),
    );
    downloadText(this.document, `${this.algorithmId()}-log.txt`, text);
  }
}
