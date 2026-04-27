import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { CodeLanguage } from '../../../../features/algorithms/models/detail';
import { CodeLanguageDialItem } from '../code-language-dial-item/code-language-dial-item';
import {
  CodeLanguageDialItem as CodeLanguageDialItemModel,
  TriggerRect,
} from '../code-language-dial.types';

@Component({
  selector: 'app-code-language-dial-fan',
  imports: [CodeLanguageDialItem, FaIconComponent],
  templateUrl: './code-language-dial-fan.html',
  styleUrl: './code-language-dial-fan.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeLanguageDialFan {
  readonly open = input.required<boolean>();
  readonly pulse = input.required<boolean>();
  readonly rect = input.required<TriggerRect>();
  readonly activeOption = input.required<CodeLanguageDialItemModel>();
  readonly items = input.required<readonly CodeLanguageDialItemModel[]>();
  readonly selected = output<CodeLanguage>();

  private readonly fanRef = viewChild<ElementRef<HTMLDivElement>>('fan');

  element(): HTMLDivElement | null {
    return this.fanRef()?.nativeElement ?? null;
  }
}
