import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { CodeLanguage } from '../../../../features/algorithms/models/detail';
import { CodeLanguageDialItem as CodeLanguageDialItemModel } from '../code-language-dial.types';

@Component({
  selector: 'app-code-language-dial-item',
  imports: [FaIconComponent, TranslocoPipe],
  templateUrl: './code-language-dial-item.html',
  styleUrl: './code-language-dial-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeLanguageDialItem {
  protected readonly I18N_KEY = I18N_KEY;
  readonly item = input.required<CodeLanguageDialItemModel>();
  readonly open = input.required<boolean>();
  readonly selected = output<CodeLanguage>();

  select(): void {
    const item = this.item();
    if (item.disabled || !item.language) {
      return;
    }

    this.selected.emit(item.language);
  }
}
