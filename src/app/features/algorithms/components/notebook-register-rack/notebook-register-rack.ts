import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MathText } from '../../../../shared/components/math-text/math-text';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { NotebookRegisterView } from './notebook-registers.utils';

@Component({
  selector: 'app-notebook-register-rack',
  imports: [I18nTextPipe, MathText, OhnoRack],
  templateUrl: './notebook-register-rack.html',
  styleUrl: './notebook-register-rack.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotebookRegisterRack {
  readonly title = input.required<string>();
  readonly registers = input.required<readonly NotebookRegisterView[]>();
}
